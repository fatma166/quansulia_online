# 🔧 دليل حل المشاكل الشائعة - VPS Deployment

## 📋 جدول المحتويات

1. [مشاكل الاتصال](#1-مشاكل-الاتصال)
2. [مشاكل PostgreSQL](#2-مشاكل-postgresql)
3. [مشاكل Backend API](#3-مشاكل-backend-api)
4. [مشاكل Frontend](#4-مشاكل-frontend)
5. [مشاكل Nginx](#5-مشاكل-nginx)
6. [مشاكل SSL/HTTPS](#6-مشاكل-sslhttps)
7. [مشاكل Firewall](#7-مشاكل-firewall)
8. [مشاكل الأداء](#8-مشاكل-الأداء)
9. [مشاكل الملفات](#9-مشاكل-الملفات)

---

## 1️⃣ مشاكل الاتصال

### المشكلة: لا أستطيع الاتصال بـ VPS عبر SSH

```bash
# ════════════════════════════════════════
# الأسباب المحتملة:
# ════════════════════════════════════════

# 1. IP خاطئ
# الحل: تحقق من IP من لوحة تحكم VPS

# 2. Firewall يحظر SSH
# الحل: من لوحة تحكم VPS، افتح Port 22 مؤقتاً

# 3. خطأ في Username أو Password
# الحل: استخدم "Reset Password" من لوحة التحكم

# 4. SSH Service متوقف
# الحل: أعد تشغيل VPS من لوحة التحكم
```

### المشكلة: "Connection timed out"

```bash
# الحل:
# 1. تحقق من Firewall على جهازك
# 2. تحقق من UFW على VPS (من Console)
sudo ufw allow 22/tcp
sudo ufw reload

# 3. اختبر الاتصال
ping YOUR_VPS_IP
telnet YOUR_VPS_IP 22
```

---

## 2️⃣ مشاكل PostgreSQL

### المشكلة: "FATAL: password authentication failed"

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# تأكد من وجود:
# local   all             all                                     md5

# 2. إعادة تعيين Password
sudo -u postgres psql
ALTER USER consulate_user WITH PASSWORD 'new_password';
\q

# 3. إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql
```

### المشكلة: "could not connect to server"

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من حالة PostgreSQL
sudo systemctl status postgresql

# إذا كان متوقف:
sudo systemctl start postgresql

# 2. تحقق من الـ logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# 3. تحقق من Port
sudo netstat -tuln | grep 5432
```

### المشكلة: "database does not exist"

```bash
# ════════════════════════════════════════
# الحل: إنشاء القاعدة
# ════════════════════════════════════════
sudo -u postgres psql
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
\q
```

### المشكلة: استيراد البيانات فشل

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. امسح القاعدة وأعد إنشاءها
sudo -u postgres psql
DROP DATABASE consulate_db;
CREATE DATABASE consulate_db;
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
\q

# 2. حاول مرة أخرى
psql -U consulate_user -d consulate_db -h localhost -f backup.sql

# 3. إذا كان هناك أخطاء محددة، عالجها واحدة تلو الأخرى
```

---

## 3️⃣ مشاكل Backend API

### المشكلة: Backend لا يشتغل (PM2 Error)

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من الـ logs
pm2 logs consulate-api

# 2. الأخطاء الشائعة:

# أ) Module not found
cd /home/consulate/backend
npm install

# ب) .env missing
ls -la .env
# إذا لم يكن موجود، أنشئه:
./setup-backend-env.sh

# ج) Database connection error
# راجع قسم PostgreSQL أعلاه

# 3. أعد التشغيل
pm2 restart consulate-api
```

### المشكلة: "EADDRINUSE: Port 3000 already in use"

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. ابحث عن العملية على Port 3000
sudo lsof -i :3000

# 2. اقتل العملية
sudo kill -9 PID_NUMBER

# أو:
pm2 delete all
pm2 start src/server.js --name consulate-api
```

### المشكلة: Backend يتوقف بعد فترة

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من PM2 status
pm2 status

# 2. إذا كان "errored"
pm2 logs consulate-api --lines 100

# 3. الأسباب الشائعة:
# - Memory leak: راقب استخدام الذاكرة
pm2 monit

# - Database timeout: زد timeout في .env

# - Unhandled exceptions: راجع الـ code

# 4. أعد التشغيل مع auto-restart
pm2 restart consulate-api --max-restarts 10
```

### المشكلة: JWT Authentication Failed

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من JWT_SECRET في .env
cat /home/consulate/backend/.env | grep JWT_SECRET

# 2. إذا لم يكن موجود، أضفه:
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')" >> .env

# 3. أعد تشغيل Backend
pm2 restart consulate-api
```

---

## 4️⃣ مشاكل Frontend

### المشكلة: الصفحة لا تفتح (404)

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من وجود الملفات
ls -la /var/www/consulate/

# 2. إذا كان المجلد فارغ، أعد رفع dist
# من جهازك:
scp -r dist/* root@VPS_IP:/var/www/consulate/

# 3. تحقق من الصلاحيات
sudo chown -R www-data:www-data /var/www/consulate
sudo chmod -R 755 /var/www/consulate

# 4. أعد تشغيل Nginx
sudo systemctl restart nginx
```

### المشكلة: الصفحة تفتح لكن بدون CSS/JS

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من Nginx config
sudo nano /etc/nginx/sites-available/consulate

# تأكد من وجود:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 2. اختبر Nginx
sudo nginx -t

# 3. أعد التشغيل
sudo systemctl restart nginx

# 4. امسح Cache المتصفح
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

### المشكلة: "API Connection Failed"

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من Backend
curl http://localhost:3000/health

# 2. إذا لم يعمل، راجع قسم Backend أعلاه

# 3. تحقق من VITE_API_URL في Frontend
# يجب أن يكون:
# VITE_API_URL=https://yourdomain.com/api
# أو:
# VITE_API_URL=http://YOUR_VPS_IP/api

# 4. إذا غيرته، أعد build Frontend
npm run build
# ثم أعد رفعه
```

### المشكلة: الصور لا تظهر

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من مجلد uploads
ls -la /home/consulate/backend/uploads/

# 2. تحقق من الصلاحيات
chmod 755 /home/consulate/backend/uploads/
chown -R consulate:consulate /home/consulate/backend/uploads/

# 3. تحقق من Nginx config
sudo nano /etc/nginx/sites-available/consulate

# يجب أن يحتوي:
location /uploads/ {
    alias /home/consulate/backend/uploads/;
    autoindex off;
}

# 4. أعد تشغيل Nginx
sudo systemctl restart nginx
```

---

## 5️⃣ مشاكل Nginx

### المشكلة: "502 Bad Gateway"

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من Backend
pm2 status

# إذا كان متوقف:
pm2 start src/server.js --name consulate-api

# 2. تحقق من Port
sudo lsof -i :3000

# 3. تحقق من Nginx logs
sudo tail -f /var/log/nginx/consulate_error.log

# 4. أعد تشغيل الكل
pm2 restart consulate-api
sudo systemctl restart nginx
```

### المشكلة: "413 Request Entity Too Large"

```bash
# ════════════════════════════════════════
# الحل: زيادة حجم الملفات المسموح
# ════════════════════════════════════════

# 1. عدل Nginx config
sudo nano /etc/nginx/sites-available/consulate

# أضف أو عدل:
client_max_body_size 50M;

# 2. اختبر وأعد التشغيل
sudo nginx -t
sudo systemctl restart nginx
```

### المشكلة: Nginx لا يبدأ

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. اختبر الإعدادات
sudo nginx -t

# 2. إذا كان هناك أخطاء syntax، صححها
sudo nano /etc/nginx/sites-available/consulate

# 3. تحقق من Port 80/443 إذا كان مشغول
sudo netstat -tuln | grep :80
sudo netstat -tuln | grep :443

# 4. أعد المحاولة
sudo systemctl start nginx
```

---

## 6️⃣ مشاكل SSL/HTTPS

### المشكلة: Certbot فشل

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من Domain يشير إلى VPS IP
nslookup yourdomain.com

# 2. تحقق من Port 80 مفتوح
sudo ufw allow 80/tcp
sudo ufw reload

# 3. حاول مرة أخرى
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 4. إذا استمرت المشكلة، استخدم manual mode
sudo certbot certonly --manual -d yourdomain.com
```

### المشكلة: "SSL Certificate expired"

```bash
# ════════════════════════════════════════
# الحل: تجديد Certificate
# ════════════════════════════════════════

# 1. تجديد يدوي
sudo certbot renew

# 2. إعادة تشغيل Nginx
sudo systemctl restart nginx

# 3. تفعيل التجديد التلقائي
sudo certbot renew --dry-run

# إذا نجح، سيتجدد تلقائياً
```

### المشكلة: HTTPS لا يعمل (HTTP يعمل)

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من Port 443 مفتوح
sudo ufw allow 443/tcp
sudo ufw reload

# 2. تحقق من Nginx config
sudo nano /etc/nginx/sites-available/consulate

# يجب أن يحتوي:
server {
    listen 443 ssl;
    ...
}

# 3. أعد تشغيل Nginx
sudo systemctl restart nginx
```

---

## 7️⃣ مشاكل Firewall

### المشكلة: UFW يحظر الوصول للموقع

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من القواعد
sudo ufw status verbose

# 2. تأكد من السماح بـ 80 و 443
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# 3. اختبر
curl http://localhost
```

### المشكلة: لا أستطيع الوصول لـ SSH بعد تفعيل UFW

```bash
# ════════════════════════════════════════
# الحل (من Console VPS):
# ════════════════════════════════════════

# 1. السماح بـ SSH
sudo ufw allow 22/tcp
sudo ufw reload

# 2. أو من IP محدد فقط
sudo ufw allow from YOUR_IP to any port 22
```

### المشكلة: قاعدة البيانات غير متاحة من الخارج (مقصود)

```bash
# ════════════════════════════════════════
# ملاحظة: هذا سلوك صحيح!
# ════════════════════════════════════════

# PostgreSQL يجب أن يكون متاح داخلياً فقط
# إذا كنت تريد الوصول الخارجي (غير آمن!):

# 1. عدل PostgreSQL config
sudo nano /etc/postgresql/15/main/postgresql.conf
# غير listen_addresses = 'localhost' إلى:
listen_addresses = '*'

# 2. عدل pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# أضف:
host    all             all             0.0.0.0/0               md5

# 3. السماح في Firewall
sudo ufw allow 5432/tcp

# 4. أعد تشغيل
sudo systemctl restart postgresql

# ⚠️ تحذير: هذا غير آمن! استخدم SSH Tunnel بدلاً من ذلك
```

---

## 8️⃣ مشاكل الأداء

### المشكلة: الموقع بطيء

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. راقب استخدام الموارد
htop

# 2. تحقق من استخدام الذاكرة
free -h

# 3. تحقق من استخدام القرص
df -h

# 4. راقب PM2
pm2 monit

# 5. إذا كان Backend يستهلك كثيراً:
# - راجع الـ code للـ memory leaks
# - زد RAM من VPS provider
# - استخدم caching (Redis)

# 6. فعّل Gzip في Nginx (مفعّل في السكريبت)
```

### المشكلة: Database queries بطيئة

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. فعّل logging للـ slow queries
sudo nano /etc/postgresql/15/main/postgresql.conf

# أضف:
log_min_duration_statement = 1000  # log queries > 1 second

# 2. أعد تشغيل
sudo systemctl restart postgresql

# 3. راجع الـ logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# 4. أضف Indexes على الأعمدة الأكثر استخداماً
```

### المشكلة: القرص ممتلئ

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من المساحة
df -h

# 2. ابحث عن أكبر الملفات
du -h /home/consulate | sort -rh | head -20

# 3. امسح Logs القديمة
sudo find /var/log -name "*.log" -mtime +30 -delete

# 4. امسح Backups القديمة
find /home/consulate/backups -mtime +7 -delete

# 5. امسح PM2 logs
pm2 flush
```

---

## 9️⃣ مشاكل الملفات

### المشكلة: رفع الملفات لا يعمل

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# 1. تحقق من مجلد uploads
ls -la /home/consulate/backend/uploads/

# 2. الصلاحيات
chmod 755 /home/consulate/backend/uploads/
chown -R consulate:consulate /home/consulate/backend/uploads/

# 3. تحقق من MAX_FILE_SIZE في .env
cat /home/consulate/backend/.env | grep MAX_FILE_SIZE

# 4. تحقق من Nginx
# راجع "413 Request Entity Too Large" أعلاه

# 5. أعد تشغيل Backend
pm2 restart consulate-api
```

### المشكلة: "Permission denied" عند الوصول للملفات

```bash
# ════════════════════════════════════════
# الحل:
# ════════════════════════════════════════

# إعطاء الصلاحيات الصحيحة
sudo chown -R consulate:consulate /home/consulate/backend
sudo chmod -R 755 /home/consulate/backend
sudo chmod -R 755 /home/consulate/backend/uploads

# لـ Frontend
sudo chown -R www-data:www-data /var/www/consulate
sudo chmod -R 755 /var/www/consulate
```

---

## 🔍 أدوات التشخيص

### معلومات النظام

```bash
# معلومات OS
lsb_release -a
uname -a

# استخدام الموارد
htop
free -h
df -h

# العمليات النشطة
ps aux | grep node
ps aux | grep postgres
ps aux | grep nginx

# Ports المفتوحة
sudo netstat -tuln
sudo ss -tuln

# اختبار الاتصال
curl http://localhost:3000/health
curl http://localhost
```

### Logs المهمة

```bash
# Backend
pm2 logs consulate-api
cat /home/consulate/backend/logs/app.log

# Nginx
sudo tail -f /var/log/nginx/consulate_access.log
sudo tail -f /var/log/nginx/consulate_error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# System
sudo tail -f /var/log/syslog
```

---

## 📞 للمساعدة الإضافية

إذا لم تجد الحل هنا:

1. ✅ راجع `COMPLETE_VPS_DEPLOYMENT_GUIDE.md`
2. ✅ تحقق من `DEPLOYMENT_CHECKLIST.md`
3. ✅ ابحث في الـ logs عن التفاصيل
4. ✅ اختبر كل خطوة على حدة

---

**حظاً موفقاً! 🚀**
