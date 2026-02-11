import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// استخدام service_role_key لتجاوز RLS
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  supabaseKey
);

// قائمة ملفات الكونفيج
const serviceConfigs = [
  { path: '../src/services/passports/config.js', slug: 'passports' },
  { path: '../src/services/powerOfAttorney/config.js', slug: 'power-of-attorney' },
  { path: '../src/services/attestations/config.js', slug: 'attestations' },
  { path: '../src/services/civilRegistry/config.js', slug: 'civil-registry' },
  { path: '../src/services/declarations/config.js', slug: 'declarations' },
  { path: '../src/services/endorsements/config.js', slug: 'endorsements' },
  { path: '../src/services/visas/config.js', slug: 'visas' },
  { path: '../src/services/education/config.js', slug: 'education' },
  { path: '../src/services/familyAffairs/config.js', slug: 'family-affairs' },
  { path: '../src/services/khartoomBank/config.js', slug: 'khartoum-bank' },
  { path: '../src/services/madhoonia/config.js', slug: 'madhoonia' },
  { path: '../src/services/workAndPrisons/config.js', slug: 'work-and-prisons' },
  { path: '../src/services/bodyCovering/config.js', slug: 'body-covering' }
];

// تحويل conditional إلى conditions
function convertConditionalToConditions(conditional) {
  if (!conditional) return null;

  // إذا كان array (مع AND/OR)
  if (Array.isArray(conditional)) {
    const showWhen = [];
    const logic = conditional[0]?.operator || 'AND';

    conditional.forEach(group => {
      if (group.conditions) {
        group.conditions.forEach(cond => {
          showWhen.push({
            field: cond.field,
            operator: 'equals',
            value: cond.values ? cond.values[0] : ''
          });
        });
      }
    });

    return { show_when: showWhen, logic };
  }

  // إذا كان object بسيط
  if (conditional.field && conditional.values) {
    return {
      show_when: conditional.values.map(val => ({
        field: conditional.field,
        operator: 'equals',
        value: val
      })),
      logic: 'OR'
    };
  }

  return null;
}

// معالجة متطلبات الخدمة
async function syncRequirements(serviceId, requirements) {
  if (!requirements) return;

  const reqList = [];

  // إذا كان requirements كائن (مثل passports)
  if (typeof requirements === 'object' && !Array.isArray(requirements)) {
    Object.entries(requirements).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach(req => {
          reqList.push({
            requirement_ar: req,
            requirement_en: req,
            conditions: key !== 'common' ? { category: key } : null
          });
        });
      }
    });
  }
  // إذا كان requirements مصفوفة
  else if (Array.isArray(requirements)) {
    requirements.forEach(req => {
      reqList.push({
        requirement_ar: req,
        requirement_en: req,
        conditions: null
      });
    });
  }

  // حذف المتطلبات القديمة
  await supabase.from('service_requirements').delete().eq('service_id', serviceId);

  // إدراج المتطلبات الجديدة
  if (reqList.length > 0) {
    const { error } = await supabase.from('service_requirements').insert(
      reqList.map((req, idx) => ({
        service_id: serviceId,
        requirement_ar: req.requirement_ar,
        requirement_en: req.requirement_en,
        order_index: idx,
        conditions: req.conditions,
        is_active: true
      }))
    );

    if (error) {
      console.error(`❌ خطأ في إدراج متطلبات:`, error.message);
    } else {
      console.log(`✅ تم نسخ ${reqList.length} متطلب`);
    }
  }
}

// معالجة الحقول والمستندات
async function syncFieldsAndDocuments(serviceId, steps) {
  if (!steps || !Array.isArray(steps)) return;

  const allFields = [];
  const allDocuments = [];
  let fieldOrder = 0;
  let docOrder = 0;

  steps.forEach((step, stepIndex) => {
    if (!step.fields) return;

    step.fields.forEach(field => {
      const conditions = convertConditionalToConditions(field.conditional);

      // إذا كان نوع الحقل file، نضيفه للمستندات
      if (field.type === 'file') {
        allDocuments.push({
          service_id: serviceId,
          document_name_ar: field.label,
          document_name_en: field.label,
          description_ar: field.help || '',
          description_en: field.help || '',
          is_required: field.required || false,
          order_index: docOrder++,
          conditions,
          is_active: true
        });
      } else {
        // باقي الحقول
        allFields.push({
          service_id: serviceId,
          field_name: field.name,
          label_ar: field.label,
          label_en: field.label,
          field_type: field.type,
          options: field.options || null,
          is_required: field.required || false,
          validation_rules: field.validation || null,
          placeholder_ar: field.placeholder || '',
          placeholder_en: field.placeholder || '',
          help_text_ar: field.help || '',
          help_text_en: field.help || '',
          step_id: step.id,
          step_title_ar: step.title || 'خطوة',
          step_title_en: step.title || 'Step',
          order_index: fieldOrder++,
          conditions,
          is_active: true
        });
      }
    });
  });

  // حذف الحقول القديمة
  await supabase.from('service_fields').delete().eq('service_id', serviceId);
  await supabase.from('service_documents').delete().eq('service_id', serviceId);

  // إدراج الحقول الجديدة
  if (allFields.length > 0) {
    const { error } = await supabase.from('service_fields').insert(allFields);
    if (error) {
      console.error(`❌ خطأ في إدراج الحقول:`, error.message);
    } else {
      console.log(`✅ تم نسخ ${allFields.length} حقل`);
    }
  }

  // إدراج المستندات الجديدة
  if (allDocuments.length > 0) {
    const { error } = await supabase.from('service_documents').insert(allDocuments);
    if (error) {
      console.error(`❌ خطأ في إدراج المستندات:`, error.message);
    } else {
      console.log(`✅ تم نسخ ${allDocuments.length} مستند`);
    }
  }
}

// المعالجة الرئيسية
async function syncAllServices() {
  console.log('🚀 بدء نسخ الخدمات من الكونفيج إلى قاعدة البيانات...\n');

  for (const configFile of serviceConfigs) {
    try {
      console.log(`\n📦 معالجة: ${configFile.slug}`);

      // الحصول على الخدمة من قاعدة البيانات
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('slug', configFile.slug)
        .maybeSingle();

      if (serviceError || !service) {
        console.log(`⚠️  الخدمة غير موجودة في قاعدة البيانات: ${configFile.slug}`);
        continue;
      }

      // استيراد ملف الكونفيج
      const configPath = join(__dirname, configFile.path);
      const configModule = await import(configPath);
      const config = configModule.default || configModule[Object.keys(configModule)[0]];

      if (!config) {
        console.log(`⚠️  لم يتم العثور على الكونفيج في: ${configFile.path}`);
        continue;
      }

      // نسخ المتطلبات
      await syncRequirements(service.id, config.requirements);

      // نسخ الحقول والمستندات
      await syncFieldsAndDocuments(service.id, config.steps);

      console.log(`✅ تم نسخ ${configFile.slug} بنجاح`);
    } catch (error) {
      console.error(`❌ خطأ في معالجة ${configFile.slug}:`, error.message);
    }
  }

  console.log('\n✨ انتهى النسخ!');
}

// تشغيل السكريبت
syncAllServices().catch(console.error);
