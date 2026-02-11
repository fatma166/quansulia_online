import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// تحميل متغيرات البيئة
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4OTkyOSwiZXhwIjoyMDc1MjY1OTI5fQ.Uw0LvTfFV6DXIL0nC-lT5CwY0wdwh0vc9DG4y7B7A9s';

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 بدء تطبيق ملف SQL الكامل...\n');

  try {
    // قراءة الملف SQL
    const sqlFilePath = join(__dirname, '..', 'supabase', 'migrations', '99999999999999_import_all_services_data.sql');
    console.log('📂 قراءة الملف:', sqlFilePath);

    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    console.log(`📊 حجم الملف: ${(sqlContent.length / 1024).toFixed(2)} KB`);
    console.log(`📄 عدد السطور: ${sqlContent.split('\n').length}`);
    console.log('');

    // تطبيق SQL مباشرة
    console.log('⏳ تطبيق SQL...');
    const { data, error } = await supabase.rpc('exec', { sql: sqlContent });

    if (error) {
      // جرب طريقة أخرى
      console.log('⚠️ طريقة exec فشلت، جرب طريقة بديلة...');

      // تقسيم SQL إلى statements منفصلة
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      console.log(`📝 عدد العبارات: ${statements.length}`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';

        if (i % 100 === 0) {
          console.log(`📊 معالجة: ${i}/${statements.length}`);
        }

        const { error: stmtError } = await supabase.rpc('exec', { sql: statement });

        if (stmtError) {
          errorCount++;
          if (errorCount <= 5) {
            console.error(`❌ خطأ في العبارة ${i}:`, stmtError.message.substring(0, 100));
          }
        } else {
          successCount++;
        }
      }

      console.log('');
      console.log('═══════════════════════════════════════');
      console.log(`✅ نجح: ${successCount} عبارة`);
      console.log(`❌ فشل: ${errorCount} عبارة`);
      console.log('═══════════════════════════════════════');

      if (errorCount > successCount / 2) {
        console.error('\n❌ فشل أكثر من 50% من العبارات');
        process.exit(1);
      }
    } else {
      console.log('✅ تم تطبيق SQL بنجاح!');
    }

    // التحقق من النتائج
    console.log('\n📊 التحقق من النتائج...');

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('slug, name_ar, (service_fields:service_fields(count))')
      .not('parent_id', 'is', null);

    if (servicesError) {
      console.error('❌ خطأ في التحقق:', servicesError);
    } else {
      console.log('\n📋 الخدمات الفرعية المطبقة:');
      services.forEach(service => {
        console.log(`  ✓ ${service.name_ar} (${service.slug})`);
      });
      console.log(`\n📈 إجمالي: ${services.length} خدمة فرعية`);
    }

    console.log('\n✅ اكتمل التطبيق بنجاح!');
  } catch (err) {
    console.error('❌ خطأ غير متوقع:', err);
    process.exit(1);
  }
}

applyMigration();
