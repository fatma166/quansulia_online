# 🔄 نقل قاعدة البيانات من VPS إلى Supabase

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نقل قاعدة البيانات PostgreSQL من VPS الخاص بك إلى Supabase السحابي.

---

## 🚀 الخطوات السريعة

### 1️⃣ تحميل السكريبت إلى VPS

```bash
# اتصل بالـ VPS
ssh root@62.12.101.237

# انتقل إلى مجلد المشروع
cd /path/to/your/project

# ارفع السكريبت من جهازك المحلي
# أو انسخ محتوى السكريبت يدوياً
```

### 2️⃣ إعطاء صلاحيات التنفيذ

```bash
chmod +x scripts/export-vps-database.sh
```

### 3️⃣ تشغيل السكريبت

```bash
./scripts/export-vps-database.sh
```

السكريبت سيقوم بـ:
- ✅ قراءة بيانات الاتصال من `.env` تلقائياً
- ✅ تصدير الـ schema (هيكل الجداول)
- ✅ تصدير الـ data (البيانات)
- ✅ إنشاء dump كامل ونظيف جاهز لـ Supabase
- ✅ إنشاء ملف تعليمات مفصل

### 4️⃣ تحميل الملفات

```bash
# من جهازك المحلي، حمل الملفات
scp root@62.12.101.237:/path/to/project/database-exports/supabase_ready_*.sql .
```

أو استخدم FileZilla/WinSCP للتحميل.

### 5️⃣ استيراد إلى Supabase

**الطريقة الأولى: SQL Editor (للملفات الصغيرة/المتوسطة)**

1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انقر **New Query**
5. افتح ملف `supabase_ready_*.sql`
6. انسخ المحتوى بالكامل والصقه
7. انقر **Run** (Ctrl+Enter)
8. انتظر حتى ينتهي (قد يستغرق دقائق)

**الطريقة الثانية: psql (للملفات الكبيرة)**

```bash
# احصل على connection string من Supabase:
# Project Settings > Database > Connection string > URI

# استورد الملف
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase_ready_*.sql
```

---

## 📁 الملفات المُصدَّرة

سيتم إنشاء مجلد `database-exports` يحتوي على:

| الملف | الوصف | الاستخدام |
|------|------|---------|
| `schema_*.sql` | هيكل الجداول فقط | للمراجعة |
| `data_*.sql` | البيانات فقط | للمراجعة |
| `complete_dump_*.sql` | نسخة كاملة | نسخة احتياطية |
| `supabase_ready_*.sql` | ⭐ جاهز لـ Supabase | **استخدم هذا** |
| `IMPORT_INSTRUCTIONS_*.md` | تعليمات مفصلة | للمراجعة |

---

## ⚙️ التخصيصات المتقدمة

### تصدير جداول معينة فقط

```bash
# عدل السكريبت وأضف:
pg_dump ... --table=applications --table=services -f output.sql
```

### تصدير بدون بيانات معينة

```bash
# عدل السكريبت وأضف:
pg_dump ... --exclude-table-data=logs -f output.sql
```

### ضغط الملف (للملفات الكبيرة)

```bash
# بعد التصدير
gzip database-exports/supabase_ready_*.sql

# للاستيراد
gunzip supabase_ready_*.sql.gz
```

---

## 🔍 التحقق بعد الاستيراد

### 1. تحقق من عدد الجداول

```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```

### 2. تحقق من عدد السجلات

```sql
-- في VPS (قبل النقل)
SELECT 'applications' as table_name, COUNT(*) as count FROM applications
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'staff', COUNT(*) FROM staff;
```

ثم قارن النتيجة مع نفس الاستعلام في Supabase.

### 3. تحقق من RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 4. تحقق من الـ Sequences

```sql
-- تأكد أن الـ sequences محدثة
SELECT sequencename, last_value
FROM pg_sequences
WHERE schemaname = 'public';
```

---

## 🛠️ استكشاف الأخطاء

### ❌ خطأ: "permission denied"

**السبب**: لا توجد صلاحيات كافية

**الحل**:
- تأكد أنك تستخدم SQL Editor في Supabase Dashboard
- أو استخدم connection string مع user `postgres`

---

### ❌ خطأ: "duplicate key value"

**السبب**: البيانات موجودة مسبقاً

**الحل**:
```sql
-- احذف الجداول القديمة أولاً
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- ثم استورد من جديد
```

---

### ❌ خطأ: "out of memory"

**السبب**: الملف كبير جداً

