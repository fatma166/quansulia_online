/*
  # تحديث خدمة جوازات السفر مع الشروط الصحيحة
  
  1. الخطوات
    - حذف البيانات القديمة للحقول والمتطلبات والمستندات
    - إضافة الحقول مع الشروط الصحيحة من config.js
    - إضافة المستندات مع شروطها المعقدة (AND/OR operators)
    - إضافة المتطلبات حسب الأنواع المختلفة
  
  2. الشروط المطبقة
    - شروط بسيطة: حقل واحد مع قيم محددة
    - شروط معقدة: عدة حقول مع operators (AND/OR)
    
  3. الأمان
    - تطبيق على خدمة محددة فقط (passports)
    - استخدام IF EXISTS لتجنب الأخطاء
*/

-- الخطوة 1: حذف البيانات القديمة للخدمة
DELETE FROM service_documents WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b';
DELETE FROM service_requirements WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b';
DELETE FROM service_dynamic_list_fields WHERE parent_field_id IN (
  SELECT id FROM service_fields WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b'
);
DELETE FROM service_fields WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b';

-- الخطوة 2: إضافة الحقول مع الشروط
-- Step: details - تفاصيل الجواز

-- حقل: هل المتقدم بالغ
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, is_required, validation_rules, options, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز', 'Passport Details',
  'isAdult', 'radio',
  'هل المتقدم بالغ (18 سنة فأكثر)؟', 'Is the applicant an adult (18 years or older)?',
  true,
  '{"required": "يرجى تحديد العمر"}'::jsonb,
  '[{"value": "yes", "label": "نعم"}, {"value": "no", "label": "لا"}]'::jsonb,
  0,
  '{}'::jsonb
);

-- حقل: إحضار خطاب عدم ممانعة (يظهر فقط للقصر)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, help_text_ar, is_required, validation_rules, options, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز', 'Passport Details',
  'parentConsent', 'radio',
  'إحضار خطاب عدم ممانعة من الوالد', 'Parent consent letter',
  'مطلوب فقط في حالة الإصدار لأول مرة وعدم حضور الوالد',
  true,
  '{"required": "يرجى تحديد الخيار المناسب"}'::jsonb,
  '[{"value": "yes", "label": "نعم، سيتم إحضاره"}, {"value": "no", "label": "لا حاجة، الوالد سيحضر شخصياً"}]'::jsonb,
  1,
  '{"field": "isAdult", "operator": "equals", "values": ["no"]}'::jsonb
);

-- حقل: نوع الطلب
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, is_required, validation_rules, options, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز', 'Passport Details',
  'passportType', 'radio',
  'نوع الطلب', 'Request Type',
  true,
  '{"required": "نوع الطلب مطلوب"}'::jsonb,
  '[
    {"value": "new", "label": "جواز جديد", "description": "إصدار جواز سفر جديد"},
    {"value": "renewal", "label": "تجديد", "description": "تجديد جواز سفر منتهي الصلاحية"},
    {"value": "replacement", "label": "بدل فاقد", "description": "بدل فاقد أو تالف"},
    {"value": "emergency", "label": "وثيقة سفر اضطرارية", "description": "وثيقة سفر مؤقتة للحالات الطارئة"}
  ]'::jsonb,
  2,
  '{}'::jsonb
);

-- حقل: رقم الجواز القديم (للتجديد أو البدل)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, help_text_ar, is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز', 'Passport Details',
  'oldPassportNumber', 'text',
  'رقم الجواز القديم', 'Old Passport Number',
  'حرف كبير واحد باللغة الإنجليزية يتبعه أرقام (مثال: P12345678)',
  true,
  '{"required": "رقم الجواز القديم مطلوب", "pattern": "^[A-Z][0-9]{7,8}$"}'::jsonb,
  3,
  '{"field": "passportType", "operator": "in", "values": ["renewal", "replacement"]}'::jsonb
);

-- حقل: مكان الفقدان (للبدل فاقد)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز', 'Passport Details',
  'lossLocation', 'text',
  'مكان الفقدان', 'Loss Location',
  true,
  '{"required": "مكان الفقدان مطلوب"}'::jsonb,
  4,
  '{"field": "passportType", "operator": "equals", "values": ["replacement"]}'::jsonb
);

-- حقل: سبب طلب وثيقة السفر الاضطرارية
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, help_text_ar, is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز', 'Passport Details',
  'emergencyReason', 'textarea',
  'سبب طلب وثيقة السفر الاضطرارية', 'Emergency Travel Document Reason',
  'يرجى توضيح السبب الطارئ الذي يتطلب إصدار وثيقة سفر مؤقتة',
  true,
  '{"required": "سبب الطلب مطلوب"}'::jsonb,
  5,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
);

