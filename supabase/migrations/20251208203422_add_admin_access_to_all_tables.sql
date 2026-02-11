/*
  # Add Admin and Super Admin Access to All Tables

  1. Changes
    - Add admin/super_admin policies to applications table
    - Add admin/super_admin policies to chat tables
    - Add admin/super_admin policies to OTP verifications
    - Ensure admins can view and manage everything
  
  2. Security
    - Super admins and admins get full access to all data
    - Existing public/user policies remain unchanged
*/

-- ============================================================================
-- APPLICATIONS
-- ============================================================================

CREATE POLICY "Admins and super admins can do everything with applications"
  ON applications
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
-- CHAT CONVERSATIONS
-- ============================================================================

CREATE POLICY "Admins and super admins can do everything with chat conversations"
  ON chat_conversations
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
-- CHAT MESSAGES
-- ============================================================================

CREATE POLICY "Admins and super admins can do everything with chat messages"
  ON chat_messages
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
-- CHAT STAFF
-- ============================================================================

CREATE POLICY "Admins and super admins can do everything with chat staff"
  ON chat_staff
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
-- OTP VERIFICATIONS
-- ============================================================================

CREATE POLICY "Admins and super admins can do everything with OTP verifications"
  ON otp_verifications
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
