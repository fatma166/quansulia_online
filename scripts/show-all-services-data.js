#!/usr/bin/env node

/**
 * عرض جميع البيانات من كل جدول متعلق بالخدمات
 * يطبع كل row في كل جدول
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير موجود في .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// الجداول
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
 * عرض بيانات جدول
 */
async function showTable(tableName) {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log(`📋 جدول: ${tableName}`);
  console.log('═'.repeat(80));

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`\n❌ خطأ: ${error.message}\n`);
      return;
    }

    if (!data || data.length === 0) {
      console.log('\n⚠️  الجدول فارغ - لا توجد بيانات\n');
      return;
    }

    console.log(`\n✅ عدد الصفوف: ${data.length}\n`);
    console.log('─'.repeat(80));

    // طباعة كل row
    data.forEach((row, index) => {
      console.log(`\n[${index + 1}/${data.length}]`);

      // طباعة كل عمود
      Object.keys(row).forEach(key => {
        let value = row[key];

        // تنسيق القيم
        if (value === null) {
          value = '(null)';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value, null, 2);
        } else if (typeof value === 'boolean') {
          value = value ? '✓ true' : '✗ false';
        }

        console.log(`  ${key.padEnd(25)} : ${value}`);
      });

      console.log('  ' + '·'.repeat(78));
    });

  } catch (err) {
    console.error(`\n❌ خطأ: ${err.message}\n`);
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + '📊 عرض جميع بيانات الخدمات' + ' '.repeat(31) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  for (const tableName of TABLES) {
    await showTable(tableName);
  }

  console.log('\n');
  console.log('═'.repeat(80));
  console.log('✅ انتهى العرض');
  console.log('═'.repeat(80));
  console.log('\n');
}

main().catch(err => {
  console.error('❌ خطأ فادح:', err);
  process.exit(1);
});
