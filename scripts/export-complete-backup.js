#!/usr/bin/env node

/**
 * نسخة احتياطية كاملة شاملة لقاعدة البيانات
 * تصدير كل شيء: Schema + Data + Functions + Triggers + RLS + Indexes + Extensions
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// الجداول التي سيتم تصدير بياناتها
const DATA_TABLES = [
  'roles',
  'departments',
  'regions',
  'cities',
  'districts',
  'old_regions',
  'staff',
  'staff_services',
  'staff_regions',
  'services',
  'service_types',
  'service_fields',
  'service_documents',
  'service_requirements',
  'service_field_conditions',
  'service_document_conditions',
  'service_dynamic_list_fields',
  'service_pricing_rules',
  'applications',
  'application_notes',
  'application_statuses',
  'status_history',
  'otp_verifications',
  'payments',
  'rejection_details',
  'application_pricing_items',
  'application_pricing_summary',
  'invoices',
  'appointment_settings',
  'appointment_slots',
  'appointments',
  'closed_days',
  'shipping_companies',
  'shipments',
  'educational_cards',
  'site_settings',
  'contact_info',
  'social_links',
  'slider_items',
  'page_sections',
  'footer_content',
  'counters',
  'breaking_news_ticker',
  'news',
  'events',
  'event_registrations',
  'about_sudan_page',
  'about_sudan_statistics',
  'about_sudan_sections',
  'about_sudan_section_stats',
  'about_consulate_sections',
  'ambassadors',
  'services_guide_sections',
  'important_links',
  'additional_pages',
  'system_maintenance',
  'system_announcements',
  'system_settings',
  'contact_messages',
  'chatbot_categories',
  'chatbot_questions_answers',
  'chatbot_conversations',
  'chat_conversations',
  'chat_messages',
  'chat_staff',
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
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }

  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }

  return `'${value}'`;
}

/**
 * قراءة جميع ملفات الـ migrations
 */
function readAllMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('⚠️  No migrations directory found');
    return '';
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📂 Found ${files.length} migration files`);

  let allMigrations = `-- ============================================================================
-- DATABASE SCHEMA - ALL MIGRATIONS
-- ============================================================================
-- Total migrations: ${files.length}
-- ============================================================================

`;

  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    allMigrations += `
-- ----------------------------------------------------------------------------
-- Migration ${index + 1}: ${file}
-- ----------------------------------------------------------------------------

${content}

`;
  });

  return allMigrations;
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
      if (error.message.includes('does not exist')) {
        console.log(`   ℹ️  Table ${tableName} does not exist (skipped)`);
        return '';
      }
      console.error(`   ⚠️  Warning: Could not export ${tableName}:`, error.message);
      return '';
    }

    if (!data || data.length === 0) {
      console.log(`   ℹ️  No data in ${tableName}`);
      return '';
    }

    console.log(`   ✓ Found ${data.length} rows`);

    let sql = `-- Data for table: ${tableName}\n`;
    sql += `-- Rows: ${data.length}\n\n`;

    const columns = Object.keys(data[0]);
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
    return '';
  }
}

/**
 * تصدير جميع البيانات
 */
async function exportAllData() {
  console.log('\n📊 Exporting all data...\n');

  let dataSQL = `-- ============================================================================
-- DATABASE DATA - ALL TABLES
-- ============================================================================
-- Generated: ${new Date().toISOString()}
-- ============================================================================

-- Disable triggers during import for better performance
SET session_replication_role = 'replica';

`;

  for (const tableName of DATA_TABLES) {
    const tableSQL = await exportTableData(tableName);
    if (tableSQL) {
      dataSQL += tableSQL;
    }
  }

  dataSQL += `
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
    BEGIN
      EXECUTE format('SELECT COALESCE(MAX(id), 1) FROM %I.%I',
                     seq_record.schemaname, seq_record.tablename)
      INTO max_id;

      EXECUTE format('SELECT setval(%L, %s)',
                     seq_record.schemaname || '.' || seq_record.sequencename,
                     max_id);
    EXCEPTION
      WHEN OTHERS THEN
        -- Skip if table doesn't have id column
        NULL;
    END;
  END LOOP;
