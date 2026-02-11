#!/bin/bash

# ============================================================================
# Database Restore Script
# ============================================================================
# This script restores the database backup to a PostgreSQL server
#
# Usage:
#   1. Make executable: chmod +x restore-database.sh
#   2. Run: ./restore-database.sh
#
# Prerequisites:
#   - PostgreSQL client (psql) installed
#   - Database connection details in .env file
# ============================================================================

set -e

echo "🔄 Starting database restore..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "❌ Error: .env file not found"
  exit 1
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-consulate}
DB_USER=${DB_USER:-postgres}

echo "📊 Database: ${DB_NAME}"
echo "🖥️  Host: ${DB_HOST}:${DB_PORT}"
echo "👤 User: ${DB_USER}"
echo ""

# Get the latest backup file
SCHEMA_FILE="../../postgresql_schema/COMPLETE_SCHEMA.sql"
DATA_FILE=$(ls -t data-backup-*.sql 2>/dev/null | head -1)

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Error: Schema file not found: $SCHEMA_FILE"
  exit 1
fi

if [ ! -f "$DATA_FILE" ]; then
  echo "❌ Error: No data backup file found"
  exit 1
fi

echo "📄 Schema: $SCHEMA_FILE"
echo "📄 Data: $DATA_FILE"
echo ""

read -p "⚠️  This will replace all data in ${DB_NAME}. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 1
fi

echo ""
echo "🔨 Step 1/2: Applying schema..."
PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "$SCHEMA_FILE"

echo ""
echo "📥 Step 2/2: Importing data..."
PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "$DATA_FILE"

echo ""
echo "✅ Database restore completed successfully!"
echo "🎉 Your database is now ready to use"
