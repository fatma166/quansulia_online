-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'التوكيلات',
    NULL,
    'powerOfAttorney',
    'إصدار توكيلات رسمية لمختلف الأغراض',
    NULL,
    'Scale',
    'legal',
    '{"base":200,"currency":"ريال سعودي"}',
    '1-2 يوم عمل',
    TRUE,
    '{"process":["تحديد نوع التوكيل المطلوب","ملء البيانات المطلوبة","حضور الموكل شخصياً","التوقيع أمام الموظف المختص","ختم وتوثيق التوكيل"],"hasSubcategories":true,"subcategories":[{"id":"general","title":"تواكيل منوعة","description":"تواكيل منوعة لجميع الأغراض والمعاملات","icon":"📋","color":"from-gray-500 to-gray-600","bgColor":"bg-gray-50","route":"/services/poa/general"},{"id":"courts","title":"محاكم وقضايا ودعاوي","description":"توكيل خاص بالمرافعات والقضايا القانونية والدعاوي","icon":"⚖️","color":"from-purple-500 to-purple-600","bgColor":"bg-purple-50","route":"/services/poa/courts"},{"id":"inheritance","title":"الورثة","description":"توكيل خاص بقسمة التركات وشؤون الورثة","icon":"👨‍👩‍👧‍👦","color":"from-amber-500 to-amber-600","bgColor":"bg-amber-50","route":"/services/poa/inheritance"},{"id":"real_estate","title":"عقارات وأراضي","description":"توكيل للمعاملات العقارية وبيع وشراء الأراضي","icon":"🏠","color":"from-green-500 to-green-600","bgColor":"bg-green-50","route":"/services/poa/real-estate"},{"id":"vehicles","title":"سيارات","description":"توكيل خاص بمعاملات السيارات والمركبات","icon":"🚗","color":"from-blue-500 to-blue-600","bgColor":"bg-blue-50","route":"/services/poa/vehicles"},{"id":"companies","title":"الشركات","description":"توكيل للمعاملات التجارية وإدارة الشركات","icon":"🏢","color":"from-indigo-500 to-indigo-600","bgColor":"bg-indigo-50","route":"/services/poa/companies"},{"id":"marriage_divorce","title":"إجراءات الزواج والطلاق","description":"توكيل خاص بعقود الزواج والطلاق والمأذونية","icon":"💍","color":"from-pink-500 to-pink-600","bgColor":"bg-pink-50","route":"/services/poa/marriage-divorce"},{"id":"birth_certificates","title":"شهادات ميلاد","description":"توكيل لاستلام شهادات الميلاد والوثائق المدنية","icon":"👶","color":"from-cyan-500 to-cyan-600","bgColor":"bg-cyan-50","route":"/services/poa/birth-certificates"},{"id":"educational","title":"شهادة دراسية","description":"توكيل لاستلام الشهادات الدراسية والوثائق التعليمية","icon":"🎓","color":"from-teal-500 to-teal-600","bgColor":"bg-teal-50","route":"/services/poa/educational"}]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'powerOfAttorney';

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
  ('حضور الموكل شخصياً', NULL, 0, TRUE, '{}'::jsonb),
  ('إثبات هوية الموكل', NULL, 1, TRUE, '{}'::jsonb),
  ('إثبات هوية الوكيل', NULL, 2, TRUE, '{}'::jsonb),
  ('تحديد الغرض من التوكيل بوضوح', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'powerOfAttorney';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('poa-type-selection', 'نوع التوكيل الرئيسي', NULL, 'poaType', 'searchable-select',
   'نوع التوكيل الرئيسي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع التوكيل مطلوب"}'::jsonb, '[{"value":"general","label":"تواكيل منوعة"},{"value":"courts","label":"محاكم وقضايا ودعاوي"},{"value":"inheritance","label":"الورثة"},{"value":"real_estate","label":"عقارات وأراضي"},{"value":"vehicles","label":"سيارات"},{"value":"companies","label":"الشركات"},{"value":"marriage_divorce","label":"إجراءات الزواج والطلاق"},{"value":"birth_certificates","label":"شهادات ميلاد"},{"value":"educational","label":"شهادة دراسية"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'poaSubtype', 'searchable-select',
   'اختر النوع الفرعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى اختيار النوع الفرعي"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'agentFullName', 'text',
   'اسم الوكيل رباعياً', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوكيل رباعياً مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'telecomCompany', 'searchable-select',
   'شركة الاتصالات', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[{"value":"stc","label":"STC"},{"value":"mobily","label":"Mobily"},{"value":"zain","label":"Zain"},{"value":"virgin","label":"Virgin Mobile"},{"value":"lebara","label":"Lebara"},{"value":"other","label":"أخرى"}]'::jsonb, 2, TRUE, '{"field":"poaSubtype","values":["replacement_sim"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'phoneNumber', 'tel',
   'رقم الجوال المرتبط', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"poaSubtype","values":["replacement_sim"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'idIssuingAuthority', 'searchable-select',
   'الجهة المصدرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[{"value":"civil_affairs_sa","label":"الأحوال المدنية (السعودية)"},{"value":"embassy_sudan","label":"السفارة/القنصلية السودانية"},{"value":"other","label":"أخرى"}]'::jsonb, 4, TRUE, '{"field":"poaSubtype","values":["new_id_card"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'bankName', 'searchable-select',
   'اسم البنك', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[{"value":"alahli","label":"الأهلي"},{"value":"alrajhi","label":"الراجحي"},{"value":"riyad","label":"بنك الرياض"},{"value":"inma","label":"الإنماء"},{"value":"other","label":"بنك آخر"}]'::jsonb, 5, TRUE, '{"field":"poaSubtype","values":["transfer_error_form","account_management"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'courtName', 'text',
   'اسم المحكمة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"poaSubtype","values":["land_litigation","property_litigation","file_lawsuit","other_courts"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'caseType', 'text',
   'نوع الدعوى', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"poaSubtype","values":["land_litigation","property_litigation","file_lawsuit"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'heirsCount', 'text',
   'عدد الورثة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 8, TRUE, '{"field":"poaSubtype","values":["inheritance_inventory_form","inheritance_receipt","inheritance_waiver","other_inheritance"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'propertyType', 'text',
   'نوع العقار/الأرض', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 9, TRUE, '{"field":"poaSubtype","values":["buy_land_property","land_sale","property_sale","other_real_estate"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'propertyCity', 'text',
   'مدينة/موقع العقار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 10, TRUE, '{"field":"poaSubtype","values":["buy_land_property","land_sale","property_sale","other_real_estate"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'vehiclePlate', 'text',
   'رقم اللوحة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '{"field":"poaSubtype","values":["vehicle_sale","vehicle_receipt","vehicle_licensing","other_vehicles"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'companyName', 'text',
   'اسم الشركة/الكيان', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '{"field":"poaSubtype","values":["company_registration_form","business_name_form","other_companies"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'partyOneName', 'text',
   'اسم الطرف الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 13, TRUE, '{"field":"poaSubtype","values":["marriage_contract","divorce_procedures","other_marriage"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'partyTwoName', 'text',
   'اسم الطرف الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 14, TRUE, '{"field":"poaSubtype","values":["marriage_contract","divorce_procedures","other_marriage"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'personName', 'text',
   'اسم صاحب الشهادة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 15, TRUE, '{"field":"poaSubtype","values":["birth_certificate_issuance"]}'::jsonb),
  ('poa-subtype-selection', 'النوع الفرعي', NULL, 'certificateType', 'text',
   'نوع الشهادة الدراسية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 16, TRUE, '{"field":"poaSubtype","values":["educational_certificate_issuance","university_egypt","other_educational"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'principalIdCopy', 'file',
   'صورة هوية الموكل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة هوية الموكل مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'agentIdCopy', 'file',
   'صورة هوية الوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة هوية الوكيل مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'transferProof', 'file',
   'إثبات التحويل (إيصال/كشف)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"poaSubtype","values":["transfer_error_form"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'simLossReport', 'file',
   'إفادة فقدان الشريحة (إن وُجدت)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"poaSubtype","values":["replacement_sim"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'docScan', 'file',
   'نسخة المستند المراد توثيقه', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"poaSubtype","values":["document_authentication"]}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'powerOfAttorney';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة هوية الموكل', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة هوية الوكيل', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('إثبات التحويل (إيصال/كشف)', NULL, NULL, NULL,
   true, 10, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"poaSubtype","operator":"equals","value":["transfer_error_form"]}]}]}'::jsonb),
  ('إفادة فقدان الشريحة (إن وُجدت)', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"poaSubtype","operator":"equals","value":["replacement_sim"]}]}]}'::jsonb),
  ('نسخة المستند المراد توثيقه', NULL, NULL, NULL,
   true, 10, '["pdf","jpg","jpeg","png"]'::jsonb, 4, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"poaSubtype","operator":"equals","value":["document_authentication"]}]}]}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'powerOfAttorney';

