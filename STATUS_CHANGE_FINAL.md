# نظام تغيير الحالة النهائي

## التصميم النهائي - 2026-04-01

### 📱 الحالة 1: العرض الأولي

```
[ℹ️]  [تم التقديم ●]
```

**من اليمين لليسار**:
- أيقونة معلومات (زر التعديل)
- عرض الحالة + نقطة ملونة

---

### 📱 الحالة 2: وضع التعديل (الترتيب الصحيح)

```
[قائمة الحالات ▼]  [🔽]  [💾]  [❌]
```

**من اليمين لليسار**:
1. **قائمة منسدلة** - اختيار الحالة الجديدة
2. **سهم للأسفل** - مؤشر visual
3. **زر حفظ أخضر** - حفظ التغييرات
4. **زر إغلاق** - إلغاء

---

## 🎨 الكود

### الترتيب الصحيح (RTL):

```jsx
<div className="flex items-center gap-0">
  {/* 1. Status dropdown - أول عنصر من اليمين */}
  <select
    value={selectedStatus?.id || selectedStatus?.status_key || ''}
    onChange={(e) => {
      const newStatusValue = e.target.value;
      const newStatus = availableStatuses.find(s =>
        s.id === newStatusValue || s.status_key === newStatusValue
      );
      if (newStatus) {
        setSelectedStatus(newStatus);
      }
    }}
    className="px-4 py-2.5 bg-white border border-gray-300 rounded-r-lg font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer min-w-[200px]"
  >
    <option value="">اختر حالة جديدة</option>
    {availableStatuses.map((status) => (
      <option key={status.id} value={status.id}>
        {status.name_ar}
      </option>
    ))}
  </select>

  {/* 2. Dropdown arrow */}
  <button className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 text-gray-600 border-t border-b border-l border-gray-300">
    <ChevronDown className="w-4 h-4" />
  </button>

  {/* 3. Save button - أخضر */}
  <button
    onClick={async () => {
      if (selectedStatus?.id || selectedStatus?.status_key) {
        await handleStatusChange(selectedStatus.id || selectedStatus.status_key);
        setShowStatusDropdown(false);
      }
    }}
    className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white transition-colors"
  >
    <SaveIcon />
  </button>

  {/* 4. Close button - آخر عنصر */}
  <button
    onClick={() => {
      setShowStatusDropdown(false);
      setSelectedStatus(null);
    }}
    className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 text-gray-600 rounded-l-lg border border-gray-300"
  >
    <XIcon />
  </button>
</div>
```

---

## 🔄 آلية الحفظ الكاملة

### 1. تحديث حالة الطلب:

```javascript
const updateData = { updated_at: new Date().toISOString() };

// دعم كلا النوعين
if (application.status !== undefined) {
  updateData.status = newStatus?.status_key;
}
if (application.status_id !== undefined) {
  updateData.status_id = newStatusValue;
}

await supabase
  .from('applications')
  .update(updateData)
  .eq('id', id);
```

---

### 2. تسجيل في الأنشطة:

```javascript
const historyData = {
  application_id: id,
  old_status: oldStatusKey,
  new_status: newStatus?.status_key,
  changed_by: staffData?.id,
  staff_name: staffData?.full_name_ar || 'موظف',
  notes: `تم تغيير الحالة إلى: ${newStatus?.name_ar}`,
  status_id: newStatus?.id  // إضافة مرجع الحالة
};

await supabase
  .from('status_history')
  .insert([historyData]);
```

**الحقول المسجلة**:
- `application_id`: معرف الطلب
- `old_status`: الحالة القديمة
- `new_status`: الحالة الجديدة
- `changed_by`: معرف الموظف
- `staff_name`: اسم الموظف
- `notes`: ملاحظات التغيير
- `status_id`: معرف الحالة الجديدة
- `created_at`: تاريخ التغيير (تلقائي)

---

### 3. إنشاء موعد إن لزم:

```javascript
const appointmentStatuses = [
  'appointment_required',
  'appointment_booked',
  'appointment_confirmed'
];

if (appointmentStatuses.includes(newStatus?.status_key)) {
  const { data: existingAppointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('application_id', id)
    .maybeSingle();

  if (!existingAppointment && newStatus?.status_key === 'appointment_required') {
    await supabase
      .from('appointments')
      .insert([{
        application_id: id,
        appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        appointment_time: '09:00:00',
        status: 'pending',
        notes: 'في انتظار تحديد الموعد من قبل المستخدم',
        created_by: staffData?.id
      }]);
  }
}
```

---

### 4. إعادة تحميل البيانات:

```javascript
await loadApplicationDetail();
setShowStatusDropdown(false);

alert('تم تغيير حالة الطلب بنجاح');
```

---

## 📊 جدول status_history

### الهيكل:

```sql
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES staff(id),
  staff_name TEXT,
  status_id UUID REFERENCES application_statuses(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### مثال على البيانات المسجلة:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "application_id": "123e4567-e89b-12d3-a456-426614174000",
  "old_status": "submitted",
  "new_status": "approved",
  "changed_by": "789e0123-e45b-67c8-d901-234567890abc",
  "staff_name": "أحمد محمد",
  "status_id": "999e8400-e29b-41d4-a716-446655440000",
  "notes": "تم تغيير الحالة إلى: تمت الموافقة",
  "created_at": "2026-04-01T10:30:00.000Z"
}
```

