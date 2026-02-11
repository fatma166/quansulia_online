/*
  # إضافة سياسة قراءة للمشرفين على جميع الخدمات

  1. التغييرات
    - إضافة سياسة SELECT للمشرفين لرؤية جميع الخدمات (النشطة وغير النشطة)
    - إضافة سياسة SELECT للمشرفين على service_fields
    - إضافة سياسة SELECT للمشرفين على service_documents
    - إضافة سياسة SELECT للمشرفين على service_requirements

  2. الأمان
    - المشرفون فقط (role = 'admin') يمكنهم رؤية جميع البيانات
    - المستخدمون العاديون يرون فقط البيانات النشطة
*/

-- إضافة سياسة قراءة للمشرفين على services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' 
    AND policyname = 'Admins can view all services'
  ) THEN
    CREATE POLICY "Admins can view all services"
      ON services
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE users.id = auth.uid()
          AND users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- إضافة سياسة قراءة للمشرفين على service_fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_fields' 
    AND policyname = 'Admins can view all service fields'
  ) THEN
    CREATE POLICY "Admins can view all service fields"
      ON service_fields
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE users.id = auth.uid()
          AND users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- إضافة سياسة قراءة للمشرفين على service_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_documents' 
    AND policyname = 'Admins can view all service documents'
  ) THEN
    CREATE POLICY "Admins can view all service documents"
      ON service_documents
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE users.id = auth.uid()
          AND users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- إضافة سياسة قراءة للمشرفين على service_requirements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'service_requirements' 
    AND policyname = 'Admins can view all service requirements'
  ) THEN
    CREATE POLICY "Admins can view all service requirements"
      ON service_requirements
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE users.id = auth.uid()
          AND users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;