#!/bin/bash

# Export Supabase Schema and Data
# Usage: ./export-database-schema.sh

echo "Exporting database schema and data..."

# Export schema (DDL)
pg_dump "$DATABASE_URL" \
  --schema-only \
  --no-owner \
  --no-privileges \
  -f database_schema.sql

echo "Schema exported to: database_schema.sql"

# Export data (without schema)
pg_dump "$DATABASE_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  -f database_data.sql

echo "Data exported to: database_data.sql"

# Export complete backup (schema + data)
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-privileges \
  -f database_complete.sql

echo "Complete backup exported to: database_complete.sql"

echo "Export completed successfully!"
