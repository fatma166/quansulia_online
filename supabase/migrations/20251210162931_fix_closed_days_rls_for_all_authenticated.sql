/*
  # إصلاح صلاحيات جدول closed_days
  
  1. التغييرات
    - السماح لجميع المستخدمين المصرح لهم (authenticated) بإدارة الأيام المغلقة
    - إزالة الشرط الذي يتطلب وجود المستخدم في جدول staff فقط
  
  2. السبب
    - المستخدمون الـ admins لا يظهرون في جدول staff
    - إدارة الأيام المغلقة يجب أن تكون متاحة لكل المستخدمين المصرح لهم
*/

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Staff can insert closed days" ON closed_days;
DROP POLICY IF EXISTS "Staff can update closed days" ON closed_days;
DROP POLICY IF EXISTS "Staff can delete closed days" ON closed_days;

-- إنشاء policies جديدة للمستخدمين المصرح لهم
CREATE POLICY "Authenticated users can insert closed days"
  ON closed_days
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update closed days"
  ON closed_days
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete closed days"
  ON closed_days
  FOR DELETE
  TO authenticated
  USING (true);
