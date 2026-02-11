/*
  # إصلاح نهائي لصلاحيات تحديث المواعيد
  
  1. المشكلة
    - استخدام "FOR ALL" قد يسبب تعارضات
    - نحتاج policies منفصلة لكل عملية
  
  2. الحل
    - حذف جميع الـ policies الحالية
    - إنشاء policies منفصلة لكل عملية (SELECT, INSERT, UPDATE, DELETE)
    - التأكد من أن الموظفين يمكنهم تحديث المواعيد
*/

-- حذف جميع الـ policies الحالية
DROP POLICY IF EXISTS "Anyone can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;

-- Policy للقراءة: الجميع يمكنهم قراءة المواعيد
CREATE POLICY "Anyone can view appointments"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

-- Policy للإضافة: الجميع يمكنهم إنشاء مواعيد
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy للتحديث: فقط الموظفين
CREATE POLICY "Staff can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy للحذف: فقط الموظفين
CREATE POLICY "Staff can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );
