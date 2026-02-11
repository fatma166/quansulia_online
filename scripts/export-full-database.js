#!/usr/bin/env node

/**
 * تصدير كامل لقاعدة البيانات من Supabase
 * يقوم بتصدير جميع الجداول والبيانات إلى ملفات SQL
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// الجداول التي سيتم تصدير بياناتها
const DATA_TABLES = [
  // Core tables
  'roles',
  'departments',
  'regions',
  'cities',
  'districts',
  'old_regions',

  // Staff
  'staff',
  'staff_services',
  'staff_regions',

  // Services
  'services',
  'service_types',
  'service_fields',
  'service_documents',
  'service_requirements',
  'service_field_conditions',
  'service_document_conditions',
  'service_dynamic_list_fields',
  'service_pricing_rules',

  // Applications
  'applications',
  'application_notes',
  'application_statuses',
  'status_history',
  'otp_verifications',
  'payments',
  'rejection_details',

  // Application Pricing
  'application_pricing_items',
  'application_pricing_summary',
  'invoices',

  // Appointments & Shipping
  'appointment_settings',
  'appointment_slots',
  'appointments',
  'closed_days',
  'shipping_companies',
  'shipments',

  // Educational Cards
  'educational_cards',

  // CMS
  'site_settings',
  'contact_info',
  'social_links',
  'slider_items',
  'page_sections',
  'footer_content',
  'counters',

  // News & Events
  'breaking_news_ticker',
  'news',
  'events',
  'event_registrations',

  // About Pages
  'about_sudan_page',
  'about_sudan_statistics',
  'about_sudan_sections',
  'about_sudan_section_stats',
  'about_consulate_sections',
  'ambassadors',
  'services_guide_sections',
  'important_links',
  'additional_pages',

  // System
  'system_maintenance',
  'system_announcements',
  'system_settings',

  // Contact
  'contact_messages',

  // Chatbot
  'chatbot_categories',
  'chatbot_questions_answers',
  'chatbot_conversations',

  // Chat
  'chat_conversations',
  'chat_messages',
  'chat_staff',

  // Export
  'export_report_templates'
];

/**
 * تحويل قيمة JavaScript إلى SQL
 */
function toSQLValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'object') {
    // Handle arrays and JSON objects
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }

  if (typeof value === 'string') {
    // Escape single quotes
    return `'${value.replace(/'/g, "''")}'`;
  }

  return `'${value}'`;
}

/**
 * تصدير بيانات جدول إلى SQL INSERT statements
 */
async function exportTableData(tableName) {
  try {
    console.log(`📥 Exporting data from ${tableName}...`);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true, nullsFirst: false })
      .limit(10000);

    if (error) {
      console.error(`   ⚠️  Warning: Could not export ${tableName}:`, error.message);
      return '';
    }

    if (!data || data.length === 0) {
      console.log(`   ℹ️  No data in ${tableName}`);
      return `-- No data in ${tableName}\n\n`;
    }

    console.log(`   ✓ Found ${data.length} rows`);

    let sql = `-- Data for table: ${tableName}\n`;
    sql += `-- Rows: ${data.length}\n\n`;

    // Get column names from first row
    const columns = Object.keys(data[0]);

    // Create INSERT statements in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      sql += `INSERT INTO public.${tableName} (${columns.join(', ')})\nVALUES\n`;

      const values = batch.map(row => {
        const rowValues = columns.map(col => toSQLValue(row[col]));
        return `  (${rowValues.join(', ')})`;
      });

      sql += values.join(',\n');
      sql += '\nON CONFLICT DO NOTHING;\n\n';
    }

    return sql;
  } catch (err) {
    console.error(`   ❌ Error exporting ${tableName}:`, err.message);
    return `-- Error exporting ${tableName}: ${err.message}\n\n`;
  }
}

/**
 * تصدير جميع البيانات
 */
