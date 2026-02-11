#!/usr/bin/env node

/**
 * سكريبت شامل لاستنساخ جميع بيانات الخدمات من ملفات config.js إلى قاعدة البيانات
 * يشمل: المتطلبات، الحقول، القواعد الشرطية، المرفقات، وكل التفاصيل
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// تحميل متغيرات البيئة
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات Supabase غير موجودة في .env');
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
  { path: '../src/services/poa/general/config.js', name: 'generalPoaConfig' },
  { path: '../src/services/poa/educational/config.js', name: 'educationalPoaConfig' },
  { path: '../src/services/poa/realEstate/config.js', name: 'realEstatePoaConfig' },
  { path: '../src/services/poa/vehicles/config.js', name: 'vehiclesPoaConfig' },
  { path: '../src/services/poa/companies/config.js', name: 'companiesPoaConfig' },
  { path: '../src/services/poa/courts/config.js', name: 'courtsPoaConfig' },
  { path: '../src/services/poa/inheritance/config.js', name: 'inheritancePoaConfig' },
  { path: '../src/services/poa/marriageDivorce/config.js', name: 'marriageDivorcePoaConfig' },
  { path: '../src/services/poa/birthCertificates/config.js', name: 'birthCertificatesPoaConfig' },
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
 * تحويل المتطلبات من config إلى صيغة قاعدة البيانات
 */
function extractRequirements(config, serviceId) {
  const requirements = [];
  let order = 0;

  if (config.requirements) {
    // إذا كانت المتطلبات عبارة عن قائمة بسيطة
    if (Array.isArray(config.requirements)) {
      config.requirements.forEach(req => {
        requirements.push({
          service_id: serviceId,
          requirement_ar: req,
          requirement_en: null,
          order_index: order++,
          is_active: true,
          conditions: {}
        });
      });
    }
    // إذا كانت المتطلبات عبارة عن object بأنواع مختلفة
    else if (typeof config.requirements === 'object') {
      Object.entries(config.requirements).forEach(([key, reqs]) => {
        if (Array.isArray(reqs)) {
          reqs.forEach(req => {
            const conditions = key !== 'common' ? { type: key } : {};
            requirements.push({
              service_id: serviceId,
              requirement_ar: req,
              requirement_en: null,
              order_index: order++,
              is_active: true,
              conditions
            });
          });
        }
      });
    }
  }

  return requirements;
}

/**
 * تحويل الحقول من config إلى صيغة قاعدة البيانات
 */
function extractFields(config, serviceId) {
  const fields = [];

  if (!config.steps || !Array.isArray(config.steps)) {
    return fields;
  }

  config.steps.forEach(step => {
    if (!step.fields || !Array.isArray(step.fields)) {
      return;
    }

    step.fields.forEach((field, index) => {
      const fieldData = {
        service_id: serviceId,
        step_id: step.id,
        step_title_ar: step.title,
        step_title_en: step.titleEn || null,
        field_name: field.name,
        field_type: field.type,
        label_ar: field.label,
        label_en: field.labelEn || field.label_en || null,
        placeholder_ar: field.placeholder || null,
        placeholder_en: field.placeholderEn || null,
        help_text_ar: field.help || null,
        help_text_en: field.helpEn || null,
        default_value: field.defaultValue || field.default || null,
        is_required: field.required || false,
        validation_rules: field.validation || {},
        options: field.options || [],
        order_index: index,
        is_active: true,
        conditions: field.conditional || {}
      };

      fields.push(fieldData);
    });
  });

  return fields;
}

/**
 * تحويل المرفقات (Documents) من config إلى صيغة قاعدة البيانات
 */
function extractDocuments(config, serviceId) {
  const documents = [];

  if (!config.steps || !Array.isArray(config.steps)) {
    return documents;
  }

  config.steps.forEach(step => {
    if (!step.fields || !Array.isArray(step.fields)) {
      return;
    }

    step.fields.forEach((field, index) => {
      // فقط الحقول من نوع file
      if (field.type === 'file') {
        const docData = {
          service_id: serviceId,
          document_name_ar: field.label,
          document_name_en: field.labelEn || field.label_en || null,
          description_ar: field.help || null,
          description_en: field.helpEn || null,
          is_required: field.required || false,
          max_size_mb: field.maxSize ? parseInt(field.maxSize) : 5,
          accepted_formats: field.accept ? field.accept.split(',').map(f => f.trim().replace('.', '')) : ['pdf', 'jpg', 'jpeg', 'png'],
          order_index: index,
          is_active: true,
          conditions: field.conditional || {}
        };

        documents.push(docData);
      }
    });
  });

  return documents;
}

/**
 * استخراج حقول dynamic-list
 */
function extractDynamicListFields(fields, serviceId) {
  const dynamicFields = [];

  fields.forEach(field => {
    if (field.field_type === 'dynamic-list' && field.fields) {
      field.fields.forEach((subField, index) => {
        dynamicFields.push({
          parent_field_name: field.field_name,
          field_name: subField.name,
          label_ar: subField.label,
          label_en: subField.labelEn || subField.label_en || null,
          field_type: subField.type,
          is_required: subField.required || false,
          order_index: index,
          validation_rules: subField.validation || {},
          options: subField.options || []
        });
      });
    }
  });

  return dynamicFields;
}

/**
 * معالجة خدمة واحدة واستيراد بياناتها
 */
