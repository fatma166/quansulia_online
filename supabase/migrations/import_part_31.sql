-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'العمل والسجون',
    NULL,
    'workAndPrisons',
    'خدمات الخروج النهائي النظامي وشؤون السجناء',
    NULL,
    'Briefcase',
    'documents',
    '{"finalExit":{"base":200,"currency":"ريال سعودي"}}',
    '{"finalExit":"5-7 أيام عمل"}'::jsonb,
    TRUE,
    '{"process":["تقديم الطلب مع المستندات المطلوبة","مراجعة الطلب والمستندات","دفع الرسوم المقررة","التنسيق مع الجهات المعنية","إصدار الموافقة","التسليم أو الإشعار"],"hasSubcategories":false,"subcategories":[]}'::jsonb
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar,
    fees = EXCLUDED.fees,
    duration = EXCLUDED.duration,
    config = EXCLUDED.config,
    updated_at = NOW();


-- حذف البيانات القديمة للخدمة
DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = 'workAndPrisons';

  IF service_uuid IS NOT NULL THEN
    DELETE FROM service_dynamic_list_fields
    WHERE parent_field_id IN (SELECT id FROM service_fields WHERE service_id = service_uuid);

    DELETE FROM service_requirements WHERE service_id = service_uuid;
    DELETE FROM service_documents WHERE service_id = service_uuid;
    DELETE FROM service_fields WHERE service_id = service_uuid;
  END IF;
END $$;


-- إدراج المتطلبات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, is_active, conditions)
SELECT id, * FROM services, (VALUES
  ('صورة من الجواز', NULL, 0, TRUE, '{"type":"finalExit"}'::jsonb),
  ('عدد 2 صورة بطاقة', NULL, 1, TRUE, '{"type":"finalExit"}'::jsonb),
  ('الحضور للقنصلية للبصمة', NULL, 2, TRUE, '{"type":"finalExit"}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'workAndPrisons';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('personal-info', 'المعلومات الشخصية', NULL, 'nationalNumber', 'text',
   'الرقم الوطني', NULL, NULL, NULL, 'أدخل الرقم الوطني', NULL, NULL,
   true, '{"required":"الرقم الوطني مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('personal-info', 'المعلومات الشخصية', NULL, 'motherFullName', 'text',
   'اسم الأم رباعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الأم رباعي مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('personal-info', 'المعلومات الشخصية', NULL, 'requestingAuthority', 'text',
   'الجهة الطالبة للفيش', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الجهة الطالبة مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('personal-info', 'المعلومات الشخصية', NULL, 'requestReason', 'select',
   'سبب طلب الفيش', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الطلب مطلوب"}'::jsonb, '[{"value":"work","label":"للعمل"},{"value":"study","label":"للدراسة"},{"value":"travel","label":"للسفر"},{"value":"residence","label":"للإقامة"},{"value":"marriage","label":"للزواج"},{"value":"government","label":"للجهات الحكومية"},{"value":"other","label":"أخرى"}]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'recentPhoto', 'file',
   'صورة حديثة', NULL, NULL, NULL, 'صورة شخصية حديثة', NULL, NULL,
   true, '{"required":"صورة حديثة مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'workAndPrisons';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة حديثة', NULL, 'صورة شخصية حديثة', NULL,
   true, 5, '["jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'workAndPrisons';
/*
  # استيراد بيانات الخدمات الفرعية للتوكيلات والإقرارات

  ## التوكيلات (9 خدمات):
  1. general - توكيلات منوعة
  2. real-estate - عقارات وأراضي
  3. vehicles - سيارات
  4. companies - الشركات
  5. inheritance - الورثة
  6. courts - محاكم وقضايا
  7. birth-certificates - شهادات ميلاد
  8. educational - شهادة دراسية
  9. marriage-divorce - إجراءات الزواج والطلاق

  ## الإقرارات (2 خدمة):
  10. regular - إقرار عادي
  11. sworn - إقرار مشفوع باليمين
*/