async function exportAllData() {
  console.log('🚀 Starting full database export...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '..', 'database-backup');

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dataFile = path.join(backupDir, `data-backup-${timestamp}.sql`);

  let fullSQL = `-- ============================================================================
-- DATABASE BACKUP - DATA ONLY
-- ============================================================================
-- Generated: ${new Date().toISOString()}
-- Source: ${supabaseUrl}
--
-- This file contains all data from the database.
-- To restore, first apply the schema (from migrations), then run this file.
-- ============================================================================

-- Disable triggers during import for better performance
SET session_replication_role = 'replica';

BEGIN;

`;

  // Export data from all tables
  for (const tableName of DATA_TABLES) {
    const tableSQL = await exportTableData(tableName);
    fullSQL += tableSQL;
  }

  fullSQL += `
COMMIT;

-- Re-enable triggers
SET session_replication_role = 'default';

-- Update sequences
DO $$
DECLARE
  seq_record RECORD;
  max_id BIGINT;
BEGIN
  FOR seq_record IN
    SELECT schemaname, sequencename, tablename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('SELECT COALESCE(MAX(id), 1) FROM %I.%I',
                   seq_record.schemaname, seq_record.tablename)
    INTO max_id;

    EXECUTE format('SELECT setval(%L, %s)',
                   seq_record.schemaname || '.' || seq_record.sequencename,
                   max_id);
  END LOOP;
END $$;

-- Verification query
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================================================
-- BACKUP COMPLETE
-- ============================================================================
`;

  // Write to file
  fs.writeFileSync(dataFile, fullSQL, 'utf8');

  console.log('\n✅ Export completed successfully!');
  console.log(`📁 Data backup saved to: ${dataFile}`);
  console.log(`📊 File size: ${(fs.statSync(dataFile).size / 1024 / 1024).toFixed(2)} MB`);

  return dataFile;
}

/**
 * إنشاء سكريبت الاستعادة
 */
function createRestoreScript(backupDir) {
  const restoreScript = `#!/bin/bash

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
DB_HOST=\${DB_HOST:-localhost}
DB_PORT=\${DB_PORT:-5432}
DB_NAME=\${DB_NAME:-consulate}
DB_USER=\${DB_USER:-postgres}

echo "📊 Database: \${DB_NAME}"
echo "🖥️  Host: \${DB_HOST}:\${DB_PORT}"
echo "👤 User: \${DB_USER}"
echo ""

# Get the latest backup file
SCHEMA_FILE="../../postgresql_schema/COMPLETE_SCHEMA.sql"
DATA_FILE=\$(ls -t data-backup-*.sql 2>/dev/null | head -1)

if [ ! -f "\$SCHEMA_FILE" ]; then
  echo "❌ Error: Schema file not found: \$SCHEMA_FILE"
  exit 1
fi

if [ ! -f "\$DATA_FILE" ]; then
  echo "❌ Error: No data backup file found"
  exit 1
fi

echo "📄 Schema: \$SCHEMA_FILE"
echo "📄 Data: \$DATA_FILE"
echo ""

read -p "⚠️  This will replace all data in \${DB_NAME}. Continue? (yes/no): " confirm
if [ "\$confirm" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 1
fi

echo ""
echo "🔨 Step 1/2: Applying schema..."
PGPASSWORD=\${DB_PASSWORD} psql -h \${DB_HOST} -p \${DB_PORT} -U \${DB_USER} -d \${DB_NAME} -f "\$SCHEMA_FILE"

echo ""
echo "📥 Step 2/2: Importing data..."
PGPASSWORD=\${DB_PASSWORD} psql -h \${DB_HOST} -p \${DB_PORT} -U \${DB_USER} -d \${DB_NAME} -f "\$DATA_FILE"

echo ""
echo "✅ Database restore completed successfully!"
echo "🎉 Your database is now ready to use"
`;

  const restoreScriptPath = path.join(backupDir, 'restore-database.sh');
  fs.writeFileSync(restoreScriptPath, restoreScript, 'utf8');
  fs.chmodSync(restoreScriptPath, '755');

  console.log(`📝 Restore script created: ${restoreScriptPath}`);
}

/**
 * إنشاء ملف README للتعليمات
 */
function createReadme(backupDir) {
  const readme = `# Database Backup - دليل الاستعادة

## 📦 محتويات النسخة الاحتياطية

هذا المجلد يحتوي على نسخة احتياطية كاملة من قاعدة البيانات:

1. **Schema** (البنية): موجود في \`postgresql_schema/COMPLETE_SCHEMA.sql\`
2. **Data** (البيانات): ملف \`data-backup-*.sql\` في هذا المجلد
3. **Restore Script** (سكريبت الاستعادة): \`restore-database.sh\`

## 🚀 كيفية الاستعادة على السيرفر

### الطريقة الأولى: باستخدام السكريبت التلقائي (موصى به)

\`\`\`bash
# 1. انتقل إلى مجلد البكاب
cd database-backup

# 2. تأكد من وجود ملف .env في المجلد الرئيسي يحتوي على:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=consulate
# DB_USER=postgres
# DB_PASSWORD=your_password

# 3. شغل سكريبت الاستعادة
./restore-database.sh
\`\`\`

### الطريقة الثانية: يدوياً

\`\`\`bash
# 1. استعادة البنية (Schema)
psql -h localhost -U postgres -d consulate -f ../postgresql_schema/COMPLETE_SCHEMA.sql

# 2. استعادة البيانات (Data)
psql -h localhost -U postgres -d consulate -f data-backup-*.sql
\`\`\`

## 📋 المتطلبات

- PostgreSQL 14 أو أحدث
- psql (PostgreSQL client)
- قاعدة بيانات فارغة جاهزة

## ⚠️ ملاحظات مهمة

1. **النسخة الاحتياطية تحتوي على**:
   - جميع الجداول والبيانات
   - جميع الصلاحيات والسياسات (RLS)
   - جميع الـ Functions والـ Triggers
   - جميع الـ Indexes

2. **لا تحتوي على**:
   - الملفات المرفوعة (Storage)
   - إعدادات Supabase Auth
   - Edge Functions

3. **للحصول على نسخة احتياطية جديدة**:
   \`\`\`bash
   npm run backup-db
   # أو
   node scripts/export-full-database.js
   \`\`\`

## 🔐 الأمان

- احتفظ بالنسخة الاحتياطية في مكان آمن
- لا تشارك ملفات البكاب علناً (تحتوي على بيانات حساسة)
- استخدم كلمات مرور قوية لقاعدة البيانات

## 📞 الدعم

إذا واجهت أي مشاكل في الاستعادة:
1. تحقق من اتصال قاعدة البيانات
2. تحقق من صلاحيات المستخدم
3. راجع سجلات الأخطاء (error logs)

---

تم إنشاء النسخة الاحتياطية في: ${new Date().toISOString()}
`;

  const readmePath = path.join(backupDir, 'README.md');
  fs.writeFileSync(readmePath, readme, 'utf8');

  console.log(`📖 README created: ${readmePath}`);
}

// Run export
(async () => {
  try {
    const backupDir = path.join(__dirname, '..', 'database-backup');

    // Export data
    await exportAllData();

    // Create helper scripts
    createRestoreScript(backupDir);
    createReadme(backupDir);

    console.log('\n' + '='.repeat(80));
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('\n📁 Backup location:', backupDir);
    console.log('\n📚 Next steps:');
    console.log('   1. Copy the "database-backup" folder to your VPS');
    console.log('   2. Copy the "postgresql_schema" folder to your VPS');
    console.log('   3. Run: cd database-backup && ./restore-database.sh');
    console.log('\n💡 For detailed instructions, see: database-backup/README.md\n');
  } catch (error) {
    console.error('\n❌ Error during export:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
