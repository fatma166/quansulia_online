/*
  # Fix RLS policies for news and events tables
  
  1. Changes
    - Fix INSERT, UPDATE, DELETE policies to check staff.user_id instead of staff.id
    - This ensures authenticated staff can manage news and events content
  
  2. Security
    - Policies verify that the authenticated user exists in staff table with matching user_id
*/

-- Drop existing policies for news table
DROP POLICY IF EXISTS "Authenticated staff can insert news" ON news;
DROP POLICY IF EXISTS "Authenticated staff can update news" ON news;
DROP POLICY IF EXISTS "Authenticated staff can delete news" ON news;

-- Create corrected policies for news table
CREATE POLICY "Authenticated staff can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

CREATE POLICY "Authenticated staff can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

CREATE POLICY "Authenticated staff can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- Drop existing policies for events table
DROP POLICY IF EXISTS "Authenticated staff can insert events" ON events;
DROP POLICY IF EXISTS "Authenticated staff can update events" ON events;
DROP POLICY IF EXISTS "Authenticated staff can delete events" ON events;

-- Create corrected policies for events table
CREATE POLICY "Authenticated staff can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

CREATE POLICY "Authenticated staff can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

CREATE POLICY "Authenticated staff can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );
