# 🗄️ دليل Schema PostgreSQL - كل شيء جاهز!

---

## ✅ تم إنشاؤه بنجاح

تم إنشاء Database Schema كامل لنظام القنصلية السودانية بطريقتين:

### 1️⃣ ملف واحد كامل (الأسهل)
```
postgresql_schema/COMPLETE_SCHEMA.sql (24 KB)
```

### 2️⃣ ملفات منظمة (للمرونة)
```
postgresql_schema/migrations_organized/
├── 01_extensions.sql              (252 bytes)
├── 02_core_tables.sql             (1.1 KB)
├── 03_services.sql                (2.7 KB)
├── 04_applications.sql            (2.2 KB)
├── 05_staff.sql                   (975 bytes)
├── 06_appointments_shipping.sql   (2.3 KB)
├── 07_cms.sql                     (2.7 KB)
├── 08_news_events.sql             (1.9 KB)
├── 09_other_tables.sql            (3.3 KB)
├── 10_indexes.sql                 (2.2 KB)
└── 11_functions_triggers.sql      (1.5 KB)
```

---

## 🚀 كيف أستخدمه؟

### الطريقة السريعة (ملف واحد):

```bash
cd postgresql_schema

# استيراد Schema
./apply_complete_schema.sh consulate_db consulate_user

# أو يدوياً
psql -U consulate_user -d consulate_db -f COMPLETE_SCHEMA.sql
```

### الطريقة المنظمة (ملفات متعددة):

```bash
cd postgresql_schema

# استيراد Schema
./apply_schema.sh consulate_db consulate_user
```

---

## 📦 ما يتضمنه الـ Schema

### ✅ 40+ جدول:
- **Core**: regions, categories, subcategories
- **Services**: services, service_fields, service_requirements, service_documents
- **Applications**: applications, status_history, invoices
- **Staff**: staff, staff_permissions
- **Appointments**: appointments, appointment_settings, closed_days
- **Shipping**: shipments, shipping_companies, tracking_updates
- **CMS**: cms_sections, news, events, announcements
- **Chatbot**: chatbot_qa, chatbot_categories
- **Other**: educational_cards, contact_messages, system_settings

### ✅ 20+ Index محسّن
- جميع Foreign Keys
- Search fields (email, reference_number, status)
- Date fields للـ sorting

### ✅ 8+ Trigger تلقائي
- Auto-update `updated_at`
- Validation triggers

### ✅ Functions
- `update_updated_at_column()`

---

## 📝 الخطوات الكاملة من البداية للنهاية

### 1. إنشاء Database

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء database ومستخدم
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'كلمة_سر_قوية';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
ALTER DATABASE consulate_db OWNER TO consulate_user;

# الخروج
\q
```

### 2. استيراد Schema

```bash
cd postgresql_schema

# الطريقة 1: استيراد من ملف واحد (الأسرع)
psql -U consulate_user -d consulate_db -f COMPLETE_SCHEMA.sql

# أو الطريقة 2: استخدام السكريبت
./apply_complete_schema.sh consulate_db consulate_user
```

### 3. استيراد بيانات تجريبية (اختياري)

```bash
# استيراد بيانات تجريبية للاختبار
psql -U consulate_user -d consulate_db -f SAMPLE_DATA.sql
```

### 4. استيراد البيانات الحقيقية من Supabase

```bash
# استخراج البيانات من Supabase (إذا لم تكن قد فعلت)
cd ..
node scripts/export-database-complete.js

# استيراد البيانات
psql -U consulate_user -d consulate_db -f database_export/complete_data_export.sql
```

### 5. التحقق من نجاح الاستيراد

```bash
# عرض جميع الجداول
psql -U consulate_user -d consulate_db -c "\dt"

# عد الجداول
psql -U consulate_user -d consulate_db -c "
  SELECT COUNT(*) as total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
"

# يجب أن ترى 40+ جدول
```

---

## 📊 الجداول الرئيسية

### 1. Applications (الطلبات)
```sql
id, service_id, region_id, reference_number,
full_name, email, phone, form_data, documents,
status, created_at, updated_at
```

### 2. Services (الخدمات)
```sql
id, category_id, subcategory_id, name_ar, name_en,
description_ar, description_en, price, active
```

### 3. Staff (الموظفون)
```sql
id, email, username, password, full_name, role,
region_id, active, created_at
```

### 4. Regions (المناطق)
```sql
id, name_ar, name_en, code
```

**وغيرها 36+ جدول...**

---

## 🎉 تم!

الآن لديك:
- ✅ Schema كامل (40+ جدول)
- ✅ ملف واحد + ملفات منظمة
- ✅ سكريبتات استيراد سهلة
- ✅ بيانات تجريبية
- ✅ دليل شامل

---

## 📚 ملفات إضافية للمراجعة

1. **postgresql_schema/README.md** - دليل Schema التفصيلي
2. **COMPLETE_STANDALONE_GUIDE_AR.md** - دليل النظام الكامل
3. **backend/README.md** - دليل Backend
4. **backend/API_DOCUMENTATION.md** - توثيق API

---

**🎊 مبروك! Database Schema جاهز للاستخدام!**
