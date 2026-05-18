# دليل الترحيل إلى Supabase + Vercel

هذا المستند يشرح خطوات نقل المتجر من **GitHub Pages + localStorage** إلى **Vercel + Supabase** للحصول على:

- 💾 **بيانات مشتركة** بين كل الأجهزة (الزبائن يرون نفس المنتجات، الأدمن يرى كل الطلبات)
- 🔐 **مصادقة احترافية** (Supabase Auth بدل localStorage)
- 📁 **تخزين صور حقيقي** (Supabase Storage بدل base64)
- 🌐 **نطاق مخصص** (مثلاً `amal-abayas.com`)
- 📊 **نسخ احتياطي تلقائي** يومي
- ⚡ **سرعة عالمية** عبر CDN

## ⚠️ ملاحظة مهمة

هذه خطوات **يجب أن تنفذيها بنفسك** لأنها تحتاج:
- إنشاء حساب Supabase باسمك
- إنشاء حساب Vercel باسمك
- ربط بطاقة دفع (الخطط المجانية كافية للبداية)

أنا أستطيع أن أعد لكِ الكود ليكون جاهزاً للترحيل، لكن إنشاء الحسابات يجب أن يكون بمعلوماتك الشخصية.

---

## 📋 الخطوة 1: إنشاء مشروع Supabase

1. اذهبي إلى https://supabase.com وأنشئي حساباً مجانياً (يمكن عبر GitHub)
2. اضغطي **"New Project"**
3. املئي:
   - **Name**: `amal-abayas`
   - **Database Password**: كلمة مرور قوية (احفظيها)
   - **Region**: `eu-central-1 (Frankfurt)` (الأقرب للشرق الأوسط)
   - **Plan**: Free (يكفي لـ 50,000 مستخدم/شهر + 500MB قاعدة بيانات)
4. انتظري دقيقة حتى يُنشَأ المشروع

## 📋 الخطوة 2: إنشاء الجداول

في Supabase Dashboard → **SQL Editor** → **New Query**، الصقي هذا الـ SQL وشغّليه:

```sql
-- إعدادات المتجر العامة (صف واحد فقط)
create table store_settings (
  id int primary key default 1,
  store_name text default 'عبايات أمل',
  headline text,
  contact jsonb default '{}',
  hero_bg_image text,
  hero_bg_opacity numeric default 0.55,
  sound_enabled boolean default true,
  text_overrides jsonb default '{"ar":{},"en":{}}',
  admin_username text default 'admin',
  admin_password_hash text not null
);

-- المنتجات
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  fabric text,
  cut text,
  is_open boolean default false,
  is_embroidered boolean default false,
  is_bestseller boolean default false,
  is_new boolean default false,
  price numeric not null,
  discount int default 0,
  colors jsonb default '[]',      -- [{name, images:[url,...]}]
  sizes text[] default '{}',
  stock jsonb default '{}',       -- { "أسود|M": 5, ... }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- الطلبات
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_area text,
  customer_notes text,
  customer_id uuid references customers(id),
  city_id text not null,
  city_name text not null,
  delivery_fee numeric not null,
  items jsonb not null,           -- [{productId, name, price, qty, color, size, image}]
  subtotal numeric not null,
  savings numeric default 0,
  coupon_code text,
  coupon_discount numeric default 0,
  total numeric not null,
  payment_proof text,             -- رابط Storage (وليس base64)
  status text default 'awaiting',
  created_at timestamptz default now(),
  payment_verified_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz
);

-- العملاء (حسابات الزبائن)
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique not null,
  password_hash text not null,
  area text,
  city_id text,
  created_at timestamptz default now()
);

-- التصنيفات
create table categories (
  id text primary key,
  name_ar text not null,
  name_en text not null,
  active boolean default true,
  sort_order int default 0
);

-- المدن
create table cities (
  id text primary key,
  name_ar text not null,
  name_en text not null,
  fee numeric not null,
  active boolean default true
);

-- الحسابات البنكية
create table bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text,
  account_name text,
  account_number text,
  iban text
);

-- أكواد الخصم
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text check (type in ('percent', 'fixed')),
  value numeric not null,
  min_order numeric default 0,
  active boolean default true,
  used_count int default 0
);

-- فهارس لتسريع البحث
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);
create index idx_products_category on products(category);
create index idx_customers_phone on customers(phone);
```

## 📋 الخطوة 3: تفعيل Row Level Security

نفّذي هذا في SQL Editor:

