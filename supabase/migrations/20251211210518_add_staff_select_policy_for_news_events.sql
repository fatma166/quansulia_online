/*
  # Add SELECT policy for staff to view all news and events
  
  1. Changes
    - Add SELECT policy for authenticated staff to view ALL news (active and inactive)
    - Add SELECT policy for authenticated staff to view ALL events (active and inactive)
    - This allows staff to manage and toggle visibility of news/events
  
  2. Security
    - Only authenticated staff with is_active=true can view all items
    - Public users can still only see active items (existing policy remains)
*/

-- Add SELECT policy for staff to view all news
CREATE POLICY "Authenticated staff can view all news"
  ON news FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- Add SELECT policy for staff to view all events
CREATE POLICY "Authenticated staff can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );
