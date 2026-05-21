-- ============================================================
-- Amal Abayas  —  Supabase Database Schema
-- ============================================================
-- شغّلي هذا الملف بالكامل من Supabase Dashboard → SQL Editor → New Query.
-- ينشئ كل الجداول والـ policies والبيانات الافتراضية.
-- ============================================================

-- 1) إعدادات المتجر (صف واحد فقط)
create table if not exists store_settings (
  id              int primary key default 1,
  store_name      text default 'عبايات أمل',
  headline        text default 'عبايات وأكثر تجدينها لدى عبايات أمل',
  contact         jsonb default '{"phone":"","whatsapp":"","instagram":""}',
  hero_bg_image   text,
  hero_bg_opacity numeric default 0.55,
  sound_enabled   boolean default true,
  text_overrides  jsonb default '{"ar":{},"en":{}}',
  site_info       jsonb default '{}',
  size_charts     jsonb default '{}',
  admin_username  text default 'admin',
  admin_password_hash text not null,
  updated_at      timestamptz default now(),
  constraint single_row check (id = 1)
);

-- 2) التصنيفات
create table if not exists categories (
  id        text primary key,
  name_ar   text not null,
  name_en   text not null,
  active    boolean default true,
  sort      int default 0,
  created_at timestamptz default now()
);

-- 3) المدن
create table if not exists cities (
  id        text primary key,
  name_ar   text not null,
  name_en   text not null,
  fee       int default 0,
  active    boolean default true,
  created_at timestamptz default now()
);

-- 4) الأقمشة
create table if not exists fabrics (
  id        text primary key,
  name_ar   text not null,
  name_en   text not null,
  created_at timestamptz default now()
);

-- 5) القَصّات
create table if not exists cuts (
  id        text primary key,
  name_ar   text not null,
  name_en   text not null,
  created_at timestamptz default now()
);

-- 6) المنتجات
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  category        text references categories(id) on delete set null,
  fabric          text references fabrics(id) on delete set null,
  cut             text references cuts(id) on delete set null,
  price           numeric not null default 0,
  discount        int default 0 check (discount between 0 and 90),
  is_open         boolean default false,
  is_embroidered  boolean default false,
  is_bestseller   boolean default false,
  is_new          boolean default false,
  colors          jsonb default '[]',       -- [{ name, images: [url, ...] }]
  sizes           text[] default '{}',
  stock           jsonb default '{}',       -- { "أسود|M": 5, ... }
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_bestseller on products(is_bestseller) where is_bestseller;
create index if not exists idx_products_new on products(is_new) where is_new;

-- 7) الكوبونات
create table if not exists coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  type        text not null default 'percent' check (type in ('percent','fixed')),
  value       numeric not null default 0,
  min_order   numeric default 0,
  active      boolean default true,
  used_count  int default 0,
  created_at  timestamptz default now()
);

-- 8) الزبائن (حسابات الزبائن)
create table if not exists customers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text unique not null,
  password_hash text not null,
  area         text,
  city_id      text references cities(id) on delete set null,
  created_at   timestamptz default now()
);
create index if not exists idx_customers_phone on customers(phone);

-- 9) الطلبات
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references customers(id) on delete set null,
  customer_name    text not null,
  customer_phone   text not null,
  customer_area    text,
  customer_notes   text,
  city_id          text references cities(id) on delete set null,
  city_name        text,
  delivery_fee     numeric default 0,
  items            jsonb not null default '[]', -- [{productId, name, price, qty, color, size, image}]
  subtotal         numeric default 0,
  savings          numeric default 0,
  coupon_code      text,
  coupon_discount  numeric default 0,
  total            numeric default 0,
  status           text default 'awaiting' check (status in ('awaiting','pending','shipped','delivered','cancelled')),
  payment_proof_url text,
  payment_verified_at timestamptz,
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  created_at       timestamptz default now()
);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_phone on orders(customer_phone);
create index if not exists idx_orders_created on orders(created_at desc);

-- 10) الحسابات البنكية
create table if not exists bank_accounts (
  id              uuid primary key default gen_random_uuid(),
  bank_name       text not null,
  account_name    text,
  account_number  text,
  iban            text,
  active          boolean default true,
  created_at      timestamptz default now()
);

-- 11) مراجعات العملاء
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  name        text not null,
  rating      int check (rating between 1 and 5),
  comment     text,
  product_id  uuid references products(id) on delete set null,
  verified    boolean default false,
  approved    boolean default true,
  created_at  timestamptz default now()
);
create index if not exists idx_reviews_approved on reviews(approved, created_at desc);

-- ============================================================
-- التحديث التلقائي لـ updated_at
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists settings_updated_at on store_settings;
create trigger settings_updated_at before update on store_settings
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table store_settings enable row level security;
alter table categories     enable row level security;
alter table cities         enable row level security;
alter table fabrics        enable row level security;
alter table cuts           enable row level security;
alter table products       enable row level security;
alter table coupons        enable row level security;
alter table customers      enable row level security;
alter table orders         enable row level security;
alter table bank_accounts  enable row level security;
alter table reviews        enable row level security;

