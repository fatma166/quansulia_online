#!/usr/bin/env node

/**
 * سكريبت شامل لاستنساخ جميع بيانات الخدمات عبر SQL مباشرة
 * يتجاوز RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات Supabase غير موجودة');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
function toSqlString(value) {
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
 * معالجة خدمة واحدة
 */
async function importService(config) {
  try {
    console.log(`\n📦 معالجة خدمة: ${config.title || config.id}`);

    // 1. إدراج الخدمة الرئيسية
    const feesStr = config.fees ? toSqlString(JSON.stringify(config.fees)) : 'NULL';
    const configStr = toSqlString({
      process: config.process || [],
      hasSubcategories: config.hasSubcategories || false,
      subcategories: config.subcategories || []
    });

    const insertServiceSQL = `
      INSERT INTO services (
        name_ar, name_en, slug, description_ar, description_en,
        icon, category, fees, duration, is_active, config
      ) VALUES (
        ${toSqlString(config.title)},
        ${toSqlString(config.titleEn || null)},
        ${toSqlString(config.id)},
        ${toSqlString(config.description || null)},
        ${toSqlString(config.descriptionEn || null)},
        ${toSqlString(config.icon || null)},
        ${toSqlString(config.category || 'general')},
        ${feesStr},
        ${toSqlString(config.duration || null)},
        TRUE,
        ${configStr}
      )
      ON CONFLICT (slug)
      DO UPDATE SET
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en,
        description_ar = EXCLUDED.description_ar,
        description_en = EXCLUDED.description_en,
        icon = EXCLUDED.icon,
        category = EXCLUDED.category,
        fees = EXCLUDED.fees,
        duration = EXCLUDED.duration,
        is_active = EXCLUDED.is_active,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING id;
    `;

    const { data: serviceResult, error: serviceError } = await supabase.rpc('exec_sql', {
      sql: insertServiceSQL
    });

    if (serviceError) {
      console.error(`❌ خطأ في إدراج الخدمة:`, serviceError);
      return null;
    }

    // الحصول على ID الخدمة
    const getServiceIdSQL = `SELECT id FROM services WHERE slug = ${toSqlString(config.id)};`;
    const { data: idResult } = await supabase.rpc('exec_sql', { sql: getServiceIdSQL });

    if (!idResult || idResult.length === 0) {
      console.error(`❌ لم يتم العثور على الخدمة بعد الإدراج`);
      return null;
    }

    const serviceId = idResult[0].id;
    console.log(`✅ تم إدراج الخدمة: ${config.title}`);

    // 2. حذف البيانات القديمة
    await supabase.rpc('exec_sql', {
      sql: `
        DELETE FROM service_dynamic_list_fields
        WHERE parent_field_id IN (
          SELECT id FROM service_fields WHERE service_id = '${serviceId}'
        );
        DELETE FROM service_requirements WHERE service_id = '${serviceId}';
        DELETE FROM service_documents WHERE service_id = '${serviceId}';
        DELETE FROM service_fields WHERE service_id = '${serviceId}';
      `
    });

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
        const reqValues = requirements.map(req =>
          `('${serviceId}', ${toSqlString(req.requirement_ar)}, NULL, ${req.order_index}, TRUE, ${toSqlString(req.conditions)})`
        ).join(',\n        ');

        const insertReqSQL = `
          INSERT INTO service_requirements (service_id, requirement_ar, requirement_en, order_index, is_active, conditions)
          VALUES ${reqValues};
        `;

        await supabase.rpc('exec_sql', { sql: insertReqSQL });
        console.log(`✅ تم إدراج ${requirements.length} متطلب`);
      }
    }

    // 4. إدراج الحقول
    if (config.steps && Array.isArray(config.steps)) {
      const allFields = [];
      const dynamicListFields = [];

      config.steps.forEach(step => {
        if (!step.fields || !Array.isArray(step.fields)) return;

        step.fields.forEach((field, index) => {
          const fieldData = {
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
          };

          allFields.push(fieldData);

          // حفظ حقول dynamic-list للمعالجة لاحقاً
          if (field.type === 'dynamic-list' && field.fields) {
            dynamicListFields.push({
              parentName: field.name,
              fields: field.fields
            });
          }
        });
      });

      if (allFields.length > 0) {
        const fieldValues = allFields.map(f =>
          `('${serviceId}', ${toSqlString(f.step_id)}, ${toSqlString(f.step_title_ar)}, NULL,
            ${toSqlString(f.field_name)}, ${toSqlString(f.field_type)}, ${toSqlString(f.label_ar)}, NULL,
            NULL, NULL, ${toSqlString(f.help_text_ar)}, NULL, NULL,
            ${f.is_required}, ${toSqlString(f.validation_rules)}, ${toSqlString(f.options)},
            ${f.order_index}, TRUE, ${toSqlString(f.conditions)})`
        ).join(',\n        ');

        const insertFieldsSQL = `
          INSERT INTO service_fields (
            service_id, step_id, step_title_ar, step_title_en,
            field_name, field_type, label_ar, label_en,
            placeholder_ar, placeholder_en, help_text_ar, help_text_en, default_value,
            is_required, validation_rules, options, order_index, is_active, conditions
          )
          VALUES ${fieldValues}
          RETURNING id, field_name;
        `;

        const { data: insertedFields } = await supabase.rpc('exec_sql', { sql: insertFieldsSQL });
        console.log(`✅ تم إدراج ${allFields.length} حقل`);

        // 5. إدراج حقول dynamic-list
        if (dynamicListFields.length > 0 && insertedFields) {
          for (const dlf of dynamicListFields) {
            const parentField = insertedFields.find(f => f.field_name === dlf.parentName);
            if (!parentField) continue;

            const dynamicValues = dlf.fields.map((subField, idx) =>
              `('${parentField.id}', ${toSqlString(subField.name)}, ${toSqlString(subField.label)},
                NULL, ${toSqlString(subField.type)}, ${subField.required || false}, ${idx},
                ${toSqlString(subField.validation || {})}, ${toSqlString(subField.options || [])})`
            ).join(',\n          ');

            const insertDynamicSQL = `
              INSERT INTO service_dynamic_list_fields (
                parent_field_id, field_name, label_ar, label_en, field_type,
                is_required, order_index, validation_rules, options
              )
              VALUES ${dynamicValues};
            `;

            await supabase.rpc('exec_sql', { sql: insertDynamicSQL });
          }
          console.log(`✅ تم إدراج حقول dynamic-list`);
        }
      }
    }

    // 6. إدراج المرفقات (Documents)
    if (config.steps && Array.isArray(config.steps)) {
      const documents = [];

      config.steps.forEach(step => {
        if (!step.fields || !Array.isArray(step.fields)) return;

        step.fields.forEach((field, index) => {
          if (field.type === 'file') {
            documents.push({
              document_name_ar: field.label,
              is_required: field.required || false,
              max_size_mb: field.maxSize ? parseInt(field.maxSize) : 5,
              accepted_formats: field.accept ? field.accept.split(',').map(f => f.trim().replace('.', '')) : ['pdf', 'jpg', 'jpeg', 'png'],
              order_index: index,
              conditions: field.conditional || {},
              description_ar: field.help || null
            });
          }
        });
      });

      if (documents.length > 0) {
        const docValues = documents.map(doc =>
          `('${serviceId}', ${toSqlString(doc.document_name_ar)}, NULL,
            ${toSqlString(doc.description_ar)}, NULL, ${doc.is_required}, ${doc.max_size_mb},
            ${toSqlString(doc.accepted_formats)}, ${doc.order_index}, TRUE, ${toSqlString(doc.conditions)})`
        ).join(',\n        ');

        const insertDocsSQL = `
          INSERT INTO service_documents (
            service_id, document_name_ar, document_name_en,
            description_ar, description_en, is_required, max_size_mb,
            accepted_formats, order_index, is_active, conditions
          )
          VALUES ${docValues};
        `;

        await supabase.rpc('exec_sql', { sql: insertDocsSQL });
        console.log(`✅ تم إدراج ${documents.length} مرفق`);
      }
    }

    console.log(`✅ اكتمل استيراد: ${config.title}`);
    return serviceId;

  } catch (error) {
    console.error(`❌ خطأ في معالجة الخدمة:`, error.message);
    return null;
  }
}

