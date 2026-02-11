#!/bin/bash

# عرض جميع البيانات من جداول الخدمات
# نسخة بسيطة للسيرفر

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          📊 عرض جميع بيانات الخدمات                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# اتصال Database
if command -v docker &> /dev/null && docker ps | grep -q supabase-db; then
    DB_CMD="docker exec -i supabase-db psql -U postgres -d postgres"
    echo "🐳 استخدام Docker"
else
    DB_CMD="psql -U postgres -d postgres"
    echo "🔗 استخدام psql مباشرة"
fi

echo ""

# الجداول
TABLES=(
    "services"
    "service_types"
    "service_fields"
    "service_dynamic_list_fields"
    "service_documents"
    "service_requirements"
    "service_pricing_rules"
)

# لكل جدول
for TABLE in "${TABLES[@]}"; do
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "📋 جدول: $TABLE"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    # عد الصفوف
    COUNT=$($DB_CMD -t -c "SELECT COUNT(*) FROM $TABLE;" 2>/dev/null || echo "0")
    COUNT=$(echo $COUNT | tr -d ' ')

    if [ "$COUNT" = "0" ]; then
        echo "⚠️  الجدول فارغ - لا توجد بيانات"
        echo ""
        continue
    fi

    echo "✅ عدد الصفوف: $COUNT"
    echo ""
    echo "────────────────────────────────────────────────────────────────"
    echo ""

    # عرض البيانات
    $DB_CMD -c "SELECT * FROM $TABLE ORDER BY created_at;" 2>/dev/null || echo "❌ خطأ في قراءة الجدول"

    echo ""
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ انتهى العرض"
echo "════════════════════════════════════════════════════════════════"
echo ""
