import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const sqlFile = process.argv[2] || 'supabase/migrations/99999999999998_restore_civil_registry_service.sql';

console.log(`Reading SQL file: ${sqlFile}`);
const sql = readFileSync(sqlFile, 'utf8');

console.log(`SQL file size: ${(sql.length / 1024).toFixed(2)} KB`);
console.log('Executing SQL...\n');

const escapedSql = sql.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
const query = `echo "${escapedSql}" | psql "${process.env.VITE_SUPABASE_URL.replace('https://', 'postgresql://postgres:').replace('.supabase.co', '.supabase.co:5432/postgres')}"`;

try {
  const result = execSync(query, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  console.log('✓ SQL executed successfully!');
  console.log(result);
} catch (error) {
  console.error('Error executing SQL:', error.message);
  console.error('This approach requires direct PostgreSQL access which may not be available.');
  console.error('\nTrying alternative approach with Supabase client...\n');

  import('./apply-civil-registry-direct.js');
}
