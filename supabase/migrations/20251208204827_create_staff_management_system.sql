/*
  # نظام إدارة الموظفين المتكامل

  1. الجداول الجديدة
    - `departments` - الأقسام/الإدارات
      - `id` (uuid, primary key)
      - `name_ar` (text) - اسم القسم بالعربي
      - `name_en` (text) - اسم القسم بالإنجليزي
      - `description_ar` (text) - وصف القسم
      - `description_en` (text) - وصف القسم بالإنجليزي
      - `is_active` (boolean) - حالة القسم
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `regions` - المناطق الجغرافية
      - `id` (uuid, primary key)
      - `name_ar` (text) - اسم المنطقة بالعربي
      - `name_en` (text) - اسم المنطقة بالإنجليزي
      - `code` (text) - رمز المنطقة
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `roles` - الأدوار والصلاحيات
      - `id` (uuid, primary key)
      - `name` (text) - اسم الدور (admin, super_admin, staff, viewer, etc.)
      - `name_ar` (text) - اسم الدور بالعربي
      - `name_en` (text) - اسم الدور بالإنجليزي
      - `permissions` (jsonb) - الصلاحيات
      - `description_ar` (text)
      - `description_en` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `staff` - الموظفين
      - `id` (uuid, primary key)
      - `user_id` (uuid) - ربط بجدول auth.users
      - `employee_number` (text) - رقم الموظف
      - `full_name_ar` (text) - الاسم الكامل بالعربي
      - `full_name_en` (text) - الاسم الكامل بالإنجليزي
      - `email` (text) - البريد الإلكتروني
      - `phone` (text) - رقم الهاتف
      - `role_id` (uuid) - الدور الوظيفي
      - `department_id` (uuid) - القسم
      - `region_id` (uuid) - المنطقة
      - `hire_date` (date) - تاريخ التعيين
      - `status` (text) - الحالة (active, inactive, on_leave)
      - `avatar_url` (text) - صورة الموظف
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `staff_services` - ربط الموظف بالخدمات
      - `id` (uuid, primary key)
      - `staff_id` (uuid)
      - `service_id` (uuid)
      - `can_process` (boolean) - يمكنه معالجة الطلبات
      - `can_approve` (boolean) - يمكنه اعتماد الطلبات
      - `can_view` (boolean) - يمكنه عرض الطلبات فقط
      - `created_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - صلاحيات للسوبر أدمن والأدمن
    - صلاحيات محدودة للموظفين العاديين
*/

-- ============================================================================
-- جدول الأقسام
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة الأقسام"
  ON departments
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

CREATE POLICY "الجميع يمكنهم عرض الأقسام النشطة"
  ON departments
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================================
-- جدول المناطق
-- ============================================================================

CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة المناطق"
  ON regions
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

CREATE POLICY "الجميع يمكنهم عرض المناطق النشطة"
  ON regions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================================
-- جدول الأدوار والصلاحيات
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السوبر أدمن يمكنه إدارة الأدوار"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) = 'super_admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) = 'super_admin'
  );

CREATE POLICY "الأدمن يمكنه عرض الأدوار"
  ON roles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

-- ============================================================================
-- جدول الموظفين
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_number text UNIQUE NOT NULL,
  full_name_ar text NOT NULL,
  full_name_en text,
  email text UNIQUE NOT NULL,
  phone text,
  role_id uuid REFERENCES roles(id),
  department_id uuid REFERENCES departments(id),
  region_id uuid REFERENCES regions(id),
  hire_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة الموظفين"
  ON staff
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

CREATE POLICY "الموظف يمكنه عرض بياناته الخاصة"
  ON staff
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "الموظف يمكنه تحديث بياناته الأساسية"
  ON staff
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- جدول ربط الموظف بالخدمات
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  can_process boolean DEFAULT true,
  can_approve boolean DEFAULT false,
  can_view boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, service_id)
);

ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة ربط الموظفين بالخدمات"
  ON staff_services
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text
    ) IN ('admin', 'super_admin')
  );

