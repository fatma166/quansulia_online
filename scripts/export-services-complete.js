#!/usr/bin/env node

/**
 * استخراج كامل لجميع بيانات الخدمات من Database
 * يستخرج من 10+ جداول ويحفظها كـ SQL جاهز للاستيراد
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// تحميل .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// الجداول المرتبطة بالخدمات
const TABLES = [
  'services',
  'service_types',
  'service_fields',
  'service_dynamic_list_fields',
  'service_documents',
  'service_requirements',
  'service_pricing_rules',
  'categories',
  'regions',
  'statuses'
];

/**
 * تحويل قيمة لـ SQL literal
 */
function toSqlValue(value) {
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
    // JSON objects/arrays
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }

  // String
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * إنشاء INSERT statement
 */
function createInsertStatement(tableName, row) {
  const columns = Object.keys(row);
  const values = columns.map(col => toSqlValue(row[col]));

  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

/**
 * استخراج بيانات جدول
 */
async function exportTable(tableName) {
  console.log(`\n📋 جاري استخراج: ${tableName}...`);

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`   ❌ خطأ: ${error.message}`);
      return { tableName, count: 0, sql: [], error: error.message };
    }

    if (!data || data.length === 0) {
      console.log(`   ⚠️  جدول فارغ`);
      return { tableName, count: 0, sql: [], error: null };
    }

    console.log(`   ✅ تم استخراج ${data.length} صف`);

    const sqlStatements = data.map(row => createInsertStatement(tableName, row));

    return {
      tableName,
      count: data.length,
      sql: sqlStatements,
      data: data,
      error: null
    };
  } catch (err) {
    console.error(`   ❌ خطأ: ${err.message}`);
    return { tableName, count: 0, sql: [], error: err.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('====================================');
  console.log('📦 استخراج كامل لبيانات الخدمات');
  console.log('====================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputDir = `services-export-${timestamp}`;

  // إنشاء المجلد
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n📁 المجلد: ${outputDir}`);

  // استخراج كل الجداول
  const results = [];

  for (const tableName of TABLES) {
    const result = await exportTable(tableName);
    results.push(result);

    // حفظ JSON لكل جدول
    if (result.data && result.data.length > 0) {
      const jsonPath = path.join(outputDir, `${tableName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(result.data, null, 2), 'utf8');
      console.log(`   💾 JSON: ${jsonPath}`);
    }
  }

  console.log('\n====================================');
  console.log('📝 إنشاء ملفات SQL');
  console.log('====================================');

  // إنشاء ملف SQL كامل
  const sqlLines = [
    '-- =====================================',
    '-- استيراد كامل لبيانات الخدمات',
    `-- تاريخ الإنشاء: ${new Date().toISOString()}`,
    '-- =====================================',
    '',
    '-- تعطيل التحققات مؤقتاً',
    'SET session_replication_role = replica;',
    '',
  ];

  // إضافة البيانات لكل جدول
  for (const result of results) {
    if (result.sql.length > 0) {
      sqlLines.push(`-- =====================================`);
      sqlLines.push(`-- جدول: ${result.tableName} (${result.count} صف)`);
      sqlLines.push(`-- =====================================`);
      sqlLines.push('');
      sqlLines.push(...result.sql);
      sqlLines.push('');
    }
  }

  sqlLines.push('-- إعادة تفعيل التحققات');
  sqlLines.push('SET session_replication_role = origin;');
  sqlLines.push('');

  // حفظ SQL
  const sqlPath = path.join(outputDir, 'complete_services_data.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');
  console.log(`✅ ملف SQL: ${sqlPath}`);

  // إنشاء تقرير
  console.log('\n====================================');
  console.log('📊 تقرير الإحصائيات');
  console.log('====================================\n');

  const summary = {
    timestamp: new Date().toISOString(),
    tables: results.map(r => ({
      name: r.tableName,
      count: r.count,
      error: r.error
    })),
    totalRecords: results.reduce((sum, r) => sum + r.count, 0)
  };

  // طباعة الإحصائيات
  console.log('الجداول المُستخرجة:');
  console.log('─────────────────────────────────────');

  let maxTableNameLength = Math.max(...results.map(r => r.tableName.length));

  for (const result of results) {
    const paddedName = result.tableName.padEnd(maxTableNameLength);
    if (result.error) {
      console.log(`  ${paddedName}  ❌ خطأ: ${result.error}`);
    } else if (result.count === 0) {
      console.log(`  ${paddedName}  ⚠️  فارغ`);
    } else {
      console.log(`  ${paddedName}  ✅ ${result.count} صف`);
    }
  }

  console.log('─────────────────────────────────────');
  console.log(`إجمالي الصفوف: ${summary.totalRecords}`);
  console.log('');

  // حفظ التقرير
  const summaryPath = path.join(outputDir, 'SUMMARY.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  const readmePath = path.join(outputDir, 'README.txt');
  fs.writeFileSync(readmePath, `
====================================
تقرير استخراج بيانات الخدمات
====================================

التاريخ: ${new Date().toLocaleString('ar-SA')}
إجمالي الصفوف: ${summary.totalRecords}

====================================
الملفات المُنشأة:
====================================

1. complete_services_data.sql
   - ملف SQL كامل جاهز للاستيراد
   - يحتوي على جميع البيانات

2. [table_name].json
   - ملف JSON لكل جدول
   - للمراجعة والتحليل

3. SUMMARY.json
   - تقرير مفصل بالإحصائيات

====================================
كيفية الاستيراد:
====================================

طريقة 1: باستخدام psql
─────────────────────────
psql -U postgres -d postgres -f complete_services_data.sql

طريقة 2: باستخدام Docker
─────────────────────────
docker exec -i supabase-db psql -U postgres -d postgres < complete_services_data.sql

طريقة 3: باستخدام Supabase Studio
─────────────────────────
1. افتح SQL Editor
2. انسخ محتوى complete_services_data.sql
3. الصق وشغّل

====================================
تفاصيل الجداول:
====================================

${results.map(r => `${r.tableName}: ${r.count} صف${r.error ? ' (خطأ: ' + r.error + ')' : ''}`).join('\n')}

====================================
`, 'utf8');

  console.log('====================================');
  console.log('✅ تم الانتهاء بنجاح!');
  console.log('====================================\n');

  console.log(`📁 جميع الملفات في: ${outputDir}/`);
  console.log(`\n💾 لاستيراد البيانات:\n`);
  console.log(`   docker exec -i supabase-db psql -U postgres -d postgres < ${outputDir}/complete_services_data.sql\n`);
}

main().catch(err => {
  console.error('❌ خطأ فادح:', err);
  process.exit(1);
});
