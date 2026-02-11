# 🎯 دليل شامل: تحويل المشروع إلى PostgreSQL + Custom API

## 📋 الخطوات الكاملة من البداية للنهاية

---

## المرحلة 1️⃣: استخراج Database من Supabase

### الخطوة 1: تشغيل سكريبت الاستخراج

```bash
cd project

# تثبيت dependencies إذا لم تكن مثبتة
npm install

# استخراج البيانات
node scripts/export-database-complete.js
```

**النتيجة:**
```
database_export/
├── complete_data_export.sql    # ملف SQL جاهز للاستيراد
└── complete_data_export.json   # نسخة احتياطية JSON
```

---

## المرحلة 2️⃣: إعداد PostgreSQL

### الخطوة 1: تثبيت PostgreSQL

#### على Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

#### على macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### على Windows:
قم بتحميل وتثبيت من: https://www.postgresql.org/download/windows/

### الخطوة 2: إنشاء Database والمستخدم

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# في PostgreSQL console، نفذ:
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'كلمة_سر_قوية_هنا';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
ALTER DATABASE consulate_db OWNER TO consulate_user;

# الخروج
\q
```

### الخطوة 3: استيراد Schema (الـ Migrations)

```bash
# الانتقال إلى مجلد migrations
cd supabase/migrations

# تطبيق جميع migrations بالترتيب
for file in *.sql; do
  echo "تطبيق: $file"
  psql -U consulate_user -d consulate_db -f "$file"
done

# العودة للمجلد الرئيسي
cd ../..
```

**ملاحظة:** إذا واجهت أخطاء في بعض الـ migrations (مثل RLS policies)، يمكنك تجاهلها مؤقتاً.

### الخطوة 4: استيراد البيانات

```bash
# استيراد البيانات المستخرجة
psql -U consulate_user -d consulate_db -f database_export/complete_data_export.sql
```

### الخطوة 5: التحقق من نجاح الاستيراد

```bash
# الدخول إلى Database
psql -U consulate_user -d consulate_db

# عرض جميع الجداول
\dt

# عد الصفوف في جدول applications كمثال
SELECT COUNT(*) FROM applications;

# الخروج
\q
```

---

## المرحلة 3️⃣: إعداد Backend API

### الخطوة 1: الانتقال إلى مجلد Backend

```bash
cd backend
```

### الخطوة 2: تثبيت Dependencies

```bash
npm install
```

### الخطوة 3: إعداد Environment Variables

```bash
# نسخ ملف المثال
cp .env.example .env

# تعديل الملف
nano .env
```

**محتوى .env:**
```env
# Database - غيّر القيم حسب إعداداتك
DATABASE_URL=postgresql://consulate_user:كلمة_السر@localhost:5432/consulate_db

# Server
PORT=3000
NODE_ENV=development

# JWT - غيّر هذا المفتاح لمفتاح قوي وعشوائي
JWT_SECRET=أنشئ_مفتاح_عشوائي_قوي_هنا_على_الأقل_32_حرف

# Expiration
JWT_EXPIRES_IN=7d

# CORS - أضف domains التي ستستخدم API
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting (100 طلب كل 15 دقيقة)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### الخطوة 4: إنشاء Super Admin (أول مستخدم)

```bash
# الدخول إلى Database
psql -U consulate_user -d consulate_db

# إنشاء super admin
INSERT INTO staff (
  email,
  username,
  password,
  full_name,
  role,
  active
) VALUES (
  'admin@consulate.sd',
  'admin',
  '$2a$10$rN8Ej5LjEQvxTjMm9VqCJu7Y8xF3FqKpXlGxBvQ8kSx.Z7W3LX7xu',  -- كلمة السر: admin123
  'Super Administrator',
  'super_admin',
  true
);

# الخروج
\q
```

**الحساب الافتراضي:**
- Email: `admin@consulate.sd`
- Username: `admin`
- Password: `admin123`

**⚠️ مهم جداً:** غيّر كلمة السر فوراً بعد أول تسجيل دخول!

### الخطوة 5: تشغيل Backend Server

```bash
# Development mode (مع auto-reload)
npm run dev

# أو Production mode
npm start
```

**يجب أن ترى:**
```
🚀 Server is running on port 3000
📍 Environment: development
🔗 API URL: http://localhost:3000/api
📊 Health check: http://localhost:3000/api/health
```

### الخطوة 6: اختبار Backend

```bash
# في terminal جديد، اختبر health check
curl http://localhost:3000/api/health

# اختبر تسجيل الدخول
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@consulate.sd",
    "password": "admin123"
  }'
```

**يجب أن تحصل على:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@consulate.sd",
    "full_name": "Super Administrator",
    "role": "super_admin"
  }
}
```

**احفظ الـ token** - ستحتاجه لباقي الطلبات!

---

## المرحلة 4️⃣: تحديث Frontend

### الخطوة 1: إنشاء API Client جديد

```bash
# العودة إلى مجلد المشروع الرئيسي
cd ..
```

أنشئ ملف: `src/lib/api-client.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async signIn(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  async signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Applications
  async getApplications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/applications?${query}`);
  }

  async getApplicationById(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(data) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplicationStatus(id, status, notes) {
    return this.request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Services
  async getServices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/services?${query}`);
  }

  async getServiceById(id) {
    return this.request(`/services/${id}`);
  }

  async getCategories() {
    return this.request('/services/categories');
  }

  async getRegions() {
    return this.request('/services/regions');
  }
}

