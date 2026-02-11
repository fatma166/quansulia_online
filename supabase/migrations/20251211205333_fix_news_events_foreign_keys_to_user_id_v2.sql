/*
  # Fix foreign keys for news and events tables
  
  1. Changes
    - Add unique constraint on staff.user_id
    - Drop existing foreign keys that reference staff.id
    - Recreate foreign keys to reference staff.user_id instead
    - This aligns with auth.uid() which matches staff.user_id
  
  2. Security
    - Ensures created_by and updated_by can be set using auth.uid()
*/

-- Add unique constraint on staff.user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'staff_user_id_key'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Fix news table foreign keys
ALTER TABLE news 
  DROP CONSTRAINT IF EXISTS news_created_by_fkey,
  DROP CONSTRAINT IF EXISTS news_updated_by_fkey;

ALTER TABLE news
  ADD CONSTRAINT news_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES staff(user_id) 
    ON DELETE SET NULL;

ALTER TABLE news
  ADD CONSTRAINT news_updated_by_fkey 
    FOREIGN KEY (updated_by) 
    REFERENCES staff(user_id) 
    ON DELETE SET NULL;

-- Fix events table foreign keys
ALTER TABLE events 
  DROP CONSTRAINT IF EXISTS events_created_by_fkey,
  DROP CONSTRAINT IF EXISTS events_updated_by_fkey;

ALTER TABLE events
  ADD CONSTRAINT events_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES staff(user_id) 
    ON DELETE SET NULL;

ALTER TABLE events
  ADD CONSTRAINT events_updated_by_fkey 
    FOREIGN KEY (updated_by) 
    REFERENCES staff(user_id) 
    ON DELETE SET NULL;
