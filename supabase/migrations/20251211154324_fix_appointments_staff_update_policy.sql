/*
  # إصلاح صلاحيات تحديث المواعيد للموظفين
  
  1. المشكلة
    - الـ policy "Staff can manage appointments" لا تحتوي على WITH CHECK
    - هذا يمنع الموظفين من تحديث حالة المواعيد
  
  2. الحل
    - حذف الـ policy القديمة وإعادة إنشائها مع WITH CHECK
    - السماح للموظفين بتحديث جميع الحقول
*/

-- حذف الـ policy القديمة
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;

-- إنشاء policy جديدة للموظفين مع صلاحيات كاملة
CREATE POLICY "Staff can manage appointments"
  ON appointments
  FOR ALL
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
