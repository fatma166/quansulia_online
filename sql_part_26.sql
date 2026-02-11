

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'خطاب ستر الجثمان',
    NULL,
    'bodyCovering',
    'خدمة إصدار خطابات ستر الجثمان لاستلام الجثمان وستره',
    NULL,
    'FileText',
    'consular',
    '{"base":100,"currency":"ريال سعودي"}',
    '1-2 يوم عمل',
    TRUE,
    '{"process":["تعبئة نموذج الطلب","رفع المستندات المطلوبة","المراجعة والتدقيق","إصدار الخطاب","التسليم"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'bodyCovering';

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
  ('شهادة الوفاة الأصلية', NULL, 0, TRUE, '{}'::jsonb),
  ('صورة جواز سفر المتوفى', NULL, 1, TRUE, '{}'::jsonb),
  ('صورة بطاقة الأحوال / الإقامة', NULL, 2, TRUE, '{}'::jsonb),
  ('صورة جواز سفر مقدم الطلب', NULL, 3, TRUE, '{}'::jsonb),
  ('تقرير الشرطة (إن وجد)', NULL, 4, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'bodyCovering';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'deceasedGender', 'radio',
   'النوع', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"النوع مطلوب"}'::jsonb, '[{"value":"male","label":"ذكر"},{"value":"female","label":"أنثى"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'deceasedName', 'text',
   'اسم المتوفى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المتوفى مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'deceasedPassportOrResidence', 'text',
   'رقم الجواز أو الإقامة للمتوفى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجواز أو الإقامة مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'deceasedAge', 'number',
   'العمر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العمر مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'deathType', 'radio',
   'نوع الوفاة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الوفاة مطلوب"}'::jsonb, '[{"value":"natural","label":"طبيعية"},{"value":"accident","label":"حادث مروري"},{"value":"criminal","label":"الحالات الجنائية أو الشبه جنائية"}]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'nearestRelativeName', 'text',
   'اسم أقرب الأقربين للمتوفى (الشخص المكلف بتكملة الإجراءات لستر الجثمان)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم أقرب الأقربين مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'nearestRelativeRelation', 'select',
   'صلة القرابة بالمتوفى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"father","label":"الأب"},{"value":"mother","label":"الأم"},{"value":"son","label":"الابن"},{"value":"daughter","label":"الابنة"},{"value":"brother","label":"الأخ"},{"value":"sister","label":"الأخت"},{"value":"husband","label":"الزوج"},{"value":"wife","label":"الزوجة"},{"value":"other","label":"أخرى"}]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'phoneNumber', 'tel',
   'رقم الهــــــاتـف', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الهاتف مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'kingdomAddress', 'text',
   'العنوان بالمملكة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالمملكة مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('deceased-info', 'تفاصيل الخدمة', NULL, 'sudanAddress', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسودان مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'deceasedPassportCopy', 'file',
   'صورة جواز المتوفي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز المتوفي مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'responsiblePersonPassport', 'file',
   'صورة جواز الشخص المكلف بستر الجثمان', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الشخص المكلف مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'deathNotification', 'file',
   'بلاغ الوفاة من المستشفى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"بلاغ الوفاة من المستشفى مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'deceasedIdOrResidence', 'file',
   'صورة الجواز أو إقامة المتوفي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز أو إقامة المتوفي مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'nearestRelativeId', 'file',
   'صورة جواز أو إقامة أقرب الأقربين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز أو إقامة أقرب الأقربين مطلوبة"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'powerOfAttorney', 'file',
   'توكيل من أسرة المتوفي (في حالة عدم القرابة)', NULL, NULL, NULL, 'مطلوب فقط في حالة عدم وجود صلة قرابة مباشرة', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'trafficLetter', 'file',
   'خطاب مرور (في حالة الحادث)', NULL, NULL, NULL, 'مطلوب في حالات الحوادث المرورية', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"deathType","value":"accident"}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'forensicReport', 'file',
   'تقرير الطب الشرعي (في الحالات الجنائية)', NULL, NULL, NULL, 'مطلوب في الحالات الجنائية أو الشبه جنائية', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"deathType","value":"criminal"}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'bodyCovering';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة جواز المتوفي', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة جواز الشخص المكلف بستر الجثمان', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('بلاغ الوفاة من المستشفى', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('صورة الجواز أو إقامة المتوفي', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('صورة جواز أو إقامة أقرب الأقربين', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('توكيل من أسرة المتوفي (في حالة عدم القرابة)', NULL, 'مطلوب فقط في حالة عدم وجود صلة قرابة مباشرة', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('خطاب مرور (في حالة الحادث)', NULL, 'مطلوب في حالات الحوادث المرورية', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 6, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"deathType","operator":"equals"}]}]}'::jsonb),
  ('تقرير الطب الشرعي (في الحالات الجنائية)', NULL, 'مطلوب في الحالات الجنائية أو الشبه جنائية', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 7, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"deathType","operator":"equals"}]}]}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'bodyCovering';

