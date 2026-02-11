/*
  # Create Maintenance and Announcement System

  1. New Tables
    - `system_maintenance`
      - `id` (int, primary key) - Always 1, single row
      - `is_enabled` (boolean) - Enable/disable maintenance mode
      - `start_time` (timestamptz) - Maintenance start time
      - `end_time` (timestamptz) - Maintenance end time
      - `message_ar` (text) - Arabic maintenance message
      - `message_en` (text) - English maintenance message
      - `updated_at` (timestamptz)
      - `updated_by` (uuid)

    - `system_announcements`
      - `id` (uuid, primary key)
      - `is_enabled` (boolean) - Enable/disable announcement
      - `type` (text) - Type: 'info', 'warning', 'error'
      - `title_ar` (text) - Arabic title
      - `title_en` (text) - English title
      - `message_ar` (text) - Arabic message
      - `message_en` (text) - English message
      - `start_time` (timestamptz) - Display from this time
      - `end_time` (timestamptz) - Display until this time
      - `is_dismissible` (boolean) - Can users dismiss it?
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid)

  2. Security
    - Enable RLS on both tables
    - Anyone can read (for public display)
    - Only admin staff can update

  3. Initial Data
    - Insert default settings
*/

-- Create system_maintenance table
CREATE TABLE IF NOT EXISTS system_maintenance (
  id int PRIMARY KEY DEFAULT 1,
  is_enabled boolean DEFAULT false,
  start_time timestamptz,
  end_time timestamptz,
  message_ar text DEFAULT 'الموقع تحت الصيانة حالياً. سنعود قريباً.',
  message_en text DEFAULT 'The site is currently under maintenance. We will be back soon.',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id),
  CONSTRAINT single_maintenance_row CHECK (id = 1)
);

-- Create system_announcements table
CREATE TABLE IF NOT EXISTS system_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT false,
  type text DEFAULT 'info',
  title_ar text,
  title_en text,
  message_ar text,
  message_en text,
  start_time timestamptz,
  end_time timestamptz,
  is_dismissible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id),
  CONSTRAINT valid_announcement_type CHECK (type IN ('info', 'warning', 'error'))
);

-- Enable RLS
ALTER TABLE system_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_maintenance
CREATE POLICY "Anyone can read maintenance status"
  ON system_maintenance FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin staff can update maintenance settings"
  ON system_maintenance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.permissions->>'dashboard_sections' LIKE '%content%'
      AND staff.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('admin', 'super_admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.permissions->>'dashboard_sections' LIKE '%content%'
      AND staff.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('admin', 'super_admin')
      AND staff.is_active = true
    )
  );

-- RLS Policies for system_announcements
CREATE POLICY "Anyone can read announcements"
  ON system_announcements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin staff can insert announcements"
  ON system_announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.permissions->>'dashboard_sections' LIKE '%content%'
      AND staff.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('admin', 'super_admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admin staff can update announcements"
  ON system_announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.permissions->>'dashboard_sections' LIKE '%content%'
      AND staff.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('admin', 'super_admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.permissions->>'dashboard_sections' LIKE '%content%'
      AND staff.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('admin', 'super_admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admin staff can delete announcements"
  ON system_announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.permissions->>'dashboard_sections' LIKE '%content%'
      AND staff.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('admin', 'super_admin')
      AND staff.is_active = true
    )
  );

-- Insert default maintenance settings
INSERT INTO system_maintenance (id, is_enabled)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;