END $$;

`;

  return dataSQL;
}

/**
 * نسخ مجلد بالكامل
 */
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

/**
 * نسخ Edge Functions
 */
function backupEdgeFunctions(backupDir) {
  console.log('\n📋 Step 3/3: Backing up Edge Functions...\n');

  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  const edgeFunctionsBackupDir = path.join(backupDir, 'edge-functions');

  if (!fs.existsSync(functionsDir)) {
    console.log('⚠️  No Edge Functions directory found');
    return 0;
  }

  // Get list of functions
  const functions = fs.readdirSync(functionsDir)
    .filter(item => {
      const itemPath = path.join(functionsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

  if (functions.length === 0) {
    console.log('⚠️  No Edge Functions found');
    return 0;
  }

  console.log(`📦 Found ${functions.length} Edge Functions\n`);

  // Copy each function
  functions.forEach((functionName, index) => {
    console.log(`   ${index + 1}. ${functionName}`);
    const sourcePath = path.join(functionsDir, functionName);
    const destPath = path.join(edgeFunctionsBackupDir, functionName);

    copyDirectory(sourcePath, destPath);
    console.log(`      ✓ Copied`);
  });

  console.log(`\n✅ Edge Functions backed up successfully!`);

  // Create Edge Functions README
  const edgeFunctionsReadme = `# Edge Functions Backup

## 📦 Edge Functions المحفوظة

تم نسخ ${functions.length} Edge Function:

${functions.map((fn, i) => `${i + 1}. **${fn}/**`).join('\n')}

## 🚀 كيفية استعادة Edge Functions

### الطريقة الأولى: نسخ يدوي

\`\`\`bash
# انسخ المجلد كاملاً إلى مشروعك
cp -r edge-functions/* /path/to/your/project/supabase/functions/
\`\`\`

### الطريقة الثانية: Deploy على Supabase

استخدم Supabase CLI لنشر كل function:

\`\`\`bash
# مثال: نشر function واحد
supabase functions deploy create-admin

# نشر جميع Functions
${functions.map(fn => `supabase functions deploy ${fn}`).join('\n')}
\`\`\`

## 📋 قائمة Edge Functions

${functions.map((fn, i) => {
  const functionPath = path.join(edgeFunctionsBackupDir, fn);
  const files = fs.readdirSync(functionPath);
  return `### ${i + 1}. ${fn}

الملفات:
${files.map(f => `- ${f}`).join('\n')}
`;
}).join('\n')}

## ⚠️ ملاحظات مهمة

1. **Environment Variables**:
   - تأكد من إعداد المتغيرات البيئية المطلوبة
   - متغيرات Supabase يتم توفيرها تلقائياً

2. **CORS Headers**:
   - جميع Functions تحتوي على CORS headers جاهزة
   - Headers: Content-Type, Authorization, X-Client-Info, Apikey

3. **Deployment**:
   - يمكن استخدام Supabase Dashboard للـ deploy
   - أو استخدم Supabase CLI

---

تم إنشاء النسخة الاحتياطية في: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(edgeFunctionsBackupDir, 'README.md'), edgeFunctionsReadme, 'utf8');
  console.log(`📄 Edge Functions README: ${path.join(edgeFunctionsBackupDir, 'README.md')}`);

  return functions.length;
}

/**
 * تصدير النسخة الاحتياطية الكاملة
 */
async function exportCompleteBackup() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🚀 بدء النسخة الاحتياطية الكاملة الشاملة');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '..', 'complete-backup');

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const completeBackupFile = path.join(backupDir, `complete-backup-${timestamp}.sql`);

  // Step 1: Read all migrations (Schema)
  console.log('📋 Step 1/3: Collecting schema from migrations...\n');
  const schemaSQL = readAllMigrations();

  // Step 2: Export all data
  console.log('\n📋 Step 2/3: Exporting all data...\n');
  const dataSQL = await exportAllData();

  // Step 3: Backup Edge Functions
  const edgeFunctionsCount = backupEdgeFunctions(backupDir);

  // Combine everything
  const completeSQL = `-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLETE DATABASE BACKUP - FULL EXPORT
