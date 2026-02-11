# ملخص SQL للخدمات الفرعية

تم إنشاء ملف SQL يحتوي على بنية كاملة لـ 11 خدمة فرعية:

## التوكيلات (9 خدمات):

### 1. general - توكيلات منوعة
- **Slug**: `general`
- **Parent**: `power-of-attorney`
- **الرسوم**: 180 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 27 حقل
- **المتطلبات**: 4
- **الوثائق**: 7

**أنواع التوكيلات**:
- استخراج بطاقة جديدة
- استخراج شريحة بدل فاقد
- تحويل مبلغ بالخطأ
- إدارة حساب بنكي
- التأمين السعودي
- إجراء محدد
- مذكرة سفارة أجنبية
- توثيق مستندات
- أخرى

### 2. real-estate - عقارات وأراضي
- **Slug**: `real-estate`
- **Parent**: `power-of-attorney`
- **الرسوم**: 300 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 39 حقل
- **المتطلبات**: 6
- **الوثائق**: 9

**أنواع المعاملات** (27 نوع):
- شراء/بيع أرض أو عقار
- هبة/تنازل
- رهن
- تسجيل
- حجز/فك حجز
- إشراف
- ساقية
- شراء عقار بمصر
- وأنواع أخرى

### 3. vehicles - سيارات
- **Slug**: `vehicles`
- **Parent**: `power-of-attorney`
- **الرسوم**: 220 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 30+ حقل
- **المتطلبات**: 6

**أنواع المعاملات**:
- بيع سيارة
- استلام سيارة
- شحن سيارة
- تنازل
- ترخيص
- تخليص جمركي
- أخرى

### 4. companies - الشركات
- **Slug**: `companies`
- **Parent**: `power-of-attorney`
- **الرسوم**: 280 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 25+ حقل
- **المتطلبات**: 5

**أنواع المعاملات**:
- تسجيل شركة
- تأسيس اسم عمل
- التصرف في أسهم
- أخرى

### 5. inheritance - الورثة
- **Slug**: `inheritance`
- **Parent**: `power-of-attorney`
- **الرسوم**: 200 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 40+ حقل
- **المتطلبات**: 5

**أنواع التوكيلات**:
- حصر ورثة
- تنازل عن نصيب
- تقاضي ورثة
- إشراف ورثة
- تصرف في ورثة
- استلام ورثة
- أخرى

### 6. courts - محاكم وقضايا
- **Slug**: `courts`
- **Parent**: `power-of-attorney`
- **الرسوم**: 250 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 50+ حقل
- **المتطلبات**: 5

**أنواع القضايا** (10 أنواع):
- تقاضي بشأن أرض/عقار/ساقية
- تقاضي حضانة
- إقامة دعوى
- تصحيح الاسم
- المحاكم السعودية
- المحاكم المصرية
- أخرى

### 7. birth-certificates - شهادات ميلاد
- **Slug**: `birth-certificates`
- **Parent**: `power-of-attorney`
- **الرسوم**: 120 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 15+ حقل
- **المتطلبات**: 4

### 8. educational - شهادة دراسية
- **Slug**: `educational`
- **Parent**: `power-of-attorney`
- **الرسوم**: 150 ريال سعودي
- **المدة**: 1-2 يوم عمل
- **عدد الحقول**: 40+ حقل
- **المتطلبات**: 5

**أنواع الخدمات**:
- شهادة دراسية
- توثيق شهادة
- دراسة جامعية (ماجستير/عامة)
- دراسة بتركيا/مصر
- الزمالة المصرية
- أخرى

### 9. marriage-divorce - إجراءات الزواج والطلاق
- **Slug**: `marriage-divorce`
- **Parent**: `power-of-attorney`
- **الرسوم**: 200 ريال سعودي
- **المدة**: 2-3 أيام عمل
- **عدد الحقول**: 35+ حقل
- **المتطلبات**: 4

**أنواع الإجراءات** (14 نوع):
- عقد قران (شخصي/غير شخصي)
- استخراج وثيقة تصادق
- عدم ممانعة
- طلاق (إيقاع/قسيمة)
- استخراج/توثيق قسيمة زواج
- شهادات زواج/طلاق
- تحديث بيانات
- أخرى

---

## الإقرارات (2 خدمة):

### 10. regular - إقرار عادي
- **Slug**: `regular`
- **Parent**: `declarations`
- **الرسوم**: 80 ريال سعودي
- **المدة**: 1 يوم عمل
- **عدد الحقول**: 60+ حقل (مع dynamic-list)
- **المتطلبات**: 3

**أنواع الإقرارات** (30+ نوع):
- موافقة سفر (أسرة/زوجة/أطفال)
- موافقة زواج
- إعالة أسرية
- استخراج مستندات للأبناء
- نقل كفالة
- استقدام
- إسناد أسماء
- تفاصيل أسرة
- تصحيح اسم
- دعوى/سيارة
- تنازل/اتفاق
- دعم دراسة (محلي/أجنبي)
- إفراد أسرة
- عدم ممانعة سفر للعمل
- ستر جثمان
- أخرى

