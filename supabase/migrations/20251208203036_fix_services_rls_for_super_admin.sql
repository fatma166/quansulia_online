/*
  # Fix Services RLS Policies for Super Admin

  1. Changes
    - Remove policy that queries auth.users table (causes permission denied error)
    - Add proper policy for super_admin role using JWT metadata
    - Ensure admins and super_admins can access all services
  
  2. Security
    - Super admins get full access to all services
    - Regular admins get full access to all services
    - Public users can only read active services
*/

-- Drop the problematic policy that queries auth.users
DROP POLICY IF EXISTS "Allow admin full access to services" ON services;

-- Drop the old admin policy to recreate it with super_admin support
DROP POLICY IF EXISTS "Admins can do everything with services" ON services;

-- Create new policy for both admin and super_admin roles
CREATE POLICY "Admins and super admins can do everything with services"
  ON services
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
