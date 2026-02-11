import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkPricingRules() {
  console.log('\n🔍 فحص قواعد التسعير المشروط...\n');

  // 1. جلب جميع الخدمات
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, slug, name_ar, has_age_based_pricing, price_under_18, price_18_and_above')
    .order('name_ar');

  if (servicesError) {
    console.error('❌ خطأ في جلب الخدمات:', servicesError);
    return;
  }

  console.log(`📋 عدد الخدمات: ${services.length}\n`);

  // 2. جلب جميع قواعد التسعير
  const { data: pricingRules, error: rulesError } = await supabase
    .from('service_pricing_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (rulesError) {
    console.error('❌ خطأ في جلب قواعد التسعير:', rulesError);
    return;
  }

  console.log(`💰 عدد قواعد التسعير المشروط: ${pricingRules.length}\n`);

  if (pricingRules.length === 0) {
    console.log('⚠️  لا توجد أي قواعد تسعير مشروط في قاعدة البيانات!\n');
    console.log('💡 لإضافة قاعدة تسعير:');
    console.log('   1. افتح صفحة تحرير الخدمة');
    console.log('   2. اذهب لتبويب "التسعير المشروط"');
    console.log('   3. اضغط "إضافة قاعدة جديدة"\n');
    return;
  }

  // 3. عرض تفاصيل كل قاعدة
  console.log('📊 تفاصيل القواعد:\n');
  console.log('='.repeat(80) + '\n');

  for (const rule of pricingRules) {
    const service = services.find(s => s.id === rule.service_id);

    console.log(`🎯 القاعدة: ${rule.rule_name}`);
    console.log(`   📌 الخدمة: ${service?.name_ar || 'غير معروف'} (${service?.slug || 'N/A'})`);
    console.log(`   🔑 ID: ${rule.id}`);
    console.log(`   ⚡ الحالة: ${rule.is_active ? '✅ نشط' : '❌ غير نشط'}`);
    console.log(`   📊 الأولوية: ${rule.priority}`);
    console.log(`   💵 السعر (أقل من 18): ${rule.price_under_18} ريال`);
    console.log(`   💵 السعر (18 فأكثر): ${rule.price_18_and_above} ريال`);

    if (rule.conditions) {
      console.log(`   📋 الشروط:`);
      if (rule.conditions.show_when) {
        console.log(`      المنطق: ${rule.conditions.logic || 'AND'}`);
        rule.conditions.show_when.forEach((cond, idx) => {
          console.log(`      ${idx + 1}. الحقل: "${cond.field}"`);
          console.log(`         المعامل: ${cond.operator}`);
          console.log(`         القيمة: "${cond.value}"`);
        });
      } else if (Array.isArray(rule.conditions)) {
        rule.conditions.forEach((cond, idx) => {
          console.log(`      ${idx + 1}. ${cond.field} ${cond.operator} "${cond.value}"`);
        });
      }
    } else {
      console.log(`   📋 الشروط: لا توجد شروط (تطبق على الجميع)`);
    }

    console.log(`   📅 تاريخ الإنشاء: ${new Date(rule.created_at).toLocaleString('ar-SA')}`);
    console.log('\n' + '-'.repeat(80) + '\n');
  }

  // 4. جلب حقول كل خدمة للتحقق من أسماء الحقول
  console.log('🔤 أسماء الحقول لكل خدمة:\n');
  console.log('='.repeat(80) + '\n');

  for (const service of services) {
    const { data: fields } = await supabase
      .from('service_fields')
      .select('field_name, label_ar, field_type')
      .eq('service_id', service.id)
      .eq('is_active', true)
      .order('order_index');

    if (fields && fields.length > 0) {
      console.log(`📝 ${service.name_ar} (${service.slug}):`);
      fields.forEach(field => {
        console.log(`   - field_name: "${field.field_name}" | label: "${field.label_ar}" | type: ${field.field_type}`);
      });
      console.log('');
    }
  }

  // 5. نصائح
  console.log('\n💡 نصائح مهمة:');
  console.log('   ✓ تأكد أن field_name في الشرط يطابق field_name في الحقول');
  console.log('   ✓ تأكد أن القاعدة في حالة "نشط"');
  console.log('   ✓ تأكد أن service_id صحيح');
  console.log('   ✓ القيمة في الشرط يجب أن تطابق القيمة المرسلة من النموذج');
  console.log('');
}

checkPricingRules().catch(console.error);
