-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الإقرارات المشفوعة باليمين',
    NULL,
    'sworn_declarations',
    'إصدار إقرارات مشفوعة باليمين للأغراض القانونية',
    NULL,
    'Scale',
    'legal',
    '{"base":120,"currency":"ريال سعودي"}',
    '1 يوم عمل',
    TRUE,
    '{"process":["تحديد نوع الإقرار المطلوب","ملء البيانات المطلوبة","حضور المقر شخصياً مع الشهود","أداء اليمين والتوقيع","ختم وتوثيق الإقرار"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'sworn_declarations';

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
  ('شهود (عند الحاجة)', NULL, 2, TRUE, '{}'::jsonb),
  ('تحديد موضوع الإقرار بوضوح', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'sworn_declarations';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'declarationAuthority', 'text',
   'جهة الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"جهة الإقرار مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'swornSubtype', 'searchable-select',
   'نوع الإقرار المشفوع باليمين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الإقرار المشفوع باليمين مطلوب"}'::jsonb, '[{"value":"general_sworn","label":"إقرار مشفوع باليمين","description":"إقرار عام مشفوع باليمين"},{"value":"age_of_majority","label":"إقرار مشفوع باليمين (بلوغ سن الرشد)","description":"إثبات بلوغ سن الرشد"},{"value":"paternity_proof","label":"إقرار مشفوع باليمين (إقرار إثبات نسب)","description":"إثبات النسب والقرابة"},{"value":"partial_exit_exemption","label":"إقرار مشفوع باليمين (إعفاء خروج جزئي)","description":"إقرار إعفاء خروج جزئي"},{"value":"proof_of_life","label":"إقرار مشفوع باليمين (إثبات حياة)","description":"إثبات أن الشخص على قيد الحياة"},{"value":"craftsmen_lands","label":"إقرار مشفوع باليمين (أراضي الحرفيين)","description":"إقرار خاص بأراضي الحرفيين"},{"value":"general_sworn_2","label":"إقرار مشفوع باليمين","description":"إقرار عام مشفوع باليمين"},{"value":"marriage_no_objection_sworn","label":"استمارة عدم ممانعة وشهادة كفاءة زواج","description":"إقرار عدم ممانعة الزواج مشفوع باليمين"},{"value":"marital_status_single","label":"إثبات حالة إجتماعية (غير متزوج/ة)","description":"إثبات الحالة الاجتماعية - أعزب"},{"value":"agent_dismissal","label":"إقرار مشفوع باليمين (إقرار بعزل موكل من وكالة)","description":"إقرار عزل موكل من وكالة"},{"value":"marital_status_widow","label":"إقرار مشفوع باليمين (إثبات حالة إجتماعية أرملة)","description":"إثبات الحالة الاجتماعية - أرملة"},{"value":"sworn_english","label":"إقرار باليمين (باللغة الانجليزية)","description":"إقرار مشفوع باليمين باللغة الإنجليزية"},{"value":"marital_status_single_2","label":"إقرار مشفوع باليمين (إثبات حالة إجتماعية غير متزوج)","description":"إثبات الحالة الاجتماعية - غير متزوج"},{"value":"agent_dismissal_2","label":"إقرار مشفوع باليمين (إقرار عزل موكل)","description":"إقرار عزل موكل"},{"value":"document_authenticity","label":"إقرار مشفوع باليمين (إثبات صحة وثائق)","description":"إثبات صحة الوثائق والمستندات"},{"value":"name_identity","label":"إقرار مشفوع باليمين (إثبات اسمان لذات واحدة)","description":"إثبات أن اسمين لشخص واحد"},{"value":"housing_plan","label":"إقرار مشفوع باليمين (خطة إسكانية)","description":"إقرار خاص بالخطة الإسكانية"},{"value":"other_sworn","label":"اخرى","description":"إقرارات أخرى مشفوعة باليمين"}]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'declarationSubject', 'text',
   'موضوع الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"موضوع الإقرار مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"swornSubtype","values":["general_sworn","general_sworn_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'declarationContent', 'textarea',
   'نص الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نص الإقرار مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"swornSubtype","values":["general_sworn","general_sworn_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'declarationContentEnglish', 'textarea',
   'Declaration Content (in English)', NULL, NULL, NULL, 'Please enter all the declaration details in English', NULL, NULL,
   true, '{"required":"Declaration content is required"}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"swornSubtype","values":["sworn_english"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'personName', 'text',
   'اسم الشخص', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشخص مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{"field":"swornSubtype","values":["age_of_majority","proof_of_life","marital_status_single","marital_status_widow","marital_status_single_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'personNationalId', 'text',
   'رقم الهوية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الهوية مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"swornSubtype","values":["age_of_majority","proof_of_life","marital_status_single","marital_status_widow","marital_status_single_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'currentAge', 'number',
   'العمر الحالي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العمر الحالي مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"swornSubtype","values":["age_of_majority"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'majorityPurpose', 'textarea',
   'الغرض من إثبات بلوغ سن الرشد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من الإثبات مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{"field":"swornSubtype","values":["age_of_majority"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'childName', 'text',
   'اسم الطفل/الشخص', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطفل مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{"field":"swornSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'fatherName', 'text',
   'اسم الوالد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوالد مطلوب"}'::jsonb, '[]'::jsonb, 10, TRUE, '{"field":"swornSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'motherName', 'text',
   'اسم الوالدة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوالدة مطلوب"}'::jsonb, '[]'::jsonb, 11, TRUE, '{"field":"swornSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'birthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 12, TRUE, '{"field":"swornSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'birthPlace', 'text',
   'مكان الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 13, TRUE, '{"field":"swornSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'paternityReason', 'textarea',
   'سبب طلب إثبات النسب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب طلب إثبات النسب مطلوب"}'::jsonb, '[]'::jsonb, 14, TRUE, '{"field":"swornSubtype","values":["paternity_proof"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'lastSeenDate', 'date',
   'تاريخ آخر مشاهدة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ آخر مشاهدة مطلوب"}'::jsonb, '[]'::jsonb, 15, TRUE, '{"field":"swornSubtype","values":["proof_of_life"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'currentLocation', 'text',
   'المكان الحالي للشخص', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المكان الحالي مطلوب"}'::jsonb, '[]'::jsonb, 16, TRUE, '{"field":"swornSubtype","values":["proof_of_life"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'proofPurpose', 'textarea',
   'الغرض من إثبات الحياة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من الإثبات مطلوب"}'::jsonb, '[]'::jsonb, 17, TRUE, '{"field":"swornSubtype","values":["proof_of_life"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'statusPurpose', 'textarea',
   'الغرض من إثبات الحالة الاجتماعية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من الإثبات مطلوب"}'::jsonb, '[]'::jsonb, 18, TRUE, '{"field":"swornSubtype","values":["marital_status_single","marital_status_widow","marital_status_single_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'agentName', 'text',
   'اسم الموكل المراد عزله', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الموكل مطلوب"}'::jsonb, '[]'::jsonb, 19, TRUE, '{"field":"swornSubtype","values":["agent_dismissal","agent_dismissal_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'agentDismissalReason', 'textarea',
   'سبب عزل الموكل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب عزل الموكل مطلوب"}'::jsonb, '[]'::jsonb, 20, TRUE, '{"field":"swornSubtype","values":["agent_dismissal","agent_dismissal_2"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'documentsDetails', 'textarea',
   'تفاصيل الوثائق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الوثائق مطلوبة"}'::jsonb, '[]'::jsonb, 21, TRUE, '{"field":"swornSubtype","values":["document_authenticity"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'documentIssueAuthority', 'text',
   'جهة إصدار الوثائق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"جهة إصدار الوثائق مطلوبة"}'::jsonb, '[]'::jsonb, 22, TRUE, '{"field":"swornSubtype","values":["document_authenticity"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'documentIssueDate', 'date',
   'تاريخ إصدار الوثائق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ إصدار الوثائق مطلوب"}'::jsonb, '[]'::jsonb, 23, TRUE, '{"field":"swornSubtype","values":["document_authenticity"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'correctName', 'text',
   'الاسم الصحيح', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الاسم الصحيح مطلوب"}'::jsonb, '[]'::jsonb, 24, TRUE, '{"field":"swornSubtype","values":["name_identity"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'incorrectName', 'text',
   'الاسم الخطأ', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الاسم الخطأ مطلوب"}'::jsonb, '[]'::jsonb, 25, TRUE, '{"field":"swornSubtype","values":["name_identity"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'nameIdentityDetails', 'textarea',
   'تفاصيل الأسماء', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الأسماء مطلوبة"}'::jsonb, '[]'::jsonb, 26, TRUE, '{"field":"swornSubtype","values":["name_identity"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'housingPlanDetails', 'textarea',
   'تفاصيل الخطة الإسكانية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الخطة الإسكانية مطلوبة"}'::jsonb, '[]'::jsonb, 27, TRUE, '{"field":"swornSubtype","values":["housing_plan"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'landDetails', 'textarea',
   'تفاصيل أراضي الحرفيين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل أراضي الحرفيين مطلوبة"}'::jsonb, '[]'::jsonb, 28, TRUE, '{"field":"swornSubtype","values":["craftsmen_lands"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'exemptionReason', 'textarea',
   'سبب الإعفاء', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الإعفاء مطلوب"}'::jsonb, '[]'::jsonb, 29, TRUE, '{"field":"swornSubtype","values":["partial_exit_exemption"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار المشفوع باليمين', NULL, 'otherDetails', 'textarea',
   'تفاصيل أخرى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"التفاصيل مطلوبة"}'::jsonb, '[]'::jsonb, 30, TRUE, '{"field":"swornSubtype","values":["other_sworn"]}'::jsonb),
  ('witnesses-info', 'بيانات الشهود', NULL, 'witnessName1', 'text',
   'اسم الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('witnesses-info', 'بيانات الشهود', NULL, 'witnessId1', 'text',
   'رقم هوية الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم هوية الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('witnesses-info', 'بيانات الشهود', NULL, 'witnessName2', 'text',
   'اسم الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('witnesses-info', 'بيانات الشهود', NULL, 'witnessId2', 'text',
   'رقم هوية الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة الجواز أو الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز أو الإقامة مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'witnessId1Copy', 'file',
   'صورة هوية الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة هوية الشاهد الأول مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'witnessId2Copy', 'file',
   'صورة هوية الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'مستندات داعمة', NULL, NULL, NULL, 'أي مستندات إضافية تدعم الإقرار', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'sworn_declarations';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة الجواز أو الإقامة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة هوية الشاهد الأول', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('صورة هوية الشاهد الثاني', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('مستندات داعمة', NULL, 'أي مستندات إضافية تدعم الإقرار', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'sworn_declarations';

