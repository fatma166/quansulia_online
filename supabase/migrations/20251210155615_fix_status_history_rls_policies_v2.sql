/*
  # إصلاح RLS policies لجدول status_history

  1. المشكلة
    - Policy "Staff can manage status history" ليس لها WITH CHECK clause
    - هذا يمنع الموظفين من إضافة سجلات جديدة في status_history

  2. الحل
    - حذف جميع الـ policies القديمة
    - إنشاء policies منفصلة لكل عملية (SELECT, INSERT, UPDATE, DELETE)
    - إضافة WITH CHECK clause مناسبة لكل policy

  3. الأمان
    - الموظفون المصادق عليهم يمكنهم إدارة سجلات الحالة
    - الجميع يمكنهم مشاهدة سجلات الحالة
*/

-- حذف جميع الـ policies القديمة
DROP POLICY IF EXISTS "Anyone can view status history" ON status_history;
DROP POLICY IF EXISTS "Staff can manage status history" ON status_history;

-- policy للقراءة (الكل يقدر يشوف)
CREATE POLICY "Anyone can view status history"
  ON status_history
  FOR SELECT
  TO public
  USING (true);

-- policy للإضافة (الموظفون فقط)
CREATE POLICY "Staff can insert status history"
  ON status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
    )
  );

-- policy للتحديث (الموظفون فقط)
CREATE POLICY "Staff can update status history"
  ON status_history
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

-- policy للحذف (الموظفون فقط)
CREATE POLICY "Staff can delete status history"
  ON status_history
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.user_id = auth.uid()
    )
  );
