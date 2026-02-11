# دليل إنشاء SQL للخدمات الفرعية

## الملفات المتوفرة:

1. **subcategories_services.sql** - يحتوي على خدمتين كاملتين (general, real-estate) كنموذج
2. **SERVICES_SQL_SUMMARY.md** - ملخص شامل لجميع الـ 11 خدمة مع التفاصيل
3. **generate_services_sql.py** - سكريبت Python (يحتاج تطوير)

## البنية المطلوبة لكل خدمة:

```sql
-- ========================================
-- خدمة: [اسم الخدمة]
-- ========================================

-- 1. إدراج الخدمة الأساسية
INSERT INTO services (...)
ON CONFLICT (slug, parent_id) DO UPDATE SET ...

-- 2. حذف البيانات القديمة
DO $$ ... END $$;

-- 3. إدراج المتطلبات
INSERT INTO service_requirements (...) SELECT id, * FROM services, (VALUES (...)) WHERE ...

-- 4. إدراج الحقول
INSERT INTO service_fields (...) SELECT id, * FROM services, (VALUES (...)) WHERE ...

-- 5. إدراج Dynamic List Fields (للإقرارات فقط)
INSERT INTO service_dynamic_list_fields (...) SELECT id, * FROM service_fields, (VALUES (...)) WHERE ...
```

## الخدمات المطلوبة:

### التوكيلات (power-of-attorney):
1. ✅ general - توكيلات منوعة (موجود في subcategories_services.sql)
2. ✅ real-estate - عقارات وأراضي (موجود في subcategories_services.sql)
3. ⏳ vehicles - سيارات
4. ⏳ companies - الشركات
5. ⏳ inheritance - الورثة
6. ⏳ courts - محاكم وقضايا
7. ⏳ birth-certificates - شهادات ميلاد
8. ⏳ educational - شهادة دراسية
9. ⏳ marriage-divorce - إجراءات الزواج والطلاق

### الإقرارات (declarations):
10. ⏳ regular - إقرار عادي (يحتوي على dynamic-lists)
11. ⏳ sworn - إقرار مشفوع باليمين

## الأنماط الشائعة:

### 1. الحقول الأساسية لجميع التوكيلات:
- agentName (text)
- agentId (text with pattern)
- poaUsageCountry (searchable-select)
- poaUsageCountryOther (conditional)
- witness1Name, witness1Id
- witness2Name, witness2Id

### 2. الحقول الشرطية:
```json
{"field":"fieldName","values":["value1","value2"]}
{"field":"fieldName","values":["value1"],"exclude":true}
```

### 3. قواعد التحقق:
```json
{"required":"رسالة الخطأ"}
{"required":"رسالة","pattern":"رسالة النمط"}
```

### 4. الخيارات:
```json
[
  {"value":"val1","label":"Label 1","description":"Desc 1"},
  {"value":"val2","label":"Label 2","description":"Desc 2"}
]
```

## الخطوات للإكمال:

### الطريقة اليدوية (موصى بها):
1. انسخ نموذج خدمة (general أو real-estate) من subcategories_services.sql
2. استبدل:
   - اسم الخدمة والوصف
   - slug
   - الرسوم والمدة
   - المتطلبات
   - الحقول (من ملفات config.js)
3. احفظ في ملف جديد أو أضف إلى الملف الحالي

### الطريقة الآلية (تحتاج تطوير):
1. طور سكريبت generate_services_sql.py لقراءة config.js بشكل صحيح
2. شغّل السكريبت: `python3 generate_services_sql.py`
3. راجع الملف المُولّد

## ملاحظات مهمة:

1. **Dynamic Lists** - تستخدم فقط في خدمة regular declarations:
   - familyMembers
   - childrenList
   - familyDetailsList

2. **Conditional Fields** - تأكد من صيغة JSON الصحيحة:
   - استخدم double quotes لـ keys
   - استخدم array للـ values
   - أضف exclude: true إذا لزم الأمر

3. **Order Index** - يجب أن يكون متسلسل ومرتب

4. **File Fields** - يجب تحديد:
   - accept
   - maxSize
   - required
   - validation_rules
   - conditional (إذا لزم الأمر)

## مثال سريع - إضافة خدمة vehicles:

```sql
-- خدمة: سيارات
INSERT INTO services (name_ar, slug, description_ar, icon, category, fees, duration, config, parent_id)
VALUES (
  'سيارات',
  'vehicles',
  'توكيل خاص بمعاملات السيارات والمركبات',
  'Car',
  'legal',
  '{"base":220,"currency":"ريال سعودي"}',
  '1-2 يوم عمل'::jsonb,
  TRUE,
  '{"process":[...],"hasSubcategories":false,"subcategories":[]}'::jsonb,
  (SELECT id FROM services WHERE slug = 'power-of-attorney')
)
ON CONFLICT (slug, parent_id) DO UPDATE SET ...;

-- ... باقي الكود (حذف البيانات، المتطلبات، الحقول)
```

## الحجم المتوقع:
- كل خدمة: ~400-800 سطر SQL
- 11 خدمة: ~5,000-9,000 سطر إجمالي
- حجم الملف: ~500KB-1MB

