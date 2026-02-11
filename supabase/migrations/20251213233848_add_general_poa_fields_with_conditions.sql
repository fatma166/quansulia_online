/*
  # إضافة الحقول الديناميكية لخدمة التوكيلات المنوعة مع الشروط
  
  1. الهدف
    - إضافة جميع الحقول الديناميكية التي تظهر حسب نوع التوكيل المختار
    - تطبيق الشروط على كل حقل ليظهر في الحالات المناسبة
  
  2. الحقول المضافة (28 حقل جديد)
    - حقول شركة الاتصالات (6 حقول): telecomCompany, subscriberName, subscriberNationalId, simNumber, phoneNumber, reasonForReplacement
    - حقول البنك (7 حقول): bankName, accountNumber, transferAmount, transferDate, senderName, recipientName, errorDescription
    - حقول التأمين (3 حقول): insuranceCompany, policyNumber, insuranceType
    - حقول الإجراء المخصص (3 حقول): procedureTitle, procedureDescription, targetEntity
    - حقول مذكرة السفارة (3 حقول): embassyCountry, noteSubject, noteDetails
    - حقول إسناد المستندات (4 حقول): documentType, documentIssuer, documentNumber, documentIssueDate
    - حقول "أخرى" (2 حقل): otherPoaDescription, additionalNotes
  
  3. نظام الشروط
    - يستخدم النسق البسيط: {"field": "generalType", "values": ["value1", "value2"]}
    - يدعم exclude للشهود: {"field": "generalType", "values": [...], "exclude": true}
*/

-- حذف الحقول القديمة إن وجدت
DELETE FROM service_fields 
WHERE service_type_id = 'f7c44bd4-7799-4437-a076-200c5ecdca5b'
AND field_name IN (
  'telecomCompany', 'subscriberName', 'subscriberNationalId', 'simNumber', 'phoneNumber', 'reasonForReplacement',
  'bankName', 'accountNumber', 'transferAmount', 'transferDate', 'senderName', 'recipientName', 'errorDescription',
  'insuranceCompany', 'policyNumber', 'insuranceType',
  'procedureTitle', 'procedureDescription', 'targetEntity',
  'embassyCountry', 'noteSubject', 'noteDetails',
  'documentType', 'documentIssuer', 'documentNumber', 'documentIssueDate',
  'otherPoaDescription', 'additionalNotes'
);

-- ===============================
-- حقول شركة الاتصالات
-- ===============================

