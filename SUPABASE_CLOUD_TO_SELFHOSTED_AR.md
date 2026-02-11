# 📦 نقل البيانات من Supabase Cloud إلى Self-Hosted

## نظرة عامة

هذا الدليل يشرح كيفية تصدير بياناتك من Supabase السحابي واستيرادها في Supabase المستضاف ذاتياً على VPS الخاص بك.

---

## 🎯 متى تحتاج هذا؟

- ✅ تريد التحكم الكامل في قاعدة البيانات
- ✅ تريد تقليل التكاليف الشهرية
- ✅ تحتاج استضافة محلية لأسباب قانونية
- ✅ تريد المزيد من المرونة في التخصيص
- ✅ تحتاج أداء أفضل في منطقتك

---

## 📋 المتطلبات

### على جهازك المحلي:
- ✅ PostgreSQL Client (`pg_dump`) مثبت
- ✅ معلومات الاتصال بـ Supabase Cloud
- ✅ وصول للإنترنت

### على VPS:
- ✅ Docker و Docker Compose مثبتين
- ✅ Self-Hosted Supabase مُثبت ويعمل
- ✅ مساحة تخزين كافية

---

## 🚀 الخطوات الكاملة

### المرحلة 1️⃣: تصدير من Supabase Cloud

#### الخطوة 1: تثبيت PostgreSQL Client

**على Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-client
```

**على macOS:**
```bash
brew install postgresql
```

**على Windows:**
قم بتحميل وتثبيت PostgreSQL من:
https://www.postgresql.org/download/windows/

#### الخطوة 2: الحصول على معلومات الاتصال

1. افتح Supabase Dashboard: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **Project Settings** > **Database**
4. انسخ:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database Password**: (احفظه في مكان آمن)

#### الخطوة 3: تشغيل سكريبت التصدير

```bash
# انتقل لمجلد المشروع
cd /path/to/your/project

# شغّل السكريبت
./scripts/export-from-supabase.sh
```

السكريبت سيسألك عن:
- Supabase URL (مثال: `https://xxxxx.supabase.co`)
- Database Password

**أو** يمكنك إضافة المعلومات في `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_DB_PASSWORD=your_database_password
```

#### الخطوة 4: انتظر التصدير

السكريبت سينشئ:
- ✅ `supabase-exports/supabase_cloud.dump` - ملف dump بصيغة custom (موصى به)
- ✅ `supabase-exports/supabase_cloud.sql` - ملف SQL بديل
- ✅ `supabase-exports/import_to_selfhosted.sh` - سكريبت الاستيراد

---

### المرحلة 2️⃣: رفع الملفات إلى VPS

#### الطريقة 1: باستخدام scp

```bash
# انتقل لمجلد التصدير
cd supabase-exports

# ارفع الملفات
scp supabase_cloud.dump root@YOUR_VPS_IP:/path/to/supabase/
scp import_to_selfhosted.sh root@YOUR_VPS_IP:/path/to/supabase/
```

#### الطريقة 2: باستخدام FileZilla/WinSCP

1. افتح FileZilla أو WinSCP
2. اتصل بـ VPS
3. انتقل إلى مجلد Supabase
4. ارفع الملفات

---

### المرحلة 3️⃣: تثبيت Self-Hosted Supabase على VPS

إذا لم يكن مثبتاً بعد:

```bash
# اتصل بـ VPS
ssh root@YOUR_VPS_IP

# ثبّت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# ثبّت Docker Compose
apt install docker-compose -y

# احصل على Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# انسخ ملف البيئة
cp .env.example .env

# عدّل الإعدادات (اختياري)
nano .env

# شغّل Supabase
docker-compose up -d

# تحقق من التشغيل
docker-compose ps
```

انتظر دقيقة أو اثنتين حتى تبدأ جميع الخدمات.

---

### المرحلة 4️⃣: استيراد البيانات

