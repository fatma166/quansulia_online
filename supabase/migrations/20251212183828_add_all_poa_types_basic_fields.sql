/*
  # إضافة الحقول الأساسية لجميع أنواع التوكيلات
  
  يضيف الحقول الأساسية المشتركة لجميع أنواع التوكيلات:
  - اسم الموكل ورقم جوازه
  - اسم الوكيل ورقم جوازه
  - مكان استخدام التوكيل
  - نوع التوكيل الفرعي
  - حقول الشهود
  
  الأنواع المشمولة:
  1. توكيلات متنوعة (General)
  2. عقارات وأراضي (Real Estate)
  3. سيارات (Vehicles)
  4. شهادة دراسية (Educational)
  5. الشركات (Companies)
  6. إجراءات الزواج والطلاق (Marriage/Divorce)
  7. شهادات ميلاد (Birth Certificates)
  8. محاكم وقضايا ودعاوي (Courts)
*/

DO $$
DECLARE
  v_service_id uuid;
  v_service_type_id uuid;
  v_service_type_name text;
  v_field_order int;
BEGIN
  -- الحصول على معرف الخدمة الرئيسية
  SELECT id INTO v_service_id
  FROM services
  WHERE slug = 'power-of-attorney'
  LIMIT 1;

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'لم يتم العثور على خدمة التوكيلات';
  END IF;

  -- حلقة لإضافة الحقول لكل نوع من أنواع التوكيلات
  FOR v_service_type_id, v_service_type_name IN 
    SELECT id, name_ar 
    FROM service_types 
    WHERE service_id = v_service_id 
    AND name_ar != 'الورثة' -- الورثة تم إضافتها مسبقاً
  LOOP
    -- حذف الحقول القديمة
    DELETE FROM service_fields WHERE service_type_id = v_service_type_id;
    
    v_field_order := 0;
    
    -- ========== الحقول الأساسية المشتركة ==========
    
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

    -- نوع التوكيل الفرعي (يختلف حسب النوع)
    v_field_order := v_field_order + 1;
    
    -- تحديد الخيارات حسب نوع الخدمة
    IF v_service_type_name = 'توكيلات متنوعة' THEN
      INSERT INTO service_fields (
        service_id, service_type_id, step_id, step_title_ar,
        field_name, label_ar, label_en, field_type,
        is_required, order_index, placeholder_ar, options, is_active
      ) VALUES (
        v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
        'poaSubtype', 'نوع التوكيل', 'POA Subtype',
        'select', true, v_field_order, 'اختر نوع التوكيل',
        jsonb_build_array(
          jsonb_build_object('value', 'new_id_card', 'label', 'استخراج بطاقة جديدة'),
          jsonb_build_object('value', 'replacement_sim', 'label', 'استخرج شريحة بدل فاقد'),
          jsonb_build_object('value', 'transfer_error_form', 'label', 'استمارة تحويل مبلغ بالخطاء'),
          jsonb_build_object('value', 'account_management', 'label', 'ادارة حساب'),
          jsonb_build_object('value', 'saudi_insurance_form', 'label', 'استمارة التامين السعودي'),
          jsonb_build_object('value', 'general_procedure_form', 'label', 'استمارة عامة لإجراء محدد'),
          jsonb_build_object('value', 'foreign_embassy_memo', 'label', 'استمارة مذكرة لسفارة أجنبية'),
          jsonb_build_object('value', 'document_authentication', 'label', 'اسناد مستندات واثبات صحة'),
          jsonb_build_object('value', 'other_general', 'label', 'أخرى')
        ),
        true
      );
    ELSIF v_service_type_name = 'عقارات وأراضي' THEN
      INSERT INTO service_fields (
        service_id, service_type_id, step_id, step_title_ar,
        field_name, label_ar, label_en, field_type,
        is_required, order_index, placeholder_ar, options, is_active
      ) VALUES (
        v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
        'poaSubtype', 'نوع معاملة العقار', 'Real Estate Transaction Type',
        'select', true, v_field_order, 'اختر نوع المعاملة',
        jsonb_build_array(
          jsonb_build_object('value', 'buy_land_property', 'label', 'شراء ارض أو عقار'),
          jsonb_build_object('value', 'land_gift', 'label', 'هبة قطعة ارض'),
          jsonb_build_object('value', 'buy_property_egypt', 'label', 'شراء عقار بمصر'),
          jsonb_build_object('value', 'land_sale', 'label', 'بيع قطعة أرض'),
          jsonb_build_object('value', 'property_sale', 'label', 'بيع عقار'),
          jsonb_build_object('value', 'land_registration', 'label', 'تسجيل قطعة أرض'),
          jsonb_build_object('value', 'property_registration', 'label', 'تسجيل عقار'),
          jsonb_build_object('value', 'other_real_estate', 'label', 'أخرى')
        ),
        true
      );
    ELSIF v_service_type_name = 'سيارات' THEN
      INSERT INTO service_fields (
        service_id, service_type_id, step_id, step_title_ar,
        field_name, label_ar, label_en, field_type,
        is_required, order_index, placeholder_ar, options, is_active
      ) VALUES (
        v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
        'poaSubtype', 'نوع معاملة السيارة', 'Vehicle Transaction Type',
        'select', true, v_field_order, 'اختر نوع المعاملة',
        jsonb_build_array(
          jsonb_build_object('value', 'vehicle_sale', 'label', 'بيع سيارة'),
          jsonb_build_object('value', 'vehicle_receipt', 'label', 'استلام سيارة'),
          jsonb_build_object('value', 'vehicle_shipping', 'label', 'شحن سيارة'),
          jsonb_build_object('value', 'vehicle_licensing', 'label', 'ترخيص سيارة'),
          jsonb_build_object('value', 'vehicle_customs', 'label', 'تخليص جمركي لسيارة'),
          jsonb_build_object('value', 'other_vehicles', 'label', 'أخرى')
        ),
        true
      );
    ELSIF v_service_type_name = 'شهادة دراسية' THEN
      INSERT INTO service_fields (
        service_id, service_type_id, step_id, step_title_ar,
        field_name, label_ar, label_en, field_type,
        is_required, order_index, placeholder_ar, options, is_active
      ) VALUES (
        v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
        'poaSubtype', 'نوع الإجراء التعليمي', 'Educational Procedure Type',
        'select', true, v_field_order, 'اختر نوع الإجراء',
        jsonb_build_array(
          jsonb_build_object('value', 'university_masters', 'label', 'دراسة جامعية ماجستير'),
          jsonb_build_object('value', 'egyptian_fellowship_form', 'label', 'استمارة الزمالة المصرية'),
          jsonb_build_object('value', 'educational_certificate_issuance', 'label', 'إستخراج شهادة دراسية'),
          jsonb_build_object('value', 'university_egypt', 'label', 'دراسة جامعية بمصر'),
          jsonb_build_object('value', 'university_turkey', 'label', 'دراسة جامعية بتركيا'),
          jsonb_build_object('value', 'other_educational', 'label', 'أخرى')
        ),
        true
      );
    ELSIF v_service_type_name = 'الشركات' THEN
      INSERT INTO service_fields (
        service_id, service_type_id, step_id, step_title_ar,
        field_name, label_ar, label_en, field_type,
        is_required, order_index, placeholder_ar, options, is_active
      ) VALUES (
        v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
        'poaSubtype', 'نوع معاملة الشركة', 'Company Transaction Type',
        'select', true, v_field_order, 'اختر نوع المعاملة',
        jsonb_build_array(
          jsonb_build_object('value', 'company_registration_form', 'label', 'استمارة تسجيل شركة'),
          jsonb_build_object('value', 'business_name_form', 'label', 'استمارة تأسيس اسم عمل'),
          jsonb_build_object('value', 'shares_disposal', 'label', 'التصرف في اسهم'),
          jsonb_build_object('value', 'other_companies', 'label', 'أخرى')
        ),
        true
      );
    ELSE
      -- للأنواع الأخرى (زواج/طلاق، شهادات ميلاد، محاكم)
      INSERT INTO service_fields (
        service_id, service_type_id, step_id, step_title_ar,
        field_name, label_ar, label_en, field_type,
        is_required, order_index, placeholder_ar, is_active
      ) VALUES (
        v_service_id, v_service_type_id, 'service-details', 'بيانات الخدمة',
        'poaPurpose', 'الغرض من التوكيل', 'Purpose of POA',
        'textarea', true, v_field_order, 'حدد الغرض من التوكيل بالتفصيل', true
      );
    END IF;

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

  END LOOP;

END $$;
