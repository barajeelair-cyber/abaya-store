# 🚀 دليل الإطلاق السريع · Supabase + Vercel

هذا الدليل يأخذكِ من **الصفر إلى المتجر الحي** على Vercel + Supabase خلال **~15 دقيقة**.

---

## ⚡ التشغيل السريع (3 خطوات)

### الخطوة 1️⃣: إنشاء قاعدة البيانات على Supabase (5 دقائق)

1. اذهبي إلى **[supabase.com](https://supabase.com)** → اضغطي **Start your project**
2. سجّلي دخول بـ **GitHub** (مجاناً)
3. اضغطي **New Project** واملئي:
   - **Name**: `amal-abayas`
   - **Database Password**: كلمة مرور قوية ـ **احفظيها في مكان آمن**
   - **Region**: `eu-central-1 (Frankfurt)` (الأقرب لفلسطين)
   - **Plan**: Free
4. انتظري دقيقتين حتى يُنشَأ المشروع.

#### تنفيذ مخطط الجداول

5. في لوحة Supabase: **SQL Editor** (من القائمة الجانبية) → **+ New query**
6. افتحي ملف **`supabase-schema.sql`** من المشروع، انسخي كل محتواه، والصقيه
7. اضغطي **Run** ▶️ (أو Ctrl+Enter)
8. سترين: `Success. No rows returned`

#### إنشاء Storage Buckets للصور

9. **Storage** (من القائمة الجانبية) → **Create a new bucket**
10. أنشئي 3 buckets:
    - `product-images` → **Public** ✓
    - `payment-proofs` → **Private**
    - `hero-bg` → **Public** ✓

#### الحصول على المفاتيح

11. **Settings** (⚙️) → **API**
12. انسخي **قيمتين**:
    - **Project URL** (مثل: `https://xxxxx.supabase.co`)
    - **anon public key** (يبدأ بـ `eyJh...`)

---

### الخطوة 2️⃣: إضافة المفاتيح للمشروع (1 دقيقة)

افتحي الملف **`assets/js/supabase-config.js`** والصقي القيم:

```js
window.AMAL_CONFIG = {
  SUPABASE_URL:      "https://xxxxx.supabase.co",      ← الصقي هنا
  SUPABASE_ANON_KEY: "eyJh...long-string...",          ← والصقي هنا
  BUCKET_PRODUCTS: "product-images",
  BUCKET_PROOFS:   "payment-proofs",
  BUCKET_HERO:     "hero-bg",
};
```

ثم:
```powershell
git add assets/js/supabase-config.js
git commit -m "Configure Supabase keys"
git push
```

> ⚠️ **مهم**: المفتاح "anon" آمن للعرض في الكود (محمي بـ RLS policies)، لكن لا تضعي أبداً مفتاح "service_role" في الكود.

---

### الخطوة 3️⃣: النشر على Vercel (3 دقائق)

#### الطريقة الأسهل (بدون CLI)

1. اذهبي إلى **[vercel.com/new](https://vercel.com/new)**
2. سجّلي دخول بـ **GitHub**
3. ستظهر قائمة بمستودعاتك → اضغطي **Import** بجانب `abaya-store`
4. في صفحة الإعداد:
   - **Framework Preset**: Other (تلقائي للمشاريع الستاتيكية)
   - **Build Command**: اتركيه فارغاً
   - **Output Directory**: اتركيه فارغاً
5. اضغطي **Deploy** 🚀

خلال 30 ثانية يكون الموقع حياً على رابط مثل:
```
https://abaya-store-xyz123.vercel.app
```

#### إضافة نطاق مخصص (اختياري)

في Vercel → **Project** → **Settings** → **Domains** → أضيفي نطاقك (مثل `amal-abayas.com`).

---

## ✅ تأكيد نجاح الترحيل

افتحي رابط Vercel → اضغطي F12 (Console) → ابحثي عن:
```
[Supabase] متصل ✓
```

إذا رأيتِ هذه الرسالة، التطبيق يستخدم Supabase الآن!

إذا رأيتِ `غير مُهيَّأ، نستخدم localStorage`، تأكدي من ملء المفاتيح في `supabase-config.js`.

---

## 🔄 نقل البيانات القديمة (إن وُجدت)

إذا كنتِ تستخدمين localStorage مسبقاً ولديكِ منتجات/طلبات قديمة:

```js
// نفّذي من Console (F12) على الموقع
const oldDB = JSON.parse(localStorage.getItem("abaya_amal_v2"));
console.log(oldDB); // تحققي من البيانات

// انسخي المنتجات إلى Supabase يدوياً عبر لوحة الإدارة الجديدة
// أو سأنشئ سكربت ترحيل تلقائي عند الطلب
```

---

## 🆘 استكشاف الأخطاء

### "Failed to fetch"
- تأكدي أن SUPABASE_URL صحيح (مع `https://` وبدون `/` في النهاية)
- تأكدي أن المشروع في Supabase **ليس مُعطَّل** (Free plan ينام بعد أسبوع خمول)

### "Row Level Security policy violation"
- شغّلي السكربت السكربت الموجود في `supabase-schema.sql` كاملاً (تضمن policies الزبائن)

### الصور لا تظهر
- تأكدي أن bucket `product-images` و `hero-bg` معرّفين كـ **Public** في Supabase Storage

### الأدمن لا يستطيع تسجيل الدخول
- في Supabase → **Table Editor** → `store_settings` → الصف `id = 1`:
  - admin_username = `admin`
  - admin_password_hash = (sha-256 لكلمة "admin123" مع salt "amal_salt_v1")
- يمكنكِ تشغيل من Console:
  ```js
  await crypto.subtle.digest("SHA-256", new TextEncoder().encode("amal_salt_v1:admin123"))
    .then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join(""))
  ```
  ثم الصقيه في `admin_password_hash` للصف.

---

## 💰 التكلفة المتوقعة

| الخدمة | الحد المجاني | التكلفة بعد ذلك |
|---|---|---|
| **Supabase Free** | 500MB DB + 1GB Storage + 50,000 طلب شهرياً | $25/شهر (Pro) |
| **Vercel Hobby** | 100GB bandwidth + Domains مجانية | $20/شهر (Pro) |
| **GitHub** | غير محدود (مستودع عام أو خاص) | مجاني |

**للمتجر العادي بحجم متوسط: مجاني تماماً للأشهر الأولى.**

---

## 🎯 الفوائد الفورية بعد الترحيل

| قبل (localStorage) | بعد (Supabase + Vercel) |
|---|---|
| البيانات على جهاز واحد فقط | ✅ مشتركة بين كل المستخدمين |
| الأدمن لا يرى طلبات من أجهزة أخرى | ✅ كل الطلبات تظهر فوراً |
| محدود بـ 5MB | ✅ 500MB قاعدة بيانات + 1GB صور |
| لا نسخ احتياطي | ✅ نسخ احتياطي تلقائي يومي |
| رابط GitHub Pages طويل | ✅ نطاق مخصص اختياري |
| لا تحليلات | ✅ تحليلات Vercel مدمجة |

---

## 📚 ملفات مرجعية

- **`supabase-schema.sql`** ـ مخطط قاعدة البيانات الكامل
- **`supabase-config.js`** ـ ضعي مفاتيحك هنا
- **`data-supabase.js`** ـ adapter يحوّل APIs تلقائياً
- **`vercel.json`** ـ إعدادات النشر (cache headers + redirects)
- **`MIGRATION-SUPABASE-VERCEL.md`** ـ شرح تفصيلي للمعمارية
- **`DOCUMENTATION.md`** ـ توثيق شامل للموقع

---

🌟 **حظ موفق! بعد إكمال الخطوات الثلاث، متجركِ سيكون متجراً احترافياً جاهزاً للعمل التجاري الفعلي.**
