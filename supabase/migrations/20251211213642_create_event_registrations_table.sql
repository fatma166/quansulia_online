/*
  # إنشاء جدول تسجيلات المشاركة في الفعاليات

  1. جدول جديد
    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `full_name` (text)
      - `phone` (text)
      - `email` (text)
      - `companions_count` (integer)
      - `notes` (text, nullable)
      - `status` (text) - confirmed, pending, cancelled
      - `registration_date` (timestamp)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `event_registrations`
    - سياسة للقراءة للمسؤولين فقط
    - سياسة للإدراج للجميع (المستخدمين العاديين)
*/

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  companions_count integer DEFAULT 0,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للموظفين والمسؤولين
CREATE POLICY "Staff and admins can view registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
    )
  );

-- سياسة الإدراج للجميع
CREATE POLICY "Anyone can register for events"
  ON event_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- سياسة التحديث للموظفين فقط
CREATE POLICY "Staff can update registrations"
  ON event_registrations
  FOR UPDATE
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

-- إضافة فهرس لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);