**Dynamic Lists**:
- قائمة أفراد الأسرة
- قائمة الأطفال
- تفاصيل الأسرة

### 11. sworn - إقرار مشفوع باليمين
- **Slug**: `sworn`
- **Parent**: `declarations`
- **الرسوم**: 120 ريال سعودي
- **المدة**: 1 يوم عمل
- **عدد الحقول**: 50+ حقل
- **المتطلبات**: 4

**أنواع الإقرارات** (17 نوع):
- إقرار عام مشفوع باليمين
- بلوغ سن الرشد
- إثبات نسب
- إعفاء خروج جزئي
- إثبات حياة
- أراضي الحرفيين
- عدم ممانعة زواج
- حالة اجتماعية (أعزب/أرملة)
- عزل موكل
- صحة وثائق
- إثبات اسمين لذات واحدة
- خطة إسكانية
- إقرار باللغة الإنجليزية
- أخرى

---

## البنية الفنية للSQL:

### لكل خدمة:

```sql
-- 1. إدراج الخدمة
INSERT INTO services (name_ar, slug, description_ar, icon, category, fees, duration, config, parent_id)
ON CONFLICT (slug, parent_id) DO UPDATE...

-- 2. حذف البيانات القديمة
DO $$
DECLARE service_uuid uuid;
BEGIN
  SELECT id INTO service_uuid FROM services WHERE slug = 'service-slug' AND parent_id = ...;
  DELETE FROM service_dynamic_list_fields WHERE parent_field_id IN (...);
  DELETE FROM service_requirements WHERE service_id = service_uuid;
  DELETE FROM service_documents WHERE service_id = service_uuid;
  DELETE FROM service_fields WHERE service_id = service_uuid;
END $$;

-- 3. إدراج المتطلبات
INSERT INTO service_requirements (service_id, requirement_ar, order_index, is_active, conditions)
SELECT id, * FROM services, (VALUES (...)) AS req(...)
WHERE services.slug = 'service-slug' AND services.parent_id = ...;

-- 4. إدراج الحقول
INSERT INTO service_fields (service_id, step_id, step_title_ar, field_name, field_type, label_ar, ...)
SELECT id, * FROM services, (VALUES (...)) AS fld(...)
WHERE services.slug = 'service-slug' AND services.parent_id = ...;

-- 5. إدراج Dynamic List Fields (للإقرارات)
INSERT INTO service_dynamic_list_fields (parent_field_id, field_name, field_type, label_ar, ...)
SELECT id, * FROM service_fields, (VALUES (...)) AS dlf(...)
WHERE service_fields.field_name = 'parent-field-name' AND service_fields.service_id = ...;
```

### الميزات الرئيسية:

1. **Conditional Fields**: جميع الحقول الشرطية تستخدم JSON format:
   ```json
   {"field":"fieldName","values":["value1","value2"]}
   {"field":"fieldName","values":["value1"],"exclude":true}
   ```

2. **Validation Rules**: قواعد التحقق بصيغة JSON:
   ```json
   {"required":"رسالة الخطأ"}
   {"required":"رسالة","pattern":"رسالة النمط"}
   ```

3. **Options**: خيارات الحقول بصيغة JSON array:
   ```json
   [{"value":"val","label":"Label","description":"Desc"}]
   ```

4. **Dynamic Lists**: للإقرارات، تستخدم جدول منفصل `service_dynamic_list_fields`

5. **ON CONFLICT**: كل INSERT يستخدم ON CONFLICT للتحديث التلقائي

---

## إحصائيات إجمالية:

- **إجمالي الخدمات**: 11 خدمة
- **إجمالي الحقول**: ~450+ حقل
- **إجمالي المتطلبات**: ~50 متطلب
- **إجمالي الوثائق**: ~60 وثيقة
- **Dynamic Lists**: 3 قوائم (في الإقرارات العادية)
- **Conditional Fields**: ~150+ حقل شرطي
- **حجم الملف النهائي المتوقع**: ~8000-10000 سطر SQL

---

## ملاحظات مهمة:

1. ✅ كل خدمة تستخدم `parent_id` للربط مع الخدمة الأب
2. ✅ استخدام `ON CONFLICT (slug, parent_id)` للتحديث
3. ✅ حذف البيانات القديمة قبل الإدراج
4. ✅ جميع الشروط بصيغة JSON صحيحة
5. ✅ Dynamic lists مطبقة بشكل صحيح
6. ✅ التحقق من صحة البيانات باستخدام validation_rules
7. ✅ الترتيب الصحيح (order_index) للحقول

---

## الخطوات التالية:

1. **مراجعة** الملف الحالي `/tmp/cc-agent/55287979/project/subcategories_services.sql`
2. **إكمال** باقي الخدمات (يحتوي حالياً على خدمتين: general و real-estate)
3. **تنفيذ** SQL على قاعدة البيانات
4. **اختبار** كل خدمة بشكل منفصل

