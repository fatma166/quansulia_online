# دليل Plesk vs VPS للنشر الحكومي

---

## ⚠️ ملخص سريع

**Plesk يدعم PostgreSQL ممتاز** ✅
**Plesk + Supabase Self-hosted = صعب** ⚠️
**الحل الأفضل: VPS عادي بدون Plesk** 🎯

---

## 1. لماذا VPS أفضل من Plesk؟

### Plesk:
```
سيرفر → Plesk (لوحة تحكم) → Docker → Supabase
        ↑ طبقة إضافية تسبب مشاكل
```

### VPS عادي:
```
سيرفر → Docker → Supabase
        ↑ مباشر وسهل
```

---

## 2. المقارنة التفصيلية

| البند | Plesk | VPS عادي |
|-------|-------|---------|
| **PostgreSQL فقط** | ✅ ممتاز | ✅ ممتاز |
| **Supabase Self-hosted** | ⚠️ صعب | ✅ سهل |
| **التكلفة الشهرية** | أغلى ($20-50) | أرخص ($5-20) |
| **Docker Compose** | مشاكل محتملة | يعمل بشكل مثالي |
| **السيطرة الكاملة** | محدودة | كاملة |
| **الإدارة** | واجهة رسومية | Terminal (أسهل للمطورين) |
| **التحديثات** | قد تسبب مشاكل | آمنة |
| **الدعم الفني** | محدود لـ Docker | مجتمع كبير |

---

## 3. الخيارات المتاحة مع Plesk

### الخيار أ: PostgreSQL على Plesk + Backend مخصص

```bash
# على Plesk:
1. تثبيت PostgreSQL Extension (من Plesk Marketplace)
2. إنشاء Database
3. تثبيت Node.js (من Plesk Extensions)
4. رفع Backend المخصص
5. رفع Frontend
```

**الوقت المطلوب:**
- تثبيت: 2 ساعة
- بناء Backend: **6 أسابيع**
- تعديل Frontend: أسبوع
- **المجموع: 7-8 أسابيع**

**التكلفة:**
- تطوير: **$5,000-10,000**
- Plesk License: $10-15/شهر
- Server: $20-50/شهر

**الخطوات:**

#### 1. تثبيت PostgreSQL على Plesk

```bash
# من Plesk Panel:
Extensions → Database Management → PostgreSQL
```

#### 2. إنشاء Database

```bash
# من Plesk:
Databases → Add Database
- Name: consulate_db
- User: consulate_user
- Password: [strong password]
```

#### 3. تثبيت Node.js

```bash
# من Plesk:
Extensions → Node.js
- Version: 18 أو أحدث
```

#### 4. رفع الكود

```bash
# Via FTP/SSH:
/var/www/vhosts/your-domain.com/
├── frontend/     # React Build
├── backend/      # Express API (تحتاج بناؤه!)
└── .env
```

#### 5. إعداد Backend (يحتاج 6 أسابيع)

```javascript
// backend/server.js
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'consulate_db',
  user: 'consulate_user',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const app = express();

// تحتاج كتابة 150+ endpoint
// تحتاج Auth System
// تحتاج File Upload System
// تحتاج Security Layer
// ... الخ (6 أسابيع عمل)

app.listen(3000);
```

**المشكلة**: Backend غير موجود! تحتاج بناؤه من الصفر!

---

### الخيار ب: Supabase Self-hosted على Plesk (صعب)

```bash
# تثبيت Docker على Plesk
1. SSH إلى السيرفر
2. تثبيت Docker (خارج Plesk)
3. تشغيل Supabase

# المشاكل المتوقعة:
- تضارب Ports مع Plesk
- Plesk Firewall قد يحجب Supabase
- Updates قد تعطل Docker
- إدارة معقدة
```

**الوقت المطلوب:** 1-2 يوم (مع المشاكل)

**المشاكل:**

1. **تضارب Ports:**
   ```bash
   # Plesk يستخدم:
   80 (HTTP), 443 (HTTPS), 8443 (Plesk Panel)

   # Supabase يحتاج:
   80/443 (API), 3000 (Studio), 5432 (PostgreSQL)

   # حل: تغيير Ports (معقد!)
   ```

2. **Plesk Firewall:**
   ```bash
   # Plesk Firewall قد يحجب Supabase
   # تحتاج فتح Ports يدوياً
   ```

3. **التحديثات:**
   ```bash
   # Plesk updates قد تعطل Docker
   ```

