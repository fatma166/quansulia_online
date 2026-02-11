/*
  # Restore Civil Registry Service Data

  This migration restores all fields, requirements, and documents for the civil registry service
  from the complete configuration file.

  1. Deletes existing data
  2. Restores 66 service fields with conditional logic
  3. Restores service requirements for each service type
  4. Restores service documents for each service type
*/

-- Get the service ID
DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = 'civil-registry';

  -- Delete existing data
  DELETE FROM service_fields WHERE service_id = service_uuid;
  DELETE FROM service_requirements WHERE service_id = service_uuid;
  DELETE FROM service_documents WHERE service_id = service_uuid;

  -- Insert service fields
  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'recordType',
    'select',
    'نوع السجل',
    'نوع السجل',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"نوع السجل مطلوب"}'::jsonb,
    '[{"value":"national_id","label":"الرقم الوطني"},{"value":"conduct_certificate","label":"شهادة حسن السير والسلوك (الفيش)"},{"value":"towhomitmayconcern","label":"إفادات لمن يهمهم الأمر"}]'::jsonb,
    NULL,
    0,
    true,
    NULL
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'idType',
    'radio',
    'نوع الخدمة',
    'نوع الخدمة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"نوع الخدمة مطلوب"}'::jsonb,
    '[{"value":"replacement","label":"بدل فاقد","description":"الرقم الوطني بدل فاقد"},{"value":"newborn","label":"رقم وطني للأطفال حديثي الولادة حتى 12 سنة","description":"للأطفال من الولادة حتى 12 سنة"},{"value":"under12","label":"رقم وطني لمن دون سن 12 عام","description":"للأطفال دون 12 عام (حالات خاصة)"},{"value":"name_correction","label":"تعديل الاسم أو تغييره","description":"في حالة الأخطاء"},{"value":"age_correction","label":"تعديل العمر","description":"حالة خاصة - زيادة أو نقصان"}]'::jsonb,
    NULL,
    1,
    true,
    '{"field":"recordType","values":["national_id"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'nationalId',
    'text',
    'اكتب الرقم الوطني',
    'اكتب الرقم الوطني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الرقم الوطني مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    2,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement","name_correction","age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'motherFullName',
    'text',
    'اسم الأم رباعي',
    'اسم الأم رباعي',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"اسم الأم رباعي مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    3,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement","newborn","under12","name_correction","age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'birthDate',
    'date',
    'تاريخ الميلاد',
    'تاريخ الميلاد',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"تاريخ الميلاد مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    4,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement","newborn","under12","name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'childGender',
    'radio',
    'نوع المولود',
    'نوع المولود',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"نوع المولود مطلوب"}'::jsonb,
    '[{"value":"male","label":"ذكر"},{"value":"female","label":"أنثى"}]'::jsonb,
    NULL,
    5,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'childFullNameArabic',
    'text',
    'اسم الطفل رباعي',
    'اسم الطفل رباعي',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"اسم الطفل رباعي مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    6,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'childFullNameEnglish',
    'text',
    'Child''s Full Name (Four Parts)',
    'Child''s Full Name (Four Parts)',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"Child''s full name in English is required"}'::jsonb,
    '[]'::jsonb,
    NULL,
    7,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'bloodType',
    'select',
    'فصيلة الدم',
    'فصيلة الدم',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"فصيلة الدم مطلوبة"}'::jsonb,
    '[{"value":"A+","label":"A+"},{"value":"A-","label":"A-"},{"value":"B+","label":"B+"},{"value":"B-","label":"B-"},{"value":"AB+","label":"AB+"},{"value":"AB-","label":"AB-"},{"value":"O+","label":"O+"},{"value":"O-","label":"O-"}]'::jsonb,
    NULL,
    8,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'birthRegion',
    'text',
    'مكان الميلاد - المنطقة',
    'مكان الميلاد - المنطقة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"المنطقة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    9,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'birthCity',
    'text',
    'مكان الميلاد - المدينة',
    'مكان الميلاد - المدينة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"المدينة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    10,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'birthHospital',
    'text',
    'مكان الميلاد - المستشفى',
    'مكان الميلاد - المستشفى',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"المستشفى مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    11,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn","under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'fatherAttending',
    'radio',
    'هل سيحضر الوالد؟',
    'هل سيحضر الوالد؟',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"يرجى تحديد حضور الوالد"}'::jsonb,
    '[{"value":"yes","label":"نعم"},{"value":"no","label":"لا - سيحضر شهود"}]'::jsonb,
    NULL,
    12,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness1Name',
    'text',
    'اسم الشاهد الأول',
    'اسم الشاهد الأول',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"اسم الشاهد الأول مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    13,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness1PassportNumber',
    'text',
    'رقم جواز الشاهد الأول',
    'رقم جواز الشاهد الأول',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"رقم الجواز مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    14,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness1Relation',
    'select',
    'صلة القرابة للشاهد الأول',
    'صلة القرابة للشاهد الأول',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صلة القرابة مطلوبة"}'::jsonb,
    '[{"value":"uncle_paternal","label":"عم"},{"value":"brother","label":"أخ شقيق"}]'::jsonb,
    NULL,
    15,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness1Phone',
    'tel',
    'رقم هاتف الشاهد الأول',
    'رقم هاتف الشاهد الأول',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"رقم الهاتف مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    16,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness2Name',
    'text',
    'اسم الشاهد الثاني',
    'اسم الشاهد الثاني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"اسم الشاهد الثاني مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    17,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness2PassportNumber',
    'text',
    'رقم جواز الشاهد الثاني',
    'رقم جواز الشاهد الثاني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"رقم الجواز مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    18,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness2Relation',
    'select',
    'صلة القرابة للشاهد الثاني',
    'صلة القرابة للشاهد الثاني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صلة القرابة مطلوبة"}'::jsonb,
    '[{"value":"uncle_paternal","label":"عم"},{"value":"brother","label":"أخ شقيق"}]'::jsonb,
    NULL,
    19,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'witness2Phone',
    'tel',
    'رقم هاتف الشاهد الثاني',
    'رقم هاتف الشاهد الثاني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"رقم الهاتف مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    20,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'correctedName',
    'text',
    'الاسم المعدل',
    'الاسم المعدل',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الاسم المعدل مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    21,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'nameCorrectionReason',
    'textarea',
    'وضح أسباب التعديل',
    'وضح أسباب التعديل',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"أسباب التعديل مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    22,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'wrongBirthDate',
    'date',
    'تاريخ الميلاد الخطأ',
    'تاريخ الميلاد الخطأ',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"تاريخ الميلاد الخطأ مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    23,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'correctBirthDate',
    'date',
    'تاريخ الميلاد الصحيح',
    'تاريخ الميلاد الصحيح',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"تاريخ الميلاد الصحيح مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    24,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'ageCorrectionReason',
    'textarea',
    'وضح أسباب التعديل',
    'وضح أسباب التعديل',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"أسباب التعديل مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    25,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'nationalNumber',
    'text',
    'الرقم الوطني',
    'الرقم الوطني',
    NULL,
    NULL,
    'أدخل الرقم الوطني',
    'أدخل الرقم الوطني',
    true,
    '{"required":"الرقم الوطني مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    26,
    true,
    '{"field":"recordType","values":["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'motherFullName',
    'text',
    'اسم الأم رباعي',
    'اسم الأم رباعي',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"اسم الأم رباعي مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    27,
    true,
    '{"field":"recordType","values":["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'requestingAuthority',
    'text',
    'الجهة الطالبة للفيش',
    'الجهة الطالبة للفيش',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الجهة الطالبة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    28,
    true,
    '{"field":"recordType","values":["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'requestReason',
    'select',
    'سبب طلب الفيش',
    'سبب طلب الفيش',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"سبب الطلب مطلوب"}'::jsonb,
    '[{"value":"work","label":"للعمل"},{"value":"study","label":"للدراسة"},{"value":"travel","label":"للسفر"},{"value":"residence","label":"للإقامة"},{"value":"marriage","label":"للزواج"},{"value":"government","label":"للجهات الحكومية"},{"value":"other","label":"أخرى"}]'::jsonb,
    NULL,
    29,
    true,
    '{"field":"recordType","values":["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'concernSubject',
    'text',
    'الموضوع',
    'الموضوع',
    NULL,
    NULL,
    'عنوان أو موضوع الإفادة',
    'عنوان أو موضوع الإفادة',
    true,
    '{"required":"الموضوع مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    30,
    true,
    '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'civilRegistryData',
    'textarea',
    'بيانات السجل المدني',
    'بيانات السجل المدني',
    NULL,
    NULL,
    'أدخل بياناتك من السجل المدني (الاسم الرباعي، الرقم الوطني، تاريخ الميلاد، مكان الميلاد، إلخ)',
    'أدخل بياناتك من السجل المدني (الاسم الرباعي، الرقم الوطني، تاريخ الميلاد، مكان الميلاد، إلخ)',
    true,
    '{"required":"بيانات السجل المدني مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    31,
    true,
    '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'service-details',
    'تفاصيل الخدمة',
    'تفاصيل الخدمة',
    'requestExplanation',
    'textarea',
    'شرح الطلب',
    'شرح الطلب',
    NULL,
    NULL,
    'اشرح تفاصيل الطلب والغرض من الإفادة والمعلومات المطلوب إثباتها',
    'اشرح تفاصيل الطلب والغرض من الإفادة والمعلومات المطلوب إثباتها',
    true,
    '{"required":"شرح الطلب مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    32,
    true,
    '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'replacementIdOrPassport',
    'file',
    'صورة من الرقم الوطني أو الجواز',
    'صورة من الرقم الوطني أو الجواز',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الرقم الوطني أو الجواز مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    33,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'replacementPhoto',
    'file',
    'صورة حديثة',
    'صورة حديثة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الصورة الحديثة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    34,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["replacement"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'newbornFatherIdOrPassport',
    'file',
    'صورة من الجواز أو الرقم الوطني للوالد',
    'صورة من الجواز أو الرقم الوطني للوالد',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الجواز أو الرقم الوطني للوالد مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    35,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'newbornMotherIdOrPassport',
    'file',
    'صورة من الجواز أو الرقم الوطني للوالدة',
    'صورة من الجواز أو الرقم الوطني للوالدة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الجواز أو الرقم الوطني للوالدة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    36,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'newbornBirthCertificate',
    'file',
    'شهادة ميلاد أو تبليغ ولادة معتمد (للأطفال تحت 90 يوم)',
    'شهادة ميلاد أو تبليغ ولادة معتمد (للأطفال تحت 90 يوم)',
    NULL,
    NULL,
    'شهادة ميلاد أو تبليغ ولادة معتمد من دولة التمثيل في حالة الطفل لا يتجاوز 90 يوم',
    'شهادة ميلاد أو تبليغ ولادة معتمد من دولة التمثيل في حالة الطفل لا يتجاوز 90 يوم',
    true,
    '{"required":"شهادة الميلاد أو تبليغ الولادة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    37,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'newbornMarriageCertificate',
    'file',
    'قسيمة الزواج',
    'قسيمة الزواج',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"قسيمة الزواج مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    38,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'newbornChildPhoto',
    'file',
    'صورة فوتوغرافية حديثة للطفل',
    'صورة فوتوغرافية حديثة للطفل',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة الطفل مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    39,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["newborn"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'under12FatherIdOrPassport',
    'file',
    'صورة من الجواز أو الرقم الوطني للوالد',
    'صورة من الجواز أو الرقم الوطني للوالد',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الجواز أو الرقم الوطني للوالد مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    40,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'under12MotherIdOrPassport',
    'file',
    'صورة من الجواز أو الرقم الوطني للوالدة',
    'صورة من الجواز أو الرقم الوطني للوالدة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الجواز أو الرقم الوطني للوالدة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    41,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'under12BirthCertificate',
    'file',
    'شهادة الميلاد',
    'شهادة الميلاد',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"شهادة الميلاد مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    42,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'under12MarriageCertificate',
    'file',
    'قسيمة الزواج',
    'قسيمة الزواج',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"قسيمة الزواج مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    43,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'under12Photo',
    'file',
    'صورة فوتوغرافية حديثة',
    'صورة فوتوغرافية حديثة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الصورة الفوتوغرافية مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    44,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'witness1Passport',
    'file',
    'صورة جواز الشاهد الأول',
    'صورة جواز الشاهد الأول',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة جواز الشاهد الأول مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    45,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'witness2Passport',
    'file',
    'صورة جواز الشاهد الثاني',
    'صورة جواز الشاهد الثاني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة جواز الشاهد الثاني مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    46,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["under12"]},{"field":"fatherAttending","values":["no"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionNationalId',
    'file',
    'صورة من الرقم الوطني',
    'صورة من الرقم الوطني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    47,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionBirthCertificate',
    'file',
    'شهادة الميلاد',
    'شهادة الميلاد',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"شهادة الميلاد مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    48,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionPassport',
    'file',
    'صورة من الجواز',
    'صورة من الجواز',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة الجواز مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    49,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionLegalAffidavit',
    'file',
    'إشهاد شرعي',
    'إشهاد شرعي',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الإشهاد الشرعي مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    50,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionGazettePublication',
    'file',
    'نشر الجريدة الرسمية',
    'نشر الجريدة الرسمية',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"نشر الجريدة الرسمية مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    51,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionSanctionsClearance',
    'file',
    'إفادة قوائم الحظر والسيطرة',
    'إفادة قوائم الحظر والسيطرة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"إفادة قوائم الحظر والسيطرة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    52,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionInterpolClearance',
    'file',
    'إفادة من الإنتربول',
    'إفادة من الإنتربول',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"إفادة من الإنتربول مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    53,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionHandwrittenRequest',
    'file',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    NULL,
    NULL,
    'يجب أن يكون الطلب مكتوباً بخط اليد',
    'يجب أن يكون الطلب مكتوباً بخط اليد',
    true,
    '{"required":"الطلب المكتوب بخط اليد مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    54,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'nameCorrectionPhoto',
    'file',
    'صورة حديثة',
    'صورة حديثة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الصورة الحديثة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    55,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["name_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'ageCorrectionNationalId',
    'file',
    'صورة من الرقم الوطني',
    'صورة من الرقم الوطني',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة الرقم الوطني مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    56,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'ageCorrectionBirthCertificate',
    'file',
    'شهادة الميلاد',
    'شهادة الميلاد',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"شهادة الميلاد مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    57,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'ageCorrectionPassport',
    'file',
    'صورة من الجواز',
    'صورة من الجواز',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة الجواز مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    58,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'ageCorrectionHandwrittenRequest',
    'file',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    NULL,
    NULL,
    'يجب أن يكون الطلب مكتوباً بخط اليد',
    'يجب أن يكون الطلب مكتوباً بخط اليد',
    true,
    '{"required":"الطلب المكتوب بخط اليد مطلوب"}'::jsonb,
    '[]'::jsonb,
    NULL,
    59,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'ageCorrectionSupportingDocs',
    'file',
    'مستندات داعمة ذات صلة',
    'مستندات داعمة ذات صلة',
    NULL,
    NULL,
    'أي مستندات تدعم طلب تعديل العمر',
    'أي مستندات تدعم طلب تعديل العمر',
    true,
    '{"required":"المستندات الداعمة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    60,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'ageCorrectionPhoto',
    'file',
    'صورة حديثة',
    'صورة حديثة',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"الصورة الحديثة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    61,
    true,
    '[{"operator":"AND","conditions":[{"field":"recordType","values":["national_id"]},{"field":"idType","values":["age_correction"]}]}]'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'conductPassportCopy',
    'file',
    'صورة من الجواز',
    'صورة من الجواز',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الجواز مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    62,
    true,
    '{"field":"recordType","values":["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'conductRecentPhoto',
    'file',
    'صورة حديثة',
    'صورة حديثة',
    NULL,
    NULL,
    'صورة شخصية حديثة',
    'صورة شخصية حديثة',
    true,
    '{"required":"صورة حديثة مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    63,
    true,
    '{"field":"recordType","values":["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'concernPassportCopy',
    'file',
    'صورة من الجواز',
    'صورة من الجواز',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    '{"required":"صورة من الجواز مطلوبة"}'::jsonb,
    '[]'::jsonb,
    NULL,
    64,
    true,
    '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb
  );

  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'documents-upload',
    'المستندات المطلوبة',
    'المستندات المطلوبة',
    'concernRelatedFiles',
    'file',
    'ملفات ذات صلة (إن وجدت)',
    'ملفات ذات صلة (إن وجدت)',
    NULL,
    NULL,
    'أي ملفات أو مستندات ذات صلة بالطلب (اختياري)',
    'أي ملفات أو مستندات ذات صلة بالطلب (اختياري)',
    false,
    '{}'::jsonb,
    '[]'::jsonb,
    NULL,
    65,
    true,
    '{"field":"recordType","values":["towhomitmayconcern"]}'::jsonb
  );

  -- Insert service requirements
  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الرقم الوطني أو الجواز',
    'صورة من الرقم الوطني أو الجواز',
    0,
    true,
    '{"field": "idType", "values": ["replacement"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة حديثة',
    'صورة حديثة',
    1,
    true,
    '{"field": "idType", "values": ["replacement"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز أو الرقم الوطني للوالد والوالدة',
    'صورة من الجواز أو الرقم الوطني للوالد والوالدة',
    2,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة ميلاد أو تبليغ ولادة معتمد',
    'شهادة ميلاد أو تبليغ ولادة معتمد',
    3,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'قسيمة الزواج',
    'قسيمة الزواج',
    4,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة فوتوغرافية حديثة للطفل',
    'صورة فوتوغرافية حديثة للطفل',
    5,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'حضور الوالد والطفل',
    'حضور الوالد والطفل',
    6,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'الحضور المباشر للقنصلية بعد تأكيد الموعد',
    'الحضور المباشر للقنصلية بعد تأكيد الموعد',
    7,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شاهد من العصب',
    'شاهد من العصب',
    8,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة ميلاد',
    'شهادة ميلاد',
    9,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'عدد 2 صورة فوتوغرافية',
    'عدد 2 صورة فوتوغرافية',
    10,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الرقم الوطني',
    'صورة من الرقم الوطني',
    11,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة الميلاد',
    'شهادة الميلاد',
    12,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    13,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'إشهاد شرعي',
    'إشهاد شرعي',
    14,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'نشر الجريدة الرسمية',
    'نشر الجريدة الرسمية',
    15,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'إفادة قوائم الحظر والسيطرة',
    'إفادة قوائم الحظر والسيطرة',
    16,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'إفادة من الإنتربول',
    'إفادة من الإنتربول',
    17,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    18,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة حديثة',
    'صورة حديثة',
    19,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الرقم الوطني',
    'صورة من الرقم الوطني',
    20,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة الميلاد',
    'شهادة الميلاد',
    21,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    22,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    23,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'مستندات داعمة ذات صلة',
    'مستندات داعمة ذات صلة',
    24,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة حديثة',
    'صورة حديثة',
    25,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    26,
    true,
    '{"field": "recordType", "values": ["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'عدد 2 صورة بطاقة',
    'عدد 2 صورة بطاقة',
    27,
    true,
    '{"field": "recordType", "values": ["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'الحضور للقنصلية للبصمة',
    'الحضور للقنصلية للبصمة',
    28,
    true,
    '{"field": "recordType", "values": ["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    29,
    true,
    '{"field": "recordType", "values": ["towhomitmayconcern"]}'::jsonb
  );

  -- Insert service documents
  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الرقم الوطني أو الجواز',
    'صورة من الرقم الوطني أو الجواز',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    0,
    true,
    '{"field": "idType", "values": ["replacement"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة حديثة',
    'صورة حديثة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    1,
    true,
    '{"field": "idType", "values": ["replacement"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز أو الرقم الوطني للوالد والوالدة',
    'صورة من الجواز أو الرقم الوطني للوالد والوالدة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    2,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة ميلاد أو تبليغ ولادة معتمد',
    'شهادة ميلاد أو تبليغ ولادة معتمد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    3,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'قسيمة الزواج',
    'قسيمة الزواج',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    4,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة فوتوغرافية حديثة للطفل',
    'صورة فوتوغرافية حديثة للطفل',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    5,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'حضور الوالد والطفل',
    'حضور الوالد والطفل',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    6,
    true,
    '{"field": "idType", "values": ["newborn"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'الحضور المباشر للقنصلية بعد تأكيد الموعد',
    'الحضور المباشر للقنصلية بعد تأكيد الموعد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    7,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شاهد من العصب',
    'شاهد من العصب',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    8,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة ميلاد',
    'شهادة ميلاد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    9,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'عدد 2 صورة فوتوغرافية',
    'عدد 2 صورة فوتوغرافية',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    10,
    true,
    '{"field": "idType", "values": ["under12"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الرقم الوطني',
    'صورة من الرقم الوطني',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    11,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة الميلاد',
    'شهادة الميلاد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    12,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    13,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'إشهاد شرعي',
    'إشهاد شرعي',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    14,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'نشر الجريدة الرسمية',
    'نشر الجريدة الرسمية',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    15,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'إفادة قوائم الحظر والسيطرة',
    'إفادة قوائم الحظر والسيطرة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    16,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'إفادة من الإنتربول',
    'إفادة من الإنتربول',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    17,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    18,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة حديثة',
    'صورة حديثة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    19,
    true,
    '{"field": "recordType", "values": ["name_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الرقم الوطني',
    'صورة من الرقم الوطني',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    20,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'شهادة الميلاد',
    'شهادة الميلاد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    21,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    22,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    'كتابة طلب لتوضيح الأسباب بخط اليد',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    23,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'مستندات داعمة ذات صلة',
    'مستندات داعمة ذات صلة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    24,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة حديثة',
    'صورة حديثة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    25,
    true,
    '{"field": "recordType", "values": ["age_correction"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    26,
    true,
    '{"field": "recordType", "values": ["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'عدد 2 صورة بطاقة',
    'عدد 2 صورة بطاقة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    27,
    true,
    '{"field": "recordType", "values": ["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'الحضور للقنصلية للبصمة',
    'الحضور للقنصلية للبصمة',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    28,
    true,
    '{"field": "recordType", "values": ["conduct_certificate"]}'::jsonb
  );

  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    'صورة من الجواز',
    'صورة من الجواز',
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    29,
    true,
    '{"field": "recordType", "values": ["towhomitmayconcern"]}'::jsonb
  );

END $$;
