#!/bin/bash

# =======================================================
# PostgreSQL Complete Schema Import Script
# استيراد Schema كامل من ملف واحد
# =======================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing arguments${NC}"
    echo "Usage: $0 <database_name> <username>"
    echo "Example: $0 consulate_db consulate_user"
    exit 1
fi

DB_NAME=$1
DB_USER=$2
SCHEMA_FILE="COMPLETE_SCHEMA.sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}PostgreSQL Complete Schema Import${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "User: ${YELLOW}$DB_USER${NC}"
echo -e "Schema File: ${YELLOW}$SCHEMA_FILE${NC}"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}✗ Schema file not found: $SCHEMA_FILE${NC}"
    exit 1
fi

# Check if database exists
echo -e "${YELLOW}Checking database...${NC}"
if ! psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
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
echo -e "${YELLOW}Importing schema...${NC}"

psql -U $DB_USER -d $DB_NAME -f $SCHEMA_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Schema imported successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "Tables created:"
    psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
    echo ""
    echo -e "Next steps:"
    echo -e "  1. Import data: psql -U $DB_USER -d $DB_NAME -f ../database_export/complete_data_export.sql"
    echo -e "  2. View tables: psql -U $DB_USER -d $DB_NAME -c '\\dt'"
else
    echo -e "${RED}✗ Error importing schema${NC}"
    exit 1
fi
