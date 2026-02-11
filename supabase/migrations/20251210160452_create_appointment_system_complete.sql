/*
  # نظام الحجوزات الكامل

  1. الجداول الجديدة
    - `appointment_settings`: إعدادات نظام الحجوزات
    - `closed_days`: الأيام المغلقة

  2. التحسينات
    - إضافة حقول جديدة لجدول appointments
    - إنشاء indexes لتحسين الأداء

  3. الأمان
    - تفعيل RLS على الجداول الجديدة
    - الموظفون فقط يمكنهم إدارة الإعدادات
*/

-- جدول إعدادات الحجوزات
CREATE TABLE IF NOT EXISTS appointment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  max_appointments_per_day int NOT NULL DEFAULT 20,
  weekend_days int[] NOT NULL DEFAULT ARRAY[5, 6],
  booking_advance_days int NOT NULL DEFAULT 30,
  booking_cutoff_hours int NOT NULL DEFAULT 24,
  allow_same_day_booking boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول الأيام المغلقة
CREATE TABLE IF NOT EXISTS closed_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closed_date date NOT NULL UNIQUE,
  reason text,
  is_recurring boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إضافة حقل service_name لجدول appointments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'service_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN service_name text;
  END IF;
END $$;

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_closed_days_date ON closed_days(closed_date);

-- Function لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_appointment_settings_updated_at ON appointment_settings;
CREATE TRIGGER update_appointment_settings_updated_at
  BEFORE UPDATE ON appointment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_closed_days_updated_at ON closed_days;
CREATE TRIGGER update_closed_days_updated_at
  BEFORE UPDATE ON closed_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تفعيل RLS
ALTER TABLE appointment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_days ENABLE ROW LEVEL SECURITY;

-- حذف الـ policies القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can view appointment settings" ON appointment_settings;
DROP POLICY IF EXISTS "Staff can manage appointment settings" ON appointment_settings;
DROP POLICY IF EXISTS "Anyone can view closed days" ON closed_days;
DROP POLICY IF EXISTS "Staff can manage closed days" ON closed_days;

-- Policies لـ appointment_settings
CREATE POLICY "Anyone can view appointment settings"
  ON appointment_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can insert appointment settings"
  ON appointment_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

CREATE POLICY "Staff can update appointment settings"
  ON appointment_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

CREATE POLICY "Staff can delete appointment settings"
  ON appointment_settings FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

-- Policies لـ closed_days
CREATE POLICY "Anyone can view closed days"
  ON closed_days FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can insert closed days"
  ON closed_days FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

CREATE POLICY "Staff can update closed days"
  ON closed_days FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

CREATE POLICY "Staff can delete closed days"
  ON closed_days FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

-- إضافة إعدادات افتراضية
INSERT INTO appointment_settings (
  max_appointments_per_day,
  weekend_days,
  booking_advance_days,
  booking_cutoff_hours,
  allow_same_day_booking
)
VALUES (20, ARRAY[5, 6], 30, 24, false)
ON CONFLICT DO NOTHING;
