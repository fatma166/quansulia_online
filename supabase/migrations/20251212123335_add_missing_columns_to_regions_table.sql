/*
  # إضافة الأعمدة الناقصة لجدول المناطق

  1. التغييرات
    - إضافة عمود code (كود المنطقة) إلى جدول regions
    - إضافة عمود is_active (حالة التفعيل) إلى جدول regions
    - تحديث البيانات الموجودة بقيم افتراضية
  
  2. الأمان
    - التحقق من عدم وجود الأعمدة قبل الإضافة
    - إضافة قيم افتراضية مناسبة
*/

-- إضافة عمود code إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'regions' AND column_name = 'code'
  ) THEN
    ALTER TABLE regions ADD COLUMN code text;
    -- تحديث القيم الموجودة: استخدام key كـ code
    UPDATE regions SET code = key WHERE code IS NULL;
    -- جعل العمود NOT NULL بعد تحديث البيانات
    ALTER TABLE regions ALTER COLUMN code SET NOT NULL;
  END IF;
END $$;

-- إضافة عمود is_active إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'regions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE regions ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;
