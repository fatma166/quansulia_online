# دليل سريع - نظام الحالات الموحد

## الاستخدام السريع ⚡

### 1️⃣ عرض Badge للحالة
```jsx
import StatusBadge from '../components/StatusBadge';

<StatusBadge statusKey="submitted" showIcon={true} size="md" />
```

### 2️⃣ استخدام Hook للحالات
```jsx
import { useStatuses } from '../hooks/useStatuses';

const { statuses, getStatusLabel, getStatusColor } = useStatuses();

// الحصول على نص الحالة
const label = getStatusLabel('submitted'); // "تم التقديم"

// الحصول على لون الحالة
const color = getStatusColor('submitted'); // "bg-blue-100 text-blue-800"
```

### 3️⃣ Dropdown للحالات
```jsx
import { useStatuses } from '../hooks/useStatuses';

const { statuses } = useStatuses();

<select>
  {statuses.map((status) => (
    <option key={status.status_key} value={status.status_key}>
      {status.label_ar}
    </option>
  ))}
</select>
```

---

## الحالات المتاحة 📋

| الكود | النص | اللون |
|------|------|------|
| `submitted` | تم التقديم | أزرق |
| `in_review` | قيد المراجعة | أصفر |
| `approved` | تمت الموافقة | أخضر |
| `payment_pending` | في انتظار الدفع | برتقالي |
| `payment_completed` | تم الدفع | أخضر |
| `appointment_required` | يتطلب حجز موعد | بنفسجي |
| `appointment_booked` | تم حجز الموعد | بنفسجي |
| `processing` | قيد المعالجة | أزرق |
| `ready` | جاهز للاستلام | أخضر |
| `shipping` | جاري الشحن | نيلي |
| `shipped` | تم الشحن | نيلي |
| `delivered` | تم التوصيل | أخضر |
| `completed` | مكتمل | رمادي |
| `rejected` | مرفوض | أحمر |
| `cancelled` | ملغي | رمادي |

---

## إضافة حالة جديدة ➕

```sql
INSERT INTO application_statuses (
  status_key, label_ar, label_en, color, icon,
  order_index, category, description_ar
) VALUES (
  'new_status',
  'الحالة الجديدة',
  'New Status',
  'bg-blue-100 text-blue-800',
  'FileText',
  20,
  'processing',
  'وصف الحالة الجديدة'
);
```

---

## تحديث حالة موجودة ✏️

```sql
UPDATE application_statuses
SET label_ar = 'النص الجديد',
    color = 'bg-green-100 text-green-800'
WHERE status_key = 'submitted';
```

---

## الفوائد ✨

✅ **لا تكرار** - كل حالة في مكان واحد
✅ **توحيد** - نفس النصوص في كل المشروع
✅ **سهولة** - تحديث واحد يظهر في كل مكان

---

للمزيد من التفاصيل، اطلع على `UNIFIED_STATUSES_SYSTEM.md`
