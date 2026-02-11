#!/usr/bin/env node

/**
 * استخراج البيانات وتحويلها لـ SQL INSERT statements
 * جاهزة للنسخ واللصق
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير موجود في .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  'services',
  'service_types',
  'service_fields',
  'service_dynamic_list_fields',
  'service_documents',
  'service_requirements',
  'service_pricing_rules',
];

/**
 * تحويل قيمة لـ SQL
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
    // JSONB
    const json = JSON.stringify(value).replace(/'/g, "''");
    return `'${json}'::jsonb`;
  }

  // String - escape single quotes
  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
}

/**
 * إنشاء INSERT statement
 */
function createInsert(tableName, row) {
  const columns = Object.keys(row);
  const values = columns.map(col => toSqlValue(row[col]));

  return `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES (${values.join(', ')});\n`;
}

/**
 * معالجة جدول
 */
async function processTable(tableName) {
  console.log(`\n📋 معالجة: ${tableName}...`);

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`   ❌ خطأ: ${error.message}`);
      return { tableName, sql: [], count: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log(`   ⚠️  فارغ`);
      return { tableName, sql: [], count: 0, error: null };
    }

    console.log(`   ✅ ${data.length} صف`);

    const sqlStatements = data.map(row => createInsert(tableName, row));

    return { tableName, sql: sqlStatements, count: data.length, error: null };

  } catch (err) {
    console.error(`   ❌ خطأ: ${err.message}`);
    return { tableName, sql: [], count: 0, error: err.message };
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📦 استخراج البيانات وتحويلها لـ SQL');
  console.log('═'.repeat(80));

  const results = [];
  const allSql = [];

  // Header
  allSql.push('-- ═══════════════════════════════════════════════════════════════');
  allSql.push('-- SQL Dump لجميع بيانات الخدمات');
  allSql.push(`-- التاريخ: ${new Date().toISOString()}`);
  allSql.push('-- ═══════════════════════════════════════════════════════════════');
  allSql.push('');
  allSql.push('-- تعطيل التحققات مؤقتاً');
  allSql.push('SET session_replication_role = replica;');
  allSql.push('');

  // معالجة كل جدول
  for (const tableName of TABLES) {
    const result = await processTable(tableName);
    results.push(result);

    if (result.sql.length > 0) {
      allSql.push('-- ═══════════════════════════════════════════════════════════════');
      allSql.push(`-- جدول: ${tableName} (${result.count} صف)`);
      allSql.push('-- ═══════════════════════════════════════════════════════════════');
      allSql.push('');
      allSql.push(...result.sql);
      allSql.push('');
    }
  }

  // Footer
  allSql.push('-- إعادة تفعيل التحققات');
  allSql.push('SET session_replication_role = origin;');
  allSql.push('');

  // حفظ الملف
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `all-services-data-${timestamp}.sql`;

  fs.writeFileSync(filename, allSql.join('\n'), 'utf8');

  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📊 الملخص');
  console.log('═'.repeat(80));
  console.log('');

  let totalRows = 0;
  results.forEach(r => {
    const status = r.error ? `❌ ${r.error}` : r.count === 0 ? '⚠️  فارغ' : `✅ ${r.count} صف`;
    console.log(`  ${r.tableName.padEnd(35)} : ${status}`);
    totalRows += r.count;
  });

  console.log('');
  console.log('─'.repeat(80));
  console.log(`  إجمالي الصفوف: ${totalRows}`);
  console.log('─'.repeat(80));
  console.log('');
  console.log(`✅ تم الحفظ في: ${filename}`);
  console.log('');
  console.log('💾 لاستيراد البيانات:');
  console.log(`   docker exec -i supabase-db psql -U postgres -d postgres < ${filename}`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
}

main().catch(err => {
  console.error('❌ خطأ فادح:', err);
  process.exit(1);
});
