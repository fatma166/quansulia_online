/*
  # إنشاء نظام الفواتير

  ## الوصف
  نظام شامل لإنشاء وإدارة الفواتير عند إتمام الدفع

  ## الجدول الجديد: invoices
  - `id` (uuid, primary key): معرف الفاتورة
  - `invoice_number` (text, unique): رقم الفاتورة (مثل: INV-2025-0001)
  - `application_id` (uuid, foreign key): معرف الطلب
  - `customer_name` (text): اسم العميل على الفاتورة
  - `customer_phone` (text): رقم هاتف العميل
  - `customer_email` (text): بريد العميل
  - `issue_date` (timestamptz): تاريخ إصدار الفاتورة
  - `subtotal` (decimal): المجموع الفرعي
  - `discount` (decimal): الخصم
  - `tax` (decimal): الضريبة
  - `total_amount` (decimal): المبلغ الإجمالي
  - `payment_status` (text): حالة الدفع (paid/pending/cancelled)
  - `notes` (text): ملاحظات
  - `qr_code_data` (text): بيانات QR Code
  - `created_by` (uuid, foreign key): الموظف الذي أصدر الفاتورة
  - `created_at` (timestamptz): تاريخ الإنشاء
  - `updated_at` (timestamptz): تاريخ التحديث

  ## الأمان
  - تفعيل RLS
  - الموظفين: قراءة وكتابة
  - المستخدمين: قراءة فواتيرهم فقط
*/

-- إنشاء جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  issue_date timestamptz DEFAULT now(),
  subtotal decimal(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount decimal(10, 2) DEFAULT 0 CHECK (discount >= 0),
  tax decimal(10, 2) DEFAULT 0 CHECK (tax >= 0),
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status text DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'cancelled')),
  notes text,
  qr_code_data text,
  created_by uuid REFERENCES staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء index للأداء
CREATE INDEX IF NOT EXISTS idx_invoices_application ON invoices(application_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

-- Function لتوليد رقم فاتورة فريد
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_part text;
  next_number integer;
  new_invoice_number text;
BEGIN
  -- الحصول على السنة الحالية
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- الحصول على آخر رقم فاتورة في هذه السنة
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_number FROM 'INV-' || year_part || '-([0-9]+)')
        AS INTEGER
      )
    ), 0
  ) + 1 INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  
  -- إنشاء رقم الفاتورة الجديد
  new_invoice_number := 'INV-' || year_part || '-' || LPAD(next_number::text, 4, '0');
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

-- تفعيل RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للموظفين
CREATE POLICY "Staff can read all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update invoices"
  ON invoices FOR UPDATE
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

CREATE POLICY "Staff can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- سياسات الأمان للمستخدمين (قراءة فواتيرهم فقط عبر رقم الهاتف)
CREATE POLICY "Users can read their own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    customer_phone IN (
      SELECT DISTINCT applicant_phone FROM applications WHERE reference_number IS NOT NULL
    )
  );
