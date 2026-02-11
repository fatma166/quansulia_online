/*
  # إصلاح العلاقة الخارجية للمنطقة في جدول الموظفين

  1. التغييرات
    - حذف العلاقة الخارجية القديمة التي تشير إلى old_regions
    - إضافة علاقة خارجية جديدة تشير إلى regions
  
  2. الأمان
    - التحقق من وجود العلاقة قبل الحذف
    - التأكد من عدم وجود بيانات يتيمة
*/

-- حذف العلاقة القديمة
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_region_id_fkey;

-- إضافة العلاقة الجديدة الصحيحة
ALTER TABLE staff
ADD CONSTRAINT staff_region_id_fkey
FOREIGN KEY (region_id) REFERENCES regions(id)
ON DELETE SET NULL;
