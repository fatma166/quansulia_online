# 📡 API Documentation

دليل شامل لجميع الـ API Endpoints المتاحة

---

## 🔐 Authentication

جميع الـ endpoints المحمية تحتاج إلى JWT Token في Header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1️⃣ Authentication Endpoints

### POST /api/auth/login

تسجيل الدخول

**Request:**
```json
{
  "email": "admin@consulate.sd",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@consulate.sd",
    "username": "admin",
    "full_name": "Admin User",
    "role": "super_admin",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing email/password
- `401` - Invalid credentials
- `500` - Server error

---

### POST /api/auth/staff

إنشاء موظف جديد (Super Admin فقط)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request:**
```json
{
  "email": "staff@consulate.sd",
  "username": "staff1",
  "password": "password123",
  "full_name": "Staff Member",
  "role": "staff",
  "phone": "+966500000000",
  "region_id": "uuid",
  "permissions": {
    "view_applications": true,
    "manage_applications": false
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "staff@consulate.sd",
    "username": "staff1",
    "full_name": "Staff Member",
    "role": "staff",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /api/auth/reset-password/:userId

إعادة تعيين كلمة المرور

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

### GET /api/auth/profile

الحصول على معلومات المستخدم الحالي

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@consulate.sd",
    "full_name": "Admin User",
    "role": "super_admin",
    "region_id": "uuid",
    "region_name_ar": "الرياض",
    "region_name_en": "Riyadh",
    "permissions": { ... }
  }
}
```

---

## 2️⃣ Applications Endpoints

### GET /api/applications

قائمة جميع الطلبات

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
```
?status=pending          (اختياري) فلترة حسب الحالة
&service_id=uuid         (اختياري) فلترة حسب الخدمة
&region_id=uuid          (اختياري) فلترة حسب المنطقة
&search=text             (اختياري) بحث في الاسم/البريد/رقم المرجع
&page=1                  (افتراضي: 1)
&limit=20                (افتراضي: 20)
```

**Response (200):**
```json
{
  "applications": [
    {
      "id": "uuid",
      "reference_number": "APP-2024-000001",
      "service_id": "uuid",
      "service_name_ar": "الجوازات",
      "service_name_en": "Passports",
      "region_id": "uuid",
      "region_name_ar": "الرياض",
      "status": "pending",
      "full_name": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "+966500000000",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

### GET /api/applications/:id

تفاصيل طلب واحد

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "application": {
    "id": "uuid",
    "reference_number": "APP-2024-000001",
    "service_id": "uuid",
    "service_name_ar": "الجوازات",
    "form_data": {
      "full_name": "أحمد محمد",
      "passport_number": "A123456"
    },
    "documents": {
      "passport_copy": "uploads/documents/file.pdf"
    },
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z",
    "status_history": [
      {
        "id": "uuid",
        "status": "pending",
        "notes": "Application submitted",
        "staff_name": null,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /api/applications

إنشاء طلب جديد (لا يحتاج token)

**Request:**
```json
{
  "service_id": "uuid",
  "region_id": "uuid",
  "form_data": {
    "full_name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+966500000000",
    "passport_number": "A123456"
  },
  "documents": {
    "passport_copy": "uploads/documents/file.pdf"
  }
}
```

**Response (201):**
```json
{
  "application": {
    "id": "uuid",
    "reference_number": "APP-2024-000001",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /api/applications/:id/status

تحديث حالة الطلب

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request:**
```json
{
  "status": "under_review",
  "notes": "المستندات قيد المراجعة",
  "rejection_reason": null
}
```

**Response (200):**
```json
{
  "application": {
    "id": "uuid",
    "status": "under_review",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Values:**
- `pending` - قيد الانتظار
- `under_review` - قيد المراجعة
- `documents_required` - يحتاج مستندات إضافية
- `approved` - تمت الموافقة
- `rejected` - مرفوض
- `completed` - مكتمل

---

### DELETE /api/applications/:id

حذف طلب

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "message": "Application deleted successfully"
}
```

---

## 3️⃣ Services Endpoints

### GET /api/services

قائمة جميع الخدمات

**Query Parameters:**
```
?category_id=uuid        (اختياري)
&subcategory_id=uuid     (اختياري)
&active=true             (اختياري)
```

**Response (200):**
```json
{
  "services": [
    {
      "id": "uuid",
      "name_ar": "الجوازات",
      "name_en": "Passports",
      "description_ar": "خدمات الجوازات",
      "description_en": "Passport services",
      "category_id": "uuid",
      "category_name_ar": "الخدمات القنصلية",
      "subcategory_id": "uuid",
      "subcategory_name_ar": "الوثائق",
      "price": 300,
      "active": true,
      "order_index": 1
    }
  ]
}
```

---

### GET /api/services/:id

تفاصيل خدمة واحدة

**Response (200):**
```json
{
  "service": {
    "id": "uuid",
    "name_ar": "الجوازات",
    "name_en": "Passports",
    "description_ar": "خدمات الجوازات",
    "price": 300,
    "fields": [
      {
        "id": "uuid",
        "name": "full_name",
        "label_ar": "الاسم الكامل",
        "label_en": "Full Name",
        "type": "text",
        "required": true,
        "order_index": 1
      }
    ],
    "requirements": [
      {
        "id": "uuid",
        "text_ar": "صورة من الجواز",
        "text_en": "Copy of passport",
        "order_index": 1
      }
    ],
    "documents": [
      {
        "id": "uuid",
        "name": "passport_copy",
        "label_ar": "صورة الجواز",
        "label_en": "Passport Copy",
        "required": true,
        "order_index": 1
      }
    ]
  }
}
```

---

### GET /api/services/categories

قائمة الفئات

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name_ar": "الخدمات القنصلية",
      "name_en": "Consular Services",
      "description_ar": "جميع الخدمات القنصلية",
      "icon": "FileText",
      "order_index": 1
    }
  ]
}
```

---

### GET /api/services/subcategories

قائمة الفئات الفرعية

**Query Parameters:**
```
?category_id=uuid        (اختياري)
```

**Response (200):**
```json
{
  "subcategories": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "name_ar": "الوثائق",
      "name_en": "Documents",
      "order_index": 1
    }
  ]
}
```

---

### GET /api/services/regions

قائمة المناطق

**Response (200):**
```json
{
  "regions": [
    {
      "id": "uuid",
      "name_ar": "الرياض",
      "name_en": "Riyadh",
      "code": "RD"
    }
  ]
}
```

---

## 4️⃣ File Upload (قريباً)

### POST /api/upload

رفع ملف واحد

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [binary file]
folder: documents (default)
```

**Response (200):**
```json
{
  "url": "/uploads/documents/file-123456.pdf",
  "filename": "file-123456.pdf",
  "originalName": "document.pdf",
  "size": 12345
}
```

---

## 📊 Error Responses

جميع الأخطاء تتبع هذا الشكل:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `400` - Bad Request (طلب غير صحيح)
- `401` - Unauthorized (غير مصرح)
- `403` - Forbidden (ممنوع)
- `404` - Not Found (غير موجود)
- `500` - Internal Server Error (خطأ في الخادم)

---

## 🔒 Permissions

### Required Permissions:

| Endpoint | Permission |
|----------|-----------|
| GET /api/applications | `view_applications` |
| POST /api/applications | None (public) |
| PUT /api/applications/:id/status | `manage_applications` |
| DELETE /api/applications/:id | `manage_applications` |
| GET /api/services | None (public) |
| POST /api/auth/staff | `super_admin` role |

---

## 🧪 Testing Examples

### Using curl:

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@consulate.sd","password":"admin123"}' \
  | jq -r '.token')

# Get applications
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer $TOKEN"

# Get services
curl http://localhost:3000/api/services
```

### Using JavaScript (fetch):

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@consulate.sd',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Get applications
const appsResponse = await fetch('http://localhost:3000/api/applications', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { applications } = await appsResponse.json();
```

---

## 📝 Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Response (429):**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## 🔄 Pagination

جميع الـ list endpoints تدعم pagination:

**Query Parameters:**
```
?page=1          الصفحة الحالية (default: 1)
&limit=20        عدد العناصر (default: 20, max: 100)
```

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

تم! 🎉
