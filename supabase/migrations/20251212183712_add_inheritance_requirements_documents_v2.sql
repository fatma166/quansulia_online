/*
  # إضافة المتطلبات والمستندات لخدمة توكيل الورثة
  
  1. المتطلبات
    - جواز سفر الموكل ساري المفعول
    - جواز سفر الوكيل ساري المفعول
    - جواز سفر الشاهدين ساري المفعول
    - حضور الموكل شخصياً
    - رسوم الخدمة حسب التعرفة المعتمدة
  
  2. المستندات المطلوبة
    - صورة من جواز سفر الموكل (صفحات البيانات الشخصية)
    - صورة من جواز سفر الوكيل
    - صورة من جواز سفر الشاهد الأول
    - صورة من جواز سفر الشاهد الثاني
    - إعلام الورثة أو الإعلام الشرعي (للتنازل)
    - مستندات إضافية حسب نوع التوكيل
*/

DO $$
DECLARE
  v_service_id uuid;
  v_service_type_id uuid;
  v_req_order int := 0;
  v_doc_order int := 0;
BEGIN
  -- الحصول على معرف الخدمة الرئيسية
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
  WHERE name_ar = 'الورثة' 
  AND service_id = v_service_id
  LIMIT 1;

  IF v_service_type_id IS NULL THEN
    RAISE EXCEPTION 'لم يتم العثور على خدمة الورثة';
  END IF;

  -- حذف المتطلبات والمستندات القديمة
  DELETE FROM service_requirements WHERE service_type_id = v_service_type_id;
  DELETE FROM service_documents WHERE service_type_id = v_service_type_id;

  -- ========== إضافة المتطلبات ==========
  
  -- متطلب 1
  v_req_order := v_req_order + 1;
  INSERT INTO service_requirements (
    service_id, service_type_id, requirement_ar, requirement_en,
    order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'جواز سفر الموكل ساري المفعول',
    'Valid passport of the principal',
    v_req_order, true
  );

  -- متطلب 2
  v_req_order := v_req_order + 1;
  INSERT INTO service_requirements (
    service_id, service_type_id, requirement_ar, requirement_en,
    order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'جواز سفر الوكيل ساري المفعول',
    'Valid passport of the agent',
    v_req_order, true
  );

  -- متطلب 3
  v_req_order := v_req_order + 1;
  INSERT INTO service_requirements (
    service_id, service_type_id, requirement_ar, requirement_en,
    order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'جواز سفر الشاهدين ساري المفعول',
    'Valid passports of both witnesses',
    v_req_order, true
  );

  -- متطلب 4
  v_req_order := v_req_order + 1;
  INSERT INTO service_requirements (
    service_id, service_type_id, requirement_ar, requirement_en,
    order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'حضور الموكل شخصياً للقنصلية',
    'Personal attendance of the principal at the consulate',
    v_req_order, true
  );

  -- متطلب 5
  v_req_order := v_req_order + 1;
  INSERT INTO service_requirements (
    service_id, service_type_id, requirement_ar, requirement_en,
    order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'إحضار إعلام الورثة (للتنازل عن نصيب)',
    'Inheritance certificate (for waiver of share)',
    v_req_order, true
  );

  -- متطلب 6
  v_req_order := v_req_order + 1;
  INSERT INTO service_requirements (
    service_id, service_type_id, requirement_ar, requirement_en,
    order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'رسوم الخدمة حسب التعرفة المعتمدة',
    'Service fees according to approved tariff',
    v_req_order, true
  );

  -- ========== إضافة المستندات المطلوبة ==========
  
  -- مستند 1
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'صورة من جواز سفر الموكل (صفحات البيانات)',
    'Copy of principal passport (data pages)',
    true, v_doc_order, true
  );

  -- مستند 2
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'صورة من جواز سفر الوكيل',
    'Copy of agent passport',
    true, v_doc_order, true
  );

  -- مستند 3
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'صورة من جواز سفر الشاهد الأول',
    'Copy of first witness passport',
    true, v_doc_order, true
  );

  -- مستند 4
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'صورة من جواز سفر الشاهد الثاني',
    'Copy of second witness passport',
    true, v_doc_order, true
  );

  -- مستند 5 (شرطي - للتنازل)
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active, conditions
  ) VALUES (
    v_service_id, v_service_type_id,
    'إعلام الورثة أو الإعلام الشرعي',
    'Inheritance certificate or legal notice',
    true, v_doc_order, true,
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'inheritance_waiver'
    )
  );

  -- مستند 6 (شرطي - للتنازل)
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active, conditions
  ) VALUES (
    v_service_id, v_service_type_id,
    'وثائق التركة من المحكمة',
    'Estate documents from the court',
    true, v_doc_order, true,
    jsonb_build_object(
      'field', 'inheritanceType',
      'operator', '==',
      'value', 'inheritance_waiver'
    )
  );

  -- مستند 7
  v_doc_order := v_doc_order + 1;
  INSERT INTO service_documents (
    service_id, service_type_id, document_name_ar, document_name_en,
    is_required, order_index, is_active
  ) VALUES (
    v_service_id, v_service_type_id,
    'أي مستندات إضافية متعلقة بالمعاملة',
    'Any additional documents related to the transaction',
    false, v_doc_order, true
  );

END $$;