**الحل**: قسم الملف
```bash
# قسم إلى ملفات 1000 سطر لكل ملف
split -l 1000 supabase_ready_*.sql part_

# استورد كل جزء على حدة
```

---

### ❌ خطأ: "extension does not exist"

**السبب**: extension غير مفعل في Supabase

**الحل**:
1. اذهب إلى Supabase Dashboard
2. **Database** > **Extensions**
3. فعّل الـ extensions المطلوبة (uuid-ossp, pgcrypto, etc.)
4. أعد المحاولة

---

### ❌ الملف كبير جداً للـ SQL Editor

**الحل 1**: استخدم psql
```bash
psql "connection_string" -f supabase_ready_*.sql
```

**الحل 2**: استورد schema ثم data منفصلين
```bash
# أولاً: استورد الـ schema
psql "connection_string" -f schema_*.sql

# ثانياً: استورد الـ data
psql "connection_string" -f data_*.sql
```

---

## 🔐 أمان البيانات

### قبل النقل

```bash
# احفظ نسخة احتياطية من VPS
cp database-exports/complete_dump_*.sql /backup/location/

# أو ارفعها على سيرفر آخر
scp database-exports/complete_dump_*.sql user@backup-server:/backups/
```

### بعد النقل

```bash
# احذف الملفات الحساسة من VPS
rm -rf database-exports/

# أو احفظها في مكان آمن
mkdir -p ~/secure-backups
mv database-exports ~/secure-backups/
chmod 700 ~/secure-backups
```

---

## 📊 مقارنة الأداء

| العملية | VPS | Supabase |
|---------|-----|----------|
| السرعة | حسب السيرفر | ⚡ سريع جداً |
| الصيانة | يدوية | 🤖 تلقائية |
| النسخ الاحتياطي | يدوي | 🔄 تلقائي يومي |
| التوسع | محدود | ♾️ غير محدود |
| التكلفة | شهرية ثابتة | حسب الاستخدام |

---

## 🎯 بعد النقل الناجح

### 1. تحديث معلومات الاتصال في التطبيق

عدّل ملف `.env`:

```env
# VPS القديم (احذف أو علق)
# DB_HOST=62.12.101.237
# DB_PORT=5432
# DB_NAME=your_db
# DB_USER=your_user
# DB_PASSWORD=your_password

# Supabase الجديد
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. تحديث الكود

إذا كنت تستخدم `pg` أو `postgres.js`، حول إلى Supabase client:

```javascript
// القديم
import pg from 'pg';
const client = new pg.Client({...});

// الجديد
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
```

### 3. اختبر التطبيق

```bash
npm run dev
```

تأكد من:
- ✅ تسجيل الدخول يعمل
- ✅ عرض البيانات يعمل
- ✅ إضافة/تعديل البيانات يعمل
- ✅ رفع الملفات يعمل

---

## 📞 دعم إضافي

### روابط مفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL to Supabase Migration Guide](https://supabase.com/docs/guides/migrations)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

### أدوات مساعدة

- **Supabase Studio**: واجهة إدارة مدمجة
- **pgAdmin**: لإدارة قواعد بيانات متعددة
- **DBeaver**: عميل قواعد بيانات شامل

---

## ✨ مميزات Supabase بعد النقل

بعد النقل، ستحصل على:

- 🔐 **Auth مدمج**: نظام مصادقة كامل
- 📦 **Storage**: تخزين ملفات مدمج
- 🔄 **Realtime**: تحديثات فورية
- 🚀 **Edge Functions**: دوال serverless
- 📊 **Dashboard**: لوحة تحكم احترافية
- 🔒 **RLS**: أمان على مستوى الصفوف
- 💾 **Backups**: نسخ احتياطي تلقائي
- 📈 **Analytics**: تحليلات الأداء

---

## 🎉 تم بنجاح!

الآن قاعدة بياناتك على Supabase السحابي!

**الخطوات التالية**:
1. ✅ تحديث environment variables
2. ✅ تحديث الكود للاتصال بـ Supabase
3. ✅ اختبار التطبيق
4. ✅ حذف قاعدة البيانات القديمة (بعد التأكد)

**نصيحة**: احتفظ بنسخة من VPS لمدة أسبوع للتأكد من استقرار كل شيء قبل حذفها نهائياً.

---

**هل تحتاج مساعدة؟** راجع قسم "استكشاف الأخطاء" أو تواصل مع دعم Supabase.

🚀 **Happy coding!**
