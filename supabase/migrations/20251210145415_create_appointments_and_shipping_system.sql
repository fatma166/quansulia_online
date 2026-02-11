/*
  # Create Appointments and Shipping Tracking System

  1. New Tables
    - `appointment_slots`
      - `id` (uuid, primary key)
      - `date` (date) - تاريخ الموعد
      - `time_slot` (text) - وقت الموعد (مثل: "09:00-09:30")
      - `available_slots` (integer) - عدد المواعيد المتاحة
      - `total_slots` (integer) - إجمالي عدد المواعيد
      - `region` (text) - المنطقة
      - `created_at` (timestamp)
      
    - `appointments`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to applications)
      - `slot_id` (uuid, foreign key to appointment_slots)
      - `applicant_name` (text)
      - `applicant_phone` (text)
      - `appointment_date` (date)
      - `appointment_time` (text)
      - `region` (text)
      - `status` (text) - confirmed, cancelled, completed
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `shipments`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to applications)
      - `tracking_number` (text, unique)
      - `carrier` (text) - شركة الشحن
      - `shipping_address` (jsonb) - عنوان الشحن
      - `current_status` (text) - processing, shipped, in_transit, delivered
      - `status_history` (jsonb[]) - تاريخ حالات الشحن
      - `estimated_delivery` (timestamp)
      - `actual_delivery` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (users can track by reference number)
    - Add policies for staff to manage appointments and shipments
*/

-- Create appointment_slots table
CREATE TABLE IF NOT EXISTS appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time_slot text NOT NULL,
  available_slots integer NOT NULL DEFAULT 10,
  total_slots integer NOT NULL DEFAULT 10,
  region text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_slot UNIQUE (date, time_slot, region)
);

ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
  ON appointment_slots FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage appointment slots"
  ON appointment_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  slot_id uuid REFERENCES appointment_slots(id) ON DELETE SET NULL,
  applicant_name text NOT NULL,
  applicant_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  region text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view their appointments"
  ON appointments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  tracking_number text UNIQUE NOT NULL,
  carrier text NOT NULL,
  shipping_address jsonb NOT NULL,
  current_status text NOT NULL DEFAULT 'processing',
  status_history jsonb[] DEFAULT ARRAY[]::jsonb[],
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipments"
  ON shipments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage shipments"
  ON shipments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_application_id ON appointments(application_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_shipments_application_id ON shipments(application_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date ON appointment_slots(date, region);

-- Function to update appointment slot availability
CREATE OR REPLACE FUNCTION update_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE appointment_slots
    SET available_slots = available_slots - 1
    WHERE id = NEW.slot_id AND available_slots > 0;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    UPDATE appointment_slots
    SET available_slots = available_slots + 1
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE appointment_slots
    SET available_slots = available_slots + 1
    WHERE id = OLD.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for slot availability
DROP TRIGGER IF EXISTS trigger_update_slot_availability ON appointments;
CREATE TRIGGER trigger_update_slot_availability
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_availability();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_shipments_updated_at ON shipments;
CREATE TRIGGER trigger_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample appointment slots for testing (next 30 days)
INSERT INTO appointment_slots (date, time_slot, available_slots, total_slots, region)
SELECT 
  d::date,
  t.time_slot,
  10,
  10,
  r.region
FROM 
  generate_series(CURRENT_DATE + 1, CURRENT_DATE + 30, '1 day'::interval) d,
  (VALUES 
    ('09:00-09:30'), ('09:30-10:00'), ('10:00-10:30'), ('10:30-11:00'),
    ('11:00-11:30'), ('11:30-12:00'), ('13:00-13:30'), ('13:30-14:00'),
    ('14:00-14:30'), ('14:30-15:00'), ('15:00-15:30'), ('15:30-16:00')
  ) AS t(time_slot),
  (VALUES ('riyadh'), ('jeddah'), ('dammam'), ('makkah'), ('madinah')) AS r(region)
WHERE EXTRACT(DOW FROM d) NOT IN (5, 6)
ON CONFLICT (date, time_slot, region) DO NOTHING;