export const apiClient = new APIClient();
```

### الخطوة 2: تحديث .env للـ Frontend

```bash
# تعديل .env
nano .env
```

**أضف:**
```env
VITE_API_URL=http://localhost:3000/api
```

### الخطوة 3: تحديث AuthContext

استبدل `src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = apiClient.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const data = await apiClient.signIn(email, password);
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    await apiClient.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### الخطوة 4: تشغيل Frontend

```bash
npm run dev
```

---

## المرحلة 5️⃣: اختبار النظام الكامل

### 1. اختبار تسجيل الدخول

افتح المتصفح على: `http://localhost:5173/admin-login`

```
Email: admin@consulate.sd
Password: admin123
```

### 2. اختبار عرض الطلبات

بعد تسجيل الدخول، انتقل إلى صفحة الطلبات.

### 3. اختبار إنشاء طلب جديد

انتقل إلى صفحة خدمة وقم بتقديم طلب.

---

## المرحلة 6️⃣: الرفع على Server (Production)

### على Server الخاص بك:

#### 1. تثبيت PostgreSQL

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

#### 2. إنشاء Database

```bash
sudo -u postgres psql
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'production_password';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
\q
```

#### 3. استيراد Database

```bash
# رفع ملفات SQL
scp -r supabase/migrations user@server:/tmp/
scp database_export/complete_data_export.sql user@server:/tmp/

# على Server
cd /tmp/migrations
for file in *.sql; do
  psql -U consulate_user -d consulate_db -f "$file"
done

psql -U consulate_user -d consulate_db -f /tmp/complete_data_export.sql
```

#### 4. رفع Backend

```bash
# على جهازك
scp -r backend user@server:/var/www/

# على Server
cd /var/www/backend
npm install --production

# تعديل .env للـ production
nano .env
```

#### 5. تشغيل Backend مع PM2

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل
pm2 start src/server.js --name consulate-api

# للتشغيل التلقائي عند إعادة التشغيل
pm2 startup
pm2 save
```

#### 6. إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/consulate-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/consulate-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. إعداد SSL مع Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### 8. رفع Frontend

```bash
# على جهازك، build المشروع
npm run build

# رفع dist إلى Server
scp -r dist/* user@server:/var/www/html/

# تحديث .env.production قبل build
VITE_API_URL=https://api.yourdomain.com/api
```

---

## ✅ Checklist النهائي

### Database
- [ ] PostgreSQL مثبت ويعمل
- [ ] Database تم إنشاؤه
- [ ] Schema تم استيراده (migrations)
- [ ] البيانات تم استيرادها
- [ ] Super admin تم إنشاؤه

### Backend
- [ ] Dependencies مثبتة
- [ ] .env تم إعداده بشكل صحيح
- [ ] Server يعمل على port 3000
- [ ] Login API يعمل
- [ ] Applications API يعمل
- [ ] Services API يعمل

### Frontend
- [ ] API Client تم إنشاؤه
- [ ] .env تم تحديثه
- [ ] AuthContext تم تحديثه
- [ ] تسجيل الدخول يعمل
- [ ] عرض البيانات يعمل

### Production (اختياري)
- [ ] Server جاهز ومجهز
- [ ] PostgreSQL مثبت على Server
- [ ] Backend مرفوع ويعمل مع PM2
- [ ] Nginx Reverse Proxy معدّ
- [ ] SSL Certificate مثبت
- [ ] Frontend مرفوع ويعمل

---

## 🆘 حل المشاكل الشائعة

### مشكلة: Database connection failed

```bash
# تحقق من أن PostgreSQL يعمل
sudo systemctl status postgresql

# إعادة تشغيله
sudo systemctl restart postgresql

# اختبار الاتصال
psql -U consulate_user -d consulate_db
```

### مشكلة: Backend لا يعمل

```bash
# تحقق من logs
pm2 logs consulate-api

# أو في development mode
npm run dev
```

### مشكلة: CORS Error في Frontend

تأكد من:
1. `ALLOWED_ORIGINS` في backend/.env يحتوي على frontend URL
2. إعادة تشغيل backend بعد تغيير .env

### مشكلة: JWT Token Invalid

تأكد من:
1. `JWT_SECRET` موجود في .env
2. Token لم تنته صلاحيته
3. استخدام نفس JWT_SECRET في production و development

---

## 📊 ملخص الأوامر المهمة

```bash
# استخراج Database
node scripts/export-database-complete.js

# استيراد إلى PostgreSQL
psql -U consulate_user -d consulate_db -f file.sql

# تشغيل Backend
cd backend && npm run dev

# تشغيل Frontend
npm run dev

# Build للـ production
npm run build

# تشغيل مع PM2
pm2 start src/server.js --name consulate-api

# مراقبة PM2
pm2 monit

# Logs
pm2 logs consulate-api
```

---

## 📞 الدعم

للمزيد من المعلومات، راجع:
- `backend/README.md` - دليل Backend التفصيلي
- `MIGRATION_TO_STANDALONE_GUIDE.md` - دليل التحويل الإنجليزي

---

**🎉 تم! الآن لديك نظام كامل يعمل بـ PostgreSQL + Custom API مستقل تماماً عن Supabase!**
