/*
  # إصلاح سياسات RLS للخدمات
  
  ## المشكلة
  - الخطأ: "permission denied for table users"
  - السبب: عدم وجود سياسات RLS للسماح بقراءة الخدمات للمستخدمين غير المصادق عليهم
  
  ## الحل
  - إضافة سياسات قراءة عامة لجداول الخدمات
  - السماح للجميع بقراءة الخدمات النشطة
  - السماح للإداريين فقط بالتعديل
*/

-- تمكين RLS على جميع جداول الخدمات (إذا لم يكن ممكناً)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_documents ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public read access to active services" ON services;
DROP POLICY IF EXISTS "Allow public read access to service types" ON service_types;
DROP POLICY IF EXISTS "Allow public read access to service fields" ON service_fields;
DROP POLICY IF EXISTS "Allow public read access to service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Allow public read access to service documents" ON service_documents;

-- =====================================================
-- سياسات القراءة العامة للخدمات
-- =====================================================

-- جدول services: السماح للجميع بقراءة الخدمات النشطة
CREATE POLICY "Allow public read access to active services"
  ON services
  FOR SELECT
  USING (is_active = true);

-- جدول service_types: السماح للجميع بقراءة الأنواع النشطة
CREATE POLICY "Allow public read access to service types"
  ON service_types
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_types.service_id
      AND services.is_active = true
    )
  );

-- جدول service_fields: السماح للجميع بقراءة الحقول النشطة
CREATE POLICY "Allow public read access to service fields"
  ON service_fields
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_fields.service_id
      AND services.is_active = true
    )
  );

-- جدول service_requirements: السماح للجميع بقراءة المتطلبات النشطة
CREATE POLICY "Allow public read access to service requirements"
  ON service_requirements
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_requirements.service_id
      AND services.is_active = true
    )
  );

-- جدول service_documents: السماح للجميع بقراءة المستندات النشطة
CREATE POLICY "Allow public read access to service documents"
  ON service_documents
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_documents.service_id
      AND services.is_active = true
    )
  );

-- =====================================================
-- سياسات الإدارة (للإداريين فقط)
-- =====================================================

-- حذف السياسات القديمة للإداريين
DROP POLICY IF EXISTS "Allow admin full access to services" ON services;
DROP POLICY IF EXISTS "Allow admin full access to service types" ON service_types;
DROP POLICY IF EXISTS "Allow admin full access to service fields" ON service_fields;
DROP POLICY IF EXISTS "Allow admin full access to service requirements" ON service_requirements;
DROP POLICY IF EXISTS "Allow admin full access to service documents" ON service_documents;

-- السماح للإداريين بكل شيء على جدول services
CREATE POLICY "Allow admin full access to services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- السماح للإداريين بكل شيء على جدول service_types
CREATE POLICY "Allow admin full access to service types"
  ON service_types
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- السماح للإداريين بكل شيء على جدول service_fields
CREATE POLICY "Allow admin full access to service fields"
  ON service_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- السماح للإداريين بكل شيء على جدول service_requirements
CREATE POLICY "Allow admin full access to service requirements"
  ON service_requirements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- السماح للإداريين بكل شيء على جدول service_documents
CREATE POLICY "Allow admin full access to service documents"
  ON service_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- تم! الآن يمكن للجميع قراءة الخدمات
-- =====================================================
