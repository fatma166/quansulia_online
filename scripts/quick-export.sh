#!/bin/bash

# Quick Export Script - نسخة مبسطة وسريعة
# =====================================
# Usage: ./quick-export.sh

set -e

echo "🚀 Starting Quick Database Export..."

# Load .env
if [ -f "backend/.env" ]; then
    source backend/.env
elif [ -f ".env" ]; then
    source .env
else
    echo "❌ .env file not found!"
    exit 1
fi

# Create output directory
mkdir -p database-exports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="database-exports/supabase_dump_${TIMESTAMP}.sql"

# Export
export PGPASSWORD="$DB_PASSWORD"

echo "📦 Exporting database..."
pg_dump -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        --no-comments \
        -f "$OUTPUT_FILE"

# Clean for Supabase
echo "🧹 Cleaning for Supabase..."
sed -i '/^SET /d' "$OUTPUT_FILE"
sed -i '/^SELECT pg_catalog.set_config/d' "$OUTPUT_FILE"
sed -i '/^CREATE SCHEMA/d' "$OUTPUT_FILE"
sed -i '/^ALTER SCHEMA/d' "$OUTPUT_FILE"

# Add session config
sed -i '1i\-- Supabase Import\nSET session_replication_role = '"'"'replica'"'"';\n' "$OUTPUT_FILE"
echo -e "\n-- Done\nSET session_replication_role = 'origin';" >> "$OUTPUT_FILE"

unset PGPASSWORD

echo "✅ Export complete!"
echo "📁 File: $OUTPUT_FILE"
echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "📋 Next steps:"
echo "  1. Download: scp root@62.12.101.237:$(pwd)/$OUTPUT_FILE ."
echo "  2. Open Supabase Dashboard > SQL Editor"
echo "  3. Paste and run the SQL content"
echo ""
echo "✨ Done!"
