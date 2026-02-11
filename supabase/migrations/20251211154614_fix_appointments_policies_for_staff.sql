/*
  # إصلاح صلاحيات المواعيد للموظفين
  
  1. المشكلة
    - Policy "Anyone can cancel appointments" تمنع تحديث الحالة إلى أي شيء غير "cancelled"
    - هذا يتعارض مع صلاحيات الموظفين
  
  2. الحل
    - حذف policy "Anyone can cancel appointments"
    - الاحتفاظ فقط بـ policy الموظفين التي تسمح لهم بتحديث جميع الحالات
*/

-- حذف الـ policy التي تقيد التحديث
DROP POLICY IF EXISTS "Anyone can cancel appointments" ON appointments;

-- التأكد من وجود policy الموظفين بشكل صحيح
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;

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

-- إضافة policy محدثة للمستخدمين العاديين للإلغاء فقط (إذا احتجنا لها لاحقاً)
-- يمكن إعادة تفعيلها عند الحاجة
