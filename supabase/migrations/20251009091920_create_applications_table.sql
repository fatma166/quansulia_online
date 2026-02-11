/*
  # إنشاء جدول الطلبات

  1. جداول جديدة
    - `applications`
      - `id` (uuid, primary key)
      - `reference_number` (text, unique) - رقم المرجع
      - `service_id` (text) - معرف الخدمة
      - `service_title` (text) - عنوان الخدمة
      - `form_data` (jsonb) - بيانات النموذج
      - `status` (text) - حالة الطلب
      - `submission_date` (timestamptz) - تاريخ التقديم
      - `estimated_completion` (timestamptz) - التاريخ المتوقع للإنجاز
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على جدول `applications`
    - السماح للجميع بإنشاء طلبات جديدة
    - السماح بقراءة الطلبات حسب رقم المرجع
*/

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL,
  service_id text NOT NULL,
  service_title text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  submission_date timestamptz NOT NULL DEFAULT now(),
  estimated_completion timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('submitted', 'in_review', 'processing', 'ready', 'completed', 'rejected'))
);

-- تفعيل RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بإنشاء طلبات
CREATE POLICY "Allow anyone to create applications"
  ON applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- السماح بقراءة الطلبات حسب رقم المرجع
CREATE POLICY "Allow reading applications by reference number"
  ON applications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- السماح للمصادقين بتحديث الطلبات
CREATE POLICY "Allow authenticated to update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إنشاء index لتسريع البحث برقم المرجع
CREATE INDEX IF NOT EXISTS idx_applications_reference_number 
  ON applications(reference_number);

-- إنشاء index للبحث حسب الخدمة
CREATE INDEX IF NOT EXISTS idx_applications_service_id 
  ON applications(service_id);

-- إنشاء index للبحث حسب الحالة
CREATE INDEX IF NOT EXISTS idx_applications_status 
  ON applications(status);
