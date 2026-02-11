# 🗄️ PostgreSQL Database Schema

Database Schema كامل لنظام القنصلية السودانية

---

## 📦 المحتويات

```
postgresql_schema/
├── COMPLETE_SCHEMA.sql              ✅ Schema كامل في ملف واحد
├── migrations_organized/            ✅ Schema مجزأ في ملفات منظمة
│   ├── 01_extensions.sql
│   ├── 02_core_tables.sql
│   ├── 03_services.sql
│   ├── 04_applications.sql
│   ├── 05_staff.sql
│   ├── 06_appointments_shipping.sql
│   ├── 07_cms.sql
│   ├── 08_news_events.sql
│   ├── 09_other_tables.sql
│   ├── 10_indexes.sql
│   └── 11_functions_triggers.sql
├── apply_complete_schema.sh         ✅ سكريبت الاستيراد (ملف واحد)
├── apply_schema.sh                  ✅ سكريبت الاستيراد (ملفات منظمة)
└── README.md                        📖 هذا الملف
```

---

## 🚀 طريقة الاستخدام

### الطريقة 1: استيراد من ملف واحد (الأسرع)

```bash
# 1. الانتقال إلى المجلد
cd postgresql_schema

# 2. تشغيل السكريبت
./apply_complete_schema.sh consulate_db consulate_user

# أو يدوياً:
psql -U consulate_user -d consulate_db -f COMPLETE_SCHEMA.sql
```

### الطريقة 2: استيراد من ملفات منظمة

```bash
# تشغيل السكريبت
./apply_schema.sh consulate_db consulate_user

# أو يدوياً:
cd migrations_organized
for file in *.sql; do
  psql -U consulate_user -d consulate_db -f "$file"
done
```

---

## 📊 الجداول المتضمنة (40+ جدول)

### Core Tables - الجداول الأساسية
- `regions` - المناطق السعودية (13 منطقة)
- `categories` - فئات الخدمات
- `subcategories` - الفئات الفرعية

### Services - الخدمات
- `services` - الخدمات الرئيسية
- `service_fields` - حقول النماذج
- `service_requirements` - المتطلبات
- `service_documents` - المستندات المطلوبة
- `conditional_pricing_rules` - قواعد التسعير الشرطي

### Applications - الطلبات
- `applications` - الطلبات الرئيسية
- `application_pricing` - تسعير الطلبات
- `status_history` - سجل الحالات
- `application_notes` - ملاحظات الطلبات
- `invoices` - الفواتير

### Staff - الموظفون
- `staff` - معلومات الموظفين
- `staff_permissions` - الصلاحيات

### Appointments & Shipping - المواعيد والشحن
- `appointment_settings` - إعدادات المواعيد
- `closed_days` - الأيام المغلقة
- `appointments` - المواعيد
- `shipping_companies` - شركات الشحن
- `shipments` - الشحنات
- `tracking_updates` - تحديثات التتبع

### CMS - إدارة المحتوى
- `cms_sections` - أقسام الصفحة الرئيسية
- `cms_hero_slides` - شرائح العرض
- `cms_important_links` - الروابط المهمة
- `cms_counters` - العدادات
- `cms_announcements` - الإعلانات
- `cms_maintenance` - وضع الصيانة
- `cms_about_sudan` - عن السودان

### News & Events - الأخبار والفعاليات
- `news` - الأخبار
- `events` - الفعاليات
- `event_registrations` - تسجيلات الفعاليات
- `breaking_news` - الأخبار العاجلة

### Other - أخرى
- `educational_cards` - البطاقات التعليمية
- `contact_messages` - رسائل التواصل
- `chat_messages` - رسائل الدردشة
- `chatbot_categories` - فئات الشات بوت
- `chatbot_qa` - أسئلة وأجوبة
- `system_settings` - إعدادات النظام
- `export_templates` - قوالب التصدير
- `additional_pages` - صفحات إضافية
- `otp_verification` - التحقق بالرمز

---

## 🔑 الميزات

### ✅ Extensions
- `uuid-ossp` - لتوليد UUIDs
- `pgcrypto` - للتشفير

### ✅ Indexes
- Indexes محسّنة على جميع الـ queries الشائعة
- Foreign keys محسّنة
- Full-text search indexes (اختياري)