-- حقول خاصة بوثيقة السفر الاضطرارية
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, field_name, field_type,
  label_ar, is_required, validation_rules, order_index, conditions
) VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'birthPlace', 'text', 'محل الميلاد', true,
  '{"required": "محل الميلاد مطلوب"}'::jsonb,
  6,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'birthDate', 'date', 'تاريخ الميلاد', true,
  '{"required": "تاريخ الميلاد مطلوب"}'::jsonb,
  7,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'arrivalDate', 'date', 'تاريخ الوصول للمملكة', true,
  '{"required": "تاريخ الوصول للمملكة مطلوب"}'::jsonb,
  8,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'height', 'number', 'الطول (سم)', true,
  '{"required": "الطول مطلوب"}'::jsonb,
  9,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
);

-- حقل: لون العيون
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, field_name, field_type,
  label_ar, help_text_ar, is_required, validation_rules, options, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'eyeColor', 'select', 'لون العيون',
  'على المتقدم كتابة وصفه',
  true,
  '{"required": "لون العيون مطلوب"}'::jsonb,
  '[
    {"value": "black", "label": "أسود"},
    {"value": "brown", "label": "بني"},
    {"value": "green", "label": "أخضر"},
    {"value": "blue", "label": "أزرق"},
    {"value": "hazel", "label": "عسلي"},
    {"value": "other", "label": "أخرى"}
  ]'::jsonb,
  10,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
);

-- حقل: لون الشعر
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, field_name, field_type,
  label_ar, help_text_ar, is_required, validation_rules, options, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'hairColor', 'select', 'لون الشعر',
  'على المتقدم كتابة وصفه',
  true,
  '{"required": "لون الشعر مطلوب"}'::jsonb,
  '[
    {"value": "black", "label": "أسود"},
    {"value": "brown", "label": "بني"},
    {"value": "blonde", "label": "أشقر"},
    {"value": "gray", "label": "رمادي/شايب"},
    {"value": "red", "label": "أحمر"},
    {"value": "other", "label": "أخرى"}
  ]'::jsonb,
  11,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
);

-- حقل: العلامات المميزة
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, field_name, field_type,
  label_ar, help_text_ar, placeholder_ar, is_required, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'distinctiveMarks', 'textarea', 'العلامات المميزة',
  'أي علامات مميزة (مثل: شامة، ندبة، وشم، إلخ)',
  'اختياري',
  false,
  12,
  '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
);

-- حقل: أفراد العائلة (dynamic list)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, field_name, field_type,
  label_ar, is_required, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details', 'تفاصيل الجواز',
  'familyMembers', 'dynamic-list', 'أفراد العائلة',
  false,
  13,
  '{}'::jsonb
);

-- إضافة حقول dynamic list لأفراد العائلة
DO $$
DECLARE
  family_field_id uuid;
BEGIN
  SELECT id INTO family_field_id FROM service_fields 
  WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b' AND field_name = 'familyMembers';
  
  INSERT INTO service_dynamic_list_fields (parent_field_id, field_name, field_type, label_ar, label_en, is_required, order_index, validation_rules, options)
  VALUES
  (family_field_id, 'memberName', 'text', 'الاسم', 'Name', true, 0, '{"required": "الاسم مطلوب"}'::jsonb, '[]'::jsonb),
  (family_field_id, 'birthDay', 'select', 'اليوم', 'Day', true, 1, '{"required": "اليوم مطلوب"}'::jsonb, 
    (SELECT jsonb_agg(jsonb_build_object('value', n::text, 'label', n::text)) FROM generate_series(1, 31) n)),
  (family_field_id, 'birthMonth', 'select', 'الشهر', 'Month', true, 2, '{"required": "الشهر مطلوب"}'::jsonb,
    '[
      {"value": "1", "label": "يناير"},
      {"value": "2", "label": "فبراير"},
      {"value": "3", "label": "مارس"},
      {"value": "4", "label": "أبريل"},
      {"value": "5", "label": "مايو"},
      {"value": "6", "label": "يونيو"},
      {"value": "7", "label": "يوليو"},
      {"value": "8", "label": "أغسطس"},
      {"value": "9", "label": "سبتمبر"},
      {"value": "10", "label": "أكتوبر"},
      {"value": "11", "label": "نوفمبر"},
      {"value": "12", "label": "ديسمبر"}
    ]'::jsonb),
  (family_field_id, 'birthYear', 'select', 'السنة', 'Year', true, 3, '{"required": "السنة مطلوبة"}'::jsonb,
    (SELECT jsonb_agg(jsonb_build_object('value', y::text, 'label', y::text)) 
     FROM generate_series(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(YEAR FROM CURRENT_DATE)::int - 100, -1) y)),
  (family_field_id, 'memberRelationship', 'select', 'صلة القرابة', 'Relationship', true, 4, '{"required": "صلة القرابة مطلوبة"}'::jsonb,
    '[
      {"value": "son", "label": "ابن"},
      {"value": "daughter", "label": "ابنة"},
      {"value": "wife", "label": "زوجة"},
      {"value": "husband", "label": "زوج"},
      {"value": "mother", "label": "أم"},
      {"value": "father", "label": "أب"},
      {"value": "other", "label": "أخرى"}
    ]'::jsonb);
