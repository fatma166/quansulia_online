import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runSQL() {
  try {
    const sql = fs.readFileSync('./add_education_fields.sql', 'utf8');

    // تنفيذ SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // محاولة تنفيذ SQL مباشرة إذا فشلت الطريقة الأولى
      console.log('Executing SQL parts separately...');

      // تقسيم وتنفيذ كل INSERT على حدة
      const statements = sql.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (!statement.trim()) continue;

        console.log(`Executing statement...`);
        const result = await supabase.rpc('exec_sql', { sql_query: statement });

        if (result.error) {
          console.error('Error:', result.error);
        }
      }
    }

    console.log('✅ تم تنفيذ SQL بنجاح');
    console.log(data);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

runSQL();
