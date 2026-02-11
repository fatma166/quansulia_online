# 🎯 نظام القنصلية السودانية - نسخة مستقلة

## PostgreSQL + Custom Express.js API

---

## 📦 محتويات المشروع

```
project/
├── backend/                         🆕 Backend API كامل
│   ├── src/
│   │   ├── config/                  ⚙️ Database config
│   │   ├── middleware/              🔐 Auth & Upload
│   │   ├── controllers/             🎮 Business logic
│   │   ├── routes/                  🛣️ API routes
│   │   └── server.js               🚀 Main server
│   ├── scripts/
│   │   ├── create-super-admin.js   👤 إنشاء admin
│   │   └── generate-jwt-secret.js  🔑 توليد JWT key
│   ├── .env.example                📝 مثال الإعدادات
│   ├── package.json
│   ├── Dockerfile                  🐳 Docker support
│   ├── docker-compose.yml
│   ├── README.md                   📖 دليل Backend
│   └── API_DOCUMENTATION.md        📡 توثيق API
│
├── scripts/
│   └── export-database-complete.js 💾 استخراج البيانات
│
├── supabase/migrations/            🗄️ Database schema (150+ files)
│
├── src/                            ⚛️ Frontend (React)
│
└── docs/                           📚 الأدلة
    ├── COMPLETE_STANDALONE_GUIDE_AR.md     - دليل كامل عربي
    ├── QUICK_START_STANDALONE.md           - بدء سريع
    ├── MIGRATION_TO_STANDALONE_GUIDE.md    - دليل التحويل
    └── STANDALONE_SYSTEM_SUMMARY.md        - ملخص شامل
```

---

## ⚡ بدء سريع (3 دقائق)

### الخطوة 1: استخراج Database

```bash
node scripts/export-database-complete.js
```

### الخطوة 2: إعداد PostgreSQL + Backend

```bash
# إنشاء database
sudo -u postgres psql -c "CREATE DATABASE consulate_db;"
sudo -u postgres psql -c "CREATE USER consulate_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;"

# استيراد schema
cd supabase/migrations && for f in *.sql; do psql -U consulate_user -d consulate_db -f "$f"; done && cd ../..

# استيراد البيانات
psql -U consulate_user -d consulate_db -f database_export/complete_data_export.sql

# Backend
cd backend
npm install
cp .env.example .env
nano .env  # عدّل DATABASE_URL و JWT_SECRET
npm run create-admin  # إنشاء super admin
npm run dev
```

### الخطوة 3: Frontend

```bash
cd ..
echo "VITE_API_URL=http://localhost:3000/api" >> .env
npm run dev
```

**تم!** افتح: `http://localhost:5173/admin-login`

---

## 🐳 الطريقة الأسهل: Docker

```bash
cd backend
docker-compose up -d
```

**تم!** كل شيء يعمل:
- PostgreSQL: `localhost:5432`
- Backend API: `localhost:3000`

---

## 📚 الأدلة المتاحة

### للمبتدئين:
1. **QUICK_START_STANDALONE.md** - ابدأ في 3 خطوات

### للتفاصيل:
2. **COMPLETE_STANDALONE_GUIDE_AR.md** - دليل كامل خطوة بخطوة (عربي)
3. **MIGRATION_TO_STANDALONE_GUIDE.md** - شرح التحويل (إنجليزي)

### للمطورين:
4. **backend/README.md** - دليل Backend التفصيلي
5. **backend/API_DOCUMENTATION.md** - توثيق جميع الـ endpoints

### للملخص:
6. **STANDALONE_SYSTEM_SUMMARY.md** - ملخص شامل

---

## 🎯 الميزات

### ✅ Backend API
- Express.js + PostgreSQL
- JWT Authentication
- Role-based Access Control
- File Upload
- Rate Limiting
- CORS Protection
- Security Headers

### ✅ Database
- PostgreSQL مع 150+ migration
- جميع الجداول والبيانات
- Indexes محسّنة
- Foreign Keys

### ✅ Documentation
- API Documentation كامل
- أدلة بالعربي والإنجليزي
- أمثلة عملية
- Troubleshooting

---

## 📡 API Endpoints

