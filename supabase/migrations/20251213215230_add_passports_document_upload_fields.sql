/*
  # إضافة حقول المستندات لخدمة الجوازات
  
  1. الخطوات
    - إضافة حقول رفع المستندات من خطوة documents-upload
    - كل حقل من نوع file مع شروط العرض المعقدة
    - 8 حقول للمستندات المختلفة
  
  2. الشروط المطبقة
    - شروط بسيطة: حقل واحد
    - شروط معقدة AND: عدة حقول معاً
    
  3. التفاصيل
    - جميع الحقول من نوع 'file'
    - مع تحديد accept و maxSize
*/

-- إضافة حقول المستندات في خطوة documents-upload

-- 1. صورة من الجواز (للبالغين - تجديد/بدل/وثيقة)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'passportCopy', 'file',
  'صورة من الجواز', 'Passport Copy',
  true,
  '{"required": "صورة الجواز مطلوبة", "maxSize": "5MB", "accept": ".pdf,.jpg,.jpeg,.png"}'::jsonb,
  0,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["yes"]}, {"field": "passportType", "values": ["renewal", "replacement", "travel-document"]}]}'::jsonb
);

-- 2. صورة من الرقم الوطني (للبالغين - جديد)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'nationalIdCopyAdult', 'file',
  'صورة من الرقم الوطني', 'National ID Copy',
  true,
  '{"required": "صورة الرقم الوطني مطلوبة", "maxSize": "5MB", "accept": ".pdf,.jpg,.jpeg,.png"}'::jsonb,
  1,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["yes"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- 3. صورة شخصية (للبالغين)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'personalPhoto', 'file',
  'صورة شخصية', 'Personal Photo',
  true,
  '{"required": "الصورة الشخصية مطلوبة", "maxSize": "2MB", "accept": ".jpg,.jpeg,.png"}'::jsonb,
  2,
  '{"field": "isAdult", "operator": "equals", "values": ["yes"]}'::jsonb
);

-- 4. صورة من الجواز (للقصر - جديد)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'nationalIdCopyMinor', 'file',
  'صورة من الجواز', 'Passport Copy',
  true,
  '{"required": "صورة من الجواز مطلوبة", "maxSize": "5MB", "accept": ".pdf,.jpg,.jpeg,.png"}'::jsonb,
  3,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- 5. صورة من الجواز (للقصر - تجديد/بدل/وثيقة)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'minorPassportCopy', 'file',
  'صورة من الجواز', 'Passport Copy',
  true,
  '{"required": "صورة من الجواز مطلوبة", "maxSize": "5MB", "accept": ".pdf,.jpg,.jpeg,.png"}'::jsonb,
  4,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["renewal", "replacement", "travel-document"]}]}'::jsonb
);

-- 6. صورة جواز الأم (للقصر - جديد)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'motherPassportCopy', 'file',
  'صورة جواز الأم', 'Mother Passport Copy',
  true,
  '{"required": "صورة جواز الأم مطلوبة", "maxSize": "5MB", "accept": ".pdf,.jpg,.jpeg,.png"}'::jsonb,
  5,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- 7. صورة جواز الأب (للقصر - جديد)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'fatherPassportCopy', 'file',
  'صورة جواز الأب', 'Father Passport Copy',
  true,
  '{"required": "صورة جواز الأب مطلوبة", "maxSize": "5MB", "accept": ".pdf,.jpg,.jpeg,.png"}'::jsonb,
  6,
  '{"operator": "AND", "conditions": [{"field": "isAdult", "values": ["no"]}, {"field": "passportType", "values": ["new"]}]}'::jsonb
);

-- 8. صورة شخصية (للقصر)
INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en,
  field_name, field_type, label_ar, label_en,
  is_required, validation_rules, order_index, conditions
) VALUES (
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'documents-upload', 'المستندات المطلوبة', 'Required Documents',
  'childPersonalPhoto', 'file',
  'صورة شخصية', 'Personal Photo',
  true,
  '{"required": "الصورة الشخصية مطلوبة", "maxSize": "2MB", "accept": ".jpg,.jpeg,.png"}'::jsonb,
  7,
  '{"field": "isAdult", "operator": "equals", "values": ["no"]}'::jsonb
);
