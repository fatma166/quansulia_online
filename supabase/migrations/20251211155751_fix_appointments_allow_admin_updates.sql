/*
  # السماح للأدمن والموظفين بتحديث المواعيد
  
  1. المشكلة
    - الأدمن يستخدم حساب Supabase Auth منفصل وليس في جدول staff
    - الموظفون في جدول staff
    - الـ policies الحالية تسمح فقط للموظفين في جدول staff
  
  2. الحل
    - السماح لأي مستخدم مُصادق (authenticated) بتحديث المواعيد
    - هذا يشمل الأدمن والموظفين
*/

-- حذف الـ policies الحالية للتحديث
DROP POLICY IF EXISTS "Staff can update appointments" ON appointments;

-- Policy جديد للتحديث: أي مستخدم مُصادق يمكنه التحديث
CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
