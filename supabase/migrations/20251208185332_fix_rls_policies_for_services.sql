/*
  # إصلاح سياسات RLS للخدمات

  1. المشكلة
    - السياسات الحالية تستخدم auth.users مباشرة مما يسبب "permission denied"
    
  2. الحل
    - استخدام auth.jwt() للوصول لمعلومات المستخدم من JWT token
    - حذف السياسات القديمة وإنشاء سياسات جديدة صحيحة

  3. الأمان
    - المشرفون يمكنهم الوصول لكل شيء
    - المستخدمون العاديون يرون فقط البيانات النشطة
*/

-- حذف السياسات القديمة من جدول services
DROP POLICY IF EXISTS "Admins can view all services" ON services;
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;
DROP POLICY IF EXISTS "Anyone can view active services" ON services;

-- إنشاء سياسات جديدة باستخدام auth.jwt()
CREATE POLICY "Admins can view all services"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Public can view active services"
  ON services
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can insert services"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Admins can update services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Admins can delete services"
  ON services
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- حذف وإعادة إنشاء سياسات service_fields
DROP POLICY IF EXISTS "Admins can view all service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can manage service fields" ON service_fields;
DROP POLICY IF EXISTS "Anyone can view active service fields" ON service_fields;
DROP POLICY IF EXISTS "Allow public read access" ON service_fields;

CREATE POLICY "Admins can manage service fields"
  ON service_fields
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Public can view active service fields"
  ON service_fields
  FOR SELECT
  TO public
  USING (is_active = true);

-- حذف وإعادة إنشاء سياسات service_documents
DROP POLICY IF EXISTS "Admins can view all service documents" ON service_documents;
DROP POLICY IF EXISTS "Admins can manage service documents" ON service_documents;
DROP POLICY IF EXISTS "Anyone can view active service documents" ON service_documents;
DROP POLICY IF EXISTS "Allow public read access" ON service_documents;

CREATE POLICY "Admins can manage service documents"
  ON service_documents
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Public can view active service documents"
  ON service_documents
  FOR SELECT
  TO public
  USING (is_active = true);

-- حذف وإعادة إنشاء سياسات service_requirements
DROP POLICY IF EXISTS "Admins can view all service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Admins can manage service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Anyone can view active service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Allow public read access" ON service_requirements;

CREATE POLICY "Admins can manage service requirements"
  ON service_requirements
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'authenticated' AND
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Public can view active service requirements"
  ON service_requirements
  FOR SELECT
  TO public
  USING (is_active = true);