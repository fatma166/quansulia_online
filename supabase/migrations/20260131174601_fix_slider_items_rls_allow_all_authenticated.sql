/*
  # Fix Slider Items RLS - Allow All Authenticated Users
  
  1. Changes
    - Drop existing policies
    - Create simple policies that allow any authenticated user to manage slider items
    - This matches the admin dashboard permissions model
    
  2. Security
    - Only authenticated users can manage
    - Public users can only read
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Staff can insert slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Staff can update slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Staff can delete slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Super admin and admin can insert slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Super admin and admin can update slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Super admin and admin can delete slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Active staff can insert slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Active staff can update slider items" ON public.slider_items;
DROP POLICY IF EXISTS "Active staff can delete slider items" ON public.slider_items;

-- Create simple policies for authenticated users
CREATE POLICY "Authenticated users can insert slider items"
  ON public.slider_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update slider items"
  ON public.slider_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete slider items"
  ON public.slider_items
  FOR DELETE
  TO authenticated
  USING (true);