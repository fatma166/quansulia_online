#!/usr/bin/env python3
"""
مولد SQL للخدمات الفرعية
يقرأ ملفات config.js ويحولها إلى SQL
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any

# مسارات الخدمات
POA_SERVICES = {
    'general': '/tmp/cc-agent/55287979/project/src/services/poa/general/config.js',
    'real-estate': '/tmp/cc-agent/55287979/project/src/services/poa/realEstate/config.js',
    'vehicles': '/tmp/cc-agent/55287979/project/src/services/poa/vehicles/config.js',
    'companies': '/tmp/cc-agent/55287979/project/src/services/poa/companies/config.js',
    'inheritance': '/tmp/cc-agent/55287979/project/src/services/poa/inheritance/config.js',
    'courts': '/tmp/cc-agent/55287979/project/src/services/poa/courts/config.js',
    'birth-certificates': '/tmp/cc-agent/55287979/project/src/services/poa/birthCertificates/config.js',
    'educational': '/tmp/cc-agent/55287979/project/src/services/poa/educational/config.js',
    'marriage-divorce': '/tmp/cc-agent/55287979/project/src/services/poa/marriageDivorce/config.js',
}

DECLARATION_SERVICES = {
    'regular': '/tmp/cc-agent/55287979/project/src/services/declarations/regular/config.js',
    'sworn': '/tmp/cc-agent/55287979/project/src/services/declarations/sworn/config.js',
}

def escape_sql_string(s: str) -> str:
    """تهريب النصوص لـ SQL"""
    if s is None:
        return 'NULL'
    return s.replace("'", "''")

def json_to_sql(obj: Any) -> str:
    """تحويل كائن Python إلى JSON لـ SQL"""
    if obj is None:
        return 'NULL'
    return f"'{json.dumps(obj, ensure_ascii=False)}'::jsonb"

def extract_js_value(js_code: str, var_name: str) -> Any:
    """استخراج قيمة من كود JavaScript"""
    # إزالة التعليقات
    js_code = re.sub(r'//.*?$', '', js_code, flags=re.MULTILINE)
    js_code = re.sub(r'/\*.*?\*/', '', js_code, flags=re.DOTALL)

    # محاولة استخراج القيمة
    pattern = rf'{var_name}\s*:\s*(.+?)(?:,\s*\w+\s*:|}})'
    match = re.search(pattern, js_code, re.DOTALL)

    if match:
        value_str = match.group(1).strip()
        # تنظيف القيمة
        value_str = value_str.rstrip(',').strip()

        # محاولة تحويلها لـ Python object
        try:
            # استبدال true/false بـ True/False
            value_str = re.sub(r'\btrue\b', 'True', value_str)
            value_str = re.sub(r'\bfalse\b', 'False', value_str)
            value_str = re.sub(r'\bnull\b', 'None', value_str)
            value_str = re.sub(r'\bundefined\b', 'None', value_str)

            # محاولة eval (خطر لكن للاستخدام الداخلي فقط)
            return eval(value_str)
        except:
            return value_str

    return None

def generate_service_sql(slug: str, config_path: str, parent_slug: str) -> str:
    """توليد SQL لخدمة واحدة"""

    # قراءة ملف config.js
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            js_code = f.read()
    except FileNotFoundError:
        print(f"ملف غير موجود: {config_path}")
        return ""

    # استخراج البيانات الأساسية
    title = extract_js_value(js_code, 'title') or slug
    description = extract_js_value(js_code, 'description') or ''
    icon = extract_js_value(js_code, 'icon') or 'FileText'
    category = extract_js_value(js_code, 'category') or 'legal'
    fees = extract_js_value(js_code, 'fees')
    duration = extract_js_value(js_code, 'duration') or '1-2 يوم عمل'
    requirements = extract_js_value(js_code, 'requirements') or []
    steps = extract_js_value(js_code, 'steps') or []
    process = extract_js_value(js_code, 'process') or []

    sql_parts = []

    # رأس الخدمة
    sql_parts.append(f"""
-- ========================================
-- خدمة: {title}
-- ========================================

-- إدراج الخدمة
INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config, parent_id
  ) VALUES (
    '{escape_sql_string(title)}',
    NULL,
    '{escape_sql_string(slug)}',
    '{escape_sql_string(description)}',
    NULL,
    '{escape_sql_string(icon)}',
    '{escape_sql_string(category)}',
    {json_to_sql(fees)},
    '{escape_sql_string(duration)}'::jsonb,
    TRUE,
    {json_to_sql({'process': process, 'hasSubcategories': False, 'subcategories': []})},
    (SELECT id FROM services WHERE slug = '{escape_sql_string(parent_slug)}')
  )
  ON CONFLICT (slug, parent_id)
  DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar,
    fees = EXCLUDED.fees,
    duration = EXCLUDED.duration,
    config = EXCLUDED.config,
    updated_at = NOW();
""")

    # حذف البيانات القديمة
    sql_parts.append(f"""
-- حذف البيانات القديمة للخدمة
DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = '{escape_sql_string(slug)}' AND parent_id = (SELECT id FROM services WHERE slug = '{escape_sql_string(parent_slug)}');

  IF service_uuid IS NOT NULL THEN
    DELETE FROM service_dynamic_list_fields
    WHERE parent_field_id IN (SELECT id FROM service_fields WHERE service_id = service_uuid);

    DELETE FROM service_requirements WHERE service_id = service_uuid;
    DELETE FROM service_documents WHERE service_id = service_uuid;
    DELETE FROM service_fields WHERE service_id = service_uuid;
  END IF;
END $$;
""")

    # إدراج المتطلبات
    if requirements:
        req_values = []
        for idx, req in enumerate(requirements):
            req_ar = escape_sql_string(req) if isinstance(req, str) else escape_sql_string(req.get('ar', ''))
            req_values.append(f"  ('{req_ar}', NULL, {idx}, TRUE, '{{}}'::jsonb)")

        sql_parts.append(f"""
-- إدراج المتطلبات
INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, is_active, conditions)
SELECT id, * FROM services, (VALUES
{',\\n'.join(req_values)}
) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)
WHERE services.slug = '{escape_sql_string(slug)}' AND services.parent_id = (SELECT id FROM services WHERE slug = '{escape_sql_string(parent_slug)}');
""")

    print(f"✓ تم توليد SQL لخدمة: {title} ({slug})")

    return '\n'.join(sql_parts)

def main():
    """الدالة الرئيسية"""

    output_file = '/tmp/cc-agent/55287979/project/all_services_generated.sql'

    sql_content = ["""/*
  # استيراد جميع بيانات الخدمات الفرعية إلى قاعدة البيانات

  تم توليد هذا الملف تلقائياً من ملفات config.js

  ## التوكيلات (9 خدمات)
  ## الإقرارات (2 خدمة)
*/
"""]

    # توليد SQL للتوكيلات
    print("\n=== توليد SQL للتوكيلات ===")
    for slug, config_path in POA_SERVICES.items():
        sql = generate_service_sql(slug, config_path, 'power-of-attorney')
        sql_content.append(sql)

    # توليد SQL للإقرارات
    print("\n=== توليد SQL للإقرارات ===")
    for slug, config_path in DECLARATION_SERVICES.items():
        sql = generate_service_sql(slug, config_path, 'declarations')
        sql_content.append(sql)

    # كتابة الملف
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_content))

    print(f"\n✅ تم توليد الملف: {output_file}")
    print(f"📊 عدد الخدمات: {len(POA_SERVICES) + len(DECLARATION_SERVICES)}")

if __name__ == '__main__':
    main()
