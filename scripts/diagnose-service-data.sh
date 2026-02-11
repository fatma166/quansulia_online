#!/bin/bash

# سكريبت تشخيص مشكلة عدم ظهور بيانات الخدمة
# نفذ هذا السكريبت على سيرفر العميل

echo "======================================"
echo "🔍 تشخيص مشكلة عدم ظهور بيانات الخدمة"
echo "======================================"
echo ""

# 1. تحقق من Supabase يعمل
echo "1️⃣ التحقق من Supabase..."
if docker ps | grep -q supabase-db; then
    echo "   ✅ Supabase Database يعمل"
else
    echo "   ❌ Supabase Database لا يعمل!"
    echo "   الحل: docker-compose up -d"
    exit 1
fi

if docker ps | grep -q kong; then
    echo "   ✅ Kong API Gateway يعمل"
else
    echo "   ❌ Kong API Gateway لا يعمل!"
    echo "   الحل: docker-compose up -d"
    exit 1
fi

echo ""

# 2. تحقق من RLS Policies
echo "2️⃣ التحقق من RLS Policies..."
POLICIES=$(docker exec supabase-db psql -U postgres -d postgres -t -c "
SELECT COUNT(*) FROM pg_policies
WHERE tablename IN ('services', 'service_fields', 'service_documents', 'service_requirements')
AND cmd = 'SELECT'
AND (roles::text LIKE '%anon%' OR roles::text LIKE '%authenticated%');
")

if [ "$POLICIES" -ge 4 ]; then
    echo "   ✅ RLS Policies موجودة ($POLICIES policies)"
else
    echo "   ⚠️  RLS Policies ناقصة أو غير موجودة ($POLICIES policies)"
    echo "   الحل: نفذ FIX_RLS_POLICIES.sql"
fi

echo ""

# 3. تحقق من البيانات
echo "3️⃣ التحقق من البيانات في Database..."

SERVICES=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM services WHERE is_active = true;")
echo "   الخدمات: $SERVICES"

FIELDS=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM service_fields WHERE is_active = true;")
echo "   الحقول: $FIELDS"

DOCUMENTS=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM service_documents WHERE is_active = true;")
echo "   المستندات: $DOCUMENTS"

REQUIREMENTS=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM service_requirements WHERE is_active = true;")
echo "   المتطلبات: $REQUIREMENTS"

if [ "$SERVICES" -eq 0 ]; then
    echo "   ❌ لا توجد خدمات في Database!"
    echo "   الحل: استورد البيانات من supabase/migrations/"
    exit 1
fi

if [ "$FIELDS" -eq 0 ] && [ "$DOCUMENTS" -eq 0 ]; then
    echo "   ⚠️  لا توجد fields أو documents!"
    echo "   الحل: استورد البيانات الكاملة"
fi

echo ""

# 4. تحقق من خدمة معينة (مثلاً civilRegistry)
echo "4️⃣ التحقق من خدمة السجل المدني (civilRegistry)..."

SERVICE_ID=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT id FROM services WHERE slug = 'civilRegistry' AND is_active = true;")

if [ -z "$SERVICE_ID" ]; then
    echo "   ❌ خدمة civilRegistry غير موجودة!"
else
    echo "   ✅ Service ID: $SERVICE_ID"

    SERVICE_FIELDS=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM service_fields WHERE service_id = '$SERVICE_ID' AND is_active = true;")
    SERVICE_DOCS=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM service_documents WHERE service_id = '$SERVICE_ID' AND is_active = true;")
    SERVICE_REQS=$(docker exec supabase-db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM service_requirements WHERE service_id = '$SERVICE_ID' AND is_active = true;")

    echo "   Fields: $SERVICE_FIELDS"
    echo "   Documents: $SERVICE_DOCS"
    echo "   Requirements: $SERVICE_REQS"

    if [ "$SERVICE_FIELDS" -eq 0 ] && [ "$SERVICE_DOCS" -eq 0 ]; then
        echo "   ⚠️  هذه الخدمة ليس لها fields أو documents!"
    fi
fi

echo ""

# 5. تحقق من الاتصال من الخارج
echo "5️⃣ التحقق من الاتصال من الخارج..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/rest/v1/ | grep -q 200; then
    echo "   ✅ API يعمل على port 8000"
else
    echo "   ❌ API لا يستجيب على port 8000"
fi

echo ""

# 6. نصائح الحلول
echo "======================================"
echo "💡 الحلول الموصى بها:"
echo "======================================"
echo ""

if [ "$POLICIES" -lt 4 ]; then
    echo "🔧 1. إصلاح RLS Policies:"
    echo "   docker exec -i supabase-db psql -U postgres -d postgres < /path/to/FIX_RLS_POLICIES.sql"
    echo ""
fi

if [ "$FIELDS" -eq 0 ] || [ "$DOCUMENTS" -eq 0 ]; then
    echo "📦 2. استيراد البيانات:"
    echo "   docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/99999999999999_import_all_services_data.sql"
    echo ""
fi

echo "🔄 3. إعادة بناء Frontend:"
echo "   cd /path/to/project"
echo "   npm run build"
echo "   pm2 restart all"
echo ""

echo "======================================"
echo "✅ التشخيص اكتمل!"
echo "======================================"