**الخطوات (للمحترفين فقط):**

```bash
# 1. SSH للسيرفر
ssh root@your-server.com

# 2. تثبيت Docker (خارج Plesk)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. تثبيت Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. تنزيل Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# 5. تعديل Ports (لتجنب تضارب مع Plesk)
nano docker-compose.yml
# غيّر Ports:
# - 8080:80 (بدلاً من 80:80)
# - 8443:443 (بدلاً من 443:443)

# 6. إعداد Environment
cp .env.example .env
nano .env
# عدّل الإعدادات

# 7. تشغيل Supabase
docker-compose up -d

# 8. فتح Ports في Plesk Firewall
# من Plesk Panel:
# Tools & Settings → Firewall → Add Rule
# Allow: 8080, 8443, 3000, 5432

# 9. إعداد Nginx Reverse Proxy في Plesk
# من Domain → Apache & nginx Settings
# nginx directives:
location /api {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
}
```

**الصعوبة**: عالية جداً! غير موصى به.

---

## 4. الحل الأفضل: VPS بدون Plesk

### مقدمي VPS الموصى بهم:

| المزود | التكلفة/شهر | المواصفات | مناسب؟ |
|--------|-------------|-----------|--------|
| **DigitalOcean** | $6 | 1GB RAM, 25GB SSD | ✅ ممتاز |
| **Vultr** | $6 | 1GB RAM, 25GB SSD | ✅ ممتاز |
| **Linode (Akamai)** | $5 | 1GB RAM, 25GB SSD | ✅ ممتاز |
| **Hetzner** | €4.5 | 2GB RAM, 40GB SSD | ✅ الأفضل |
| **AWS Lightsail** | $5 | 1GB RAM, 40GB SSD | ✅ جيد |
| **OVH** | €3.5 | 2GB RAM, 20GB SSD | ✅ جيد |

**للسيرفرات المحلية (السعودية):**
- **STC Cloud** - سيرفرات في السعودية
- **Mobily Cloud** - سيرفرات محلية
- **AWS Bahrain** - قريب من السعودية

---

### خطوات النشر على VPS (2-3 ساعات):

```bash
# 1. شراء VPS
# اختر: Ubuntu 22.04 LTS

# 2. الاتصال بالسيرفر
ssh root@your-vps-ip

# 3. تحديث النظام
apt update && apt upgrade -y

# 4. تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 5. تثبيت Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 6. تنزيل Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# 7. إعداد Environment
cp .env.example .env
nano .env
# عدّل: POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY

# 8. تشغيل Supabase
docker-compose up -d

# 9. تثبيت Nginx
apt install nginx -y

# 10. إعداد SSL
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com

# 11. رفع Frontend
cd /var/www/html
# رفع dist/ من المشروع

# خلاص! يعمل!
```

**الوقت الكلي**: 2-3 ساعات
**التكلفة**: $5-10/شهر
**الصعوبة**: سهل جداً

---

## 5. المقارنة النهائية

### من ناحية التكلفة:

| الحل | التكلفة الأولية | التكلفة الشهرية | التكلفة السنوية |
|------|-----------------|-----------------|-----------------|
| **VPS + Supabase Self-hosted** | $0 | $5-10 | $60-120 |
| **Plesk + PostgreSQL + Backend** | $5,000-10,000 | $30-65 | $360-780 + تطوير |
| **Plesk + Supabase Self-hosted** | $0 | $30-65 | $360-780 |

### من ناحية الوقت:

| الحل | وقت النشر | الصعوبة | الصيانة |
|------|-----------|---------|---------|
| **VPS + Supabase Self-hosted** | 2-3 ساعات | سهل | سهلة |
| **Plesk + PostgreSQL + Backend** | 6 أسابيع | صعب جداً | صعبة |
| **Plesk + Supabase Self-hosted** | 1-2 يوم | صعب | متوسطة |

---

## 6. التوصية النهائية

### للجهات الحكومية:

```
🎯 استخدم: VPS + Supabase Self-hosted

✅ الأسباب:
1. أسهل (2-3 ساعات vs 6 أسابيع)
2. أرخص ($60/سنة vs $360-780/سنة)
3. أسرع
4. أأمن
5. أسهل في الصيانة
6. كل البيانات على سيرفرك
7. سيطرة كاملة
```

### لماذا لا Plesk؟

