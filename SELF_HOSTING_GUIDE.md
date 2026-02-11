# دليل نقل المشروع إلى سيرفر خاص
## للجهات الحكومية السيادية

---

## الخيار 1: Supabase Self-hosted (موصى به)

### المميزات:
- كل features Supabase موجودة
- أمان عالي
- سهل الصيانة
- نفس الكود بدون تعديل

### متطلبات السيرفر:
```
- نظام: Ubuntu 22.04 LTS أو أحدث
- RAM: 4GB على الأقل (8GB موصى به)
- Storage: 50GB على الأقل
- Docker: 20.10 أو أحدث
- Docker Compose: 2.0 أو أحدث
```

### خطوات التنصيب:

#### 1. تحضير السيرفر:
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تنصيب Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تنصيب Docker Compose
sudo apt install docker-compose-plugin -y

# إضافة المستخدم لمجموعة docker
sudo usermod -aG docker $USER
```

#### 2. تنزيل Supabase:
```bash
# استنساخ المشروع
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# نسخ ملف البيئة
cp .env.example .env
```

#### 3. تكوين Environment Variables:
```bash
# تعديل ملف .env
nano .env
```

**أهم الإعدادات:**
```env
############
# Secrets
############
POSTGRES_PASSWORD=your-super-secret-password-here
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
ANON_KEY=your-anon-key-generated-with-jwt-secret
SERVICE_ROLE_KEY=your-service-role-key-generated

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# API
############
API_EXTERNAL_URL=http://your-server-ip:8000
SUPABASE_PUBLIC_URL=http://your-server-ip:8000

############
# Studio
############
STUDIO_PORT=3000
STUDIO_DEFAULT_ORGANIZATION=Default Organization
STUDIO_DEFAULT_PROJECT=Default Project

############
# Auth
############
SITE_URL=http://your-frontend-domain.com
ADDITIONAL_REDIRECT_URLS=
JWT_EXPIRY=3600
DISABLE_SIGNUP=false
```

#### 4. توليد JWT Keys:
```bash
# تنصيب أداة لتوليد المفاتيح
npm install -g @supabase/cli

# توليد anon key و service_role key
supabase init
```

#### 5. تشغيل Supabase:
```bash
# تشغيل جميع الخدمات
docker compose up -d

# التحقق من الخدمات
docker compose ps
```

#### 6. الوصول للخدمات:
```
- Supabase Studio: http://your-server-ip:3000
- REST API: http://your-server-ip:8000
- PostgreSQL: your-server-ip:5432
```

---

## الخيار 2: PostgreSQL فقط (بدون Supabase)

### التعديلات المطلوبة:

#### 1. تنصيب PostgreSQL:
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. إنشاء Database:
```bash
sudo -u postgres psql

CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
```

#### 3. استيراد Schema:
```bash
psql -U consulate_user -d consulate_db -f database_schema.sql
psql -U consulate_user -d consulate_db -f database_data.sql
```

#### 4. التعديلات على الكود:
- إزالة Supabase client
- إضافة node-postgres أو pg
- تعديل كل الـ API calls
- بناء REST API مخصص (Express/Fastify)
- بناء نظام Auth مخصص (JWT)
- بناء File Upload system

**هذا الخيار يحتاج وقت طويل وغير موصى به**

---

## نقل البيانات من Supabase الحالي

### 1. تصدير Schema:
```bash
# من Supabase Dashboard > Database > Backups
# أو استخدام pg_dump
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --schema-only \
  -f schema.sql
```

### 2. تصدير البيانات:
```bash
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --data-only \
  -f data.sql
```

### 3. الاستيراد على السيرفر الجديد:
```bash
# استيراد Schema
psql -h localhost -U postgres -d postgres -f schema.sql

# استيراد البيانات
psql -h localhost -U postgres -d postgres -f data.sql
```

---

## تحديث المشروع ليعمل مع السيرفر الجديد

### 1. تعديل .env في المشروع:
```env
# قبل (Supabase Cloud)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# بعد (Self-hosted)
VITE_SUPABASE_URL=http://your-server-ip:8000
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

### 2. لا يوجد تعديلات أخرى مطلوبة!
الكود سيعمل كما هو بدون أي تغيير.

---

## الأمان والحماية

### 1. Firewall:
```bash
# فتح المنافذ المطلوبة فقط
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8000/tcp  # API
sudo ufw allow 3000/tcp  # Studio (اختياري)
sudo ufw enable
```

### 2. SSL/TLS:
```bash
# تنصيب Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# إعداد SSL
sudo certbot --nginx -d your-domain.com
```

### 3. Backup:
```bash
# Backup يومي تلقائي
0 2 * * * pg_dump -U postgres > /backup/db_$(date +\%Y\%m\%d).sql
```

---

## الصيانة

### مراقبة الخدمات:
```bash
# حالة Supabase
docker compose ps

# Logs
docker compose logs -f

# إعادة التشغيل
docker compose restart
```

### التحديثات:
```bash
# تحديث Supabase
cd supabase/docker
git pull origin main
docker compose pull
docker compose up -d
```

---

## الدعم الفني

### مصادر:
- Documentation: https://supabase.com/docs/guides/self-hosting
- GitHub: https://github.com/supabase/supabase
- Community: https://github.com/supabase/supabase/discussions

---

## التكاليف المقدرة

### Supabase Self-hosted:
- **التنصيب**: 1-2 يوم عمل
- **التكلفة**: فقط تكلفة السيرفر
- **الصيانة**: ساعة أسبوعياً

### PostgreSQL فقط:
- **التطوير**: 3-4 أسابيع
- **التكلفة**: تكلفة السيرفر + أجر المطور
- **الصيانة**: 2-3 ساعات أسبوعياً

---

## الخلاصة والتوصية

**للجهات الحكومية السيادية، ننصح بشدة باستخدام Supabase Self-hosted لأنه:**

1. يحافظ على كل المميزات الموجودة
2. سهل الصيانة
3. آمن وموثوق
4. لا يحتاج تعديل الكود
5. موثق جيداً
6. مدعوم من مجتمع كبير

**البيانات ستكون 100% على سيرفر العميل الخاص بدون أي اتصال بالخارج.**
