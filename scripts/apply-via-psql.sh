#!/bin/bash

# Load environment variables
source .env 2>/dev/null || true

# Database URL from environment or construct it
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

echo "🚀 تطبيق ملف SQL الكامل..."
echo ""

# Apply the SQL file
psql "$DATABASE_URL" -f supabase/migrations/99999999999999_import_all_services_data.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ تم التطبيق بنجاح!"
  echo ""
  echo "📊 التحقق من النتائج..."
  psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_services FROM services WHERE parent_id IS NOT NULL;"
else
  echo ""
  echo "❌ فشل التطبيق"
  exit 1
fi
