/*
  # استيراد جميع بيانات الخدمات إلى قاعدة البيانات
  
  1. الخدمات
  2. المتطلبات
  3. الحقول
  4. حقول dynamic-list
  5. المرفقات
*/

-- ========================================
-- خدمة: جوازات السفر
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'جوازات السفر',
    NULL,
    'passports',
    'إصدار وتجديد جوازات السفر السودانية',
    NULL,
    'FileText',
    'documents',
    '{"children":{"base":450,"currency":"ريال سعودي"},"adult":{"base":930,"currency":"ريال سعودي"}}',
    '{"new":"7-10 أيام عمل","renewal":"5-7 أيام عمل","replacement":"10-14 يوم عمل"}'::jsonb,
    TRUE,
    '{"process":["تقديم الطلب مع المستندات المطلوبة","مراجعة الطلب والمستندات","دفع الرسوم المقررة","التصوير والبصمات","طباعة الجواز","التسليم أو الشحن"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'passports';

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
  ('صورة من الجواز', NULL, 0, TRUE, '{}'::jsonb),
  ('حضور مقدم الطلب لمكتب تصوير الجوازات بالقنصلية', NULL, 1, TRUE, '{}'::jsonb),
  ('صورة من الجواز', NULL, 2, TRUE, '{"type":"minors_new"}'::jsonb),
  ('صورة من جواز الوصي (الأم والأب)', NULL, 3, TRUE, '{"type":"minors_new"}'::jsonb),
  ('يجب حضور الوالد وفي حالة عدم وجوده إحضار خطاب عدم ممانعة', NULL, 4, TRUE, '{"type":"minors_new"}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني', NULL, 5, TRUE, '{"type":"minors_renewal_replacement"}'::jsonb),
  ('حضور الأب أو الأم', NULL, 6, TRUE, '{"type":"minors_renewal_replacement"}'::jsonb),
  ('الجواز القديم الأصلي', NULL, 7, TRUE, '{"type":"renewal"}'::jsonb),
  ('نسخة إلكترونية من الجواز القديم', NULL, 8, TRUE, '{"type":"renewal"}'::jsonb),
  ('صورة شخصية حديثة', NULL, 9, TRUE, '{"type":"renewal"}'::jsonb),
  ('شهادة فقدان صادرة من أقرب قسم شرطة', NULL, 10, TRUE, '{"type":"replacement"}'::jsonb),
  ('نسخة من الجواز المفقود (إن وجدت)', NULL, 11, TRUE, '{"type":"replacement"}'::jsonb),
  ('صورة شخصية حديثة', NULL, 12, TRUE, '{"type":"replacement"}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني', NULL, 13, TRUE, '{"type":"emergency_adults"}'::jsonb),
  ('عدد 2 صورة شخصية حديثة بحجم جواز', NULL, 14, TRUE, '{"type":"emergency_adults"}'::jsonb),
  ('صورة شخصية حديثة بحجم جواز', NULL, 15, TRUE, '{"type":"emergency_children"}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'passports';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('details', 'تفاصيل الجواز', NULL, 'isAdult', 'radio',
   'هل المتقدم بالغ (18 سنة فأكثر)؟', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى تحديد العمر"}'::jsonb, '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'parentConsent', 'radio',
   'إحضار خطاب عدم ممانعة من الوالد', NULL, NULL, NULL, 'مطلوب فقط في حالة الإصدار لأول مرة وعدم حضور الوالد', NULL, NULL,
   true, '{"required":"يرجى تحديد الخيار المناسب"}'::jsonb, '[{"value":"yes","label":"نعم، سيتم إحضاره"},{"value":"no","label":"لا حاجة، الوالد سيحضر شخصياً"}]'::jsonb, 1, TRUE, '{"field":"isAdult","values":["no"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'passportType', 'radio',
   'نوع الطلب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الطلب مطلوب"}'::jsonb, '[{"value":"new","label":"جواز جديد","description":"إصدار جواز سفر جديد"},{"value":"renewal","label":"تجديد","description":"تجديد جواز سفر منتهي الصلاحية"},{"value":"replacement","label":"بدل فاقد","description":"بدل فاقد أو تالف"},{"value":"emergency","label":"وثيقة سفر اضطرارية","description":"وثيقة سفر مؤقتة للحالات الطارئة"}]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'oldPassportNumber', 'text',
   'رقم الجواز القديم', NULL, NULL, NULL, 'حرف كبير واحد باللغة الإنجليزية يتبعه أرقام (مثال: P12345678)', NULL, NULL,
   true, '{"required":"رقم الجواز القديم مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"passportType","values":["renewal","replacement"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'lossLocation', 'text',
   'مكان الفقدان', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الفقدان مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{"field":"passportType","values":["replacement"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'emergencyReason', 'textarea',
   'سبب طلب وثيقة السفر الاضطرارية', NULL, NULL, NULL, 'يرجى توضيح السبب الطارئ الذي يتطلب إصدار وثيقة سفر مؤقتة', NULL, NULL,
   true, '{"required":"سبب الطلب مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'birthPlace', 'text',
   'محل الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"محل الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'birthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'arrivalDate', 'date',
   'تاريخ الوصول للمملكة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الوصول للمملكة مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'height', 'number',
   'الطول (سم)', NULL, NULL, NULL, 'على المتقدم كتابة وصفه', NULL, NULL,
   true, '{"required":"الطول مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'eyeColor', 'select',
   'لون العيون', NULL, NULL, NULL, 'على المتقدم كتابة وصفه', NULL, NULL,
   true, '{"required":"لون العيون مطلوب"}'::jsonb, '[{"value":"black","label":"أسود"},{"value":"brown","label":"بني"},{"value":"green","label":"أخضر"},{"value":"blue","label":"أزرق"},{"value":"hazel","label":"عسلي"},{"value":"other","label":"أخرى"}]'::jsonb, 10, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'hairColor', 'select',
   'لون الشعر', NULL, NULL, NULL, 'على المتقدم كتابة وصفه', NULL, NULL,
   true, '{"required":"لون الشعر مطلوب"}'::jsonb, '[{"value":"black","label":"أسود"},{"value":"brown","label":"بني"},{"value":"blonde","label":"أشقر"},{"value":"gray","label":"رمادي/شايب"},{"value":"red","label":"أحمر"},{"value":"other","label":"أخرى"}]'::jsonb, 11, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'distinctiveMarks', 'textarea',
   'العلامات المميزة', NULL, NULL, NULL, 'أي علامات مميزة (مثل: شامة، ندبة، وشم، إلخ)', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '{"field":"passportType","values":["emergency"]}'::jsonb),
  ('details', 'تفاصيل الجواز', NULL, 'familyMembers', 'dynamic-list',
   'أفراد العائلة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 13, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nationalIdCopyAdult', 'file',
   'صورة من الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["new"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'personalPhoto', 'file',
   'صورة شخصية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الشخصية مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"isAdult","values":["yes"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nationalIdCopyMinor', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'minorPassportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 4, TRUE, '[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'motherPassportCopy', 'file',
   'صورة جواز الأم', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الأم مطلوبة"}'::jsonb, '[]'::jsonb, 5, TRUE, '[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'fatherPassportCopy', 'file',
   'صورة جواز الأب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الأب مطلوبة"}'::jsonb, '[]'::jsonb, 6, TRUE, '[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'childPersonalPhoto', 'file',
   'صورة شخصية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الشخصية مطلوبة"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"isAdult","values":["no"]}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'passports';

-- إدراج حقول dynamic-list
INSERT INTO service_dynamic_list_fields (
  parent_field_id, field_name, label_ar, label_en, field_type,
  is_required, order_index, validation_rules, options
)
SELECT sf.id, * FROM service_fields sf, (VALUES
  ('memberName', 'الاسم', NULL, 'text',
   true, 0, '{"required":"الاسم مطلوب"}'::jsonb, '[]'::jsonb),
  ('birthDay', 'اليوم', NULL, 'select',
   true, 1, '{"required":"اليوم مطلوب"}'::jsonb, '[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"},{"value":"7","label":"7"},{"value":"8","label":"8"},{"value":"9","label":"9"},{"value":"10","label":"10"},{"value":"11","label":"11"},{"value":"12","label":"12"},{"value":"13","label":"13"},{"value":"14","label":"14"},{"value":"15","label":"15"},{"value":"16","label":"16"},{"value":"17","label":"17"},{"value":"18","label":"18"},{"value":"19","label":"19"},{"value":"20","label":"20"},{"value":"21","label":"21"},{"value":"22","label":"22"},{"value":"23","label":"23"},{"value":"24","label":"24"},{"value":"25","label":"25"},{"value":"26","label":"26"},{"value":"27","label":"27"},{"value":"28","label":"28"},{"value":"29","label":"29"},{"value":"30","label":"30"},{"value":"31","label":"31"}]'::jsonb),
  ('birthMonth', 'الشهر', NULL, 'select',
   true, 2, '{"required":"الشهر مطلوب"}'::jsonb, '[{"value":"1","label":"يناير"},{"value":"2","label":"فبراير"},{"value":"3","label":"مارس"},{"value":"4","label":"أبريل"},{"value":"5","label":"مايو"},{"value":"6","label":"يونيو"},{"value":"7","label":"يوليو"},{"value":"8","label":"أغسطس"},{"value":"9","label":"سبتمبر"},{"value":"10","label":"أكتوبر"},{"value":"11","label":"نوفمبر"},{"value":"12","label":"ديسمبر"}]'::jsonb),
  ('birthYear', 'السنة', NULL, 'select',
   true, 3, '{"required":"السنة مطلوبة"}'::jsonb, '[{"value":"2025","label":"2025"},{"value":"2024","label":"2024"},{"value":"2023","label":"2023"},{"value":"2022","label":"2022"},{"value":"2021","label":"2021"},{"value":"2020","label":"2020"},{"value":"2019","label":"2019"},{"value":"2018","label":"2018"},{"value":"2017","label":"2017"},{"value":"2016","label":"2016"},{"value":"2015","label":"2015"},{"value":"2014","label":"2014"},{"value":"2013","label":"2013"},{"value":"2012","label":"2012"},{"value":"2011","label":"2011"},{"value":"2010","label":"2010"},{"value":"2009","label":"2009"},{"value":"2008","label":"2008"},{"value":"2007","label":"2007"},{"value":"2006","label":"2006"},{"value":"2005","label":"2005"},{"value":"2004","label":"2004"},{"value":"2003","label":"2003"},{"value":"2002","label":"2002"},{"value":"2001","label":"2001"},{"value":"2000","label":"2000"},{"value":"1999","label":"1999"},{"value":"1998","label":"1998"},{"value":"1997","label":"1997"},{"value":"1996","label":"1996"},{"value":"1995","label":"1995"},{"value":"1994","label":"1994"},{"value":"1993","label":"1993"},{"value":"1992","label":"1992"},{"value":"1991","label":"1991"},{"value":"1990","label":"1990"},{"value":"1989","label":"1989"},{"value":"1988","label":"1988"},{"value":"1987","label":"1987"},{"value":"1986","label":"1986"},{"value":"1985","label":"1985"},{"value":"1984","label":"1984"},{"value":"1983","label":"1983"},{"value":"1982","label":"1982"},{"value":"1981","label":"1981"},{"value":"1980","label":"1980"},{"value":"1979","label":"1979"},{"value":"1978","label":"1978"},{"value":"1977","label":"1977"},{"value":"1976","label":"1976"},{"value":"1975","label":"1975"},{"value":"1974","label":"1974"},{"value":"1973","label":"1973"},{"value":"1972","label":"1972"},{"value":"1971","label":"1971"},{"value":"1970","label":"1970"},{"value":"1969","label":"1969"},{"value":"1968","label":"1968"},{"value":"1967","label":"1967"},{"value":"1966","label":"1966"},{"value":"1965","label":"1965"},{"value":"1964","label":"1964"},{"value":"1963","label":"1963"},{"value":"1962","label":"1962"},{"value":"1961","label":"1961"},{"value":"1960","label":"1960"},{"value":"1959","label":"1959"},{"value":"1958","label":"1958"},{"value":"1957","label":"1957"},{"value":"1956","label":"1956"},{"value":"1955","label":"1955"},{"value":"1954","label":"1954"},{"value":"1953","label":"1953"},{"value":"1952","label":"1952"},{"value":"1951","label":"1951"},{"value":"1950","label":"1950"},{"value":"1949","label":"1949"},{"value":"1948","label":"1948"},{"value":"1947","label":"1947"},{"value":"1946","label":"1946"},{"value":"1945","label":"1945"},{"value":"1944","label":"1944"},{"value":"1943","label":"1943"},{"value":"1942","label":"1942"},{"value":"1941","label":"1941"},{"value":"1940","label":"1940"},{"value":"1939","label":"1939"},{"value":"1938","label":"1938"},{"value":"1937","label":"1937"},{"value":"1936","label":"1936"},{"value":"1935","label":"1935"},{"value":"1934","label":"1934"},{"value":"1933","label":"1933"},{"value":"1932","label":"1932"},{"value":"1931","label":"1931"},{"value":"1930","label":"1930"},{"value":"1929","label":"1929"},{"value":"1928","label":"1928"},{"value":"1927","label":"1927"},{"value":"1926","label":"1926"}]'::jsonb),
  ('memberRelationship', 'صلة القرابة', NULL, 'select',
   true, 4, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"},{"value":"husband","label":"زوج"},{"value":"mother","label":"أم"},{"value":"father","label":"أب"},{"value":"other","label":"أخرى"}]'::jsonb)
) AS dlf(field_name, label_ar, label_en, field_type, is_required, order_index, validation_rules, options)
WHERE sf.field_name = 'familyMembers'
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'passports');

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]}'::jsonb),
  ('صورة من الرقم الوطني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["new"]}]}]}'::jsonb),
  ('صورة شخصية', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 2, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"isAdult","operator":"equals","value":["yes"]}]}]}'::jsonb),
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]}'::jsonb),
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 4, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]}'::jsonb),
  ('صورة جواز الأم', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 5, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]}'::jsonb),
  ('صورة جواز الأب', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 6, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]}'::jsonb),
  ('صورة شخصية', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 7, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"isAdult","operator":"equals","value":["no"]}]}]}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'passports';