-- قراءة عامة للزبائن (المنتجات، التصنيفات، إلخ)
create policy "public read products"   on products   for select using (true);
create policy "public read categories" on categories for select using (active);
create policy "public read cities"     on cities     for select using (active);
create policy "public read fabrics"    on fabrics    for select using (true);
create policy "public read cuts"       on cuts       for select using (true);
create policy "public read coupons"    on coupons    for select using (active);
create policy "public read banks"      on bank_accounts for select using (active);
create policy "public read reviews"    on reviews    for select using (approved);
create policy "public read settings"   on store_settings for select using (true);

-- إنشاء طلبات من الزبائن
create policy "public insert orders" on orders for insert with check (true);
create policy "public read own order" on orders for select using (true);

-- إنشاء حسابات الزبائن
create policy "public insert customers" on customers for insert with check (true);

-- ============================================================
-- البيانات الافتراضية
-- ============================================================
-- bcrypt hash for "admin123" - يمكن تغييرها لاحقاً
insert into store_settings (id, admin_password_hash)
values (1, '$2b$10$YqzxKfYpKBT8Sf.7Vc0YbeWoP4qy3o2t.uXXfRcQGSL4Hm6V4Z9.W')
on conflict (id) do nothing;

-- التصنيفات الافتراضية
insert into categories (id, name_ar, name_en, sort) values
  ('new',        'الجديد',           'New Arrivals',     1),
  ('khaleeji',   'عبايات خليجية',    'Khaleeji Abayas',  2),
  ('black',      'عبايات سوداء',     'Black Abayas',     3),
  ('colored',    'عبايات ملونة',     'Colored Abayas',   4),
  ('luxury',     'عبايات فخمة',      'Luxury Abayas',    5),
  ('everyday',   'عبايات يومية',     'Everyday Abayas',  6),
  ('embroidered','عبايات مطرزة',     'Embroidered',      7),
  ('eid',        'العيد ورمضان',     'Eid & Ramadan',    8),
  ('sale',       'العروض',           'Sale',             9)
on conflict (id) do nothing;

-- المدن
insert into cities (id, name_ar, name_en, fee) values
  ('gaza',       'مدينة غزة',  'Gaza City',     15),
  ('north',      'شمال غزة',   'North Gaza',    20),
  ('jabalia',    'جباليا',     'Jabalia',       20),
  ('beitlahia',  'بيت لاهيا',  'Beit Lahia',    25),
  ('beithanoun', 'بيت حانون',  'Beit Hanoun',   25),
  ('nuseirat',   'النصيرات',   'Nuseirat',      20),
  ('bureij',     'البريج',     'Bureij',        20),
  ('maghazi',    'المغازي',    'Maghazi',       20),
  ('zawaida',    'الزوايدة',   'Zawayda',       22),
  ('deirbalah',  'دير البلح',  'Deir al-Balah', 20),
  ('khanyounis', 'خان يونس',   'Khan Younis',   25),
  ('rafah',      'رفح',        'Rafah',         30)
on conflict (id) do nothing;

-- الأقمشة
insert into fabrics (id, name_ar, name_en) values
  ('crepe',   'كريب',     'Crepe'),
  ('nada',    'ندى',      'Nada'),
  ('silk',    'حرير',     'Silk'),
  ('chiffon', 'شيفون',    'Chiffon'),
  ('linen',   'لينن',     'Linen'),
  ('velvet',  'مخمل',     'Velvet'),
  ('satin',   'ساتان',    'Satin'),
  ('summer',  'قماش صيفي','Summer fabric'),
  ('winter',  'قماش شتوي','Winter fabric')
on conflict (id) do nothing;

-- القَصّات
insert into cuts (id, name_ar, name_en) values
  ('kloush',     'كلوش',         'Kloush / A-line'),
  ('butterfly',  'فراشة',        'Butterfly'),
  ('bisht',      'بشت',          'Bisht'),
  ('kimono',     'كيمونو',       'Kimono'),
  ('straight',   'مستقيمة',      'Straight'),
  ('button',     'بأزرار',       'Button-down'),
  ('wrap',       'لف / Wrap',    'Wrap'),
  ('wide',       'واسعة',        'Wide'),
  ('fitted',     'بخصر محدد',    'Fitted waist')
on conflict (id) do nothing;

-- كوبونات
insert into coupons (code, type, value, min_order) values
  ('WELCOME10', 'percent', 10, 0),
  ('AMAL20',    'percent', 20, 300)
on conflict (code) do nothing;

-- حساب بنكي افتراضي
insert into bank_accounts (bank_name, account_name, account_number, iban) values
  ('بنك فلسطين', 'عبايات أمل', '0000-0000-0000', 'PS00 PALS 0000 0000 0000 0000 0000 0')
on conflict do nothing;

-- ============================================================
-- Storage Bucket لصور المنتجات وإيصالات التحويل
-- ============================================================
-- شغّلي هذا من Supabase Dashboard → Storage → "New bucket":
--   1. اسم: product-images، عام (public)
--   2. اسم: payment-proofs، خاص (private)
--   3. اسم: hero-bg، عام (public)

-- ============================================================
-- ✓ تم. الجداول جاهزة. ابدئي بإضافة منتجاتك من لوحة الإدارة.
-- ============================================================
