

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'التأشيرات',
    NULL,
    'visas',
    'إصدار تأشيرات دخول للسودان',
    NULL,
    'Plane',
    'travel',
    '{"regular":{"base":375,"currency":"ريال سعودي"},"american":{"base":572,"currency":"ريال سعودي"}}',
    '3-5 أيام عمل',
    TRUE,
    '{"process":["تحديد نوع التأشيرة","تقديم المستندات المطلوبة","مراجعة الطلب","دفع الرسوم","إصدار التأشيرة"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'visas';

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
  ('أصل جواز السفر ساري المفعول (صلاحية 6 أشهر على الأقل)', NULL, 0, TRUE, '{"type":"general"}'::jsonb),
  ('صورة شخصية', NULL, 1, TRUE, '{"type":"general"}'::jsonb),
  ('الرسوم: 375 ريال لكل الجنسيات ماعدا الجنسية الأمريكية 572 ريال', NULL, 2, TRUE, '{"type":"general"}'::jsonb),
  ('تقديم الطلب بواسطة صاحب الطلب أو ولي أمره أو المندوب الرسمي لجهة العمل الضامنة', NULL, 3, TRUE, '{"type":"general"}'::jsonb),
  ('صورة من مستند سوداني لصاحب الطلب (جواز سفر - رقم وطني - بطاقة شخصية - بطاقة أصول سودانية)', NULL, 4, TRUE, '{"type":"sudanese_origin"}'::jsonb),
  ('صورة مستند سوداني لضامن من الدرجة الأولى (أب - أم - أخ - أخت - ابن - ابنة - زوجة)', NULL, 5, TRUE, '{"type":"sudanese_origin"}'::jsonb),
  ('في حالة الزوجة: إرفاق صورة من قسيمة الزواج', NULL, 6, TRUE, '{"type":"sudanese_origin"}'::jsonb),
  ('في حالة الأم: إرفاق شهادة الميلاد أو الرقم الوطني لصاحب الطلب', NULL, 7, TRUE, '{"type":"sudanese_origin"}'::jsonb),
  ('زيارة شخصية (شخصية إعتبارية - قاضي - وزير)', NULL, 8, TRUE, '{"type":"personal_visit"}'::jsonb),
  ('خطاب من جهة العمل المسجلة بجوازات الأجانب', NULL, 9, TRUE, '{"type":"business_visit"}'::jsonb),
  ('إرفاق هوية المندوب الرسمي المسجل بجوازات الأجانب', NULL, 10, TRUE, '{"type":"business_visit"}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'visas';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('visa-details', 'تفاصيل الخدمة', NULL, 'visaType', 'radio',
   'نوع التأشيرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع التأشيرة مطلوب"}'::jsonb, '[{"value":"sudanese_origin","label":"للأصول السودانية","description":"تأشيرة للأصول السودانية"},{"value":"personal_visit","label":"زيارة شخصية","description":"شخصية إعتبارية - قاضي - وزير"},{"value":"business_visit","label":"زيارة الأعمال","description":"للأعمال التجارية"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('visa-details', 'تفاصيل الخدمة', NULL, 'passportExpiry', 'date',
   'تاريخ انتهاء الجواز', NULL, NULL, NULL, 'يجب أن يكون صالحاً لمدة 6 أشهر على الأقل', NULL, NULL,
   true, '{"required":"تاريخ انتهاء الجواز مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('visa-details', 'تفاصيل الخدمة', NULL, 'nationality', 'searchable-select',
   'الجنسية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الجنسية مطلوبة"}'::jsonb, '[{"value":"usa","label":"الولايات المتحدة الأمريكية"},{"value":"uk","label":"المملكة المتحدة"},{"value":"canada","label":"كندا"},{"value":"australia","label":"أستراليا"},{"value":"germany","label":"ألمانيا"},{"value":"france","label":"فرنسا"},{"value":"italy","label":"إيطاليا"},{"value":"spain","label":"إسبانيا"},{"value":"egypt","label":"مصر"},{"value":"jordan","label":"الأردن"},{"value":"uae","label":"الإمارات"},{"value":"kuwait","label":"الكويت"},{"value":"qatar","label":"قطر"},{"value":"bahrain","label":"البحرين"},{"value":"oman","label":"عمان"},{"value":"other","label":"أخرى"}]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('visa-details', 'تفاصيل الخدمة', NULL, 'nationalityOther', 'text',
   'حدد الجنسية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الجنسية مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"nationality","values":["other"]}'::jsonb),
  ('visa-details', 'تفاصيل الخدمة', NULL, 'arrivalDate', 'date',
   'تاريخ الوصول المتوقع', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الوصول مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('applicant-info', 'معلومات المتقدم', NULL, 'applicantType', 'radio',
   'الشخص المقدم للطلب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى تحديد الشخص المقدم للطلب"}'::jsonb, '[{"value":"self","label":"صاحب الطلب"},{"value":"guardian","label":"ولي الأمر"},{"value":"representative","label":"المندوب الرسمي لجهة العمل"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('applicant-info', 'معلومات المتقدم', NULL, 'guardianName', 'text',
   'اسم ولي الأمر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم ولي الأمر مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{"field":"applicantType","values":["guardian"]}'::jsonb),
  ('applicant-info', 'معلومات المتقدم', NULL, 'guardianRelation', 'select',
   'صلة القرابة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"father","label":"أب"},{"value":"mother","label":"أم"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"other","label":"أخرى"}]'::jsonb, 2, TRUE, '{"field":"applicantType","values":["guardian"]}'::jsonb),
  ('applicant-info', 'معلومات المتقدم', NULL, 'representativeName', 'text',
   'اسم المندوب الرسمي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المندوب الرسمي مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"applicantType","values":["representative"]}'::jsonb),
  ('applicant-info', 'معلومات المتقدم', NULL, 'representativeCompany', 'text',
   'جهة العمل الضامنة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"جهة العمل الضامنة مطلوبة"}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"applicantType","values":["representative"]}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'applicantSudaneseDoc', 'radio',
   'هل لديك مستند سوداني؟', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى تحديد ما إذا كان لديك مستند سوداني"}'::jsonb, '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'applicantSudaneseDocType', 'select',
   'نوع المستند السوداني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع المستند السوداني مطلوب"}'::jsonb, '[{"value":"passport","label":"جواز سفر سوداني"},{"value":"national_id","label":"رقم وطني"},{"value":"personal_card","label":"بطاقة شخصية"},{"value":"sudanese_origin_card","label":"بطاقة أصول سودانية"}]'::jsonb, 1, TRUE, '{"field":"applicantSudaneseDoc","values":["yes"]}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'applicantSudaneseDocNumber', 'text',
   'رقم المستند السوداني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم المستند السوداني مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"applicantSudaneseDoc","values":["yes"]}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'guarantorName', 'text',
   'اسم الضامن (من الدرجة الأولى)', NULL, NULL, NULL, 'أب - أم - أخ - أخت - ابن - ابنة - زوجة', NULL, NULL,
   true, '{"required":"اسم الضامن مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'guarantorRelation', 'select',
   'صلة القرابة بالضامن', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"father","label":"أب"},{"value":"mother","label":"أم"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"}]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'guarantorSudaneseDocType', 'select',
   'نوع مستند الضامن السوداني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع مستند الضامن مطلوب"}'::jsonb, '[{"value":"passport","label":"جواز سفر سوداني"},{"value":"national_id","label":"رقم وطني"},{"value":"personal_card","label":"بطاقة شخصية"},{"value":"sudanese_origin_card","label":"بطاقة أصول سودانية"}]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('sudanese-origin-info', 'معلومات الأصول السودانية', NULL, 'guarantorSudaneseDocNumber', 'text',
   'رقم مستند الضامن السوداني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم مستند الضامن مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('business-info', 'معلومات زيارة الأعمال', NULL, 'companyName', 'text',
   'اسم جهة العمل', NULL, NULL, NULL, 'يجب أن تكون مسجلة بجوازات الأجانب', NULL, NULL,
   true, '{"required":"اسم جهة العمل مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('business-info', 'معلومات زيارة الأعمال', NULL, 'companyRegistrationNumber', 'text',
   'رقم التسجيل بجوازات الأجانب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم التسجيل مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportOriginal', 'file',
   'أصل جواز السفر ساري المفعول', NULL, NULL, NULL, 'يجب أن يكون صالحاً لمدة 6 أشهر على الأقل', NULL, NULL,
   true, '{"required":"أصل جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'personalPhoto', 'file',
   'صورة شخصية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الشخصية مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'applicantSudaneseDocCopy', 'file',
   'صورة من المستند السوداني لصاحب الطلب', NULL, NULL, NULL, 'جواز سفر - رقم وطني - بطاقة شخصية - بطاقة أصول سودانية', NULL, NULL,
   true, '{"required":"صورة المستند السوداني مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"visaType","values":["sudanese_origin"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'guarantorSudaneseDocCopy', 'file',
   'صورة المستند السوداني للضامن', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة مستند الضامن مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"visaType","values":["sudanese_origin"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'marriageCertificate', 'file',
   'صورة من قسيمة الزواج', NULL, NULL, NULL, 'في حالة الزوجة', NULL, NULL,
   true, '{"required":"صورة قسيمة الزواج مطلوبة"}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"guarantorRelation","values":["wife"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'birthCertificate', 'file',
   'صورة من شهادة الميلاد أو الرقم الوطني', NULL, NULL, NULL, 'في حالة الأم كضامن', NULL, NULL,
   true, '{"required":"صورة شهادة الميلاد أو الرقم الوطني مطلوبة"}'::jsonb, '[]'::jsonb, 5, TRUE, '{"field":"guarantorRelation","values":["mother"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'companyLetter', 'file',
   'خطاب من جهة العمل المسجلة بجوازات الأجانب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"خطاب جهة العمل مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"visaType","values":["business_visit"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'representativeId', 'file',
   'هوية المندوب الرسمي المسجل بجوازات الأجانب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"هوية المندوب الرسمي مطلوبة"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"visaType","values":["business_visit"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'مستندات أخرى داعمة', NULL, NULL, NULL, 'ملاحظة: قد يتطلب الإجراء إحضار بعض المستندات الأخرى المؤيدة لطلب الحصول على التأشيرة', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'visas';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('أصل جواز السفر ساري المفعول', NULL, 'يجب أن يكون صالحاً لمدة 6 أشهر على الأقل', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة شخصية', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('صورة من المستند السوداني لصاحب الطلب', NULL, 'جواز سفر - رقم وطني - بطاقة شخصية - بطاقة أصول سودانية', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"visaType","operator":"equals","value":["sudanese_origin"]}]}]}'::jsonb),
  ('صورة المستند السوداني للضامن', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"visaType","operator":"equals","value":["sudanese_origin"]}]}]}'::jsonb),
  ('صورة من قسيمة الزواج', NULL, 'في حالة الزوجة', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 4, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"guarantorRelation","operator":"equals","value":["wife"]}]}]}'::jsonb),
  ('صورة من شهادة الميلاد أو الرقم الوطني', NULL, 'في حالة الأم كضامن', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 5, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"guarantorRelation","operator":"equals","value":["mother"]}]}]}'::jsonb),
  ('خطاب من جهة العمل المسجلة بجوازات الأجانب', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 6, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"visaType","operator":"equals","value":["business_visit"]}]}]}'::jsonb),
  ('هوية المندوب الرسمي المسجل بجوازات الأجانب', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 7, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"visaType","operator":"equals","value":["business_visit"]}]}]}'::jsonb),
  ('مستندات أخرى داعمة', NULL, 'ملاحظة: قد يتطلب الإجراء إحضار بعض المستندات الأخرى المؤيدة لطلب الحصول على التأشيرة', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 8, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'visas';

