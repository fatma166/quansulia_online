-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    'الخدمات التعليمية',
    NULL,
    'education',
    'خدمات امتحانات الشهادات الدراسية للمراحل التعليمية المختلفة',
    NULL,
    'GraduationCap',
    'documents',
    '{"base":150,"currency":"ريال سعودي"}',
    '5-7 أيام عمل',
    TRUE,
    '{"process":["اختيار المرحلة التعليمية","تعبئة البيانات المطلوبة","رفع المستندات","مراجعة الطلب","دفع الرسوم","استلام وثيقة التسجيل"],"hasSubcategories":true,"subcategories":[{"id":"secondary","title":"امتحانات الشهادة الثانوية","description":"التقديم لامتحانات الشهادة الثانوية القسم العلمي والأدبي","icon":"📚","color":"from-[#276073] to-[#1e4a5a]","bgColor":"bg-[#276073]/10","route":"/services/education/secondary"},{"id":"intermediate","title":"امتحانات الشهادة المتوسطة","description":"التقديم لامتحانات الشهادة المتوسطة (الصف الثامن)","icon":"📖","color":"from-[#276073] to-[#1e4a5a]","bgColor":"bg-[#276073]/10","route":"/services/education/intermediate"},{"id":"primary","title":"امتحانات الشهادة الابتدائية","description":"التقديم لامتحانات الشهادة الابتدائية (الصف السادس)","icon":"📕","color":"from-[#276073] to-[#1e4a5a]","bgColor":"bg-[#276073]/10","route":"/services/education/primary"},{"id":"exam-supervision","title":"مراقبة الامتحانات","description":"التقديم للعمل كمراقب في الامتحانات الرسمية","icon":"👁️","color":"from-purple-500 to-purple-600","bgColor":"bg-purple-50","route":"/services/education/exam-supervision"}]}'::jsonb
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar,
    fees = EXCLUDED.fees,
    duration = EXCLUDED.duration,
    config = EXCLUDED.config,
    updated_at = NOW();


-- حذف البيانات القديمة للخدمة
DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = 'education';

  IF service_uuid IS NOT NULL THEN
    DELETE FROM service_dynamic_list_fields
    WHERE parent_field_id IN (SELECT id FROM service_fields WHERE service_id = service_uuid);

    DELETE FROM service_requirements WHERE service_id = service_uuid;
    DELETE FROM service_documents WHERE service_id = service_uuid;
    DELETE FROM service_fields WHERE service_id = service_uuid;
  END IF;
END $$;


-- إدراج المتطلبات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, is_active, conditions)
SELECT id, * FROM services, (VALUES
  ('الشهادة السابقة أو ما يعادلها', NULL, 0, TRUE, '{}'::jsonb),
  ('صورة من جواز السفر', NULL, 1, TRUE, '{}'::jsonb),
  ('صورة شخصية حديثة', NULL, 2, TRUE, '{}'::jsonb),
  ('دفع الرسوم المقررة', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = 'education';

