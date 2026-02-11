/*
  # إضافة أعمدة التخطيط والتنسيق للحقول

  1. New Columns
    - `field_width` (text) - عرض الحقل (full, half, third, two-thirds, quarter, three-quarters)
    - `field_height` (text) - ارتفاع الحقل (small, medium, large, xlarge)
    - `field_margin` (text) - المسافة الخارجية (none, small, normal, large)
    - `break_line` (boolean) - بداية سطر جديد

  2. Changes
    - إضافة أعمدة جديدة لجدول service_fields للتحكم في تخطيط وعرض الحقول
    - القيم الافتراضية: field_width='full', field_height='medium', field_margin='normal', break_line=false
*/

-- إضافة عمود عرض الحقل
ALTER TABLE service_fields 
ADD COLUMN IF NOT EXISTS field_width text DEFAULT 'full' CHECK (field_width IN ('full', 'half', 'third', 'two-thirds', 'quarter', 'three-quarters'));

-- إضافة عمود ارتفاع الحقل
ALTER TABLE service_fields 
ADD COLUMN IF NOT EXISTS field_height text DEFAULT 'medium' CHECK (field_height IN ('small', 'medium', 'large', 'xlarge'));

-- إضافة عمود المسافة الخارجية
ALTER TABLE service_fields 
ADD COLUMN IF NOT EXISTS field_margin text DEFAULT 'normal' CHECK (field_margin IN ('none', 'small', 'normal', 'large'));

-- إضافة عمود بداية سطر جديد
ALTER TABLE service_fields 
ADD COLUMN IF NOT EXISTS break_line boolean DEFAULT false;

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN service_fields.field_width IS 'عرض الحقل في التخطيط (full=100%, half=50%, third=33%, two-thirds=66%, quarter=25%, three-quarters=75%)';
COMMENT ON COLUMN service_fields.field_height IS 'ارتفاع الحقل للحقول المخصصة (textarea, file)';
COMMENT ON COLUMN service_fields.field_margin IS 'المسافة الخارجية للحقل';
COMMENT ON COLUMN service_fields.break_line IS 'هل يبدأ الحقل في سطر جديد';