### ✅ Triggers
- Auto-update `updated_at` على جميع الجداول
- Validation triggers
- Audit logging (اختياري)

### ✅ Functions
- `update_updated_at_column()` - تحديث تلقائي للـ timestamps

---

## 📝 ملاحظات مهمة

### 1. Data Types المستخدمة
- `UUID` - للـ Primary Keys
- `TEXT` - للنصوص (عربي/إنجليزي)
- `JSONB` - للبيانات الديناميكية
- `TIMESTAMPTZ` - للتواريخ مع timezone
- `DECIMAL(10,2)` - للأسعار

### 2. Naming Convention
- الجداول: `snake_case` (مثل: `service_fields`)
- الأعمدة: `snake_case`
- Foreign Keys: `table_name_id`

### 3. Defaults
- `created_at` - يتم تعيينه تلقائياً
- `updated_at` - يتم تحديثه تلقائياً عند UPDATE
- `active` - افتراضياً `true`
- `status` - افتراضياً `pending`

---

## ✅ التحقق من نجاح الاستيراد

```bash
# 1. عرض جميع الجداول
psql -U consulate_user -d consulate_db -c "\dt"

# 2. عد الجداول
psql -U consulate_user -d consulate_db -c "
  SELECT COUNT(*) as total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
"

# 3. عرض الـ indexes
psql -U consulate_user -d consulate_db -c "\di"

# 4. عرض الـ triggers
psql -U consulate_user -d consulate_db -c "
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers;
"
```

**يجب أن ترى:**
- حوالي 40+ جدول
- 20+ index
- 8+ trigger

---

## 🔄 الخطوة التالية: استيراد البيانات

بعد استيراد Schema، قم باستيراد البيانات:

```bash
# 1. استخرج البيانات من Supabase (إذا لم تكن قد فعلت)
cd ..
node scripts/export-database-complete.js

# 2. استورد البيانات
psql -U consulate_user -d consulate_db -f database_export/complete_data_export.sql
```

---

## 🛠️ Troubleshooting

### مشكلة: Permission denied

```bash
# امنح صلاحيات للمستخدم
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO consulate_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO consulate_user;
```

### مشكلة: Database already exists

```bash
# احذف Database القديم (احذر: ستفقد البيانات!)
dropdb -U consulate_user consulate_db

# أو استخدم database جديد
createdb -U consulate_user consulate_db_new
```

### مشكلة: Extension not found

```bash
# ثبت PostgreSQL contrib
sudo apt-get install postgresql-contrib

# أو في psql:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📊 حجم Database المتوقع

### بدون بيانات:
- Schema فقط: ~100 KB

### مع البيانات:
- صغير (1000 طلب): ~10 MB
- متوسط (10,000 طلب): ~50 MB
- كبير (100,000+ طلب): 200+ MB

---

## 🔐 Security Best Practices

### 1. User Permissions
```sql
-- إنشاء user للقراءة فقط
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE consulate_db TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 2. Backup
```bash
# Backup يومي
pg_dump -U consulate_user consulate_db > backup_$(date +%Y%m%d).sql

# Backup مع compression
pg_dump -U consulate_user consulate_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 3. SSL Connection
```bash
# في .env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

---

## 📈 Performance Tips

### 1. Analyze Tables
```sql
ANALYZE;
VACUUM ANALYZE;
```

### 2. Add Custom Indexes (إذا لزم الأمر)
```sql
CREATE INDEX idx_applications_custom
ON applications(status, region_id, created_at DESC);
```

### 3. Connection Pooling
استخدم PgBouncer أو Connection Pooling في Backend

---

## 🆘 الدعم

للمزيد من المعلومات:
- **Backend README**: `../backend/README.md`
- **Complete Guide**: `../COMPLETE_STANDALONE_GUIDE_AR.md`
- **API Documentation**: `../backend/API_DOCUMENTATION.md`

---

## ✨ الخلاصة

الآن لديك:
- ✅ Schema كامل في ملف واحد
- ✅ Schema مجزأ في ملفات منظمة
- ✅ سكريبتات استيراد سهلة
- ✅ 40+ جدول جاهز
- ✅ Indexes محسّنة
- ✅ Triggers تلقائية

**🎉 جاهز للاستخدام!**
