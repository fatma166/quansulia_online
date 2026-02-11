# 🏛️ Consulate Backend API

Backend API للنظام الإداري للقنصلية السودانية - مبني على Express.js + PostgreSQL

---

## 📁 هيكل المشروع

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # إعداد PostgreSQL
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & authorization
│   │   └── upload.js            # رفع الملفات
│   ├── routes/
│   │   ├── auth.js              # مسارات المصادقة
│   │   ├── applications.js      # مسارات الطلبات
│   │   └── services.js          # مسارات الخدمات
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── applicationsController.js
│   │   └── servicesController.js
│   └── server.js                # الملف الرئيسي
├── uploads/                     # الملفات المرفوعة
├── .env                         # متغيرات البيئة
└── package.json
```

---

## 🚀 التثبيت والتشغيل

### 1. تثبيت Dependencies

```bash
cd backend
npm install
```

### 2. إعداد Database

```bash
# إنشاء database
createdb consulate_db

# استيراد schema
psql -d consulate_db -f ../supabase/migrations/*.sql

# استيراد البيانات
psql -d consulate_db -f ../database_export/complete_data_export.sql
```

### 3. إعداد Environment Variables

```bash
# نسخ ملف المثال
cp .env.example .env

# تعديل القيم
nano .env
```

### 4. تشغيل Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/consulate_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/login              تسجيل الدخول
POST   /api/auth/staff              إنشاء موظف جديد (super admin فقط)
PUT    /api/auth/reset-password/:id  إعادة تعيين كلمة المرور
GET    /api/auth/profile            الحصول على معلومات المستخدم
```

### Applications (الطلبات)

```
GET    /api/applications            قائمة الطلبات
GET    /api/applications/:id        تفاصيل طلب واحد
POST   /api/applications            إنشاء طلب جديد
PUT    /api/applications/:id/status تحديث حالة الطلب
DELETE /api/applications/:id        حذف طلب
```

### Services (الخدمات)

```
GET    /api/services                قائمة الخدمات
GET    /api/services/:id            تفاصيل خدمة واحدة
GET    /api/services/categories     قائمة الفئات
GET    /api/services/subcategories  قائمة الفئات الفرعية
GET    /api/services/regions        قائمة المناطق
```

---

## 🔐 Authentication & Authorization

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "super_admin"
  }
}
```

### استخدام Token

```bash
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 Roles & Permissions

### Roles

- `super_admin` - صلاحيات كاملة
- `admin` - إدارة محدودة
- `staff` - صلاحيات محددة

### Permissions

```javascript
{
  "view_applications": true,
  "manage_applications": true,
  "view_services": true,
  "manage_services": false,
  "view_staff": true,
  "manage_staff": false,
  "view_reports": true,
  "manage_settings": false
}
```

---

## 📤 File Upload

### رفع ملف واحد

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### رفع عدة ملفات

```bash
curl -X POST http://localhost:3000/api/upload-multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@document1.pdf" \
  -F "files=@document2.pdf"
```

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

### Test Login

```bash
npm run test:login
```

### Test Applications

```bash
npm run test:applications
```

---

## 🚀 Production Deployment

### باستخدام PM2

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل Server
pm2 start src/server.js --name consulate-api

# مراقبة
pm2 monit

# Logs
pm2 logs consulate-api

# Auto-restart على إعادة التشغيل
pm2 startup
pm2 save
```

### باستخدام Docker (اختياري)

```bash
# Build image
docker build -t consulate-api .

# Run container
docker run -d -p 3000:3000 --name consulate-api \
  -e DATABASE_URL="postgresql://..." \
  consulate-api
```

---

## 🔧 Troubleshooting

### Database connection failed

```bash
# تحقق من أن PostgreSQL يعمل
sudo systemctl status postgresql

# اختبار الاتصال
psql -U consulate_user -d consulate_db
```

### Port already in use

```bash
# اعثر على العملية
lsof -i :3000

# أوقف العملية
kill -9 PID
```

### JWT token invalid

```bash
# تحقق من JWT_SECRET في .env
# تأكد من أن Token غير منتهي الصلاحية
```

---

## 📊 Database Schema

انظر الملفات في:
- `../supabase/migrations/` - جميع الـ migrations
- `../database_export/` - البيانات المستخرجة

---

## 🔄 API Response Format

### Success

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error

```json
{
  "error": "Error message here"
}
```

### Pagination

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

---

## 📝 TODO

- [ ] إضافة Appointments endpoints
- [ ] إضافة Shipping endpoints
- [ ] إضافة CMS endpoints
- [ ] إضافة Chatbot endpoints
- [ ] إضافة Email notifications
- [ ] إضافة WebSocket للـ real-time updates
- [ ] إضافة Tests (Jest)
- [ ] إضافة API documentation (Swagger)

---

## 📞 Support

للمساعدة أو الأسئلة، يرجى مراجعة:
- `../MIGRATION_TO_STANDALONE_GUIDE.md` - دليل التحويل الكامل
- `../PROJECT_TECHNICAL_INFO.md` - معلومات تقنية

---

## 📄 License

MIT License
