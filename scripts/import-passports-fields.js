import { createClient } from '@supabase/supabase-js';
import { passportsConfig } from '../src/services/passports/config.js';

const supabaseUrl = 'https://qaioxhpcyzmamcvdqqub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODk5MjksImV4cCI6MjA3NTI2NTkyOX0.ONSoZu18CxounMDqf0byUuD6pRhiGSrSJnT3dqoXCjQ';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPassportsFields() {
  try {
    console.log('🚀 Starting import of Passports service fields...\n');

    // 1. Find the passports service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('slug', 'passports')
      .maybeSingle();

    if (serviceError) {
      console.error('Error finding passports service:', serviceError);
      return;
    }

    if (!service) {
      console.error('❌ Passports service not found. Please create it first.');
      return;
    }

    console.log(`✅ Found passports service: ${service.id}\n`);

    // 2. Delete existing fields for this service
    const { error: deleteError } = await supabase
      .from('service_fields')
      .delete()
      .eq('service_id', service.id);

    if (deleteError) {
      console.error('Error deleting existing fields:', deleteError);
      return;
    }

    console.log('🗑️  Cleared existing fields\n');

    // 3. Convert and insert fields
    const allFields = [];
    let orderIndex = 0;

    for (const step of passportsConfig.steps) {
      console.log(`📋 Processing step: ${step.title}`);

      for (const field of step.fields) {
        const dbField = {
          service_id: service.id,
          step_id: step.id,
          step_title_ar: step.title,
          step_title_en: step.title, // You can add English translation later
          field_name: field.name,
          field_type: field.type,
          label_ar: field.label,
          label_en: field.label, // You can add English translation later
          placeholder_ar: field.placeholder || '',
          placeholder_en: '',
          help_text_ar: field.help || '',
          help_text_en: '',
          is_required: field.required || false,
          is_active: true,
          order_index: orderIndex++,
          validation_rules: field.validation || {},
          options: [],
          default_value: field.defaultValue || ''
        };

        // Handle options for select, radio, checkbox fields
        if (field.options) {
          dbField.options = field.options.map(opt => ({
            label_ar: opt.label,
            label_en: opt.label,
            value: opt.value
          }));
        }

        // Handle dynamic list fields (nested fields)
        if (field.type === 'dynamic-list' && field.fields) {
          dbField.validation_rules = {
            ...dbField.validation_rules,
            dynamicFields: field.fields.map(subField => ({
              name: subField.name,
              label: subField.label,
              type: subField.type,
              required: subField.required,
              options: subField.options
            })),
            buttonText: field.buttonText
          };
        }

        // Handle conditional logic - will be added to conditions table later
        if (field.conditional) {
          dbField.validation_rules = {
            ...dbField.validation_rules,
            conditional: field.conditional
          };
        }

        allFields.push(dbField);
        console.log(`  ✓ ${field.name} (${field.type})`);
      }
      console.log('');
    }

    // 4. Insert all fields
    const { data: insertedFields, error: insertError } = await supabase
      .from('service_fields')
      .insert(allFields)
      .select();

    if (insertError) {
      console.error('❌ Error inserting fields:', insertError);
      return;
    }

    console.log(`\n🎉 Successfully imported ${insertedFields.length} fields!`);
    console.log('\n📊 Summary:');
    console.log(`   - Total fields: ${insertedFields.length}`);
    console.log(`   - Steps: ${passportsConfig.steps.length}`);
    console.log(`   - Service ID: ${service.id}`);
    console.log('\n✅ Done! You can now edit these fields in the Form Builder.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

importPassportsFields();
