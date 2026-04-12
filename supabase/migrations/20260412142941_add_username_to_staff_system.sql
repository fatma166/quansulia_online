/*
  # Add username column to staff table

  Adds a unique username field to the staff table used for login via staff-login Edge Function.
  Makes employee_number optional.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'username'
  ) THEN
    ALTER TABLE staff ADD COLUMN username text;
  END IF;
END $$;

UPDATE staff
SET username = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(COALESCE(employee_number, ''), '[^a-zA-Z0-9_]', '', 'g'),
    '^_+|_+$', '', 'g'
  )
)
WHERE username IS NULL AND employee_number IS NOT NULL AND employee_number != '';

UPDATE staff
SET username = LOWER(
  REGEXP_REPLACE(
    SPLIT_PART(email, '@', 1),
    '[^a-zA-Z0-9_]', '', 'g'
  )
)
WHERE username IS NULL OR username = '';

DO $$
DECLARE
  rec RECORD;
  new_username text;
  counter int;
BEGIN
  FOR rec IN 
    SELECT id, username, ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
    FROM staff
    WHERE username IN (
      SELECT username FROM staff GROUP BY username HAVING COUNT(*) > 1
    )
  LOOP
    IF rec.rn > 1 THEN
      counter := rec.rn;
      new_username := rec.username || counter::text;
      WHILE EXISTS (SELECT 1 FROM staff WHERE username = new_username) LOOP
        counter := counter + 1;
        new_username := rec.username || counter::text;
      END LOOP;
      UPDATE staff SET username = new_username WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'username' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE staff ALTER COLUMN username SET NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_username_valid_format'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_username_valid_format 
      CHECK (username ~ '^[a-z0-9_]+$' AND LENGTH(username) >= 3 AND LENGTH(username) <= 30);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_username_unique'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_username_unique UNIQUE (username);
  END IF;
END $$;

ALTER TABLE staff ALTER COLUMN employee_number DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
