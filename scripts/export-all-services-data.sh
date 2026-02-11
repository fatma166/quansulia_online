#!/bin/bash

# سكريبت استخراج كل بيانات الخدمات من Database
# يستخرج من 10 جداول مرتبطة بالخدمات

set -e

echo "======================================"
echo "📦 استخراج جميع بيانات الخدمات"
echo "======================================"
echo ""

# التاريخ والوقت
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
OUTPUT_DIR="services-backup-${TIMESTAMP}"
mkdir -p "$OUTPUT_DIR"

echo "📁 المجلد: $OUTPUT_DIR"
echo ""

# تحديد اتصال Database
if [ -z "$DATABASE_URL" ]; then
    # إذا كان Docker
    DB_CMD="docker exec -i supabase-db psql -U postgres -d postgres"
    echo "🐳 استخدام Docker container"
else
    # إذا كان connection string
    DB_CMD="psql $DATABASE_URL"
    echo "🔗 استخدام DATABASE_URL"
fi

echo ""
echo "======================================"
echo "1️⃣ استخراج الخدمات الرئيسية (services)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM services
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/1_services.csv"

SERVICE_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM services;")
echo "✅ تم استخراج $SERVICE_COUNT خدمة"
echo ""

echo "======================================"
echo "2️⃣ استخراج أنواع الخدمات (service_types)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM service_types
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/2_service_types.csv"

TYPE_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM service_types;")
echo "✅ تم استخراج $TYPE_COUNT نوع خدمة"
echo ""

echo "======================================"
echo "3️⃣ استخراج الحقول (service_fields)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM service_fields
    ORDER BY service_id, order_index
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/3_service_fields.csv"

FIELDS_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM service_fields;")
echo "✅ تم استخراج $FIELDS_COUNT حقل"
echo ""

echo "======================================"
echo "4️⃣ استخراج الحقول الديناميكية (service_dynamic_list_fields)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM service_dynamic_list_fields
    ORDER BY parent_field_id, order_index
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/4_service_dynamic_list_fields.csv"

DYNAMIC_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM service_dynamic_list_fields;")
echo "✅ تم استخراج $DYNAMIC_COUNT حقل ديناميكي"
echo ""

echo "======================================"
echo "5️⃣ استخراج المستندات (service_documents)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM service_documents
    ORDER BY service_id, order_index
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/5_service_documents.csv"

DOCS_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM service_documents;")
echo "✅ تم استخراج $DOCS_COUNT مستند"
echo ""

echo "======================================"
echo "6️⃣ استخراج المتطلبات (service_requirements)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM service_requirements
    ORDER BY service_id, order_index
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/6_service_requirements.csv"

REQS_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM service_requirements;")
echo "✅ تم استخراج $REQS_COUNT متطلب"
echo ""

echo "======================================"
echo "7️⃣ استخراج قواعد التسعير (service_pricing_rules)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM service_pricing_rules
    ORDER BY service_id, priority DESC
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/7_service_pricing_rules.csv"

PRICING_COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM service_pricing_rules;")
echo "✅ تم استخراج $PRICING_COUNT قاعدة تسعير"
echo ""

echo "======================================"
echo "8️⃣ استخراج الفئات (categories)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM categories
    ORDER BY order_index
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/8_categories.csv" 2>/dev/null || echo "⚠️  جدول categories غير موجود"

echo ""

echo "======================================"
echo "9️⃣ استخراج المناطق (regions)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM regions
    ORDER BY name_ar
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/9_regions.csv" 2>/dev/null || echo "⚠️  جدول regions غير موجود"

echo ""

echo "======================================"
echo "🔟 استخراج حالات الطلبات (statuses)"
echo "======================================"

$DB_CMD -c "COPY (
    SELECT * FROM statuses
    ORDER BY order_index
) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/10_statuses.csv" 2>/dev/null || echo "⚠️  جدول statuses غير موجود"

echo ""

echo "======================================"
echo "💾 إنشاء SQL Dump كامل"
echo "======================================"