END $$;

-- الخطوة 3: إضافة المستندات مع الشروط المعقدة
-- Step: documents-upload - المستندات المطلوبة

-- مستند: صورة من الجواز (للبالغين - تجديد/بدل/وثيقة)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الجواز', 'Passport Copy',
  true, 5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  0,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["yes"]}, {"field": "passportType", "values": ["renewal", "replacement", "travel-document"]}]}'::jsonb
);

-- مستند: صورة من الرقم الوطني (للبالغين - جديد)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الرقم الوطني', 'National ID Copy',
  true, 5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  1,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["yes"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- مستند: صورة شخصية (للبالغين)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة شخصية', 'Personal Photo',
  true, 2,
  '["jpg", "jpeg", "png"]'::jsonb,
  2,
  '{"field": "isAdult", "operator": "equals", "values": ["yes"]}'::jsonb
);

-- مستند: صورة من الجواز (للقصر - جديد)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الجواز', 'Passport Copy',
  true, 5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  3,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- مستند: صورة من الجواز (للقصر - تجديد/بدل/وثيقة)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الجواز', 'Passport Copy',
  true, 5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  4,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["renewal", "replacement", "travel-document"]}]}'::jsonb
);

-- مستند: صورة جواز الأم (للقصر - جديد)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة جواز الأم', 'Mother Passport Copy',
  true, 5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  5,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- مستند: صورة جواز الأب (للقصر - جديد)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة جواز الأب', 'Father Passport Copy',
  true, 5,
  '["pdf", "jpg", "jpeg", "png"]'::jsonb,
  6,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- مستند: صورة شخصية (للقصر)
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, is_required, max_size_mb,
  accepted_formats, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة شخصية', 'Personal Photo',
  true, 2,
  '["jpg", "jpeg", "png"]'::jsonb,
  7,
  '{"field": "isAdult", "operator": "equals", "values": ["no"]}'::jsonb
);

-- الخطوة 4: إضافة المتطلبات
-- متطلبات عامة
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الجواز', 'Copy of passport',
  0, '{}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'حضور مقدم الطلب لمكتب تصوير الجوازات بالقنصلية',
  'Applicant must attend passport photography office at the consulate',
  1, '{}'::jsonb
);

-- متطلبات القصر - جديد
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من جواز الوصي (الأم والأب)',
  'Copy of guardian passport (mother and father)',
  2,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'يجب حضور الوالد وفي حالة عدم وجوده إحضار خطاب عدم ممانعة',
  'Father must attend or provide a no-objection letter',
  3,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- متطلبات القصر - تجديد/بدل
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الجواز أو الرقم الوطني',
  'Copy of passport or national ID',
  4,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["renewal", "replacement"]}]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'حضور الأب أو الأم',
  'Father or mother must attend',
  5,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["renewal", "replacement"]}]}'::jsonb
);

-- متطلبات التجديد
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'الجواز القديم الأصلي',
  'Original old passport',
  6,
  '{"field": "passportType", "operator": "equals", "values": ["renewal"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'نسخة إلكترونية من الجواز القديم',
  'Electronic copy of old passport',
  7,
  '{"field": "passportType", "operator": "equals", "values": ["renewal"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة شخصية حديثة',
  'Recent personal photo',
  8,
  '{"field": "passportType", "operator": "equals", "values": ["renewal"]}'::jsonb
);

-- متطلبات البدل فاقد
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'شهادة فقدان صادرة من أقرب قسم شرطة',
  'Loss certificate from nearest police station',
  9,
  '{"field": "passportType", "operator": "equals", "values": ["replacement"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'نسخة من الجواز المفقود (إن وجدت)',
  'Copy of lost passport (if available)',
  10,
  '{"field": "passportType", "operator": "equals", "values": ["replacement"]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة شخصية حديثة',
  'Recent personal photo',
  11,
  '{"field": "passportType", "operator": "equals", "values": ["replacement"]}'::jsonb
);

-- متطلبات وثيقة السفر الاضطرارية - بالغين
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة من الجواز أو الرقم الوطني',
  'Copy of passport or national ID',
  12,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["yes"]}, {"field": "passportType", "values": ["emergency"]}]}'::jsonb
),
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'عدد 2 صورة شخصية حديثة بحجم جواز',
  '2 recent passport-sized photos',
  13,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["yes"]}, {"field": "passportType", "values": ["emergency"]}]}'::jsonb
);

-- متطلبات وثيقة السفر الاضطرارية - أطفال
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, conditions)
VALUES
(
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'صورة شخصية حديثة بحجم جواز',
  'Recent passport-sized photo',
  14,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["emergency"]}]}'::jsonb
);
