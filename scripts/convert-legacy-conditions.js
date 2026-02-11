import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const categoryMapping = {
  // Passports Service
  'minors_new': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'no' },
      { field: 'passportType', operator: 'equals', value: 'new' }
    ],
    logic: 'AND'
  },
  'minors_renewal': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'no' },
      { field: 'passportType', operator: 'equals', value: 'renewal' }
    ],
    logic: 'AND'
  },
  'minors_renewal_replacement': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'no' },
      { field: 'passportType', operator: 'in', value: ['renewal', 'replacement'] }
    ],
    logic: 'AND'
  },
  'emergency_adults': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'yes' },
      { field: 'passportType', operator: 'equals', value: 'emergency' }
    ],
    logic: 'AND'
  },
  'emergency_children': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'no' },
      { field: 'passportType', operator: 'equals', value: 'emergency' }
    ],
    logic: 'AND'
  },
  'adults_new': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'yes' },
      { field: 'passportType', operator: 'equals', value: 'new' }
    ],
    logic: 'AND'
  },
  'adults_renewal': {
    show_when: [
      { field: 'isAdult', operator: 'equals', value: 'yes' },
      { field: 'passportType', operator: 'equals', value: 'renewal' }
    ],
    logic: 'AND'
  },
  'renewal': {
    show_when: [
      { field: 'passportType', operator: 'equals', value: 'renewal' }
    ],
    logic: 'OR'
  },
  'replacement': {
    show_when: [
      { field: 'passportType', operator: 'equals', value: 'replacement' }
    ],
    logic: 'OR'
  },

  // Civil Registry Service
  'national_id_newborn': {
    show_when: [
      { field: 'idType', operator: 'equals', value: 'newborn' }
    ],
    logic: 'OR'
  },
  'national_id_under12': {
    show_when: [
      { field: 'idType', operator: 'equals', value: 'under12' }
    ],
    logic: 'OR'
  },
  'national_id_replacement': {
    show_when: [
      { field: 'idType', operator: 'equals', value: 'replacement' }
    ],
    logic: 'OR'
  },
  'name_correction': {
    show_when: [
      { field: 'recordType', operator: 'equals', value: 'name_correction' }
    ],
    logic: 'OR'
  },
  'age_correction': {
    show_when: [
      { field: 'recordType', operator: 'equals', value: 'age_correction' }
    ],
    logic: 'OR'
  },
  'conduct_certificate': {
    show_when: [
      { field: 'recordType', operator: 'equals', value: 'conduct_certificate' }
    ],
    logic: 'OR'
  },
  'towhomitmayconcern': {
    show_when: [
      { field: 'recordType', operator: 'equals', value: 'towhomitmayconcern' }
    ],
    logic: 'OR'
  },

  // Madhoonia Service
  'marriage': {
    show_when: [
      { field: 'serviceType', operator: 'equals', value: 'marriage' }
    ],
    logic: 'OR'
  },
  'divorce': {
    show_when: [
      { field: 'serviceType', operator: 'equals', value: 'divorce' }
    ],
    logic: 'OR'
  },

  // Visas Service
  'general': {
    show_when: [
      { field: 'visaType', operator: 'equals', value: 'general' }
    ],
    logic: 'OR'
  },
  'business_visit': {
    show_when: [
      { field: 'visaType', operator: 'equals', value: 'business_visit' }
    ],
    logic: 'OR'
  },
  'personal_visit': {
    show_when: [
      { field: 'visaType', operator: 'equals', value: 'personal_visit' }
    ],
    logic: 'OR'
  },
  'sudanese_origin': {
    show_when: [
      { field: 'visaType', operator: 'equals', value: 'sudanese_origin' }
    ],
    logic: 'OR'
  },

  // Work and Prisons Service
  'finalExit': {
    show_when: [
      { field: 'requestReason', operator: 'equals', value: 'finalExit' }
    ],
    logic: 'OR'
  }
};

async function convertLegacyRequirements() {
  console.log('🔄 بدء تحويل الشروط القديمة...\n');

  const { data: requirements, error: fetchError } = await supabase
    .from('service_requirements')
    .select('*')
    .not('conditions', 'is', null);

  if (fetchError) {
    console.error('❌ خطأ في جلب المتطلبات:', fetchError);
    return;
  }

  const legacyRequirements = requirements.filter(req =>
    req.conditions && !req.conditions.show_when
  );

  console.log(`📊 وجدت ${legacyRequirements.length} متطلب بشروط قديمة\n`);

  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const req of legacyRequirements) {
    const category = req.conditions.category;

    if (!category) {
      console.log(`⚠️  متطلب ${req.requirement_ar}: لا يوجد category`);
      skipped++;
      continue;
    }

    const newConditions = categoryMapping[category];

    if (!newConditions) {
      console.log(`⚠️  متطلب ${req.requirement_ar}: category غير معروف (${category})`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('service_requirements')
      .update({ conditions: newConditions })
      .eq('id', req.id);

    if (updateError) {
      console.error(`❌ فشل تحديث ${req.requirement_ar}:`, updateError);
      failed++;
    } else {
      console.log(`✅ ${req.requirement_ar}: ${category} → صيغة جديدة`);
      converted++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 النتيجة النهائية:');
  console.log(`   ✅ تم التحويل: ${converted}`);
  console.log(`   ⚠️  تم التجاهل: ${skipped}`);
  console.log(`   ❌ فشل: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function convertLegacyDocuments() {
  console.log('🔄 بدء تحويل شروط المستندات القديمة...\n');

  const { data: documents, error: fetchError } = await supabase
    .from('service_documents')
    .select('*')
    .not('conditions', 'is', null);

  if (fetchError) {
    console.error('❌ خطأ في جلب المستندات:', fetchError);
    return;
  }

  const legacyDocuments = documents.filter(doc =>
    doc.conditions && !doc.conditions.show_when
  );

  console.log(`📊 وجدت ${legacyDocuments.length} مستند بشروط قديمة\n`);

  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of legacyDocuments) {
    const category = doc.conditions.category;

    if (!category) {
      console.log(`⚠️  مستند ${doc.document_name_ar}: لا يوجد category`);
      skipped++;
      continue;
    }

    const newConditions = categoryMapping[category];

    if (!newConditions) {
      console.log(`⚠️  مستند ${doc.document_name_ar}: category غير معروف (${category})`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('service_documents')
      .update({ conditions: newConditions })
      .eq('id', doc.id);

    if (updateError) {
      console.error(`❌ فشل تحديث ${doc.document_name_ar}:`, updateError);
      failed++;
    } else {
      console.log(`✅ ${doc.document_name_ar}: ${category} → صيغة جديدة`);
      converted++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 النتيجة النهائية:');
  console.log(`   ✅ تم التحويل: ${converted}`);
  console.log(`   ⚠️  تم التجاهل: ${skipped}`);
  console.log(`   ❌ فشل: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('   🔧 أداة تحويل الشروط القديمة');
  console.log('═══════════════════════════════════════\n');

  await convertLegacyRequirements();
  await convertLegacyDocuments();

  console.log('✨ انتهى التحويل بنجاح!\n');
}

main().catch(console.error);
