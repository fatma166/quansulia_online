/*
  # Fix RLS Policies for Shipping Companies

  1. Changes
    - Drop existing restrictive policies
    - Add new policies that allow:
      - Super admins to manage everything
      - Regular admins to manage everything
      - Staff members to manage everything
      - Public to read active companies

  2. Security
    - Maintains RLS protection
    - Allows proper access for all admin types
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can read all shipping companies" ON shipping_companies;
DROP POLICY IF EXISTS "Staff can insert shipping companies" ON shipping_companies;
DROP POLICY IF EXISTS "Staff can update shipping companies" ON shipping_companies;
DROP POLICY IF EXISTS "Staff can delete shipping companies" ON shipping_companies;

-- New comprehensive policies for admins and staff
CREATE POLICY "Admins and staff can read all shipping companies"
  ON shipping_companies
  FOR SELECT
  TO authenticated
  USING (
    -- Super admins
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
    OR
    -- Staff members
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can insert shipping companies"
  ON shipping_companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Super admins
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
    OR
    -- Staff members
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can update shipping companies"
  ON shipping_companies
  FOR UPDATE
  TO authenticated
  USING (
    -- Super admins
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
    OR
    -- Staff members
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Super admins
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
    OR
    -- Staff members
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can delete shipping companies"
  ON shipping_companies
  FOR DELETE
  TO authenticated
  USING (
    -- Super admins
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) IN ('super_admin', 'admin')
    OR
    -- Staff members
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );
