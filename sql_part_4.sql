

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الإقرارات',
    NULL,
    'declarations',
    'إصدار إقرارات رسمية ومشفوعة باليمين',
    NULL,
    'FileCheck',
    'legal',
    '{"base":100,"currency":"ريال سعودي"}',
    '1 يوم عمل',
    TRUE,
    '{"process":["تحديد نوع الإقرار المطلوب","ملء البيانات المطلوبة","حضور المقر شخصياً","التوقيع أمام الموظف المختص","ختم وتوثيق الإقرار"],"hasSubcategories":true,"subcategories":[{"id":"regular","title":"إقرار","description":"إقرارات عادية لمختلف الأغراض","icon":"📄","color":"from-blue-500 to-blue-600","bgColor":"bg-blue-50","route":"/services/declarations/regular"},{"id":"sworn","title":"إقرار مشفوع باليمين","description":"إقرارات مشفوعة باليمين للأغراض القانونية","icon":"⚖️","color":"from-red-500 to-red-600","bgColor":"bg-red-50","route":"/services/declarations/sworn"}]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'declarations';

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
  ('حضور المقر شخصياً', NULL, 0, TRUE, '{}'::jsonb),
  ('إثبات الهوية', NULL, 1, TRUE, '{}'::jsonb),
  ('تحديد موضوع الإقرار بوضوح', NULL, 2, TRUE, '{}'::jsonb),
  ('شهود (عند الحاجة)', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'declarations';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('declaration-type', 'نوع الإقرار', NULL, 'declarationType', 'searchable-select',
   'نوع الإقرار الرئيسي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الإقرار مطلوب"}'::jsonb, '[{"value":"regular","label":"إقرار","description":"إقرارات عادية لمختلف الأغراض"},{"value":"sworn","label":"إقرار مشفوع باليمين","description":"إقرارات مشفوعة باليمين للأغراض القانونية"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'declarationSubtype', 'searchable-select',
   'التفاصيل المحددة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى اختيار تفاصيل الإقرار"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'familyMembers', 'dynamic-list',
   'أفراد الأسرة المسافرين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب إضافة فرد واحد على الأقل"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'travelDestination', 'text',
   'وجهة السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وجهة السفر مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent","wife_travel_consent","children_travel_companion","children_travel_only"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'travelPurpose', 'select',
   'الغرض من السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من السفر مطلوب"}'::jsonb, '[{"value":"tourism","label":"سياحة"},{"value":"medical","label":"علاج"},{"value":"education","label":"تعليم"},{"value":"work","label":"عمل"},{"value":"family_visit","label":"زيارة أقارب"},{"value":"other","label":"أخرى"}]'::jsonb, 4, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent","wife_travel_consent","children_travel_companion","children_travel_only","work_travel_no_objection"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'wifeName', 'text',
   'اسم الزوجة الكامل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الزوجة مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{"field":"declarationSubtype","values":["wife_travel_consent","children_documents_wife_travel","children_documents_travel"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'groomName', 'text',
   'اسم العريس الكامل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم العريس مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'brideName', 'text',
   'اسم العروس الكامل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم العروس مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'marriageDate', 'date',
   'تاريخ الزواج المتوقع', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الزواج مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'supportedPersonName', 'text',
   'اسم الشخص المُعال', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشخص المُعال مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{"field":"declarationSubtype","values":["family_support"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'relationshipToSupported', 'select',
   'صلة القرابة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"},{"value":"father","label":"والد"},{"value":"mother","label":"والدة"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"other","label":"أخرى"}]'::jsonb, 10, TRUE, '{"field":"declarationSubtype","values":["family_support"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'childrenList', 'dynamic-list',
   'بيانات الأطفال', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب إضافة طفل واحد على الأقل"}'::jsonb, '[]'::jsonb, 11, TRUE, '{"field":"declarationSubtype","values":["children_travel_documents","children_documents_wife_travel","children_id_passport","children_travel_companion","children_documents_travel","children_travel_only"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'companionName', 'text',
   'اسم المرافق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المرافق مطلوب"}'::jsonb, '[]'::jsonb, 12, TRUE, '{"field":"declarationSubtype","values":["children_travel_companion"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'sponsorshipFromParty', 'text',
   'اسم الطرف الثاني (المحول منه)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطرف الثاني مطلوب"}'::jsonb, '[]'::jsonb, 13, TRUE, '{"field":"declarationSubtype","values":["sponsorship_transfer_to_applicant"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'sponsorshipToParty', 'text',
   'اسم الطرف الثاني (المحول إليه)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطرف الثاني مطلوب"}'::jsonb, '[]'::jsonb, 14, TRUE, '{"field":"declarationSubtype","values":["sponsorship_transfer_from_applicant","recruitment_third_party","sponsored_transfer"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'namesDetails', 'textarea',
   'تفاصيل الأسماء', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الأسماء مطلوبة"}'::jsonb, '[]'::jsonb, 15, TRUE, '{"field":"declarationSubtype","values":["name_attribution"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'familyDetailsList', 'dynamic-list',
   'أفراد الأسرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب إضافة فرد واحد على الأقل"}'::jsonb, '[]'::jsonb, 16, TRUE, '{"field":"declarationSubtype","values":["family_details","family_separation"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'nameCorrection', 'textarea',
   'تفاصيل تصحيح الاسم', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل تصحيح الاسم مطلوبة"}'::jsonb, '[]'::jsonb, 17, TRUE, '{"field":"declarationSubtype","values":["name_correction_form"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'caseDetails', 'textarea',
   'تفاصيل الدعوى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الدعوى مطلوبة"}'::jsonb, '[]'::jsonb, 18, TRUE, '{"field":"declarationSubtype","values":["court_appearance"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'vehicleDetails', 'textarea',
   'تفاصيل إجراءات السيارة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل إجراءات السيارة مطلوبة"}'::jsonb, '[]'::jsonb, 19, TRUE, '{"field":"declarationSubtype","values":["vehicle_procedures"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'waiveDetails', 'textarea',
   'تفاصيل التنازل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل التنازل مطلوبة"}'::jsonb, '[]'::jsonb, 20, TRUE, '{"field":"declarationSubtype","values":["waiver_declaration"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'agreementDetails', 'textarea',
   'تفاصيل الاتفاق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الاتفاق مطلوبة"}'::jsonb, '[]'::jsonb, 21, TRUE, '{"field":"declarationSubtype","values":["agreement_declaration"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'studyCountry', 'text',
   'دولة الدراسة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"دولة الدراسة مطلوبة"}'::jsonb, '[]'::jsonb, 22, TRUE, '{"field":"declarationSubtype","values":["study_support_foreign_english","study_support_foreign","study_georgia_english"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'universityName', 'text',
   'اسم الجامعة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الجامعة مطلوب"}'::jsonb, '[]'::jsonb, 23, TRUE, '{"field":"declarationSubtype","values":["study_support_foreign_english","study_support_foreign","study_georgia_english"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'studentName', 'text',
   'اسم الطالب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطالب مطلوب"}'::jsonb, '[]'::jsonb, 24, TRUE, '{"field":"declarationSubtype","values":["study_support_foreign_english","study_support_foreign","study_georgia_english"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'workDestination', 'text',
   'وجهة العمل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وجهة العمل مطلوبة"}'::jsonb, '[]'::jsonb, 25, TRUE, '{"field":"declarationSubtype","values":["work_travel_no_objection"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'bodyDetails', 'textarea',
   'تفاصيل ستر الجثمان', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل ستر الجثمان مطلوبة"}'::jsonb, '[]'::jsonb, 26, TRUE, '{"field":"declarationSubtype","values":["body_covering"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'declarationSubject', 'text',
   'موضوع الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"موضوع الإقرار مطلوب"}'::jsonb, '[]'::jsonb, 27, TRUE, '{"field":"declarationSubtype","values":["general_sworn","general_sworn_2"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'declarationContent', 'textarea',
   'نص الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نص الإقرار مطلوب"}'::jsonb, '[]'::jsonb, 28, TRUE, '{"field":"declarationSubtype","values":["general_sworn","general_sworn_2","sworn_english"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'personName', 'text',
   'اسم الشخص', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشخص مطلوب"}'::jsonb, '[]'::jsonb, 29, TRUE, '{"field":"declarationSubtype","values":["age_of_majority","proof_of_life","marital_status_single","marital_status_widow","marital_status_single_2"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'currentAge', 'number',
   'العمر الحالي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العمر الحالي مطلوب"}'::jsonb, '[]'::jsonb, 30, TRUE, '{"field":"declarationSubtype","values":["age_of_majority"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'childName', 'text',
   'اسم الطفل/الشخص', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطفل مطلوب"}'::jsonb, '[]'::jsonb, 31, TRUE, '{"field":"declarationSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'fatherName', 'text',
   'اسم الوالد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوالد مطلوب"}'::jsonb, '[]'::jsonb, 32, TRUE, '{"field":"declarationSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'motherName', 'text',
   'اسم الوالدة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوالدة مطلوب"}'::jsonb, '[]'::jsonb, 33, TRUE, '{"field":"declarationSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'birthPlace', 'text',
   'مكان الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 34, TRUE, '{"field":"declarationSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'exemptionReason', 'textarea',
   'سبب الإعفاء', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الإعفاء مطلوب"}'::jsonb, '[]'::jsonb, 35, TRUE, '{"field":"declarationSubtype","values":["partial_exit_exemption"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'lastSeenDate', 'date',
   'تاريخ آخر مشاهدة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ آخر مشاهدة مطلوب"}'::jsonb, '[]'::jsonb, 36, TRUE, '{"field":"declarationSubtype","values":["proof_of_life"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'currentLocation', 'text',
   'المكان الحالي للشخص', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المكان الحالي مطلوب"}'::jsonb, '[]'::jsonb, 37, TRUE, '{"field":"declarationSubtype","values":["proof_of_life"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'landDetails', 'textarea',
   'تفاصيل أراضي الحرفيين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل أراضي الحرفيين مطلوبة"}'::jsonb, '[]'::jsonb, 38, TRUE, '{"field":"declarationSubtype","values":["craftsmen_lands"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'agentDismissalReason', 'textarea',
   'سبب عزل الموكل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب عزل الموكل مطلوب"}'::jsonb, '[]'::jsonb, 39, TRUE, '{"field":"declarationSubtype","values":["agent_dismissal","agent_dismissal_2"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'documentsDetails', 'textarea',
   'تفاصيل الوثائق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الوثائق مطلوبة"}'::jsonb, '[]'::jsonb, 40, TRUE, '{"field":"declarationSubtype","values":["document_authenticity"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'nameIdentityDetails', 'textarea',
   'تفاصيل الأسماء', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الأسماء مطلوبة"}'::jsonb, '[]'::jsonb, 41, TRUE, '{"field":"declarationSubtype","values":["name_identity"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'housingPlanDetails', 'textarea',
   'تفاصيل الخطة الإسكانية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الخطة الإسكانية مطلوبة"}'::jsonb, '[]'::jsonb, 42, TRUE, '{"field":"declarationSubtype","values":["housing_plan"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'otherDetails', 'textarea',
   'تفاصيل أخرى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"التفاصيل مطلوبة"}'::jsonb, '[]'::jsonb, 43, TRUE, '{"field":"declarationSubtype","values":["other_regular","other_sworn"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'witnessName1', 'text',
   'اسم الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 44, TRUE, '{"field":"declarationType","values":["sworn"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'witnessId1', 'text',
   'رقم هوية الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم هوية الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 45, TRUE, '{"field":"declarationType","values":["sworn"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'witnessName2', 'text',
   'اسم الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 46, TRUE, '{"field":"declarationType","values":["sworn"]}'::jsonb),
  ('declaration-type', 'نوع الإقرار', NULL, 'witnessId2', 'text',
   'رقم هوية الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 47, TRUE, '{"field":"declarationType","values":["sworn"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'مستندات داعمة', NULL, NULL, NULL, 'أي مستندات إضافية تدعم الإقرار', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'witnessId1Copy', 'file',
   'صورة هوية الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة هوية الشاهد الأول مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"declarationType","values":["sworn"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'witnessId2Copy', 'file',
   'صورة هوية الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"declarationType","values":["sworn"]}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'declarations';

-- إدراج حقول dynamic-list
INSERT INTO service_dynamic_list_fields (
  parent_field_id, field_name, label_ar, label_en, field_type,
  is_required, order_index, validation_rules, options
)
SELECT sf.id, * FROM service_fields sf, (VALUES
  ('name', 'الاسم', NULL, 'text',
   true, 0, '{}'::jsonb, '[]'::jsonb),
  ('birthDay', 'اليوم', NULL, 'select',
   true, 1, '{"required":"اليوم مطلوب"}'::jsonb, '[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"},{"value":"7","label":"7"},{"value":"8","label":"8"},{"value":"9","label":"9"},{"value":"10","label":"10"},{"value":"11","label":"11"},{"value":"12","label":"12"},{"value":"13","label":"13"},{"value":"14","label":"14"},{"value":"15","label":"15"},{"value":"16","label":"16"},{"value":"17","label":"17"},{"value":"18","label":"18"},{"value":"19","label":"19"},{"value":"20","label":"20"},{"value":"21","label":"21"},{"value":"22","label":"22"},{"value":"23","label":"23"},{"value":"24","label":"24"},{"value":"25","label":"25"},{"value":"26","label":"26"},{"value":"27","label":"27"},{"value":"28","label":"28"},{"value":"29","label":"29"},{"value":"30","label":"30"},{"value":"31","label":"31"}]'::jsonb),
  ('birthMonth', 'الشهر', NULL, 'select',
   true, 2, '{"required":"الشهر مطلوب"}'::jsonb, '[{"value":"1","label":"يناير"},{"value":"2","label":"فبراير"},{"value":"3","label":"مارس"},{"value":"4","label":"أبريل"},{"value":"5","label":"مايو"},{"value":"6","label":"يونيو"},{"value":"7","label":"يوليو"},{"value":"8","label":"أغسطس"},{"value":"9","label":"سبتمبر"},{"value":"10","label":"أكتوبر"},{"value":"11","label":"نوفمبر"},{"value":"12","label":"ديسمبر"}]'::jsonb),
  ('birthYear', 'السنة', NULL, 'select',
   true, 3, '{"required":"السنة مطلوبة"}'::jsonb, '[{"value":"2025","label":"2025"},{"value":"2024","label":"2024"},{"value":"2023","label":"2023"},{"value":"2022","label":"2022"},{"value":"2021","label":"2021"},{"value":"2020","label":"2020"},{"value":"2019","label":"2019"},{"value":"2018","label":"2018"},{"value":"2017","label":"2017"},{"value":"2016","label":"2016"},{"value":"2015","label":"2015"},{"value":"2014","label":"2014"},{"value":"2013","label":"2013"},{"value":"2012","label":"2012"},{"value":"2011","label":"2011"},{"value":"2010","label":"2010"},{"value":"2009","label":"2009"},{"value":"2008","label":"2008"},{"value":"2007","label":"2007"},{"value":"2006","label":"2006"},{"value":"2005","label":"2005"},{"value":"2004","label":"2004"},{"value":"2003","label":"2003"},{"value":"2002","label":"2002"},{"value":"2001","label":"2001"},{"value":"2000","label":"2000"},{"value":"1999","label":"1999"},{"value":"1998","label":"1998"},{"value":"1997","label":"1997"},{"value":"1996","label":"1996"},{"value":"1995","label":"1995"},{"value":"1994","label":"1994"},{"value":"1993","label":"1993"},{"value":"1992","label":"1992"},{"value":"1991","label":"1991"},{"value":"1990","label":"1990"},{"value":"1989","label":"1989"},{"value":"1988","label":"1988"},{"value":"1987","label":"1987"},{"value":"1986","label":"1986"},{"value":"1985","label":"1985"},{"value":"1984","label":"1984"},{"value":"1983","label":"1983"},{"value":"1982","label":"1982"},{"value":"1981","label":"1981"},{"value":"1980","label":"1980"},{"value":"1979","label":"1979"},{"value":"1978","label":"1978"},{"value":"1977","label":"1977"},{"value":"1976","label":"1976"},{"value":"1975","label":"1975"},{"value":"1974","label":"1974"},{"value":"1973","label":"1973"},{"value":"1972","label":"1972"},{"value":"1971","label":"1971"},{"value":"1970","label":"1970"},{"value":"1969","label":"1969"},{"value":"1968","label":"1968"},{"value":"1967","label":"1967"},{"value":"1966","label":"1966"},{"value":"1965","label":"1965"},{"value":"1964","label":"1964"},{"value":"1963","label":"1963"},{"value":"1962","label":"1962"},{"value":"1961","label":"1961"},{"value":"1960","label":"1960"},{"value":"1959","label":"1959"},{"value":"1958","label":"1958"},{"value":"1957","label":"1957"},{"value":"1956","label":"1956"},{"value":"1955","label":"1955"},{"value":"1954","label":"1954"},{"value":"1953","label":"1953"},{"value":"1952","label":"1952"},{"value":"1951","label":"1951"},{"value":"1950","label":"1950"},{"value":"1949","label":"1949"},{"value":"1948","label":"1948"},{"value":"1947","label":"1947"},{"value":"1946","label":"1946"},{"value":"1945","label":"1945"},{"value":"1944","label":"1944"},{"value":"1943","label":"1943"},{"value":"1942","label":"1942"},{"value":"1941","label":"1941"},{"value":"1940","label":"1940"},{"value":"1939","label":"1939"},{"value":"1938","label":"1938"},{"value":"1937","label":"1937"},{"value":"1936","label":"1936"},{"value":"1935","label":"1935"},{"value":"1934","label":"1934"},{"value":"1933","label":"1933"},{"value":"1932","label":"1932"},{"value":"1931","label":"1931"},{"value":"1930","label":"1930"},{"value":"1929","label":"1929"},{"value":"1928","label":"1928"},{"value":"1927","label":"1927"},{"value":"1926","label":"1926"}]'::jsonb),
  ('relationship', 'صلة القرابة', NULL, 'select',
   true, 4, '{}'::jsonb, '[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"},{"value":"father","label":"والد"},{"value":"mother","label":"والدة"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"other","label":"أخرى"}]'::jsonb)
) AS dlf(field_name, label_ar, label_en, field_type, is_required, order_index, validation_rules, options)
WHERE sf.field_name = 'familyMembers'
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'declarations');

INSERT INTO service_dynamic_list_fields (
  parent_field_id, field_name, label_ar, label_en, field_type,
  is_required, order_index, validation_rules, options
)
SELECT sf.id, * FROM service_fields sf, (VALUES
  ('name', 'الاسم', NULL, 'text',
   true, 0, '{}'::jsonb, '[]'::jsonb),
  ('birthDate', 'تاريخ الميلاد', NULL, 'date',
   true, 1, '{}'::jsonb, '[]'::jsonb),
  ('relationship', 'صلة القرابة', NULL, 'select',
   true, 2, '{}'::jsonb, '[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"}]'::jsonb)
) AS dlf(field_name, label_ar, label_en, field_type, is_required, order_index, validation_rules, options)
WHERE sf.field_name = 'childrenList'
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'declarations');

INSERT INTO service_dynamic_list_fields (
  parent_field_id, field_name, label_ar, label_en, field_type,
  is_required, order_index, validation_rules, options
)
SELECT sf.id, * FROM service_fields sf, (VALUES
  ('name', 'الاسم', NULL, 'text',
   true, 0, '{}'::jsonb, '[]'::jsonb),
  ('birthDate', 'تاريخ الميلاد', NULL, 'date',
   true, 1, '{}'::jsonb, '[]'::jsonb),
  ('relationship', 'صلة القرابة', NULL, 'select',
   true, 2, '{}'::jsonb, '[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"},{"value":"father","label":"والد"},{"value":"mother","label":"والدة"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"other","label":"أخرى"}]'::jsonb)
) AS dlf(field_name, label_ar, label_en, field_type, is_required, order_index, validation_rules, options)
WHERE sf.field_name = 'familyDetailsList'
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'declarations');

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('مستندات داعمة', NULL, 'أي مستندات إضافية تدعم الإقرار', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('صورة هوية الشاهد الأول', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"declarationType","operator":"equals","value":["sworn"]}]}]}'::jsonb),
  ('صورة هوية الشاهد الثاني', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"declarationType","operator":"equals","value":["sworn"]}]}]}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'declarations';

