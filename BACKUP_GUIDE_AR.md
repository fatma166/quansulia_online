# 📦 دليل النسخ الاحتياطي واستعادة قاعدة البيانات

## 🎯 نظرة عامة

هذا الدليل يشرح كيفية عمل نسخة احتياطية كاملة من قاعدة البيانات على Supabase واستعادتها على سيرفر العميل (VPS).

---

## 📥 الجزء الأول: عمل النسخة الاحتياطية

### الخطوة 1: تشغيل سكريبت التصدير

```bash
# طريقة سريعة
npm run backup-db

# أو بشكل مباشر
node scripts/export-full-database.js
```

### ماذا سيحدث؟

سيقوم السكريبت بـ:
1. ✅ قراءة جميع البيانات من Supabase
2. ✅ تصدير كل جدول إلى SQL INSERT statements
3. ✅ إنشاء مجلد `database-backup` يحتوي على:
   - `data-backup-[timestamp].sql` - ملف البيانات
   - `restore-database.sh` - سكريبت الاستعادة التلقائي
   - `README.md` - دليل الاستخدام

### الجداول التي يتم تصديرها (70+ جدول)

#### 🔐 الجداول الأساسية
- roles, departments, regions, cities, districts
- old_regions

#### 👥 بيانات الموظفين
- staff, staff_services, staff_regions

#### 📋 الخدمات
- services, service_types, service_fields
- service_documents, service_requirements
- service_field_conditions, service_document_conditions
- service_dynamic_list_fields, service_pricing_rules

#### 📝 الطلبات
- applications, application_notes
- application_statuses, status_history
- otp_verifications, payments
- rejection_details

#### 💰 الفواتير والأسعار
- application_pricing_items
- application_pricing_summary
- invoices

#### 📅 المواعيد والشحن
- appointment_settings, appointment_slots
- appointments, closed_days
- shipping_companies, shipments

#### 🎓 البطاقات التعليمية
- educational_cards

#### 🌐 إدارة المحتوى (CMS)
- site_settings, contact_info
- social_links, slider_items
- page_sections, footer_content
- counters

#### 📰 الأخبار والفعاليات
- breaking_news_ticker
- news, events
- event_registrations

#### ℹ️ صفحات "عن السودان" و "عن القنصلية"
- about_sudan_page, about_sudan_statistics
- about_sudan_sections, about_sudan_section_stats
- about_consulate_sections
- ambassadors
- services_guide_sections
- important_links
- additional_pages

#### ⚙️ النظام
- system_maintenance
- system_announcements
- system_settings

#### 📧 الرسائل
- contact_messages

#### 🤖 الشات بوت
- chatbot_categories
- chatbot_questions_answers
- chatbot_conversations

#### 💬 نظام المحادثة
- chat_conversations
- chat_messages
- chat_staff

#### 📊 قوالب التصدير
- export_report_templates

---

## 📤 الجزء الثاني: نقل النسخة الاحتياطية

### الطريقة 1: باستخدام SCP (موصى به)

```bash
# نقل مجلد البكاب كامل
scp -r database-backup root@your-vps-ip:/root/

# نقل مجلد الـ Schema
scp -r postgresql_schema root@your-vps-ip:/root/
```

### الطريقة 2: باستخدام FTP/SFTP

1. افتح FileZilla أو WinSCP
2. اتصل بالسيرفر
3. انقل المجلدات:
   - `database-backup/`
   - `postgresql_schema/`

### الطريقة 3: استخدام الـ Git

```bash
# إذا كان المشروع على Git
git add database-backup/
git commit -m "Add database backup"
git push

# على السيرفر
git pull
```

---

## 🔄 الجزء الثالث: الاستعادة على السيرفر

### المتطلبات الأساسية

1. **PostgreSQL مثبت**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # تشغيل الخدمة
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **إنشاء قاعدة البيانات**
   ```bash
   sudo -u postgres psql

   # في PostgreSQL prompt:
   CREATE DATABASE consulate;
   CREATE USER consulate_user WITH PASSWORD 'strong_password_here';
   GRANT ALL PRIVILEGES ON DATABASE consulate TO consulate_user;
   \q
   ```

3. **إنشاء ملف .env**
   ```bash
   cd /root
   nano .env
   ```

   أضف المحتوى التالي:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=consulate
   DB_USER=consulate_user
   DB_PASSWORD=strong_password_here
   ```

### الطريقة الأولى: استخدام السكريبت التلقائي (أسهل)

```bash
cd database-backup
chmod +x restore-database.sh
./restore-database.sh
```

السكريبت سيقوم بـ:
1. ✅ التحقق من الاتصال بقاعدة البيانات
2. ✅ تطبيق الـ Schema (البنية)
3. ✅ استيراد البيانات
4. ✅ تحديث الـ Sequences
5. ✅ التحقق من النجاح

### الطريقة الثانية: يدوياً (للمتقدمين)

```bash
# 1. تطبيق البنية
PGPASSWORD=your_password psql -h localhost -U consulate_user -d consulate \
  -f postgresql_schema/COMPLETE_SCHEMA.sql

# 2. استيراد البيانات
PGPASSWORD=your_password psql -h localhost -U consulate_user -d consulate \
  -f database-backup/data-backup-*.sql