---

## 🔍 عرض الأنشطة

في قسم "الأنشطة الأخيرة":

```jsx
{statusHistory.map((history) => (
  <div key={history.id} className="border-l-4 border-blue-500 pl-4 py-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="font-semibold text-gray-900">
          {history.notes || 'تم تحديث الحالة'}
        </p>
        <p className="text-sm text-gray-500">
          بواسطة: {history.staff_name || 'النظام'}
        </p>
      </div>
      <span className="text-xs text-gray-400">
        {new Date(history.created_at).toLocaleString('ar-SA')}
      </span>
    </div>
  </div>
))}
```

---

## ✅ التأكد من الحفظ الصحيح

### 1. فحص جدول applications:

```sql
SELECT
  id,
  reference_number,
  status,
  status_id,
  updated_at
FROM applications
WHERE id = 'YOUR_APPLICATION_ID';
```

**المتوقع**: الحقل `status` أو `status_id` متحدث بالقيمة الجديدة

---

### 2. فحص جدول status_history:

```sql
SELECT
  old_status,
  new_status,
  staff_name,
  notes,
  created_at
FROM status_history
WHERE application_id = 'YOUR_APPLICATION_ID'
ORDER BY created_at DESC
LIMIT 5;
```

**المتوقع**: سجل جديد بالتغيير

---

### 3. فحص جدول appointments (إن وجد):

```sql
SELECT
  id,
  application_id,
  appointment_date,
  appointment_time,
  status,
  notes
FROM appointments
WHERE application_id = 'YOUR_APPLICATION_ID';
```

**المتوقع**: موعد جديد إذا كانت الحالة "يتطلب موعد"

---

## 🎯 سيناريوهات الاختبار

### سيناريو 1: تغيير حالة عادية

```
1. فتح صفحة تفاصيل الطلب
2. الضغط على أيقونة المعلومات (ℹ️)
3. اختيار "تمت الموافقة" من القائمة
4. الضغط على زر الحفظ الأخضر (💾)

✅ النتائج المتوقعة:
- تحديث حالة الطلب في applications
- إضافة سجل في status_history
- إظهار رسالة نجاح
- إغلاق dropdown
- تحديث العرض
```

---

### سيناريو 2: تغيير لحالة تتطلب موعد

```
1. فتح صفحة تفاصيل الطلب
2. الضغط على أيقونة المعلومات
3. اختيار "يتطلب موعد"
4. الضغط على زر الحفظ

✅ النتائج المتوقعة:
- تحديث حالة الطلب
- إضافة سجل في status_history
- إنشاء موعد في appointments
- رسالة: "تم تغيير حالة الطلب بنجاح + تم إرسال إشعار"
```

---

### سيناريو 3: إلغاء التغيير

```
1. الضغط على أيقونة المعلومات
2. اختيار حالة جديدة
3. الضغط على زر الإغلاق (❌)

✅ النتائج المتوقعة:
- عدم حفظ أي تغيير
- إغلاق dropdown
- البقاء على الحالة الحالية
```

---

### سيناريو 4: تغيير متعدد

```
1. تغيير الحالة من "تم التقديم" إلى "قيد المراجعة"
2. حفظ
3. تغيير الحالة من "قيد المراجعة" إلى "تمت الموافقة"
4. حفظ

✅ النتائج المتوقعة:
- سجلان في status_history
- تسلسل صحيح للحالات
- أسماء الموظفين محفوظة
- تواريخ صحيحة
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يظهر السجل في الأنشطة

**الحلول**:
1. تحقق من جدول status_history مباشرة
2. تأكد من وجود بيانات الموظف
3. تحقق من الصلاحيات (RLS)

```sql
-- فحص السجلات
SELECT * FROM status_history
WHERE application_id = 'YOUR_ID'
ORDER BY created_at DESC;

-- فحص الصلاحيات
SELECT * FROM information_schema.table_privileges
WHERE table_name = 'status_history';
```

---

### المشكلة: خطأ عند الحفظ

**الحلول**:
1. افتح DevTools > Console
2. تحقق من رسالة الخطأ
3. تأكد من:
   - وجود جدول status_history
   - صلاحيات الكتابة
   - صحة البيانات

---

### المشكلة: لا يُنشأ موعد

**التحقق**:
```javascript
console.log('Status key:', newStatus?.status_key);
console.log('Is appointment status?',
  appointmentStatuses.includes(newStatus?.status_key)
);
```

---

## 📝 الخلاصة

النظام الآن يعمل بشكل كامل:

✅ **عرض نظيف**: حالة + أيقونة
✅ **تعديل سهل**: dropdown + أزرار
✅ **حفظ صحيح**: تحديث في applications
✅ **تسجيل كامل**: سجل في status_history
✅ **معلومات شاملة**: موظف + تاريخ + ملاحظات
✅ **مواعيد تلقائية**: إنشاء عند الحاجة
✅ **تجربة ممتازة**: سلسة وواضحة

---

تم التحديث: 2026-04-01
الإصدار: 4.0 (النهائي)
