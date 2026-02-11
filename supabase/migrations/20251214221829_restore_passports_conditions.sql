/*
  # استرجاع شروط خدمة جوازات السفر
  
  1. المشكلة
    - جميع شروط الظهور (conditions) في حقول خدمة جوازات السفر أصبحت null
    - تم فقدان الشروط أثناء عملية حفظ خاطئة
  
  2. الحل
    - استرجاع الشروط من الـ migration الأصلي
    - تحديث جميع الحقول بشروطها الصحيحة
  
  3. الشروط المطبقة
    - شروط بسيطة: field + operator + values
    - شروط معقدة: AND/OR operators مع conditions متعددة
*/

-- استرجاع شروط حقل: parentConsent (موافقة الوالد - للقصر فقط)
UPDATE service_fields
SET conditions = '{"field": "isAdult", "operator": "equals", "values": ["no"]}'::jsonb
WHERE service_id = (SELECT id FROM services WHERE slug = 'passports')
  AND field_name = 'parentConsent';

-- استرجاع شروط حقل: oldPassportNumber (رقم الجواز القديم - للتجديد أو البدل)
UPDATE service_fields
SET conditions = '{"field": "passportType", "operator": "in", "values": ["renewal", "replacement"]}'::jsonb
WHERE service_id = (SELECT id FROM services WHERE slug = 'passports')
  AND field_name = 'oldPassportNumber';

-- استرجاع شروط حقل: lossLocation (مكان الفقدان - للبدل فاقد فقط)
UPDATE service_fields
SET conditions = '{"field": "passportType", "operator": "equals", "values": ["replacement"]}'::jsonb
WHERE service_id = (SELECT id FROM services WHERE slug = 'passports')
  AND field_name = 'lossLocation';

-- استرجاع شروط حقل: emergencyReason (سبب وثيقة السفر الاضطرارية)
UPDATE service_fields
SET conditions = '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
WHERE service_id = (SELECT id FROM services WHERE slug = 'passports')
  AND field_name = 'emergencyReason';

-- استرجاع شروط الحقول الخاصة بوثيقة السفر الاضطرارية
UPDATE service_fields
SET conditions = '{"field": "passportType", "operator": "equals", "values": ["emergency"]}'::jsonb
WHERE service_id = (SELECT id FROM services WHERE slug = 'passports')
  AND field_name IN ('birthPlace', 'birthDate', 'arrivalDate', 'height', 'eyeColor', 'hairColor', 'distinctiveMarks');