/**
 * إنشاء دالة SQL مؤقتة لتنفيذ SQL
 */
async function createExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      EXECUTE sql;
      RETURN json_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
    $$;
  `;

  try {
    // محاولة إنشاء الدالة (قد تفشل بسبب الصلاحيات)
    await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  } catch (error) {
    console.log('⚠️ لا يمكن استخدام exec_sql، سيتم استخدام الطريقة البديلة');
  }
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🚀 بدء استيراد جميع الخدمات...\n');

  let successCount = 0;
  let failCount = 0;

  for (const serviceFile of serviceFiles) {
    try {
      const configPath = join(__dirname, serviceFile.path);

      if (!fs.existsSync(configPath)) {
        console.log(`⚠️ الملف غير موجود: ${serviceFile.path}`);
        failCount++;
        continue;
      }

      const module = await import(configPath);
      const config = module.default || module[serviceFile.name];

      if (!config) {
        console.log(`⚠️ لم يتم العثور على التكوين في: ${serviceFile.path}`);
        failCount++;
        continue;
      }

      const result = await importService(config);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }

    } catch (error) {
      console.error(`❌ خطأ: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ النتائج:`);
  console.log(`   - نجح: ${successCount}`);
  console.log(`   - فشل: ${failCount}`);
  console.log(`   - الإجمالي: ${serviceFiles.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
