/*
  # إضافة نظام اسم المستخدم للموظفين

  ## التغييرات
  
  1. **إضافة عمود username**
     - `username` (text, unique, not null)
     - يجب أن يحتوي على حروف وأرقام وشرطة سفلية فقط
     - لا يسمح بمسافات أو رموز خاصة
  
  2. **تحديث البيانات الموجودة**
     - إنشاء username من employee_number الموجود
     - تنظيف أي مسافات أو رموز خاصة
  
  3. **جعل employee_number اختياري**
     - تحويل employee_number إلى optional
     - الموظفين الجدد سيستخدمون username فقط
  
  4. **إضافة قيود**
     - constraint للتأكد من صحة username
     - فقط حروف وأرقام وشرطة سفلية
*/

-- إضافة عمود username (مؤقتاً nullable حتى نملأ البيانات)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'username'
  ) THEN
    ALTER TABLE staff ADD COLUMN username text;
  END IF;
END $$;

-- تحديث البيانات الموجودة: إنشاء username من employee_number
UPDATE staff
SET username = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(employee_number, '[^a-zA-Z0-9_]', '', 'g'),
    '^_+|_+$', '', 'g'
  )
)
WHERE username IS NULL;

-- إذا كان username فارغ بعد التنظيف، استخدم جزء من email
UPDATE staff
SET username = LOWER(
  REGEXP_REPLACE(
    SPLIT_PART(email, '@', 1),
    '[^a-zA-Z0-9_]', '', 'g'
  )
)
WHERE username IS NULL OR username = '';

-- التأكد من عدم وجود تكرار في username
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
      SELECT username 
      FROM staff 
      GROUP BY username 
      HAVING COUNT(*) > 1
    )
  LOOP
    IF rec.rn > 1 THEN
      counter := rec.rn;
      new_username := rec.username || counter::text;
      
      -- تأكد من أن الـ username الجديد فريد
      WHILE EXISTS (SELECT 1 FROM staff WHERE username = new_username) LOOP
        counter := counter + 1;
        new_username := rec.username || counter::text;
      END LOOP;
      
      UPDATE staff SET username = new_username WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- الآن نجعل username مطلوب وفريد
ALTER TABLE staff ALTER COLUMN username SET NOT NULL;

-- إضافة constraint للتأكد من صحة username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'staff_username_valid_format'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_username_valid_format 
      CHECK (username ~ '^[a-z0-9_]+$' AND LENGTH(username) >= 3 AND LENGTH(username) <= 30);
  END IF;
END $$;

-- إضافة unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'staff_username_unique'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_username_unique UNIQUE (username);
  END IF;
END $$;

-- جعل employee_number اختياري (optional)
ALTER TABLE staff ALTER COLUMN employee_number DROP NOT NULL;

-- إضافة index على username لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);

-- إضافة comment للتوضيح
COMMENT ON COLUMN staff.username IS 'اسم المستخدم للموظف - يستخدم لتسجيل الدخول - يجب أن يحتوي فقط على حروف صغيرة وأرقام وشرطة سفلية';
COMMENT ON COLUMN staff.employee_number IS 'رقم الموظف - اختياري - للاستخدام الإداري فقط';
