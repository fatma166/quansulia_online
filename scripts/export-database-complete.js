import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const OUTPUT_DIR = './database_export';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// List of all tables to export
const TABLES = [
  // Core tables
  'regions',
  'categories',
  'subcategories',
  'services',
  'service_fields',
  'service_requirements',
  'service_documents',
  'applications',
  'status_history',

  // Staff system
  'staff',
  'staff_permissions',

  // Appointments & Shipping
  'appointment_settings',
  'closed_days',
  'appointments',
  'shipping_companies',
  'shipments',
  'tracking_updates',

  // Educational
  'educational_cards',

  // CMS
  'cms_sections',
  'cms_hero_slides',
  'cms_important_links',
  'cms_counters',
  'news',
  'events',
  'event_registrations',
  'breaking_news',
  'cms_announcements',
  'cms_maintenance',
  'cms_about_sudan',
  'contact_messages',

  // Pricing & Invoices
  'conditional_pricing_rules',
  'application_pricing',
  'invoices',

  // Chatbot
  'chatbot_qa',
  'chatbot_categories',

  // Settings
  'system_settings',

  // Notes & Templates
  'application_notes',
  'export_templates',

  // Additional Pages
  'additional_pages'
];

async function exportTable(tableName) {
  console.log(`📥 Exporting ${tableName}...`);

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  ${tableName} is empty`);
      return null;
    }

    console.log(`✅ ${tableName}: ${data.length} rows`);
    return { tableName, data };

  } catch (err) {
    console.error(`❌ Exception exporting ${tableName}:`, err.message);
    return null;
  }
}

function generateInsertSQL(tableData) {
  const { tableName, data } = tableData;

  if (!data || data.length === 0) return '';

  let sql = `\n-- =============================================\n`;
  sql += `-- Table: ${tableName}\n`;
  sql += `-- Rows: ${data.length}\n`;
  sql += `-- =============================================\n\n`;

  data.forEach(row => {
    const columns = Object.keys(row);
    const values = columns.map(col => {
      const val = row[col];

      if (val === null) return 'NULL';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return val;
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;

      // Escape single quotes in strings
      return `'${String(val).replace(/'/g, "''")}'`;
    });

    sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  });

  sql += `\n`;
  return sql;
}

async function exportAllTables() {
  console.log('🚀 Starting database export...\n');

  const results = [];

  // Export each table
  for (const table of TABLES) {
    const result = await exportTable(table);
    if (result) {
      results.push(result);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📝 Generating SQL file...');

  // Generate SQL file
  let fullSQL = `-- =============================================\n`;
  fullSQL += `-- Supabase Database Export\n`;
  fullSQL += `-- Generated: ${new Date().toISOString()}\n`;
  fullSQL += `-- Total Tables: ${results.length}\n`;
  fullSQL += `-- =============================================\n\n`;

  fullSQL += `-- Disable triggers during import\n`;
  fullSQL += `SET session_replication_role = 'replica';\n\n`;

  results.forEach(result => {
    fullSQL += generateInsertSQL(result);
  });

  fullSQL += `\n-- Re-enable triggers\n`;
  fullSQL += `SET session_replication_role = 'origin';\n`;

  // Save SQL file
  const sqlFilePath = path.join(OUTPUT_DIR, 'complete_data_export.sql');
  fs.writeFileSync(sqlFilePath, fullSQL);

  // Save JSON backup
  const jsonFilePath = path.join(OUTPUT_DIR, 'complete_data_export.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));

  console.log('\n✅ Export completed successfully!');
  console.log(`📄 SQL file: ${sqlFilePath}`);
  console.log(`📄 JSON file: ${jsonFilePath}`);
  console.log(`\n📊 Summary:`);
  results.forEach(r => {
    console.log(`   - ${r.tableName}: ${r.data.length} rows`);
  });
}

exportAllTables().catch(console.error);
