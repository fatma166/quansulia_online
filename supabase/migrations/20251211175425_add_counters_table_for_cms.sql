/*
  # Add Counters/Statistics Table for CMS

  1. New Tables
    - `counters`
      - Manages statistics/numbers section (citizens, transactions, events, etc.)
      - Supports Arabic and English labels
      - Allows ordering and activation/deactivation
    
  2. Security
    - Enable RLS
    - Public read access for active counters
    - Staff write access for management
*/

-- Create counters table
CREATE TABLE IF NOT EXISTS counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  value bigint NOT NULL DEFAULT 0,
  icon text,
  color text DEFAULT '#276073',
  suffix_ar text,
  suffix_en text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_counters_order ON counters(display_order);
CREATE INDEX IF NOT EXISTS idx_counters_key ON counters(key);

-- Enable RLS
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can read active counters"
  ON counters FOR SELECT
  TO public
  USING (is_active = true);

-- Staff write policies
CREATE POLICY "Authenticated staff can insert counters"
  ON counters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update counters"
  ON counters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete counters"
  ON counters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Insert default counters
INSERT INTO counters (key, label_ar, label_en, value, icon, display_order, is_active) VALUES
  ('citizens', 'مواطن سوداني', 'Sudanese Citizens', 25000, 'Users', 1, true),
  ('transactions', 'معاملة مكتملة', 'Completed Transactions', 150000, 'FileCheck', 2, true),
  ('events', 'فعالية ونشاط', 'Events and Activities', 450, 'Calendar', 3, true),
  ('services', 'خدمة قنصلية', 'Consular Services', 12, 'Award', 4, true),
  ('investments', 'فرصة استثمارية', 'Investment Opportunities', 85, 'TrendingUp', 5, true),
  ('partnerships', 'شراكة استراتيجية', 'Strategic Partnerships', 35, 'Handshake', 6, true)
ON CONFLICT (key) DO NOTHING;
