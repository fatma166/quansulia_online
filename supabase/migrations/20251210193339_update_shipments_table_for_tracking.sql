/*
  # Update Shipments Table for Enhanced Tracking

  1. Changes
    - Add shipping_company_id to link with shipping_companies table
    - Add tracking_url for tracking link
    - Add shipped_at for actual shipping date
    - Add foreign key constraint to shipping_companies

  2. Notes
    - Keep existing tracking_number field for backward compatibility
    - Keep existing carrier field for backward compatibility
*/

-- Add new columns to shipments table
ALTER TABLE shipments 
  ADD COLUMN IF NOT EXISTS shipping_company_id uuid REFERENCES shipping_companies(id),
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_shipping_company ON shipments(shipping_company_id);
CREATE INDEX IF NOT EXISTS idx_shipments_application ON shipments(application_id);

-- Update RLS policies for shipments
DROP POLICY IF EXISTS "Users can view own shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can view all shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can insert shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can update shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can delete shipments" ON shipments;

CREATE POLICY "Public can view shipments"
  ON shipments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff and admins can insert shipments"
  ON shipments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid())
    OR
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
  );

CREATE POLICY "Staff and admins can update shipments"
  ON shipments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid())
    OR
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid())
    OR
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
  );

CREATE POLICY "Staff and admins can delete shipments"
  ON shipments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid())
    OR
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
  );
