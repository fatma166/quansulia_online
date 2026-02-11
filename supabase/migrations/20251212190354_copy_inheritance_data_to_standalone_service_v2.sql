/*
  # نسخ بيانات الورثة إلى الخدمة المستقلة
  
  ينسخ جميع الحقول والمتطلبات والمستندات من service_type (الخدمة الفرعية تحت التوكيلات)
  إلى service المستقلة (خدمة الورثة المستقلة)
*/

DO $$
DECLARE
  v_source_service_type_id uuid := '8865e5f9-972d-4f2f-bbfa-5f29d2b78302'; -- service_type الورثة
  v_target_service_id uuid := 'd75c0060-1a0a-4c55-a467-39424bc75d74'; -- service الورثة المستقلة
  v_field_record RECORD;
  v_req_record RECORD;
  v_doc_record RECORD;
BEGIN
  -- حذف البيانات القديمة من الخدمة المستقلة
  DELETE FROM service_fields WHERE service_id = v_target_service_id;
  DELETE FROM service_requirements WHERE service_id = v_target_service_id;
  DELETE FROM service_documents WHERE service_id = v_target_service_id;

  -- ========== نسخ الحقول ==========
  FOR v_field_record IN 
    SELECT * FROM service_fields 
    WHERE service_type_id = v_source_service_type_id
    ORDER BY order_index
  LOOP
    INSERT INTO service_fields (
      service_id,
      service_type_id,
      step_id,
      step_title_ar,
      step_title_en,
      field_name,
      label_ar,
      label_en,
      field_type,
      is_required,
      order_index,
      placeholder_ar,
      placeholder_en,
      help_text_ar,
      help_text_en,
      options,
      validation_rules,
      conditions,
      default_value,
      is_active
    ) VALUES (
      v_target_service_id,
      NULL,
      v_field_record.step_id,
      v_field_record.step_title_ar,
      v_field_record.step_title_en,
      v_field_record.field_name,
      v_field_record.label_ar,
      v_field_record.label_en,
      v_field_record.field_type,
      v_field_record.is_required,
      v_field_record.order_index,
      v_field_record.placeholder_ar,
      v_field_record.placeholder_en,
      v_field_record.help_text_ar,
      v_field_record.help_text_en,
      v_field_record.options,
      v_field_record.validation_rules,
      v_field_record.conditions,
      v_field_record.default_value,
      v_field_record.is_active
    );
  END LOOP;

  -- ========== نسخ المتطلبات ==========
  FOR v_req_record IN 
    SELECT * FROM service_requirements 
    WHERE service_type_id = v_source_service_type_id
    ORDER BY order_index
  LOOP
    INSERT INTO service_requirements (
      service_id,
      service_type_id,
      requirement_ar,
      requirement_en,
      order_index,
      is_active,
      conditions
    ) VALUES (
      v_target_service_id,
      NULL,
      v_req_record.requirement_ar,
      v_req_record.requirement_en,
      v_req_record.order_index,
      v_req_record.is_active,
      v_req_record.conditions
    );
  END LOOP;

  -- ========== نسخ المستندات ==========
  FOR v_doc_record IN 
    SELECT * FROM service_documents 
    WHERE service_type_id = v_source_service_type_id
    ORDER BY order_index
  LOOP
    INSERT INTO service_documents (
      service_id,
      service_type_id,
      document_name_ar,
      document_name_en,
      is_required,
      order_index,
      is_active,
      conditions
    ) VALUES (
      v_target_service_id,
      NULL,
      v_doc_record.document_name_ar,
      v_doc_record.document_name_en,
      v_doc_record.is_required,
      v_doc_record.order_index,
      v_doc_record.is_active,
      v_doc_record.conditions
    );
  END LOOP;

  RAISE NOTICE 'تم نسخ البيانات بنجاح!';
END $$;
