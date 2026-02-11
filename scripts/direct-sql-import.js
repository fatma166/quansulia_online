import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4OTkyOSwiZXhwIjoyMDc1MjY1OTI5fQ.Uw0LvTfFV6DXIL0nC-lT5CwY0wdwh0vc9DG4y7B7A9s';

console.log('🚀 تطبيق SQL مباشرة على قاعدة البيانات...\n');

const sqlContent = readFileSync(
  join(__dirname, '..', 'supabase', 'migrations', '99999999999999_import_all_services_data.sql'),
  'utf8'
);

console.log(`📊 حجم الملف: ${(sqlContent.length / 1024).toFixed(2)} KB`);
console.log(`📄 عدد السطور: ${sqlContent.split('\n').length}\n`);

// استخدام Postgres REST API مباشرة
const postgrestUrl = supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '.supabase.co');

console.log('⏳ جارٍ التطبيق...\n');

fetch(`${postgrestUrl}/rest/v1/rpc`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({
    query: sqlContent
  })
}).then(async (response) => {
  if (response.ok) {
    console.log('✅ تم التطبيق بنجاح!\n');

    // التحقق من النتائج
    const checkResponse = await fetch(
      `${postgrestUrl}/rest/v1/services?select=slug,name_ar&parent_id=not.is.null`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    );

    const services = await checkResponse.json();
    console.log(`📊 عدد الخدمات الفرعية: ${services.length}`);
    services.forEach(s => console.log(`  ✓ ${s.name_ar}`));
  } else {
    const error = await response.text();
    console.error('❌ فشل التطبيق:', error.substring(0, 500));
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
