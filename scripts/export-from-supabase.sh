#!/bin/bash

# =============================================================================
# Export from Supabase Cloud to Self-Hosted Supabase
# تصدير من Supabase السحابي إلى Self-Hosted Supabase
# =============================================================================
# This script exports your data from Supabase Cloud for self-hosted import
#
# Usage:
#   ./export-from-supabase.sh
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  Export from Supabase Cloud${NC}"
echo -e "${BLUE}  تصدير من Supabase السحابي${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Check for .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Loading from .env${NC}"
    export $(grep -v '^#' .env | grep 'VITE_SUPABASE_URL\|SUPABASE_DB_PASSWORD' | xargs)
fi

# Get Supabase details
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${YELLOW}أدخل معلومات Supabase:${NC}"
    echo ""
    read -p "Supabase URL (e.g., https://xxx.supabase.co): " VITE_SUPABASE_URL
fi

# Extract project ref
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo ""
    echo -e "${YELLOW}احصل على كلمة المرور من:${NC}"
    echo "Supabase Dashboard > Project Settings > Database > Database Password"
    echo ""
    read -sp "Database Password: " SUPABASE_DB_PASSWORD
    echo ""
fi

# Validate
if [ -z "$PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${RED}✗ معلومات ناقصة!${NC}"
    exit 1
fi

# Build connection
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo ""
echo -e "${BLUE}معلومات الاتصال:${NC}"
echo -e "  Host: ${GREEN}$DB_HOST${NC}"
echo -e "  Database: ${GREEN}$DB_NAME${NC}"
echo ""

# Check pg_dump
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}✗ pg_dump غير مثبت!${NC}"
    echo ""
    echo "ثبّت PostgreSQL client:"
    echo "Ubuntu/Debian: sudo apt install postgresql-client"
    echo "Mac: brew install postgresql"
    echo "Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

# Create output directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_DIR="supabase-exports"
mkdir -p "$OUTPUT_DIR"

# File names
DUMP_FILE="$OUTPUT_DIR/supabase_cloud.dump"
SQL_FILE="$OUTPUT_DIR/supabase_cloud.sql"
IMPORT_SCRIPT="$OUTPUT_DIR/import_to_selfhosted.sh"

export PGPASSWORD="$SUPABASE_DB_PASSWORD"

# =============================================================================
# Export as custom format (.dump) - Recommended
# =============================================================================
echo -e "${YELLOW}[1/3] Exporting as .dump (recommended)...${NC}"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --no-owner \
        --no-privileges \
        --schema=public \
        --exclude-schema=auth \
        --exclude-schema=storage \
        --exclude-schema=realtime \
        -f "$DUMP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ .dump file created${NC}"
else
    echo -e "${RED}✗ .dump export failed!${NC}"
fi

# =============================================================================
# Export as SQL (.sql) - Alternative
# =============================================================================
echo -e "${YELLOW}[2/3] Exporting as .sql (alternative)...${NC}"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --schema=public \
        --exclude-schema=auth \
        --exclude-schema=storage \
        --exclude-schema=realtime \
        --clean \
        --if-exists \
        -f "$SQL_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ .sql file created${NC}"

    # Clean SQL
    sed -i.bak '/^SET /d' "$SQL_FILE"
    sed -i.bak '/^SELECT pg_catalog.set_config/d' "$SQL_FILE"
    rm -f "$SQL_FILE.bak"
else
    echo -e "${RED}✗ .sql export failed!${NC}"
fi

# =============================================================================
# Create import script for self-hosted Supabase
# =============================================================================
echo -e "${YELLOW}[3/3] Creating import script...${NC}"

cat > "$IMPORT_SCRIPT" << 'IMPORT_EOF'
#!/bin/bash

# Import to Self-Hosted Supabase on VPS
# الاستيراد إلى Self-Hosted Supabase على VPS
# ==========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  Import to Self-Hosted Supabase${NC}"
echo -e "${BLUE}  الاستيراد إلى Self-Hosted Supabase${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Check for docker-compose
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ docker-compose.yml not found!${NC}"
    echo -e "${YELLOW}تأكد أنك في مجلد Supabase${NC}"
    exit 1
fi

# Start Supabase if not running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠ Starting Supabase containers...${NC}"
    docker-compose up -d
    echo "Waiting for database to be ready..."
    sleep 15
