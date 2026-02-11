import { readFileSync } from 'fs';

const sqlContent = readFileSync('supabase/migrations/99999999999998_restore_civil_registry_service.sql', 'utf8');

console.log('SQL Content Length:', sqlContent.length);
console.log('First 500 chars:', sqlContent.substring(0, 500));

process.stdout.write(sqlContent);
