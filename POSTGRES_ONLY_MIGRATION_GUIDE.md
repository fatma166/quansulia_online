# دليل التحويل إلى PostgreSQL فقط
## (غير موصى به - لكن ممكن إذا كان ضرورياً)

---

## ⚠️ تحذير مهم

Supabase Self-hosted **أصلاً يستخدم PostgreSQL**!

الفرق الوحيد أنه يضيف خدمات مساعدة:
- **GoTrue**: نظام Auth جاهز
- **Storage API**: رفع الملفات
- **PostgREST**: REST API تلقائي
- **Realtime**: WebSockets

**كل هذه الخدمات تعمل على سيرفرك الخاص - لا فرق من ناحية السيادة!**

---

## إذا كنت مصر على PostgreSQL فقط

### وقت التطوير المتوقع: **3-4 أسابيع**

### الأجزاء التي تحتاج تعديل:

---

## 1. نظام Authentication (أسبوع واحد)

### الحالي (Supabase Auth):
```javascript
// تسجيل دخول
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// الحصول على المستخدم الحالي
const { data: { user } } = await supabase.auth.getUser();
```

### الجديد (مطلوب بناؤه):
```javascript
// تحتاج بناء:
// 1. Express/Fastify server
// 2. JWT token system
// 3. Password hashing (bcrypt)
// 4. Session management
// 5. OTP system مخصص
// 6. Password reset
// 7. Email verification

// مثال:
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Query database
  const user = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  // Check password
  const valid = await bcrypt.compare(password, user.password_hash);

  if (valid) {
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    res.json({ token });
  }
});

// تحتاج بناء middleware للتحقق من JWT
// تحتاج بناء نظام OTP كامل
// تحتاج بناء نظام إرسال إيميلات
```

**الملفات المطلوب تعديلها**:
- `src/contexts/AuthContext.jsx`
- `src/pages/AdminLogin.jsx`
- `src/components/OTPVerification.jsx`
- جميع الصفحات التي تستخدم `supabase.auth.*`

**عدد الملفات**: ~40 ملف

---

## 2. File Upload System (أسبوع واحد)

### الحالي (Supabase Storage):
```javascript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${applicationId}/${fileName}`, file);
```

### الجديد (مطلوب بناؤه):
```javascript
// تحتاج بناء:
// 1. Multer middleware
// 2. File validation
// 3. File storage (filesystem أو S3)
// 4. URL generation
// 5. Access control
// 6. File deletion

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `/uploads/${req.user.id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Validate file type
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// تحتاج بناء نظام لحماية الملفات
// تحتاج middleware للتحقق من صلاحيات الوصول
```

**الملفات المطلوب تعديلها**:
- `src/components/ImageUploader.jsx`
- `src/components/DynamicForm.jsx`
- `src/pages/ApplicationDetail.jsx`
- جميع الصفحات التي ترفع ملفات

**عدد الملفات**: ~25 ملف

---

## 3. REST API (أسبوعان)

### الحالي (Supabase PostgREST):
```javascript
// Query تلقائي
const { data } = await supabase
  .from('applications')
  .select('*')
  .eq('status', 'pending');

// Insert تلقائي
const { data } = await supabase
  .from('applications')
  .insert({ name, email });
```

### الجديد (مطلوب بناؤه):
```javascript
// تحتاج بناء REST API كامل
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'consulate',
  password: 'password',
  port: 5432,
});

// لكل جدول، تحتاج بناء:
// - GET all
// - GET by ID
// - POST create
// - PUT update
// - DELETE

// مثال: Applications
app.get('/api/applications', async (req, res) => {
  const { status, page, limit } = req.query;

  let query = 'SELECT * FROM applications WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  // Pagination
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.post('/api/applications', async (req, res) => {
  const { name, email, service_id } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await pool.query(
    'INSERT INTO applications (name, email, service_id) VALUES ($1, $2, $3) RETURNING *',
    [name, email, service_id]
  );

  res.json(result.rows[0]);
});

// تكرر هذا لكل جدول (20+ جدول!)
// تحتاج بناء filters معقدة
// تحتاج بناء relations (joins)
// تحتاج بناء pagination
// تحتاج error handling
```

**الجداول المطلوب بناء API لها**:
- applications (20+ endpoints)
- services (15+ endpoints)
- staff (10+ endpoints)
- appointments (10+ endpoints)
- shipments (8+ endpoints)
- invoices (8+ endpoints)
- news (6+ endpoints)
- events (6+ endpoints)
- chat_messages (8+ endpoints)
- ... و 15+ جدول آخر

**الإجمالي**: ~150 endpoint

**الملفات المطلوب تعديلها**:
- `src/lib/api.js` (كل الـ API calls)
- جميع الـ Components والـ Pages (~80 ملف)

---

## 4. Row Level Security (RLS) → Application Security

### الحالي (RLS في PostgreSQL):
```sql
-- تلقائي في Database
CREATE POLICY "Users can view own applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = user_id);
```

