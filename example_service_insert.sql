/*
  مثال على إضافة خدمة جديدة إلى قاعدة البيانات

  هذا المثال يوضح كيفية إضافة خدمة "استخراج شهادة ميلاد" كاملة
  بما في ذلك الحقول والمتطلبات والمستندات
*/

-- ======================================
-- 1. إضافة الخدمة الأساسية
-- ======================================

INSERT INTO services (
  slug,
  name_ar,
  name_en,
  description_ar,
  description_en,
  icon,
  category,
  fees,
  duration,
  is_active,
  order_index
) VALUES (
  'birth-certificate',
  'استخراج شهادة ميلاد',
  'Birth Certificate',
  'خدمة استخراج شهادة ميلاد سودانية للمواليد في المملكة العربية السعودية',
  'Service for obtaining Sudanese birth certificates for births in Saudi Arabia',
  'FileText',
  'documents',
  '{"base": 150, "currency": "ر.س"}',
  '5-7 أيام عمل',
  true,
  5
);

-- احصل على معرف الخدمة
-- في الحياة الواقعية، استخدم RETURNING id أو استعلم عن الخدمة بعد الإدراج

-- ======================================
-- 2. إضافة حقول النموذج
-- ======================================

-- الخطوة 1: معلومات المولود
INSERT INTO service_fields (
  service_id,
  step_id,
  step_title_ar,
  step_title_en,
  field_name,
  field_type,
  label_ar,
  label_en,
  placeholder_ar,
  placeholder_en,
  help_text_ar,
  help_text_en,
  is_required,
  validation_rules,
  order_index,
  is_active
)
SELECT
  id,
  'child-info',
  'معلومات المولود',
  'Child Information',
  'child_full_name',
  'text',
  'اسم المولود الرباعي',
  'Child Full Name',
  'أدخل اسم المولود الرباعي',
  'Enter child full name',
  'يجب أن يطابق الاسم المسجل في المستشفى',
  'Must match the name registered at the hospital',
  true,
  '{"minLength": 10, "pattern": "^[\\u0600-\\u06FF\\s]+$"}',
  1,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, order_index, is_active
)
SELECT
  id, 'child-info', 'معلومات المولود', 'Child Information',
  'birth_date', 'date', 'تاريخ الميلاد', 'Date of Birth',
  true, 2, true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en,
  is_required, order_index, is_active
)
SELECT
  id, 'child-info', 'معلومات المولود', 'Child Information',
  'birth_place', 'text', 'مكان الميلاد', 'Place of Birth',
  'المدينة والمستشفى', 'City and Hospital',
  true, 3, true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  options,
  is_required, order_index, is_active
)
SELECT
  id, 'child-info', 'معلومات المولود', 'Child Information',
  'child_gender', 'radio', 'الجنس', 'Gender',
  '[
    {"value": "male", "label": "ذكر"},
    {"value": "female", "label": "أنثى"}
  ]'::jsonb,
  true, 4, true
FROM services WHERE slug = 'birth-certificate';

-- الخطوة 2: معلومات الوالدين
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, order_index, is_active
)
SELECT
  id, 'parents-info', 'معلومات الوالدين', 'Parents Information',
  'father_full_name', 'text', 'اسم الأب الرباعي', 'Father Full Name',
  true, 1, true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  placeholder_ar, help_text_ar,
  is_required, order_index, is_active
)
SELECT
  id, 'parents-info', 'معلومات الوالدين', 'Parents Information',
  'father_passport', 'text', 'رقم جواز الأب', 'Father Passport Number',
  'P1234567', 'رقم جواز السفر السوداني',
  true, 2, true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, order_index, is_active
)
SELECT
  id, 'parents-info', 'معلومات الوالدين', 'Parents Information',
  'mother_full_name', 'text', 'اسم الأم الرباعي', 'Mother Full Name',
  true, 3, true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  placeholder_ar, help_text_ar,
  is_required, order_index, is_active
)
SELECT
  id, 'parents-info', 'معلومات الوالدين', 'Parents Information',
  'mother_passport', 'text', 'رقم جواز الأم', 'Mother Passport Number',
  'P1234567', 'رقم جواز السفر السوداني',
  true, 4, true
FROM services WHERE slug = 'birth-certificate';

-- ======================================
-- 3. إضافة المتطلبات
-- ======================================