1. ❌ **أغلى**: License + Server = $30-65/شهر
2. ❌ **أصعب**: Docker على Plesk = مشاكل
3. ❌ **أقل سيطرة**: Plesk يتحكم في السيرفر
4. ❌ **مخصص للمواقع البسيطة**: ليس للتطبيقات المعقدة

### Plesk مناسب فقط لـ:
- مواقع WordPress
- مواقع PHP بسيطة
- استضافة مشتركة
- المبتدئين

### VPS مناسب لـ:
- تطبيقات حديثة (React, Node.js)
- Docker & Containers
- Microservices
- المشاريع الحكومية ✅

---

## 7. خطة العمل الموصى بها

### الأسبوع الأول: التخطيط
```
□ شراء VPS (Hetzner أو DigitalOcean)
□ تسجيل Domain
□ إعداد DNS
```

### اليوم الأول: النشر
```
□ تثبيت Ubuntu
□ تثبيت Docker
□ تشغيل Supabase
□ إعداد Nginx
□ رفع Frontend
□ اختبار

⏱️ الوقت: 2-3 ساعات
```

### اليوم الثاني: الأمان
```
□ تثبيت SSL
□ إعداد Firewall
□ Backup تلقائي
□ Monitoring

⏱️ الوقت: 2 ساعة
```

### الأسبوع الثاني: الاختبار والنشر
```
□ اختبار شامل
□ تدريب الموظفين
□ النشر الرسمي
```

**المجموع: 3-4 أيام عمل**

---

## 8. دليل التحويل من Plesk إلى VPS

إذا كنت حالياً تستخدم Plesk:

### الخطوة 1: Backup البيانات

```bash
# من Plesk:
Backup Manager → Create Backup
```

### الخطوة 2: Export Database

```bash
# من Plesk SSH:
pg_dump consulate_db > backup.sql
```

### الخطوة 3: نشر على VPS جديد

```bash
# اتبع الخطوات في QUICK_DEPLOYMENT_GUIDE.md
```

### الخطوة 4: Import البيانات

```bash
# على VPS الجديد:
docker exec -i supabase-db psql -U postgres < backup.sql
```

### الخطوة 5: تغيير DNS

```bash
# غيّر DNS إلى VPS الجديد
# انتظر 24-48 ساعة للنشر
```

### الخطوة 6: إلغاء Plesk

```bash
# بعد التأكد أن كل شيء يعمل
# احتفظ بـ Backup لمدة شهر
```

---

## 9. الأسئلة الشائعة

### س: هل أحتاج خبرة في Terminal؟

**ج**: لا! الأوامر واضحة ومباشرة. فقط انسخ والصق.

### س: هل VPS أصعب من Plesk؟

**ج**: في البداية نعم، لكن بعد الإعداد أسهل بكثير!

### س: ماذا لو حصلت مشكلة؟

**ج**: Supabase له مجتمع كبير ودعم ممتاز. Plesk + Docker = دعم محدود.

### س: هل أستطيع إدارة VPS بدون Plesk؟

**ج**: نعم! Docker يجعل الأمر سهل جداً.

### س: ما الفرق في الأمان؟

**ج**: VPS أأمن! أنت المسيطر الوحيد، لا طبقات إضافية.

---

## 10. الخلاصة النهائية

### ✅ استخدم VPS بدلاً من Plesk

**الأسباب:**
1. أسهل لـ Supabase Self-hosted
2. أرخص ($60/سنة vs $360/سنة)
3. أسرع في النشر (ساعات vs أسابيع)
4. أأمن وأكثر سيطرة
5. مدعوم بشكل أفضل
6. مستقبلي (Docker هو المستقبل)

**Plesk مناسب فقط إذا:**
- ❌ تريد بناء Backend مخصص (6 أسابيع)
- ❌ عندك ميزانية كبيرة ($10,000)
- ❌ تحب التعقيد

---

## 11. الخطوة التالية

### ابدأ الآن:

1. **اقرأ**: `QUICK_DEPLOYMENT_GUIDE.md`
2. **اشترِ**: VPS من Hetzner أو DigitalOcean
3. **نفّذ**: الخطوات في 2-3 ساعات
4. **استمتع**: بموقع يعمل بشكل مثالي!

---

## 12. الدعم الفني

### للمساعدة:

- **Supabase Discord**: https://discord.supabase.com
- **Documentation**: https://supabase.com/docs/guides/self-hosting/docker
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

**استخدم VPS = أسهل، أرخص، أسرع، أأمن!**
