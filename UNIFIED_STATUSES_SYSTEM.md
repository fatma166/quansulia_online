# نظام الحالات الموحد (Unified Statuses System)

## المشكلة السابقة ❌

كانت الحالات (statuses) متكررة في كل ملف:
- ❌ `TransactionTracking.jsx` - تعريف خاص
- ❌ `ApplicationsList.jsx` - تعريف خاص
- ❌ `AdminApplicationStatusManager.jsx` - تعريف خاص
- ❌ تكرار النصوص والألوان
- ❌ صعوبة التحديث (يجب تحديث كل ملف)
- ❌ احتمالية عدم التناسق بين الملفات

## الحل ✅

تم إنشاء **نظام موحد مركزي** للحالات:

### 1️⃣ جدول في قاعدة البيانات
**الجدول:** `application_statuses`

```sql
CREATE TABLE application_statuses (
  status_key text PRIMARY KEY,        -- مفتاح الحالة (submitted, in_review, ...)
  label_ar text NOT NULL,            -- النص بالعربية
  label_en text NOT NULL,            -- النص بالإنجليزية
  color text NOT NULL,               -- اللون (Tailwind classes)
  icon text NOT NULL,                -- اسم الأيقونة
  order_index integer NOT NULL,     -- ترتيب الحالة
  category text NOT NULL,            -- التصنيف (submission, review, payment, ...)
  description_ar text,               -- وصف تفصيلي
  is_active boolean DEFAULT true,    -- هل الحالة نشطة؟
  created_at timestamptz,
  updated_at timestamptz
);
```

### 2️⃣ Hook موحد
**الملف:** `/src/hooks/useStatuses.js`

```javascript
import { useStatuses } from '../hooks/useStatuses';

const {
  statuses,              // جميع الحالات
  statusesMap,           // Map للحالات
  getStatusLabel,        // الحصول على النص
  getStatusColor,        // الحصول على اللون
  getStatusIcon,         // الحصول على الأيقونة
  getStatusByKey,        // الحصول على حالة كاملة
  getStatusesByCategory, // فلترة حسب الفئة
  refreshStatuses        // تحديث البيانات
} = useStatuses();
```

### 3️⃣ StatusBadge Component
**الملف:** `/src/components/StatusBadge.jsx`

```jsx
import StatusBadge from '../components/StatusBadge';

<StatusBadge
  statusKey="submitted"
  showIcon={true}
  size="lg"
  showDescription={false}
  language="ar"
/>
```

### 4️⃣ Utility Functions
**الملف:** `/src/lib/statuses.js`

للاستخدام خارج React components:

```javascript
import {
  loadStatuses,
  getStatus,
  getStatusLabel,
  statusKeys
} from '../lib/statuses';

const label = await getStatusLabel('submitted', 'ar');
```

---

## الحالات المتوفرة 📋

| status_key | النص العربي | النص الإنجليزي | الفئة | الترتيب |
|-----------|------------|----------------|-------|---------|
| `submitted` | تم التقديم | Submitted | submission | 1 |
| `in_review` | قيد المراجعة | In Review | review | 2 |
| `approved` | تمت الموافقة | Approved | review | 3 |
| `payment_pending` | في انتظار الدفع | Payment Pending | payment | 4 |
| `payment_completed` | تم الدفع | Payment Completed | payment | 5 |
| `appointment_required` | يتطلب حجز موعد | Appointment Required | appointment | 6 |
| `appointment_booked` | تم حجز الموعد | Appointment Booked | appointment | 7 |
| `processing` | قيد المعالجة | Processing | processing | 8 |
| `ready` | جاهز للاستلام | Ready | processing | 9 |
| `shipping` | جاري الشحن | Shipping | shipping | 10 |
| `shipped` | تم الشحن | Shipped | shipping | 11 |
| `delivered` | تم التوصيل | Delivered | shipping | 12 |
| `completed` | مكتمل | Completed | completion | 13 |
| `rejected` | مرفوض | Rejected | rejection | 14 |
| `cancelled` | ملغي | Cancelled | rejection | 15 |

---

## التصنيفات (Categories) 🗂️