```

---

## ✅ التحقق من النجاح

بعد الاستعادة، تحقق من البيانات:

```bash
# الدخول إلى قاعدة البيانات
psql -h localhost -U consulate_user -d consulate

# داخل PostgreSQL prompt:

-- عدد الجداول
SELECT count(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- عدد الموظفين
SELECT count(*) FROM staff;

-- عدد الخدمات
SELECT count(*) FROM services;

-- عدد الطلبات
SELECT count(*) FROM applications;

-- حجم قاعدة البيانات
SELECT pg_size_pretty(pg_database_size('consulate'));
```

---

## 🔍 استكشاف الأخطاء

### خطأ: "Permission denied"

**الحل:**
```bash
sudo chown -R postgres:postgres /var/lib/postgresql/
sudo chmod 750 /var/lib/postgresql/
```

### خطأ: "Connection refused"

**الحل:**
```bash
# تحقق من أن PostgreSQL يعمل
sudo systemctl status postgresql

# إذا لم يكن يعمل
sudo systemctl start postgresql
```

### خطأ: "Role does not exist"

**الحل:**
```bash
sudo -u postgres createuser consulate_user
sudo -u postgres psql -c "ALTER USER consulate_user WITH PASSWORD 'your_password';"
```

### خطأ: "Database does not exist"

**الحل:**
```bash
sudo -u postgres createdb consulate
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE consulate TO consulate_user;"
```

### البيانات لم تستورد بشكل صحيح

**الحل:**
```bash
# امسح قاعدة البيانات وابدأ من جديد
sudo -u postgres psql -c "DROP DATABASE consulate;"
sudo -u postgres psql -c "CREATE DATABASE consulate;"

# ثم أعد الاستعادة
cd database-backup
./restore-database.sh
```

---

## 📊 معلومات إضافية

### حجم النسخة الاحتياطية المتوقع

- **Schema فقط**: ~500 KB
- **بيانات صغيرة**: 1-5 MB
- **بيانات متوسطة**: 10-50 MB
- **بيانات كبيرة**: 100+ MB

### الوقت المتوقع للاستعادة

- **قاعدة صغيرة**: 1-2 دقائق
- **قاعدة متوسطة**: 5-10 دقائق
- **قاعدة كبيرة**: 15-30 دقائق

### الملفات التي لا يتم نسخها احتياطياً

⚠️ **هام**: النسخة الاحتياطية لا تشمل:

1. **Storage Files** (الملفات المرفوعة)
   - الصور والمستندات في Supabase Storage
   - يجب نسخها يدوياً من Storage bucket

2. **Supabase Auth Users**
   - بيانات المستخدمين في auth.users
   - يجب تصديرها من Supabase Dashboard

3. **Edge Functions**
   - موجودة في مجلد `supabase/functions/`
   - منسوخة مع الكود

4. **Environment Variables**
   - ملف `.env` يجب إنشاؤه يدوياً

---

## 🔄 النسخ الاحتياطي الدوري

### جدولة النسخ الاحتياطي التلقائي

أضف Cron Job على السيرفر:

```bash
# فتح ملف crontab
crontab -e

# إضافة سطر للنسخ الاحتياطي اليومي الساعة 2 صباحاً
0 2 * * * cd /path/to/project && npm run backup-db

# أو أسبوعياً كل أحد
0 2 * * 0 cd /path/to/project && npm run backup-db
```

### حفظ النسخ القديمة

```bash
# إنشاء سكريبت للحفظ التلقائي
cat > backup-and-archive.sh << 'EOF'
#!/bin/bash
cd /root/project
npm run backup-db

# نقل النسخة إلى مجلد الأرشيف
mkdir -p /backup/archives
cp database-backup/data-backup-*.sql /backup/archives/

# حذف النسخ الأقدم من 30 يوم
find /backup/archives -name "data-backup-*.sql" -mtime +30 -delete
EOF

chmod +x backup-and-archive.sh
```

---

## 🎯 أفضل الممارسات

### ✅ افعل

1. ✅ اعمل نسخة احتياطية قبل أي تحديث كبير
2. ✅ احتفظ بنسخ متعددة في أماكن مختلفة
3. ✅ اختبر الاستعادة بشكل دوري
4. ✅ استخدم كلمات مرور قوية
5. ✅ راقب حجم قاعدة البيانات

### ❌ لا تفعل

1. ❌ لا تشارك ملفات البكاب علناً
2. ❌ لا تحفظ البكاب على نفس السيرفر فقط
3. ❌ لا تنسى نسخ Storage Files
4. ❌ لا تستخدم كلمات مرور ضعيفة
5. ❌ لا تهمل النسخ الاحتياطية

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:

1. **راجع ملف README.md** في مجلد database-backup
2. **تحقق من السجلات (logs)**:
   ```bash
   # PostgreSQL logs
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```
3. **تواصل مع فريق الدعم** مع إرفاق:
   - رسالة الخطأ كاملة
   - نتائج الأوامر السابقة
   - نسخة من ملف .env (بدون كلمات المرور!)

---

## 🎉 الخلاصة

الآن لديك:
- ✅ نسخة احتياطية كاملة من قاعدة البيانات
- ✅ سكريبتات استعادة تلقائية
- ✅ دليل شامل بالعربية
- ✅ نظام جاهز للاستخدام على السيرفر

**بالتوفيق! 🚀**
