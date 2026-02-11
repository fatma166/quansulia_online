

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

