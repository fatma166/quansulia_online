/*
  # إنشاء جدول حالات الطلبات
  
  1. الجداول الجديدة
    - `application_statuses` - جدول حالات الطلبات
      - `id` (uuid, primary key)
      - `status_key` (text, unique) - المفتاح الفريد للحالة
      - `name_ar` (text) - اسم الحالة بالعربية
      - `name_en` (text) - اسم الحالة بالإنجليزية
      - `description_ar` (text) - وصف الحالة بالعربية
      - `description_en` (text) - وصف الحالة بالإنجليزية
      - `color` (text) - لون الحالة (hex code)
      - `icon` (text) - أيقونة الحالة
      - `order_index` (integer) - ترتيب الحالة
      - `is_active` (boolean) - هل الحالة نشطة؟
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. البيانات الأساسية
    - إضافة 16 حالة للطلبات
    
  3. الأمان
    - تمكين RLS
    - إضافة سياسات للقراءة للجميع
*/

-- Create application_statuses table
CREATE TABLE IF NOT EXISTS application_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  color text DEFAULT '#6B7280',
  icon text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE application_statuses ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read statuses
CREATE POLICY "Anyone can read active statuses"
  ON application_statuses
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to read all statuses
CREATE POLICY "Authenticated users can read all statuses"
  ON application_statuses
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default statuses
INSERT INTO application_statuses (status_key, name_ar, name_en, color, order_index, description_ar) VALUES
  ('submitted', 'تم التقديم', 'Submitted', '#3B82F6', 1, 'تم استلام الطلب بنجاح'),
  ('in_review', 'قيد المراجعة', 'In Review', '#F59E0B', 2, 'جاري مراجعة المستندات والمعلومات'),
  ('approved', 'تمت الموافقة', 'Approved', '#10B981', 3, 'تمت الموافقة على الطلب'),
  ('payment_pending', 'في انتظار الدفع', 'Payment Pending', '#F59E0B', 4, 'في انتظار إتمام عملية الدفع'),
  ('payment_completed', 'تم الدفع', 'Payment Completed', '#10B981', 5, 'تم إتمام عملية الدفع بنجاح'),
  ('appointment_required', 'يتطلب موعد', 'Appointment Required', '#F59E0B', 6, 'يتطلب حجز موعد'),
  ('appointment_confirmed', 'تم تأكيد الموعد', 'Appointment Confirmed', '#10B981', 6, 'تم تأكيد الموعد'),
  ('appointment_booked', 'تم حجز الموعد', 'Appointment Booked', '#10B981', 7, 'تم حجز الموعد بنجاح'),
  ('processing', 'قيد المعالجة', 'Processing', '#3B82F6', 8, 'جاري معالجة الطلب'),
  ('ready', 'جاهز للاستلام', 'Ready', '#10B981', 9, 'الطلب جاهز للاستلام'),
  ('shipping', 'قيد الشحن', 'Shipping', '#3B82F6', 10, 'جاري شحن المستندات'),
  ('shipped', 'تم الشحن', 'Shipped', '#10B981', 11, 'تم شحن المستندات'),
  ('delivered', 'تم التسليم', 'Delivered', '#10B981', 12, 'تم تسليم المستندات'),
  ('completed', 'مكتمل', 'Completed', '#10B981', 13, 'تم إنجاز الطلب بنجاح'),
  ('rejected', 'مرفوض', 'Rejected', '#EF4444', 14, 'تم رفض الطلب'),
  ('cancelled', 'ملغى', 'Cancelled', '#6B7280', 15, 'تم إلغاء الطلب')
ON CONFLICT (status_key) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_application_statuses_order ON application_statuses(order_index);
CREATE INDEX IF NOT EXISTS idx_application_statuses_active ON application_statuses(is_active);
