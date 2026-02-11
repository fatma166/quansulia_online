import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 استيراد جميع الخدمات الفرعية...\n');

const sqlFile = join(__dirname, '..', 'supabase', 'migrations', '99999999999999_import_all_services_data.sql');
const sqlContent = readFileSync(sqlFile, 'utf8');

console.log(`📊 حجم الملف: ${(sqlContent.length / 1024).toFixed(2)} KB`);
console.log(`📄 عدد السطور: ${sqlContent.split('\n').length}\n`);

// تقسيم إلى Service blocks
const serviceBlocks = [];
const lines = sqlContent.split('\n');
let currentBlock = [];
let currentService = '';

for (const line of lines) {
  if (line.match(/^-- خدمة: (.+)/)) {
    if (currentBlock.length > 0) {
      serviceBlocks.push({ name: currentService, sql: currentBlock.join('\n') });
      currentBlock = [];
    }
    currentService = line.match(/^-- خدمة: (.+)/)[1];
  }
  currentBlock.push(line);
}

// آخر block
if (currentBlock.length > 0) {
  serviceBlocks.push({ name: currentService, sql: currentBlock.join('\n') });
}

console.log(`📦 عدد الخدمات: ${serviceBlocks.length}\n`);
console.log('ملاحظة: بسبب قيود تطبيق SQL مباشرةً، يُنصح بتطبيق الملف يدوياً:\n');
console.log('1. افتح Supabase Dashboard');
console.log('2. انتقل إلى SQL Editor');
console.log('3. افتح الملف: supabase/migrations/99999999999999_import_all_services_data.sql');
console.log('4. انسخ المحتوى والصقه في SQL Editor');
console.log('5. اضغط Run\n');

console.log('أو يمكنك استخدام السكريبت التالي إذا كان لديك database connection string:');
console.log('');
console.log('psql "postgresql://user:pass@host:5432/db" -f supabase/migrations/99999999999999_import_all_services_data.sql');

console.log('\n\n');
console.log('✅ الملف جاهز للتطبيق');
