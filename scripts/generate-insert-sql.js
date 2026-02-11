import { passportsConfig } from '../src/services/passports/config.js';

function generateInsertSQL() {
  const serviceId = '07259b33-5364-4e5c-8162-8421813dfb1b';
  const fields = [];
  let orderIndex = 0;

  for (const step of passportsConfig.steps) {
    for (const field of step.fields) {
      const dbField = {
        service_id: serviceId,
        step_id: step.id,
        step_title_ar: step.title,
        step_title_en: step.title,
        field_name: field.name,
        field_type: field.type,
        label_ar: field.label.replace(/'/g, "''"),
        label_en: field.label.replace(/'/g, "''"),
        placeholder_ar: (field.placeholder || '').replace(/'/g, "''"),
        placeholder_en: '',
        help_text_ar: (field.help || '').replace(/'/g, "''"),
        help_text_en: '',
        is_required: field.required || false,
        is_active: true,
        order_index: orderIndex++,
        validation_rules: field.validation || {},
        options: [],
        default_value: field.defaultValue || ''
      };

      // Handle options
      if (field.options) {
        dbField.options = field.options.map(opt => ({
          label_ar: opt.label,
          label_en: opt.label,
          value: opt.value
        }));
      }

      // Handle dynamic list fields
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

      // Handle conditional logic
      if (field.conditional) {
        dbField.validation_rules = {
          ...dbField.validation_rules,
          conditional: field.conditional
        };
      }

      fields.push(dbField);
    }
  }

  console.log('-- Delete existing fields');
  console.log(`DELETE FROM service_fields WHERE service_id = '${serviceId}';`);
  console.log('');

  console.log('-- Insert fields');
  for (const field of fields) {
    const sql = `INSERT INTO service_fields (
  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,
  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,
  is_required, is_active, order_index, validation_rules, options, default_value
) VALUES (
  '${field.service_id}',
  '${field.step_id}',
  '${field.step_title_ar}',
  '${field.step_title_en}',
  '${field.field_name}',
  '${field.field_type}',
  '${field.label_ar}',
  '${field.label_en}',
  '${field.placeholder_ar}',
  '${field.placeholder_en}',
  '${field.help_text_ar}',
  '${field.help_text_en}',
  ${field.is_required},
  ${field.is_active},
  ${field.order_index},
  '${JSON.stringify(field.validation_rules).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(field.options).replace(/'/g, "''")}'::jsonb,
  '${field.default_value}'
);`;
    console.log(sql);
    console.log('');
  }

  console.log(`-- Total: ${fields.length} fields`);
}

generateInsertSQL();
