/**
 * Script لإضافة جميع الخدمات القنصلية إلى قاعدة البيانات
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// جميع الخدمات الأساسية في المعاملات القنصلية
const services = [
  {
    slug: 'passports',
    name_ar: 'جوازات السفر',
    name_en: 'Passports',
    description_ar: 'إصدار وتجديد جوازات السفر السودانية',
    description_en: 'Issuance and renewal of Sudanese passports',
    icon: 'FileText',
    category: 'documents',
    fees: '930 ريال سعودي (بالغين) - 450 ريال سعودي (أطفال)',
    duration: '5-10 أيام عمل',
    config: {
      types: ['new', 'renewal', 'replacement', 'emergency']
    },
    order_index: 1,
    is_active: true
  },
  {
    slug: 'attestations',
    name_ar: 'التصديقات',
    name_en: 'Attestations',
    description_ar: 'تصديق المستندات والوثائق الرسمية',
    description_en: 'Attestation of official documents',
    icon: 'FileCheck',
    category: 'documents',
    fees: 'حسب نوع المستند',
    duration: '1-3 أيام عمل',
    config: {},
    order_index: 2,
    is_active: true
  },
  {
    slug: 'power-of-attorney',
    name_ar: 'التوكيلات',
    name_en: 'Power of Attorney',
    description_ar: 'إصدار توكيلات رسمية لمختلف الأغراض',
    description_en: 'Issuance of official power of attorney for various purposes',
    icon: 'Scale',
    category: 'legal',
    fees: '200 ريال سعودي',
    duration: '1-2 يوم عمل',
    config: {
      hasSubcategories: true
    },
    order_index: 3,
    is_active: true
  },
  {
    slug: 'civil-registry',
    name_ar: 'الأحوال المدنية',
    name_en: 'Civil Registry',
    description_ar: 'خدمات الأحوال المدنية والوثائق الشخصية',
    description_en: 'Civil registry and personal documents services',
    icon: 'Users',
    category: 'documents',
    fees: 'حسب نوع الخدمة',
    duration: '3-5 أيام عمل',
    config: {},
    order_index: 4,
    is_active: true
  },
  {
    slug: 'endorsements',
    name_ar: 'المصادقات',
    name_en: 'Endorsements',
    description_ar: 'مصادقة على المستندات والتوقيعات',
    description_en: 'Endorsement of documents and signatures',
    icon: 'CheckCircle',
    category: 'documents',
    fees: 'حسب نوع المستند',
    duration: '1-2 يوم عمل',
    config: {},
    order_index: 5,
    is_active: true
  },
  {
    slug: 'family-affairs',
    name_ar: 'الشؤون الأسرية',
    name_en: 'Family Affairs',
    description_ar: 'خدمات الشؤون الأسرية والزواج والطلاق',
    description_en: 'Family affairs, marriage and divorce services',
    icon: 'Heart',
    category: 'legal',
    fees: 'حسب نوع الخدمة',
    duration: '2-4 أيام عمل',
    config: {},
    order_index: 6,
    is_active: true
  },
  {
    slug: 'visas',
    name_ar: 'التأشيرات',
    name_en: 'Visas',
    description_ar: 'إصدار تأشيرات الدخول إلى السودان',
    description_en: 'Issuance of entry visas to Sudan',
    icon: 'Plane',
    category: 'travel',
    fees: 'حسب نوع التأشيرة',
    duration: '3-7 أيام عمل',
    config: {},
    order_index: 7,
    is_active: true
  },
  {
    slug: 'declarations',
    name_ar: 'الإقرارات',
    name_en: 'Declarations',
    description_ar: 'إصدار إقرارات رسمية ومشفوعة باليمين',
    description_en: 'Issuance of official and sworn declarations',
    icon: 'FileCheck',
    category: 'legal',
    fees: '100 ريال سعودي',
    duration: '1 يوم عمل',
    config: {
      hasSubcategories: true
    },
    order_index: 8,
    is_active: true
  },
  {
    slug: 'work-and-prisons',
    name_ar: 'العمل والسجون',
    name_en: 'Work and Prisons',
    description_ar: 'خدمات العمل والسجون ومتابعة الموقوفين',
    description_en: 'Work and prison services and detainee follow-up',
    icon: 'Briefcase',
    category: 'legal',
    fees: 'حسب نوع الخدمة',
    duration: '3-7 أيام عمل',
    config: {},
    order_index: 9,
    is_active: true
  },
  {
    slug: 'body-covering',
    name_ar: 'ستر الجثمان',
    name_en: 'Body Covering',
    description_ar: 'إجراءات ستر الجثمان ونقل الرفات',
    description_en: 'Body covering and remains transfer procedures',
    icon: 'Plus',
    category: 'other',
    fees: 'حسب الإجراءات',
    duration: 'حسب الحالة',
    config: {},
    order_index: 10,
    is_active: true
  },
  {
    slug: 'khartoum-bank',
    name_ar: 'بنك الخرطوم',
    name_en: 'Khartoum Bank',
    description_ar: 'الخدمات البنكية وبنك الخرطوم',
    description_en: 'Banking services and Khartoum Bank',
    icon: 'DollarSign',
    category: 'financial',
    fees: 'حسب نوع المعاملة',
    duration: '2-5 أيام عمل',
    config: {},
    order_index: 11,
    is_active: true
  },
  {
    slug: 'madhoonia',
    name_ar: 'المأذونية',
    name_en: 'Madhoonia',
    description_ar: 'خدمات المأذونية وعقود الزواج',
    description_en: 'Marriage authorization and contracts services',
    icon: 'Heart',
    category: 'legal',
    fees: 'حسب نوع العقد',
    duration: '1-3 أيام عمل',
    config: {},
    order_index: 12,
    is_active: true
  },
  {
    slug: 'education',
    name_ar: 'الخدمات التعليمية',
    name_en: 'Education Services',
    description_ar: 'خدمات امتحانات الشهادات الدراسية للمراحل التعليمية المختلفة',
    description_en: 'Educational examination services for different academic levels',
    icon: 'GraduationCap',
    category: 'education',
    fees: 'حسب نوع الامتحان',
    duration: 'حسب الفترة الامتحانية',
    config: {
      hasSubcategories: true
    },
    order_index: 13,
    is_active: true
  }
];

// الخدمات الفرعية للتوكيلات
const poaSubcategories = [
  {
    parent_slug: 'power-of-attorney',
    slug: 'general',
    name_ar: 'توكيلات منوعة',
    name_en: 'General Powers of Attorney',
    description_ar: 'توكيلات منوعة لجميع الأغراض والمعاملات',
    description_en: 'Various powers of attorney for all purposes',
    icon: '📋',
    order_index: 1
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'courts',
    name_ar: 'محاكم وقضايا ودعاوي',
    name_en: 'Courts and Lawsuits',
    description_ar: 'توكيل خاص بالمرافعات والقضايا القانونية والدعاوي',
    description_en: 'Power of attorney for litigation and legal cases',
    icon: '⚖️',
    order_index: 2
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'inheritance',
    name_ar: 'الورثة',
    name_en: 'Inheritance',
    description_ar: 'توكيل خاص بقسمة التركات وشؤون الورثة',
    description_en: 'Power of attorney for inheritance matters',
    icon: '👨‍👩‍👧‍👦',
    order_index: 3
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'real-estate',
    name_ar: 'عقارات وأراضي',
    name_en: 'Real Estate',
    description_ar: 'توكيل للمعاملات العقارية وبيع وشراء الأراضي',
    description_en: 'Power of attorney for real estate transactions',
    icon: '🏠',
    order_index: 4
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'vehicles',
    name_ar: 'سيارات',
    name_en: 'Vehicles',
    description_ar: 'توكيل خاص بمعاملات السيارات والمركبات',
    description_en: 'Power of attorney for vehicle transactions',
    icon: '🚗',
    order_index: 5
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'companies',
    name_ar: 'الشركات',
    name_en: 'Companies',
    description_ar: 'توكيل للمعاملات التجارية وإدارة الشركات',
    description_en: 'Power of attorney for business transactions',
    icon: '🏢',
    order_index: 6
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'marriage-divorce',
    name_ar: 'إجراءات الزواج والطلاق',
    name_en: 'Marriage and Divorce',
    description_ar: 'توكيل خاص بعقود الزواج والطلاق والمأذونية',
    description_en: 'Power of attorney for marriage and divorce',
    icon: '💍',
    order_index: 7
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'birth-certificates',
    name_ar: 'شهادات ميلاد',
    name_en: 'Birth Certificates',
    description_ar: 'توكيل لاستلام شهادات الميلاد والوثائق المدنية',
    description_en: 'Power of attorney for birth certificates',
    icon: '👶',
    order_index: 8
  },
  {
    parent_slug: 'power-of-attorney',
    slug: 'educational',
    name_ar: 'شهادة دراسية',
    name_en: 'Educational Certificates',
    description_ar: 'توكيل لاستلام الشهادات الدراسية والوثائق التعليمية',
    description_en: 'Power of attorney for educational certificates',
    icon: '🎓',
    order_index: 9
  }
];

// الخدمات الفرعية للإقرارات
const declarationSubcategories = [
  {
    parent_slug: 'declarations',
    slug: 'regular',
    name_ar: 'إقرار عادي',
    name_en: 'Regular Declaration',
    description_ar: 'إقرارات عادية لمختلف الأغراض',
    description_en: 'Regular declarations for various purposes',
    icon: '📄',
    order_index: 1
  },
  {
    parent_slug: 'declarations',
    slug: 'sworn',
    name_ar: 'إقرار مشفوع باليمين',
    name_en: 'Sworn Declaration',
    description_ar: 'إقرارات مشفوعة باليمين للأغراض القانونية',
    description_en: 'Sworn declarations for legal purposes',
    icon: '⚖️',
    order_index: 2
  }
];

// الخدمات الفرعية للتعليم
const educationSubcategories = [
  {
    parent_slug: 'education',
    slug: 'secondary',
    name_ar: 'امتحانات الشهادة الثانوية',
    name_en: 'Secondary School Exams',
    description_ar: 'التقديم لامتحانات الشهادة الثانوية القسم العلمي والأدبي',
    description_en: 'Application for secondary school examinations',
    icon: '📚',
    order_index: 1
  },
  {
    parent_slug: 'education',
    slug: 'intermediate',
    name_ar: 'امتحانات الشهادة المتوسطة',
    name_en: 'Intermediate School Exams',
    description_ar: 'التقديم لامتحانات الشهادة المتوسطة (الصف الثامن)',
    description_en: 'Application for intermediate school examinations',
    icon: '📖',
    order_index: 2
  },
  {
    parent_slug: 'education',
    slug: 'primary',
    name_ar: 'امتحانات الشهادة الابتدائية',
    name_en: 'Primary School Exams',
    description_ar: 'التقديم لامتحانات الشهادة الابتدائية (الصف السادس)',
    description_en: 'Application for primary school examinations',
    icon: '📕',
    order_index: 3
  },
  {
    parent_slug: 'education',
    slug: 'exam-supervision',
    name_ar: 'مراقبة الامتحانات',
    name_en: 'Exam Supervision',
    description_ar: 'التقديم للعمل كمراقب في الامتحانات الرسمية',
    description_en: 'Application to work as an exam supervisor',
    icon: '👁️',
    order_index: 4
  }
];

async function seedServices() {
  console.log('🚀 بدء إضافة الخدمات...\n');

  try {
    // 1. إضافة الخدمات الأساسية
    console.log('📝 إضافة الخدمات الأساسية...');
    const { data: insertedServices, error: servicesError } = await supabase
      .from('services')
      .insert(services)
      .select();

    if (servicesError) {
      console.error('❌ خطأ في إضافة الخدمات:', servicesError);
      return;
    }

    console.log(`✅ تم إضافة ${insertedServices.length} خدمة أساسية\n`);

    // 2. إضافة الخدمات الفرعية للتوكيلات
    console.log('📝 إضافة الخدمات الفرعية للتوكيلات...');
    const poaService = insertedServices.find(s => s.slug === 'power-of-attorney');
    if (poaService) {
      const poaSubcategoriesData = poaSubcategories.map(sub => ({
        ...sub,
        parent_id: poaService.id,
        is_active: true
      }));

      const { data: poaSubs, error: poaError } = await supabase
        .from('services')
        .insert(poaSubcategoriesData)
        .select();

      if (poaError) {
        console.error('❌ خطأ في إضافة خدمات التوكيلات الفرعية:', poaError);
      } else {
        console.log(`✅ تم إضافة ${poaSubs.length} خدمة فرعية للتوكيلات\n`);
      }
    }

    // 3. إضافة الخدمات الفرعية للإقرارات
    console.log('📝 إضافة الخدمات الفرعية للإقرارات...');
    const declarationsService = insertedServices.find(s => s.slug === 'declarations');
    if (declarationsService) {
      const declarationSubcategoriesData = declarationSubcategories.map(sub => ({
        ...sub,
        parent_id: declarationsService.id,
        is_active: true
      }));

      const { data: declSubs, error: declError } = await supabase
        .from('services')
        .insert(declarationSubcategoriesData)
        .select();

      if (declError) {
        console.error('❌ خطأ في إضافة خدمات الإقرارات الفرعية:', declError);
      } else {
        console.log(`✅ تم إضافة ${declSubs.length} خدمة فرعية للإقرارات\n`);
      }
    }

    // 4. إضافة الخدمات الفرعية للتعليم
    console.log('📝 إضافة الخدمات الفرعية للتعليم...');
    const educationService = insertedServices.find(s => s.slug === 'education');
    if (educationService) {
      const educationSubcategoriesData = educationSubcategories.map(sub => ({
        ...sub,
        parent_id: educationService.id,
        is_active: true
      }));

      const { data: eduSubs, error: eduError } = await supabase
        .from('services')
        .insert(educationSubcategoriesData)
        .select();

      if (eduError) {
        console.error('❌ خطأ في إضافة خدمات التعليم الفرعية:', eduError);
      } else {
        console.log(`✅ تم إضافة ${eduSubs.length} خدمة فرعية للتعليم\n`);
      }
    }

    console.log('🎉 تم إضافة جميع الخدمات بنجاح!');
    console.log('\n📊 الإحصائيات:');
    console.log(`   - ${insertedServices.length} خدمة أساسية`);
    console.log(`   - ${poaSubcategories.length} خدمة فرعية للتوكيلات`);
    console.log(`   - ${declarationSubcategories.length} خدمة فرعية للإقرارات`);
    console.log(`   - ${educationSubcategories.length} خدمة فرعية للتعليم`);
    console.log(`   - المجموع: ${insertedServices.length + poaSubcategories.length + declarationSubcategories.length + educationSubcategories.length} خدمة\n`);

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تشغيل السكريبت
seedServices();
