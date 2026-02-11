/*
  # إضافة منطق الشروط للمتطلبات والمرفقات
  
  1. التعديلات
    - إضافة حقل `conditions` إلى جدول `service_requirements`
    - إضافة حقل `conditions` إلى جدول `service_documents`
    - الحقل يحتوي على شروط JSON للتحكم في ظهور المتطلب/المرفق
  
  2. هيكل الشروط
    ```json
    {
      "show_when": [
        {
          "field": "service_type",
          "operator": "equals",
          "value": "real-estate"
        }
      ],
      "logic": "AND" // أو "OR"
    }
    ```
*/

-- إضافة حقل الشروط إلى جدول المتطلبات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requirements' AND column_name = 'conditions'
  ) THEN
    ALTER TABLE service_requirements ADD COLUMN conditions jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- إضافة حقل الشروط إلى جدول المرفقات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_documents' AND column_name = 'conditions'
  ) THEN
    ALTER TABLE service_documents ADD COLUMN conditions jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- إضافة حقل الشروط إلى جدول الحقول
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_fields' AND column_name = 'conditions'
  ) THEN
    ALTER TABLE service_fields ADD COLUMN conditions jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN service_requirements.conditions IS 'شروط ظهور المتطلب بناءً على قيم الحقول الأخرى';
COMMENT ON COLUMN service_documents.conditions IS 'شروط ظهور المرفق بناءً على قيم الحقول الأخرى';
COMMENT ON COLUMN service_fields.conditions IS 'شروط ظهور الحقل بناءً على قيم الحقول الأخرى';
