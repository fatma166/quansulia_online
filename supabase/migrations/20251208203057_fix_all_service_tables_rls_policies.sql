/*
  # Fix RLS Policies for All Service-Related Tables

  1. Changes
    - Remove all policies that query auth.users table
    - Update admin policies to support both admin and super_admin roles
    - Fix policies for: service_fields, service_documents, service_requirements
  
  2. Security
    - Super admins and admins get full access
    - Public users can only read active records
*/

-- ============================================================================
-- SERVICE FIELDS
-- ============================================================================

DROP POLICY IF EXISTS "Allow admin full access to service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can do everything with service fields" ON service_fields;

CREATE POLICY "Admins and super admins can do everything with service fields"
  ON service_fields
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
-- SERVICE DOCUMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow admin full access to service documents" ON service_documents;
DROP POLICY IF EXISTS "Admins can do everything with service documents" ON service_documents;

CREATE POLICY "Admins and super admins can do everything with service documents"
  ON service_documents
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
-- SERVICE REQUIREMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow admin full access to service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Admins can do everything with service requirements" ON service_requirements;

CREATE POLICY "Admins and super admins can do everything with service requirements"
  ON service_requirements
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