```sql
-- بيانات عامة (يقرأها أي شخص)
alter table products       enable row level security;
alter table categories     enable row level security;
alter table cities         enable row level security;
alter table bank_accounts  enable row level security;
alter table coupons        enable row level security;
alter table store_settings enable row level security;

create policy "Public can read products"    on products       for select using (true);
create policy "Public can read categories"  on categories     for select using (true);
create policy "Public can read cities"      on cities         for select using (true);
create policy "Public can read banks"       on bank_accounts  for select using (true);
create policy "Public can read coupons"     on coupons        for select using (active);
create policy "Public can read settings"    on store_settings for select using (true);

-- الطلبات: أي شخص يستطيع الإضافة (طلب جديد)
alter table orders enable row level security;
create policy "Anyone can place orders" on orders for insert with check (true);
create policy "Anyone reads order by id" on orders for select using (true);

-- العملاء: تسجيل + تسجيل دخول عام
alter table customers enable row level security;
create policy "Anyone can register" on customers for insert with check (true);
create policy "Anyone reads to login" on customers for select using (true);

-- التعديل والحذف يحتاج Service Role Key (الأدمن فقط)
```

## 📋 الخطوة 4: إنشاء Storage Bucket للصور

في Supabase Dashboard:
1. **Storage** → **New Bucket** → اسمي: `product-images` → **Public**
2. كرّري لإنشاء: `payment-proofs` (لإيصالات التحويل)
3. كرّري لإنشاء: `hero-bg` (لخلفية البانر)

## 📋 الخطوة 5: الحصول على مفاتيح API

في Supabase Dashboard → **Settings → API**:
- انسخي **Project URL** (مثل `https://xxxxx.supabase.co`)
- انسخي **anon public key** (طويلة تبدأ بـ `eyJ...`)

أرسلي لي هذين المفتاحين عند العودة وسأكمل ربط الكود.

## 📋 الخطوة 6: نشر على Vercel

1. اذهبي إلى https://vercel.com وأنشئي حساباً بـ GitHub
2. **Add New Project** → اختاري `barajeelair-cyber/abaya-store`
3. اتركي الإعدادات الافتراضية واضغطي **Deploy**
4. خلال دقيقة سيكون لديكِ رابط مثل `abaya-store.vercel.app`
5. (اختياري) في **Settings → Domains** أضيفي نطاقك المخصص

## 📋 الخطوة 7: إعداد متغيرات البيئة

في Vercel Dashboard → مشروعك → **Settings → Environment Variables**:
- `VITE_SUPABASE_URL` = (Project URL من الخطوة 5)
- `VITE_SUPABASE_ANON_KEY` = (anon key من الخطوة 5)

ثم اعملي Redeploy.

---

## 🔄 ما الذي سأعدّه لكِ في الكود؟

عند تأكيدك على إنشاء المشروع، سأحدّث:

1. **`assets/js/data.js`** ⇒ سيستخدم `@supabase/supabase-js` بدل `localStorage`
2. **رفع الصور** ⇒ تنزل في Supabase Storage بدل base64
3. **الـ Service Worker** ⇒ يبقى للـ PWA لكن يمرّر كل طلب لـ API
4. **سكربت ترحيل** ⇒ يأخذ بياناتك الحالية من `localStorage` ويرفعها لـ Supabase

## 💾 النسخ الاحتياطي

Supabase يقدّم تلقائياً:
- **Daily backups** على الخطة المجانية (تُحفظ 7 أيام)
- **Point-in-time recovery** على الخطة المدفوعة

كذلك يمكنك تنزيل نسخة كاملة يدوياً من **Database → Backups → Download**.

---

## ❓ متى نحتاج للخطة المدفوعة؟

الخطة المجانية كافية إذا:
- < 50,000 زائر/شهر
- < 500MB قاعدة بيانات
- < 1GB صور

الخطة Pro ($25/شهر) لو:
- مبيعات كبيرة + صور كثيرة
- تحتاجين Point-in-time recovery
- لا تريدين أن يدخل المشروع في وضع السبات بعد 7 أيام عدم استخدام

---

## ✅ الخلاصة - ما عليكِ فعله

1. ✅ إنشاء حساب Supabase + تنفيذ الـ SQL أعلاه
2. ✅ إنشاء حساب Vercel + ربط المستودع
3. ✅ إرسال لي: Project URL + anon key
4. ⏳ أنا أكمل: تحديث الكود + سكربت الترحيل + النشر

عند العودة، أرسلي لي المفاتيح وسأنهي الباقي خلال جلسة واحدة.
