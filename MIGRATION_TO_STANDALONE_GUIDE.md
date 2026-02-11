# 🎯 دليل شامل: تحويل المشروع إلى PostgreSQL + Custom API

هذا الدليل يشرح كيفية تحويل المشروع من Supabase إلى PostgreSQL عادي مع API مخصص.

---

## 📋 الخطوات الرئيسية

### المرحلة 1️⃣: استخراج Database
### المرحلة 2️⃣: إعداد PostgreSQL
### المرحلة 3️⃣: إنشاء Backend API
### المرحلة 4️⃣: تحديث Frontend
### المرحلة 5️⃣: Testing & Deployment

---

## المرحلة 1️⃣: استخراج Database من Supabase

### الطريقة الأولى: باستخدام pg_dump (الأفضل)

```bash
# 1. تأكد من تثبيت PostgreSQL client tools
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# macOS:
brew install postgresql

# 2. استخراج Database كامل
./scripts/export-complete-database.sh
```

### الطريقة الثانية: باستخدام Node.js Script

```bash
# استخراج البيانات من Supabase
node scripts/export-database-complete.js
```

سينشئ هذا ملفين:
- `database_export/complete_data_export.sql` - ملف SQL للاستيراد
- `database_export/complete_data_export.json` - نسخة احتياطية JSON

---

## المرحلة 2️⃣: إعداد PostgreSQL

### 1. تثبيت PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows
# قم بتحميل وتثبيت من: https://www.postgresql.org/download/windows/
```

### 2. إنشاء Database جديد

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# في PostgreSQL console:
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;

# الخروج
\q
```

### 3. استيراد Schema

```bash
# استيراد جميع migrations
cd supabase/migrations

# تطبيق كل migration بالترتيب
for file in *.sql; do
  echo "Applying $file..."
  psql -U consulate_user -d consulate_db -f "$file"
done
```

### 4. استيراد البيانات

```bash
# استيراد البيانات المستخرجة
psql -U consulate_user -d consulate_db -f database_export/complete_data_export.sql
```

---

## المرحلة 3️⃣: إنشاء Backend API

الآن سننشئ Backend API كامل باستخدام Express.js + PostgreSQL.

### 1. إنشاء Backend Project

```bash
# إنشاء مجلد جديد
mkdir consulate-backend
cd consulate-backend

# تهيئة npm project
npm init -y

# تثبيت Dependencies
npm install express pg bcryptjs jsonwebtoken cors dotenv multer
npm install -D nodemon
```

### 2. هيكل المشروع

```
consulate-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── applications.js
│   │   ├── services.js
│   │   ├── staff.js
│   │   ├── appointments.js
│   │   └── cms.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── applicationsController.js
│   │   └── ...
│   └── server.js
├── uploads/
├── .env
└── package.json
```

---

## المرحلة 4️⃣: ملفات Backend الأساسية

سيتم إنشاء جميع الملفات المطلوبة في الخطوات التالية...

---

## المرحلة 5️⃣: تحديث Frontend

### 1. تحديث API Client

استبدال `src/lib/supabase.js` بـ API client جديد:

```javascript
// src/lib/api-client.js
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth methods
  async signIn(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Applications
  async getApplications(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/applications?${query}`);
  }

  async createApplication(data) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Services
  async getServices() {
    return this.request('/services');
  }

  // ... more methods
}

export const apiClient = new APIClient();
```

### 2. تحديث Environment Variables

```env
# .env
VITE_API_URL=http://localhost:3000/api
```

---

## المرحلة 6️⃣: Testing

### 1. اختبار Backend

```bash
cd consulate-backend
npm run dev
```

### 2. اختبار Frontend

```bash
cd ..
npm run dev
```

### 3. اختبار Endpoints

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test get applications (with token)
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## المرحلة 7️⃣: Deployment

### 1. Deploy Database

```bash
# On production server
sudo apt-get install postgresql
sudo -u postgres psql

# Create production database
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'secure_production_password';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;

# Import schema and data
psql -U consulate_user -d consulate_db -f migrations.sql
psql -U consulate_user -d consulate_db -f data.sql
```

### 2. Deploy Backend

```bash
# Copy backend to server
scp -r consulate-backend user@server:/var/www/

# On server
cd /var/www/consulate-backend
npm install --production

# Setup PM2
npm install -g pm2
pm2 start src/server.js --name consulate-api
pm2 startup
pm2 save
```

### 3. Setup Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/consulate-api
server {
    listen 80;
    server_name api.yourdomain.com;

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

### 4. Deploy Frontend

```bash
# Build frontend
npm run build

# Copy dist to server
scp -r dist/* user@server:/var/www/html/

# Update .env.production
VITE_API_URL=https://api.yourdomain.com/api
```

---

## ⚙️ Configuration Files

### Backend .env

```env
# Database
DATABASE_URL=postgresql://consulate_user:password@localhost:5432/consulate_db

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173
```

### Frontend .env.production

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🔒 Security Checklist

```
✅ استخدام HTTPS للـ production
✅ تشفير كلمات المرور باستخدام bcrypt
✅ JWT tokens مع expiration
✅ CORS محدد للـ domains المسموحة
✅ Rate limiting على endpoints
✅ Input validation على جميع endpoints
✅ SQL injection prevention (باستخدام parameterized queries)
✅ File upload validation (نوع وحجم الملف)
✅ Environment variables محمية
✅ Database credentials آمنة
```

---

## 📊 Comparison

| Feature | Supabase | Custom Backend |
|---------|----------|----------------|
| Setup Time | سريع جداً | يحتاج وقت |
| تحكم كامل | محدود | كامل 100% |
| التكلفة | اشتراك شهري | فقط Server |
| Scalability | تلقائي | يحتاج إعداد |
| RLS | مدمج | تحتاج تطبيق يدوي |
| Real-time | مدمج | تحتاج WebSockets |
| Storage | مدمج | تحتاج إعداد |

---

## 🚀 الخطوات التالية

بعد اكتمال التحويل، سأقوم بإنشاء:

1. ✅ Backend API كامل (جميع endpoints)
2. ✅ Authentication & Authorization
3. ✅ File Upload system
4. ✅ Email system (OTP, notifications)
5. ✅ Cron jobs (للـ appointments, etc)

**هل تريد أن أبدأ بإنشاء Backend كامل الآن؟**
