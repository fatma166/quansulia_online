# دليل النشر السريع - للجهات الحكومية
## نقل المشروع إلى سيرفر خاص في 10 خطوات

---

## الخطوة 1️⃣: تحضير السيرفر

```bash
# SSH للسيرفر
ssh root@your-server-ip

# تحديث النظام
apt update && apt upgrade -y
```

---

## الخطوة 2️⃣: تنصيب المتطلبات

```bash
# Docker
curl -fsSL https://get.docker.com | sh

# Docker Compose
apt install docker-compose-plugin -y

# Git
apt install git -y
```

---

## الخطوة 3️⃣: تنزيل Supabase

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

---

## الخطوة 4️⃣: توليد المفاتيح

```bash
# على جهازك المحلي
cd /path/to/your/project
node scripts/generate-jwt-keys.js
```

انسخ الناتج (JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY)

---

## الخطوة 5️⃣: تحديث .env على السيرفر

```bash
# على السيرفر
nano .env
```

عدل هذه القيم:
```env
POSTGRES_PASSWORD=YourSecurePassword123!
JWT_SECRET=the-generated-jwt-secret
ANON_KEY=the-generated-anon-key
SERVICE_ROLE_KEY=the-generated-service-role-key
API_EXTERNAL_URL=http://your-server-ip:8000
SITE_URL=http://your-domain.com
```

احفظ بـ `Ctrl+O` ثم اخرج بـ `Ctrl+X`

---

## الخطوة 6️⃣: تشغيل Supabase

```bash
# على السيرفر
docker compose up -d

# انتظر 30 ثانية
sleep 30

# تحقق من الخدمات
docker compose ps
```

يجب أن ترى جميع الخدمات "Up" و "healthy"

---

## الخطوة 7️⃣: استيراد Database

```bash
# نقل ملف SQL للسيرفر (من جهازك)
scp database_complete.sql root@your-server-ip:/root/

# على السيرفر - استيراد البيانات
docker exec -i consulate_db psql -U postgres postgres < /root/database_complete.sql
```

---

## الخطوة 8️⃣: تحديث Frontend

على جهازك المحلي، عدل `.env`:

```env
VITE_SUPABASE_URL=http://your-server-ip:8000
VITE_SUPABASE_ANON_KEY=same-anon-key-as-step-5
```

بناء المشروع:
```bash
npm run build
```

---

## الخطوة 9️⃣: نشر Frontend

```bash
# نقل ملفات dist للسيرفر
scp -r dist/* root@your-server-ip:/var/www/consulate/

# على السيرفر - تعيين الصلاحيات
chown -R www-data:www-data /var/www/consulate
chmod -R 755 /var/www/consulate
```

---

## الخطوة 🔟: إعداد Nginx و SSL

```bash
# على السيرفر
apt install nginx certbot python3-certbot-nginx -y

# نسخ إعداد Nginx
nano /etc/nginx/sites-available/consulate
```

انسخ الإعداد من ملف `NGINX_SSL_SETUP.md`

```bash
# تفعيل
ln -s /etc/nginx/sites-available/consulate /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# اختبار
nginx -t

# تشغيل
systemctl reload nginx

# SSL Certificate
certbot --nginx -d your-domain.com
```

---

## تم! 🎉

الآن المشروع يعمل على:
- **Frontend**: https://your-domain.com
- **API**: https://your-domain.com/api
- **Admin Panel**: http://your-server-ip:3000

---

## اختبار سريع

```bash
# اختبر الـ API
curl http://your-server-ip:8000/rest/v1/

# افتح المتصفح
# Frontend: https://your-domain.com
# Admin: http://your-server-ip:3000
```

---

## الأمان (مهم جداً)

```bash
# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# حماية Port 3000 (Admin Panel)
# أو أغلقه بالكامل:
ufw deny 3000/tcp
```

---

## Backup يومي

```bash
# إنشاء سكريبت backup
cat > /usr/local/bin/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/consulate"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database
docker exec consulate_db pg_dump -U postgres postgres | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Storage files
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/lib/docker/volumes/consulate_storage_data/

# حذف النسخ القديمة (>30 يوم)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup.sh

# جدولة (يومياً 2 صباحاً)
crontab -e
# أضف: 0 2 * * * /usr/local/bin/backup.sh
```

---

## الصيانة

```bash
# حالة الخدمات
docker compose ps

# Logs
docker compose logs -f

# إعادة التشغيل
docker compose restart

# التحديث
git pull origin main
docker compose pull
docker compose up -d
```

---

## المساعدة والدعم

إذا واجهت مشكلة:

1. **تحقق من Logs**:
   ```bash
   docker compose logs
   ```

2. **تحقق من الاتصال بـ Database**:
   ```bash
   docker exec -it consulate_db psql -U postgres -c "SELECT version();"
   ```

3. **تحقق من Nginx**:
   ```bash
   nginx -t
   tail -f /var/log/nginx/error.log
   ```

---

## الملخص

- **الوقت المطلوب**: 2-3 ساعات
- **المتطلبات**: سيرفر Ubuntu + Domain
- **التكلفة**: صفر (فقط تكلفة السيرفر)
- **البيانات**: 100% على سيرفرك الخاص

**جميع البيانات الحكومية السيادية محفوظة بالكامل على سيرفر العميل!**
