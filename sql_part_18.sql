

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الشؤون القانونية والأسرية',
    NULL,
    'familyAffairs',
    'خدمات قانونية وأسرية متنوعة',
    NULL,
    'Heart',
    'legal',
    '{"base":150,"currency":"ريال سعودي"}',
    '3-7 أيام عمل',
    TRUE,
    '{"process":["تحديد نوع القضية","تقديم المستندات المطلوبة","مراجعة الحالة","دفع الرسوم","إصدار الوثيقة أو القرار"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'familyAffairs';

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
  ('إثباتات هوية الأطراف', NULL, 0, TRUE, '{}'::jsonb),
  ('المستندات الداعمة حسب نوع القضية', NULL, 1, TRUE, '{}'::jsonb),
  ('شهود (عند الحاجة)', NULL, 2, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'familyAffairs';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('case-details', 'تفاصيل القضية', NULL, 'visaType', 'select',
   'نوع التأشيرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع التأشيرة مطلوب"}'::jsonb, '[{"value":"resident","label":"مقيم"},{"value":"visit","label":"زيارة"},{"value":"umrah","label":"عمرة"},{"value":"other","label":"أخرى"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'iqamaNumber', 'text',
   'رقم الإقامة', NULL, NULL, NULL, 'أدخل 10 أرقام', NULL, NULL,
   true, '{"required":"رقم الإقامة مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'issuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الإصدار مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'issueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الإصدار مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'maritalStatus', 'select',
   'الحالة الاجتماعية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الحالة الاجتماعية مطلوبة"}'::jsonb, '[{"value":"single","label":"عازب/ة"},{"value":"married","label":"متزوج/ة"},{"value":"widowed","label":"أرمل/ة"},{"value":"divorced","label":"مطلق/ة"}]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'caseType', 'select',
   'نوع الطلب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الطلب مطلوب"}'::jsonb, '[{"value":"legal-case","label":"قضايا قانونية"},{"value":"legal-consultation","label":"استشارة قانونية"},{"value":"legal-support","label":"طلب دعم قانوني"},{"value":"family-disputes","label":"خلافات أسرية"},{"value":"external-relations","label":"مخاطبة الجهات ذات العلاقة الخارجية (جوازات - شرطة - سجون - تعليم - أخرى)"},{"value":"aid","label":"مساعدات"},{"value":"other","label":"أخرى"}]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'caseDescription', 'textarea',
   'وصف القضية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وصف القضية مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'iqamaCopy', 'file',
   'صورة الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الإقامة مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'requestDocuments', 'file',
   'إرفاق المستندات الخاصة بالطلب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المستندات الخاصة بالطلب مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'familyAffairs';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة الإقامة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('إرفاق المستندات الخاصة بالطلب', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'familyAffairs';

