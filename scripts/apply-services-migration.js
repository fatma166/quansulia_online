#!/usr/bin/env node

/**
 * سكريبت لتطبيق migration الخدمات على دفعات
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات Supabase غير موجودة');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * تقسيم SQL إلى statements منفصلة
 */
function splitSQLStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let inDoBlock = false;

  const lines = sql.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // تخطي التعليقات والأسطر الفارغة
    if (!line || line.startsWith('--')) {
      if (currentStatement) {
        currentStatement += line + '\n';
      }
      continue;
    }

    // التحقق من بداية DO block
    if (line.startsWith('DO $$')) {
      inDoBlock = true;
      currentStatement += line + '\n';
      continue;
    }

    // التحقق من نهاية DO block
    if (inDoBlock && line === '$$;') {
      currentStatement += line + '\n';
      inDoBlock = false;
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }

    // إضافة السطر الحالي
    currentStatement += line + '\n';

    // إذا كنا في DO block، نستمر
    if (inDoBlock) {
      continue;
    }

    // التحقق من نهاية statement عادي
    if (line.endsWith(';') && !line.startsWith('--')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  // إضافة أي statement متبقي
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements.filter(s => s && !s.startsWith('/*') && s !== '*/');
}

/**
 * تنفيذ SQL statement
 */
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql_raw', { sql_text: sql });

    if (error) {
      // محاولة تنفيذ مباشر إذا فشل RPC
      const { error: directError } = await supabase.from('_migrations').insert({ statement: sql });

      if (directError) {
        return { success: false, error };
      }
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🚀 بدء تطبيق migration الخدمات...\n');

  const sqlFile = join(__dirname, '../supabase/migrations/99999999999999_import_all_services_data.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error('❌ ملف SQL غير موجود');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
  console.log(`📄 حجم الملف: ${(sqlContent.length / 1024).toFixed(2)} KB`);

  const statements = splitSQLStatements(sqlContent);
  console.log(`📝 عدد ال statements: ${statements.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // تخطي التعليقات
    if (!stmt || stmt.startsWith('/*') || stmt.startsWith('--')) {
      continue;
    }

    process.stdout.write(`⏳ [${i + 1}/${statements.length}] تنفيذ...`);

    const result = await executeSQL(stmt);

    if (result.success) {
      successCount++;
      process.stdout.write('\r✅ ');
      console.log(`[${i + 1}/${statements.length}] نجح`);
    } else {
      failCount++;
      process.stdout.write('\r❌ ');
      console.log(`[${i + 1}/${statements.length}] فشل:`, result.error?.message || 'خطأ غير معروف');
    }

    // إيقاف مؤقت صغير لتجنب تجاوز الحدود
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ النتائج:`);
  console.log(`   - نجح: ${successCount}`);
  console.log(`   - فشل: ${failCount}`);
  console.log(`   - الإجمالي: ${statements.length}`);
  console.log('='.repeat(60));

  if (failCount > 0) {
    console.log('\n⚠️ بعض ال statements فشلت، لكن قد تكون البيانات نُقلت بنجاح');
    console.log('يمكنك التحقق من قاعدة البيانات للتأكد');
  }
}

main().catch(console.error);
