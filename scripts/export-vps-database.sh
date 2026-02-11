#!/bin/bash

# =============================================================================
# Export VPS Database to Supabase-Compatible Format
# =============================================================================
# This script creates a complete database dump that can be imported into Supabase
#
# Usage:
#   1. Upload this script to your VPS
#   2. Make it executable: chmod +x export-vps-database.sh
#   3. Run it: ./export-vps-database.sh
#   4. Download the generated SQL file
#   5. Import to Supabase using the instructions below
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  VPS Database Export to Supabase${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Load environment variables from backend/.env if exists
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Loading environment variables from backend/.env${NC}"
    export $(grep -v '^#' backend/.env | xargs)
elif [ -f ".env" ]; then
    echo -e "${GREEN}✓ Loading environment variables from .env${NC}"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}✗ No .env file found!${NC}"
    echo -e "${YELLOW}Please provide database credentials:${NC}"
    read -p "Database Host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    read -p "Database Port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "Database Name: " DB_NAME
    read -p "Database User: " DB_USER
    read -sp "Database Password: " DB_PASSWORD
    echo ""
fi

# Set defaults if not provided
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Validate required variables
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}✗ Missing required database credentials!${NC}"
    exit 1
fi

# Create output directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_DIR="database-exports"
mkdir -p "$OUTPUT_DIR"

# Output files
SCHEMA_FILE="$OUTPUT_DIR/schema_${TIMESTAMP}.sql"
DATA_FILE="$OUTPUT_DIR/data_${TIMESTAMP}.sql"
COMPLETE_FILE="$OUTPUT_DIR/complete_dump_${TIMESTAMP}.sql"
CLEAN_FILE="$OUTPUT_DIR/supabase_ready_${TIMESTAMP}.sql"

echo ""
echo -e "${BLUE}Database Information:${NC}"
echo -e "  Host: ${GREEN}$DB_HOST${NC}"
echo -e "  Port: ${GREEN}$DB_PORT${NC}"
echo -e "  Database: ${GREEN}$DB_NAME${NC}"
echo -e "  User: ${GREEN}$DB_USER${NC}"
echo ""

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# =============================================================================
# Step 1: Export Schema Only
# =============================================================================
echo -e "${YELLOW}[1/5] Exporting database schema...${NC}"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        -f "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema exported successfully${NC}"
else
    echo -e "${RED}✗ Schema export failed!${NC}"
    exit 1
fi

# =============================================================================
# Step 2: Export Data Only
# =============================================================================
echo -e "${YELLOW}[2/5] Exporting database data...${NC}"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --data-only \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        --column-inserts \
        --disable-triggers \
        -f "$DATA_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data exported successfully${NC}"
else
    echo -e "${RED}✗ Data export failed!${NC}"
    exit 1
fi

# =============================================================================
# Step 3: Create Complete Dump
# =============================================================================
echo -e "${YELLOW}[3/5] Creating complete dump...${NC}"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        -f "$COMPLETE_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Complete dump created successfully${NC}"
else
    echo -e "${RED}✗ Complete dump failed!${NC}"
    exit 1
fi

# =============================================================================
# Step 4: Clean dump for Supabase compatibility
# =============================================================================
echo -e "${YELLOW}[4/5] Cleaning dump for Supabase...${NC}"

# Start with the complete dump
cp "$COMPLETE_FILE" "$CLEAN_FILE"

# Remove problematic statements for Supabase
sed -i '/^CREATE SCHEMA/d' "$CLEAN_FILE"
sed -i '/^ALTER SCHEMA/d' "$CLEAN_FILE"
sed -i '/^DROP SCHEMA/d' "$CLEAN_FILE"
sed -i '/^CREATE EXTENSION IF NOT EXISTS plpgsql/d' "$CLEAN_FILE"
sed -i '/^COMMENT ON EXTENSION/d' "$CLEAN_FILE"
sed -i '/^SET /d' "$CLEAN_FILE"
sed -i '/^SELECT pg_catalog.set_config/d' "$CLEAN_FILE"

# Add header
cat > "$CLEAN_FILE.tmp" << 'EOF'
-- =============================================================================
-- Supabase-Ready Database Dump
-- =============================================================================
-- Generated for import into Supabase
--
-- Instructions:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Copy and paste this file content
-- 4. Run the query
--
-- Note: This may take several minutes depending on data size
-- =============================================================================

-- Disable triggers temporarily for faster import
SET session_replication_role = 'replica';

EOF

cat "$CLEAN_FILE" >> "$CLEAN_FILE.tmp"

