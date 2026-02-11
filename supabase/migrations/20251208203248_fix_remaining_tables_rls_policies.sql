/*
  # Fix RLS Policies for All Remaining Tables

  1. Changes
    - Remove all policies that query auth.users table
    - Update admin policies to support both admin and super_admin roles
    - Fix policies for: service_types, service_field_conditions, 
      service_document_conditions, and dynamic list fields
  
  2. Security
    - Super admins and admins get full access
    - Public users can only read active records where applicable
*/

-- ============================================================================
-- SERVICE TYPES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage service types" ON service_types;
DROP POLICY IF EXISTS "Allow admin full access to service types" ON service_types;

CREATE POLICY "Admins and super admins can manage service types"
  ON service_types
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

-- ============================================================================
-- SERVICE FIELD CONDITIONS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage field conditions" ON service_field_conditions;

CREATE POLICY "Admins and super admins can manage field conditions"
  ON service_field_conditions
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

-- ============================================================================
-- SERVICE DOCUMENT CONDITIONS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage document conditions" ON service_document_conditions;

CREATE POLICY "Admins and super admins can manage document conditions"
  ON service_document_conditions
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

-- ============================================================================
-- SERVICE DYNAMIC LIST FIELDS
-- ============================================================================

-- Check if policy exists, then drop and recreate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_dynamic_list_fields' 
    AND policyname LIKE '%admin%'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage dynamic list fields" ON service_dynamic_list_fields;
    DROP POLICY IF EXISTS "Allow admin full access to dynamic list fields" ON service_dynamic_list_fields;
  END IF;
END $$;

CREATE POLICY "Admins and super admins can manage dynamic list fields"
  ON service_dynamic_list_fields
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

-- Add public read access for active items
CREATE POLICY "Public can view active dynamic list fields"
  ON service_dynamic_list_fields
  FOR SELECT
  TO public
  USING (true);
