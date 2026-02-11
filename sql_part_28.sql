

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'بنك الخرطوم',
    NULL,
    'khartoomBank',
    'خدمات بنك الخرطوم للعملاء (تنشيط حساب، تحديث بيانات، خدمة تطبيق بنكك)',
    NULL,
    'Building2',
    'consular',
    '{"base":0,"currency":"مجاناً"}',
    'فوري',
    TRUE,
    '{"process":["تحديد نوع الخدمة المطلوبة","تعبئة نموذج الطلب","الحضور الشخصي مع الجواز الأصل","مراجعة البيانات","إتمام الإجراء"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'khartoomBank';

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
  ('الحضور الشخصي لصاحب الحساب', NULL, 0, TRUE, '{}'::jsonb),
  ('إحضار جواز أصل ساري المفعول', NULL, 1, TRUE, '{}'::jsonb),
  ('لا يتم التعامل مع التوكيلات أو أي شخص ينوب عن العميل', NULL, 2, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'khartoomBank';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('bank-info', 'تفاصيل الطلب', NULL, 'serviceType', 'radio',
   'نوع الخدمة المطلوبة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الخدمة مطلوب"}'::jsonb, '[{"value":"activate","label":"تنشيط حساب"},{"value":"update","label":"تحديث بيانات"},{"value":"bankak","label":"خدمة تطبيق بنكك"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('bank-info', 'تفاصيل الطلب', NULL, 'accountNumber', 'text',
   'رقم الحساب (إن وجد)', NULL, NULL, NULL, 'اختياري - في حال كان لديك حساب بالفعل', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, 'يرجى إرفاق صورة واضحة من جواز السفر', NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'khartoomBank';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة من الجواز', NULL, 'يرجى إرفاق صورة واضحة من جواز السفر', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'khartoomBank';

