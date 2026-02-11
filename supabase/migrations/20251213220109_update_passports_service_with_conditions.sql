/*
  # تحديث شروط المستندات في خدمة الجوازات
  
  1. الهدف
    - تحديث حقل conditions لكل مستند ليطابق الشروط الصحيحة
    - الشروط بناءً على عمر المتقدم ونوع الطلب
  
  2. التغييرات
    
    للبالغين (isAdult = "yes"):
    - صورة الجواز: تجديد، بدل فاقد، تالف
    - صورة الرقم الوطني: تجديد، بدل فاقد، تالف
    - صورة شخصية: تجديد، بدل فاقد، تالف، وثيقة سفر اضطرارية
    
    للقصر (isAdult = "no"):
    - صورة الجواز: تجديد، بدل فاقد، تالف
    - صورة الرقم الوطني: تجديد، بدل فاقد، تالف (مستند جديد)
    - صورة جواز الأم: إصدار جديد، تجديد، بدل فاقد
    - صورة جواز الأب: إصدار جديد، تجديد، بدل فاقد
    - صورة شخصية: جميع الحالات
    
  3. ملاحظات
    - القيم المستخدمة: new, renewal, lost, damaged, emergency
    - تم تغيير replacement إلى lost
    - تم تغيير travel-document إلى emergency
*/

-- 1. تحديث صورة الجواز للبالغين (تجديد، بدل فاقد، تالف)
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
      'values', jsonb_build_array('renewal', 'lost', 'damaged')
    )
  )
)
WHERE id = 'd854cc0a-afca-46be-86c2-89119fcd7026';

-- 2. تحديث صورة الرقم الوطني للبالغين (تجديد، بدل فاقد، تالف)
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
      'values', jsonb_build_array('renewal', 'lost', 'damaged')
    )
  )
)
WHERE id = 'e58766c5-7a68-4d6c-8ecd-776bdc5f67fc';

-- 3. تحديث صورة شخصية للبالغين (تجديد، بدل فاقد، تالف، وثيقة سفر)
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
      'values', jsonb_build_array('renewal', 'lost', 'damaged', 'emergency')
    )
  )
)
WHERE id = '3924cba8-fb58-4e4e-99a9-4c831ee3c057';

-- 4. حذف مستند صورة الجواز للقصر (new) - لأنه مكرر
DELETE FROM service_documents
WHERE id = '671cc2d9-a2f0-44ba-89d4-6405649717a1';

-- 5. تحديث صورة الجواز للقصر (تجديد، بدل فاقد، تالف)
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
      'values', jsonb_build_array('renewal', 'lost', 'damaged')
    )
  )
)
WHERE id = '295cd872-407b-4bb5-a043-6f85047f9816';

-- 6. إضافة مستند صورة الرقم الوطني للقصر (تجديد، بدل فاقد، تالف)
INSERT INTO service_documents (
  id,
  service_id,
  document_name_en,
  document_name_ar,
  description_ar,
  is_required,
  max_size_mb,
  accepted_formats,
  order_index,
  conditions
) VALUES (
  gen_random_uuid(),
  '07259b33-5364-4e5c-8162-8421813dfb1b',
  'National ID Copy (Minor)',
  'صورة من الرقم الوطني (قاصر)',
  'صورة واضحة من الرقم الوطني للقاصر',
  true,
  5,
  '["image/jpeg", "image/png", "application/pdf"]'::jsonb,
  4,
  jsonb_build_object(
    'operator', 'AND',
    'conditions', jsonb_build_array(
      jsonb_build_object(
        'field', 'isAdult',
        'values', jsonb_build_array('no')
      ),
      jsonb_build_object(
        'field', 'passportType',
        'values', jsonb_build_array('renewal', 'lost', 'damaged')
      )
    )
  )
);

-- 7. تحديث صورة جواز الأم (إصدار جديد، تجديد، بدل فاقد)
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
      'values', jsonb_build_array('new', 'renewal', 'lost')
    )
  )
),
order_index = 5
WHERE id = '59173a95-b4dd-4c5c-8a3d-2c43fdf90181';

-- 8. تحديث صورة جواز الأب (إصدار جديد، تجديد، بدل فاقد)
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
      'values', jsonb_build_array('new', 'renewal', 'lost')
    )
  )
),
order_index = 6
WHERE id = 'aadf6442-41a4-4ee7-a7aa-c48f29ab2266';

-- 9. تحديث صورة شخصية للقصر (جميع الحالات)
UPDATE service_documents
SET conditions = jsonb_build_object(
  'operator', 'AND',
  'conditions', jsonb_build_array(
    jsonb_build_object(
      'field', 'isAdult',
      'values', jsonb_build_array('no')
    )
  )
),
order_index = 7
WHERE id = '9ca4dda9-a231-4dbe-9a03-a27cff3f30a1';
