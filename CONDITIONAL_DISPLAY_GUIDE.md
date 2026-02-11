# دليل العرض الشرطي للعناصر

## الفكرة الأساسية

النظام يعرض **المتطلبات والمستندات والحقول** بشكل شرطي حسب اختيارات المستخدم في النموذج.

## كيف يعمل؟

### 1️⃣ البيانات في قاعدة البيانات

كل عنصر (متطلب، مستند، حقل) له حقل `conditions` بصيغة JSON:

```json
{
  "show_when": [
    {
      "field": "passportType",
      "operator": "equals",
      "value": "renewal"
    }
  ],
  "logic": "OR"
}
```

### 2️⃣ دالة التقييم

`evaluateConditions()` في `useServiceData.js` تفحص الشروط:

```javascript
function evaluateConditions(conditions, formValues) {
  if (!conditions || !conditions.show_when) return true;

  const { show_when, logic = 'OR' } = conditions;

  const results = show_when.map(condition => {
    const fieldValue = formValues[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return fieldValue && fieldValue.includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return false;
    }
  });

  return logic === 'AND'
    ? results.every(r => r === true)
    : results.some(r => r === true);
}
```

### 3️⃣ فلترة العناصر المرئية

```javascript
function getVisibleItems(items, formValues) {
  return items.filter(item => {
    if (!item.conditions) return true; // بدون شروط = يظهر دائماً
    return evaluateConditions(item.conditions, formValues);
  });
}
```

## مثال عملي: خدمة الجوازات

### المتطلبات الشرطية

```javascript
// متطلب يظهر فقط للقصّر (أقل من 18 سنة)
{
  requirement_ar: "حضور الوالد أو الأم",
  conditions: {
    show_when: [
      { field: "isAdult", operator: "equals", value: "no" }
    ],
    logic: "OR"
  }
}

// متطلب يظهر للبدل فاقد
{
  requirement_ar: "شهادة فقدان من الشرطة",
  conditions: {
    show_when: [
      { field: "passportType", operator: "equals", value: "replacement" }
    ]
  }
}
```

### المستندات الشرطية

```javascript
// مستند يظهر فقط للتجديد
{
  document_name_ar: "الجواز القديم الأصلي",
  conditions: {
    show_when: [
      { field: "passportType", operator: "equals", value: "renewal" }
    ]
  }
}

// مستند يظهر للبالغين فقط عند الإصدار الجديد
{
  document_name_ar: "صورة الرقم الوطني",
  conditions: {
    show_when: [
      { field: "isAdult", operator: "equals", value: "yes" },
      { field: "passportType", operator: "equals", value: "new" }
    ],
    logic: "AND"  // يحتاج كلا الشرطين
  }
}
```

### الحقول الشرطية

```javascript
// حقل رقم الجواز القديم يظهر للتجديد أو البدل فاقد
{
  field_name: "oldPassportNumber",
  label_ar: "رقم الجواز القديم",
  conditions: {
    show_when: [
      { field: "passportType", operator: "equals", value: "renewal" },
      { field: "passportType", operator: "equals", value: "replacement" }
    ],
    logic: "OR"  // أي من الشرطين
  }
}
```

## المنطق المدعوم

### Operators (المعاملات)

- `equals`: مساوي بالضبط
- `not_equals`: غير مساوي
- `contains`: يحتوي على
- `in`: موجود في قائمة

### Logic (المنطق)

- `OR`: أي شرط يتحقق
- `AND`: كل الشروط تتحقق

## الاستخدام في الواجهة

### 1. Hook لجلب البيانات

```jsx
import { useServiceData } from '../hooks/useServiceData';

function MyComponent() {
  const { service, requirements, documents, fields, loading } =
    useServiceData('passports');
}
```

### 2. عرض المتطلبات الشرطية

```jsx
import ConditionalRequirements from '../components/ConditionalRequirements';

<ConditionalRequirements
  requirements={requirements}
  formValues={formValues}
/>
```

### 3. عرض المستندات الشرطية

```jsx
import ConditionalDocuments from '../components/ConditionalDocuments';

<ConditionalDocuments
  documents={documents}
  formValues={formValues}
/>
```

### 4. النموذج الديناميكي الكامل

```jsx
import DynamicServiceForm from '../components/DynamicServiceForm';

<DynamicServiceForm
  serviceSlug="passports"
  onSubmit={handleSubmit}
/>
```

## الروابط

### للمستخدمين

```
/service/passports
/service/power-of-attorney
/service/attestations
```

### تحديث ServicesGrid للربط

```jsx
<Link to={`/service/${service.slug}`}>
  عرض الخدمة
</Link>
```

## التحديث التلقائي

عند تغيير المستخدم لأي اختيار في النموذج:
1. يتم تحديث `formValues` تلقائياً
2. يتم إعادة تقييم جميع الشروط
3. تظهر/تختفي العناصر فوراً
4. تحديث الـ sidebar مع المتطلبات والمستندات الجديدة

## مثال تفاعلي

```
المستخدم يختار:
  isAdult = "no" (طفل)

تظهر:
  ✅ حقل: حضور الوالد
  ✅ متطلب: صورة جواز الأم
  ✅ متطلب: صورة جواز الأب
  ✅ مستند: موافقة الوالد

المستخدم يغيّر إلى:
  isAdult = "yes" (بالغ)

تختفي كل العناصر السابقة وتظهر:
  ✅ حقل: الرقم الوطني
  ✅ متطلب: الحضور الشخصي
  ✅ مستند: صورة الرقم الوطني
```

## نسخ البيانات من الكونفيج

```bash
npm run sync-services
```

هذا الأمر ينسخ كل شيء من ملفات `config.js` إلى قاعدة البيانات مع حفظ جميع الشروط.

## الخلاصة

النظام **ديناميكي بالكامل**:
- ✅ البيانات من قاعدة البيانات
- ✅ الشروط محفوظة ويتم تطبيقها تلقائياً
- ✅ تحديث فوري عند تغيير الاختيارات
- ✅ سهل الصيانة والتعديل من لوحة الإدارة