- **submission** - مرحلة التقديم
- **review** - مرحلة المراجعة
- **payment** - مرحلة الدفع
- **appointment** - مرحلة الموعد
- **processing** - مرحلة المعالجة
- **shipping** - مرحلة الشحن
- **completion** - مرحلة الإكمال
- **rejection** - مرحلة الرفض

---

## كيفية الاستخدام 💡

### مثال 1: عرض badge للحالة

```jsx
import StatusBadge from '../components/StatusBadge';

function MyComponent({ application }) {
  return (
    <div>
      <h3>{application.reference_number}</h3>
      <StatusBadge statusKey={application.status} showIcon={true} />
    </div>
  );
}
```

### مثال 2: استخدام الحالات في dropdown

```jsx
import { useStatuses } from '../hooks/useStatuses';

function StatusSelector({ value, onChange }) {
  const { statuses } = useStatuses();

  return (
    <select value={value} onChange={onChange}>
      {statuses.map((status) => (
        <option key={status.status_key} value={status.status_key}>
          {status.label_ar}
        </option>
      ))}
    </select>
  );
}
```

### مثال 3: الحصول على نص الحالة فقط

```jsx
import { useStatuses } from '../hooks/useStatuses';

function StatusText({ statusKey }) {
  const { getStatusLabel } = useStatuses();

  return <span>{getStatusLabel(statusKey)}</span>;
}
```

### مثال 4: فلترة الحالات حسب الفئة

```jsx
import { useStatuses } from '../hooks/useStatuses';

function PaymentStatuses() {
  const { getStatusesByCategory } = useStatuses();
  const paymentStatuses = getStatusesByCategory('payment');

  return (
    <div>
      {paymentStatuses.map((status) => (
        <div key={status.status_key}>{status.label_ar}</div>
      ))}
    </div>
  );
}
```

---

## الملفات المحدثة ✅

تم تحديث الملفات التالية لاستخدام النظام الموحد:

1. ✅ `/src/pages/TransactionTracking.jsx`
   - إزالة `statusTexts` و `statusColors`
   - استخدام `useStatuses()` hook
   - استخدام `StatusBadge` component

2. ✅ `/src/pages/ApplicationsList.jsx`
   - إزالة `STATUS_LABELS`
   - استخدام `useStatuses()` hook
   - تحديث dropdowns للحالات

3. ✅ `/src/components/AdminApplicationStatusManager.jsx`
   - إزالة `statusOptions` array
   - استخدام `useStatuses()` hook
   - تحديث dropdown للحالات

---

## المزايا 🎯

### 1. **مصدر واحد للحقيقة** (Single Source of Truth)
- جميع الحالات في مكان واحد (قاعدة البيانات)
- لا تكرار للكود
- سهولة الصيانة

### 2. **سهولة التحديث**
```sql
-- تحديث نص حالة معينة
UPDATE application_statuses
SET label_ar = 'النص الجديد'
WHERE status_key = 'submitted';

-- يتم التحديث تلقائياً في كل المشروع! 🎉
```

### 3. **إضافة حالات جديدة بسهولة**
```sql
INSERT INTO application_statuses
(status_key, label_ar, label_en, color, icon, order_index, category)
VALUES
('under_inspection', 'قيد الفحص', 'Under Inspection', 'bg-purple-100 text-purple-800', 'Search', 16, 'processing');

-- متاح فوراً في كل التطبيق! 🚀
```

### 4. **Cache ذكي**
- يحفظ البيانات لمدة 5 دقائق
- يقلل عدد الاستعلامات للداتابيس
- أداء أسرع

### 5. **دعم متعدد اللغات**
- نصوص عربية وإنجليزية
- سهولة إضافة لغات جديدة

### 6. **UI موحد ومتسق**
- نفس الألوان في كل مكان
- نفس الأيقونات
- نفس النصوص

---

## إدارة الحالات 🔧

### عرض جميع الحالات
```sql
SELECT * FROM application_statuses ORDER BY order_index;
```

### إضافة حالة جديدة
```sql
INSERT INTO application_statuses (
  status_key,
  label_ar,
  label_en,
  color,
  icon,
  order_index,
  category,
  description_ar
) VALUES (
  'quality_check',
  'فحص الجودة',
  'Quality Check',
  'bg-indigo-100 text-indigo-800',
  'CheckCircle',
  17,
  'processing',
  'الطلب قيد فحص الجودة النهائي'
);
```

