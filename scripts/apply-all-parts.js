import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyAllParts() {
  console.log('🚀 بدء تطبيق جميع أجزاء SQL...\n');

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.startsWith('import_part_') && f.endsWith('.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  console.log(`📁 عدد الأجزاء: ${files.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const partNumber = parseInt(file.match(/\d+/)[0]);

    console.log(`\n📝 [${i + 1}/${files.length}] تطبيق ${file}...`);

    try {
      const sqlContent = readFileSync(join(migrationsDir, file), 'utf8');

      // استخدام execute_sql لتطبيق SQL
      const { error } = await supabase.rpc('exec', { sql: sqlContent }).catch(async (rpcError) => {
        // إذا لم تعمل rpc، استخدم postgREST مباشرة
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ sql: sqlContent })
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        return { error: null };
      });

      if (error) {
        console.error(`  ❌ خطأ: ${error.message?.substring(0, 100)}`);
        errorCount++;
      } else {
        console.log(`  ✅ نجح`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ خطأ غير متوقع: ${err.message?.substring(0, 100)}`);
      errorCount++;
    }

    // انتظر قليلاً بين كل طلب
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log(`✅ نجح: ${successCount} جزء`);
  console.log(`❌ فشل: ${errorCount} جزء`);
  console.log('═══════════════════════════════════════');

  // التحقق من النتائج
  console.log('\n📊 التحقق من النتائج...');

  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('slug, name_ar')
    .not('parent_id', 'is', null);

  if (servicesError) {
    console.error('❌ خطأ في التحقق:', servicesError);
  } else {
    console.log(`\n✅ عدد الخدمات الفرعية المطبقة: ${services.length}`);
  }

  if (errorCount === 0) {
    console.log('\n🎉 تم التطبيق بنجاح على جميع الأجزاء!');
  } else if (errorCount < successCount) {
    console.log('\n⚠️  تم التطبيق مع بعض الأخطاء');
  } else {
    console.error('\n❌ فشل أغلب العمليات');
    process.exit(1);
  }
}

applyAllParts();
