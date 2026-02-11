/*
  # إضافة دعم للحقول الديناميكية (Dynamic List Fields)

  ## الجداول الجديدة
  
  ### service_dynamic_list_fields
  حقول القوائم الديناميكية
  
  ## التعديلات
  
  ### service_field_conditions
  إضافة دعم لشروط متعددة (AND/OR)

  ## الأمان
  - تفعيل RLS
  - السماح للمصادقين بالإدارة (يمكن تخصيصه لاحقاً)
  - السماح للجميع بالقراءة
*/

-- إنشاء جدول service_dynamic_list_fields
CREATE TABLE IF NOT EXISTS service_dynamic_list_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_field_id uuid NOT NULL REFERENCES service_fields(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  label_ar text NOT NULL,
  label_en text DEFAULT '',
  is_required boolean DEFAULT false,
  order_index int DEFAULT 0,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  options jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- إضافة حقول جديدة لجدول service_field_conditions لدعم الشروط المعقدة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_field_conditions' AND column_name = 'condition_group'
  ) THEN
    ALTER TABLE service_field_conditions ADD COLUMN condition_group text DEFAULT 'default';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_field_conditions' AND column_name = 'condition_logic'
  ) THEN
    ALTER TABLE service_field_conditions ADD COLUMN condition_logic text DEFAULT 'AND';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_field_conditions' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE service_field_conditions ADD COLUMN order_index int DEFAULT 0;
  END IF;
END $$;

-- إنشاء Index للأداء
CREATE INDEX IF NOT EXISTS idx_service_dynamic_list_fields_parent ON service_dynamic_list_fields(parent_field_id);

-- تفعيل RLS
ALTER TABLE service_dynamic_list_fields ENABLE ROW LEVEL SECURITY;

-- سياسات RLS: السماح للجميع بالقراءة
CREATE POLICY "Anyone can view dynamic list fields"
  ON service_dynamic_list_fields FOR SELECT
  USING (true);

-- سياسات RLS: السماح للمصادقين بالإدارة
CREATE POLICY "Authenticated users can manage dynamic list fields"
  ON service_dynamic_list_fields FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);