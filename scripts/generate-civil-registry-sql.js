import { civilRegistryConfig } from '../src/services/civilRegistry/config.js';
import { writeFileSync } from 'fs';

function escapeString(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function generateSQL() {
  let sql = `/*
  # Restore Civil Registry Service Data

  This migration restores all fields, requirements, and documents for the civil registry service
  from the complete configuration file.

  1. Deletes existing data
  2. Restores ${civilRegistryConfig.steps.reduce((sum, step) => sum + step.fields.length, 0)} service fields with conditional logic
  3. Restores service requirements for each service type
  4. Restores service documents for each service type
*/

-- Get the service ID
DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = 'civil-registry';

  -- Delete existing data
  DELETE FROM service_fields WHERE service_id = service_uuid;
  DELETE FROM service_requirements WHERE service_id = service_uuid;
  DELETE FROM service_documents WHERE service_id = service_uuid;

  -- Insert service fields
`;

  let orderIndex = 0;
  for (const step of civilRegistryConfig.steps) {
    for (const field of step.fields) {
      const conditions = field.conditional ? JSON.stringify(field.conditional).replace(/'/g, "''") : null;
      const validation = field.validation ? JSON.stringify(field.validation).replace(/'/g, "''") : '{}';
      const options = field.options ? JSON.stringify(field.options).replace(/'/g, "''") : '[]';

      sql += `  INSERT INTO service_fields (
    service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
    label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
    is_required, validation_rules, options, default_value, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    ${escapeString(step.id)},
    ${escapeString(step.title)},
    ${escapeString(step.title)},
    ${escapeString(field.name)},
    ${escapeString(field.type)},
    ${escapeString(field.label)},
    ${escapeString(field.label)},
    ${field.placeholder ? escapeString(field.placeholder) : 'NULL'},
    ${field.placeholder ? escapeString(field.placeholder) : 'NULL'},
    ${field.help ? escapeString(field.help) : 'NULL'},
    ${field.help ? escapeString(field.help) : 'NULL'},
    ${field.required ? 'true' : 'false'},
    '${validation}'::jsonb,
    '${options}'::jsonb,
    ${field.defaultValue ? escapeString(field.defaultValue) : 'NULL'},
    ${orderIndex++},
    true,
    ${conditions ? `'${conditions}'::jsonb` : 'NULL'}
  );

`;
    }
  }

  sql += `  -- Insert service requirements\n`;
  let reqOrderIndex = 0;
  for (const [key, requirements] of Object.entries(civilRegistryConfig.requirements)) {
    const serviceType = key.replace('national_id_', '');
    for (const requirement of requirements) {
      const condition = key.startsWith('national_id_')
        ? `'{"field": "idType", "values": ["${serviceType}"]}'`
        : `'{"field": "recordType", "values": ["${key}"]}'`;

      sql += `  INSERT INTO service_requirements (
    service_id, requirement_ar, requirement_en, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    ${escapeString(requirement)},
    ${escapeString(requirement)},
    ${reqOrderIndex++},
    true,
    ${condition}::jsonb
  );

`;
    }
  }

  sql += `  -- Insert service documents\n`;
  let docOrderIndex = 0;
  for (const [key, requirements] of Object.entries(civilRegistryConfig.requirements)) {
    const serviceType = key.replace('national_id_', '');
    for (const requirement of requirements) {
      const condition = key.startsWith('national_id_')
        ? `'{"field": "idType", "values": ["${serviceType}"]}'`
        : `'{"field": "recordType", "values": ["${key}"]}'`;

      sql += `  INSERT INTO service_documents (
    service_id, document_name_ar, document_name_en, is_required,
    max_size_mb, accepted_formats, order_index, is_active, conditions
  ) VALUES (
    service_uuid,
    ${escapeString(requirement)},
    ${escapeString(requirement)},
    true,
    5,
    '["pdf", "jpg", "jpeg", "png"]'::jsonb,
    ${docOrderIndex++},
    true,
    ${condition}::jsonb
  );

`;
    }
  }

  sql += `END $$;
`;

  return sql;
}

const sql = generateSQL();
writeFileSync('supabase/migrations/99999999999998_restore_civil_registry_service.sql', sql);
console.log('SQL migration file generated successfully!');
console.log(`File: supabase/migrations/99999999999998_restore_civil_registry_service.sql`);
