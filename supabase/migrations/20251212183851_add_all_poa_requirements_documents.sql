/*
  # إضافة المتطلبات والمستندات لجميع أنواع التوكيلات
  
  يضيف المتطلبات والمستندات الأساسية المشتركة لكل نوع توكيل
*/

DO $$
DECLARE
  v_service_id uuid;
  v_service_type_id uuid;
  v_req_order int;
  v_doc_order int;
BEGIN
  -- الحصول على معرف الخدمة الرئيسية
  SELECT id INTO v_service_id
  FROM services
  WHERE slug = 'power-of-attorney'
  LIMIT 1;

  -- حلقة لإضافة المتطلبات والمستندات لكل نوع
  FOR v_service_type_id IN 
    SELECT id 
    FROM service_types 
    WHERE service_id = v_service_id
    AND name_ar != 'الورثة' -- الورثة تم إضافتها مسبقاً
  LOOP
    -- حذف القديم
    DELETE FROM service_requirements WHERE service_type_id = v_service_type_id;
    DELETE FROM service_documents WHERE service_type_id = v_service_type_id;
    
    v_req_order := 0;
    v_doc_order := 0;
    
    -- ========== المتطلبات المشتركة ==========
    
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

    -- ========== المستندات المطلوبة ==========
    
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

  END LOOP;

END $$;