```
Authentication:
  POST   /api/auth/login
  GET    /api/auth/profile

Applications:
  GET    /api/applications
  POST   /api/applications
  PUT    /api/applications/:id/status

Services:
  GET    /api/services
  GET    /api/services/:id
```

**للتفاصيل الكاملة:** `backend/API_DOCUMENTATION.md`

---

## 🔧 التكوين

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/consulate_db
PORT=3000
JWT_SECRET=generated-secret-key
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Production Deployment

### على VPS/Server:

```bash
# 1. Backend
cd backend
npm install --production
pm2 start src/server.js --name consulate-api

# 2. Nginx
sudo nano /etc/nginx/sites-available/api
# أضف reverse proxy config

# 3. SSL
sudo certbot --nginx -d api.yourdomain.com

# 4. Frontend
npm run build
# ارفع dist/ إلى web server
```

**للتفاصيل:** `COMPLETE_STANDALONE_GUIDE_AR.md`

---

## 🆘 مشاكل شائعة

### Database connection failed
```bash
sudo systemctl restart postgresql
psql -U consulate_user -d consulate_db
```

### Backend لا يعمل
```bash
cd backend
npm run dev  # شاهد الأخطاء
```

### CORS Error
تحقق من `ALLOWED_ORIGINS` في `backend/.env`

---

## 📊 النظام يتضمن

### Database Tables (40+ جدول):
- ✅ staff (الموظفون)
- ✅ applications (الطلبات)
- ✅ services (الخدمات)
- ✅ appointments (المواعيد)
- ✅ shipments (الشحنات)
- ✅ news, events (الأخبار)
- ✅ cms_* (إدارة المحتوى)
- ... والمزيد

### API Endpoints (15+ endpoint):
- ✅ Authentication
- ✅ Applications CRUD
- ✅ Services management
- ✅ File upload (قريباً)
- ... والمزيد

---

## 🎓 المتطلبات

### للتشغيل:
- Node.js 18+
- PostgreSQL 15+
- npm/yarn

### للـ Production:
- VPS/Server (2GB RAM+)
- Domain name
- SSL Certificate

---

## 💡 نصائح

### Development:
- استخدم `nodemon` للـ auto-reload
- راجع logs في console
- استخدم Postman للاختبار

### Production:
- استخدم PM2 للـ process management
- فعّل SSL/HTTPS
- استخدم environment variables
- راجع logs بانتظام

---

## 🔐 Security

### تم تطبيق:
- ✅ JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Helmet.js
- ✅ Input validation
- ✅ SQL injection prevention

---

## 📈 التطوير المستقبلي

يمكن إضافة:
- [ ] More API endpoints
- [ ] WebSockets (real-time)
- [ ] Email/SMS notifications
- [ ] File storage (S3)
- [ ] Analytics
- [ ] Reports generation
- [ ] Mobile app

---

## 🆚 لماذا النسخة المستقلة؟

### المميزات:
✅ تحكم كامل 100%
✅ لا توجد تكاليف اشتراك
✅ يمكن رفعه على أي server
✅ قابل للتخصيص بالكامل
✅ لا قيود على الاستخدام

### الفرق عن Supabase:
- Supabase: سريع لكن محدود ومكلف
- Custom: يحتاج إعداد لكن مرن وأرخص

---

## 📞 الدعم

اقرأ الأدلة حسب احتياجك:

**مبتدئ؟** → `QUICK_START_STANDALONE.md`

**تريد التفاصيل؟** → `COMPLETE_STANDALONE_GUIDE_AR.md`

**مطور؟** → `backend/README.md` + `API_DOCUMENTATION.md`

**ملخص سريع؟** → `STANDALONE_SYSTEM_SUMMARY.md`

---

## ✨ الخلاصة

الآن لديك:
1. ✅ Backend API كامل
2. ✅ Database في PostgreSQL
3. ✅ أدلة شاملة
4. ✅ Docker support
5. ✅ Production-ready

**🎉 ابدأ الآن باستخدام `QUICK_START_STANDALONE.md`!**

---

## 📄 License

MIT License - استخدمه كما تشاء

---

تم إنشاؤه بـ ❤️ للقنصلية السودانية
