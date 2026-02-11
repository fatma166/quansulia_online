#!/bin/bash

# =======================================================
# PostgreSQL Schema Import Script
# =======================================================
#
# هذا السكريبت يطبق Database Schema كامل على PostgreSQL
#
# الاستخدام:
#   ./apply_schema.sh <database_name> <username>
#
# مثال:
#   ./apply_schema.sh consulate_db consulate_user
#
# =======================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing arguments${NC}"
    echo "Usage: $0 <database_name> <username>"
    echo "Example: $0 consulate_db consulate_user"
    exit 1
fi

DB_NAME=$1
DB_USER=$2
SCHEMA_DIR="migrations_organized"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}PostgreSQL Schema Import${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "User: ${YELLOW}$DB_USER${NC}"
echo ""

# Check if database exists
echo -e "${YELLOW}Checking database...${NC}"
if ! psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${RED}Database $DB_NAME does not exist!${NC}"
    echo -e "${YELLOW}Creating database...${NC}"
    createdb -U $DB_USER $DB_NAME
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created${NC}"
    else
        echo -e "${RED}✗ Failed to create database${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi

echo ""
echo -e "${YELLOW}Applying schema...${NC}"
echo ""

# Apply migrations in order
for file in $SCHEMA_DIR/*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo -e "${YELLOW}Applying: $filename${NC}"

        psql -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ $filename applied successfully${NC}"
        else
            echo -e "${RED}✗ Error applying $filename${NC}"
            echo -e "${YELLOW}Continuing...${NC}"
        fi
        echo ""
    fi
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Schema Import Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Import data: psql -U $DB_USER -d $DB_NAME -f data_export.sql"
echo -e "  2. Verify: psql -U $DB_USER -d $DB_NAME -c '\\dt'"
echo ""
