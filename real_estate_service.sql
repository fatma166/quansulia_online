-- ========================================
-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config, parent_id
  ) VALUES (
    'عقارات وأراضي',
    NULL,
    'real-estate',
    'توكيل للمعاملات العقارية وبيع وشراء الأراضي',
    NULL,
    'Building',
    'legal',
    '{"base":300,"currency":"ريال سعودي"}',
    '1-2 يوم عمل'::jsonb,
    TRUE,
    '{"process":["تحديد نوع المعاملة العقارية","ملء البيانات المطلوبة","حضور الموكل شخصياً","التوقيع أمام الموظف المختص","ختم وتوثيق التوكيل"],"hasSubcategories":false,"subcategories":[]}'::jsonb,
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'real-estate' AND parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');

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
  ('صكوك الملكية أو عقود الإيجار', NULL, 2, TRUE, '{}'::jsonb),
  ('شهادة إثبات الملكية (في حالة البيع)', NULL, 3, TRUE, '{}'::jsonb),
  ('تحديد العقار أو الأرض بدقة', NULL, 4, TRUE, '{}'::jsonb),
  ('تحديد الغرض من التوكيل بوضوح', NULL, 5, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'real-estate' AND services.parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');

-- إدراج الحقول - نظراً لكثرة الحقول، سأقوم بتقسيمها
-- الجزء الأول: الحقول الأساسية
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('property-details', 'تفاصيل العقار', NULL, 'transactionType', 'select',
   'نوع المعاملة العقارية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع المعاملة العقارية مطلوب"}'::jsonb, '[{"value":"buy_land_property","label":"شراء ارض أو عقار","description":"توكيل لشراء أرض أو عقار"},{"value":"land_gift","label":"هبة قطعة ارض","description":"توكيل لهبة قطعة أرض"},{"value":"buy_property_egypt","label":"شراء عقار بمصر","description":"توكيل لشراء عقار في مصر"},{"value":"release_seizure_sell","label":"فك حجز وبيع ارض أو عقار","description":"توكيل لفك الحجز وبيع أرض أو عقار"},{"value":"search_certificate","label":"شهادة بحث بغرض التأكد","description":"توكيل للحصول على شهادة بحث للتأكد"},{"value":"mortgage_land","label":"رهن قطعة أرض","description":"توكيل لرهن قطعة أرض"},{"value":"register_land","label":"تسجيل قطعة أرض","description":"توكيل لتسجيل ملكية قطعة أرض"},{"value":"waive_land","label":"تنازل قطعة أرض","description":"توكيل للتنازل عن قطعة أرض"},{"value":"reserve_land","label":"حجز قطعة ارض","description":"توكيل لحجز قطعة أرض"},{"value":"sell_land","label":"بيع قطعة أرض","description":"توكيل لبيع قطعة أرض"},{"value":"supervise_land","label":"إشراف على قطعة ارض","description":"توكيل للإشراف على قطعة أرض"},{"value":"gift_land_property","label":"هبة قطعة ارض أو عقار","description":"توكيل لهبة أرض أو عقار"},{"value":"waive_land_property","label":"تنازل عن قطعة ارض أو عقار","description":"توكيل للتنازل عن أرض أو عقار"},{"value":"sell_land_property","label":"بيع ارض أو عقار","description":"توكيل لبيع أرض أو عقار"},{"value":"search_certificate_division","label":"شهادة بحث بغرض التأكد وقسمة الإفراز","description":"توكيل للحصول على شهادة بحث وقسمة الإفراز"},{"value":"accept_gift","label":"قبول الهبة","description":"توكيل لقبول الهبة"},{"value":"buy_property","label":"شراء عقار","description":"توكيل لشراء عقار"},{"value":"mortgage_property","label":"رهن عقار","description":"توكيل لرهن عقار"},{"value":"reserve_property","label":"حجز عقار","description":"توكيل لحجز عقار"},{"value":"register_property","label":"تسجيل عقار","description":"توكيل لتسجيل ملكية عقار"},{"value":"sell_property","label":"بيع عقار","description":"توكيل لبيع عقار"},{"value":"waive_property","label":"تنازل عن عقار","description":"توكيل للتنازل عن عقار"},{"value":"supervise_property","label":"إشراف على عقار","description":"توكيل للإشراف على عقار"},{"value":"add_services_property","label":"ادخال خدمات على عقار","description":"توكيل لإدخال خدمات على عقار"},{"value":"gift_irrigation","label":"هبة ساقية","description":"توكيل لهبة ساقية"},{"value":"reserve_irrigation","label":"حجز ساقية","description":"توكيل لحجز ساقية"},{"value":"sell_irrigation","label":"بيع ساقية","description":"توكيل لبيع ساقية"},{"value":"buy_apartment_egypt","label":"شراء شقة بمصر","description":"توكيل لشراء شقة في مصر"},{"value":"other_real_estate","label":"اخري","description":"توكيل لمعاملات عقارية أخرى"}]'::jsonb, 0, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'agentName', 'text',
   'اسم الوكيل (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الوكيل مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'agentId', 'text',
   'رقم جواز الوكيل', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الوكيل مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'poaUsageCountry', 'searchable-select',
   'مكان استخدام التوكيل (الدولة)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان استخدام التوكيل مطلوب"}'::jsonb, '[{"value":"saudi_arabia","label":"المملكة العربية السعودية"},{"value":"sudan","label":"جمهورية السودان"},{"value":"egypt","label":"جمهورية مصر العربية"},{"value":"uae","label":"الإمارات العربية المتحدة"},{"value":"kuwait","label":"دولة الكويت"},{"value":"qatar","label":"دولة قطر"},{"value":"bahrain","label":"مملكة البحرين"},{"value":"oman","label":"سلطنة عمان"},{"value":"jordan","label":"المملكة الأردنية الهاشمية"},{"value":"other","label":"دولة أخرى"}]'::jsonb, 3, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'poaUsageCountryOther', 'text',
   'حدد اسم الدولة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الدولة مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"poaUsageCountry","values":["other"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'witness1Name', 'text',
   'اسم الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'witness1Id', 'text',
   'رقم جواز سفر الشاهد الأول', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'witness2Name', 'text',
   'اسم الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'witness2Id', 'text',
   'رقم جواز سفر الشاهد الثاني', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'plotNumber', 'text',
   'رقم قطعة الأرض / رقم العقار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم قطعة الأرض / رقم العقار مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'propertyArea', 'text',
   'المساحة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المساحة مطلوبة"}'::jsonb, '[]'::jsonb, 10, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'propertyCity', 'text',
   'المدينة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المدينة مطلوبة"}'::jsonb, '[]'::jsonb, 11, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'propertyDistrict', 'text',
   'الحي / المربع', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الحي / المربع مطلوب"}'::jsonb, '[]'::jsonb, 12, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'poaPurpose', 'textarea',
   'الغرض من التوكيل', NULL, NULL, NULL, 'حدد بوضوح الغرض من التوكيل', NULL, NULL,
   true, '{"required":"الغرض من التوكيل مطلوب"}'::jsonb, '[]'::jsonb, 13, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'propertyLocation', 'text',
   'موقع العقار/الأرض', NULL, NULL, NULL, 'وصف إضافي للموقع إذا لزم الأمر', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 14, TRUE, '{}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'propertyValue', 'number',
   'قيمة العقار/الأرض', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"قيمة العقار/الأرض مطلوبة"}'::jsonb, '[]'::jsonb, 15, TRUE, '{"field":"transactionType","values":["buy_property_egypt","sell_land","sell_land_property","buy_property","sell_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'gifteeDetails', 'textarea',
   'بيانات الموهوب له', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"بيانات الموهوب له مطلوبة"}'::jsonb, '[]'::jsonb, 16, TRUE, '{"field":"transactionType","values":["gift_irrigation"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'giftCertificate', 'textarea',
   'اشهاد الهبة', NULL, NULL, NULL, 'تفاصيل اشهاد الهبة', NULL, NULL,
   true, '{"required":"اشهاد الهبة مطلوب"}'::jsonb, '[]'::jsonb, 17, TRUE, '{"field":"transactionType","values":["accept_gift"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'mortgageAmount', 'number',
   'مبلغ الرهن', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مبلغ الرهن مطلوب"}'::jsonb, '[]'::jsonb, 18, TRUE, '{"field":"transactionType","values":["mortgage_land","mortgage_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'mortgageDuration', 'text',
   'مدة الرهن', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مدة الرهن مطلوبة"}'::jsonb, '[]'::jsonb, 19, TRUE, '{"field":"transactionType","values":["mortgage_land","mortgage_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'seizureReason', 'textarea',
   'سبب الحجز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الحجز مطلوب"}'::jsonb, '[]'::jsonb, 20, TRUE, '{"field":"transactionType","values":["release_seizure_sell","reserve_land","reserve_property","reserve_irrigation"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'searchPurpose', 'textarea',
   'الغرض من البحث', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من البحث مطلوب"}'::jsonb, '[]'::jsonb, 21, TRUE, '{"field":"transactionType","values":["search_certificate","search_certificate_division"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'irrigationDetails', 'textarea',
   'تفاصيل الساقية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الساقية مطلوبة"}'::jsonb, '[]'::jsonb, 22, TRUE, '{"field":"transactionType","values":["gift_irrigation","reserve_irrigation","sell_irrigation"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'countryLocation', 'text',
   'الموقع في مصر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الموقع في مصر مطلوب"}'::jsonb, '[]'::jsonb, 23, TRUE, '{"field":"transactionType","values":["buy_property_egypt","buy_apartment_egypt"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'supervisionDuration', 'text',
   'مدة الإشراف', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مدة الإشراف مطلوبة"}'::jsonb, '[]'::jsonb, 24, TRUE, '{"field":"transactionType","values":["supervise_land","supervise_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'reportNumber', 'text',
   'رقم البلاغ', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم البلاغ مطلوب"}'::jsonb, '[]'::jsonb, 25, TRUE, '{"field":"transactionType","values":["supervise_land","supervise_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'lawsuitNumber', 'text',
   'رقم الدعوى المقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الدعوى المقامة مطلوب"}'::jsonb, '[]'::jsonb, 26, TRUE, '{"field":"transactionType","values":["supervise_land","supervise_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'competentCourt', 'text',
   'اسم المحكمة المختصة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المحكمة المختصة مطلوب"}'::jsonb, '[]'::jsonb, 27, TRUE, '{"field":"transactionType","values":["supervise_land","supervise_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'waiveReason', 'textarea',
   'سبب التنازل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب التنازل مطلوب"}'::jsonb, '[]'::jsonb, 28, TRUE, '{"field":"transactionType","values":["waive_land","waive_property","waive_land_property"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'otherDetails', 'textarea',
   'تفاصيل المعاملة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل المعاملة مطلوبة"}'::jsonb, '[]'::jsonb, 29, TRUE, '{"field":"transactionType","values":["other_real_estate"]}'::jsonb),

  ('property-details', 'تفاصيل العقار', NULL, 'propertyDescription', 'textarea',
   'وصف العقار/الأرض', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وصف العقار/الأرض مطلوب"}'::jsonb, '[]'::jsonb, 30, TRUE, '{}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'principalIdCopy', 'file',
   'صورة جواز الموكل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الموكل مطلوبة"}'::jsonb, '[]'::jsonb, 31, TRUE, '{}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'agentIdCopy', 'file',
   'صورة جواز الوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الوكيل مطلوبة"}'::jsonb, '[]'::jsonb, 32, TRUE, '{}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'propertyDeed', 'file',
   'صك الملكية أو عقد الإيجار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صك الملكية مطلوب"}'::jsonb, '[]'::jsonb, 33, TRUE, '{}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'ownershipCertificate', 'file',
   'شهادة إثبات الملكية', NULL, NULL, NULL, 'شهادة رسمية تثبت ملكية العقار/الأرض', NULL, NULL,
   true, '{"required":"شهادة إثبات الملكية مطلوبة لعمليات البيع"}'::jsonb, '[]'::jsonb, 34, TRUE, '{"field":"transactionType","values":["sell_land","sell_property","sell_land_property","release_seizure_sell","release_seizure_sell_duplicate","sell_irrigation"]}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'courtOrder', 'file',
   'قرار المحكمة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"قرار المحكمة مطلوب لفك الحجز"}'::jsonb, '[]'::jsonb, 35, TRUE, '{"field":"transactionType","values":["release_seizure_sell","release_seizure_sell_duplicate"]}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'mortgageContract', 'file',
   'عقد الرهن', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"عقد الرهن مطلوب"}'::jsonb, '[]'::jsonb, 36, TRUE, '{"field":"transactionType","values":["mortgage_land","mortgage_property"]}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'giftContract', 'file',
   'عقد الهبة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"عقد الهبة مطلوب"}'::jsonb, '[]'::jsonb, 37, TRUE, '{"field":"transactionType","values":["gift_irrigation"]}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'giftCertificateDoc', 'file',
   'وثيقة اشهاد الهبة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وثيقة اشهاد الهبة مطلوبة"}'::jsonb, '[]'::jsonb, 38, TRUE, '{"field":"transactionType","values":["accept_gift"]}'::jsonb),

  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'مستندات داعمة', NULL, NULL, NULL, 'أي مستندات إضافية تدعم المعاملة العقارية', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 39, TRUE, '{}'::jsonb)
) AS fld(step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value, is_required, validation_rules, options, order_index, is_active, conditions)
WHERE services.slug = 'real-estate' AND services.parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');