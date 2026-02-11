/*
  # إضافة دعم الخدمات الخارجية

  1. التغييرات
    - إضافة عمود `is_external` (boolean) لجدول `services`
      - قيمة افتراضية: false
      - يحدد إذا كانت الخدمة خارجية أم داخلية
    
    - إضافة عمود `external_url` (text) لجدول `services`
      - nullable: يحتوي على رابط الخدمة الخارجية
      - يستخدم فقط عندما تكون is_external = true
  
  2. الملاحظات
    - الخدمات الخارجية ستفتح في تاب جديد عند الضغط عليها
    - الخدمات الداخلية تعمل بشكل طبيعي
*/

-- إضافة عمود is_external
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'is_external'
  ) THEN
    ALTER TABLE services ADD COLUMN is_external boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- إضافة عمود external_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'external_url'
  ) THEN
    ALTER TABLE services ADD COLUMN external_url text;
  END IF;
END $$;