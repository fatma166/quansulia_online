# إعداد Nginx و SSL للإنتاج
## لتأمين الـ API والمشروع

---

## لماذا نحتاج Nginx؟

1. **SSL/TLS**: تشفير البيانات (HTTPS)
2. **Reverse Proxy**: إخفاء المنافذ الداخلية
3. **Load Balancing**: توزيع الحمل
4. **Caching**: تسريع الأداء
5. **Security Headers**: حماية إضافية

---

## خطوات التنصيب

### 1. تنصيب Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. إعداد Firewall

```bash
# السماح بـ HTTP و HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

### 3. إنشاء ملف إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/consulate
```

أضف هذا الإعداد:

```nginx
# Supabase API Backend
upstream supabase_api {
    server localhost:8000;
}

# Frontend Application
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificates (will be set by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend Static Files
    root /var/www/consulate/dist;
    index index.html;

    # Frontend Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Supabase
    location /api/ {
        proxy_pass http://supabase_api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Support for Realtime
    location /realtime/ {
        proxy_pass http://supabase_api/realtime/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage API
    location /storage/ {
        proxy_pass http://supabase_api/storage/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # للملفات الكبيرة
        client_max_body_size 50M;
    }

    # Logs
    access_log /var/log/nginx/consulate_access.log;
    error_log /var/log/nginx/consulate_error.log;
}

# Supabase Studio (Admin Panel) - Optional
server {
    listen 3000 ssl http2;
    listen [::]:3000 ssl http2;
    server_name admin.your-domain.com;

    # SSL (same as above)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. تفعيل الإعداد

```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/consulate /etc/nginx/sites-enabled/

# حذف الإعداد الافتراضي
sudo rm /etc/nginx/sites-enabled/default

# اختبار الإعداد
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

### 5. تنصيب SSL Certificate (Let's Encrypt)

```bash
# تنصيب Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot سيقوم بـ:
# - توليد شهادة SSL
# - تحديث إعداد Nginx تلقائياً
# - إعداد التجديد التلقائي
```

### 6. التحقق من SSL

```bash
# اختبار التجديد التلقائي
sudo certbot renew --dry-run

# فحص شهادة SSL
sudo certbot certificates
```

---

## نشر Frontend

### 1. بناء المشروع

```bash
# في مجلد المشروع
npm run build
```

### 2. نقل الملفات للسيرفر

```bash
# إنشاء مجلد
sudo mkdir -p /var/www/consulate

# نقل ملفات dist
sudo cp -r dist/* /var/www/consulate/

# تعيين الصلاحيات
sudo chown -R www-data:www-data /var/www/consulate
sudo chmod -R 755 /var/www/consulate
```

### 3. تحديث Environment Variables

قبل البناء، تأكد من تحديث `.env`:

```env
VITE_SUPABASE_URL=https://your-domain.com/api
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## أمان إضافي

### 1. Rate Limiting (حماية من الهجمات)

أضف في ملف Nginx:

```nginx
# في http block
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# في location block
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... باقي الإعداد
}
```

### 2. IP Whitelisting لـ Admin Panel

```nginx
# للسماح لعناوين IP محددة فقط
location /studio/ {
    allow 192.168.1.0/24;  # شبكة محلية
    allow 203.0.113.0/24;  # عنوان IP محدد
    deny all;

    proxy_pass http://localhost:3000;
}
```

### 3. Fail2Ban (حماية من Brute Force)

```bash
# تنصيب
sudo apt install fail2ban -y

# إنشاء قاعدة
sudo nano /etc/fail2ban/jail.local
```

أضف:

```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/*error.log
findtime = 600
bantime = 7200
maxretry = 10
```

---

## Monitoring & Logs

### 1. مراقبة Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/consulate_access.log

# Error logs
sudo tail -f /var/log/nginx/consulate_error.log
```

### 2. تحليل الأداء

```bash
# تنصيب GoAccess (أداة تحليل logs)
sudo apt install goaccess -y

# تحليل real-time
sudo goaccess /var/log/nginx/consulate_access.log -o /var/www/html/report.html --log-format=COMBINED --real-time-html
```

---

## Backup Strategy

### 1. Backup التلقائي للـ Database

```bash
sudo nano /usr/local/bin/backup-db.sh
```

أضف:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/consulate"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec consulate_db pg_dump -U postgres postgres > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

```bash
# تعيين الصلاحيات
sudo chmod +x /usr/local/bin/backup-db.sh

# جدولة يومياً (2 صباحاً)
sudo crontab -e
```

أضف:
```
0 2 * * * /usr/local/bin/backup-db.sh
```

### 2. Backup Storage Files

```bash
# Backup ملفات المستخدمين
sudo rsync -av /var/lib/docker/volumes/consulate_storage_data/_data/ /var/backups/consulate/storage/
```

---

## الخلاصة

بعد إتمام هذه الخطوات:

- ✅ مشروعك يعمل على HTTPS آمن
- ✅ API محمي خلف Nginx
- ✅ SSL Certificate من Let's Encrypt
- ✅ حماية من الهجمات
- ✅ Backup تلقائي
- ✅ Monitoring للأداء

**البيانات 100% على سيرفر العميل الخاص!**
