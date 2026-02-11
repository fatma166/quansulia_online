/*
  # تبسيط سياسات RLS للمشرفين

  1. المشكلة
    - السياسات السابقة معقدة جداً
    
  2. الحل
    - التحقق فقط من user_metadata->role في JWT
    - تبسيط الشروط

  3. الأمان
    - المشرفون (role = 'admin' في user_metadata) يمكنهم الوصول لكل شيء
    - الجمهور يرى فقط البيانات النشطة
*/

-- حذف جميع السياسات القديمة من services
DROP POLICY IF EXISTS "Admins can view all services" ON services;
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Anyone can view active services" ON services;

-- سياسات جديدة مبسطة
CREATE POLICY "Admins can do everything with services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt()->'user_metadata'->>'role'),
      (auth.jwt()->'app_metadata'->>'role')
    ) = 'admin'
  );

CREATE POLICY "Public can view active services"
  ON services
  FOR SELECT
  TO public
  USING (is_active = true);

-- حذف وإعادة إنشاء سياسات service_fields
DROP POLICY IF EXISTS "Admins can view all service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can manage service fields" ON service_fields;
DROP POLICY IF EXISTS "Public can view active service fields" ON service_fields;
DROP POLICY IF EXISTS "Anyone can view active service fields" ON service_fields;
DROP POLICY IF EXISTS "Allow public read access" ON service_fields;

CREATE POLICY "Admins can do everything with service fields"
  ON service_fields
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt()->'user_metadata'->>'role'),
      (auth.jwt()->'app_metadata'->>'role')
    ) = 'admin'
  );

CREATE POLICY "Public can view active service fields"
  ON service_fields
  FOR SELECT
  TO public
  USING (is_active = true);

-- حذف وإعادة إنشاء سياسات service_documents
DROP POLICY IF EXISTS "Admins can view all service documents" ON service_documents;
DROP POLICY IF EXISTS "Admins can manage service documents" ON service_documents;
DROP POLICY IF EXISTS "Public can view active service documents" ON service_documents;
DROP POLICY IF EXISTS "Anyone can view active service documents" ON service_documents;
DROP POLICY IF EXISTS "Allow public read access" ON service_documents;

CREATE POLICY "Admins can do everything with service documents"
  ON service_documents
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt()->'user_metadata'->>'role'),
      (auth.jwt()->'app_metadata'->>'role')
    ) = 'admin'
  );

CREATE POLICY "Public can view active service documents"
  ON service_documents
  FOR SELECT
  TO public
  USING (is_active = true);

-- حذف وإعادة إنشاء سياسات service_requirements
DROP POLICY IF EXISTS "Admins can view all service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Admins can manage service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Public can view active service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Anyone can view active service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Allow public read access" ON service_requirements;

CREATE POLICY "Admins can do everything with service requirements"
  ON service_requirements
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt()->'user_metadata'->>'role'),
      (auth.jwt()->'app_metadata'->>'role')
    ) = 'admin'
  );

CREATE POLICY "Public can view active service requirements"
  ON service_requirements
  FOR SELECT
  TO public
  USING (is_active = true);