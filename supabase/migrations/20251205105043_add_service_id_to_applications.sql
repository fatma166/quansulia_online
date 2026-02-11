/*
  # إضافة service_id إلى جدول applications
  
  ## التعديلات
  
  1. إضافة عمود service_id إلى جدول applications
     - `service_id` - معرف الخدمة (مرجع لجدول services)
  
  2. إضافة service_type_id (اختياري)
     - `service_type_id` - معرف نوع الخدمة الفرعية
  
  3. إنشاء index لتحسين الأداء
*/

-- إضافة service_id إلى جدول applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE applications ADD COLUMN service_id uuid REFERENCES services(id) ON DELETE SET NULL;
  END IF;
END $$;

-- إضافة service_type_id إلى جدول applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'service_type_id'
  ) THEN
    ALTER TABLE applications ADD COLUMN service_type_id uuid REFERENCES service_types(id) ON DELETE SET NULL;
  END IF;
END $$;

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS idx_applications_service_id ON applications(service_id);
CREATE INDEX IF NOT EXISTS idx_applications_service_type_id ON applications(service_type_id);