# 🛠️ حل مشاكل Supabase Client و الصلاحيات (403 Error)

هذا الدليل يعالج المشاكل التالية التي تظهر في الـ Console أو الشبكة (Network):
1. ⚠️ `using deprecated parms for intailization function`
2. ❌ `permission denied for table service_types` (403 Forbidden)
3. ❌ طلبات تخرج بدون `apikey`

---

## 1️⃣ حل مشكلة: `using deprecated parms`

**السبب:**
أنت تستخدم طريقة قديمة لتمرير الإعدادات في دالة `createClient`. في الإصدارات الحديثة من `supabase-js` (v2)، تم تجميع إعدادات المصادقة داخل كائن `auth`.

**الحل:**
قم بتحديث ملف تهيئة Supabase (غالباً `src/lib/supabase.js` أو `src/supabaseClient.js`) ليصبح كالتالي:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables')
}

// ✅ الطريقة الصحيحة (v2)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // كان سابقاً في الجذر
    autoRefreshToken: true,    // كان سابقاً في الجذر
    detectSessionInUrl: true   // كان سابقاً في الجذر
  },
  db: {
    schema: 'public'
  }
})
```

---

## 2️⃣ حل مشكلة: `permission denied for table service_types` (403)

**السبب:**
جدول `service_types` مفعل عليه نظام الحماية (RLS - Row Level Security)، ولكن لا توجد سياسة (Policy) تسمح للعامة (أو للمستخدمين المسجلين) بقراءته. عندما يحاول التطبيق جلب البيانات، ترفض قاعدة البيانات الطلب.

**الحل:**
يجب إضافة سياسة تسمح بالقراءة. نفذ كود SQL التالي في Supabase Dashboard > SQL Editor:

```sql
-- تفعيل RLS (للتأكد فقط)
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- ✅ السماح للجميع بقراءة أنواع الخدمات (لأنها بيانات عامة للقوائم)
CREATE POLICY "Allow public read access on service_types"
ON service_types FOR SELECT
USING (true);

-- إذا كنت تريد السماح للموظفين فقط بالتعديل:
CREATE POLICY "Allow staff insert/update on service_types"
ON service_types FOR ALL
USING (auth.role() = 'authenticated'); -- أو حسب منطق الصلاحيات لديك
```

---

## 3️⃣ حل مشكلة: الطلب يخرج بدون `apikey` أو استخدام `fetch` مباشر

**السبب:**
أحياناً يتم استخدام دالة `fetch` العادية لجلب البيانات بدلاً من استخدام عميل `supabase` الجاهز. عند استخدام `fetch`، يجب عليك إضافة الـ Headers يدوياً، وإذا نسيتها، سيفشل الطلب ويعود بـ 401 أو 403.

**مثال للكود الخاطئ (يسبب المشكلة):**
```javascript
// ❌ خطأ: هذا الطلب لا يحمل apikey
const res = await fetch('https://xyz.supabase.co/rest/v1/service_types')
```

**الحل البديل (استخدام Supabase Client):**
دائماً استخدم العميل، فهو يضيف `apikey` و `Authorization` تلقائياً.

```javascript
// ✅ صحيح
const { data, error } = await supabase
  .from('service_types')
  .select('*')
```

**إذا كنت مضطراً لاستخدام `fetch` (نادر جداً):**
يجب أن تضيف الـ Headers يدوياً:

```javascript
const headers = {
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
}

const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/service_types`, {
  headers: headers
})
```

---

## 📝 ملخص التشخيص

1. **التحذير (Deprecated params):** سببه تمرير `persistSession` خارج كائن `auth` في `createClient`.
2. **الخطأ 403 (Permission denied):** سببه غياب RLS Policy لجدول `service_types` في قاعدة البيانات.
3. **غياب API Key:** سببه غالباً استخدام `fetch` مباشر بدون Headers أو تهيئة العميل بمتغيرات بيئة فارغة (تأكد من ملف `.env`).

بعد تطبيق هذه الإصلاحات، ستختفي التحذيرات وستعمل القوائم بشكل صحيح.