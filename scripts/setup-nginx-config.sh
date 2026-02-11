#!/bin/bash
# ══════════════════════════════════════════════════════
# سكريبت إنشاء إعدادات Nginx
# ══════════════════════════════════════════════════════

echo "════════════════════════════════════════"
echo "🌐 إعداد Nginx للمشروع"
echo "════════════════════════════════════════"
echo ""

# التحقق من صلاحيات root
if [ "$EUID" -ne 0 ]; then
    echo "❌ يرجى تشغيل السكريبت بصلاحيات root"
    echo "استخدم: sudo ./setup-nginx-config.sh"
    exit 1
fi

# ════════════════════════════════════════
# اختيار نوع الإعداد
# ════════════════════════════════════════
echo "اختر نوع الإعداد:"
echo "1) Domain Name (yourdomain.com)"
echo "2) IP Address فقط"
echo ""
read -p "اختيارك (1 أو 2): " SETUP_TYPE

if [ "$SETUP_TYPE" = "1" ]; then
    read -p "أدخل Domain Name (مثال: consulate.sa): " DOMAIN_NAME
    SERVER_NAME="$DOMAIN_NAME www.$DOMAIN_NAME"
elif [ "$SETUP_TYPE" = "2" ]; then
    read -p "أدخل VPS IP Address: " VPS_IP
    SERVER_NAME="$VPS_IP"
else
    echo "❌ اختيار غير صحيح"
    exit 1
fi

# ════════════════════════════════════════
# إنشاء ملف الإعدادات
# ════════════════════════════════════════
NGINX_CONFIG="/etc/nginx/sites-available/consulate"

echo ""
echo "📝 إنشاء ملف الإعدادات..."

cat > "$NGINX_CONFIG" << EOF
# ══════════════════════════════════════════════════════
# Nginx Configuration for Consulate Management System
# ══════════════════════════════════════════════════════

# Upstream Backend
upstream backend_api {
    server localhost:3000;
    keepalive 64;
}

# HTTP Server
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAME;

    # Client Max Body Size (للملفات الكبيرة)
    client_max_body_size 50M;

    # Timeouts
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;

    # ──────────────────────────────────────
    # Frontend (React/Vite)
    # ──────────────────────────────────────
    location / {
        root /var/www/consulate;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Cache Static Assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # ──────────────────────────────────────
    # Backend API
    # ──────────────────────────────────────
    location /api/ {
        proxy_pass http://backend_api/;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # ──────────────────────────────────────
    # Uploads Directory
    # ──────────────────────────────────────
    location /uploads/ {
        alias /home/consulate/backend/uploads/;
        autoindex off;

        # Security Headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;

        # Cache
        expires 1d;
        add_header Cache-Control "public";
    }

    # ──────────────────────────────────────
    # Security Headers
    # ──────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # ──────────────────────────────────────
    # Gzip Compression
    # ──────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/x-javascript
        application/xml+rss
        application/rss+xml
        application/atom+xml
        image/svg+xml
        text/x-component
        application/vnd.ms-fontobject
        font/opentype
        font/truetype;

    # ──────────────────────────────────────
    # Logs
    # ──────────────────────────────────────
    access_log /var/log/nginx/consulate_access.log;
    error_log /var/log/nginx/consulate_error.log;
}
EOF

echo "✅ تم إنشاء ملف الإعدادات"
echo ""

# ════════════════════════════════════════
# تفعيل الموقع
# ════════════════════════════════════════
echo "🔗 تفعيل الموقع..."
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/consulate

# حذف الموقع الافتراضي
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo "✅ تم حذف الموقع الافتراضي"
fi

# ════════════════════════════════════════
# اختبار الإعدادات
# ════════════════════════════════════════
echo ""
echo "🧪 اختبار إعدادات Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ إعدادات Nginx صحيحة"
    echo ""

    # إعادة تشغيل Nginx
    read -p "هل تريد إعادة تشغيل Nginx الآن؟ (y/n): " RESTART
    if [ "$RESTART" = "y" ] || [ "$RESTART" = "Y" ]; then
        systemctl restart nginx
        echo "✅ تم إعادة تشغيل Nginx"
    fi

    echo ""
    echo "════════════════════════════════════════"
    echo "✅ تم إعداد Nginx بنجاح!"
    echo "════════════════════════════════════════"
    echo ""

    if [ "$SETUP_TYPE" = "1" ]; then
        echo "🌐 الموقع: http://$DOMAIN_NAME"
        echo ""
        echo "📋 للحصول على SSL (HTTPS):"
        echo "════════════════════════════════════════"
        echo "sudo apt install certbot python3-certbot-nginx -y"
        echo "sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
    else
        echo "🌐 الموقع: http://$VPS_IP"
        echo ""
        echo "⚠️  لاستخدام HTTPS، ستحتاج إلى:"
        echo "1. شراء Domain Name"
        echo "2. ربط Domain بـ IP السيرفر"
        echo "3. تثبيت SSL Certificate"
    fi

    echo "════════════════════════════════════════"
else
    echo ""
    echo "❌ خطأ في إعدادات Nginx!"
    echo "راجع الأخطاء أعلاه"
    exit 1
fi
