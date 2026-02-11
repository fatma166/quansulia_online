/*
  # إنشاء نظام تسعير الطلبات

  ## الوصف
  يتيح هذا الترحيل للموظفين إدخال وتعديل تفاصيل أسعار الطلبات يدوياً.

  ## الجداول الجديدة
  - `application_pricing_items`: تخزين تفاصيل كل بند في السعر (بالغ/طفل/خدمة إضافية)
    - `id` (uuid, primary key)
    - `application_id` (uuid, foreign key -> applications)
    - `item_type` (text): نوع البند (adult/child/additional_service)
    - `description` (text): وصف البند (مثل: بالغ، طفل، خدمة إضافية)
    - `quantity` (integer): الكمية
    - `unit_price` (decimal): سعر الوحدة
    - `total_price` (decimal): السعر الإجمالي للبند
    - `order_index` (integer): ترتيب البند
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `created_by` (uuid, foreign key -> staff)
    - `updated_by` (uuid, foreign key -> staff)

  - `application_pricing_summary`: ملخص السعر الإجمالي للطلب
    - `id` (uuid, primary key)
    - `application_id` (uuid, foreign key -> applications, unique)
    - `subtotal` (decimal): المجموع الفرعي
    - `discount` (decimal): الخصم
    - `tax` (decimal): الضريبة
    - `total_amount` (decimal): المبلغ الإجمالي
    - `notes` (text): ملاحظات إضافية
    - `is_editable` (boolean): هل يمكن التعديل (false إذا تم الدفع)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `created_by` (uuid, foreign key -> staff)
    - `updated_by` (uuid, foreign key -> staff)

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - الموظفين يمكنهم القراءة والكتابة
  - المستخدمين يمكنهم القراءة فقط لطلباتهم
*/

-- إنشاء جدول بنود التسعير
CREATE TABLE IF NOT EXISTS application_pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('adult', 'child', 'additional_service', 'custom')),
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price decimal(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price decimal(10, 2) NOT NULL CHECK (total_price >= 0),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES staff(id),
  updated_by uuid REFERENCES staff(id)
);

-- إنشاء جدول ملخص التسعير
CREATE TABLE IF NOT EXISTS application_pricing_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  subtotal decimal(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount decimal(10, 2) DEFAULT 0 CHECK (discount >= 0),
  tax decimal(10, 2) DEFAULT 0 CHECK (tax >= 0),
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount >= 0),
  notes text,
  is_editable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES staff(id),
  updated_by uuid REFERENCES staff(id)
);

-- إضافة indexes للأداء
CREATE INDEX IF NOT EXISTS idx_pricing_items_application ON application_pricing_items(application_id);
CREATE INDEX IF NOT EXISTS idx_pricing_summary_application ON application_pricing_summary(application_id);

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pricing_items_updated_at ON application_pricing_items;
CREATE TRIGGER update_pricing_items_updated_at
  BEFORE UPDATE ON application_pricing_items
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_updated_at();

DROP TRIGGER IF EXISTS update_pricing_summary_updated_at ON application_pricing_summary;
CREATE TRIGGER update_pricing_summary_updated_at
  BEFORE UPDATE ON application_pricing_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_updated_at();

-- Function لمنع التعديل إذا تم الدفع
CREATE OR REPLACE FUNCTION check_pricing_editable()
RETURNS TRIGGER AS $$
DECLARE
  v_is_editable boolean;
BEGIN
  -- التحقق من حالة القابلية للتعديل
  SELECT COALESCE(is_editable, true) INTO v_is_editable
  FROM application_pricing_summary
  WHERE application_id = NEW.application_id;

  IF v_is_editable = false THEN
    RAISE EXCEPTION 'لا يمكن تعديل السعر بعد إتمام الدفع';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_pricing_items_editable ON application_pricing_items;
CREATE TRIGGER check_pricing_items_editable
  BEFORE INSERT OR UPDATE ON application_pricing_items
  FOR EACH ROW
  EXECUTE FUNCTION check_pricing_editable();

-- Function لتحديث is_editable عند تغيير حالة الطلب إلى "تم الدفع"
CREATE OR REPLACE FUNCTION lock_pricing_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تغيرت الحالة إلى "تم الدفع"، قفل التسعير
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE application_pricing_summary
    SET is_editable = false
    WHERE application_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lock_pricing_on_payment_trigger ON applications;
CREATE TRIGGER lock_pricing_on_payment_trigger
  AFTER UPDATE ON applications
  FOR EACH ROW
  WHEN (NEW.status = 'paid')
  EXECUTE FUNCTION lock_pricing_on_payment();

-- تفعيل RLS
ALTER TABLE application_pricing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_pricing_summary ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لـ application_pricing_items

-- الموظفين: القراءة والكتابة
CREATE POLICY "Staff can read all pricing items"
  ON application_pricing_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert pricing items"
  ON application_pricing_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update pricing items"
  ON application_pricing_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can delete pricing items"
  ON application_pricing_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- المستخدمين: القراءة فقط لطلباتهم (عبر رقم الهاتف)
CREATE POLICY "Users can read their own pricing items"
  ON application_pricing_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_pricing_items.application_id
      AND applications.applicant_phone IN (
        SELECT DISTINCT applicant_phone FROM applications WHERE reference_number IS NOT NULL
      )
    )
  );

-- سياسات الأمان لـ application_pricing_summary

-- الموظفين: القراءة والكتابة
CREATE POLICY "Staff can read all pricing summaries"
  ON application_pricing_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert pricing summaries"
  ON application_pricing_summary FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update pricing summaries"
  ON application_pricing_summary FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can delete pricing summaries"
  ON application_pricing_summary FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- المستخدمين: القراءة فقط لطلباتهم
CREATE POLICY "Users can read their own pricing summary"
  ON application_pricing_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_pricing_summary.application_id
      AND applications.applicant_phone IN (
        SELECT DISTINCT applicant_phone FROM applications WHERE reference_number IS NOT NULL
      )
    )
  );
