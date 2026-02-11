/*
  # Fix UPDATE policies for news and events tables
  
  1. Changes
    - Add WITH CHECK clause to UPDATE policies
    - Both USING and WITH CHECK are needed for UPDATE operations
    - USING: verifies user can access the current row
    - WITH CHECK: verifies the updated row meets policy requirements
  
  2. Security
    - Ensures authenticated staff can update news/events
    - Validates both before and after update states
*/

-- Fix news table UPDATE policy
DROP POLICY IF EXISTS "Authenticated staff can update news" ON news;

CREATE POLICY "Authenticated staff can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- Fix events table UPDATE policy
DROP POLICY IF EXISTS "Authenticated staff can update events" ON events;

CREATE POLICY "Authenticated staff can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );
