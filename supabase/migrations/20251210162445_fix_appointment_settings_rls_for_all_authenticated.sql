/*
  # إصلاح صلاحيات جدول appointment_settings
  
  1. التغييرات
    - السماح لجميع المستخدمين المصرح لهم (authenticated) بتعديل الإعدادات
    - إزالة الشرط الذي يتطلب وجود المستخدم في جدول staff فقط
  
  2. السبب
    - المستخدمون الـ admins لا يظهرون في جدول staff
    - الإعدادات يجب أن تكون قابلة للتعديل من أي مستخدم مصرح له
*/

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Staff can update appointment settings" ON appointment_settings;
DROP POLICY IF EXISTS "Staff can insert appointment settings" ON appointment_settings;
DROP POLICY IF EXISTS "Staff can delete appointment settings" ON appointment_settings;

-- إنشاء policies جديدة للمستخدمين المصرح لهم
CREATE POLICY "Authenticated users can update appointment settings"
  ON appointment_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert appointment settings"
  ON appointment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointment settings"
  ON appointment_settings
  FOR DELETE
  TO authenticated
  USING (true);
