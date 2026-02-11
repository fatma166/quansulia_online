const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function executeSQL(sql) {
  // استخدام fetch API للوصول المباشر إلى Postgres
  const { data, error } = await supabase.rpc('query', { query_text: sql }).catch(err => {
    // إذا لم تنجح، جرب execute مباشرة
    return { data: null, error: err };
  });

  if (error) {
    throw error;
  }

  return data;
}

async function main() {
  try {
    console.log('🚀 بدء تطبيق SQL للخدمات...\n');

    // قراءة الملف الكامل
    const sqlFile = '/tmp/cc-agent/55287979/project/supabase/migrations/99999999999999_import_all_services_data.sql';
    const fullSQL = fs.readFileSync(sqlFile, 'utf8');

    console.log(`📄 حجم الملف: ${(fullSQL.length / 1024).toFixed(2)} KB`);
    console.log(`📝 عدد الأسطر: ${fullSQL.split('\n').length}`);

    // تقسيم حسب الخدمات
    const serviceSections = fullSQL.split('-- ========================================');
    console.log(`\n📦 عدد الأقسام: ${serviceSections.length}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < serviceSections.length; i++) {
      const section = serviceSections[i].trim();
      if (!section || section.length < 50) continue;

      // استخراج اسم الخدمة
      const lines = section.split('\n');
      const serviceNameLine = lines[0];
      let serviceName = serviceNameLine.replace(/^--\s*/, '').replace('خدمة:', '').trim();

      if (!serviceName || serviceName.includes('/*')) {
        serviceName = `قسم ${i}`;
      }

      console.log(`\n[${i}/${serviceSections.length}] 🔄 تطبيق: ${serviceName}`);

      try {
        // تنفيذ SQL مباشرة
        const { error } = await supabase.rpc('exec', {
          query: section
        }).catch(async () => {
          // محاولة بديلة باستخدام pg_temp
          const { data, error } = await supabase.from('_supabase_internal').select('*').limit(0);
          if (error) throw error;

          // تنفيذ عبر REST API مباشرة
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ query: section })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }

          return await response.json();
        });

        console.log(`   ✅ نجح`);
        successCount++;

      } catch (err) {
        console.error(`   ❌ فشل: ${err.message}`);
        errorCount++;

        // حفظ الخطأ في ملف
        const errorLog = `/tmp/error_service_${i}.log`;
        fs.writeFileSync(errorLog, `Service: ${serviceName}\nError: ${err.message}\n\nSQL:\n${section}`);
        console.log(`   📝 تم حفظ تفاصيل الخطأ في: ${errorLog}`);
      }
    }

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 النتيجة النهائية:`);
    console.log(`   ✅ نجح: ${successCount}`);
    console.log(`   ❌ فشل: ${errorCount}`);
    console.log(`   📈 المجموع: ${successCount + errorCount}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(errorCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ خطأ عام:', error);
    process.exit(1);
  }
}

main();
