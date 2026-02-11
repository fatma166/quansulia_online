#!/bin/bash
# ══════════════════════════════════════════════════════
# سكريبت إعداد VPS الكامل
# نفذ هذا السكريبت على VPS بعد أول اتصال
# ══════════════════════════════════════════════════════

set -e  # توقف عند أي خطأ

echo "════════════════════════════════════════"
echo "🚀 إعداد VPS للمشروع"
echo "════════════════════════════════════════"
echo ""

# التحقق من صلاحيات root
if [ "$EUID" -ne 0 ]; then
    echo "❌ يرجى تشغيل السكريبت بصلاحيات root"
    echo "استخدم: sudo ./setup-vps.sh"
    exit 1
fi

# ════════════════════════════════════════
# 1. تحديث النظام
# ════════════════════════════════════════
echo "📦 الخطوة 1: تحديث النظام..."
apt update
apt upgrade -y
echo "✅ تم تحديث النظام"
echo ""

# ════════════════════════════════════════
# 2. تثبيت الأدوات الأساسية
# ════════════════════════════════════════
echo "🔧 الخطوة 2: تثبيت الأدوات الأساسية..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ufw \
    fail2ban \
    unzip \
    vim \
    nano \
    htop \
    net-tools \
    zip

echo "✅ تم تثبيت الأدوات الأساسية"
echo ""

# ════════════════════════════════════════
# 3. إنشاء مستخدم التطبيق
# ════════════════════════════════════════
echo "👤 الخطوة 3: إنشاء مستخدم التطبيق..."
if id "consulate" &>/dev/null; then
    echo "⚠️  المستخدم consulate موجود بالفعل"
else
    adduser --gecos "" --disabled-password consulate
    echo "consulate:ConsulatePass2026!" | chpasswd
    usermod -aG sudo consulate
    echo "✅ تم إنشاء المستخدم consulate"
fi
echo ""

# ════════════════════════════════════════
# 4. تثبيت PostgreSQL 15
# ════════════════════════════════════════
echo "🗄️  الخطوة 4: تثبيت PostgreSQL 15..."
if command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL مثبت بالفعل"
else
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt update
    apt install -y postgresql-15 postgresql-contrib-15
    systemctl enable postgresql
    echo "✅ تم تثبيت PostgreSQL"
fi
echo ""

# ════════════════════════════════════════
# 5. إعداد Database
# ════════════════════════════════════════
echo "💾 الخطوة 5: إعداد قاعدة البيانات..."

# إنشاء password عشوائي قوي
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

sudo -u postgres psql << EOF
-- إنشاء قاعدة البيانات والمستخدم
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
ALTER DATABASE consulate_db OWNER TO consulate_user;

-- تفعيل Extensions
\c consulate_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOF

# حفظ Password في ملف
mkdir -p /home/consulate/.secrets
echo "DB_PASSWORD=$DB_PASSWORD" > /home/consulate/.secrets/db-credentials.txt
chmod 600 /home/consulate/.secrets/db-credentials.txt
chown consulate:consulate /home/consulate/.secrets/db-credentials.txt

echo "✅ تم إعداد قاعدة البيانات"
echo "📝 Database Password محفوظ في: /home/consulate/.secrets/db-credentials.txt"
echo ""

# ════════════════════════════════════════
# 6. تعديل pg_hba.conf
# ════════════════════════════════════════
echo "🔐 الخطوة 6: إعداد PostgreSQL Authentication..."
PG_HBA="/etc/postgresql/15/main/pg_hba.conf"
sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA"
systemctl restart postgresql
echo "✅ تم إعداد PostgreSQL Authentication"
echo ""

# ════════════════════════════════════════
# 7. تثبيت Node.js 20.x
# ════════════════════════════════════════
echo "📦 الخطوة 7: تثبيت Node.js..."
if command -v node &> /dev/null; then
    echo "⚠️  Node.js مثبت بالفعل: $(node --version)"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "✅ تم تثبيت Node.js: $(node --version)"
fi
echo ""

# ════════════════════════════════════════
# 8. تثبيت PM2
# ════════════════════════════════════════
echo "⚙️  الخطوة 8: تثبيت PM2..."
if command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 مثبت بالفعل"
else
    npm install -g pm2
    echo "✅ تم تثبيت PM2"
fi
echo ""

# ════════════════════════════════════════
# 9. تثبيت Nginx
# ════════════════════════════════════════
echo "🌐 الخطوة 9: تثبيت Nginx..."
if command -v nginx &> /dev/null; then
    echo "⚠️  Nginx مثبت بالفعل"
else
    apt install -y nginx
    systemctl enable nginx
    echo "✅ تم تثبيت Nginx"
fi
echo ""

# ════════════════════════════════════════
# 10. إعداد المجلدات
# ════════════════════════════════════════
echo "📁 الخطوة 10: إنشاء المجلدات..."
mkdir -p /home/consulate/backend
mkdir -p /home/consulate/backups
mkdir -p /var/www/consulate
chown -R consulate:consulate /home/consulate
chown -R www-data:www-data /var/www/consulate
echo "✅ تم إنشاء المجلدات"
echo ""

# ════════════════════════════════════════
# 11. إعداد Firewall
# ════════════════════════════════════════
echo "🔥 الخطوة 11: إعداد Firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH (⚠️ قيده لاحقاً لـ IP محدد!)
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw deny 5432/tcp # PostgreSQL
ufw deny 3000/tcp # Backend API
ufw --force enable
echo "✅ تم إعداد Firewall"
echo ""

# ════════════════════════════════════════
# 12. إعداد Fail2Ban
# ════════════════════════════════════════
echo "🛡️  الخطوة 12: إعداد Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "✅ تم إعداد Fail2Ban"
echo ""

# ════════════════════════════════════════
# النهاية
# ════════════════════════════════════════
echo ""
echo "════════════════════════════════════════"
echo "✅ تم إعداد VPS بنجاح!"
echo "════════════════════════════════════════"
echo ""
echo "📋 معلومات مهمة:"
echo "════════════════════════════════════════"
echo "Database Name: consulate_db"
echo "Database User: consulate_user"
echo "Database Password: $DB_PASSWORD"
echo "App User: consulate"
echo "App Password: ConsulatePass2026!"
echo ""
echo "📝 المعلومات محفوظة في:"
echo "/home/consulate/.secrets/db-credentials.txt"
echo ""
echo "════════════════════════════════════════"
echo "📋 الخطوات التالية:"
echo "════════════════════════════════════════"
echo "1. انقل Backend إلى: /home/consulate/backend/"
echo "2. انقل Frontend (dist) إلى: /var/www/consulate/"
echo "3. استورد Database backup"
echo "4. عدل Backend .env"
echo "5. شغل Backend بـ PM2"
echo "6. عدل Nginx config"
echo "7. اختبر المشروع"
echo "════════════════════════════════════════"
echo ""
