# دليل حل مشاكل الاتصال بقاعدة البيانات

## المشكلة: TypeError: Failed to fetch

### الأسباب المحتملة:

1. **مشكلة في الاتصال بالإنترنت**
2. **Supabase محظور في منطقتك**
3. **Cache المتصفح ممتلئ**
4. **Extensions المتصفح تمنع الاتصال**
5. **إعدادات `.env` غير صحيحة**

---

## الحلول:

### 1. تنظيف Cache المتصفح
```
1. اضغط Ctrl+Shift+R (Hard Refresh)
2. أو افتح DevTools (F12)
3. اضغط كليك يمين على زر Refresh
4. اختر "Empty Cache and Hard Reload"
```

### 2. تعطيل Extensions المتصفح
```
1. افتح وضع Incognito/Private (Ctrl+Shift+N)
2. جرب الموقع في وضع Private
3. إذا اشتغل، المشكلة من Extension
```

### 3. التحقق من إعدادات Supabase

افتح ملف `.env` وتأكد من:
```env
VITE_SUPABASE_URL=https://qaioxhpcyzmamcvdqqub.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. اختبار الاتصال بـ Supabase

افتح Console المتصفح (F12) واكتب:
```javascript
fetch('https://qaioxhpcyzmamcvdqqub.supabase.co/rest/v1/')
  .then(r => console.log('✅ Connected!', r.status))
  .catch(e => console.error('❌ Failed:', e))
```

إذا ظهر خطأ، المشكلة في الاتصال بـ Supabase

### 5. استخدام VPN (إذا كان Supabase محظور)

بعض الدول تحظر Supabase، جرب:
- استخدام VPN
- أو استخدام Mobile Hotspot

### 6. إعادة تشغيل Dev Server

```bash
# أوقف الـ server (Ctrl+C)
# ثم شغله من جديد
npm run dev
```

---

## اختبار سريع:

افتح هذا الرابط في المتصفح:
```
https://qaioxhpcyzmamcvdqqub.supabase.co/rest/v1/
```

**النتيجة المتوقعة:**
```json
{"message":"The server is running..."}
```

**إذا ظهر خطأ:**
- المشكلة في الاتصال بـ Supabase
- جرب VPN أو Mobile Hotspot

---

## إذا ما زالت المشكلة موجودة:

1. تأكد من أن الإنترنت يعمل
2. جرب فتح موقع آخر (google.com)
3. جرب متصفح آخر
4. أعد تشغيل الكمبيوتر
5. اتصل بمزود خدمة الإنترنت