async function importService(config, configName) {
  try {
    console.log(`\n📦 معالجة خدمة: ${config.title || config.id}`);

    // 1. إدراج أو تحديث الخدمة الرئيسية
    const serviceData = {
      name_ar: config.title,
      name_en: config.titleEn || null,
      slug: config.id,
      description_ar: config.description || null,
      description_en: config.descriptionEn || null,
      icon: config.icon || null,
      category: config.category || 'general',
      fees: config.fees ? JSON.stringify(config.fees) : null,
      duration: config.duration || null,
      is_active: true,
      config: {
        process: config.process || [],
        hasSubcategories: config.hasSubcategories || false,
        subcategories: config.subcategories || []
      }
    };

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .upsert(serviceData, { onConflict: 'slug' })
      .select()
      .single();

    if (serviceError) {
      console.error(`❌ خطأ في إدراج الخدمة:`, serviceError);
      return;
    }

    console.log(`✅ تم إدراج/تحديث الخدمة: ${service.name_ar}`);

    // 2. حذف البيانات القديمة للخدمة
    await supabase.from('service_requirements').delete().eq('service_id', service.id);
    await supabase.from('service_documents').delete().eq('service_id', service.id);

    // حذف dynamic list fields أولاً
    const { data: oldFields } = await supabase
      .from('service_fields')
      .select('id')
      .eq('service_id', service.id);

    if (oldFields && oldFields.length > 0) {
      const oldFieldIds = oldFields.map(f => f.id);
      await supabase.from('service_dynamic_list_fields').delete().in('parent_field_id', oldFieldIds);
    }

    await supabase.from('service_fields').delete().eq('service_id', service.id);

    // 3. إدراج المتطلبات
    const requirements = extractRequirements(config, service.id);
    if (requirements.length > 0) {
      const { error: reqError } = await supabase
        .from('service_requirements')
        .insert(requirements);

      if (reqError) {
        console.error(`❌ خطأ في إدراج المتطلبات:`, reqError);
      } else {
        console.log(`✅ تم إدراج ${requirements.length} متطلب`);
      }
    }

    // 4. إدراج الحقول
    const fields = extractFields(config, service.id);
    if (fields.length > 0) {
      const { data: insertedFields, error: fieldsError } = await supabase
        .from('service_fields')
        .insert(fields)
        .select();

      if (fieldsError) {
        console.error(`❌ خطأ في إدراج الحقول:`, fieldsError);
      } else {
        console.log(`✅ تم إدراج ${insertedFields.length} حقل`);

        // 5. إدراج حقول dynamic-list
        const dynamicFields = [];

        // ربط الحقول الفرعية بحقول dynamic-list
        config.steps?.forEach(step => {
          step.fields?.forEach(field => {
            if (field.type === 'dynamic-list' && field.fields) {
              const parentField = insertedFields.find(f => f.field_name === field.name);
              if (parentField) {
                field.fields.forEach((subField, index) => {
                  dynamicFields.push({
                    parent_field_id: parentField.id,
                    field_name: subField.name,
                    label_ar: subField.label,
                    label_en: subField.labelEn || subField.label_en || null,
                    field_type: subField.type,
                    is_required: subField.required || false,
                    order_index: index,
                    validation_rules: subField.validation || {},
                    options: subField.options || []
                  });
                });
              }
            }
          });
        });

        if (dynamicFields.length > 0) {
          const { error: dynamicError } = await supabase
            .from('service_dynamic_list_fields')
            .insert(dynamicFields);

          if (dynamicError) {
            console.error(`❌ خطأ في إدراج حقول dynamic-list:`, dynamicError);
          } else {
            console.log(`✅ تم إدراج ${dynamicFields.length} حقل dynamic-list`);
          }
        }
      }
    }

    // 6. إدراج المرفقات
    const documents = extractDocuments(config, service.id);
    if (documents.length > 0) {
      const { error: docsError } = await supabase
        .from('service_documents')
        .insert(documents);

      if (docsError) {
        console.error(`❌ خطأ في إدراج المرفقات:`, docsError);
      } else {
        console.log(`✅ تم إدراج ${documents.length} مرفق`);
      }
    }

    console.log(`✅ اكتمل استيراد خدمة: ${config.title || config.id}`);

  } catch (error) {
    console.error(`❌ خطأ في معالجة الخدمة ${configName}:`, error);
  }
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🚀 بدء استيراد جميع الخدمات إلى قاعدة البيانات...\n');

  let successCount = 0;
  let failCount = 0;

  for (const serviceFile of serviceFiles) {
    try {
      const configPath = join(__dirname, serviceFile.path);

      // التحقق من وجود الملف
      if (!fs.existsSync(configPath)) {
        console.log(`⚠️ الملف غير موجود: ${serviceFile.path}`);
        failCount++;
        continue;
      }

      // استيراد الملف
      const module = await import(configPath);
      const config = module.default || module[serviceFile.name];

      if (!config) {
        console.log(`⚠️ لم يتم العثور على التكوين في: ${serviceFile.path}`);
        failCount++;
        continue;
      }

      await importService(config, serviceFile.name);
      successCount++;

    } catch (error) {
      console.error(`❌ خطأ في معالجة ${serviceFile.path}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ النتائج النهائية:`);
  console.log(`   - نجح: ${successCount} خدمة`);
  console.log(`   - فشل: ${failCount} خدمة`);
  console.log(`   - الإجمالي: ${serviceFiles.length} خدمة`);
  console.log('='.repeat(60));
}

// تنفيذ السكريبت
main().catch(error => {
  console.error('❌ خطأ فادح:', error);
  process.exit(1);
});
