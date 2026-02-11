#!/bin/bash

# Export Complete Database from Supabase
# This script exports schema, data, and functions

echo "🔄 Exporting Supabase Database..."

# Load environment variables
source .env

# Parse connection string
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)?*.*/\1/p' | cut -d'?' -f1)
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\(.*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/.*:\(.*\)@.*/\1/p')

OUTPUT_DIR="./database_export"
mkdir -p $OUTPUT_DIR

echo "📦 Exporting schema..."
PGPASSWORD=$DB_PASS pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --schema-only \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/01_schema.sql"

echo "📊 Exporting data..."
PGPASSWORD=$DB_PASS pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --data-only \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/02_data.sql"

echo "🔧 Exporting functions and triggers..."
PGPASSWORD=$DB_PASS pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --schema=public \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/03_complete.sql"

echo "✅ Export completed!"
echo "📁 Files created in: $OUTPUT_DIR/"
echo ""
echo "To import to PostgreSQL:"
echo "psql -U your_user -d your_database -f $OUTPUT_DIR/03_complete.sql"