INSERT INTO service_fields (service_id, service_type_id, field_name, field_type, label_ar, label_en, placeholder_ar, is_required, is_active, order_index, step_id, step_title_ar, options, conditions) VALUES
('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'telecomCompany', 'select', 'شركة الاتصالات', 'Telecom Company', 'اختر شركة الاتصالات', true, true, 11, 'step_2', 'بيانات الخدمة', '[{"value": "stc", "label": "STC"}, {"value": "mobily", "label": "موبايلي"}, {"value": "zain", "label": "زين"}, {"value": "lebara", "label": "ليبارا"}]'::jsonb, '{"field": "generalType", "values": ["replacement_sim", "new_id_card"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'subscriberName', 'text', 'اسم المشترك', 'Subscriber Name', 'أدخل اسم المشترك', true, true, 12, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["replacement_sim", "new_id_card"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'subscriberNationalId', 'text', 'رقم الهوية الوطنية للمشترك', 'Subscriber National ID', 'أدخل رقم الهوية', true, true, 13, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["replacement_sim", "new_id_card"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'simNumber', 'text', 'رقم الشريحة (SIM)', 'SIM Number', 'أدخل رقم الشريحة', false, true, 14, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["replacement_sim"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'phoneNumber', 'tel', 'رقم الجوال', 'Phone Number', 'أدخل رقم الجوال', true, true, 15, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["replacement_sim"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'reasonForReplacement', 'select', 'سبب الاستبدال', 'Reason for Replacement', 'اختر السبب', true, true, 16, 'step_2', 'بيانات الخدمة', '[{"value": "lost", "label": "فقدان"}, {"value": "damaged", "label": "تلف"}, {"value": "stolen", "label": "سرقة"}]'::jsonb, '{"field": "generalType", "values": ["replacement_sim"]}'::jsonb),

-- ===============================
-- حقول البنك
-- ===============================

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'bankName', 'text', 'اسم البنك', 'Bank Name', 'أدخل اسم البنك', true, true, 17, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error", "account_management"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'accountNumber', 'text', 'رقم الحساب', 'Account Number', 'أدخل رقم الحساب', true, true, 18, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error", "account_management"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'transferAmount', 'number', 'مبلغ التحويل', 'Transfer Amount', 'أدخل المبلغ', true, true, 19, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'transferDate', 'date', 'تاريخ التحويل', 'Transfer Date', 'اختر التاريخ', true, true, 20, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'senderName', 'text', 'اسم المرسل', 'Sender Name', 'أدخل اسم المرسل', true, true, 21, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'recipientName', 'text', 'اسم المستلم', 'Recipient Name', 'أدخل اسم المستلم', true, true, 22, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'errorDescription', 'textarea', 'وصف الخطأ', 'Error Description', 'اشرح تفاصيل الخطأ', true, true, 23, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["transfer_error"]}'::jsonb),

-- ===============================
-- حقول التأمين
-- ===============================

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'insuranceCompany', 'text', 'شركة التأمين', 'Insurance Company', 'أدخل اسم شركة التأمين', true, true, 24, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["saudi_insurance"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'policyNumber', 'text', 'رقم الوثيقة', 'Policy Number', 'أدخل رقم وثيقة التأمين', true, true, 25, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["saudi_insurance"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'insuranceType', 'select', 'نوع التأمين', 'Insurance Type', 'اختر نوع التأمين', true, true, 26, 'step_2', 'بيانات الخدمة', '[{"value": "health", "label": "تأمين صحي"}, {"value": "vehicle", "label": "تأمين مركبات"}, {"value": "life", "label": "تأمين على الحياة"}, {"value": "property", "label": "تأمين ممتلكات"}]'::jsonb, '{"field": "generalType", "values": ["saudi_insurance"]}'::jsonb),

-- ===============================
-- حقول الإجراء المخصص
-- ===============================

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'procedureTitle', 'text', 'عنوان الإجراء', 'Procedure Title', 'أدخل عنوان الإجراء', true, true, 27, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["specific_procedure"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'procedureDescription', 'textarea', 'وصف الإجراء', 'Procedure Description', 'اشرح تفاصيل الإجراء المطلوب', true, true, 28, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["specific_procedure"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'targetEntity', 'text', 'الجهة المستهدفة', 'Target Entity', 'أدخل اسم الجهة', true, true, 29, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["specific_procedure"]}'::jsonb),

-- ===============================
-- حقول مذكرة السفارة
-- ===============================

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'embassyCountry', 'text', 'الدولة (السفارة)', 'Country (Embassy)', 'أدخل اسم الدولة', true, true, 30, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["embassy_note"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'noteSubject', 'text', 'موضوع المذكرة', 'Note Subject', 'أدخل موضوع المذكرة', true, true, 31, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["embassy_note"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'noteDetails', 'textarea', 'تفاصيل المذكرة', 'Note Details', 'اشرح تفاصيل المذكرة', true, true, 32, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["embassy_note"]}'::jsonb),

-- ===============================
-- حقول إسناد المستندات
-- ===============================

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'documentType', 'text', 'نوع المستند', 'Document Type', 'أدخل نوع المستند', true, true, 33, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["document_attestation"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'documentIssuer', 'text', 'جهة إصدار المستند', 'Document Issuer', 'أدخل اسم الجهة', true, true, 34, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["document_attestation"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'documentNumber', 'text', 'رقم المستند', 'Document Number', 'أدخل رقم المستند', false, true, 35, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["document_attestation"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'documentIssueDate', 'date', 'تاريخ إصدار المستند', 'Document Issue Date', 'اختر التاريخ', false, true, 36, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["document_attestation"]}'::jsonb),

-- ===============================
-- حقول "أخرى"
-- ===============================

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'otherPoaDescription', 'textarea', 'وصف التوكيل', 'POA Description', 'اشرح تفاصيل التوكيل المطلوب', true, true, 37, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["other"]}'::jsonb),

('1e5b92de-03bf-4669-85db-5e766835f215', 'f7c44bd4-7799-4437-a076-200c5ecdca5b', 'additionalNotes', 'textarea', 'ملاحظات إضافية', 'Additional Notes', 'أضف أي ملاحظات إضافية', false, true, 38, 'step_2', 'بيانات الخدمة', null, '{"field": "generalType", "values": ["other"]}'::jsonb);