INSERT INTO service_requirements (
  service_id,
  requirement_ar,
  requirement_en,
  order_index,
  is_active
)
SELECT
  id,
  'صورة من جواز سفر الأب ساري المفعول',
  'Copy of father''s valid passport',
  1,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_requirements (
  service_id,
  requirement_ar,
  requirement_en,
  order_index,
  is_active
)
SELECT
  id,
  'صورة من جواز سفر الأم ساري المفعول',
  'Copy of mother''s valid passport',
  2,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_requirements (
  service_id,
  requirement_ar,
  requirement_en,
  order_index,
  is_active
)
SELECT
  id,
  'شهادة ميلاد من المستشفى (النسخة الأصلية)',
  'Original birth certificate from hospital',
  3,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_requirements (
  service_id,
  requirement_ar,
  requirement_en,
  order_index,
  is_active
)
SELECT
  id,
  'صورة من عقد الزواج',
  'Copy of marriage contract',
  4,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_requirements (
  service_id,
  requirement_ar,
  requirement_en,
  order_index,
  is_active
)
SELECT
  id,
  'صورة من الإقامة سارية المفعول للأب',
  'Copy of father''s valid residence permit',
  5,
  true
FROM services WHERE slug = 'birth-certificate';

-- ======================================
-- 4. إضافة المستندات المطلوبة
-- ======================================

INSERT INTO service_documents (
  service_id,
  document_name_ar,
  document_name_en,
  description_ar,
  description_en,
  is_required,
  max_size_mb,
  accepted_formats,
  order_index,
  is_active
)
SELECT
  id,
  'جواز سفر الأب',
  'Father Passport',
  'صورة واضحة من جواز سفر الأب (الصفحة الأولى)',
  'Clear copy of father''s passport (first page)',
  true,
  5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  1,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_documents (
  service_id,
  document_name_ar,
  document_name_en,
  description_ar,
  description_en,
  is_required,
  max_size_mb,
  accepted_formats,
  order_index,
  is_active
)
SELECT
  id,
  'جواز سفر الأم',
  'Mother Passport',
  'صورة واضحة من جواز سفر الأم (الصفحة الأولى)',
  'Clear copy of mother''s passport (first page)',
  true,
  5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  2,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_documents (
  service_id,
  document_name_ar,
  document_name_en,
  description_ar,
  description_en,
  is_required,
  max_size_mb,
  accepted_formats,
  order_index,
  is_active
)
SELECT
  id,
  'شهادة الميلاد من المستشفى',
  'Hospital Birth Certificate',
  'النسخة الأصلية من شهادة الميلاد الصادرة من المستشفى',
  'Original birth certificate issued by the hospital',
  true,
  5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  3,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_documents (
  service_id,
  document_name_ar,
  document_name_en,
  description_ar,
  description_en,
  is_required,
  max_size_mb,
  accepted_formats,
  order_index,
  is_active
)
SELECT
  id,
  'عقد الزواج',
  'Marriage Contract',
  'صورة من عقد الزواج موثق',
  'Copy of authenticated marriage contract',
  true,
  5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  4,
  true
FROM services WHERE slug = 'birth-certificate';

INSERT INTO service_documents (
  service_id,
  document_name_ar,
  document_name_en,
  description_ar,
  is_required,
  max_size_mb,
  accepted_formats,
  order_index,
  is_active
)
SELECT
  id,
  'الإقامة',
  'Residence Permit',
  'صورة من الإقامة السعودية سارية المفعول للأب',
  true,
  5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  5,
  true
FROM services WHERE slug = 'birth-certificate';

-- ======================================
-- تم! الخدمة جاهزة للاستخدام
-- ======================================

-- للتحقق من إضافة الخدمة بنجاح:
SELECT
  s.name_ar,
  COUNT(DISTINCT sf.id) as fields_count,
  COUNT(DISTINCT sr.id) as requirements_count,
  COUNT(DISTINCT sd.id) as documents_count
FROM services s
LEFT JOIN service_fields sf ON sf.service_id = s.id
LEFT JOIN service_requirements sr ON sr.service_id = s.id
LEFT JOIN service_documents sd ON sd.service_id = s.id
WHERE s.slug = 'birth-certificate'
GROUP BY s.id, s.name_ar;
