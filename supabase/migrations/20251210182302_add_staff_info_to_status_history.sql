/*
  # إضافة معلومات الموظف إلى سجل تغيير الحالات

  1. التغييرات
    - إضافة حقل `staff_id` (uuid) - مرجع للموظف الذي غيّر الحالة
    - إضافة حقل `old_status_label` (text) - التسمية العربية للحالة القديمة
    - إضافة حقل `new_status_label` (text) - التسمية العربية للحالة الجديدة
    - إضافة حقل `changed_at` (timestamp) - وقت التغيير
    - تحديث حقل `changed_by` ليكون text بدلاً من uuid (لحفظ اسم الموظف)

  2. الهدف
    - تسجيل كامل معلومات الموظف الذي قام بتغيير الحالة
    - عرض التسميات العربية للحالات في سجل النشاطات
    - تسجيل التوقيت الدقيق لكل تغيير

  3. الأمان
    - لا تغيير في RLS policies
    - Foreign key constraint على staff_id
*/

-- Add new columns to status_history
DO $$
BEGIN
  -- Add staff_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'status_history' AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE status_history ADD COLUMN staff_id uuid REFERENCES staff(id) ON DELETE SET NULL;
  END IF;

  -- Add old_status_label column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'status_history' AND column_name = 'old_status_label'
  ) THEN
    ALTER TABLE status_history ADD COLUMN old_status_label text;
  END IF;

  -- Add new_status_label column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'status_history' AND column_name = 'new_status_label'
  ) THEN
    ALTER TABLE status_history ADD COLUMN new_status_label text;
  END IF;

  -- Add changed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'status_history' AND column_name = 'changed_at'
  ) THEN
    ALTER TABLE status_history ADD COLUMN changed_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update changed_by column to allow text (staff name)
ALTER TABLE status_history ALTER COLUMN changed_by TYPE text;

-- Create index on staff_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_status_history_staff_id ON status_history(staff_id);

-- Update the trigger function to disable automatic logging (we'll do it manually with staff info)
DROP TRIGGER IF EXISTS trigger_log_status_change ON applications;