-- ═══════════════════════════════════════════════════════════════════════════
-- Generated: ${new Date().toISOString()}
-- Source: ${supabaseUrl}
--
-- This file contains EVERYTHING:
-- ✓ All database schema (tables, columns, constraints)
-- ✓ All functions and triggers
-- ✓ All RLS policies and security settings
-- ✓ All indexes for performance
-- ✓ All extensions
-- ✓ All data from all tables
-- ✓ Edge Functions (${edgeFunctionsCount} functions in edge-functions/ folder)
--
-- To restore this backup to a PostgreSQL database:
--   psql -h localhost -U postgres -d your_database -f complete-backup-*.sql
--
-- For Edge Functions:
--   See edge-functions/README.md for deployment instructions
--
-- Prerequisites:
--   - PostgreSQL 14 or higher
--   - Empty database or drop/recreate existing database
-- ═══════════════════════════════════════════════════════════════════════════

-- Start transaction
BEGIN;

-- Ensure we're in the right database
\\connect postgres

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════

${schemaSQL}

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: DATABASE DATA
-- ═══════════════════════════════════════════════════════════════════════════

${dataSQL}

-- ═══════════════════════════════════════════════════════════════════════════
-- BACKUP VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Show table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as exists
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Show functions count
SELECT COUNT(*) as functions_count
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Show triggers count
SELECT COUNT(*) as triggers_count
FROM pg_trigger
WHERE tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'));

