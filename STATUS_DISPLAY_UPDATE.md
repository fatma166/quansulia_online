# تحديث عرض حالة الطلب

## التحديثات المنفذة - 2026-04-01

### 1. تصميم جديد لعرض الحالة

تم إعادة تصميم عنصر عرض الحالة ليطابق التصميم المطلوب:

```
┌──────────────────────────────────────┐
│ [❌] [💾] [🔽] [تم التقديم] [●]    │
└──────────────────────────────────────┘
```

#### العناصر من اليمين لليسار:

1. **زر الإغلاق (❌)**
   - لون رمادي فاتح
   - حواف دائرية من اليمين

2. **زر الحفظ/التعديل (💾)**
   - لون أخضر
   - أيقونة حفظ
   - يفتح قائمة تغيير الحالة

3. **زر القائمة المنسدلة (🔽)**
   - سهم للأسفل
   - خلفية بيضاء
   - يفتح قائمة الحالات

4. **نص الحالة**
   - اسم الحالة بالعربية
   - خلفية بيضاء
   - إطار رمادي
   - حواف دائرية من اليسار

5. **نقطة اللون (●)**
   - لون يطابق لون الحالة
   - دائرية صغيرة (3×3)

---

### 2. دعم كلا نوعي قواعد البيانات

تم تحديث الكود ليدعم:

#### أ. قاعدة بيانات بحقل `status` (نصي):
```javascript
if (appData.status) {
  currentStatusData = statusesData.find(
    s => s.status_key === appData.status
  );
}
```

#### ب. قاعدة بيانات بحقل `status_id` (UUID):
```javascript
if (appData.status_id) {
  currentStatusData = statusesData.find(
    s => s.id === appData.status_id
  );
}
```

---

### 3. عرض الحالة الافتراضية

إذا لم يتم العثور على الحالة في قاعدة البيانات:

```javascript
{currentStatus?.name_ar ||
 currentStatus?.label_ar ||
 application.status ||
 'تم التقديم'}
```

**القيم الافتراضية**:
- اللون: `#3B82F6` (أزرق)
- النص: "تم التقديم"

---

### 4. آلية عمل الأزرار

#### زر الإغلاق:
- يغلق قائمة تغيير الحالة
- يلغي أي تعديلات

#### زر الحفظ/التعديل:
```javascript
onClick={() => {
  setSelectedStatus(currentStatus);
  setShowStatusDropdown(!showStatusDropdown);
}}
```
- يفتح/يغلق قائمة التغيير
- يحفظ الحالة المختارة

#### زر القائمة:
- يفتح/يغلق dropdown
- يعرض جميع الحالات المتاحة

---

### 5. قائمة تغيير الحالة

عند النقر على أي من الأزرار:

```
┌─────────────────────────────────────┐
│  تغيير حالة الطلب                  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ اختر حالة جديدة              │ ▼│
│  └──────────────────────────────┘  │
│                                     │
│  • تم التقديم                      │
│  • قيد المراجعة                    │
│  • تمت الموافقة                    │
│  • في انتظار الدفع                 │
│  • تم الدفع                        │
│  • يتطلب موعد                      │
│  • ... (جميع الحالات)              │
│                                     │
│  [إلغاء]              [حفظ ✓]     │
└─────────────────────────────────────┘
```

---

### 6. التكامل مع جدول `application_statuses`

#### البيانات المستخدمة:

```sql
SELECT
  id,              -- المعرف الفريد
  status_key,      -- المفتاح (submitted, in_review, etc.)
  name_ar,         -- الاسم بالعربية
  name_en,         -- الاسم بالإنجليزية
  color,           -- اللون (#3B82F6, #10B981, etc.)
  order_index,     -- الترتيب
  is_active        -- نشط؟
FROM application_statuses
WHERE is_active = true
ORDER BY order_index;
```

#### الحالات المتاحة (16 حالة):

| الترتيب | status_key | name_ar | اللون |
|---------|------------|---------|-------|
| 1 | submitted | تم التقديم | #3B82F6 |
| 2 | in_review | قيد المراجعة | #F59E0B |
| 3 | approved | تمت الموافقة | #10B981 |
| 4 | payment_pending | في انتظار الدفع | #F59E0B |
| 5 | payment_completed | تم الدفع | #10B981 |
| 6 | appointment_required | يتطلب موعد | #F59E0B |
| 7 | appointment_booked | تم حجز الموعد | #10B981 |
| 8 | processing | قيد المعالجة | #3B82F6 |
| 9 | ready | جاهز للاستلام | #10B981 |
| 10 | shipping | قيد الشحن | #3B82F6 |
| 11 | shipped | تم الشحن | #10B981 |
| 12 | delivered | تم التسليم | #10B981 |
| 13 | completed | مكتمل | #10B981 |
| 14 | rejected | مرفوض | #EF4444 |
| 15 | cancelled | ملغى | #6B7280 |

---

### 7. سجل الأنشطة

كل تغيير في الحالة يُسجل تلقائياً:

```javascript
const historyData = {
  application_id: id,
  old_status: oldStatusKey,
  new_status: newStatus.status_key,
  changed_by: staffData.id,
  staff_name: staffData.full_name_ar,
  notes: `تم تغيير الحالة إلى: ${newStatus.name_ar}`
};

await supabase
  .from('status_history')
  .insert([historyData]);
```

---

### 8. المواعيد التلقائية

عند تغيير الحالة إلى "يتطلب موعد":

```javascript
if (newStatus.status_key === 'appointment_required') {
  await supabase
    .from('appointments')
    .insert([{
      application_id: id,
      appointment_date: futureDate, // بعد 7 أيام
      appointment_time: '09:00:00',
      status: 'pending',
      notes: 'في انتظار تحديد الموعد من قبل المستخدم',
      created_by: staffData.id
    }]);
}
```

---

## 🎨 الشكل النهائي

### شريط الإجراءات الكامل:

```
┌──────────────────────────────────────────────────────────────┐
│  [❌] [💾] [🔽] [تم التقديم ●]   [🖨️]   [💲 تعديل السعر]  │
└──────────────────────────────────────────────────────────────┘
```

**من اليمين لليسار**:
1. عنصر الحالة المركّب (4 أجزاء)
2. زر الطباعة
3. زر تعديل السعر

---

## ✅ المميزات

✅ **عرض واضح للحالة**: اسم + لون مميز
✅ **تعديل سهل**: 3 أزرار سريعة
✅ **دعم متعدد**: يعمل مع status و status_id
✅ **تسجيل تلقائي**: كل تغيير يُحفظ
✅ **مواعيد ذكية**: إنشاء تلقائي عند الحاجة
✅ **قيم افتراضية**: لا يظهر "undefined" أبداً

---

## 🔧 استكشاف الأخطاء

### إذا لم تظهر الحالة:

1. **تحقق من وجود البيانات**:
```sql
SELECT * FROM application_statuses WHERE is_active = true;
```

2. **تحقق من حقل الحالة**:
```sql
SELECT id, status, status_id FROM applications LIMIT 5;
```

3. **تحقق من الـ console**:
```javascript
console.log('Current Status:', currentStatus);
console.log('Application:', application);
```

### إذا لم يعمل التغيير:

1. **تحقق من الصلاحيات** (RLS)
2. **تحقق من جدول status_history**
3. **راجع الـ Network tab** في DevTools

---

تم التحديث: 2026-04-01
