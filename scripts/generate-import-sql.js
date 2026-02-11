#!/usr/bin/env node

/**
 * سكريبت لتوليد SQL statements لاستيراد جميع الخدمات
 * يولد ملف SQL يمكن تنفيذه كـ migration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// قائمة جميع ملفات الخدمات
const serviceFiles = [
  { path: '../src/services/passports/config.js', name: 'passportsConfig' },
  { path: '../src/services/declarations/config.js', name: 'declarationsConfig' },
  { path: '../src/services/declarations/regular/config.js', name: 'regularDeclarationsConfig' },
  { path: '../src/services/declarations/sworn/config.js', name: 'swornDeclarationsConfig' },
  { path: '../src/services/powerOfAttorney/config.js', name: 'powerOfAttorneyConfig' },
  { path: '../src/services/attestations/config.js', name: 'attestationsConfig' },
  { path: '../src/services/endorsements/config.js', name: 'endorsementsConfig' },
  { path: '../src/services/civilRegistry/config.js', name: 'civilRegistryConfig' },
  { path: '../src/services/familyAffairs/config.js', name: 'familyAffairsConfig' },
  { path: '../src/services/visas/config.js', name: 'visasConfig' },
  { path: '../src/services/education/config.js', name: 'educationConfig' },
  { path: '../src/services/madhoonia/config.js', name: 'madhooniaConfig' },
  { path: '../src/services/bodyCovering/config.js', name: 'bodyCoveringConfig' },
  { path: '../src/services/khartoomBank/config.js', name: 'khartoomBankConfig' },
  { path: '../src/services/workAndPrisons/config.js', name: 'workAndPrisonsConfig' }
];

/**
 * تحويل قيمة إلى SQL string آمن
 */
function toSqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * توليد SQL لخدمة واحدة
 */