### تحديث حالة
```sql
UPDATE application_statuses
SET
  label_ar = 'تم التقديم بنجاح',
  label_en = 'Successfully Submitted',
  color = 'bg-blue-200 text-blue-900'
WHERE status_key = 'submitted';
```

### إخفاء حالة (بدون حذفها)
```sql
UPDATE application_statuses
SET is_active = false
WHERE status_key = 'old_status';
```

### حذف حالة
```sql
DELETE FROM application_statuses
WHERE status_key = 'unwanted_status';
```

---

## الأمان 🔒

### RLS Policies

1. **القراءة - متاحة للجميع:**
```sql
CREATE POLICY "Anyone can read statuses"
  ON application_statuses FOR SELECT
  USING (true);
```

2. **التعديل - فقط Super Admins:**
```sql
CREATE POLICY "Super admins can manage statuses"
  ON application_statuses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.email = auth.jwt() ->> 'email'
      AND roles.name = 'super_admin'
    )
  );
```

---

## استكشاف الأخطاء 🐛

### المشكلة: الحالات لا تظهر

**الحل:**
```javascript
const { statuses, loading, error } = useStatuses();

if (loading) return <div>جاري التحميل...</div>;
if (error) return <div>خطأ: {error}</div>;
if (!statuses.length) return <div>لا توجد حالات</div>;
```

### المشكلة: البيانات قديمة

**الحل:**
```javascript
const { refreshStatuses } = useStatuses();

// تحديث البيانات يدوياً
refreshStatuses();
```

### المشكلة: Cache قديم

**الحل:**
```javascript
import { clearStatusesCache } from '../hooks/useStatuses';

// مسح الـ cache
clearStatusesCache();
```

---

## Best Practices 📌

### ✅ DO:
1. استخدم `StatusBadge` component لعرض الحالات
2. استخدم `useStatuses()` hook للحصول على البيانات
3. استخدم `status_key` كـ identifier دائماً
4. أضف `description_ar` لكل حالة
5. حافظ على `order_index` منطقياً

### ❌ DON'T:
1. ❌ لا تكتب الحالات hardcoded في الكود
2. ❌ لا تنسى `category` عند إضافة حالة جديدة
3. ❌ لا تحذف حالات قديمة (استخدم `is_active = false`)
4. ❌ لا تكرر `order_index` بين الحالات
5. ❌ لا تنسى تحديث `updated_at` (يتم تلقائياً)

---

## الملفات الجديدة 📁

```
project/
├── supabase/migrations/
│   └── create_unified_statuses_system.sql    ✅ جدول الحالات
├── src/
│   ├── hooks/
│   │   └── useStatuses.js                     ✅ Hook موحد
│   ├── lib/
│   │   └── statuses.js                        ✅ Utility functions
│   ├── components/
│   │   └── StatusBadge.jsx                    ✅ Status badge component
│   └── pages/
│       ├── TransactionTracking.jsx            ✅ محدّث
│       ├── ApplicationsList.jsx               ✅ محدّث
│       └── AdminApplicationStatusManager.jsx  ✅ محدّث
```

---

## الخلاصة 🎉

### قبل النظام الموحد ❌
```javascript
// في كل ملف:
const statuses = {
  submitted: 'تم الاستلام',  // ❌ متكرر
  in_review: 'قيد المراجعة', // ❌ متكرر
  // ...
};
```

### بعد النظام الموحد ✅
```javascript
// في قاعدة البيانات فقط ✅
// كل الملفات تستخدم:
const { getStatusLabel } = useStatuses();
const label = getStatusLabel('submitted'); // "تم التقديم"
```

---

## النتيجة النهائية 🏆

✅ **لا تكرار** - كل حالة معرّفة مرة واحدة فقط
✅ **توحيد كامل** - نفس النصوص والألوان في كل المشروع
✅ **سهولة التحديث** - تحديث واحد يؤثر على كل شيء
✅ **قابلية التوسع** - إضافة حالات جديدة بسهولة
✅ **أداء محسّن** - Cache ذكي
✅ **UI متسق** - مظهر موحد
✅ **آمن** - RLS policies محكمة

---

**تم التطوير والتوثيق بواسطة Claude** 🤖

**التاريخ:** ديسمبر 2024

**الحالة:** ✅ مكتمل ويعمل
