/*
  # نظام الحالات الموحد (Unified Statuses System)

  ## الغرض
  توحيد جميع حالات الطلبات في المشروع وإزالة التكرار

  ## الجداول الجديدة
  
  ### `application_statuses`
  جدول مركزي لجميع الحالات مع:
  - `status_key` (text, primary key) - مفتاح الحالة الفريد
  - `label_ar` (text) - النص بالعربية
  - `label_en` (text) - النص بالإنجليزية
  - `color` (text) - اللون للعرض (Tailwind classes)
  - `icon` (text) - اسم الأيقونة
  - `order_index` (integer) - ترتيب الحالة في السير
  - `category` (text) - تصنيف الحالة (submission, review, payment, appointment, processing, shipping, completion, rejection)
  - `description_ar` (text) - وصف تفصيلي بالعربية
  - `is_active` (boolean) - هل الحالة نشطة؟
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## الأمان
  - RLS مفعّل
  - الجميع يمكنهم القراءة
  - المسؤولون فقط يمكنهم التعديل
*/

-- إنشاء جدول الحالات الموحد
CREATE TABLE IF NOT EXISTS application_statuses (
  status_key text PRIMARY KEY,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  color text NOT NULL DEFAULT 'bg-gray-100 text-gray-800',
  icon text NOT NULL DEFAULT 'FileText',
  order_index integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'submission',
  description_ar text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إضافة الحالات الأساسية
INSERT INTO application_statuses (status_key, label_ar, label_en, color, icon, order_index, category, description_ar) VALUES
  ('submitted', 'تم التقديم', 'Submitted', 'bg-blue-100 text-blue-800', 'FileText', 1, 'submission', 'تم تقديم الطلب بنجاح وفي انتظار المراجعة'),
  ('in_review', 'قيد المراجعة', 'In Review', 'bg-yellow-100 text-yellow-800', 'Search', 2, 'review', 'الطلب قيد المراجعة من قبل الموظفين'),
  ('approved', 'تمت الموافقة', 'Approved', 'bg-green-100 text-green-800', 'CheckCircle', 3, 'review', 'تمت الموافقة على الطلب'),
  ('payment_pending', 'في انتظار الدفع', 'Payment Pending', 'bg-orange-100 text-orange-800', 'DollarSign', 4, 'payment', 'في انتظار إتمام عملية الدفع'),
  ('payment_completed', 'تم الدفع', 'Payment Completed', 'bg-green-100 text-green-800', 'CheckCircle', 5, 'payment', 'تم إتمام الدفع بنجاح'),
  ('appointment_required', 'يتطلب حجز موعد', 'Appointment Required', 'bg-purple-100 text-purple-800', 'Calendar', 6, 'appointment', 'يجب حجز موعد لإكمال الإجراءات'),
  ('appointment_booked', 'تم حجز الموعد', 'Appointment Booked', 'bg-purple-100 text-purple-800', 'Calendar', 7, 'appointment', 'تم حجز الموعد بنجاح'),
  ('processing', 'قيد المعالجة', 'Processing', 'bg-blue-100 text-blue-800', 'Clock', 8, 'processing', 'الطلب قيد المعالجة'),
  ('ready', 'جاهز للاستلام', 'Ready', 'bg-green-100 text-green-800', 'CheckCircle', 9, 'processing', 'الطلب جاهز للاستلام'),
  ('shipping', 'جاري الشحن', 'Shipping', 'bg-indigo-100 text-indigo-800', 'MapPin', 10, 'shipping', 'جاري شحن الطلب'),
  ('shipped', 'تم الشحن', 'Shipped', 'bg-indigo-100 text-indigo-800', 'MapPin', 11, 'shipping', 'تم شحن الطلب'),
  ('delivered', 'تم التوصيل', 'Delivered', 'bg-green-100 text-green-800', 'CheckCircle', 12, 'shipping', 'تم توصيل الطلب بنجاح'),
  ('completed', 'مكتمل', 'Completed', 'bg-gray-100 text-gray-800', 'CheckCircle', 13, 'completion', 'تم إكمال الطلب بنجاح'),
  ('rejected', 'مرفوض', 'Rejected', 'bg-red-100 text-red-800', 'XCircle', 14, 'rejection', 'تم رفض الطلب'),
  ('cancelled', 'ملغي', 'Cancelled', 'bg-gray-100 text-gray-800', 'XCircle', 15, 'rejection', 'تم إلغاء الطلب')
ON CONFLICT (status_key) DO NOTHING;

-- تفعيل RLS
ALTER TABLE application_statuses ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الحالات
CREATE POLICY "Anyone can read statuses"
  ON application_statuses FOR SELECT
  USING (true);

-- السماح للمسؤولين فقط بالتعديل
CREATE POLICY "Super admins can manage statuses"
  ON application_statuses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.email = auth.jwt() ->> 'email'
      AND roles.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.email = auth.jwt() ->> 'email'
      AND roles.name = 'super_admin'
    )
  );

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_application_statuses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger
DROP TRIGGER IF EXISTS application_statuses_updated_at ON application_statuses;
CREATE TRIGGER application_statuses_updated_at
  BEFORE UPDATE ON application_statuses
  FOR EACH ROW
  EXECUTE FUNCTION update_application_statuses_updated_at();

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_application_statuses_order ON application_statuses(order_index);
CREATE INDEX IF NOT EXISTS idx_application_statuses_category ON application_statuses(category);
CREATE INDEX IF NOT EXISTS idx_application_statuses_active ON application_statuses(is_active) WHERE is_active = true;
