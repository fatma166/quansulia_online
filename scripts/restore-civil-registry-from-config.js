import { createClient } from '@supabase/supabase-js';
import { civilRegistryConfig } from '../src/services/civilRegistry/config.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restoreCivilRegistryService() {
  try {
    console.log('Starting civil registry service restoration...');

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('slug', 'civil-registry')
      .maybeSingle();

    if (serviceError || !service) {
      console.error('Service not found:', serviceError);
      return;
    }

    const serviceId = service.id;
    console.log('Found service:', serviceId);

    console.log('\nStep 1: Deleting existing fields, requirements, and documents...');

    const { error: deleteFieldsError } = await supabase
      .from('service_fields')
      .delete()
      .eq('service_id', serviceId);

    if (deleteFieldsError) console.error('Error deleting fields:', deleteFieldsError);

    const { error: deleteRequirementsError } = await supabase
      .from('service_requirements')
      .delete()
      .eq('service_id', serviceId);

    if (deleteRequirementsError) console.error('Error deleting requirements:', deleteRequirementsError);

    const { error: deleteDocumentsError } = await supabase
      .from('service_documents')
      .delete()
      .eq('service_id', serviceId);

    if (deleteDocumentsError) console.error('Error deleting documents:', deleteDocumentsError);

    console.log('Deletion complete.');

    console.log('\nStep 2: Inserting service fields...');

    const fieldsToInsert = [];
    let orderIndex = 0;

    for (const step of civilRegistryConfig.steps) {
      for (const field of step.fields) {
        const fieldData = {
          service_id: serviceId,
          service_type_id: null,
          step_id: step.id,
          step_title_ar: step.title,
          step_title_en: step.title,
          field_name: field.name,
          field_type: field.type,
          label_ar: field.label,
          label_en: field.label,
          placeholder_ar: field.placeholder || null,
          placeholder_en: field.placeholder || null,
          help_text_ar: field.help || null,
          help_text_en: field.help || null,
          is_required: field.required || false,
          validation_rules: field.validation || {},
          options: field.options || [],
          default_value: field.defaultValue || null,
          order_index: orderIndex++,
          is_active: true,
          conditions: field.conditional ? JSON.stringify(field.conditional) : null
        };

        fieldsToInsert.push(fieldData);
      }
    }

    console.log(`Inserting ${fieldsToInsert.length} fields...`);

    const { error: insertFieldsError } = await supabase
      .from('service_fields')
      .insert(fieldsToInsert);

    if (insertFieldsError) {
      console.error('Error inserting fields:', insertFieldsError);
      console.error('First field that failed:', JSON.stringify(fieldsToInsert[0], null, 2));
    } else {
      console.log(`Successfully inserted ${fieldsToInsert.length} fields`);
    }

    console.log('\nStep 3: Inserting service requirements...');

    const requirementsToInsert = [];
    let reqOrderIndex = 0;

    for (const [key, requirements] of Object.entries(civilRegistryConfig.requirements)) {
      for (const requirement of requirements) {
        requirementsToInsert.push({
          service_id: serviceId,
          service_type_id: null,
          requirement_ar: requirement,
          requirement_en: requirement,
          order_index: reqOrderIndex++,
          is_active: true,
          conditions: JSON.stringify({
            field: 'idType',
            values: [key.replace('national_id_', '')]
          })
        });
      }
    }

    console.log(`Inserting ${requirementsToInsert.length} requirements...`);

    const { error: insertRequirementsError } = await supabase
      .from('service_requirements')
      .insert(requirementsToInsert);

    if (insertRequirementsError) {
      console.error('Error inserting requirements:', insertRequirementsError);
    } else {
      console.log(`Successfully inserted ${requirementsToInsert.length} requirements`);
    }

    console.log('\nStep 4: Inserting service documents...');

    const documentsToInsert = [];
    let docOrderIndex = 0;

    for (const [key, requirements] of Object.entries(civilRegistryConfig.requirements)) {
      for (const requirement of requirements) {
        documentsToInsert.push({
          service_id: serviceId,
          service_type_id: null,
          document_name_ar: requirement,
          document_name_en: requirement,
          description_ar: null,
          description_en: null,
          is_required: true,
          max_size_mb: 5,
          accepted_formats: ['pdf', 'jpg', 'jpeg', 'png'],
          order_index: docOrderIndex++,
          is_active: true,
          conditions: JSON.stringify({
            field: 'idType',
            values: [key.replace('national_id_', '')]
          })
        });
      }
    }

    console.log(`Inserting ${documentsToInsert.length} documents...`);

    const { error: insertDocumentsError } = await supabase
      .from('service_documents')
      .insert(documentsToInsert);

    if (insertDocumentsError) {
      console.error('Error inserting documents:', insertDocumentsError);
    } else {
      console.log(`Successfully inserted ${documentsToInsert.length} documents`);
    }

    console.log('\n✓ Civil registry service restoration complete!');

    console.log('\nVerifying restoration...');
    const { count: fieldCount } = await supabase
      .from('service_fields')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId);

    const { count: requirementCount } = await supabase
      .from('service_requirements')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId);

    const { count: documentCount } = await supabase
      .from('service_documents')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId);

    console.log(`\nFinal counts:`);
    console.log(`  Fields: ${fieldCount}`);
    console.log(`  Requirements: ${requirementCount}`);
    console.log(`  Documents: ${documentCount}`);

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

restoreCivilRegistryService();
