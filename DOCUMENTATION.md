# 📘 توثيق متجر عبايات أمل · Amal Abayas Store Documentation

> توثيق شامل لكل الميزات والمكوّنات في المشروع — للرجوع المستقبلي ولأي مطوّر يكمل العمل.
> Complete reference for every feature and component — for future reference and any developer continuing the work.

---

## 📑 جدول المحتويات / Table of Contents

1. [نظرة عامة](#1-نظرة-عامة)
2. [التقنيات والمعمارية](#2-التقنيات-والمعمارية)
3. [هيكل الملفات](#3-هيكل-الملفات)
4. [طبقة البيانات (APIs)](#4-طبقة-البيانات-apis)
5. [واجهة الزبون (Customer Front-End)](#5-واجهة-الزبون-customer-front-end)
6. [لوحة الإدارة (Admin Dashboard)](#6-لوحة-الإدارة-admin-dashboard)
7. [نظام الترجمة (i18n)](#7-نظام-الترجمة-i18n)
8. [PWA — التطبيق القابل للتثبيت](#8-pwa--التطبيق-القابل-للتثبيت)
9. [الإعدادات والقابلية للتحرير](#9-الإعدادات-والقابلية-للتحرير)
10. [القيم الافتراضية والترميز](#10-القيم-الافتراضية-والترميز)
11. [بيانات الدخول والمسارات](#11-بيانات-الدخول-والمسارات)
12. [الترحيل إلى Backend حقيقي](#12-الترحيل-إلى-backend-حقيقي)
13. [استكشاف الأخطاء](#13-استكشاف-الأخطاء)
14. [المستقبل](#14-المستقبل)

---

## 1. نظرة عامة

**متجر إلكتروني فاخر** لبيع العبايات يستهدف مدن قطاع غزة، مكتوب بـ HTML + CSS + Vanilla JavaScript بدون أي خطوة build. يفتح مباشرة من المتصفح أو يُنشر على GitHub Pages.

### الهوية البصرية
- **اللوجو**: SVG متجه (`Amal · Abaya and more`)
- **الزبون**: ثيم أسود فاخر + لمسات ذهبية + خلفية مخمل/حرير
- **الإدارة**: ثيم أبيض لؤلؤي + خط أسود + لمسات ذهبية

### الميزات الرئيسية
- 🌐 ثنائي اللغة (عربي/إنجليزي) مع RTL/LTR تلقائي
- 📱 قابل للتثبيت كتطبيق على iPhone و Android (PWA)
- 🛒 سلة جانبية + دفع كامل + كوبونات خصم
- 📦 تتبع الطلب برمز AMA-XXXXXX
- 👤 حسابات للزبائن + متابعة كزائرة
- ❤️ مفضلة لكل جهاز + 🔥 الأكثر مبيعاً
- 🔍 فلاتر شاملة (قماش، قَصّة، لون، مقاس، سعر، أعلام)
- ⭐ آراء العملاء مع تقييمات
- 📏 دليل مقاسات تفاعلي (دولي + خليجي + حاسبة ذاتية)
- 🔒 سياسات قانونية كاملة (خصوصية، استبدال، COD، شروط)

---

## 2. التقنيات والمعمارية

### المُكدّس التقني
| الطبقة | التقنية |
|---|---|
| الواجهة الأمامية | HTML5 + CSS3 + Vanilla JS (ES2020) |
| التخزين | `localStorage` + `sessionStorage` |
| الخطوط | Tajawal + Cairo + Cormorant Garamond (Google Fonts) |
| الأيقونات | SVG inline |
| النشر | GitHub Pages |
| الاختبار | Playwright (Node.js) |

### المعمارية
```
┌─────────────────────────────────────────────────────┐
│  index.html (Customer)    admin.html (Admin)        │
│         │                       │                    │
│         └───────────┬───────────┘                    │
│                     ▼                                │
│              data.js (shared APIs)                   │
│                     │                                │
│                     ▼                                │
│           localStorage (single key)                  │
│              "abaya_amal_v2"                         │
└─────────────────────────────────────────────────────┘
```

كل البيانات في مفتاح localStorage واحد:
```js
{
  products: [...],
  orders: [...],
  settings: {
    storeName, headline, contact, bankAccounts, coupons,
    categories, cities, fabrics, cuts, reviews, customers,
    siteInfo, sizeCharts, textOverrides, heroBgImage,
    heroBgOpacity, soundEnabled, admin
  }
}
```

---

## 3. هيكل الملفات

```
abaya-store/
├── index.html                  ← واجهة الزبون
├── admin.html                  ← لوحة الإدارة (مع شاشة دخول)
├── manifest.json               ← PWA manifest للزبون
├── admin-manifest.json         ← PWA manifest للإدارة
├── sw.js                       ← Service Worker (passthrough)
│
├── README.md                   ← دليل البدء السريع
├── DOCUMENTATION.md            ← (هذا الملف) — توثيق شامل
├── MIGRATION-SUPABASE-VERCEL.md ← دليل الترحيل لـ Supabase
│
└── assets/
    ├── css/
    │   ├── customer.css        ← أنماط الزبون
    │   └── admin.css           ← أنماط الإدارة
    ├── js/
    │   ├── data.js             ← طبقة بيانات + i18n + APIs
    │   ├── customer.js         ← منطق الزبون
    │   └── admin.js            ← منطق الإدارة
    └── img/
        ├── logo.svg            ← اللوجو الأساسي (Amal)
        ├── hero-bg.jpg         ← خلفية البانر (1920×800)
        ├── og-image.svg        ← صورة OG للمشاركة (1200×630)
        ├── female-icon.svg     ← أيقونة الحساب
        ├── icon-192.png        ← أيقونة PWA (Android)
        ├── icon-512.png        ← أيقونة PWA (maskable)
        ├── icon-512-any.png    ← أيقونة PWA (any purpose)
        ├── apple-touch-icon.png      ← iOS 180×180
        ├── apple-touch-icon-167.png  ← iOS iPad Pro
        ├── apple-touch-icon-152.png  ← iOS iPad
        ├── favicon-32.png      ← فافيكون متصفح
        └── favicon-64.png      ← فافيكون متصفح أكبر
```

---

## 4. طبقة البيانات (APIs)

كل العمليات تمر عبر هذه الـ APIs المعرّفة في `data.js`:

### 🛍️ ProductsAPI
```js
ProductsAPI.list()                                   // كل المنتجات
ProductsAPI.get(id)                                  // منتج واحد
ProductsAPI.save(product)                            // إنشاء/تحديث
ProductsAPI.remove(id)                               // حذف
ProductsAPI.totalStock(p)                            // مجموع المخزون
ProductsAPI.variantStock(p, color, size)             // مخزون تركيبة
ProductsAPI.finalPrice(p)                            // السعر بعد الخصم
ProductsAPI.colorImages(colorObj)                    // مصفوفة صور لون
ProductsAPI.coverImage(p)                            // صورة الغلاف
ProductsAPI.decrementVariant(id, color, size, qty)   // خصم من المخزون
```

#### مخطط المنتج
```js
{
  id: "abc123",
  name: "عباية المسائية",
  description: "...",
  category: "luxury",        // مفتاح من categories
  fabric: "silk",            // مفتاح من fabrics
  cut: "kloush",             // مفتاح من cuts
  price: 340,
  discount: 10,              // 0-90 (نسبة %)
  isOpen: false,
  isEmbroidered: true,
  isBestseller: true,
  isNew: false,
  colors: [
    { name: "أسود", images: ["data:image/...", "..."] },
    { name: "بني", images: ["..."] }
  ],
  sizes: ["S", "M", "L", "XL"],
  stock: {
    "أسود|S": 3,
    "أسود|M": 5,
    "بني|S": 2
  }
}
```

### 🧾 OrdersAPI
```js
OrdersAPI.list()                                     // كل الطلبات (الأحدث أولاً)
OrdersAPI.add(order)                                 // طلب جديد (يخصم المخزون)
OrdersAPI.updateStatus(id, status)                   // تحديث الحالة
```

#### مخطط الطلب
```js
{
  id: "xyz789",
  createdAt: "2026-05-19T10:30:00Z",
  status: "awaiting",  // awaiting | pending | shipped | delivered | cancelled
  customer: { name, phone, area, notes },
  cityId: "gaza", cityName: "مدينة غزة",
  deliveryFee: 15,
  items: [{ productId, name, price, qty, color, size, image }],
  subtotal: 320,
  savings: 30,         // خصم المنتجات
  couponCode: "AMAL20",
  couponDiscount: 60,
  total: 245,
  paymentProof: "data:image/...",   // base64
  paymentVerifiedAt, shippedAt, deliveredAt
}
```

### ⚙️ SettingsAPI
```js
SettingsAPI.get()                    // كل الإعدادات
SettingsAPI.save(patch)              // تحديث جزئي
SettingsAPI.addBank(account)         // إضافة حساب بنكي
SettingsAPI.updateBank(id, patch)    // تحديث حساب
SettingsAPI.removeBank(id)           // حذف حساب
```

### 🎟️ CouponsAPI
```js
CouponsAPI.list()
CouponsAPI.save(coupon)              // {code, type, value, minOrder, active}
CouponsAPI.remove(id)
CouponsAPI.validate(code, subtotal)  // {ok, coupon, discount}
CouponsAPI.recordUse(code)           // زيادة عدّاد الاستخدام
```

### 🏷️ CategoriesAPI
```js
CategoriesAPI.list()
CategoriesAPI.active()
CategoriesAPI.save({name_ar, name_en, active})
CategoriesAPI.remove(id)
```

### 🚚 CitiesAPI
```js
CitiesAPI.list()
CitiesAPI.active()
CitiesAPI.save({name_ar, name_en, fee, active})
CitiesAPI.remove(id)
```

### 🧵 FabricsAPI و ✂️ CutsAPI
```js
FabricsAPI.list() / .save(item) / .remove(id)
CutsAPI.list()    / .save(item) / .remove(id)
```

### ⭐ ReviewsAPI
```js
ReviewsAPI.list()
ReviewsAPI.save(review)              // {name, rating, date, text, verified}
ReviewsAPI.remove(id)
ReviewsAPI.avgRating()
```

### ❤️ FavoritesAPI (localStorage منفصل)
```js
FavoritesAPI.list()                  // [productId, ...]
FavoritesAPI.has(id)
FavoritesAPI.add(id) / .remove(id) / .toggle(id)
FavoritesAPI.count()
```

### 👤 CustomersAPI
```js
CustomersAPI.list()
CustomersAPI.register({name, phone, password})
CustomersAPI.login(phone, password)
CustomersAPI.logout()
CustomersAPI.current()
CustomersAPI.findByPhone(phone)
CustomersAPI.updateProfile(patch)
```

### 🔐 AuthAPI (للأدمن)
```js
AuthAPI.isLoggedIn()
AuthAPI.login(username, password, remember)   // remember=true → localStorage
AuthAPI.logout()
AuthAPI.changePassword(current, next)
```

### ℹ️ SiteInfoAPI
```js
SiteInfoAPI.get()                    // كل المعلومات
SiteInfoAPI.update(patch)            // تحديث جزئي
```

الحقول:
- `aboutUs`, `shipping`, `returnPolicy`, `faq` (كل {ar, en})
- `privacyPolicy`, `exchangePolicy`, `codPolicy`, `termsConditions` (كل {ar, en})

### 📏 SizeChartsAPI
```js
SizeChartsAPI.get()                  // {intl, gulf, description}
SizeChartsAPI.save(patch)            // مثل {intl: [...]} أو {description: {ar, en}}
```

### ✏️ TextOverridesAPI
```js
TextOverridesAPI.all()
TextOverridesAPI.get(lang, key)
TextOverridesAPI.set(lang, key, value)
TextOverridesAPI.reset(key)
TextOverridesAPI.editableKeys()      // قائمة المفاتيح القابلة للتحرير
```

---

## 5. واجهة الزبون (Customer Front-End)

### الترتيب الكامل من أعلى لأسفل

1. **شريط علوي** (`.contact-bar`): تتبع طلبي · تثبيت التطبيق · زر اللغة
2. **Navbar** (`.navbar`): لوجو · روابط (المنتجات، التصنيفات) · حسابي · عربة التسوق
3. **Hero** (`.hero`): عنوان رئيسي + وصف + زر "تسوّقي الآن" + خلفية قماش بشفافية قابلة للتحكم
4. **شريط التصنيفات** (`.categories`): ❤️ المفضلة + 🔥 الأكثر مبيعاً + 9 تصنيفات
5. **لوحة الفلاتر** (`.filters-wrap`): قابلة للطي - قماش/قَصّة/لون/مقاس/سعر/أعلام
6. **شبكة المنتجات** (`.grid`): بطاقات مع زر قلب + شارات (خصم/نفد/محدود)
7. **آراء العملاء** (`.reviews-section`): متوسط التقييم + شبكة مراجعات
8. **عن عبايات أمل** (`.site-info-section`): 3 بطاقات (من نحن/الشحن/FAQ)
9. **التذييل** (`.footer`): تواصل + 5 روابط سياسات + حقوق + رابط الإدارة

### Modals (نوافذ منبثقة)
- `#productModal` — تفاصيل المنتج + اختيار لون/مقاس + معرض صور
- `#cartDrawer` — درج السلة الجانبي
- `#checkoutModal` — نموذج الدفع كامل
- `#successModal` — تأكيد إرسال الطلب
- `#trackModal` — تتبع طلب برمز
- `#authModal` — تسجيل دخول / حساب جديد / متابعة كزائرة
- `#myOrdersModal` — طلبات العميل المسجَّل
- `#sizeGuideModal` — دليل المقاسات التفاعلي
- `#policyModal` — عرض أي سياسة من التذييل
- `#iosInstallModal` — تعليمات تثبيت iOS

### دورة الطلب
```
الزبونة:                              الإدارة:
─────────────────                     ─────────────────
1. اختيار منتج
2. اختيار لون+مقاس
3. ↩️ السلة
4. إتمام طلب
5. تعبئة بيانات
6. إدخال كوبون (اختياري)
7. تحويل المبلغ على بنك
8. رفع صورة التحويل
9. تأكيد                        ⇒    🔔 إشعار + رنين
                                      10. فتح تفاصيل الطلب
                                      11. مراجعة صورة التحويل
                                      12. ✓ تأكيد الدفع
                                      13. شحن → تم التوصيل
14. متابعة الحالة عبر "تتبع طلبي"
```

---

## 6. لوحة الإدارة (Admin Dashboard)

### الصفحات (Pages)
1. **📊 لوحة القيادة** — بطاقات إحصاءات (طلبات اليوم، مبيعات اليوم، إجمالي المنتجات، تنبيه مخزون) + جدول الطلبات الأخيرة + إحصاء بالمدينة
2. **👗 المنتجات** — جدول كامل، إضافة/تعديل/حذف، بحث، فلتر تصنيف
3. **📦 المخزون** — منتجات منخفضة المخزون مع جدول تركيبات قابل للتحرير
4. **🧾 الطلبات** — كل الطلبات، فلترة بالمدينة والحالة، تفاصيل، تأكيد الدفع، طباعة فاتورة
5. **🚚 التوصيل** — الطلبات الجاهزة للشحن، إجراء سريع (شحن/تسليم)
6. **👥 العملاء** — تجميع تلقائي بالاسم/الجوال، إحصاءات إنفاق
7. **⚙️ الإعدادات** — 11 لوحة (انظر القسم التالي)

### نموذج المنتج
حقول:
- اسم، تصنيف (dropdown ديناميكي)، سعر، خصم %
- مقاسات (مفصولة بفاصلة)
- قماش، قَصّة (dropdown من DB)
- 4 أعلام (مفتوحة، مطرزة، الأكثر مبيعاً، جديد)
- وصف
- **الألوان**: لكل لون اسم + عدة صور (drag & drop)
- **جدول المخزون**: لون × مقاس (ديناميكي)

### تفاصيل الطلب
عرض كامل + تغيير الحالة + زر "✓ تأكيد الدفع" + زر "🖨️ طباعة الفاتورة" (يفتح نافذة طباعة جاهزة)

### الإشعار الصوتي
يفحص الطلبات الجديدة كل 5 ثوانٍ. عند طلب جديد:
- 🔔 رنين (G5 → C6 عبر Web Audio API)
- وميض عنوان التبويب
- Toast بالعدد

قابل للتعطيل من الإعدادات.

---

## 7. نظام الترجمة (i18n)

### المفاتيح
~310 مفتاح ترجمة في كل لغة (عربي + إنجليزي)، منظَّمة في:
- `nav.*`, `hero.*`, `cart.*`, `checkout.*`, `success.*`, `track.*`
- `product.*`, `category.*`, `filters.*`, `fabric.*`, `cut.*`
- `status.*`, `city.*`
- `auth.*`, `favorites.*`, `reviews.*`, `siteInfo.*`, `policy.*`
- `sizeGuide.*`
- `admin.*` (الأكبر — كل لوحة الإدارة)

### الدوال
```js
t(key)                  // ترجمة بمفتاح
getLang()               // "ar" أو "en"
setLang("ar")           // يغيّر اللغة ويُحدث document.dir/lang
applyTranslations()     // يطبّق على كل [data-i18n] في DOM
```

### الاستخدام في HTML
```html
<button data-i18n="nav.cart">عربة التسوق</button>
<input data-i18n-placeholder="search.placeholder">
```

### الاستخدام في JS
```js
showToast(t("cart.add_success"));
```

### تجاوز نص ما (Text Override)
الأدمن يستطيع تجاوز أي مفتاح في الـ`EDITABLE_TEXTS` من **الإعدادات → نصوص الواجهة**. القيمة المُجاوزة تُحفظ في `settings.textOverrides[lang][key]` و `t()` يفضّلها على الترجمة الأصلية.

---

## 8. PWA — التطبيق القابل للتثبيت

### الـ manifests
- `manifest.json` للزبون (theme أبيض، orientation portrait)
- `admin-manifest.json` للإدارة (theme أبيض، orientation any)
- كلاهما يشير إلى أيقونات PNG (مهم لـ iOS)

### Service Worker (`sw.js`)
**استراتيجية**: passthrough (لا يخزّن أي شيء).
- يكفي وجوده ليكون التطبيق قابلاً للتثبيت
- لا fetch listener → كل طلب يذهب للشبكة مباشرة
- على activate: يحذف الكاش القديم + يبلّغ التبويبات لإعادة التحميل

### التثبيت على iOS
- `apple-touch-icon` PNG (180/167/152)
- `apple-mobile-web-app-capable` = yes
- يعمل عبر Safari → Share → Add to Home Screen

### Cache Busting
كل تحديث: HTML يُحدّث `?v=YYYYMMDDx` على ملفات JS/CSS فيُجبر المتصفح على جلب نسخة جديدة.

---

## 9. الإعدادات والقابلية للتحرير

### الإعدادات (11 لوحة)
في **لوحة الإدارة → الإعدادات**:

1. **📞 معلومات التواصل** — هاتف، واتساب، إنستغرام، عنوان Hero، إشعار صوتي
2. **🖼️ خلفية البانر الرئيسي** — رفع صورة + شريط شفافية (0-100%)
3. **🏦 الحسابات البنكية** — CRUD كامل (بنك، اسم، رقم، IBAN)
4. **🎟️ أكواد الخصم** — كود، نوع (نسبة/مبلغ)، قيمة، حد أدنى، تفعيل، عدّاد استخدام
5. **📁 التصنيفات** — CRUD (عربي + إنجليزي + تفعيل)
6. **🚚 المدن** — CRUD (عربي + إنجليزي + رسوم + تفعيل)
7. **🧵 الأقمشة** — CRUD (عربي + إنجليزي)
8. **✂️ القَصّات** — CRUD (عربي + إنجليزي)
9. **⭐ آراء العملاء** — CRUD (اسم، تقييم 1-5، تاريخ، موثّق، نص)
10. **ℹ️ معلومات الموقع** — 8 أقسام × عربي/إنجليزي:
    - من نحن، الشحن، FAQ (يظهر كبطاقات)
    - الخصوصية، الاستبدال، COD، الشروط (يظهر كـ Modals)
    - returnPolicy (محتفظ به للتوافق)
11. **📏 جداول المقاسات** — وصف ديناميكي يظهر في دليل المقاسات
12. **✏️ نصوص الواجهة** — تجاوز ~12 نص مهم (Headline، CTA، إلخ)
13. **🔒 تغيير كلمة المرور** — للأدمن

> **القاعدة**: كل ما يظهر للزبون قابل للتحرير من الإدارة بدون أي تعديل في الكود.

---

## 10. القيم الافتراضية والترميز

### التصنيفات (9)
```
الجديد · عبايات خليجية · عبايات سوداء · عبايات ملونة · عبايات فخمة ·
عبايات يومية · عبايات مطرزة · العيد ورمضان · العروض
```

### المدن (12)
```
مدينة غزة (15₪) · شمال غزة (20) · جباليا (20) · بيت لاهيا (25) ·
بيت حانون (25) · النصيرات (20) · البريج (20) · المغازي (20) ·
الزوايدة (22) · دير البلح (20) · خان يونس (25) · رفح (30)
```

### الأقمشة (9)
```
كريب · ندى · حرير · شيفون · لينن · مخمل · ساتان · قماش صيفي · قماش شتوي
```

### القَصّات (9)
```
كلوش · فراشة · بشت · كيمونو · مستقيمة · بأزرار ·
لف / Wrap · واسعة · بخصر محدد
```

### حالات الطلب
| المفتاح | عربي | English |
|---|---|---|
| awaiting | بانتظار تأكيد الدفع | Awaiting payment verification |
| pending | قيد المعالجة | Processing |
| shipped | تم الشحن | Shipped |
| delivered | تم التوصيل | Delivered |
| cancelled | ملغي | Cancelled |

### نظام المقاسات
- **دولي**: XS, S, M, L, XL, XXL, 3XL
- **خليجي**: 40, 42, 44, 46, 48, 50, 52, 54, 56
- لكل صف: صدر، خصر، أرداف، طول، ما يقابله

### كوبونات افتراضية
- `WELCOME10` — 10% خصم، بدون حد أدنى
- `AMAL20` — 20% خصم، حد أدنى 300 ₪

---

## 11. بيانات الدخول والمسارات

### بيانات الدخول الافتراضية للإدارة
```
المستخدم: admin
الكلمة:   admin123
```
يمكن تغييرها من **الإعدادات → تغيير كلمة المرور**.

### المسارات
- المتجر: `https://barajeelair-cyber.github.io/abaya-store/`
- الإدارة: `https://barajeelair-cyber.github.io/abaya-store/admin.html`
- المستودع: `https://github.com/barajeelair-cyber/abaya-store`

### الإعداد المحلي
```powershell
cd C:\Users\User\abaya-store

# مع Python
python -m http.server 8080

# أو npm
npx http-server -p 8080

# الفتح:
# http://localhost:8080/         ← المتجر
# http://localhost:8080/admin.html ← الإدارة
```

---

## 12. الترحيل إلى Backend حقيقي

كل العمليات تمر عبر الـ APIs المذكورة أعلاه. للترحيل إلى Supabase/Firebase/PostgreSQL:

1. استبدل جسم كل دالة في `data.js` بـ `fetch()` إلى الـ Backend
2. لا تغيير في `customer.js` أو `admin.js`
3. حوّل الدوال التي تستخدمها إلى `async`

تفاصيل كاملة لـ Supabase + Vercel في `MIGRATION-SUPABASE-VERCEL.md`.

### مثال: تحويل `ProductsAPI.list()`
```js
// قبل (localStorage)
list() { return loadDB().products; }

// بعد (Supabase)
async list() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
}
```

---

## 13. استكشاف الأخطاء

### المشكلة: الأزرار لا تعمل بعد refresh
**السبب**: مرحبا ببنية بيانات قديمة في localStorage.
**الحل**: من Console (F12):
```js
localStorage.removeItem("abaya_amal_v2");
location.reload();
```

### المشكلة: PWA لا يثبَّت على iOS
- تأكدي من فتح الموقع في **Safari** (ليس Chrome على iOS)
- استخدمي Share → Add to Home Screen
- تأكدي من وجود ملفات `apple-touch-icon-*.png` في `assets/img/`

### المشكلة: الصور كبيرة جداً تفشل في الحفظ
localStorage حدّه ~5MB. لو رفعتِ صور كثيرة بصيغة base64:
- اضغطي الصور قبل الرفع (مثل TinyPNG)
- أو رحّلي إلى Supabase Storage (انظر MIGRATION)

### المشكلة: SW عالق يخدم نسخة قديمة
```js
caches.keys().then(k => k.forEach(c => caches.delete(c)));
navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
location.reload();
```

### المشكلة: التغييرات لا تظهر بعد deploy
- بمب الـ cache buster في `index.html` و `admin.html`: `v=YYYYMMDDx`
- اضغطي Ctrl+Shift+R للـ hard refresh

---

## 14. المستقبل

### مهام معلّقة (في انتظار قرار/إجراء)

#### 🔄 الترحيل إلى Backend حقيقي
انظر `MIGRATION-SUPABASE-VERCEL.md`. يحتاج:
1. إنشاء حساب Supabase (مجاني)
2. إنشاء حساب Vercel (مجاني)
3. تنفيذ الـ SQL الموجود في الدليل
4. إرسال المفاتيح لي لتحديث الكود

**فوائد الترحيل**:
- بيانات مشتركة بين كل الأجهزة (الزبائن يرون نفس المنتجات)
- نسخ احتياطي يومي تلقائي
- نطاق مخصص (`amal-abayas.com`)
- صور حقيقية (ليست base64 في localStorage)
- لا قيود على حجم البيانات

### أفكار للتطوير المستقبلي
- 🔔 إشعارات push (تحتاج Backend)
- 💳 دمج بوابة دفع (Stripe/PayPal/تحويل بنكي ذكي)
- 📊 لوحة تحليلات متقدّمة (Google Analytics)
- 🚀 دعم متعدد المتاجر (Multi-store)
- 📸 تكامل Instagram للسحب التلقائي لمنتجات Shop
- 🤖 شات بوت Whatsapp للرد التلقائي
- 🎁 برنامج ولاء النقاط
- 📧 نشرة بريدية للعروض

---

## 📝 سجل التطوير (Changelog)

كل التحديثات في git history:
```bash
git log --oneline
```

أبرز المعالم:
- ✅ المتجر الأساسي + لوحة إدارة
- ✅ التصنيفات والفلاتر القابلة للتحرير
- ✅ ثنائية اللغة الكاملة (~310 مفتاح)
- ✅ نظام حسابات الزبائن
- ✅ المفضلة + الأكثر مبيعاً
- ✅ آراء العملاء + معلومات الموقع
- ✅ دليل مقاسات تفاعلي (دولي + خليجي + حاسبة)
- ✅ السياسات الأربع كـ modals قابلة للتحرير
- ✅ PWA مدعوم على iOS و Android
- ✅ خلفية بانر قابلة للتحكم بالشفافية
- ✅ اللوجو الحقيقي + أيقونات PNG لـ iOS
- ✅ نظام الكوبونات
- ✅ دورة طلب كاملة (تأكيد الدفع → شحن → تسليم)
- ✅ طباعة فاتورة
- ✅ إشعار صوتي للطلبات الجديدة

---

## 📞 الدعم

- **المستودع**: https://github.com/barajeelair-cyber/abaya-store
- **Issues**: https://github.com/barajeelair-cyber/abaya-store/issues
- **التوثيق التقني**: هذا الملف

---

**آخر تحديث**: 2026-05-19
**الإصدار**: v2.0 (post-policies refactor)
**اللوجو**: Amal · Abaya and More