CREATE POLICY "الموظف يمكنه عرض خدماته"
  ON staff_services
  FOR SELECT
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM staff WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- إدراج أدوار افتراضية
-- ============================================================================

INSERT INTO roles (name, name_ar, name_en, description_ar, description_en, permissions) VALUES
  ('super_admin', 'مدير النظام', 'Super Administrator', 'صلاحيات كاملة على كل شيء', 'Full system access', 
   '{"all": true, "manage_users": true, "manage_staff": true, "manage_services": true, "manage_applications": true, "manage_settings": true, "view_reports": true}'::jsonb),
  
  ('admin', 'مدير', 'Administrator', 'صلاحيات إدارية واسعة', 'Wide administrative access',
   '{"manage_staff": true, "manage_services": false, "manage_applications": true, "view_reports": true, "approve_applications": true}'::jsonb),
  
  ('supervisor', 'مشرف', 'Supervisor', 'إشراف على الموظفين والطلبات', 'Supervise staff and applications',
   '{"view_staff": true, "manage_applications": true, "approve_applications": true, "view_reports": true}'::jsonb),
  
  ('staff', 'موظف', 'Staff Member', 'معالجة الطلبات والخدمات', 'Process applications and services',
   '{"process_applications": true, "view_applications": true, "update_applications": true}'::jsonb),
  
  ('viewer', 'عارض', 'Viewer', 'عرض البيانات فقط', 'View only access',
   '{"view_applications": true, "view_reports": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- إدراج أقسام افتراضية
-- ============================================================================

INSERT INTO departments (name_ar, name_en, description_ar, description_en) VALUES
  ('الجوازات', 'Passports', 'قسم إصدار وتجديد الجوازات', 'Passport issuance and renewal department'),
  ('التصديقات', 'Attestations', 'قسم تصديق الوثائق', 'Document attestation department'),
  ('التوكيلات', 'Power of Attorney', 'قسم التوكيلات القانونية', 'Legal power of attorney department'),
  ('الأحوال المدنية', 'Civil Registry', 'قسم شؤون الأحوال المدنية', 'Civil affairs department'),
  ('التأشيرات', 'Visas', 'قسم التأشيرات والهجرة', 'Visa and immigration department'),
  ('الشؤون الإدارية', 'Administrative Affairs', 'القسم الإداري العام', 'General administrative department'),
  ('خدمة العملاء', 'Customer Service', 'قسم خدمة ودعم العملاء', 'Customer service and support department')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- إدراج مناطق افتراضية (مدن السعودية الرئيسية)
-- ============================================================================

INSERT INTO regions (name_ar, name_en, code) VALUES
  ('الرياض', 'Riyadh', 'RUH'),
  ('جدة', 'Jeddah', 'JED'),
  ('مكة المكرمة', 'Makkah', 'MKK'),
  ('المدينة المنورة', 'Madinah', 'MED'),
  ('الدمام', 'Dammam', 'DMM'),
  ('الخبر', 'Khobar', 'KHB'),
  ('الأحساء', 'Al-Ahsa', 'AHS'),
  ('القصيم', 'Qassim', 'QAS'),
  ('حائل', 'Hail', 'HAL'),
  ('تبوك', 'Tabuk', 'TBK'),
  ('أبها', 'Abha', 'ABH'),
  ('جازان', 'Jazan', 'JAZ'),
  ('نجران', 'Najran', 'NJR'),
  ('الباحة', 'Al-Baha', 'BAH'),
  ('ينبع', 'Yanbu', 'YNB'),
  ('الطائف', 'Taif', 'TAF')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- إنشاء الفهارس
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_employee_number ON staff(employee_number);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_region_id ON staff(region_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff_id ON staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service_id ON staff_services(service_id);

-- ============================================================================
-- تحديث timestamp تلقائياً
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
