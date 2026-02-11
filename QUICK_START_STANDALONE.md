# ⚡ دليل البدء السريع - نظام مستقل

## 🎯 3 خطوات فقط للتشغيل

---

## الخطوة 1️⃣: استخراج Database (دقيقتان)

```bash
# استخراج البيانات من Supabase
node scripts/export-database-complete.js
```

**النتيجة:** ملف `database_export/complete_data_export.sql`

---

## الخطوة 2️⃣: إعداد PostgreSQL (5 دقائق)

```bash
# إنشاء database
sudo -u postgres psql
CREATE DATABASE consulate_db;
CREATE USER consulate_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE consulate_db TO consulate_user;
\q

# استيراد schema
cd supabase/migrations
for file in *.sql; do psql -U consulate_user -d consulate_db -f "$file"; done
cd ../..

# استيراد البيانات
psql -U consulate_user -d consulate_db -f database_export/complete_data_export.sql
```

---

## الخطوة 3️⃣: تشغيل Backend + Frontend (3 دقائق)

### Backend:

```bash
cd backend

# تثبيت
npm install

# إعداد .env
cp .env.example .env
nano .env  # عدّل DATABASE_URL و JWT_SECRET

# إنشاء super admin
node scripts/create-super-admin.js

# تشغيل
npm run dev
```

### Frontend:

```bash
# في terminal جديد
cd ..

# تحديث .env
echo "VITE_API_URL=http://localhost:3000/api" >> .env

# تشغيل
npm run dev
```

---

## ✅ اختبار

افتح المتصفح: `http://localhost:5173/admin-login`

```
Email: admin@consulate.sd
Password: admin123
```

---

## 🐳 البديل: استخدام Docker (دقيقة واحدة!)

```bash
cd backend

# تشغيل كل شيء
docker-compose up -d

# متابعة logs
docker-compose logs -f
```

**تم!** النظام يعمل على `http://localhost:3000`

---

## 📦 الملفات المهمة

```
✅ database_export/complete_data_export.sql  - البيانات
✅ backend/                                   - API كامل
✅ COMPLETE_STANDALONE_GUIDE_AR.md           - دليل تفصيلي
✅ backend/README.md                         - دليل Backend
```

---

## 🆘 مشاكل شائعة

### Database connection failed
```bash
sudo systemctl restart postgresql
```

### Port 3000 مستخدم
```bash
lsof -i :3000
kill -9 PID
```

### Token invalid
تأكد من `JWT_SECRET` في `.env`

---

## 📞 للدعم

راجع: `COMPLETE_STANDALONE_GUIDE_AR.md` للدليل الكامل
