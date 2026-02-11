

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'التوثيق',
    NULL,
    'attestations',
    'توثيق الوثائق والمستندات الرسمية',
    NULL,
    'Award',
    'documents',
    '{"base":120,"currency":"ريال سعودي"}',
    '3-5 أيام عمل',
    TRUE,
    '{"process":["تقديم المستند الأصلي","مراجعة صحة المستند","دفع رسوم التصديق","ختم وتوقيع التصديق","تسليم المستند المصدق"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'attestations';

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
  ('أصل المستند المراد تصديقه', NULL, 0, TRUE, '{}'::jsonb),
  ('صورة واضحة من المستند', NULL, 1, TRUE, '{}'::jsonb),
  ('إثبات شخصية', NULL, 2, TRUE, '{}'::jsonb),
  ('نموذج طلب التصديق', NULL, 3, TRUE, '{}'::jsonb),
  ('يشترط توثيق المستند من وزارة الخارجية في الدولة التي صدر منها (جمهورية السودان أو المملكة العربية السعودية)', NULL, 4, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'attestations';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('document-details', 'تفاصيل المستند', NULL, 'docType', 'select',
   'نوع المستند', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع المستند مطلوب"}'::jsonb, '[{"value":"educational","label":"شهادة تعليمية"},{"value":"commercial","label":"مستند تجاري"},{"value":"medical","label":"تقرير طبي"},{"value":"legal","label":"مستند قانوني"},{"value":"personal","label":"مستند شخصي"},{"value":"other","label":"أخرى"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('document-details', 'تفاصيل المستند', NULL, 'docTypeOther', 'text',
   'حدد نوع المستند', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع المستند مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{"field":"docType","values":["other"]}'::jsonb),
  ('document-details', 'تفاصيل المستند', NULL, 'docTitle', 'text',
   'عنوان المستند', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"عنوان المستند مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('document-details', 'تفاصيل المستند', NULL, 'issuingAuthority', 'text',
   'جهة الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"جهة الإصدار مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('document-details', 'تفاصيل المستند', NULL, 'issueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الإصدار مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('documents-upload', 'رفع المستندات', NULL, 'originalDocument', 'file',
   'المستند الأصلي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المستند الأصلي مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'رفع المستندات', NULL, 'nationalIdCopy', 'file',
   'صورة الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'attestations';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('المستند الأصلي', NULL, NULL, NULL,
   true, 10, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة الرقم الوطني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'attestations';

