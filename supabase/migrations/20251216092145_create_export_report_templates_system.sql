/*
  # إنشاء نظام قوالب التقارير للتصدير

  1. جداول جديدة
    - `export_report_templates`
      - `id` (uuid، مفتاح أساسي)
      - `name` (text، اسم التقرير)
      - `description` (text، وصف التقرير - اختياري)
      - `selected_fields` (jsonb، الحقول المختارة)
      - `selected_service_fields` (jsonb، حقول الخدمة المختارة)
      - `export_format` (text، صيغة التصدير - excel أو pdf)
      - `service_id` (text، معرف الخدمة المرتبطة - اختياري)
      - `service_type` (text، نوع الخدمة - primary أو subcategory)
      - `created_by` (uuid، معرف المستخدم الذي أنشأ القالب)
      - `is_public` (boolean، هل القالب عام أم خاص)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على `export_report_templates`
    - السماح للموظفين المصادق عليهم بقراءة القوالب العامة أو قوالبهم الخاصة
    - السماح للموظفين بإنشاء وتعديل وحذف قوالبهم الخاصة
    - السماح للمسؤولين بإدارة جميع القوالب
*/

-- إنشاء جدول قوالب التقارير
CREATE TABLE IF NOT EXISTS export_report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  selected_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_service_fields jsonb DEFAULT '[]'::jsonb,
  export_format text NOT NULL DEFAULT 'excel' CHECK (export_format IN ('excel', 'pdf')),
  service_id text,
  service_type text CHECK (service_type IN ('primary', 'subcategory', 'all')),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_export_templates_created_by ON export_report_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_export_templates_service_id ON export_report_templates(service_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_is_public ON export_report_templates(is_public);

-- تفعيل RLS
ALTER TABLE export_report_templates ENABLE ROW LEVEL SECURITY;

-- سياسات RLS

-- قراءة: يمكن للمستخدمين قراءة القوالب العامة أو قوالبهم الخاصة
CREATE POLICY "Users can read public templates or their own"
  ON export_report_templates
  FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    created_by = auth.uid()
  );

-- إنشاء: يمكن للمستخدمين المصادق عليهم إنشاء قوالب
CREATE POLICY "Authenticated users can create templates"
  ON export_report_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- تحديث: يمكن للمستخدمين تحديث قوالبهم الخاصة فقط
CREATE POLICY "Users can update their own templates"
  ON export_report_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- حذف: يمكن للمستخدمين حذف قوالبهم الخاصة فقط
CREATE POLICY "Users can delete their own templates"
  ON export_report_templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- سياسات للمسؤولين

-- قراءة: يمكن للمسؤولين قراءة جميع القوالب
CREATE POLICY "Admins can read all templates"
  ON export_report_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- تحديث: يمكن للمسؤولين تحديث جميع القوالب
CREATE POLICY "Admins can update all templates"
  ON export_report_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- حذف: يمكن للمسؤولين حذف جميع القوالب
CREATE POLICY "Admins can delete all templates"
  ON export_report_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_export_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المحفز
DROP TRIGGER IF EXISTS update_export_templates_updated_at_trigger ON export_report_templates;
CREATE TRIGGER update_export_templates_updated_at_trigger
  BEFORE UPDATE ON export_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_export_templates_updated_at();