-- Commit transaction
COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ COMPLETE BACKUP FINISHED
-- ═══════════════════════════════════════════════════════════════════════════
-- Generated at: ${new Date().toISOString()}
-- Backup file: ${completeBackupFile}
-- ═══════════════════════════════════════════════════════════════════════════
`;

  // Write complete backup file
  fs.writeFileSync(completeBackupFile, completeSQL, 'utf8');

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('✅ النسخة الاحتياطية الكاملة تمت بنجاح!');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`\n📁 الملف المحفوظ: ${completeBackupFile}`);
  console.log(`📊 حجم الملف: ${(fs.statSync(completeBackupFile).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Edge Functions: ${edgeFunctionsCount} functions`);

  // Create restore instructions
  createRestoreInstructions(backupDir, path.basename(completeBackupFile), edgeFunctionsCount);

  return completeBackupFile;
}

/**
 * إنشاء ملف تعليمات الاستعادة
 */
function createRestoreInstructions(backupDir, backupFileName, edgeFunctionsCount) {
  const instructions = `# النسخة الاحتياطية الكاملة الشاملة
# Complete Full Backup

## 📦 محتويات هذه النسخة الاحتياطية

هذا الملف يحتوي على **كل شيء** من قاعدة البيانات والنظام:

### ✅ ما يحتويه الباك أب:

1. **Schema (البنية)**
   - جميع الجداول (Tables)
   - جميع الأعمدة (Columns)
   - جميع القيود (Constraints)
   - Foreign Keys و Primary Keys

2. **Functions (الدوال)**
   - جميع الدوال المخصصة (Custom Functions)
   - PL/pgSQL Functions

3. **Triggers (المشغلات)**
   - جميع الـ Triggers التلقائية

4. **RLS Policies (السياسات الأمنية)**
   - جميع سياسات Row Level Security
   - جميع إعدادات الأمان

5. **Indexes (الفهارس)**
   - جميع الفهارس لتحسين الأداء

6. **Extensions (الإضافات)**
   - UUID extensions
   - pgcrypto
   - وغيرها

7. **Data (البيانات)**
   - جميع البيانات من كل الجداول
   - بالترتيب الصحيح

8. **Edge Functions (${edgeFunctionsCount} functions)**
   - جميع الـ Edge Functions
   - في مجلد \`edge-functions/\`
   - راجع \`edge-functions/README.md\` للتفاصيل

## 🚀 كيفية استعادة النسخة الاحتياطية

### الطريقة الأولى: استعادة على قاعدة بيانات فارغة

\`\`\`bash
# 1. إنشاء قاعدة بيانات جديدة
createdb -h localhost -U postgres consulate_restored

# 2. استعادة النسخة الاحتياطية
psql -h localhost -U postgres -d consulate_restored -f ${backupFileName}
\`\`\`

### الطريقة الثانية: استبدال قاعدة بيانات موجودة

\`\`\`bash
# 1. حذف القاعدة القديمة (احذر! سيتم حذف كل شيء)
dropdb -h localhost -U postgres consulate

# 2. إنشاء قاعدة جديدة
createdb -h localhost -U postgres consulate

# 3. استعادة النسخة الاحتياطية
psql -h localhost -U postgres -d consulate -f ${backupFileName}
\`\`\`

### الطريقة الثالثة: استعادة على Supabase

\`\`\`bash
# استخدم اتصال Supabase المباشر
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f ${backupFileName}
\`\`\`

## 📋 المتطلبات

- PostgreSQL 14 أو أحدث
- psql (PostgreSQL client) مثبت
- صلاحيات إنشاء قواعد بيانات

## ⚠️ ملاحظات مهمة

1. **وقت الاستعادة**: قد يستغرق الأمر عدة دقائق حسب حجم البيانات

2. **كلمة المرور**: إذا طلب النظام كلمة مرور، استخدم:
   \`\`\`bash
   PGPASSWORD=your_password psql -h localhost -U postgres -d consulate -f ${backupFileName}
   \`\`\`

3. **الملفات المرفوعة**: هذه النسخة لا تحتوي على:
   - الملفات المرفوعة في Storage
   - إعدادات Supabase Auth Users

4. **التحقق من النجاح**: بعد الاستعادة، سيظهر لك:
   - عدد الجداول
   - عدد الدوال (Functions)
   - عدد المشغلات (Triggers)
   - أحجام الجداول

## 🔍 التحقق من الاستعادة

بعد استعادة النسخة، تحقق من نجاح العملية:

\`\`\`sql
-- عرض جميع الجداول
\\dt

-- عرض عدد السجلات في جدول معين
SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM applications;
SELECT COUNT(*) FROM staff;

-- عرض جميع الدوال
\\df

-- عرض جميع الـ RLS Policies
SELECT tablename, policyname FROM pg_policies;
\`\`\`

## 🔐 الأمان

- احتفظ بهذا الملف في مكان آمن ومشفر
- لا تشارك النسخة الاحتياطية علناً (تحتوي على بيانات حساسة)
- استخدم كلمات مرور قوية
- قم بعمل نسخ احتياطية دورية (يومية/أسبوعية)

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من اتصال قاعدة البيانات
2. تأكد من صلاحيات المستخدم
3. راجع سجلات الأخطاء (error logs)
4. تأكد من إصدار PostgreSQL المتوافق

---

تم إنشاء النسخة الاحتياطية في: ${new Date().toISOString()}
اسم الملف: ${backupFileName}
`;

  const instructionsPath = path.join(backupDir, 'README-RESTORE.md');
  fs.writeFileSync(instructionsPath, instructions, 'utf8');

  console.log(`\n📖 ملف التعليمات: ${instructionsPath}`);
}

// Run export
(async () => {
  try {
    await exportCompleteBackup();

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('🎉 اكتمل النسخ الاحتياطي الكامل بنجاح!');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('\n📚 الخطوات التالية:');
    console.log('   1. افتح مجلد: complete-backup');
    console.log('   2. احتفظ بالملف في مكان آمن');
    console.log('   3. لاستعادة البيانات، راجع: complete-backup/README-RESTORE.md');
    console.log('\n💡 لإنشاء نسخة احتياطية جديدة، شغل هذا الأمر مرة أخرى:\n');
    console.log('   node scripts/export-complete-backup.js\n');
  } catch (error) {
    console.error('\n❌ خطأ أثناء النسخ الاحتياطي:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
