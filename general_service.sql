-- ========================================
-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config, parent_id
  ) VALUES (
    'تواكيل منوعة',
    NULL,
    'general',
    'تواكيل منوعة لجميع الأغراض والمعاملات',
    NULL,
    'FileText',
    'legal',
    '{"base":180,"currency":"ريال سعودي"}',
    '1-2 يوم عمل'::jsonb,
    TRUE,
    '{"process":["تحديد الغرض من التوكيل","ملء البيانات المطلوبة","حضور الموكل شخصياً","التوقيع أمام الموظف المختص","ختم وتوثيق التوكيل"],"hasSubcategories":false,"subcategories":[]}'::jsonb,
    (SELECT id FROM services WHERE slug = 'power-of-attorney')
  )
  ON CONFLICT (slug, parent_id)
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'general' AND parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');

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
  ('إثبات جواز الموكل والوكيل', NULL, 1, TRUE, '{}'::jsonb),
  ('تحديد الغرض من التوكيل بوضوح', NULL, 2, TRUE, '{}'::jsonb),
  ('شهود (عند الحاجة)', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'general' AND services.parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('general-details', 'تفاصيل التوكيل', NULL, 'agentName', 'text',
   'اسم الوكيل (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوكيل مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'agentId', 'text',
   'رقم جواز الوكيل', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الوكيل مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'generalType', 'searchable-select',
   'نوع التوكيل العام', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع التوكيل العام مطلوب"}'::jsonb, '[{"value":"new_id_card","label":"استخراج بطاقة جديدة","description":"استخراج بطاقة/هوية/بديل لأول مرة حسب الجهة"},{"value":"replacement_sim","label":"استخرج شريحة بدل فاقد","description":"استخراج شريحة هاتف بدل فاقد"},{"value":"transfer_error_form","label":"استمارة تحويل مبلغ بالخطأ","description":"معالجة تحويل مالي تم بالخطأ"},{"value":"account_management","label":"ادارة حساب","description":"إدارة حساب بنكي/خدمات مرتبطة"},{"value":"saudi_insurance_form","label":"استمارة التأمين السعودي","description":"إجراءات متعلقة بشركات التأمين السعودية"},{"value":"general_procedure_form","label":"استمارة عامة لإجراء محدد","description":"إنهاء إجراء إداري محدد لدى جهة ما"},{"value":"foreign_embassy_memo","label":"استمارة مذكرة لسفارة أجنبية","description":"مخاطبة/مراسلة سفارة أجنبية"},{"value":"document_authentication","label":"إسناد مستندات وإثبات صحة","description":"توثيق/تصديق مستندات وإثبات صحتها"},{"value":"other_general","label":"أخرى","description":"طلب عام غير مصنّف"}]'::jsonb, 2, TRUE, '{}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'telecomCompany', 'select',
   'شركة الاتصالات', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"شركة الاتصالات مطلوبة"}'::jsonb, '[{"value":"stc","label":"STC - شركة الاتصالات السعودية"},{"value":"mobily","label":"Mobily - اتحاد اتصالات"},{"value":"zain","label":"Zain - زين السعودية"},{"value":"virgin","label":"Virgin Mobile - فيرجن موبايل"},{"value":"lebara","label":"Lebara - ليبارا"},{"value":"other","label":"أخرى"}]'::jsonb, 3, TRUE, '{"field":"generalType","values":["replacement_sim","new_id_card"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'phoneNumber', 'tel',
   'رقم الجوال المرتبط', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"generalType","values":["replacement_sim"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'bankName', 'select',
   'اسم البنك', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم البنك مطلوب"}'::jsonb, '[{"value":"alahli","label":"البنك الأهلي السعودي"},{"value":"alrajhi","label":"مصرف الراجحي"},{"value":"riyad","label":"بنك الرياض"},{"value":"inma","label":"بنك الإنماء"},{"value":"samba","label":"بنك سامبا"},{"value":"other","label":"بنك آخر"}]'::jsonb, 5, TRUE, '{"field":"generalType","values":["transfer_error_form","account_management","saudi_insurance_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'accountNumber', 'text',
   'رقم الحساب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الحساب مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"generalType","values":["account_management"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'transferAmount', 'number',
   'مبلغ التحويل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مبلغ التحويل مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"generalType","values":["transfer_error_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'beneficiaryName', 'text',
   'اسم المستفيد الذي تم التحويل له بالخطأ', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المستفيد مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{"field":"generalType","values":["transfer_error_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'beneficiaryAccount', 'text',
   'رقم حساب المستفيد الذي تم التحويل له بالخطأ', NULL, NULL, NULL, 'اكتب رقم الحساب كما يظهر في التحويل', NULL, NULL,
   true, '{"required":"رقم حساب المستفيد مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{"field":"generalType","values":["transfer_error_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'insuranceCompany', 'select',
   'شركة التأمين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"شركة التأمين مطلوبة"}'::jsonb, '[{"value":"tawuniya","label":"التعاونية للتأمين"},{"value":"allianz","label":"أليانز السعودية"},{"value":"bupa","label":"بوبا العربية"},{"value":"medgulf","label":"مدجلف للتأمين"},{"value":"other","label":"أخرى"}]'::jsonb, 10, TRUE, '{"field":"generalType","values":["saudi_insurance_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'iban', 'text',
   'رقم الآيبان لتحويل المبلغ', NULL, NULL, NULL, 'صيغة آيبان السعودية: يبدأ بـ SA ويليه 22 رقم (مثال: SA0310000000000000000000)', NULL, NULL,
   true, '{"required":"رقم الآيبان مطلوب","pattern":"صيغة الآيبان غير صحيحة (يجب أن يبدأ بـ SA ويليه 22 رقم)"}'::jsonb, '[]'::jsonb, 11, TRUE, '{"field":"generalType","values":["saudi_insurance_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'insuranceNote', 'textarea',
   'تفاصيل إضافية لطلب التأمين (اختياري)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '{"field":"generalType","values":["saudi_insurance_form"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'procedureDescription', 'textarea',
   'وصف الإجراء المطلوب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وصف الإجراء مطلوب"}'::jsonb, '[]'::jsonb, 13, TRUE, '{"field":"generalType","values":["general_procedure_form","foreign_embassy_memo","other_general"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'embassyName', 'text',
   'اسم السفارة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم السفارة مطلوب"}'::jsonb, '[]'::jsonb, 14, TRUE, '{"field":"generalType","values":["foreign_embassy_memo"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'documentType', 'select',
   'نوع المستند', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع المستند مطلوب"}'::jsonb, '[{"value":"educational","label":"شهادة تعليمية"},{"value":"commercial","label":"مستند تجاري"},{"value":"legal","label":"مستند قانوني"},{"value":"personal","label":"مستند شخصي"},{"value":"other","label":"أخرى"}]'::jsonb, 15, TRUE, '{"field":"generalType","values":["document_authentication"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'poaScope', 'textarea',
   'الغرض من التوكيل', NULL, NULL, NULL, 'حدد بوضوح الصلاحيات الممنوحة للوكيل', NULL, NULL,
   true, '{"required":"الغرض من التوكيل مطلوب"}'::jsonb, '[]'::jsonb, 16, TRUE, '{}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'poaUsageCountry', 'searchable-select',
   'مكان استخدام التوكيل (الدولة)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان استخدام التوكيل مطلوب"}'::jsonb, '[{"value":"saudi_arabia","label":"المملكة العربية السعودية"},{"value":"sudan","label":"جمهورية السودان"},{"value":"egypt","label":"جمهورية مصر العربية"},{"value":"uae","label":"الإمارات العربية المتحدة"},{"value":"kuwait","label":"دولة الكويت"},{"value":"qatar","label":"دولة قطر"},{"value":"bahrain","label":"مملكة البحرين"},{"value":"oman","label":"سلطنة عمان"},{"value":"jordan","label":"المملكة الأردنية الهاشمية"},{"value":"other","label":"دولة أخرى"}]'::jsonb, 17, TRUE, '{}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'poaUsageCountryOther', 'text',
   'حدد اسم الدولة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الدولة مطلوب"}'::jsonb, '[]'::jsonb, 18, TRUE, '{"field":"poaUsageCountry","values":["other"]}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'witness1Name', 'text',
   'اسم الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 19, TRUE, '{"field":"generalType","values":["new_id_card","replacement_sim","transfer_error_form","account_management","saudi_insurance_form","general_procedure_form","other_general"],"exclude":true}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'witness1Id', 'text',
   'رقم جواز سفر الشاهد الأول', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 20, TRUE, '{"field":"generalType","values":["new_id_card","replacement_sim","transfer_error_form","account_management","saudi_insurance_form","general_procedure_form","other_general"],"exclude":true}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'witness2Name', 'text',
   'اسم الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 21, TRUE, '{"field":"generalType","values":["new_id_card","replacement_sim","transfer_error_form","account_management","saudi_insurance_form","general_procedure_form","other_general"],"exclude":true}'::jsonb),

  ('general-details', 'تفاصيل التوكيل', NULL, 'witness2Id', 'text',
   'رقم جواز سفر الشاهد الثاني', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 22, TRUE, '{"field":"generalType","values":["new_id_card","replacement_sim","transfer_error_form","account_management","saudi_insurance_form","general_procedure_form","other_general"],"exclude":true}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'principalPassportCopy', 'file',
   'صورة جواز السفر الموكل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز السفر الموكل مطلوبة"}'::jsonb, '[]'::jsonb, 23, TRUE, '{}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'agentPassportCopy', 'file',
   'صورة جواز السفر الوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز السفر الوكيل مطلوبة"}'::jsonb, '[]'::jsonb, 24, TRUE, '{}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'witness1PassportCopy', 'file',
   'صورة جواز السفر الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{"required":"صورة جواز السفر الشاهد الأول مطلوبة"}'::jsonb, '[]'::jsonb, 25, TRUE, '{"field":"generalType","values":["new_id_card","replacement_sim","transfer_error_form","account_management","saudi_insurance_form","general_procedure_form","other_general"],"exclude":true}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'witness2PassportCopy', 'file',
   'صورة جواز السفر الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{"required":"صورة جواز السفر الشاهد الثاني مطلوبة"}'::jsonb, '[]'::jsonb, 26, TRUE, '{"field":"generalType","values":["new_id_card","replacement_sim","transfer_error_form","account_management","saudi_insurance_form","general_procedure_form","other_general"],"exclude":true}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'مستندات داعمة', NULL, NULL, NULL, 'أي مستندات إضافية تدعم التوكيل', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 27, TRUE, '{}'::jsonb)
) AS fld(step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value, is_required, validation_rules, options, order_index, is_active, conditions)
WHERE services.slug = 'general' AND services.parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');