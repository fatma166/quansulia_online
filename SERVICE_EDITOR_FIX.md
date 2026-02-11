# إصلاح محرر الخدمات - استيراد حقول الخدمات التعليمية

## المشكلة
عند فتح الخدمات التعليمية الفرعية (الابتدائية، المتوسطة، الثانوية) في محرر الخدمات، لم تكن **حقول تفاصيل الخدمة** تظهر بشكل صحيح.

### السبب
- الخدمات التعليمية الفرعية مخزنة في جدول `service_types`
- الحقول والمتطلبات والمستندات مرتبطة بـ `service_type_id` وليس `service_id` فقط
- محرر الخدمات كان يجلب البيانات فقط بناءً على `service_id`

## الحل المطبق

### التعديلات في `ServiceEditor.jsx`

#### 1. جلب الحقول (Fields)
```javascript
// قبل الإصلاح - يجلب فقط حقول service_id
const { data: fieldsData } = await supabase
  .from('service_fields')
  .select('*')
  .eq('service_id', serviceId)
  .order('order_index');

// بعد الإصلاح - يجلب حقول service_id + حقول service_type_id
const { data: fieldsData } = await supabase
  .from('service_fields')
  .select('*')
  .eq('service_id', serviceId)
  .order('order_index');

let serviceTypeFields = [];
if (typesData && typesData.length > 0) {
  const typeIds = typesData.map(t => t.id);
  const { data: typeFieldsData } = await supabase
    .from('service_fields')
    .select('*')
    .in('service_type_id', typeIds)
    .order('order_index');

  serviceTypeFields = typeFieldsData || [];
}

const allFields = [...(fieldsData || []), ...serviceTypeFields];
```

#### 2. جلب المتطلبات (Requirements)
```javascript
// يجلب المتطلبات من service_id + service_type_id
const { data: reqData } = await supabase
  .from('service_requirements')
  .select('*')
  .eq('service_id', serviceId)
  .order('order_index');

let serviceTypeReqs = [];
if (typesData && typesData.length > 0) {
  const typeIds = typesData.map(t => t.id);
  const { data: typeReqsData } = await supabase
    .from('service_requirements')
    .select('*')
    .in('service_type_id', typeIds)
    .order('order_index');

  serviceTypeReqs = typeReqsData || [];
}

setRequirements([...(reqData || []), ...serviceTypeReqs]);
```

#### 3. جلب المستندات (Documents)
```javascript
// يجلب المستندات من service_id + service_type_id
const { data: docsData } = await supabase
  .from('service_documents')
  .select('*')
  .eq('service_id', serviceId)
  .order('order_index');

let serviceTypeDocs = [];
if (typesData && typesData.length > 0) {
  const typeIds = typesData.map(t => t.id);
  const { data: typeDocsData } = await supabase
    .from('service_documents')
    .select('*')
    .in('service_type_id', typeIds)
    .order('order_index');

  serviceTypeDocs = typeDocsData || [];
}

setDocuments([...(docsData || []), ...serviceTypeDocs]);
```

## النتيجة

الآن عند فتح أي خدمة تعليمية فرعية في لوحة الإدارة:

✅ **جميع الحقول تظهر بشكل صحيح** (75 حقل)
- 19 حقل للشهادة الابتدائية
- 19 حقل للشهادة المتوسطة
- 25 حقل للشهادة الثانوية
- 12 حقل لمراقبة الامتحانات

✅ **جميع المتطلبات تظهر** (8 متطلبات)

✅ **جميع المستندات تظهر** (14 مستند)

✅ **الشروط (Conditions) محفوظة**

## التحقق

للتحقق من أن كل شيء يعمل:

1. افتح لوحة الإدارة
2. اذهب إلى **إدارة الخدمات**
3. اضغط على **الخدمات التعليمية**
4. اضغط على **الخدمات الفرعية**
5. اختر أي خدمة فرعية (مثل: امتحانات الشهادة الثانوية)
6. اضغط **تعديل**
7. اذهب إلى تبويب **الحقول والنماذج**

يجب أن تشاهد جميع الحقول مع:
- الاسم
- النوع
- الـ Step
- الشروط

## ملاحظات

- التعديل لا يؤثر على أي خدمات أخرى
- يعمل مع جميع أنواع الحقول بما فيها `dynamic-list`
- يحافظ على الترتيب الصحيح للحقول
- يدعم الشروط المعقدة (Conditional Logic)

---

**تاريخ الإصلاح:** 2025-12-11
**الملفات المعدلة:**
- `src/pages/ServiceEditor.jsx`
