/*
  # إضافة حقول خدمة توكيل الورثة
  
  1. الحقول المضافة
    - حقول أساسية مشتركة لجميع أنواع توكيلات الورثة:
      - اسم الموكل ورقم جوازه
      - اسم الوكيل ورقم جوازه
      - مكان استخدام التوكيل
      - نوع توكيل الورثة (حصر، تنازل، تقاضي، إشراف، تصرف، استلام)
    - حقول متقدمة (تظهر حسب نوع التوكيل):
      - اسم المورث ورقم الإعلام الشرعي (للتنازل)
      - معلومات المحكمة (للتنازل)
      - وصف المعاملة (للأنواع الأخرى)
    - حقول الشهود (شاهدين بأسماءهم وأرقام جوازاتهم)
  
  2. الملاحظات
    - جميع الحقول مطلوبة
    - الحقول المتقدمة تظهر بناءً على نوع التوكيل المختار
*/

-- إضافة حقول خدمة توكيل الورثة
DO $$
DECLARE
  v_service_id uuid;
  v_service_type_id uuid;
  v_field_order int := 0;
BEGIN
  -- الحصول على معرف الخدمة الرئيسية (التوكيلات)
  SELECT id INTO v_service_id
  FROM services
  WHERE slug = 'power-of-attorney'
  LIMIT 1;

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'لم يتم العثور على خدمة التوكيلات';
  END IF;

  -- الحصول على معرف service_type للورثة
  SELECT id INTO v_service_type_id
  FROM service_types
  WHERE name_ar = 'الورثة' AND service_id = v_service_id
  LIMIT 1;

  IF v_service_type_id IS NULL THEN
    RAISE EXCEPTION 'لم يتم العثور على نوع خدمة الورثة';
  END IF;

  -- حذف الحقول القديمة إذا كانت موجودة
  DELETE FROM service_fields WHERE service_type_id = v_service_type_id;

  -- ========== الحقول الأساسية ==========
  
  -- اسم الموكل
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'principalName', 'اسم الموكل (رباعي)', 'Principal Name (Full)',
    'text', true, v_field_order, 'أدخل الاسم الرباعي للموكل', true
  );

  -- رقم جواز الموكل
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'principalPassport', 'رقم جواز الموكل', 'Principal Passport Number',
    'text', true, v_field_order, 'أدخل رقم جواز السفر', true
  );

  -- اسم الوكيل
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'agentName', 'اسم الوكيل (رباعي)', 'Agent Name (Full)',
    'text', true, v_field_order, 'أدخل الاسم الرباعي للوكيل', true
  );

  -- رقم جواز الوكيل
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'agentPassport', 'رقم جواز الوكيل', 'Agent Passport Number',
    'text', true, v_field_order, 'أدخل رقم جواز السفر', true
  );

  -- مكان استخدام التوكيل
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'poaUsagePlace', 'مكان استخدام التوكيل (الدولة)', 'POA Usage Location (Country)',
    'text', true, v_field_order, 'أدخل اسم الدولة', true
  );

  -- نوع توكيل الورثة
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, options, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'inheritanceType', 'نوع توكيل الورثة', 'Type of Inheritance POA',
    'select', true, v_field_order, 'اختر نوع التوكيل',
    jsonb_build_array(
      jsonb_build_object('value', 'inheritance_inventory_form', 'label', 'حصر الورثة'),
      jsonb_build_object('value', 'inheritance_waiver', 'label', 'تنازل عن نصيب في ورثة'),
      jsonb_build_object('value', 'inheritance_litigation', 'label', 'تقاضي ورثة'),
      jsonb_build_object('value', 'inheritance_supervision', 'label', 'إشراف ورثة'),
      jsonb_build_object('value', 'inheritance_disposal', 'label', 'تصرف في ورثة'),
      jsonb_build_object('value', 'inheritance_receipt', 'label', 'استلام ورثة'),
      jsonb_build_object('value', 'other_inheritance', 'label', 'أخرى')
    ),
    true
  );

  -- ========== حقول حصر الورثة ==========
  
  -- الغرض من التوكيل (يظهر فقط لحصر الورثة)
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, options, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'poaPurpose', 'الغرض من التوكيل', 'Purpose of POA',
    'select', true, v_field_order, 'اختر الغرض',
    jsonb_build_array(
      jsonb_build_object('value', 'inventory', 'label', 'حصر ورثة'),
      jsonb_build_object('value', 'certificate', 'label', 'إصدار إعلام شرعي'),
      jsonb_build_object('value', 'other', 'label', 'أخرى')
    ),
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'inheritance_inventory_form'
    ),
    true
  );

  -- غرض آخر (يظهر عند اختيار "أخرى")
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'otherPurpose', 'حدد الغرض', 'Specify Purpose',
    'text', true, v_field_order, 'أدخل الغرض من التوكيل',
    jsonb_build_object(
      'operator', 'AND',
      'conditions', jsonb_build_array(
        jsonb_build_object('field', 'inheritanceType', 'operator', '==', 'value', 'inheritance_inventory_form'),
        jsonb_build_object('field', 'poaPurpose', 'operator', '==', 'value', 'other')
      )
    ),
    true
  );

  -- ========== حقول التنازل والتقاضي ==========
  
  -- اسم المورث
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'inheritedPersonName', 'اسم المورِّث', 'Deceased Name',
    'text', true, v_field_order, 'أدخل اسم المورث',
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', 'in',
      'value', jsonb_build_array('inheritance_waiver', 'inheritance_litigation')
    ),
    true
  );

  -- رقم الإعلام الشرعي (للتنازل فقط)
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'legalNoticeNumber', 'رقم الإعلام الشرعي / إعلام الورثة', 'Legal Notice / Inheritance Certificate Number',
    'text', true, v_field_order, 'أدخل رقم الإعلام',
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'inheritance_waiver'
    ),
    true
  );

  -- رقم التركة (للتنازل فقط)
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'estateNumber', 'رقم التركة', 'Estate Number',
    'text', true, v_field_order, 'أدخل رقم التركة',
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'inheritance_waiver'
    ),
    true
  );

  -- اسم المحكمة (للتنازل فقط)
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'courtName', 'اسم المحكمة', 'Court Name',
    'text', true, v_field_order, 'أدخل اسم المحكمة',
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'inheritance_waiver'
    ),
    true
  );

  -- وصف معاملة الورثة (للأنواع الأخرى)
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, conditions, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'inheritanceDescription', 'وصف معاملة الورثة', 'Inheritance Transaction Description',
    'textarea', true, v_field_order, 'أدخل وصفاً تفصيلياً للمعاملة',
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'other_inheritance'
    ),
    true
  );

  -- ========== حقول الشهود ==========
  
  -- الشاهد الأول - الاسم
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'firstWitnessName', 'اسم الشاهد الأول', 'First Witness Name',
    'text', true, v_field_order, 'أدخل اسم الشاهد الأول', true
  );

  -- الشاهد الأول - رقم الجواز
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'firstWitnessPassport', 'رقم جواز سفر ساري - الشاهد الأول', 'First Witness Passport Number',
    'text', true, v_field_order, 'أدخل رقم جواز السفر', true
  );

  -- الشاهد الثاني - الاسم
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'secondWitnessName', 'اسم الشاهد الثاني', 'Second Witness Name',
    'text', true, v_field_order, 'أدخل اسم الشاهد الثاني', true
  );

  -- الشاهد الثاني - رقم الجواز
  v_field_order := v_field_order + 1;
  INSERT INTO service_fields (
    service_id, service_type_id, step_id, step_title_ar,
    field_name, label_ar, label_en, field_type,
    is_required, order_index, placeholder_ar, is_active
  ) VALUES (
    v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
    'secondWitnessPassport', 'رقم جواز سفر ساري - الشاهد الثاني', 'Second Witness Passport Number',
    'text', true, v_field_order, 'أدخل رقم جواز السفر', true
  );

END $$;