function generateServiceSQL(config) {
  const sqls = [];

  sqls.push(`-- ========================================`);
  sqls.push(`-- خدمة: ${config.title || config.id}`);
  sqls.push(`-- ========================================\n`);

  // 1. إدراج الخدمة الرئيسية
  const feesValue = config.fees ? toSqlValue(JSON.stringify(config.fees)) : 'NULL';
  const configValue = toSqlValue({
    process: config.process || [],
    hasSubcategories: config.hasSubcategories || false,
    subcategories: config.subcategories || []
  });

  sqls.push(`-- إدراج الخدمة`);
  sqls.push(`INSERT INTO services (
    name_ar, name_en, slug, description_ar, description_en,
    icon, category, fees, duration, is_active, config
  ) VALUES (
    ${toSqlValue(config.title)},
    ${toSqlValue(config.titleEn || null)},
    ${toSqlValue(config.id)},
    ${toSqlValue(config.description || null)},
    ${toSqlValue(config.descriptionEn || null)},
    ${toSqlValue(config.icon || null)},
    ${toSqlValue(config.category || 'general')},
    ${feesValue},
    ${toSqlValue(config.duration || null)},
    TRUE,
    ${configValue}
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar,
    fees = EXCLUDED.fees,
    duration = EXCLUDED.duration,
    config = EXCLUDED.config,
    updated_at = NOW();
\n`);

  // 2. حذف البيانات القديمة
  sqls.push(`-- حذف البيانات القديمة للخدمة`);
  sqls.push(`DO $$
DECLARE
  service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = ${toSqlValue(config.id)};

  IF service_uuid IS NOT NULL THEN
    DELETE FROM service_dynamic_list_fields
    WHERE parent_field_id IN (SELECT id FROM service_fields WHERE service_id = service_uuid);

    DELETE FROM service_requirements WHERE service_id = service_uuid;
    DELETE FROM service_documents WHERE service_id = service_uuid;
    DELETE FROM service_fields WHERE service_id = service_uuid;
  END IF;
END $$;
\n`);

  // 3. إدراج المتطلبات
  if (config.requirements) {
    const requirements = [];
    let order = 0;

    if (Array.isArray(config.requirements)) {
      config.requirements.forEach(req => {
        requirements.push({
          requirement_ar: req,
          order_index: order++,
          conditions: {}
        });
      });
    } else if (typeof config.requirements === 'object') {
      Object.entries(config.requirements).forEach(([key, reqs]) => {
        if (Array.isArray(reqs)) {
          reqs.forEach(req => {
            const conditions = key !== 'common' ? { type: key } : {};
            requirements.push({
              requirement_ar: req,
              order_index: order++,
              conditions
            });
          });
        }
      });
    }

    if (requirements.length > 0) {
      sqls.push(`-- إدراج المتطلبات`);
      sqls.push(`INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, is_active, conditions)`);
      sqls.push(`SELECT id, * FROM services, (VALUES`);

      const reqValues = requirements.map(req =>
        `  (${toSqlValue(req.requirement_ar)}, NULL, ${req.order_index}, TRUE, ${toSqlValue(req.conditions)})`
      );

      sqls.push(reqValues.join(',\n'));
      sqls.push(`) AS req(requirement_ar, requirement_en, order_index, is_active, conditions)`);
      sqls.push(`WHERE services.slug = ${toSqlValue(config.id)};\n`);
    }
  }

  // 4. إدراج الحقول
  if (config.steps && Array.isArray(config.steps)) {
    const allFields = [];
    const dynamicListInfo = {};

    config.steps.forEach(step => {
      if (!step.fields || !Array.isArray(step.fields)) return;

      step.fields.forEach((field, index) => {
        allFields.push({
          step_id: step.id,
          step_title_ar: step.title,
          field_name: field.name,
          field_type: field.type,
          label_ar: field.label,
          is_required: field.required || false,
          validation_rules: field.validation || {},
          options: field.options || [],
          order_index: index,
          conditions: field.conditional || {},
          help_text_ar: field.help || null
        });

        // حفظ معلومات dynamic-list
        if (field.type === 'dynamic-list' && field.fields) {
          dynamicListInfo[field.name] = field.fields;
        }
      });
    });

    if (allFields.length > 0) {
      sqls.push(`-- إدراج الحقول`);
      sqls.push(`INSERT INTO service_fields (`);
      sqls.push(`  service_id, step_id, step_title_ar, step_title_en, field_name, field_type,`);
      sqls.push(`  label_ar, label_en, placeholder_ar, placeholder_en, help_text_ar, help_text_en,`);
      sqls.push(`  default_value, is_required, validation_rules, options, order_index, is_active, conditions`);
      sqls.push(`)`);
      sqls.push(`SELECT id, * FROM services, (VALUES`);

      const fieldValues = allFields.map(f =>
        `  (${toSqlValue(f.step_id)}, ${toSqlValue(f.step_title_ar)}, NULL, ${toSqlValue(f.field_name)}, ${toSqlValue(f.field_type)},
   ${toSqlValue(f.label_ar)}, NULL, NULL, NULL, ${toSqlValue(f.help_text_ar)}, NULL, NULL,
   ${f.is_required}, ${toSqlValue(f.validation_rules)}, ${toSqlValue(f.options)}, ${f.order_index}, TRUE, ${toSqlValue(f.conditions)})`
      );

      sqls.push(fieldValues.join(',\n'));
      sqls.push(`) AS fld(`);
      sqls.push(`  step_id, step_title_ar, step_title_en, field_name, field_type, label_ar, label_en,`);
      sqls.push(`  placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,`);
      sqls.push(`  is_required, validation_rules, options, order_index, is_active, conditions`);
      sqls.push(`)`);
      sqls.push(`WHERE services.slug = ${toSqlValue(config.id)};\n`);

      // إدراج حقول dynamic-list
      if (Object.keys(dynamicListInfo).length > 0) {
        sqls.push(`-- إدراج حقول dynamic-list`);

        for (const [parentName, subFields] of Object.entries(dynamicListInfo)) {
          sqls.push(`INSERT INTO service_dynamic_list_fields (`);
          sqls.push(`  parent_field_id, field_name, label_ar, label_en, field_type,`);
          sqls.push(`  is_required, order_index, validation_rules, options`);
          sqls.push(`)`);
          sqls.push(`SELECT sf.id, * FROM service_fields sf, (VALUES`);

          const dynamicValues = subFields.map((sub, idx) =>
            `  (${toSqlValue(sub.name)}, ${toSqlValue(sub.label)}, NULL, ${toSqlValue(sub.type)},
   ${sub.required || false}, ${idx}, ${toSqlValue(sub.validation || {})}, ${toSqlValue(sub.options || [])})`
          );

          sqls.push(dynamicValues.join(',\n'));
          sqls.push(`) AS dlf(field_name, label_ar, label_en, field_type, is_required, order_index, validation_rules, options)`);
          sqls.push(`WHERE sf.field_name = ${toSqlValue(parentName)}`);
          sqls.push(`  AND sf.service_id = (SELECT id FROM services WHERE slug = ${toSqlValue(config.id)});\n`);
        }
      }
    }
  }

  // 5. إدراج المرفقات
  if (config.steps && Array.isArray(config.steps)) {
    const documents = [];

    config.steps.forEach(step => {
      if (!step.fields || !Array.isArray(step.fields)) return;

      step.fields.forEach((field, index) => {
        if (field.type === 'file') {
          // استخراج حجم الملف من maxSize
          let maxSizeMb = 5;
          if (field.maxSize) {
            const sizeStr = String(field.maxSize).toUpperCase();
            if (sizeStr.includes('MB')) {
              maxSizeMb = parseInt(sizeStr.replace('MB', ''));
            } else {
              maxSizeMb = parseInt(sizeStr);
            }
          }

          // تحويل الشروط إلى تنسيق show_when
          let conditions = {};
          if (field.conditional) {
            if (Array.isArray(field.conditional)) {
              // شروط معقدة مع AND/OR
              conditions = {
                show_when: field.conditional
              };
            } else if (typeof field.conditional === 'object' && field.conditional.field) {
              // شروط بسيطة - تحويلها إلى تنسيق show_when
              conditions = {
                show_when: [{
                  operator: 'OR',
                  conditions: [{
                    field: field.conditional.field,
                    operator: 'equals',
                    value: field.conditional.values
                  }]
                }]
              };
            }
          }

          documents.push({
            document_name_ar: field.label,
            is_required: field.required || false,
            max_size_mb: maxSizeMb,
            accepted_formats: field.accept ? field.accept.split(',').map(f => f.trim().replace('.', '')) : ['pdf', 'jpg', 'jpeg', 'png'],
            order_index: index,
            conditions,
            description_ar: field.help || null
          });
        }
      });
    });

    if (documents.length > 0) {
      sqls.push(`-- إدراج المرفقات`);
      sqls.push(`INSERT INTO service_documents (`);
      sqls.push(`  service_id, document_name_ar, document_name_en, description_ar, description_en,`);
      sqls.push(`  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions`);
      sqls.push(`)`);
      sqls.push(`SELECT id, * FROM services, (VALUES`);

      const docValues = documents.map(doc =>
        `  (${toSqlValue(doc.document_name_ar)}, NULL, ${toSqlValue(doc.description_ar)}, NULL,
   ${doc.is_required}, ${doc.max_size_mb}, ${toSqlValue(doc.accepted_formats)}, ${doc.order_index}, TRUE, ${toSqlValue(doc.conditions)})`
      );

      sqls.push(docValues.join(',\n'));
      sqls.push(`) AS doc(document_name_ar, document_name_en, description_ar, description_en,`);
      sqls.push(`  is_required, max_size_mb, accepted_formats, order_index, is_active, conditions)`);
      sqls.push(`WHERE services.slug = ${toSqlValue(config.id)};\n`);
    }
  }

  return sqls.join('\n');
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🚀 بدء توليد SQL...\n');

  const allSQL = [];
  allSQL.push(`/*`);
  allSQL.push(`  # استيراد جميع بيانات الخدمات إلى قاعدة البيانات`);
  allSQL.push(`  `);
  allSQL.push(`  1. الخدمات`);
  allSQL.push(`  2. المتطلبات`);
  allSQL.push(`  3. الحقول`);
  allSQL.push(`  4. حقول dynamic-list`);
  allSQL.push(`  5. المرفقات`);
  allSQL.push(`*/\n`);

  let processedCount = 0;

  for (const serviceFile of serviceFiles) {
    try {
      const configPath = join(__dirname, serviceFile.path);

      if (!fs.existsSync(configPath)) {
        console.log(`⚠️ تخطي: ${serviceFile.path}`);
        continue;
      }

      const module = await import(configPath);
      const config = module.default || module[serviceFile.name];

      if (!config) {
        console.log(`⚠️ تخطي: ${serviceFile.path}`);
        continue;
      }

      console.log(`✅ معالجة: ${config.title || config.id}`);
      const sql = generateServiceSQL(config);
      allSQL.push(sql);
      processedCount++;

    } catch (error) {
      console.error(`❌ خطأ في ${serviceFile.path}:`, error.message);
    }
  }

  // كتابة الملف
  const outputPath = join(__dirname, '../supabase/migrations/99999999999999_import_all_services_data.sql');
  fs.writeFileSync(outputPath, allSQL.join('\n'), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ تم توليد SQL بنجاح!`);
  console.log(`   - الخدمات المعالجة: ${processedCount}`);
  console.log(`   - الملف: supabase/migrations/99999999999999_import_all_services_data.sql`);
  console.log('='.repeat(60));
  console.log('\nلتطبيق البيانات، قم بتنفيذ الـ migration باستخدام Supabase');
}

main().catch(console.error);
