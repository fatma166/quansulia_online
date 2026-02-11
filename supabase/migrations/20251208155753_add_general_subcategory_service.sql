/*
  # خدمة: توكيلات منوعة (general)

  إضافة خدمة فرعية لتوكيلات منوعة مع:
  - 27 حقل
  - 4 متطلبات
  - دعم شروط العرض الديناميكية
*/

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config, parent_id
  ) VALUES (
    'توكيلات منوعة',
    NULL,
    'general',
    'توكيلات منوعة لجميع الأغراض والمعاملات',
    NULL,
    'FileText',
    'legal',
    '{"base":180,"currency":"ريال سعودي"}',
    '1-2 يوم عمل',
    TRUE,
    '{"process":["تحديد الغرض من التوكيل","ملء البيانات المطلوبة","حضور الموكل شخصياً","التوقيع أمام الموظف المختص","ختم وتوثيق التوكيل"],"hasSubcategories":false,"subcategories":[]}'::jsonb,
    (SELECT id FROM services WHERE slug = 'power-of-attorney')
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar,
    fees = EXCLUDED.fees,
    duration = EXCLUDED.duration,
    config = EXCLUDED.config,
    parent_id = EXCLUDED.parent_id,
    updated_at = NOW();

-- حذف البيانات القديمة للخدمة
DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = 'general' AND parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');

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
SELECT
  s.id,
  req.requirement_ar,
  req.requirement_en,
  req.order_index,
  req.is_active,
  req.conditions
FROM services s
CROSS JOIN (VALUES
  ('حضور الموكل شخصياً', NULL, 0, TRUE, '{}'::jsonb),
  ('إثبات جواز الموكل والوكيل', NULL, 1, TRUE, '{}'::jsonb),
  ('تحديد الغرض من التوكيل بوضوح', NULL, 2, TRUE, '{}'::jsonb),
  ('شهود (عند الحاجة)', NULL, 3, TRUE, '{}'::jsonb)
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE s.slug = 'general' AND s.parent_id = (SELECT id FROM services WHERE slug = 'power-of-attorney');
