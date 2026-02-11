-- Delete existing fields
DELETE FROM service_fields WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b';

-- Insert fields
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'isAdult',
  'radio',
  'هل المتقدم بالغ (18 سنة فأكثر)؟',
  'هل المتقدم بالغ (18 سنة فأكثر)؟',
  '',
  '',
  '',
  '',
  true,
  true,
  0,
  '{"required":"يرجى تحديد العمر"}'::jsonb,
  '[{"label_ar":"نعم","label_en":"نعم","value":"yes"},{"label_ar":"لا","label_en":"لا","value":"no"}]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'parentConsent',
  'radio',
  'إحضار خطاب عدم ممانعة من الوالد',
  'إحضار خطاب عدم ممانعة من الوالد',
  '',
  '',
  'مطلوب فقط في حالة الإصدار لأول مرة وعدم حضور الوالد',
  '',
  true,
  true,
  1,
  '{"required":"يرجى تحديد الخيار المناسب","conditional":{"field":"isAdult","values":["no"]}}'::jsonb,
  '[{"label_ar":"نعم، سيتم إحضاره","label_en":"نعم، سيتم إحضاره","value":"yes"},{"label_ar":"لا حاجة، الوالد سيحضر شخصياً","label_en":"لا حاجة، الوالد سيحضر شخصياً","value":"no"}]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'passportType',
  'radio',
  'نوع الطلب',
  'نوع الطلب',
  '',
  '',
  '',
  '',
  true,
  true,
  2,
  '{"required":"نوع الطلب مطلوب"}'::jsonb,
  '[{"label_ar":"جواز جديد","label_en":"جواز جديد","value":"new"},{"label_ar":"تجديد","label_en":"تجديد","value":"renewal"},{"label_ar":"بدل فاقد","label_en":"بدل فاقد","value":"replacement"},{"label_ar":"وثيقة سفر اضطرارية","label_en":"وثيقة سفر اضطرارية","value":"emergency"}]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'oldPassportNumber',
  'text',
  'رقم الجواز القديم',
  'رقم الجواز القديم',
  '',
  '',
  'حرف كبير واحد باللغة الإنجليزية يتبعه أرقام (مثال: P12345678)',
  '',
  true,
  true,
  3,
  '{"required":"رقم الجواز القديم مطلوب","conditional":{"field":"passportType","values":["renewal","replacement"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'lossLocation',
  'text',
  'مكان الفقدان',
  'مكان الفقدان',
  '',
  '',
  '',
  '',
  true,
  true,
  4,
  '{"required":"مكان الفقدان مطلوب","conditional":{"field":"passportType","values":["replacement"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'emergencyReason',
  'textarea',
  'سبب طلب وثيقة السفر الاضطرارية',
  'سبب طلب وثيقة السفر الاضطرارية',
  '',
  '',
  'يرجى توضيح السبب الطارئ الذي يتطلب إصدار وثيقة سفر مؤقتة',
  '',
  true,
  true,
  5,
  '{"required":"سبب الطلب مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'birthPlace',
  'text',
  'محل الميلاد',
  'محل الميلاد',
  '',
  '',
  '',
  '',
  true,
  true,
  6,
  '{"required":"محل الميلاد مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'birthDate',
  'date',
  'تاريخ الميلاد',
  'تاريخ الميلاد',
  '',
  '',
  '',
  '',
  true,
  true,
  7,
  '{"required":"تاريخ الميلاد مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'arrivalDate',
  'date',
  'تاريخ الوصول للمملكة',
  'تاريخ الوصول للمملكة',
  '',
  '',
  '',
  '',
  true,
  true,
  8,
  '{"required":"تاريخ الوصول للمملكة مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'height',
  'number',
  'الطول (سم)',
  'الطول (سم)',
  '',
  '',
  'على المتقدم كتابة وصفه',
  '',
  true,
  true,
  9,
  '{"required":"الطول مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'eyeColor',
  'select',
  'لون العيون',
  'لون العيون',
  '',
  '',
  'على المتقدم كتابة وصفه',
  '',
  true,
  true,
  10,
  '{"required":"لون العيون مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[{"label_ar":"أسود","label_en":"أسود","value":"black"},{"label_ar":"بني","label_en":"بني","value":"brown"},{"label_ar":"أخضر","label_en":"أخضر","value":"green"},{"label_ar":"أزرق","label_en":"أزرق","value":"blue"},{"label_ar":"عسلي","label_en":"عسلي","value":"hazel"},{"label_ar":"أخرى","label_en":"أخرى","value":"other"}]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'hairColor',
  'select',
  'لون الشعر',
  'لون الشعر',
  '',
  '',
  'على المتقدم كتابة وصفه',
  '',
  true,
  true,
  11,
  '{"required":"لون الشعر مطلوب","conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[{"label_ar":"أسود","label_en":"أسود","value":"black"},{"label_ar":"بني","label_en":"بني","value":"brown"},{"label_ar":"أشقر","label_en":"أشقر","value":"blonde"},{"label_ar":"رمادي/شايب","label_en":"رمادي/شايب","value":"gray"},{"label_ar":"أحمر","label_en":"أحمر","value":"red"},{"label_ar":"أخرى","label_en":"أخرى","value":"other"}]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'distinctiveMarks',
  'textarea',
  'العلامات المميزة',
  'العلامات المميزة',
  'اختياري',
  '',
  'أي علامات مميزة (مثل: شامة، ندبة، وشم، إلخ)',
  '',
  false,
  true,
  12,
  '{"conditional":{"field":"passportType","values":["emergency"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'details',
  'تفاصيل الجواز',
  'تفاصيل الجواز',
  'familyMembers',
  'dynamic-list',
  'أفراد العائلة',
  'أفراد العائلة',
  '',
  '',
  '',
  '',
  false,
  true,
  13,
  '{"dynamicFields":[{"name":"memberName","label":"الاسم","type":"text","required":true},{"name":"memberBirthDate","label":"تاريخ الميلاد","type":"date","required":true},{"name":"memberRelationship","label":"صلة القرابة","type":"select","required":true,"options":[{"value":"son","label":"ابن"},{"value":"daughter","label":"ابنة"},{"value":"wife","label":"زوجة"},{"value":"husband","label":"زوج"},{"value":"mother","label":"أم"},{"value":"father","label":"أب"},{"value":"other","label":"أخرى"}]}],"buttonText":"إضافة عائلة"}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'passportCopy',
  'file',
  'صورة من الجواز',
  'صورة من الجواز',
  '',
  '',
  '',
  '',
  true,
  true,
  14,
  '{"required":"صورة الجواز مطلوبة","conditional":[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'nationalIdCopyAdult',
  'file',
  'صورة من الرقم الوطني',
  'صورة من الرقم الوطني',
  '',
  '',
  '',
  '',
  true,
  true,
  15,
  '{"required":"صورة الرقم الوطني مطلوبة","conditional":[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["new"]}]}]}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'personalPhoto',
  'file',
  'صورة شخصية',
  'صورة شخصية',
  '',
  '',
  '',
  '',
  true,
  true,
  16,
  '{"required":"الصورة الشخصية مطلوبة","conditional":{"field":"isAdult","values":["yes"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'nationalIdCopyMinor',
  'file',
  'صورة من الجواز',
  'صورة من الجواز',
  '',
  '',
  '',
  '',
  true,
  true,
  17,
  '{"required":"صورة من الجواز مطلوبة","conditional":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'minorPassportCopy',
  'file',
  'صورة من الجواز',
  'صورة من الجواز',
  '',
  '',
  '',
  '',
  true,
  true,
  18,
  '{"required":"صورة من الجواز مطلوبة","conditional":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'motherPassportCopy',
  'file',
  'صورة جواز الأم',
  'صورة جواز الأم',
  '',
  '',
  '',
  '',
  true,
  true,
  19,
  '{"required":"صورة جواز الأم مطلوبة","conditional":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'fatherPassportCopy',
  'file',
  'صورة جواز الأب',
  'صورة جواز الأب',
  '',
  '',
  '',
  '',
  true,
  true,
  20,
  '{"required":"صورة جواز الأب مطلوبة","conditional":[{"operator":"AND","conditions":[{"field":"isAdult","values":["no"]},{"field":"passportType","values":["new"]}]}]}'::jsonb,
  '[]'::jsonb,
  ''
);

INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload',
  'المستندات المطلوبة',
  'المستندات المطلوبة',
  'childPersonalPhoto',
  'file',
  'صورة شخصية',
  'صورة شخصية',
  '',
  '',
  '',
  '',
  true,
  true,
  21,
  '{"required":"الصورة الشخصية مطلوبة","conditional":{"field":"isAdult","values":["no"]}}'::jsonb,
  '[]'::jsonb,
  ''
);

-- Total: 22 fields
