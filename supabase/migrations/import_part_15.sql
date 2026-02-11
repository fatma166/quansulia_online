-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الإفادات',
    NULL,
    'endorsements',
    'إصدار إفادات رسمية لمختلف الأغراض',
    NULL,
    'FileText',
    'documents',
    '{"base":60,"currency":"ريال سعودي"}',
    '1-2 يوم عمل',
    TRUE,
    '{"process":["تحديد نوع الإفادة المطلوبة","تقديم المستندات المطلوبة","مراجعة البيانات","دفع الرسوم","إصدار الإفادة"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'endorsements';

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
  ('بطاقة الرقم الوطني أو الإقامة', NULL, 0, TRUE, '{}'::jsonb),
  ('نموذج طلب الإفادة', NULL, 1, TRUE, '{}'::jsonb),
  ('المستندات الداعمة حسب نوع الإفادة', NULL, 2, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'endorsements';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('endorsement-details', 'تفاصيل الإفادة', NULL, 'endorseType', 'select',
   'نوع الإفادة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الإفادة مطلوب"}'::jsonb, '[{"value":"salary","label":"إفادة راتب"},{"value":"employment","label":"إفادة عمل"},{"value":"study","label":"إفادة دراسة"},{"value":"conduct","label":"حسن سير وسلوك"},{"value":"residence","label":"إفادة سكن"},{"value":"other","label":"أخرى"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('endorsement-details', 'تفاصيل الإفادة', NULL, 'purpose', 'textarea',
   'الغرض من الإفادة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من الإفادة مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nationalIdCopy', 'file',
   'صورة الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'المستندات الداعمة', NULL, NULL, NULL, 'مستندات تدعم طلب الإفادة', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'endorsements';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة الرقم الوطني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('المستندات الداعمة', NULL, 'مستندات تدعم طلب الإفادة', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'endorsements';