```bash
# تأكد أنك في مجلد Supabase
cd /path/to/supabase/docker

# أعطِ صلاحية التنفيذ للسكريبت
chmod +x import_to_selfhosted.sh

# شغّل سكريبت الاستيراد
./import_to_selfhosted.sh
```

السكريبت سيقوم بـ:
- ✅ التحقق من تشغيل Supabase
- ✅ إيجاد ملف الـ dump
- ✅ نسخه إلى container قاعدة البيانات
- ✅ استيراد البيانات
- ✅ عرض إحصائيات قاعدة البيانات

---

## 🔍 التحقق من الاستيراد

### 1. تحقق من الجداول

```bash
docker-compose exec db psql -U postgres -d postgres
```

ثم في psql:
```sql
-- عرض جميع الجداول
\dt

-- عدد الجداول
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- عدد السجلات في جدول معين
SELECT COUNT(*) FROM applications;
SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM staff;
```

### 2. قارن مع Supabase Cloud

في Supabase Cloud Dashboard، شغّل نفس الاستعلامات وقارن الأعداد.

### 3. تحقق من RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## ⚙️ تحديث التطبيق

### 1. عدّل ملف `.env`

```env
# قديم (Supabase Cloud)
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...

# جديد (Self-Hosted)
VITE_SUPABASE_URL=http://YOUR_VPS_IP:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

احصل على `ANON_KEY` من:
```bash
cat /path/to/supabase/docker/.env | grep ANON_KEY
```

### 2. أعد بناء التطبيق

```bash
npm run build
```

### 3. اختبر

```bash
npm run dev
```

تأكد من:
- ✅ تسجيل الدخول يعمل
- ✅ عرض البيانات يعمل
- ✅ إضافة/تعديل البيانات يعمل
- ✅ رفع الملفات يعمل

---

## 🛠️ استكشاف الأخطاء

### ❌ خطأ: "pg_dump: error: connection to server"

**السبب**: لا يمكن الاتصال بـ Supabase Cloud

**الحل**:
1. تحقق من الإنترنت
2. تأكد من صحة Host وPassword
3. تحقق من Firewall في Supabase Dashboard:
   - Project Settings > Database > Connection Pooler
   - تأكد من إضافة IP الخاص بك

---

### ❌ خطأ: "docker-compose: command not found"

**السبب**: Docker Compose غير مثبت

**الحل**:
```bash
sudo apt install docker-compose
# أو
pip install docker-compose
```

---

### ❌ خطأ: "Database container not found"

**السبب**: Supabase غير مشغل

**الحل**:
```bash
cd /path/to/supabase/docker
docker-compose up -d
docker-compose ps  # للتحقق
```

---

### ❌ خطأ: "permission denied"

**السبب**: صلاحيات غير كافية

**الحل**:
```bash
sudo chown -R $USER:$USER /path/to/supabase
# أو شغّل بـ sudo
sudo ./import_to_selfhosted.sh
```

---

### ❌ الاستيراد يتوقف في المنتصف

**السبب**: قاعدة بيانات كبيرة أو ذاكرة غير كافية

**الحل 1**: زود الذاكرة المخصصة لـ Docker
```bash
# عدّل docker-compose.yml
services:
  db:
    mem_limit: 2g
    mem_reservation: 1g
```

**الحل 2**: استخدم SQL بدلاً من dump
```bash
# استخدم supabase_cloud.sql بدلاً من .dump
```

**الحل 3**: قسّم الاستيراد
```bash
# صدّر كل جدول على حدة
pg_dump -t applications ... > applications.sql
pg_dump -t services ... > services.sql
# ثم استورد كل ملف منفصل
```

---

## 📊 مقارنة الأداء

| الميزة | Supabase Cloud | Self-Hosted |
|-------|---------------|-------------|
| التكلفة | اشتراك شهري | تكلفة VPS فقط |
| الصيانة | تلقائية | يدوية |
| التحديثات | تلقائية | يدوية |
| الأداء | متغير | ثابت (حسب VPS) |
| التحكم | محدود | كامل |
| النسخ الاحتياطي | تلقائي | يدوي |
| SSL/HTTPS | مدمج | تحتاج إعداد |
| المرونة | محدودة | كاملة |

---

## 🔐 أمان إضافي

### 1. SSL/HTTPS لـ Self-Hosted

```bash
# ثبّت Nginx
apt install nginx