-- ========================================
-- خدمة: الإقرارات
-- ========================================

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

-- ========================================
-- خدمة: الإقرارات العادية
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الإقرارات العادية',
    NULL,
    'regular_declarations',
    'إصدار إقرارات عادية لمختلف الأغراض',
    NULL,
    'FileText',
    'legal',
    '{"base":80,"currency":"ريال سعودي"}',
    '1 يوم عمل',
    TRUE,
    '{"process":["تحديد نوع الإقرار المطلوب","ملء البيانات المطلوبة","حضور المقر شخصياً","التوقيع أمام الموظف المختص","ختم وتوثيق الإقرار"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'regular_declarations';

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
  ('تحديد موضوع الإقرار بوضوح', NULL, 2, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'regular_declarations';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'declarationAuthority', 'text',
   'جهة الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"جهة الإقرار مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'declarationSubtype', 'searchable-select',
   'نوع الإقرار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الإقرار مطلوب"}'::jsonb, '[{"value":"family_travel_consent","label":"موافقة بالسفر لأفراد أسرة","description":"إقرار موافقة على سفر أفراد الأسرة"},{"value":"wife_travel_consent","label":"موافقة سفر الزوجة","description":"إقرار موافقة على سفر الزوجة"},{"value":"marriage_no_objection","label":"استمارة عدم ممانعة وشهادة كفاءة زواج","description":"إقرار عدم الممانعة وشهادة الكفاءة للزواج"},{"value":"family_support","label":"إقرار إعالة أسرية","description":"إقرار بالإعالة الأسرية"},{"value":"children_travel_documents","label":"إقرار بموافقة السفر واستخراج مستندات للابناء","description":"إقرار موافقة السفر واستخراج مستندات للأطفال"},{"value":"children_documents_wife_travel","label":"إقرار بموافقة استخراج مستندات للأبناء والسفر بمرافقة الزوجة","description":"إقرار موافقة استخراج مستندات للأطفال والسفر مع الزوجة"},{"value":"children_id_passport","label":"إقرار باستخراج رقم وطني وجواز سفر للأبناء","description":"إقرار موافقة استخراج هوية وجواز للأطفال"},{"value":"children_travel_companion","label":"موافقة بسفر للأبناء برفقة مرافق غير الزوجة","description":"إقرار موافقة سفر الأطفال مع مرافق آخر"},{"value":"children_documents_travel","label":"موافقة استخراج مستندات للأبناء والسفر بمرافقة الزوجة","description":"إقرار موافقة استخراج مستندات والسفر مع الزوجة"},{"value":"children_travel_only","label":"موافقة بسفر للأبناء","description":"إقرار موافقة سفر الأطفال فقط"},{"value":"sponsorship_transfer_to_applicant","label":"إقرار بنقل كفالة طرف ثاني إلى كفالة مقدم الطلب","description":"إقرار نقل كفالة من طرف ثاني إلى مقدم الطلب"},{"value":"sponsorship_transfer_from_applicant","label":"إقرار بنقل كفالة مقدم الطلب إلى كفالة طرف ثاني","description":"إقرار نقل كفالة من مقدم الطلب إلى طرف ثاني"},{"value":"recruitment_third_party","label":"إقرار باستقدام على كفالة طرف ثاني","description":"إقرار استقدام على كفالة طرف ثاني"},{"value":"sponsored_transfer","label":"إقرار بنقل كفالة مكفول مقدم الطلب إلى كفالة طرف ثاني","description":"إقرار نقل كفالة مكفول إلى طرف ثاني"},{"value":"name_attribution","label":"إقرار بإسناد اسمين أو عدة اسماء لذات واحدة","description":"إقرار إسناد أسماء متعددة لشخص واحد"},{"value":"family_details","label":"إقرار بتفاصل أفراد الأسرة","description":"إقرار تفاصيل أفراد الأسرة"},{"value":"name_correction_form","label":"استمارة اشهاد تصحيح الاسم","description":"إقرار تصحيح الاسم في الوثائق"},{"value":"court_appearance","label":"الظهور في دعوى","description":"إقرار الظهور في دعوى قضائية"},{"value":"vehicle_procedures","label":"إجراءات سيارة","description":"إقرار خاص بإجراءات السيارات"},{"value":"waiver_declaration","label":"إقرار بالتنازل","description":"إقرار تنازل عن حق أو ملكية"},{"value":"agreement_declaration","label":"إقرار بالاتفاق","description":"إقرار اتفاق بين الأطراف"},{"value":"study_support_foreign_english","label":"إقرار لدعم دراسة بدولة أجنبية (إنجليزي)","description":"إقرار دعم دراسة بدولة أجنبية - يملأ باللغة الإنجليزية"},{"value":"study_support_foreign","label":"إقرار لدعم دراسة بدولة أجنبية","description":"إقرار دعم دراسة بدولة أجنبية"},{"value":"study_georgia_english","label":"إقرار بالموافقة للدراسة بجورجيا (إنجليزي)","description":"إقرار موافقة للدراسة في جورجيا - يملأ باللغة الإنجليزية"},{"value":"family_separation","label":"إقرار بإفراد الأسرة","description":"إقرار إفراد الأسرة"},{"value":"work_travel_no_objection","label":"عدم ممانعة السفر للعمل","description":"إقرار عدم ممانعة السفر للعمل"},{"value":"body_covering","label":"إقرار بشأن ستر جثمان","description":"إقرار خاص بستر الجثمان"},{"value":"other_regular","label":"اخرى","description":"إقرارات أخرى"}]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'familyMembers', 'dynamic-list',
   'أفراد الأسرة المسافرين', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب إضافة فرد واحد على الأقل"}'::jsonb, '[]'::jsonb, 2, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'travelDestination', 'text',
   'وجهة السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وجهة السفر مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent","wife_travel_consent","children_travel_companion","children_travel_only","work_travel_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'travelPurpose', 'select',
   'الغرض من السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الغرض من السفر مطلوب"}'::jsonb, '[{"value":"tourism","label":"سياحة"},{"value":"medical","label":"علاج"},{"value":"education","label":"تعليم"},{"value":"work","label":"عمل"},{"value":"family_visit","label":"زيارة أقارب"},{"value":"other","label":"أخرى"}]'::jsonb, 4, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent","wife_travel_consent","children_travel_companion","children_travel_only","work_travel_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'travelDuration', 'text',
   'مدة السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مدة السفر مطلوبة"}'::jsonb, '[]'::jsonb, 5, TRUE, '{"field":"declarationSubtype","values":["family_travel_consent","wife_travel_consent"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'wifeName', 'text',
   'اسم الزوجة الكامل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الزوجة مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{"field":"declarationSubtype","values":["wife_travel_consent","children_documents_wife_travel","children_documents_travel"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'wifeNationalId', 'text',
   'رقم هوية الزوجة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم هوية الزوجة مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{"field":"declarationSubtype","values":["wife_travel_consent"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'accompaniedByHusband', 'radio',
   'هل ستسافر بصحبة الزوج؟', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى تحديد ما إذا كانت ستسافر مع الزوج"}'::jsonb, '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا"}]'::jsonb, 8, TRUE, '{"field":"declarationSubtype","values":["wife_travel_consent"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'groomName', 'text',
   'اسم العريس الكامل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم العريس مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'groomNationalId', 'text',
   'رقم هوية العريس', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم هوية العريس مطلوب"}'::jsonb, '[]'::jsonb, 10, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'brideName', 'text',
   'اسم العروس الكامل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم العروس مطلوب"}'::jsonb, '[]'::jsonb, 11, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'brideNationalId', 'text',
   'رقم هوية العروس', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم هوية العروس مطلوب"}'::jsonb, '[]'::jsonb, 12, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'marriageDate', 'date',
   'تاريخ الزواج المتوقع', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الزواج مطلوب"}'::jsonb, '[]'::jsonb, 13, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'marriageLocation', 'text',
   'مكان إجراء الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الزواج مطلوب"}'::jsonb, '[]'::jsonb, 14, TRUE, '{"field":"declarationSubtype","values":["marriage_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'supportedPersonName', 'text',
   'اسم الشخص المُعال', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشخص المُعال مطلوب"}'::jsonb, '[]'::jsonb, 15, TRUE, '{"field":"declarationSubtype","values":["family_support"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'relationshipToSupported', 'select',
   'صلة القرابة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"},{"value":"father","label":"والد"},{"value":"mother","label":"والدة"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"other","label":"أخرى"}]'::jsonb, 16, TRUE, '{"field":"declarationSubtype","values":["family_support"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'supportReason', 'textarea',
   'سبب الإعالة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الإعالة مطلوب"}'::jsonb, '[]'::jsonb, 17, TRUE, '{"field":"declarationSubtype","values":["family_support"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'childrenList', 'dynamic-list',
   'بيانات الأطفال', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب إضافة طفل واحد على الأقل"}'::jsonb, '[]'::jsonb, 18, TRUE, '{"field":"declarationSubtype","values":["children_travel_documents","children_documents_wife_travel","children_id_passport","children_travel_companion","children_documents_travel","children_travel_only"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'companionName', 'text',
   'اسم المرافق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المرافق مطلوب"}'::jsonb, '[]'::jsonb, 19, TRUE, '{"field":"declarationSubtype","values":["children_travel_companion"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'companionRelation', 'select',
   'صلة القرابة بالمرافق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة بالمرافق مطلوبة"}'::jsonb, '[{"value":"uncle","label":"عم"},{"value":"aunt","label":"عمة"},{"value":"grandfather","label":"جد"},{"value":"grandmother","label":"جدة"},{"value":"brother","label":"أخ"},{"value":"sister","label":"أخت"},{"value":"friend","label":"صديق"},{"value":"other","label":"أخرى"}]'::jsonb, 20, TRUE, '{"field":"declarationSubtype","values":["children_travel_companion"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'sponsorshipFromParty', 'text',
   'اسم الطرف الثاني (المحول منه)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطرف الثاني مطلوب"}'::jsonb, '[]'::jsonb, 21, TRUE, '{"field":"declarationSubtype","values":["sponsorship_transfer_to_applicant"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'sponsorshipToParty', 'text',
   'اسم الطرف الثاني (المحول إليه)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطرف الثاني مطلوب"}'::jsonb, '[]'::jsonb, 22, TRUE, '{"field":"declarationSubtype","values":["sponsorship_transfer_from_applicant","recruitment_third_party","sponsored_transfer"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'sponsorshipReason', 'textarea',
   'سبب نقل الكفالة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب نقل الكفالة مطلوب"}'::jsonb, '[]'::jsonb, 23, TRUE, '{"field":"declarationSubtype","values":["sponsorship_transfer_to_applicant","sponsorship_transfer_from_applicant","recruitment_third_party","sponsored_transfer"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'namesDetails', 'textarea',
   'تفاصيل الأسماء', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الأسماء مطلوبة"}'::jsonb, '[]'::jsonb, 24, TRUE, '{"field":"declarationSubtype","values":["name_attribution"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'familyDetailsList', 'dynamic-list',
   'أفراد الأسرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب إضافة فرد واحد على الأقل"}'::jsonb, '[]'::jsonb, 25, TRUE, '{"field":"declarationSubtype","values":["family_details","family_separation"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'nameCorrection', 'textarea',
   'تفاصيل تصحيح الاسم', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل تصحيح الاسم مطلوبة"}'::jsonb, '[]'::jsonb, 26, TRUE, '{"field":"declarationSubtype","values":["name_correction_form"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'caseDetails', 'textarea',
   'تفاصيل الدعوى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الدعوى مطلوبة"}'::jsonb, '[]'::jsonb, 27, TRUE, '{"field":"declarationSubtype","values":["court_appearance"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'vehicleDetails', 'textarea',
   'تفاصيل إجراءات السيارة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل إجراءات السيارة مطلوبة"}'::jsonb, '[]'::jsonb, 28, TRUE, '{"field":"declarationSubtype","values":["vehicle_procedures"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'waiveDetails', 'textarea',
   'تفاصيل التنازل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل التنازل مطلوبة"}'::jsonb, '[]'::jsonb, 29, TRUE, '{"field":"declarationSubtype","values":["waiver_declaration"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'agreementDetails', 'textarea',
   'تفاصيل الاتفاق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل الاتفاق مطلوبة"}'::jsonb, '[]'::jsonb, 30, TRUE, '{"field":"declarationSubtype","values":["agreement_declaration"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'studyCountry', 'text',
   'دولة الدراسة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"دولة الدراسة مطلوبة"}'::jsonb, '[]'::jsonb, 31, TRUE, '{"field":"declarationSubtype","values":["study_support_foreign_english","study_support_foreign","study_georgia_english"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'universityName', 'text',
   'اسم الجامعة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الجامعة مطلوب"}'::jsonb, '[]'::jsonb, 32, TRUE, '{"field":"declarationSubtype","values":["study_support_foreign_english","study_support_foreign","study_georgia_english"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'studentName', 'text',
   'اسم الطالب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطالب مطلوب"}'::jsonb, '[]'::jsonb, 33, TRUE, '{"field":"declarationSubtype","values":["study_support_foreign_english","study_support_foreign","study_georgia_english"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'workDestination', 'text',
   'وجهة العمل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وجهة العمل مطلوبة"}'::jsonb, '[]'::jsonb, 34, TRUE, '{"field":"declarationSubtype","values":["work_travel_no_objection"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'bodyDetails', 'textarea',
   'تفاصيل ستر الجثمان', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تفاصيل ستر الجثمان مطلوبة"}'::jsonb, '[]'::jsonb, 35, TRUE, '{"field":"declarationSubtype","values":["body_covering"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'otherDetails', 'textarea',
   'تفاصيل أخرى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"التفاصيل مطلوبة"}'::jsonb, '[]'::jsonb, 36, TRUE, '{"field":"declarationSubtype","values":["other_regular"]}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'witness1Name', 'text',
   'اسم الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 37, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'witness1Id', 'text',
   'رقم جواز الشاهد الأول', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 38, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'witness2Name', 'text',
   'اسم الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 39, TRUE, '{}'::jsonb),
  ('declaration-details', 'تفاصيل الإقرار', NULL, 'witness2Id', 'text',
   'رقم جواز الشاهد الثاني', NULL, NULL, NULL, 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)', NULL, NULL,
   true, '{"required":"رقم جواز الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 40, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة الجواز أو الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز أو الإقامة مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'supportingDocs', 'file',
   'مستندات داعمة', NULL, NULL, NULL, 'أي مستندات إضافية تدعم الإقرار', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'regular_declarations';

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
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'regular_declarations');

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
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'regular_declarations');

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
  AND sf.service_id = (SELECT id FROM services WHERE slug = 'regular_declarations');

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة الجواز أو الإقامة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('مستندات داعمة', NULL, 'أي مستندات إضافية تدعم الإقرار', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'regular_declarations';

-- ========================================
-- خدمة: الإقرارات المشفوعة باليمين
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

-- ========================================
-- خدمة: التوكيلات
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

-- ========================================
-- خدمة: التوثيق
-- ========================================

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

-- ========================================
-- خدمة: الإفادات
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

-- ========================================
-- خدمة: السجل المدني
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'السجل المدني',
    NULL,
    'civilRegistry',
    'خدمات السجل المدني والأحوال الشخصية',
    NULL,
    'Users',
    'documents',
    '{"base":80,"currency":"ريال سعودي"}',
    '2-3 أيام عمل',
    TRUE,
    '{"process":["تحديد نوع الخدمة المطلوبة","تقديم المستندات المطلوبة","مراجعة البيانات","دفع الرسوم","إصدار الوثيقة"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'civilRegistry';

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
  ('صورة من الرقم الوطني أو الجواز', NULL, 0, TRUE, '{"type":"national_id_replacement"}'::jsonb),
  ('صورة حديثة', NULL, 1, TRUE, '{"type":"national_id_replacement"}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني للوالد والوالدة', NULL, 2, TRUE, '{"type":"national_id_newborn"}'::jsonb),
  ('شهادة ميلاد أو تبليغ ولادة معتمد', NULL, 3, TRUE, '{"type":"national_id_newborn"}'::jsonb),
  ('قسيمة الزواج', NULL, 4, TRUE, '{"type":"national_id_newborn"}'::jsonb),
  ('صورة فوتوغرافية حديثة للطفل', NULL, 5, TRUE, '{"type":"national_id_newborn"}'::jsonb),
  ('حضور الوالد والطفل', NULL, 6, TRUE, '{"type":"national_id_newborn"}'::jsonb),
  ('الحضور المباشر للقنصلية بعد تأكيد الموعد', NULL, 7, TRUE, '{"type":"national_id_under12"}'::jsonb),
  ('شاهد من العصب', NULL, 8, TRUE, '{"type":"national_id_under12"}'::jsonb),
  ('شهادة ميلاد', NULL, 9, TRUE, '{"type":"national_id_under12"}'::jsonb),
  ('عدد 2 صورة فوتوغرافية', NULL, 10, TRUE, '{"type":"national_id_under12"}'::jsonb),
  ('صورة من الرقم الوطني', NULL, 11, TRUE, '{"type":"name_correction"}'::jsonb),
  ('شهادة الميلاد', NULL, 12, TRUE, '{"type":"name_correction"}'::jsonb),
  ('صورة من الجواز', NULL, 13, TRUE, '{"type":"name_correction"}'::jsonb),
  ('إشهاد شرعي', NULL, 14, TRUE, '{"type":"name_correction"}'::jsonb),
  ('نشر الجريدة الرسمية', NULL, 15, TRUE, '{"type":"name_correction"}'::jsonb),
  ('إفادة قوائم الحظر والسيطرة', NULL, 16, TRUE, '{"type":"name_correction"}'::jsonb),
  ('إفادة من الإنتربول', NULL, 17, TRUE, '{"type":"name_correction"}'::jsonb),
  ('كتابة طلب لتوضيح الأسباب بخط اليد', NULL, 18, TRUE, '{"type":"name_correction"}'::jsonb),
  ('صورة حديثة', NULL, 19, TRUE, '{"type":"name_correction"}'::jsonb),
  ('صورة من الرقم الوطني', NULL, 20, TRUE, '{"type":"age_correction"}'::jsonb),
  ('شهادة الميلاد', NULL, 21, TRUE, '{"type":"age_correction"}'::jsonb),
  ('صورة من الجواز', NULL, 22, TRUE, '{"type":"age_correction"}'::jsonb),
  ('كتابة طلب لتوضيح الأسباب بخط اليد', NULL, 23, TRUE, '{"type":"age_correction"}'::jsonb),
  ('مستندات داعمة ذات صلة', NULL, 24, TRUE, '{"type":"age_correction"}'::jsonb),
  ('صورة حديثة', NULL, 25, TRUE, '{"type":"age_correction"}'::jsonb),
  ('صورة من الجواز', NULL, 26, TRUE, '{"type":"conduct_certificate"}'::jsonb),
  ('عدد 2 صورة بطاقة', NULL, 27, TRUE, '{"type":"conduct_certificate"}'::jsonb),
  ('الحضور للقنصلية للبصمة', NULL, 28, TRUE, '{"type":"conduct_certificate"}'::jsonb),
  ('صورة من الجواز', NULL, 29, TRUE, '{"type":"towhomitmayconcern"}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'civilRegistry';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('service-details', 'تفاصيل الخدمة', NULL, 'recordType', 'select',
   'نوع السجل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع السجل مطلوب"}'::jsonb, '[{"value":"national_id","label":"الرقم الوطني"},{"value":"conduct_certificate","label":"شهادة حسن السير والسلوك (الفيش)"},{"value":"towhomitmayconcern","label":"إفادات لمن يهمهم الأمر"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'idType', 'radio',
   'نوع الخدمة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الخدمة مطلوب"}'::jsonb, '[{"value":"replacement","label":"بدل فاقد","description":"الرقم الوطني بدل فاقد"},{"value":"newborn","label":"رقم وطني للأطفال حديثي الولادة حتى 12 سنة","description":"للأطفال من الولادة حتى 12 سنة"},{"value":"under12","label":"رقم وطني لمن دون سن 12 عام","description":"للأطفال دون 12 عام (حالات خاصة)"},{"value":"name_correction","label":"تعديل الاسم أو تغييره","description":"في حالة الأخطاء"},{"value":"age_correction","label":"تعديل العمر","description":"حالة خاصة - زيادة أو نقصان"}]'::jsonb, 1, TRUE, '{"field":"recordType","values":["national_id"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'nationalId', 'text',
   'اكتب الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الرقم الوطني مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement","name_correction","age_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'motherFullName', 'text',
   'اسم الأم رباعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الأم رباعي مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement","newborn","under12","name_correction","age_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'birthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement","newborn","under12","name_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'childGender', 'radio',
   'نوع المولود', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع المولود مطلوب"}'::jsonb, '[{"value":"male","label":"ذكر"},{"value":"female","label":"أنثى"}]'::jsonb, 5, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'childFullNameArabic', 'text',
   'اسم الطفل رباعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الطفل رباعي مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'childFullNameEnglish', 'text',
   'Child''s Full Name (Four Parts)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"Child''s full name in English is required"}'::jsonb, '[]'::jsonb, 7, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'bloodType', 'select',
   'فصيلة الدم', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"فصيلة الدم مطلوبة"}'::jsonb, '[{"value":"A+","label":"A+"},{"value":"A-","label":"A-"},{"value":"B+","label":"B+"},{"value":"B-","label":"B-"},{"value":"AB+","label":"AB+"},{"value":"AB-","label":"AB-"},{"value":"O+","label":"O+"},{"value":"O-","label":"O-"}]'::jsonb, 8, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'birthRegion', 'text',
   'مكان الميلاد - المنطقة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المنطقة مطلوبة"}'::jsonb, '[]'::jsonb, 9, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'birthCity', 'text',
   'مكان الميلاد - المدينة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المدينة مطلوبة"}'::jsonb, '[]'::jsonb, 10, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'birthHospital', 'text',
   'مكان الميلاد - المستشفى', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المستشفى مطلوب"}'::jsonb, '[]'::jsonb, 11, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'fatherAttending', 'radio',
   'هل سيحضر الوالد؟', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يرجى تحديد حضور الوالد"}'::jsonb, '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا - سيحضر شهود"}]'::jsonb, 12, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness1Name', 'text',
   'اسم الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 13, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness1PassportNumber', 'text',
   'رقم جواز الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجواز مطلوب"}'::jsonb, '[]'::jsonb, 14, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness1Relation', 'select',
   'صلة القرابة للشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"uncle_paternal","label":"عم"},{"value":"brother","label":"أخ شقيق"}]'::jsonb, 15, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness1Phone', 'tel',
   'رقم هاتف الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الهاتف مطلوب"}'::jsonb, '[]'::jsonb, 16, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness2Name', 'text',
   'اسم الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 17, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness2PassportNumber', 'text',
   'رقم جواز الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجواز مطلوب"}'::jsonb, '[]'::jsonb, 18, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness2Relation', 'select',
   'صلة القرابة للشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صلة القرابة مطلوبة"}'::jsonb, '[{"value":"uncle_paternal","label":"عم"},{"value":"brother","label":"أخ شقيق"}]'::jsonb, 19, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'witness2Phone', 'tel',
   'رقم هاتف الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الهاتف مطلوب"}'::jsonb, '[]'::jsonb, 20, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'correctedName', 'text',
   'الاسم المعدل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الاسم المعدل مطلوب"}'::jsonb, '[]'::jsonb, 21, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'nameCorrectionReason', 'textarea',
   'وضح أسباب التعديل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"أسباب التعديل مطلوبة"}'::jsonb, '[]'::jsonb, 22, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'wrongBirthDate', 'date',
   'تاريخ الميلاد الخطأ', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد الخطأ مطلوب"}'::jsonb, '[]'::jsonb, 23, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'correctBirthDate', 'date',
   'تاريخ الميلاد الصحيح', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد الصحيح مطلوب"}'::jsonb, '[]'::jsonb, 24, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'ageCorrectionReason', 'textarea',
   'وضح أسباب التعديل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"أسباب التعديل مطلوبة"}'::jsonb, '[]'::jsonb, 25, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'nationalNumber', 'text',
   'الرقم الوطني', NULL, NULL, NULL, 'أدخل الرقم الوطني', NULL, NULL,
   true, '{"required":"الرقم الوطني مطلوب"}'::jsonb, '[]'::jsonb, 26, TRUE, '{"field":"recordType","values":["conduct_certificate"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'motherFullName', 'text',
   'اسم الأم رباعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الأم رباعي مطلوب"}'::jsonb, '[]'::jsonb, 27, TRUE, '{"field":"recordType","values":["conduct_certificate"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'requestingAuthority', 'text',
   'الجهة الطالبة للفيش', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الجهة الطالبة مطلوبة"}'::jsonb, '[]'::jsonb, 28, TRUE, '{"field":"recordType","values":["conduct_certificate"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'requestReason', 'select',
   'سبب طلب الفيش', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الطلب مطلوب"}'::jsonb, '[{"value":"work","label":"للعمل"},{"value":"study","label":"للدراسة"},{"value":"travel","label":"للسفر"},{"value":"residence","label":"للإقامة"},{"value":"marriage","label":"للزواج"},{"value":"government","label":"للجهات الحكومية"},{"value":"other","label":"أخرى"}]'::jsonb, 29, TRUE, '{"field":"recordType","values":["conduct_certificate"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'concernSubject', 'text',
   'الموضوع', NULL, NULL, NULL, 'عنوان أو موضوع الإفادة', NULL, NULL,
   true, '{"required":"الموضوع مطلوب"}'::jsonb, '[]'::jsonb, 30, TRUE, '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'civilRegistryData', 'textarea',
   'بيانات السجل المدني', NULL, NULL, NULL, 'أدخل بياناتك من السجل المدني (الاسم الرباعي، الرقم الوطني، تاريخ الميلاد، مكان الميلاد، إلخ)', NULL, NULL,
   true, '{"required":"بيانات السجل المدني مطلوبة"}'::jsonb, '[]'::jsonb, 31, TRUE, '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb),
  ('service-details', 'تفاصيل الخدمة', NULL, 'requestExplanation', 'textarea',
   'شرح الطلب', NULL, NULL, NULL, 'اشرح تفاصيل الطلب والغرض من الإفادة والمعلومات المطلوب إثباتها', NULL, NULL,
   true, '{"required":"شرح الطلب مطلوب"}'::jsonb, '[]'::jsonb, 32, TRUE, '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'replacementIdOrPassport', 'file',
   'صورة من الرقم الوطني أو الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الرقم الوطني أو الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'replacementPhoto', 'file',
   'صورة حديثة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الحديثة مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'newbornFatherIdOrPassport', 'file',
   'صورة من الجواز أو الرقم الوطني للوالد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز أو الرقم الوطني للوالد مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'newbornMotherIdOrPassport', 'file',
   'صورة من الجواز أو الرقم الوطني للوالدة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز أو الرقم الوطني للوالدة مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'newbornBirthCertificate', 'file',
   'شهادة ميلاد أو تبليغ ولادة معتمد (للأطفال تحت 90 يوم)', NULL, NULL, NULL, 'شهادة ميلاد أو تبليغ ولادة معتمد من دولة التمثيل في حالة الطفل لا يتجاوز 90 يوم', NULL, NULL,
   true, '{"required":"شهادة الميلاد أو تبليغ الولادة مطلوبة"}'::jsonb, '[]'::jsonb, 4, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'newbornMarriageCertificate', 'file',
   'قسيمة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"قسيمة الزواج مطلوبة"}'::jsonb, '[]'::jsonb, 5, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'newbornChildPhoto', 'file',
   'صورة فوتوغرافية حديثة للطفل', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الطفل مطلوبة"}'::jsonb, '[]'::jsonb, 6, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'under12FatherIdOrPassport', 'file',
   'صورة من الجواز أو الرقم الوطني للوالد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز أو الرقم الوطني للوالد مطلوبة"}'::jsonb, '[]'::jsonb, 7, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'under12MotherIdOrPassport', 'file',
   'صورة من الجواز أو الرقم الوطني للوالدة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز أو الرقم الوطني للوالدة مطلوبة"}'::jsonb, '[]'::jsonb, 8, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'under12BirthCertificate', 'file',
   'شهادة الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"شهادة الميلاد مطلوبة"}'::jsonb, '[]'::jsonb, 9, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'under12MarriageCertificate', 'file',
   'قسيمة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"قسيمة الزواج مطلوبة"}'::jsonb, '[]'::jsonb, 10, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'under12Photo', 'file',
   'صورة فوتوغرافية حديثة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الفوتوغرافية مطلوبة"}'::jsonb, '[]'::jsonb, 11, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'witness1Passport', 'file',
   'صورة جواز الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الشاهد الأول مطلوبة"}'::jsonb, '[]'::jsonb, 12, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'witness2Passport', 'file',
   'صورة جواز الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الشاهد الثاني مطلوبة"}'::jsonb, '[]'::jsonb, 13, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionNationalId', 'file',
   'صورة من الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb, '[]'::jsonb, 14, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionBirthCertificate', 'file',
   'شهادة الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"شهادة الميلاد مطلوبة"}'::jsonb, '[]'::jsonb, 15, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionPassport', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 16, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionLegalAffidavit', 'file',
   'إشهاد شرعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الإشهاد الشرعي مطلوب"}'::jsonb, '[]'::jsonb, 17, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionGazettePublication', 'file',
   'نشر الجريدة الرسمية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نشر الجريدة الرسمية مطلوب"}'::jsonb, '[]'::jsonb, 18, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionSanctionsClearance', 'file',
   'إفادة قوائم الحظر والسيطرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إفادة قوائم الحظر والسيطرة مطلوبة"}'::jsonb, '[]'::jsonb, 19, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionInterpolClearance', 'file',
   'إفادة من الإنتربول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إفادة من الإنتربول مطلوبة"}'::jsonb, '[]'::jsonb, 20, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionHandwrittenRequest', 'file',
   'كتابة طلب لتوضيح الأسباب بخط اليد', NULL, NULL, NULL, 'يجب أن يكون الطلب مكتوباً بخط اليد', NULL, NULL,
   true, '{"required":"الطلب المكتوب بخط اليد مطلوب"}'::jsonb, '[]'::jsonb, 21, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'nameCorrectionPhoto', 'file',
   'صورة حديثة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الحديثة مطلوبة"}'::jsonb, '[]'::jsonb, 22, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'ageCorrectionNationalId', 'file',
   'صورة من الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb, '[]'::jsonb, 23, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'ageCorrectionBirthCertificate', 'file',
   'شهادة الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"شهادة الميلاد مطلوبة"}'::jsonb, '[]'::jsonb, 24, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'ageCorrectionPassport', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 25, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'ageCorrectionHandwrittenRequest', 'file',
   'كتابة طلب لتوضيح الأسباب بخط اليد', NULL, NULL, NULL, 'يجب أن يكون الطلب مكتوباً بخط اليد', NULL, NULL,
   true, '{"required":"الطلب المكتوب بخط اليد مطلوب"}'::jsonb, '[]'::jsonb, 26, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'ageCorrectionSupportingDocs', 'file',
   'مستندات داعمة ذات صلة', NULL, NULL, NULL, 'أي مستندات تدعم طلب تعديل العمر', NULL, NULL,
   true, '{"required":"المستندات الداعمة مطلوبة"}'::jsonb, '[]'::jsonb, 27, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'ageCorrectionPhoto', 'file',
   'صورة حديثة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الصورة الحديثة مطلوبة"}'::jsonb, '[]'::jsonb, 28, TRUE, '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'conductPassportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 29, TRUE, '{"field":"recordType","values":["conduct_certificate"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'conductRecentPhoto', 'file',
   'صورة حديثة', NULL, NULL, NULL, 'صورة شخصية حديثة', NULL, NULL,
   true, '{"required":"صورة حديثة مطلوبة"}'::jsonb, '[]'::jsonb, 30, TRUE, '{"field":"recordType","values":["conduct_certificate"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'concernPassportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 31, TRUE, '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'concernRelatedFiles', 'file',
   'ملفات ذات صلة (إن وجدت)', NULL, NULL, NULL, 'أي ملفات أو مستندات ذات صلة بالطلب (اختياري)', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 32, TRUE, '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'civilRegistry';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة من الرقم الوطني أو الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement"]}]}]}'::jsonb),
  ('صورة حديثة', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 1, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement"]}]}]}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني للوالد', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني للوالدة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]}'::jsonb),
  ('شهادة ميلاد أو تبليغ ولادة معتمد (للأطفال تحت 90 يوم)', NULL, 'شهادة ميلاد أو تبليغ ولادة معتمد من دولة التمثيل في حالة الطفل لا يتجاوز 90 يوم', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 4, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]}'::jsonb),
  ('قسيمة الزواج', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 5, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]}'::jsonb),
  ('صورة فوتوغرافية حديثة للطفل', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 6, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني للوالد', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 7, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]}'::jsonb),
  ('صورة من الجواز أو الرقم الوطني للوالدة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 8, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]}'::jsonb),
  ('شهادة الميلاد', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 9, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]}'::jsonb),
  ('قسيمة الزواج', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 10, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]}'::jsonb),
  ('صورة فوتوغرافية حديثة', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 11, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]}'::jsonb),
  ('صورة جواز الشاهد الأول', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 12, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]}'::jsonb),
  ('صورة جواز الشاهد الثاني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 13, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]}'::jsonb),
  ('صورة من الرقم الوطني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 14, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('شهادة الميلاد', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 15, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 16, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('إشهاد شرعي', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 17, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('نشر الجريدة الرسمية', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 18, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('إفادة قوائم الحظر والسيطرة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 19, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('إفادة من الإنتربول', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 20, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('كتابة طلب لتوضيح الأسباب بخط اليد', NULL, 'يجب أن يكون الطلب مكتوباً بخط اليد', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 21, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('صورة حديثة', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 22, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]}'::jsonb),
  ('صورة من الرقم الوطني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 23, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]}'::jsonb),
  ('شهادة الميلاد', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 24, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]}'::jsonb),
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 25, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]}'::jsonb),
  ('كتابة طلب لتوضيح الأسباب بخط اليد', NULL, 'يجب أن يكون الطلب مكتوباً بخط اليد', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 26, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]}'::jsonb),
  ('مستندات داعمة ذات صلة', NULL, 'أي مستندات تدعم طلب تعديل العمر', NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 27, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]}'::jsonb),
  ('صورة حديثة', NULL, NULL, NULL,
   true, 2, '["jpg","jpeg","png"]'::jsonb, 28, TRUE, '{"show_when":[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]}'::jsonb),
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 29, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"recordType","operator":"equals","value":["conduct_certificate"]}]}]}'::jsonb),
  ('صورة حديثة', NULL, 'صورة شخصية حديثة', NULL,
   true, 5, '["jpg","jpeg","png"]'::jsonb, 30, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"recordType","operator":"equals","value":["conduct_certificate"]}]}]}'::jsonb),
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 31, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"recordType","operator":"equals","value":["towhomitmayconcern"]}]}]}'::jsonb),
  ('ملفات ذات صلة (إن وجدت)', NULL, 'أي ملفات أو مستندات ذات صلة بالطلب (اختياري)', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 32, TRUE, '{"show_when":[{"operator":"OR","conditions":[{"field":"recordType","operator":"equals","value":["towhomitmayconcern"]}]}]}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'civilRegistry';

-- ========================================
-- خدمة: الشؤون القانونية والأسرية
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الشؤون القانونية والأسرية',
    NULL,
    'familyAffairs',
    'خدمات قانونية وأسرية متنوعة',
    NULL,
    'Heart',
    'legal',
    '{"base":150,"currency":"ريال سعودي"}',
    '3-7 أيام عمل',
    TRUE,
    '{"process":["تحديد نوع القضية","تقديم المستندات المطلوبة","مراجعة الحالة","دفع الرسوم","إصدار الوثيقة أو القرار"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'familyAffairs';

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
  ('إثباتات هوية الأطراف', NULL, 0, TRUE, '{}'::jsonb),
  ('المستندات الداعمة حسب نوع القضية', NULL, 1, TRUE, '{}'::jsonb),
  ('شهود (عند الحاجة)', NULL, 2, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'familyAffairs';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('case-details', 'تفاصيل القضية', NULL, 'visaType', 'select',
   'نوع التأشيرة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع التأشيرة مطلوب"}'::jsonb, '[{"value":"resident","label":"مقيم"},{"value":"visit","label":"زيارة"},{"value":"umrah","label":"عمرة"},{"value":"other","label":"أخرى"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'iqamaNumber', 'text',
   'رقم الإقامة', NULL, NULL, NULL, 'أدخل 10 أرقام', NULL, NULL,
   true, '{"required":"رقم الإقامة مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'issuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الإصدار مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'issueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الإصدار مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'maritalStatus', 'select',
   'الحالة الاجتماعية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الحالة الاجتماعية مطلوبة"}'::jsonb, '[{"value":"single","label":"عازب/ة"},{"value":"married","label":"متزوج/ة"},{"value":"widowed","label":"أرمل/ة"},{"value":"divorced","label":"مطلق/ة"}]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'caseType', 'select',
   'نوع الطلب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الطلب مطلوب"}'::jsonb, '[{"value":"legal-case","label":"قضايا قانونية"},{"value":"legal-consultation","label":"استشارة قانونية"},{"value":"legal-support","label":"طلب دعم قانوني"},{"value":"family-disputes","label":"خلافات أسرية"},{"value":"external-relations","label":"مخاطبة الجهات ذات العلاقة الخارجية (جوازات - شرطة - سجون - تعليم - أخرى)"},{"value":"aid","label":"مساعدات"},{"value":"other","label":"أخرى"}]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('case-details', 'تفاصيل القضية', NULL, 'caseDescription', 'textarea',
   'وصف القضية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"وصف القضية مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'iqamaCopy', 'file',
   'صورة الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة الإقامة مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'requestDocuments', 'file',
   'إرفاق المستندات الخاصة بالطلب', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المستندات الخاصة بالطلب مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'familyAffairs';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة الإقامة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('إرفاق المستندات الخاصة بالطلب', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'familyAffairs';

-- ========================================
-- خدمة: التأشيرات
-- ========================================

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

-- ========================================
-- خدمة: الخدمات التعليمية
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الخدمات التعليمية',
    NULL,
    'education',
    'خدمات امتحانات الشهادات الدراسية للمراحل التعليمية المختلفة',
    NULL,
    'GraduationCap',
    'documents',
    '{"base":150,"currency":"ريال سعودي"}',
    '5-7 أيام عمل',
    TRUE,
    '{"process":["اختيار المرحلة التعليمية","تعبئة البيانات المطلوبة","رفع المستندات","مراجعة الطلب","دفع الرسوم","استلام وثيقة التسجيل"],"hasSubcategories":true,"subcategories":[{"id":"secondary","title":"امتحانات الشهادة الثانوية","description":"التقديم لامتحانات الشهادة الثانوية القسم العلمي والأدبي","icon":"📚","color":"from-[#276073] to-[#1e4a5a]","bgColor":"bg-[#276073]/10","route":"/services/education/secondary"},{"id":"intermediate","title":"امتحانات الشهادة المتوسطة","description":"التقديم لامتحانات الشهادة المتوسطة (الصف الثامن)","icon":"📖","color":"from-[#276073] to-[#1e4a5a]","bgColor":"bg-[#276073]/10","route":"/services/education/intermediate"},{"id":"primary","title":"امتحانات الشهادة الابتدائية","description":"التقديم لامتحانات الشهادة الابتدائية (الصف السادس)","icon":"📕","color":"from-[#276073] to-[#1e4a5a]","bgColor":"bg-[#276073]/10","route":"/services/education/primary"},{"id":"exam-supervision","title":"مراقبة الامتحانات","description":"التقديم للعمل كمراقب في الامتحانات الرسمية","icon":"👁️","color":"from-purple-500 to-purple-600","bgColor":"bg-purple-50","route":"/services/education/exam-supervision"}]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'education';

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
  ('الشهادة السابقة أو ما يعادلها', NULL, 0, TRUE, '{}'::jsonb),
  ('صورة من جواز السفر', NULL, 1, TRUE, '{}'::jsonb),
  ('صورة شخصية حديثة', NULL, 2, TRUE, '{}'::jsonb),
  ('دفع الرسوم المقررة', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'education';

-- ========================================
-- خدمة: المأذونية
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'المأذونية',
    NULL,
    'madhoonia',
    'خدمات عقود الزواج والطلاق',
    NULL,
    'FileHeart',
    'consular',
    '{"marriage":210,"divorce":100,"currency":"ريال سعودي"}',
    'يوم واحد',
    TRUE,
    '{"process":["تحديد نوع الخدمة (زواج أو طلاق)","تعبئة نموذج الطلب","إرفاق المستندات المطلوبة","الحضور الشخصي مع الشهود","إتمام الإجراء"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'madhoonia';

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
  ('إثبات الشخصية: الجواز أو الرقم الوطني (الخاطب، المخطوبة، ولي المخطوبة (الأب)، الشاهدان)', NULL, 0, TRUE, '{"type":"marriage"}'::jsonb),
  ('في حال كانت المخطوبة غائبة عن مجلس العقد: يجب احضار إقرار موافقة على الزواج', NULL, 1, TRUE, '{"type":"marriage"}'::jsonb),
  ('في حال كانت المخطوبة مطلقة: يجب إحضار أصل وثيقة الطلاق موثقة من الخارجية السودانية', NULL, 2, TRUE, '{"type":"marriage"}'::jsonb),
  ('في حال كانت المخطوبة أرملة: يجب احضار وثيقة الزواج وشهادة وفاة الزوج الأول أو الاعلام الشرعي للورثة', NULL, 3, TRUE, '{"type":"marriage"}'::jsonb),
  ('في حال غياب والد المخطوبة: يجب احضار أصل توكيل لمن ينوب عنه في الإجراءات موثق من الخارجية السودانية', NULL, 4, TRUE, '{"type":"marriage"}'::jsonb),
  ('في حال وجود الولي (والد المخطوبة) خارج السودان: يجب إحضار توكيل لمن ينوب عنه في الإجراءات صادر من السفارة السودانية بمحل إقامته', NULL, 5, TRUE, '{"type":"marriage"}'::jsonb),
  ('في حال وفاة ولي المخطوبة (الأب): يجب إبراز اثبات وفاته، أو الإعلام الشرعي للوراثة (الأصل)، وينوب عنه الولي الأقرب على ترتيب الإرث', NULL, 6, TRUE, '{"type":"marriage"}'::jsonb),
  ('القسيمة', NULL, 7, TRUE, '{"type":"divorce"}'::jsonb),
  ('صورة جواز الزوج', NULL, 8, TRUE, '{"type":"divorce"}'::jsonb),
  ('صورة جواز الزوجة', NULL, 9, TRUE, '{"type":"divorce"}'::jsonb),
  ('صورة جواز الشاهد الأول', NULL, 10, TRUE, '{"type":"divorce"}'::jsonb),
  ('صورة جواز الشاهد الثاني', NULL, 11, TRUE, '{"type":"divorce"}'::jsonb),
  ('مستندات إضافية إن وجد', NULL, 12, TRUE, '{"type":"divorce"}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'madhoonia';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('service-details', 'تفاصيل الخدمة', NULL, 'serviceType', 'radio',
   'نوع الخدمة المطلوبة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الخدمة مطلوب"}'::jsonb, '[{"value":"marriage","label":"الزواج"},{"value":"divorce","label":"الطلاق"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomFullName', 'text',
   'اسم الخاطب (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الخاطب مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomBirthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomPassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomPassportIssuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomPassportIssueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomResidenceStatus', 'select',
   'حالة الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"حالة الإقامة مطلوبة"}'::jsonb, '[{"value":"resident","label":"مقيم"},{"value":"visitor","label":"زيارة"},{"value":"umrah","label":"عمرة"}]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomResidenceNumber', 'text',
   'رقم الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '(data) => data.groomResidenceStatus === ''resident'''),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomOccupation', 'text',
   'المهنة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المهنة مطلوبة"}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomMaritalStatus', 'select',
   'الحالة الإجتماعية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الحالة الإجتماعية مطلوبة"}'::jsonb, '[{"value":"single","label":"لم يسبق له الزواج"},{"value":"divorced","label":"مطلق"},{"value":"widower","label":"أرمل"},{"value":"polygamous","label":"معدد"}]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomWivesCount', 'number',
   'عدد الزوجات', NULL, NULL, NULL, 'أدخل عدد الزوجات الحاليات', NULL, NULL,
   false, '{"min":1,"max":3}'::jsonb, '[]'::jsonb, 9, TRUE, '(data) => data.groomMaritalStatus === ''polygamous'''),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 10, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 11, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '{}'::jsonb),
  ('groom-info', 'بيانات الخاطب', NULL, 'groomMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 13, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideFullName', 'text',
   'اسم المخطوبة (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم المخطوبة مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideBirthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'bridePassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'bridePassportIssuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'bridePassportIssueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideResidenceStatus', 'select',
   'حالة الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"حالة الإقامة مطلوبة"}'::jsonb, '[{"value":"resident","label":"مقيم"},{"value":"visitor","label":"زيارة"},{"value":"umrah","label":"عمرة"}]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideResidenceNumber', 'text',
   'رقم الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '(data) => data.brideResidenceStatus === ''resident'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideOccupation', 'text',
   'المهنة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المهنة مطلوبة"}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideMaritalStatus', 'select',
   'الحالة الإجتماعية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الحالة الإجتماعية مطلوبة"}'::jsonb, '[{"value":"single","label":"لم يسبق لها الزواج"},{"value":"divorced","label":"مطلقة"},{"value":"widow","label":"أرملة"}]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideDivorceDocNumber', 'text',
   'رقم وثيقة الطلاق', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 9, TRUE, '(data) => data.brideMaritalStatus === ''divorced'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideDivorceDocIssuer', 'text',
   'جهة إصدار وثيقة الطلاق', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 10, TRUE, '(data) => data.brideMaritalStatus === ''divorced'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideMarriageCertNumber', 'text',
   'رقم وثيقة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideMarriageCertPlace', 'text',
   'مكان إصدار وثيقة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideMarriageCertDate', 'date',
   'تاريخ إصدار وثيقة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 13, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideHusbandDeathCertNumber', 'text',
   'رقم شهادة وفاة الزوج', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 14, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideHusbandDeathCertPlace', 'text',
   'مكان إصدار شهادة الوفاة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 15, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideHusbandDeathCertDate', 'date',
   'تاريخ إصدار شهادة الوفاة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 16, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideInheritanceDocNumber', 'text',
   'رقم الإعلام الشرعي للوراثة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 17, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideInheritanceDocPlace', 'text',
   'مكان إصدار الإعلام الشرعي', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 18, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideInheritanceDocDate', 'date',
   'تاريخ إصدار الإعلام الشرعي', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 19, TRUE, '(data) => data.brideMaritalStatus === ''widow'''),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 20, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 21, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 22, TRUE, '{}'::jsonb),
  ('bride-info', 'بيانات المخطوبة', NULL, 'brideMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 23, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianFullName', 'text',
   'اسم الولي (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الولي مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianRelationship', 'select',
   'صفة الولي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صفة الولي مطلوبة"}'::jsonb, '[{"value":"father","label":"أب"},{"value":"uncle","label":"عم"},{"value":"brother","label":"أخ"},{"value":"grandfather","label":"جد"},{"value":"other","label":"أخرى"}]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianPassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianPassportIssuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianPassportIssueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('guardian-info', 'بيانات الولي', NULL, 'guardianMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'hasGuardianAgent', 'radio',
   'هل يوجد وكيل للولي؟', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"هذا الحقل مطلوب"}'::jsonb, '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentFullName', 'text',
   'اسم الوكيل (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 1, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentPassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 2, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentPassportIssuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentPassportIssueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 4, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentPoaNumber', 'text',
   'رقم التوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 5, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentPoaDate', 'date',
   'تاريخ التوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentPoaIssuer', 'text',
   'جهة إصدار التوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 8, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 9, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 10, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('guardian-agent-info', 'بيانات وكيل (الولي) إن وجد', NULL, 'guardianAgentMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '(data) => data.hasGuardianAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'hasGroomAgent', 'radio',
   'هل يوجد وكيل للزوج؟', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"هذا الحقل مطلوب"}'::jsonb, '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentFullName', 'text',
   'اسم الوكيل (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 1, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentPassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 2, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentPassportIssuePlace', 'text',
   'مكان الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 3, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentPassportIssueDate', 'date',
   'تاريخ الإصدار', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 4, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentPoaNumber', 'text',
   'رقم التوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 5, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentPoaDate', 'date',
   'تاريخ التوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentPoaIssuer', 'text',
   'جهة إصدار التوكيل', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 8, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 9, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 10, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('groom-agent-info', 'بيانات وكيل (الزوج) إن وجد', NULL, 'groomAgentMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '(data) => data.hasGroomAgent === ''yes'''),
  ('dowry-info', 'بيانات الصداق (المهر)', NULL, 'dowryTotal', 'number',
   'الصداق', NULL, NULL, NULL, 'المبلغ الإجمالي للصداق', NULL, NULL,
   true, '{"required":"الصداق مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('dowry-info', 'بيانات الصداق (المهر)', NULL, 'dowryPaid', 'number',
   'المقبوض', NULL, NULL, NULL, 'المبلغ المدفوع مقدماً', NULL, NULL,
   true, '{"required":"المقبوض مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('dowry-info', 'بيانات الصداق (المهر)', NULL, 'dowryDeferred', 'number',
   'المؤخر', NULL, NULL, NULL, 'المبلغ المؤجل', NULL, NULL,
   true, '{"required":"المؤخر مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness1FullName', 'text',
   'اسم الشاهد الأول (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness1PassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness1AddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness1MobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness1AddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness1MobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness2FullName', 'text',
   'اسم الشاهد الثاني (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness2PassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness2AddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness2MobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness2AddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 10, TRUE, '{}'::jsonb),
  ('witnesses-info', 'الشهود', NULL, 'witness2MobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '{}'::jsonb),
  ('appointment-info', 'الموعد المقترح لعقد الزواج', NULL, 'appointmentNote', 'info',
   'معلومات الموعد', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('appointment-info', 'الموعد المقترح لعقد الزواج', NULL, 'proposedAppointmentDate', 'date',
   'الموعد المقترح', NULL, NULL, NULL, 'اختر الموعد المناسب لك (من الأحد إلى الخميس)', NULL, NULL,
   true, '{"required":"الموعد المقترح مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandFullName', 'text',
   'اسم الزوج الكامل (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الزوج مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandBirthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandNationalId', 'text',
   'الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الرقم الوطني مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandPassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandPassportIssuePlace', 'text',
   'مكان إصدار الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandPassportIssueDate', 'date',
   'تاريخ إصدار الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandResidenceStatus', 'select',
   'حالة الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"حالة الإقامة مطلوبة"}'::jsonb, '[{"value":"resident","label":"مقيم"},{"value":"visitor","label":"زيارة"},{"value":"umrah","label":"عمرة"}]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandResidenceNumber', 'text',
   'رقم الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '(data) => data.husbandResidenceStatus === ''resident'''),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandOccupation', 'text',
   'المهنة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المهنة مطلوبة"}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 10, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '{}'::jsonb),
  ('husband-info', 'بيانات الزوج (المطلق)', NULL, 'husbandMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '{}'::jsonb),
  ('marriage-details', 'بيانات الزواج', NULL, 'marriageCertNumber', 'text',
   'رقم وثيقة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم وثيقة الزواج مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('marriage-details', 'بيانات الزواج', NULL, 'marriageDate', 'date',
   'تاريخ الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الزواج مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('marriage-details', 'بيانات الزواج', NULL, 'marriagePlace', 'text',
   'مكان الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان الزواج مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('marriage-details', 'بيانات الزواج', NULL, 'marriageIssuer', 'text',
   'جهة إصدار وثيقة الزواج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"جهة الإصدار مطلوبة"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('marriage-details', 'بيانات الزواج', NULL, 'dowryPaid', 'number',
   'المهر المقبوض', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المهر المقبوض مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('marriage-details', 'بيانات الزواج', NULL, 'dowryDeferred', 'number',
   'المهر المؤخر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المهر المؤخر مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('divorce-details', 'بيانات الطلاق', NULL, 'divorceType', 'select',
   'نوع الطلاق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"نوع الطلاق مطلوب"}'::jsonb, '[{"value":"revocable","label":"طلاق رجعي"},{"value":"irrevocable_minor","label":"طلاق بائن بينونة صغرى"},{"value":"irrevocable_major","label":"طلاق بائن بينونة كبرى"}]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('divorce-details', 'بيانات الطلاق', NULL, 'divorceCount', 'select',
   'عدد الطلقات', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"عدد الطلقات مطلوب"}'::jsonb, '[{"value":"first","label":"طلقة أولى"},{"value":"second","label":"طلقة ثانية"},{"value":"third","label":"طلقة ثالثة"}]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('divorce-details', 'بيانات الطلاق', NULL, 'divorceDate', 'date',
   'تاريخ وقوع الطلاق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ وقوع الطلاق مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('divorce-details', 'بيانات الطلاق', NULL, 'divorcePlace', 'text',
   'مكان وقوع الطلاق', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان وقوع الطلاق مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('divorce-details', 'بيانات الطلاق', NULL, 'divorceReason', 'textarea',
   'سبب الطلاق', NULL, NULL, NULL, 'اختياري - يمكنك ذكر سبب الطلاق', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('divorce-declaration', 'إقرار الطلاق', NULL, 'divorceDeclarationCheckbox', 'checkbox',
   'أقر بكامل قواي العقلية وإرادتي الحرة المعتبرة شرعاً وقانوناً بأنني قد طلقت زوجتي المذكورة أعلاه', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب الموافقة على الإقرار"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('divorce-declaration', 'إقرار الطلاق', NULL, 'divorceAcknowledgment', 'checkbox',
   'وهذا إقرار مني بذلك', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب الموافقة على الإقرار"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeFullName', 'text',
   'اسم الزوجة الكامل (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الزوجة مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeBirthDate', 'date',
   'تاريخ الميلاد', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ الميلاد مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeNationalId', 'text',
   'الرقم الوطني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الرقم الوطني مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifePassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifePassportIssuePlace', 'text',
   'مكان إصدار الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"مكان إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifePassportIssueDate', 'date',
   'تاريخ إصدار الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"تاريخ إصدار الجواز مطلوب"}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeResidenceStatus', 'select',
   'حالة الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"حالة الإقامة مطلوبة"}'::jsonb, '[{"value":"resident","label":"مقيم"},{"value":"visitor","label":"زيارة"},{"value":"umrah","label":"عمرة"}]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeResidenceNumber', 'text',
   'رقم الإقامة', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '(data) => data.wifeResidenceStatus === ''resident'''),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeOccupation', 'text',
   'المهنة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"المهنة مطلوبة"}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeAddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeMobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 10, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeAddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '{}'::jsonb),
  ('wife-info', 'بيانات الزوجة (المطلقة)', NULL, 'wifeMobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 12, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness1FullName', 'text',
   'اسم الشاهد الأول (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness1PassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness1AddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness1MobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness1AddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness1MobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness2FullName', 'text',
   'اسم الشاهد الثاني (رباعي)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness2PassportNumber', 'text',
   'رقم جواز السفر', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم جواز السفر مطلوب"}'::jsonb, '[]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness2AddressKSA', 'text',
   'العنوان بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"العنوان بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness2MobileKSA', 'tel',
   'رقم الجوال بالسعودية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"رقم الجوال بالسعودية مطلوب"}'::jsonb, '[]'::jsonb, 9, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness2AddressSudan', 'text',
   'العنوان بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 10, TRUE, '{}'::jsonb),
  ('divorce-witnesses', 'بيانات الشهود', NULL, 'witness2MobileSudan', 'tel',
   'رقم الجوال بالسودان', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 11, TRUE, '{}'::jsonb),
  ('documents', 'المستندات المطلوبة', NULL, 'groomPassportCopy', 'file',
   'إثبات شخصية الخاطب (الجواز أو الرقم الوطني)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إثبات شخصية الخاطب مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'bridePassportCopy', 'file',
   'إثبات شخصية المخطوبة (الجواز أو الرقم الوطني)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إثبات شخصية المخطوبة مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'guardianPassportCopy', 'file',
   'إثبات شخصية ولي المخطوبة (الأب)', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إثبات شخصية الولي مطلوب"}'::jsonb, '[]'::jsonb, 2, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'witness1PassportCopy', 'file',
   'إثبات شخصية الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إثبات شخصية الشاهد الأول مطلوب"}'::jsonb, '[]'::jsonb, 3, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'witness2PassportCopy', 'file',
   'إثبات شخصية الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"إثبات شخصية الشاهد الثاني مطلوب"}'::jsonb, '[]'::jsonb, 4, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'brideConsentLetter', 'file',
   'إقرار موافقة المخطوبة على الزواج (في حال غياب المخطوبة)', NULL, NULL, NULL, 'في حال كانت المخطوبة غائبة عن مجلس العقد', NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 5, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'brideDivorceCert', 'file',
   'أصل وثيقة الطلاق موثقة من الخارجية السودانية (في حال كانت المخطوبة مطلقة)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 6, TRUE, '(data) => data.serviceType === ''marriage'' && data.brideMaritalStatus === ''divorced'''),
  ('documents', 'المستندات المطلوبة', NULL, 'brideWidowDocs', 'file',
   'وثيقة الزواج وشهادة وفاة الزوج أو الإعلام الشرعي للورثة (في حال كانت المخطوبة أرملة)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 7, TRUE, '(data) => data.serviceType === ''marriage'' && data.brideMaritalStatus === ''widow'''),
  ('documents', 'المستندات المطلوبة', NULL, 'guardianPowerOfAttorney', 'file',
   'توكيل الولي موثق من الخارجية السودانية (في حال غياب والد المخطوبة)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 8, TRUE, '(data) => data.serviceType === ''marriage'' && data.hasGuardianAgent === ''yes'''),
  ('documents', 'المستندات المطلوبة', NULL, 'guardianDeathCert', 'file',
   'إثبات وفاة الولي أو الإعلام الشرعي للوراثة (في حال وفاة ولي المخطوبة)', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 9, TRUE, '(data) => data.serviceType === ''marriage'''),
  ('documents', 'المستندات المطلوبة', NULL, 'divorceReceipt', 'file',
   'القسيمة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"القسيمة مطلوبة"}'::jsonb, '[]'::jsonb, 10, TRUE, '(data) => data.serviceType === ''divorce'''),
  ('documents', 'المستندات المطلوبة', NULL, 'husbandPassportCopy', 'file',
   'صورة جواز الزوج', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الزوج مطلوبة"}'::jsonb, '[]'::jsonb, 11, TRUE, '(data) => data.serviceType === ''divorce'''),
  ('documents', 'المستندات المطلوبة', NULL, 'wifePassportCopy', 'file',
   'صورة جواز الزوجة', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الزوجة مطلوبة"}'::jsonb, '[]'::jsonb, 12, TRUE, '(data) => data.serviceType === ''divorce'''),
  ('documents', 'المستندات المطلوبة', NULL, 'divorceWitness1PassportCopy', 'file',
   'صورة جواز الشاهد الأول', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الشاهد الأول مطلوبة"}'::jsonb, '[]'::jsonb, 13, TRUE, '(data) => data.serviceType === ''divorce'''),
  ('documents', 'المستندات المطلوبة', NULL, 'divorceWitness2PassportCopy', 'file',
   'صورة جواز الشاهد الثاني', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة جواز الشاهد الثاني مطلوبة"}'::jsonb, '[]'::jsonb, 14, TRUE, '(data) => data.serviceType === ''divorce'''),
  ('documents', 'المستندات المطلوبة', NULL, 'additionalDocuments', 'file',
   'مستندات إضافية إن وجد', NULL, NULL, NULL, NULL, NULL, NULL,
   false, '{}'::jsonb, '[]'::jsonb, 15, TRUE, '(data) => data.serviceType === ''divorce'''),
  ('acknowledgment', 'الإقرار', NULL, 'personalAttendance', 'checkbox',
   'أقر بأن جميع الأطراف والشهود سيحضرون شخصياً مع جوازات السفر الأصلية', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب الموافقة على الحضور الشخصي"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('acknowledgment', 'الإقرار', NULL, 'dataAccuracy', 'checkbox',
   'أتعهد بصحة جميع البيانات المذكورة أعلاه', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"يجب تأكيد صحة البيانات"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'madhoonia';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('إثبات شخصية الخاطب (الجواز أو الرقم الوطني)', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('إثبات شخصية المخطوبة (الجواز أو الرقم الوطني)', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('إثبات شخصية ولي المخطوبة (الأب)', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('إثبات شخصية الشاهد الأول', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('إثبات شخصية الشاهد الثاني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 4, TRUE, '{}'::jsonb),
  ('إقرار موافقة المخطوبة على الزواج (في حال غياب المخطوبة)', NULL, 'في حال كانت المخطوبة غائبة عن مجلس العقد', NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 5, TRUE, '{}'::jsonb),
  ('أصل وثيقة الطلاق موثقة من الخارجية السودانية (في حال كانت المخطوبة مطلقة)', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 6, TRUE, '{}'::jsonb),
  ('وثيقة الزواج وشهادة وفاة الزوج أو الإعلام الشرعي للورثة (في حال كانت المخطوبة أرملة)', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 7, TRUE, '{}'::jsonb),
  ('توكيل الولي موثق من الخارجية السودانية (في حال غياب والد المخطوبة)', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 8, TRUE, '{}'::jsonb),
  ('إثبات وفاة الولي أو الإعلام الشرعي للوراثة (في حال وفاة ولي المخطوبة)', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 9, TRUE, '{}'::jsonb),
  ('القسيمة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 10, TRUE, '{}'::jsonb),
  ('صورة جواز الزوج', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 11, TRUE, '{}'::jsonb),
  ('صورة جواز الزوجة', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 12, TRUE, '{}'::jsonb),
  ('صورة جواز الشاهد الأول', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 13, TRUE, '{}'::jsonb),
  ('صورة جواز الشاهد الثاني', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 14, TRUE, '{}'::jsonb),
  ('مستندات إضافية إن وجد', NULL, NULL, NULL,
   false, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 15, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'madhoonia';

-- ========================================
-- خدمة: خطاب ستر الجثمان
-- ========================================

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

-- ========================================
-- خدمة: بنك الخرطوم
-- ========================================

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

-- ========================================
-- خدمة: العمل والسجون
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'العمل والسجون',
    NULL,
    'workAndPrisons',
    'خدمات الخروج النهائي النظامي وشؤون السجناء',
    NULL,
    'Briefcase',
    'documents',
    '{"finalExit":{"base":200,"currency":"ريال سعودي"}}',
    '{"finalExit":"5-7 أيام عمل"}'::jsonb,
    TRUE,
    '{"process":["تقديم الطلب مع المستندات المطلوبة","مراجعة الطلب والمستندات","دفع الرسوم المقررة","التنسيق مع الجهات المعنية","إصدار الموافقة","التسليم أو الإشعار"],"hasSubcategories":false,"subcategories":[]}'::jsonb
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
  SELECT id INTO service_uuid FROM services WHERE slug = 'workAndPrisons';

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
  ('صورة من الجواز', NULL, 0, TRUE, '{"type":"finalExit"}'::jsonb),
  ('عدد 2 صورة بطاقة', NULL, 1, TRUE, '{"type":"finalExit"}'::jsonb),
  ('الحضور للقنصلية للبصمة', NULL, 2, TRUE, '{"type":"finalExit"}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'workAndPrisons';

-- إدراج الحقول
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  default_value, is_required, validation_rules, options, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('personal-info', 'المعلومات الشخصية', NULL, 'nationalNumber', 'text',
   'الرقم الوطني', NULL, NULL, NULL, 'أدخل الرقم الوطني', NULL, NULL,
   true, '{"required":"الرقم الوطني مطلوب"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('personal-info', 'المعلومات الشخصية', NULL, 'motherFullName', 'text',
   'اسم الأم رباعي', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"اسم الأم رباعي مطلوب"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb),
  ('personal-info', 'المعلومات الشخصية', NULL, 'requestingAuthority', 'text',
   'الجهة الطالبة للفيش', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"الجهة الطالبة مطلوبة"}'::jsonb, '[]'::jsonb, 2, TRUE, '{}'::jsonb),
  ('personal-info', 'المعلومات الشخصية', NULL, 'requestReason', 'select',
   'سبب طلب الفيش', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"سبب الطلب مطلوب"}'::jsonb, '[{"value":"work","label":"للعمل"},{"value":"study","label":"للدراسة"},{"value":"travel","label":"للسفر"},{"value":"residence","label":"للإقامة"},{"value":"marriage","label":"للزواج"},{"value":"government","label":"للجهات الحكومية"},{"value":"other","label":"أخرى"}]'::jsonb, 3, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'passportCopy', 'file',
   'صورة من الجواز', NULL, NULL, NULL, NULL, NULL, NULL,
   true, '{"required":"صورة من الجواز مطلوبة"}'::jsonb, '[]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('documents-upload', 'المستندات المطلوبة', NULL, 'recentPhoto', 'file',
   'صورة حديثة', NULL, NULL, NULL, 'صورة شخصية حديثة', NULL, NULL,
   true, '{"required":"صورة حديثة مطلوبة"}'::jsonb, '[]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS fld(
  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,
  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
  is_required, validation_rules, options, order_index, is_active, conditions
)
WHERE services.slug = 'workAndPrisons';

-- إدراج المرفقات
INSERT INTO service_documents (
  service_id, document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions
)
SELECT id, * FROM services, (VALUES
  ('صورة من الجواز', NULL, NULL, NULL,
   true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE, '{}'::jsonb),
  ('صورة حديثة', NULL, 'صورة شخصية حديثة', NULL,
   true, 5, '["jpg","jpeg","png"]'::jsonb, 1, TRUE, '{}'::jsonb)
) AS doc(document_name_ar, document_name_en, description_ar, description_en,
  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)
WHERE services.slug = 'workAndPrisons';
/*
  # استيراد بيانات الخدمات الفرعية للتوكيلات والإقرارات

  ## التوكيلات (9 خدمات):
  1. general - توكيلات منوعة
  2. real-estate - عقارات وأراضي
  3. vehicles - سيارات
  4. companies - الشركات
  5. inheritance - الورثة
  6. courts - محاكم وقضايا
  7. birth-certificates - شهادات ميلاد
  8. educational - شهادة دراسية
  9. marriage-divorce - إجراءات الزواج والطلاق

  ## الإقرارات (2 خدمة):
  10. regular - إقرار عادي
  11. sworn - إقرار مشفوع باليمين
*/

-- ========================================
-- 1. خدمة: توكيلات منوعة
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


-- ========================================
-- 2. خدمة: عقارات وأراضي
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
