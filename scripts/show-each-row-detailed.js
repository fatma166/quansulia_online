#!/usr/bin/env node

/**
 * عرض تفصيلي لكل row في كل جدول
 * يطبع كل حقل في سطر منفصل بتنسيق واضح
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

const TABLES = {
  'services': 'الخدمات الرئيسية',
  'service_types': 'أنواع الخدمات',
  'service_fields': 'حقول النماذج',
  'service_dynamic_list_fields': 'الحقول الديناميكية',
  'service_documents': 'المستندات المطلوبة',
  'service_requirements': 'المتطلبات',
  'service_pricing_rules': 'قواعد التسعير',
};

// الحقول المهمة لكل جدول
const IMPORTANT_FIELDS = {
  'services': ['id', 'slug', 'name_ar', 'name_en', 'is_active', 'parent_id'],
  'service_types': ['id', 'service_id', 'name_ar', 'slug', 'is_active'],
  'service_fields': ['id', 'service_id', 'service_type_id', 'field_name', 'field_type', 'label_ar', 'is_required', 'conditions', 'order_index', 'is_active'],
  'service_dynamic_list_fields': ['id', 'parent_field_id', 'field_name', 'field_type', 'label_ar', 'is_required', 'order_index'],
  'service_documents': ['id', 'service_id', 'service_type_id', 'document_name_ar', 'is_required', 'conditions', 'order_index', 'is_active'],
  'service_requirements': ['id', 'service_id', 'service_type_id', 'requirement_ar', 'requirement_type', 'conditions', 'order_index', 'is_active'],
  'service_pricing_rules': ['id', 'service_id', 'service_type_id', 'rule_name', 'conditions', 'price_amount', 'priority', 'is_active'],
};

/**
 * تنسيق القيمة للطباعة
 */
function formatValue(value, key) {
  if (value === null || value === undefined) {
    return '⚪ NULL';
  }

  if (typeof value === 'boolean') {
    return value ? '✅ true' : '❌ false';
  }

  if (typeof value === 'object') {
    return '\n' + JSON.stringify(value, null, 4).split('\n').map(line => '      ' + line).join('\n');
  }

  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...';
  }

  return value;
}

/**
 * عرض جدول
 */
async function showTable(tableName, description) {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(98) + '╗');
  console.log(`║  📋 جدول: ${tableName.padEnd(30)} - ${description.padEnd(55)} ║`);
  console.log('╚' + '═'.repeat(98) + '╝');

  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`\n❌ خطأ: ${error.message}`);
      return { tableName, count: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log('\n⚠️  الجدول فارغ - لا توجد بيانات\n');
      return { tableName, count: 0, error: null };
    }

    console.log(`\n✅ عدد الصفوف: ${data.length}`);

    const importantFields = IMPORTANT_FIELDS[tableName] || Object.keys(data[0]);

    // طباعة كل row
    data.forEach((row, index) => {
      console.log('\n' + '─'.repeat(100));
      console.log(`🔸 صف رقم ${index + 1} من ${data.length}`);
      console.log('─'.repeat(100));

      // الحقول المهمة أولاً
      importantFields.forEach(key => {
        if (row.hasOwnProperty(key)) {
          const value = formatValue(row[key], key);
          console.log(`  ${key.padEnd(30)} : ${value}`);
        }
      });

      // باقي الحقول
      const remainingFields = Object.keys(row).filter(k => !importantFields.includes(k));
      if (remainingFields.length > 0) {
        console.log(`\n  ${'━'.repeat(95)}`);
        console.log(`  باقي الحقول:`);
        console.log(`  ${'━'.repeat(95)}`);

        remainingFields.forEach(key => {
          const value = formatValue(row[key], key);
          console.log(`  ${key.padEnd(30)} : ${value}`);
        });
      }
    });

    return { tableName, count: data.length, error: null };

  } catch (err) {
    console.error(`\n❌ خطأ: ${err.message}`);
    return { tableName, count: 0, error: err.message };
  }
}

/**
 * Main
 */
async function main() {
  const timestamp = new Date().toLocaleString('ar-SA');

  console.log('\n\n');
  console.log('╔' + '═'.repeat(98) + '╗');
  console.log('║' + ' '.repeat(30) + '📊 عرض تفصيلي لكل البيانات' + ' '.repeat(40) + '║');
  console.log('║' + ' '.repeat(35) + timestamp.padEnd(63) + '║');
  console.log('╚' + '═'.repeat(98) + '╝');

  const results = [];

  // عرض كل جدول
  for (const [tableName, description] of Object.entries(TABLES)) {
    const result = await showTable(tableName, description);
    results.push(result);
  }

  // ملخص نهائي
  console.log('\n\n');
  console.log('╔' + '═'.repeat(98) + '╗');
  console.log('║' + ' '.repeat(40) + '📊 الملخص النهائي' + ' '.repeat(40) + '║');
  console.log('╚' + '═'.repeat(98) + '╝');
  console.log('\n');

  let totalRows = 0;
  results.forEach(r => {
    const status = r.error ? `❌ خطأ: ${r.error}` : r.count === 0 ? '⚠️  فارغ' : `✅ ${r.count} صف`;
    console.log(`  ${r.tableName.padEnd(35)} : ${status}`);
    totalRows += r.count;
  });

  console.log('\n  ' + '─'.repeat(96));
  console.log(`  ${'إجمالي الصفوف'.padEnd(35)} : ${totalRows}`);
  console.log('  ' + '─'.repeat(96));

  // حفظ في ملف
  const outputFile = `services-data-${Date.now()}.txt`;
  console.log(`\n💾 لحفظ النتائج في ملف، شغل:\n`);
  console.log(`   node scripts/show-each-row-detailed.js > ${outputFile}\n`);

  console.log('═'.repeat(100));
  console.log('✅ انتهى العرض');
  console.log('═'.repeat(100));
  console.log('\n');
}

main().catch(err => {
  console.error('❌ خطأ فادح:', err);
  process.exit(1);
});