# إنشاء SQL dump للجداول فقط (بدون schema)
$DB_CMD <<EOF > "$OUTPUT_DIR/complete_services_dump.sql"
-- ====================================
-- SQL Dump لجميع بيانات الخدمات
-- تاريخ الإنشاء: $TIMESTAMP
-- ====================================

-- تعطيل الـ triggers مؤقتاً
SET session_replication_role = 'replica';

-- 1. services
$(pg_dump -U postgres -d postgres -t services --data-only --column-inserts 2>/dev/null || echo "-- services table not found")

-- 2. service_types
$(pg_dump -U postgres -d postgres -t service_types --data-only --column-inserts 2>/dev/null || echo "-- service_types table not found")

-- 3. service_fields
$(pg_dump -U postgres -d postgres -t service_fields --data-only --column-inserts 2>/dev/null || echo "-- service_fields table not found")

-- 4. service_dynamic_list_fields
$(pg_dump -U postgres -d postgres -t service_dynamic_list_fields --data-only --column-inserts 2>/dev/null || echo "-- service_dynamic_list_fields table not found")

-- 5. service_documents
$(pg_dump -U postgres -d postgres -t service_documents --data-only --column-inserts 2>/dev/null || echo "-- service_documents table not found")

-- 6. service_requirements
$(pg_dump -U postgres -d postgres -t service_requirements --data-only --column-inserts 2>/dev/null || echo "-- service_requirements table not found")

-- 7. service_pricing_rules
$(pg_dump -U postgres -d postgres -t service_pricing_rules --data-only --column-inserts 2>/dev/null || echo "-- service_pricing_rules table not found")

-- إعادة تفعيل الـ triggers
SET session_replication_role = 'origin';
EOF

echo "✅ SQL Dump تم إنشاؤه"
echo ""

echo "======================================"
echo "📊 إنشاء تقرير ملخص"
echo "======================================"

cat > "$OUTPUT_DIR/SUMMARY.txt" <<EOF
====================================
تقرير استخراج بيانات الخدمات
====================================

التاريخ: $TIMESTAMP

====================================
الإحصائيات:
====================================

1. الخدمات الرئيسية:       $SERVICE_COUNT
2. أنواع الخدمات:           $TYPE_COUNT
3. الحقول:                   $FIELDS_COUNT
4. الحقول الديناميكية:       $DYNAMIC_COUNT
5. المستندات:                $DOCS_COUNT
6. المتطلبات:                $REQS_COUNT
7. قواعد التسعير:           $PRICING_COUNT

====================================
الملفات المُنشأة:
====================================

CSV Files:
- 1_services.csv
- 2_service_types.csv
- 3_service_fields.csv
- 4_service_dynamic_list_fields.csv
- 5_service_documents.csv
- 6_service_requirements.csv
- 7_service_pricing_rules.csv
- 8_categories.csv
- 9_regions.csv
- 10_statuses.csv

SQL Dump:
- complete_services_dump.sql

====================================
كيفية الاستعادة:
====================================

1. لاستعادة من CSV:
   استخدم أداة Import في Supabase Studio

2. لاستعادة من SQL:
   psql -U postgres -d postgres -f complete_services_dump.sql

3. لاستعادة باستخدام Docker:
   docker exec -i supabase-db psql -U postgres -d postgres < complete_services_dump.sql

====================================
EOF

cat "$OUTPUT_DIR/SUMMARY.txt"

echo ""
echo "======================================"
echo "✅ تم الانتهاء بنجاح!"
echo "======================================"
echo ""
echo "📁 الملفات في: $OUTPUT_DIR"
echo ""
echo "📊 لعرض الإحصائيات:"
echo "   cat $OUTPUT_DIR/SUMMARY.txt"
echo ""
echo "💾 لاستعادة البيانات:"
echo "   docker exec -i supabase-db psql -U postgres -d postgres < $OUTPUT_DIR/complete_services_dump.sql"
echo ""
