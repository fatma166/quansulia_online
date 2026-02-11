/*
  # إضافة صورة الموظف والتخزين

  1. التغييرات
    - إضافة حقل `avatar_url` لجدول `staff`
    - إنشاء bucket للصور `staff-avatars`
    - إضافة policies للسماح بالوصول للصور
  
  2. الأمان
    - السماح للموظفين المصادق عليهم برفع صورهم
    - السماح للجميع بقراءة الصور
*/

-- إضافة حقل avatar_url إلى جدول staff
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE staff ADD COLUMN avatar_url text;
  END IF;
END $$;

-- إنشاء storage bucket للصور
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-avatars', 'staff-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- حذف policies القديمة إن وجدت
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- السماح للجميع بقراءة الصور
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'staff-avatars');

-- السماح للمستخدمين المصادق عليهم برفع الصور
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staff-avatars');

-- السماح للمستخدمين المصادق عليهم بتحديث صورهم
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'staff-avatars');

-- السماح للمستخدمين المصادق عليهم بحذف صورهم
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'staff-avatars');
