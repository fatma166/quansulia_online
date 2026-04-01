/*
  # إنشاء جدول سجل الحالات والمواعيد
  
  1. الجداول الجديدة
    - `status_history` - سجل تغييرات حالات الطلبات
    - `appointments` - جدول المواعيد (إن لم يكن موجوداً)
      
  2. الأمان
    - تمكين RLS
    - إضافة السياسات المناسبة
*/

-- Create status_history table
CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status_id uuid REFERENCES application_statuses(id),
  old_status text,
  new_status text,
  changed_by uuid REFERENCES staff(id),
  staff_name text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_status_history_application ON status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created ON status_history(created_at DESC);

-- Enable RLS
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read status history
CREATE POLICY "Authenticated users can read status history"
  ON status_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert status history
CREATE POLICY "Authenticated users can insert status history"
  ON status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create appointments table if not exists
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  location text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_by uuid REFERENCES staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_application ON appointments(application_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read appointments
CREATE POLICY "Authenticated users can read appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to manage appointments
CREATE POLICY "Authenticated users can insert appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
