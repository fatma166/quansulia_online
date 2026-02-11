/*
  # إضافة نظام صلاحيات الموظفين المتقدم

  ## التغييرات الجديدة
  
  1. إضافة حقل permissions (jsonb) لجدول staff
     - سيحتوي على صلاحيات الوصول لأقسام لوحة التحكم
     - سيحتوي على صلاحيات المناطق
  
  2. إضافة حقل can_access_all_services
     - للتحقق السريع إذا كان لديه صلاحية الوصول لجميع الخدمات
  
  3. إضافة حقل can_access_all_regions
     - للتحقق السريع إذا كان لديه صلاحية الوصول لجميع المناطق

  ## الصلاحيات المتاحة في لوحة التحكم:
  - dashboard: لوحة التحكم الرئيسية
  - applications: إدارة الطلبات
  - services: إدارة الخدمات
  - staff: إدارة الموظفين
  - content: إدارة المحتوى (أخبار وفعاليات)
  - chat: إدارة المحادثات
  - calendar: التقويم والمواعيد
  - reports: التقارير
*/

-- إضافة الحقول الجديدة لجدول staff
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE staff ADD COLUMN permissions jsonb DEFAULT '{
      "dashboard_sections": [],
      "allowed_regions": []
    }'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'can_access_all_services'
  ) THEN
    ALTER TABLE staff ADD COLUMN can_access_all_services boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'can_access_all_regions'
  ) THEN
    ALTER TABLE staff ADD COLUMN can_access_all_regions boolean DEFAULT false;
  END IF;
END $$;

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_staff_permissions ON staff USING gin (permissions);
CREATE INDEX IF NOT EXISTS idx_staff_all_services ON staff (can_access_all_services) WHERE can_access_all_services = true;
CREATE INDEX IF NOT EXISTS idx_staff_all_regions ON staff (can_access_all_regions) WHERE can_access_all_regions = true;

-- تحديث الصلاحيات الافتراضية للموظفين الحاليين
UPDATE staff 
SET 
  permissions = jsonb_build_object(
    'dashboard_sections', ARRAY['dashboard', 'applications']::text[],
    'allowed_regions', ARRAY[]::text[]
  ),
  can_access_all_services = false,
  can_access_all_regions = false
WHERE permissions IS NULL OR permissions = '{}'::jsonb;

-- إنشاء جدول staff_regions لربط الموظفين بالمناطق المحددة
CREATE TABLE IF NOT EXISTS staff_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, region_id)
);

-- تفعيل RLS
ALTER TABLE staff_regions ENABLE ROW LEVEL SECURITY;

-- صلاحيات للـ super_admin و admin
CREATE POLICY "Super Admin and Admin can manage staff regions"
  ON staff_regions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      JOIN roles r ON s.role_id = r.id
      WHERE s.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff s
      JOIN roles r ON s.role_id = r.id
      WHERE s.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- صلاحية للموظف لعرض مناطقه فقط
CREATE POLICY "Staff can view own regions"
  ON staff_regions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.user_id = auth.uid()
      AND s.id = staff_regions.staff_id
    )
  );

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_staff_regions_staff_id ON staff_regions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_regions_region_id ON staff_regions(region_id);

-- Comment على الجداول والحقول
COMMENT ON COLUMN staff.permissions IS 'صلاحيات الموظف في لوحة التحكم والمناطق بصيغة JSON';
COMMENT ON COLUMN staff.can_access_all_services IS 'هل يمكن للموظف الوصول لجميع الخدمات؟';
COMMENT ON COLUMN staff.can_access_all_regions IS 'هل يمكن للموظف الوصول لجميع المناطق؟';
COMMENT ON TABLE staff_regions IS 'ربط الموظفين بالمناطق المحددة';