fi

# Find dump file
if [ -f "supabase_cloud.dump" ]; then
    DUMP_FILE="supabase_cloud.dump"
    FILE_TYPE="dump"
elif [ -f "supabase_cloud.sql" ]; then
    DUMP_FILE="supabase_cloud.sql"
    FILE_TYPE="sql"
else
    echo -e "${RED}✗ No dump file found!${NC}"
    echo -e "${YELLOW}Expected: supabase_cloud.dump or supabase_cloud.sql${NC}"
    exit 1
fi

# Get database container
DB_CONTAINER=$(docker-compose ps -q db)
if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}✗ Database container not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database container: $DB_CONTAINER${NC}"
echo -e "${BLUE}✓ Import file: $DUMP_FILE ($FILE_TYPE format)${NC}"
echo ""
echo -e "${YELLOW}Starting import...${NC}"
echo -e "${BLUE}This may take several minutes depending on data size${NC}"
echo ""

# Copy file to container
docker cp "$DUMP_FILE" "$DB_CONTAINER:/tmp/restore.$FILE_TYPE"

# Import based on type
if [ "$FILE_TYPE" = "dump" ]; then
    echo -e "${BLUE}Using pg_restore (custom format)...${NC}"
    docker exec "$DB_CONTAINER" pg_restore \
        -U postgres \
        -d postgres \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        /tmp/restore.dump
else
    echo -e "${BLUE}Using psql (SQL format)...${NC}"
    docker exec "$DB_CONTAINER" psql \
        -U postgres \
        -d postgres \
        -f /tmp/restore.sql
fi

# Check result
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Import completed successfully!${NC}"
    echo ""

    # Cleanup
    docker exec "$DB_CONTAINER" rm "/tmp/restore.$FILE_TYPE"

    # Show stats
    echo -e "${BLUE}Database Statistics:${NC}"
    docker exec "$DB_CONTAINER" psql -U postgres -d postgres -c "
        SELECT
            schemaname,
            COUNT(*) as table_count
        FROM pg_tables
        WHERE schemaname = 'public'
        GROUP BY schemaname;
    "

    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "  1. Verify data: docker-compose exec db psql -U postgres"
    echo "  2. Update .env with self-hosted Supabase URL"
    echo "  3. Test your application"
    echo ""
    echo -e "${GREEN}Done! 🚀${NC}"
else
    echo ""
    echo -e "${RED}✗ Import failed!${NC}"
    echo -e "${YELLOW}Check error messages above${NC}"

    # Cleanup anyway
    docker exec "$DB_CONTAINER" rm "/tmp/restore.$FILE_TYPE" 2>/dev/null || true
    exit 1
fi
IMPORT_EOF

chmod +x "$IMPORT_SCRIPT"
echo -e "${GREEN}✓ Import script created${NC}"

# =============================================================================
# Summary
# =============================================================================
unset PGPASSWORD

echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✓ Export completed!${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""
echo -e "${BLUE}Generated Files:${NC}"
[ -f "$DUMP_FILE" ] && echo -e "  1. ${GREEN}$DUMP_FILE${NC} ⭐ (Recommended)"
[ -f "$SQL_FILE" ] && echo -e "  2. ${GREEN}$SQL_FILE${NC} (Alternative)"
echo -e "  3. ${GREEN}$IMPORT_SCRIPT${NC} (Import script)"
echo ""

if [ -f "$DUMP_FILE" ]; then
    echo -e "${YELLOW}File Sizes:${NC}"
    du -h "$DUMP_FILE" "$SQL_FILE" 2>/dev/null | awk '{print "  " $2 ": " $1}'
    echo ""
fi

echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Upload to VPS:${NC}"
echo -e "   scp $DUMP_FILE root@YOUR_VPS_IP:/path/to/supabase/"
echo -e "   scp $IMPORT_SCRIPT root@YOUR_VPS_IP:/path/to/supabase/"
echo ""
echo -e "${YELLOW}2. On VPS, run:${NC}"
echo -e "   cd /path/to/supabase"
echo -e "   chmod +x import_to_selfhosted.sh"
echo -e "   ./import_to_selfhosted.sh"
echo ""
echo -e "${GREEN}Happy self-hosting! 🚀${NC}"
echo ""
