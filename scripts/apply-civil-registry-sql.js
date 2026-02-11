import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function applySqlMigration() {
  try {
    console.log('Reading SQL file...');
    const sql = readFileSync('supabase/migrations/99999999999998_restore_civil_registry_service.sql', 'utf8');

    console.log(`SQL file size: ${sql.length} characters`);
    console.log('Executing SQL migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }

    console.log('✓ Migration applied successfully!');
    console.log('Result:', data);

    console.log('\nVerifying restoration...');
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('slug', 'civil-registry')
      .maybeSingle();

    if (service) {
      const { count: fieldCount } = await supabase
        .from('service_fields')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', service.id);

      const { count: requirementCount } = await supabase
        .from('service_requirements')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', service.id);

      const { count: documentCount } = await supabase
        .from('service_documents')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', service.id);

      console.log(`\nFinal counts:`);
      console.log(`  Fields: ${fieldCount}`);
      console.log(`  Requirements: ${requirementCount}`);
      console.log(`  Documents: ${documentCount}`);
    }

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

applySqlMigration();
