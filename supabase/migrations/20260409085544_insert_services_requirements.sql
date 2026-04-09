/*
  # Insert Requirements for All Services

  Adds basic requirements for each service to display in the services grid cards.
*/

-- جوازات السفر
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'جواز السفر المنتهي أو القديم', 'Old or expired passport', true, 1 FROM services WHERE slug = 'passports'
UNION ALL
SELECT id, 'صورة شخصية حديثة', 'Recent personal photo', true, 2 FROM services WHERE slug = 'passports'
UNION ALL
SELECT id, 'نسخة من بطاقة الإقامة', 'Copy of residence permit', true, 3 FROM services WHERE slug = 'passports';

-- التصديقات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الوثيقة الأصلية المراد تصديقها', 'Original document to be attested', true, 1 FROM services WHERE slug = 'attestations'
UNION ALL
SELECT id, 'نسخة من الهوية الوطنية', 'Copy of national ID', true, 2 FROM services WHERE slug = 'attestations'
UNION ALL
SELECT id, 'رسوم التصديق المقررة', 'Required attestation fees', true, 3 FROM services WHERE slug = 'attestations';

-- الأحوال المدنية
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'شهادة الميلاد الأصلية', 'Original birth certificate', true, 1 FROM services WHERE slug = 'civil-registry'
UNION ALL
SELECT id, 'الهوية الوطنية السودانية', 'Sudanese national ID', true, 2 FROM services WHERE slug = 'civil-registry'
UNION ALL
SELECT id, 'صور شخصية', 'Personal photos', true, 3 FROM services WHERE slug = 'civil-registry';

-- الممصادقات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'المستند الأصلي', 'Original document', true, 1 FROM services WHERE slug = 'endorsements'
UNION ALL
SELECT id, 'نسخ مصورة من الوثيقة', 'Photocopies of the document', true, 2 FROM services WHERE slug = 'endorsements'
UNION ALL
SELECT id, 'إثبات الهوية', 'Identity proof', true, 3 FROM services WHERE slug = 'endorsements';

-- التوكيلات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الهوية الوطنية للموكِّل', 'Principal national ID', true, 1 FROM services WHERE slug = 'power-of-attorney'
UNION ALL
SELECT id, 'بيانات الوكيل كاملة', 'Complete agent details', true, 2 FROM services WHERE slug = 'power-of-attorney'
UNION ALL
SELECT id, 'تحديد نوع التوكيل', 'Specify type of power of attorney', true, 3 FROM services WHERE slug = 'power-of-attorney';

-- التأشيرات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'جواز سفر ساري المفعول', 'Valid passport', true, 1 FROM services WHERE slug = 'visas'
UNION ALL
SELECT id, 'صورة شخصية حديثة', 'Recent personal photo', true, 2 FROM services WHERE slug = 'visas'
UNION ALL
SELECT id, 'تعبئة نموذج الطلب', 'Fill application form', true, 3 FROM services WHERE slug = 'visas';

-- الإقرارات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الهوية الوطنية', 'National ID', true, 1 FROM services WHERE slug = 'declarations'
UNION ALL
SELECT id, 'نص الإقرار المطلوب', 'Required declaration text', true, 2 FROM services WHERE slug = 'declarations'
UNION ALL
SELECT id, 'شاهدان بالغان', 'Two adult witnesses', true, 3 FROM services WHERE slug = 'declarations';

-- الشؤون الأسرية
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'وثائق الأحوال المدنية', 'Civil status documents', true, 1 FROM services WHERE slug = 'family-affairs'
UNION ALL
SELECT id, 'الهوية الوطنية لجميع الأطراف', 'National IDs for all parties', true, 2 FROM services WHERE slug = 'family-affairs'
UNION ALL
SELECT id, 'شهادة الزواج إن وجدت', 'Marriage certificate if applicable', true, 3 FROM services WHERE slug = 'family-affairs';

-- ساق الجثمان
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'شهادة الوفاة الرسمية', 'Official death certificate', true, 1 FROM services WHERE slug = 'body-covering'
UNION ALL
SELECT id, 'هوية صاحب الشأن', 'Next of kin ID', true, 2 FROM services WHERE slug = 'body-covering'
UNION ALL
SELECT id, 'إذن النقل من الجهات المختصة', 'Transfer permit from authorities', true, 3 FROM services WHERE slug = 'body-covering';

-- بنك الخرطوم
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الهوية الوطنية', 'National ID', true, 1 FROM services WHERE slug = 'khartoum-bank'
UNION ALL
SELECT id, 'نموذج طلب البنك', 'Bank application form', true, 2 FROM services WHERE slug = 'khartoum-bank'
UNION ALL
SELECT id, 'مستندات داعمة حسب نوع الخدمة', 'Supporting documents as per service type', true, 3 FROM services WHERE slug = 'khartoum-bank';

-- العمل والسجون
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الهوية الوطنية', 'National ID', true, 1 FROM services WHERE slug = 'work-and-prisons'
UNION ALL
SELECT id, 'خطاب من جهة العمل', 'Letter from employer', true, 2 FROM services WHERE slug = 'work-and-prisons'
UNION ALL
SELECT id, 'الوثائق ذات الصلة', 'Relevant documents', true, 3 FROM services WHERE slug = 'work-and-prisons';

-- الخدمات التعليمية
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الشهادة الدراسية الأصلية', 'Original academic certificate', true, 1 FROM services WHERE slug = 'education'
UNION ALL
SELECT id, 'نسخة من الهوية الوطنية', 'Copy of national ID', true, 2 FROM services WHERE slug = 'education'
UNION ALL
SELECT id, 'كشف الدرجات الأصلي', 'Original transcript', true, 3 FROM services WHERE slug = 'education';

-- المذونة
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, is_active, order_index)
SELECT id, 'الهوية الوطنية', 'National ID', true, 1 FROM services WHERE slug = 'madhoonia'
UNION ALL
SELECT id, 'الوثائق الداعمة', 'Supporting documents', true, 2 FROM services WHERE slug = 'madhoonia';
