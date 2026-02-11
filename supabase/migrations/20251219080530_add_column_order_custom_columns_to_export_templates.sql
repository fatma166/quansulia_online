/*
  # إضافة ترتيب الأعمدة والأعمدة المخصصة للتقارير

  1. التغييرات
    - إضافة عمود column_order لحفظ ترتيب الأعمدة
    - إضافة عمود custom_columns لحفظ الأعمدة المخصصة بأسمائها وقيمها
  
  2. الملاحظات
    - column_order: مصفوفة JSON تحتوي على كائنات بنوع العمود ومفتاحه
    - custom_columns: مصفوفة JSON تحتوي على كائنات بالاسم والقيمة
*/

-- إضافة الأعمدة الجديدة
ALTER TABLE export_report_templates 
ADD COLUMN IF NOT EXISTS column_order jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS custom_columns jsonb DEFAULT '[]'::jsonb;

-- إضافة تعليق للأعمدة الجديدة
COMMENT ON COLUMN export_report_templates.column_order IS 'ترتيب الأعمدة في التقرير: [{type: "basic"|"service"|"custom", key: "field_key"}]';
COMMENT ON COLUMN export_report_templates.custom_columns IS 'الأعمدة المخصصة: [{name: "اسم العمود", value: "القيمة الثابتة"}]';
