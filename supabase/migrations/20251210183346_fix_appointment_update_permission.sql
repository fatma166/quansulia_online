/*
  # إصلاح صلاحيات إلغاء الموعد
  
  1. المشكلة
    - المستخدمون لا يمكنهم إلغاء مواعيدهم
    - لا توجد policy تسمح بـ UPDATE للمستخدمين العاديين
  
  2. الحل
    - إضافة policy تسمح للجميع بتحديث حالة الموعد إلى 'cancelled'
*/

-- Allow anyone to cancel their appointments
DROP POLICY IF EXISTS "Anyone can cancel appointments" ON appointments;

CREATE POLICY "Anyone can cancel appointments"
  ON appointments
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (status = 'cancelled');
