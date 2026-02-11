/*
  # إنشاء نظام ملاحظات الطلبات

  1. جدول جديد
    - `application_notes`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `note_type` (text) - نوع الملاحظة: note, comment, internal_note
      - `title` (text) - عنوان الملاحظة
      - `content` (text) - محتوى الملاحظة
      - `created_by_staff_id` (uuid) - معرف الموظف الذي أضاف الملاحظة
      - `created_by_staff_name` (text) - اسم الموظف
      - `is_visible_to_user` (boolean) - هل الملاحظة مرئية للمستخدم؟
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. الأمان
    - تفعيل RLS على الجدول
    - سياسات للموظفين لقراءة وكتابة الملاحظات
*/

-- إنشاء جدول ملاحظات الطلبات
CREATE TABLE IF NOT EXISTS application_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  note_type text NOT NULL DEFAULT 'note' CHECK (note_type IN ('note', 'comment', 'internal_note', 'system_note')),
  title text NOT NULL,
  content text,
  created_by_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  created_by_staff_name text NOT NULL,
  created_by_staff_email text,
  is_visible_to_user boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_created_by ON application_notes(created_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_created_at ON application_notes(created_at DESC);

-- تفعيل RLS
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: يمكن للموظفين المصادقين قراءة جميع الملاحظات
CREATE POLICY "Authenticated staff can read all notes"
  ON application_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة الإضافة: يمكن للموظفين المصادقين إضافة ملاحظات
CREATE POLICY "Authenticated staff can insert notes"
  ON application_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة التحديث: يمكن للموظف تحديث ملاحظاته الخاصة فقط
CREATE POLICY "Staff can update own notes"
  ON application_notes
  FOR UPDATE
  TO authenticated
  USING (
    created_by_staff_id IN (
      SELECT id FROM staff WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    created_by_staff_id IN (
      SELECT id FROM staff WHERE user_id = auth.uid()
    )
  );

-- سياسة الحذف: يمكن للموظف حذف ملاحظاته الخاصة فقط
CREATE POLICY "Staff can delete own notes"
  ON application_notes
  FOR DELETE
  TO authenticated
  USING (
    created_by_staff_id IN (
      SELECT id FROM staff WHERE user_id = auth.uid()
    )
  );

-- إضافة تعليق على الجدول
COMMENT ON TABLE application_notes IS 'جدول لحفظ ملاحظات وأنشطة الموظفين على الطلبات';
COMMENT ON COLUMN application_notes.note_type IS 'نوع الملاحظة: note (ملاحظة عامة), comment (تعليق), internal_note (ملاحظة داخلية), system_note (ملاحظة نظام)';
COMMENT ON COLUMN application_notes.is_visible_to_user IS 'هل الملاحظة مرئية للمستخدم المتقدم؟';
