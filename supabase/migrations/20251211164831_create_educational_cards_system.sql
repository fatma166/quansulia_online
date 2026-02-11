-- Create Educational Cards System
-- This table stores educational examination cards for students

CREATE TABLE IF NOT EXISTS educational_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  card_number text UNIQUE NOT NULL,
  student_full_name text NOT NULL,
  student_national_id text NOT NULL,
  exam_type text NOT NULL,
  exam_type_ar text NOT NULL,
  seat_number text NOT NULL,
  center_name text NOT NULL,
  center_name_ar text NOT NULL,
  center_number text NOT NULL,
  student_photo_url text,
  qr_code_url text,
  additional_data jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES staff(id),
  updated_by uuid REFERENCES staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on application_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_educational_cards_application_id ON educational_cards(application_id);

-- Create index on card_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_educational_cards_card_number ON educational_cards(card_number);

-- Enable RLS
ALTER TABLE educational_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view all cards
CREATE POLICY "Staff can view all educational cards"
  ON educational_cards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy: Staff can insert cards
CREATE POLICY "Staff can insert educational cards"
  ON educational_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy: Staff can update cards
CREATE POLICY "Staff can update educational cards"
  ON educational_cards
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

-- Policy: Staff can delete cards
CREATE POLICY "Staff can delete educational cards"
  ON educational_cards
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy: Users can view their own cards via reference number lookup
CREATE POLICY "Users can view their own educational cards"
  ON educational_cards
  FOR SELECT
  USING (true);

-- Function to generate card number
CREATE OR REPLACE FUNCTION generate_educational_card_number()
RETURNS text AS $$
DECLARE
  year_month text;
  sequence_num text;
  card_count integer;
BEGIN
  year_month := to_char(now(), 'YYYYMM');
  
  SELECT COUNT(*) INTO card_count
  FROM educational_cards
  WHERE card_number LIKE 'EDU-' || year_month || '%';
  
  sequence_num := lpad((card_count + 1)::text, 4, '0');
  
  RETURN 'EDU-' || year_month || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_educational_cards_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_educational_cards_updated_at'
  ) THEN
    CREATE TRIGGER update_educational_cards_updated_at
      BEFORE UPDATE ON educational_cards
      FOR EACH ROW
      EXECUTE FUNCTION update_educational_cards_updated_at();
  END IF;
END $$;