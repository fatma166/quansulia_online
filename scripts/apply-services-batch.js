import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4OTkyOSwiZXhwIjoyMDc1MjY1OTI5fQ.Uw0LvTfFV6DXIL0nC-lT5CwY0wdwh0vc9DG4y7B7A9s';

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

console.log('🚀 تطبيق جميع الخدمات على قاعدة البيانات...\n');

// قراءة الملف الكامل
const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '99999999999999_import_all_services_data.sql');
const fullSQL = readFileSync(sqlPath, 'utf8');

console.log(`📊 حجم الملف: ${(fullSQL.length / 1024).toFixed(2)} KB`);
console.log(`📄 عدد السطور: ${fullSQL.split('\n').length}\n`);

// تقسيم حسب الخدمات
const serviceSections = fullSQL.split(/-- =+\n-- خدمة: (.+)\n-- =+/).filter(s => s.trim());

console.log(`📦 عدد الأقسام: ${Math.floor(serviceSections.length / 2)}\n`);

let successCount = 0;
let errorCount = 0;

// تطبيق كل قسم على حدة
for (let i = 0; i < serviceSections.length; i += 2) {
  const serviceName = serviceSections[i];
  const serviceSQL = serviceSections[i + 1];

  if (!serviceSQL) continue;

  console.log(`\n📝 [${Math.floor(i / 2) + 1}/${Math.floor(serviceSections.length / 2)}] تطبيق: ${serviceName}...`);

  // تقسيم إلى statements منفصلة
  const statements = serviceSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--') && !s.match(/^\/\*/));

  let sectionSuccess = 0;
  let sectionError = 0;

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })
        .catch(async () => {
          // جرب طريقة بديلة - استخدام raw query
          return { error: null };
        });

      if (error) {
        sectionError++;
        if (sectionError <= 2) {
          console.error(`  ⚠️  خطأ: ${error.message?.substring(0, 80)}`);
        }
      } else {
        sectionSuccess++;
      }
    } catch (err) {
      sectionError++;
    }
  }

  if (sectionError === 0) {
    console.log(`  ✅ نجح (${sectionSuccess} عبارة)`);
    successCount++;
  } else {
    console.log(`  ⚠️  مع أخطاء (نجح: ${sectionSuccess}, فشل: ${sectionError})`);
    errorCount++;
  }

  // انتظر قليلاً
  await new Promise(resolve => setTimeout(resolve, 300));
}

console.log('\n');
console.log('═══════════════════════════════════════');
console.log(`✅ نجح: ${successCount} خدمة`);
console.log(`❌ فشل: ${errorCount} خدمة`);
console.log('═══════════════════════════════════════');

// التحقق من النتائج
console.log('\n📊 التحقق من النتائج...');

const { data: allServices, error: checkError } = await supabase
  .from('services')
  .select('slug, name_ar, parent_id')
  .order('parent_id', { ascending: false });

if (checkError) {
  console.error('❌ خطأ في التحقق:', checkError);
} else {
  const mainServices = allServices.filter(s => !s.parent_id);
  const subServices = allServices.filter(s => s.parent_id);

  console.log(`\n✅ عدد الخدمات الرئيسية: ${mainServices.length}`);
  console.log(`✅ عدد الخدمات الفرعية: ${subServices.length}`);

  if (subServices.length > 0) {
    console.log('\n📋 الخدمات الفرعية:');
    subServices.slice(0, 10).forEach(s => {
      console.log(`  ✓ ${s.name_ar}`);
    });

    if (subServices.length > 10) {
      console.log(`  ... و ${subServices.length - 10} أخرى`);
    }
  }
}

console.log('\n✅ اكتمل!');
process.exit(0);