### الجديد (في Application Code):
```javascript
// تحتاج كتابة logic في كل endpoint
app.get('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // من JWT

  // Check permission manually
  const result = await pool.query(
    'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(result.rows[0]);
});

// تكرر هذا في كل endpoint!
```

**عدد الـ Policies الحالية**: ~60 policy

**المطلوب**: كتابة logic يدوي في كل endpoint

---

## 5. Realtime (اختياري)

### الحالي (Supabase Realtime):
```javascript
supabase
  .channel('applications')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' })
  .subscribe((payload) => {
    console.log('Change received!', payload);
  });
```

### الجديد:
```javascript
// تحتاج بناء WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// تحتاج بناء subscription system
// تحتاج بناء نظام للاستماع لتغييرات Database
// (PostgreSQL LISTEN/NOTIFY)
```

---

## 6. Backend Structure المطلوب

```
backend/
├── server.js                 # Express server
├── config/
│   ├── database.js          # PostgreSQL connection
│   └── auth.js              # JWT config
├── middleware/
│   ├── authenticate.js      # JWT verification
│   ├── authorize.js         # Permission checks
│   └── upload.js            # File upload
├── routes/
│   ├── auth.js              # Login, register, OTP
│   ├── applications.js      # Applications CRUD
│   ├── services.js          # Services CRUD
│   ├── staff.js             # Staff management
│   ├── appointments.js      # Appointments
│   ├── shipments.js         # Shipments
│   ├── invoices.js          # Invoices
│   ├── news.js              # News & Events
│   ├── chat.js              # Chat system
│   └── ...                  # 15+ more
├── controllers/
│   └── ...                  # Business logic
├── models/
│   └── ...                  # Database models
└── utils/
    ├── email.js             # Email sending
    ├── otp.js               # OTP generation
    ├── validation.js        # Input validation
    └── ...
```

**عدد الملفات الجديدة**: ~80 ملف

---

## 7. Frontend Changes

### كل ملف يستخدم Supabase يحتاج تعديل:

```javascript
// قبل (Supabase)
import { supabase } from '../lib/supabase';

const { data } = await supabase
  .from('applications')
  .select('*');

// بعد (Custom API)
const response = await fetch('/api/applications', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

**الملفات المطلوب تعديلها**: ~80 ملف

---

## ملخص التعديلات

| البند | عدد الملفات | الوقت المقدر |
|-------|-------------|---------------|
| Auth System | 40 ملف | أسبوع |
| File Upload | 25 ملف | أسبوع |
| REST API (Backend) | 80 ملف جديد | أسبوعان |
| Frontend Updates | 80 ملف | أسبوع |
| Testing & Debugging | - | أسبوع |
| **المجموع** | **225 ملف** | **6 أسابيع** |

---

## التكلفة المقدرة

### إذا كنت ستعمله بنفسك:
- **الوقت**: 6 أسابيع (عمل كامل)
- **المخاطر**: عالية (bugs, security issues)

### إذا ستوظف مطور:
- **التكلفة**: $5,000 - $10,000
- **الوقت**: 4-6 أسابيع
- **الصيانة**: أغلى (كود custom)

---

## المقارنة النهائية

| المعيار | Supabase Self-hosted | PostgreSQL فقط |
|---------|---------------------|---------------|
| **وقت النشر** | 2-3 ساعات | 6 أسابيع |
| **عدد الملفات المعدلة** | 0 | 225 |
| **التكلفة** | $0 | $5,000-10,000 |
| **البيانات على سيرفرك** | ✅ | ✅ |
| **الصيانة** | سهلة | صعبة |
| **Security** | مختبر من ملايين | أنت مسؤول |
| **Updates** | منتظمة | أنت مسؤول |
| **التوثيق** | ممتاز | لا يوجد |
| **Community Support** | كبير | لا يوجد |

---

## التوصية النهائية

**لا ننصح بالتحويل إلى PostgreSQL فقط!**

### الأسباب:

1. **Supabase Self-hosted أصلاً PostgreSQL** - لا فرق من ناحية السيادة
2. **وفر 6 أسابيع تطوير**
3. **وفر $5,000-10,000**
4. **أقل أخطاء وثغرات أمنية**
5. **صيانة أسهل**
6. **مدعوم ومحدث**

---

## إذا كان السبب هو "القلق من Supabase"

اطمئن:
- ✅ Supabase Self-hosted = **PostgreSQL + خدمات مساعدة**
- ✅ كل شيء على سيرفرك (لا اتصال خارجي)
- ✅ الكود مفتوح المصدر (يمكن مراجعته)
- ✅ يمكن تعديله حسب حاجتك
- ✅ لا رسوم (مجاني)

---

## الخلاصة

التحويل لـ PostgreSQL فقط:
- ✅ **ممكن** تقنياً
- ❌ **غير عملي** (6 أسابيع + $10,000)
- ❌ **غير ضروري** (Supabase Self-hosted يحقق نفس الهدف)

**استخدم Supabase Self-hosted = نفس النتيجة بـ 1% من الجهد!**
