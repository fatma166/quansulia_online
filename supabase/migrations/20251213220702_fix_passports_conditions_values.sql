/*
  # تصحيح قيم الشروط لتطابق قيم الحقول
  
  1. المشكلة
    - القيم في service_fields تختلف عن القيم في الشروط
    - passportType في الحقول: new, renewal, replacement, emergency
    - passportType في الشروط: new, renewal, lost, damaged, emergency
  
  2. الحل
    - تحديث الشروط لتستخدم القيم الصحيحة
    - استبدال lost و damaged بـ replacement
*/

-- 1. تحديث صورة الجواز للبالغين
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('yes')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('renewal', 'replacement')
    )
  )
)
WHERE id = 'd854cc0a-afca-46be-86c2-89119fcd7026';

-- 2. تحديث صورة الرقم الوطني للبالغين
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('yes')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('renewal', 'replacement')
    )
  )
)
WHERE id = 'e58766c5-7a68-4d6c-8ecd-776bdc5f67fc';

-- 3. تحديث صورة شخصية للبالغين
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('yes')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('renewal', 'replacement', 'emergency')
    )
  )
)
WHERE id = '3924cba8-fb58-4e4e-99a9-4c831ee3c057';

-- 4. تحديث صورة الجواز للقصر
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('no')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('renewal', 'replacement')
    )
  )
)
WHERE id = '295cd872-407b-4bb5-a043-6f85047f9816';

-- 5. تحديث صورة الرقم الوطني للقصر
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('no')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('renewal', 'replacement')
    )
  )
)
WHERE id = '15291689-282f-4ef1-962b-dac3943edb4a';

-- 6. تحديث صورة جواز الأم
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('no')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('new', 'renewal', 'replacement')
    )
  )
)
WHERE id = '59173a95-b4dd-4c5c-8a3d-2c43fdf90181';

-- 7. تحديث صورة جواز الأب
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('no')
    ),
    jsonb_build_object(
      'field', 'passportType',
      'values', jsonb_build_array('new', 'renewal', 'replacement')
    )
  )
)
WHERE id = 'aadf6442-41a4-4ee7-a7aa-c48f29ab2266';
