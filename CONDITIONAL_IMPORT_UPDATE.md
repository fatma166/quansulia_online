# تحديث نظام استيراد الشروط للمرفقات والمتطلبات

## التحديثات المنجزة

### 1. إصلاح مشكلة إضافة الشروط في إدارة الخدمات

**المشكلة:** عند إضافة شرط للمستندات في صفحة إدارة الخدمة، لم يعمل الشرط بشكل صحيح.

**السبب:** في مكون `DraggableItem.jsx`، كانت دالة `handleConditionsChange` تمرر الـ object كاملاً بدلاً من الحقل والقيمة بشكل منفصل.

**الحل:**
```javascript
// قبل
const handleConditionsChange = (newConditions) => {
  onUpdate(index, { ...item, conditions: newConditions });
};

// بعد
const handleConditionsChange = (newConditions) => {
  onUpdate(index, 'conditions', newConditions);
};
```

**الملف:** `src/components/DraggableItem.jsx:39`

---

### 2. تحديث سكريبت الاستيراد لدعم شروط المرفقات

**ما تم إضافته:**

تم تحديث دالة `generateServiceSQL` في ملف `scripts/generate-import-sql.js` لاستخراج الشروط من حقول المرفقات (type: 'file') بشكل صحيح.

**التحسينات:**

1. **استخراج حجم الملف بشكل ذكي:**
```javascript
let maxSizeMb = 5;
if (field.maxSize) {
  const sizeStr = String(field.maxSize).toUpperCase();
  if (sizeStr.includes('MB')) {
    maxSizeMb = parseInt(sizeStr.replace('MB', ''));
  } else {
    maxSizeMb = parseInt(sizeStr);
  }
}
```

2. **تحويل الشروط إلى تنسيق show_when المعياري:**

**الشروط البسيطة:**
```javascript
// في config.js
conditional: { field: 'isAdult', values: ['yes'] }

// يتم تحويلها إلى
conditions: {
  show_when: [{
    operator: 'OR',
    conditions: [{
      field: 'isAdult',
      operator: 'equals',
      value: ['yes']
    }]
  }]
}
```

**الشروط المعقدة (AND/OR):**
```javascript
// في config.js
conditional: [
  {
    operator: 'AND',
    conditions: [
      { field: 'isAdult', values: ['yes'] },
      { field: 'passportType', values: ['renewal', 'replacement'] }
    ]
  }
]

// يتم حفظها مباشرة في
conditions: {
  show_when: [/* نفس المصفوفة */]
}
```

---

## أمثلة من ملف SQL المُولّد

### مثال 1: شروط بسيطة للمرفقات
```sql
-- صورة شخصية للبالغين فقط
('صورة شخصية', NULL, NULL, NULL,
 true, 2, '["jpg","jpeg","png"]'::jsonb, 2, TRUE,
 '{"show_when":[{"operator":"OR","conditions":[{"field":"isAdult","operator":"equals","value":["yes"]}]}]}'::jsonb)
```

### مثال 2: شروط معقدة AND للمرفقات
```sql
-- صورة الجواز للبالغين الذين يطلبون تجديد أو بدل فاقد
('صورة من الجواز', NULL, NULL, NULL,
 true, 5, '["pdf","jpg","jpeg","png"]'::jsonb, 0, TRUE,
 '{"show_when":[{"operator":"AND","conditions":[{"field":"isAdult","values":["yes"]},{"field":"passportType","values":["renewal","replacement","travel-document"]}]}]}'::jsonb)
```

### مثال 3: شروط المتطلبات
```sql
-- متطلبات خاصة بالتجديد فقط
('الجواز القديم الأصلي', NULL, 7, TRUE, '{"type":"renewal"}'::jsonb)
```

---

## بنية الشروط في قاعدة البيانات

### للحقول (service_fields)
```jsonb
{
  "field": "isAdult",
  "values": ["yes"]
}
```

### للمرفقات (service_documents)
```jsonb
{
  "show_when": [
    {
      "operator": "AND",
      "conditions": [
        { "field": "isAdult", "values": ["yes"] },
        { "field": "passportType", "values": ["renewal"] }
      ]
    }
  ]
}
```

### للمتطلبات (service_requirements)
```jsonb
{
  "type": "renewal"
}
```

---

## كيفية استخدام الشروط في التطبيق

### 1. قراءة المرفقات مع الشروط
```javascript
const { data: documents } = await supabase
  .from('service_documents')
  .select('*')
  .eq('service_id', serviceId)
  .eq('is_active', true)
  .order('order_index');

// تطبيق الشروط
const visibleDocuments = documents.filter(doc =>
  shouldShowDocument(doc, formData)
);
```

### 2. تقييم شروط المرفقات
```javascript
function shouldShowDocument(document, formData) {
  if (!document.conditions || !document.conditions.show_when) {
    return true;
  }

  const showWhenGroups = document.conditions.show_when;

  // OR بين المجموعات
  return showWhenGroups.some(group => {
    const operator = group.operator || 'OR';
    const conditions = group.conditions || [];

    if (operator === 'AND') {
      // جميع الشروط يجب أن تتحقق
      return conditions.every(cond =>
        cond.values.includes(formData[cond.field])
      );
    } else {
      // أي شرط يجب أن يتحقق
      return conditions.some(cond =>
        cond.values.includes(formData[cond.field])
      );
    }
  });
}
```

### 3. تقييم شروط المتطلبات
```javascript
function shouldShowRequirement(requirement, formData) {
  if (!requirement.conditions || Object.keys(requirement.conditions).length === 0) {
    return true;
  }

  // المتطلبات لديها شروط key-value بسيطة
  for (const [key, value] of Object.entries(requirement.conditions)) {
    if (formData[key] !== value) {
      return false;
    }
  }

  return true;
}
```

---

## الملفات المُعدّلة

1. ✅ `src/components/DraggableItem.jsx`
   - إصلاح handleConditionsChange

2. ✅ `scripts/generate-import-sql.js`
   - إضافة استخراج ذكي لحجم الملف
   - تحويل الشروط إلى تنسيق show_when

3. ✅ `supabase/migrations/99999999999999_import_all_services_data.sql`
   - تم إعادة توليده مع الشروط الكاملة

4. ✅ `SERVICES_IMPORT_README.md`
   - تحديث التوثيق مع أمثلة استخدام الشروط

---

## الخطوات للتطبيق

1. الملفات محدثة وجاهزة
2. ملف SQL تم إعادة توليده بالشروط الكاملة
3. يمكنك الآن تطبيق الـ migration على قاعدة البيانات

```bash
# لإعادة توليد SQL في المستقبل
node scripts/generate-import-sql.js
```

---

## النتيجة النهائية

الآن جميع الشروط للمرفقات والمتطلبات والحقول:
- ✅ يتم استخراجها من config.js
- ✅ يتم تحويلها إلى التنسيق الصحيح
- ✅ يتم حفظها في قاعدة البيانات
- ✅ جاهزة للاستخدام في لوحة إدارة الخدمات
- ✅ جاهزة للاستخدام في عرض النماذج للمستخدمين
