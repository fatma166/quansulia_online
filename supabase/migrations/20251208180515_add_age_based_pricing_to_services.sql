/*
  # إضافة نظام الأسعار المتعددة حسب العمر للخدمات

  1. التعديلات
    - إضافة حقل `has_age_based_pricing` (boolean) - هل الخدمة لها أسعار متعددة؟
    - إضافة حقل `price_under_18` (numeric) - سعر الخدمة لأقل من 18 سنة
    - إضافة حقل `price_18_and_above` (numeric) - سعر الخدمة لـ 18 سنة فأكثر
    - الحقل `price` الحالي سيبقى للسعر الموحد

  2. ملاحظات
    - القيم الافتراضية:
      * `has_age_based_pricing` = false (سعر موحد بشكل افتراضي)
      * `price_under_18` و `price_18_and_above` = NULL (فقط عند التفعيل)
    - عند تفعيل `has_age_based_pricing`، يجب ملء الحقلين الجديدين
    - عند عدم التفعيل، يُستخدم `price` الموحد
*/

-- إضافة الأعمدة الجديدة
ALTER TABLE services
ADD COLUMN IF NOT EXISTS has_age_based_pricing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_under_18 NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS price_18_and_above NUMERIC(10, 2);

-- إضافة تعليق للأعمدة
COMMENT ON COLUMN services.has_age_based_pricing IS 'هل الخدمة لها أسعار متعددة حسب العمر؟';
COMMENT ON COLUMN services.price_under_18 IS 'سعر الخدمة لأقل من 18 سنة';
COMMENT ON COLUMN services.price_18_and_above IS 'سعر الخدمة لـ 18 سنة فأكثر';

-- إنشاء constraint للتأكد من صحة البيانات:
-- إذا كانت has_age_based_pricing = true، يجب أن يكون السعرين موجودين
ALTER TABLE services
ADD CONSTRAINT check_age_based_pricing_values
CHECK (
  (has_age_based_pricing = false) OR 
  (has_age_based_pricing = true AND price_under_18 IS NOT NULL AND price_18_and_above IS NOT NULL)
);