# ثبّت Certbot
apt install certbot python3-certbot-nginx

# احصل على شهادة SSL
certbot --nginx -d your-domain.com
```

ثم عدّل Nginx:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Firewall

```bash
# السماح فقط بالمنافذ المطلوبة
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 3. نسخ احتياطي منتظم

أنشئ cron job:
```bash
crontab -e
```

أضف:
```cron
# نسخة احتياطية يومية في 2 صباحاً
0 2 * * * /path/to/backup-script.sh
```

---

## 🎓 نصائح مهمة

### ✅ افعل:
- احتفظ بنسخ احتياطية منتظمة
- راقب استخدام الموارد
- حدّث Supabase بانتظام
- استخدم SSL في الإنتاج
- اختبر الاسترجاع من النسخ الاحتياطية

### ❌ لا تفعل:
- تشغّل في production بدون SSL
- تنسى النسخ الاحتياطية
- تترك المنافذ مفتوحة للجميع
- تستخدم كلمات مرور ضعيفة
- تهمل تحديثات الأمان

---

## 📈 تحسين الأداء

### 1. زود موارد PostgreSQL

عدّل `docker-compose.yml`:
```yaml
services:
  db:
    command: postgres -c shared_buffers=256MB -c max_connections=200
    mem_limit: 4g
```

### 2. استخدم Connection Pooler

```yaml
services:
  pooler:
    image: pgbouncer/pgbouncer
    environment:
      DATABASES_HOST: db
      DATABASES_PORT: 5432
      DATABASES_USER: postgres
      DATABASES_PASSWORD: your-super-secret-and-long-postgres-password
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 20
```

### 3. Indexes

أضف indexes للجداول الكبيرة:
```sql
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_user_id ON applications(user_id);
```

---

## 🔄 العودة إلى Supabase Cloud

إذا أردت العودة إلى Cloud:

```bash
# صدّر من Self-Hosted
docker-compose exec db pg_dump -U postgres -d postgres > backup.sql

# نظف الملف
sed -i '/^SET /d' backup.sql

# استورد في Supabase Cloud Dashboard > SQL Editor
```

---

## 📞 المساعدة والموارد

### الوثائق:
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### المجتمع:
- [Supabase Discord](https://discord.supabase.com/)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## ✅ قائمة التحقق النهائية

- [ ] تم تصدير البيانات من Supabase Cloud
- [ ] تم رفع الملفات إلى VPS
- [ ] تم تثبيت Self-Hosted Supabase
- [ ] تم استيراد البيانات بنجاح
- [ ] تم التحقق من جميع الجداول
- [ ] تم التحقق من عدد السجلات
- [ ] تم تحديث `.env` في التطبيق
- [ ] تم اختبار التطبيق بالكامل
- [ ] تم إعداد SSL/HTTPS
- [ ] تم إعداد Firewall
- [ ] تم إعداد النسخ الاحتياطي التلقائي
- [ ] تم توثيق المعلومات المهمة

---

## 🎉 تهانينا!

الآن لديك قاعدة بياناتك على Self-Hosted Supabase!

**المزايا التي حصلت عليها:**
- ✅ تحكم كامل في البيانات
- ✅ مرونة في التخصيص
- ✅ لا توجد حدود على الاستخدام
- ✅ خصوصية أعلى
- ✅ تكلفة ثابتة ومتوقعة

**تذكر:**
- راقب الموارد بانتظام
- احتفظ بنسخ احتياطية
- حدّث النظام بانتظام
- اختبر الاسترجاع من النسخ الاحتياطية

---

🚀 **Happy Self-Hosting!**