# Add footer
cat >> "$CLEAN_FILE.tmp" << 'EOF'

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Refresh sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'SELECT setval(pg_get_serial_sequence(''' || r.schemaname || '.' || r.tablename || ''', ''id''), COALESCE(MAX(id), 1)) FROM ' || r.schemaname || '.' || r.tablename || ';';
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore tables without id sequence
    END LOOP;
END $$;

-- =============================================================================
-- Import Complete!
-- =============================================================================
EOF

mv "$CLEAN_FILE.tmp" "$CLEAN_FILE"

echo -e "${GREEN}✓ Dump cleaned for Supabase${NC}"

# =============================================================================
# Step 5: Create Import Instructions
# =============================================================================
echo -e "${YELLOW}[5/5] Creating import instructions...${NC}"

INSTRUCTIONS_FILE="$OUTPUT_DIR/IMPORT_INSTRUCTIONS_${TIMESTAMP}.md"

cat > "$INSTRUCTIONS_FILE" << EOF
# استيراد قاعدة البيانات إلى Supabase

## 📋 الملفات المصدرة

تم تصدير قاعدة البيانات إلى الملفات التالية:

1. **$SCHEMA_FILE** - Schema فقط (هيكل الجداول)
2. **$DATA_FILE** - Data فقط (البيانات)
3. **$COMPLETE_FILE** - Dump كامل (schema + data)
4. **$CLEAN_FILE** - ✨ جاهز للاستيراد في Supabase (موصى به)

---

## 🚀 طريقة الاستيراد إلى Supabase

### الطريقة الأولى: استخدام SQL Editor (موصى بها)

1. **افتح Supabase Dashboard**
   - اذهب إلى: https://supabase.com/dashboard
   - اختر مشروعك

2. **افتح SQL Editor**
   - من القائمة الجانبية، اختر "SQL Editor"
   - انقر على "New query"

3. **استورد الملف**
   - افتح الملف: \`$CLEAN_FILE\`
   - انسخ المحتوى بالكامل
   - الصقه في SQL Editor
   - انقر على "Run" أو اضغط Ctrl+Enter

4. **انتظر**
   - قد يستغرق الأمر بضع دقائق حسب حجم البيانات
   - لا تغلق النافذة حتى ينتهي التنفيذ

5. **تحقق من النتيجة**
   - اذهب إلى "Table Editor" للتأكد من استيراد الجداول
   - تحقق من البيانات

---

### الطريقة الثانية: استخدام psql (للملفات الكبيرة)

إذا كان الملف كبيراً جداً للـ SQL Editor:

\`\`\`bash
# احصل على connection string من Supabase
# Project Settings > Database > Connection string > URI

# استورد الملف
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" < $CLEAN_FILE
\`\`\`

---

### الطريقة الثالثة: تقسيم الملف (للملفات الضخمة)

إذا كان الملف ضخماً جداً:

\`\`\`bash
# قسم الملف إلى أجزاء أصغر
split -l 1000 $CLEAN_FILE part_

# استورد كل جزء على حدة في Supabase SQL Editor
\`\`\`

---

## ⚠️ ملاحظات مهمة

1. **النسخ الاحتياطي**
   - تأكد من عمل backup لـ Supabase الحالي قبل الاستيراد
   - يمكنك تحميل dump من Supabase قبل البدء

2. **RLS Policies**
   - الـ policies سيتم استيرادها تلقائياً
   - تحقق منها بعد الاستيراد في: Authentication > Policies

3. **الأذونات**
   - الملف منظف من أذونات المستخدمين
   - Supabase سيستخدم أذوناته الافتراضية

4. **الـ Extensions**
   - تأكد من أن جميع الـ extensions مفعلة في Supabase
   - اذهب إلى: Database > Extensions

---

## 🔍 التحقق من الاستيراد

بعد الاستيراد، تحقق من:

\`\`\`sql
-- عدد الجداول
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- عدد الصفوف في جدول معين
SELECT COUNT(*) FROM applications;

-- التحقق من الـ sequences
SELECT * FROM pg_sequences WHERE schemaname = 'public';
\`\`\`

---

## 📊 معلومات التصدير

- **التاريخ**: $TIMESTAMP
- **قاعدة البيانات**: $DB_NAME
- **الخادم**: $DB_HOST:$DB_PORT

---

## 🆘 استكشاف الأخطاء

### خطأ: "permission denied"
- تأكد من أنك تستخدم SQL Editor في Supabase Dashboard
- أو استخدم connection string مع صلاحيات postgres

### خطأ: "duplicate key value"
- قد تكون البيانات موجودة مسبقاً
- احذف الجداول القديمة أولاً أو استخدم قاعدة بيانات جديدة

### خطأ: "out of memory"
- قسم الملف إلى أجزاء أصغر
- أو استخدم psql من الـ command line

---

## 📞 المساعدة

إذا واجهت أي مشاكل:
1. تحقق من logs في Supabase Dashboard
2. جرب استيراد schema أولاً، ثم data
3. تواصل مع دعم Supabase إذا لزم الأمر

---

✨ **تم بنجاح!** الآن لديك نسخة كاملة من قاعدة البيانات جاهزة للاستيراد في Supabase.
EOF

echo -e "${GREEN}✓ Import instructions created${NC}"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✓ Export completed successfully!${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""
echo -e "${BLUE}Generated Files:${NC}"
echo -e "  1. Schema Only: ${GREEN}$SCHEMA_FILE${NC}"
echo -e "  2. Data Only: ${GREEN}$DATA_FILE${NC}"
echo -e "  3. Complete Dump: ${GREEN}$COMPLETE_FILE${NC}"
echo -e "  4. Supabase Ready: ${GREEN}$CLEAN_FILE${NC} ⭐"
echo -e "  5. Instructions: ${GREEN}$INSTRUCTIONS_FILE${NC}"
echo ""
echo -e "${YELLOW}File Sizes:${NC}"
du -h "$SCHEMA_FILE" "$DATA_FILE" "$COMPLETE_FILE" "$CLEAN_FILE" | awk '{print "  " $2 ": " $1}'
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Download the file: ${GREEN}$CLEAN_FILE${NC}"
echo -e "  2. Read instructions: ${GREEN}$INSTRUCTIONS_FILE${NC}"
echo -e "  3. Import to Supabase using SQL Editor"
echo ""
echo -e "${GREEN}Happy migrating! 🚀${NC}"
echo ""

# Cleanup
unset PGPASSWORD
