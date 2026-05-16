/* =========================================================
   عبايات أمل  —  طبقة البيانات المشتركة
   ---------------------------------------------------------
   تستخدم localStorage كقاعدة بيانات مؤقتة.
   عند الانتقال إلى Backend حقيقي، استبدلي محتوى الدوال
   فقط (مثل ProductsAPI.list) باستدعاء fetch.
   ========================================================= */

const DB_KEY = "abaya_amal_v2";
const AUTH_KEY = "abaya_amal_admin_session";

/* ---------- مدن قطاع غزة ---------- */
const GAZA_CITIES = [
  { id: "gaza",       name: "مدينة غزة",   fee: 15 },
  { id: "north",      name: "شمال غزة",    fee: 20 },
  { id: "jabalia",    name: "جباليا",      fee: 20 },
  { id: "beitlahia",  name: "بيت لاهيا",   fee: 25 },
  { id: "beithanoun", name: "بيت حانون",   fee: 25 },
  { id: "nuseirat",   name: "النصيرات",    fee: 20 },
  { id: "bureij",     name: "البريج",      fee: 20 },
  { id: "maghazi",    name: "المغازي",     fee: 20 },
  { id: "zawaida",    name: "الزوايدة",    fee: 22 },
  { id: "deirbalah",  name: "دير البلح",   fee: 20 },
  { id: "khanyounis", name: "خان يونس",    fee: 25 },
  { id: "rafah",      name: "رفح",         fee: 30 },
];

/* ---------- التصنيفات ---------- */
const CATEGORIES = [
  { id: "all",        name: "الكل" },
  { id: "everyday",   name: "عبايات عملية" },
  { id: "occasions",  name: "عبايات مناسبات" },
  { id: "black",      name: "عبايات سوداء" },
  { id: "open",       name: "عبايات مفتوحة" },
];

/* ---------- حالات الطلب ---------- */
const ORDER_STATUSES = [
  { id: "awaiting",   label: "بانتظار تأكيد الدفع", color: "warning" },
  { id: "pending",    label: "قيد المعالجة",        color: "info" },
  { id: "shipped",    label: "تم الشحن",            color: "primary" },
  { id: "delivered",  label: "تم التوصيل",          color: "success" },
  { id: "cancelled",  label: "ملغي",                color: "danger" },
];

const LOW_STOCK_THRESHOLD = 5;
const DEFAULT_SIZES  = ["S", "M", "L", "XL"];
const DEFAULT_COLORS = ["أسود", "كحلي", "بني", "ذهبي وردي"];

/* ---------- التخزين ---------- */
function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* corrupt */ }
  }
  const seed = seedData();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

/* ---------- بذرة افتراضية ---------- */
function seedData() {
  const p1Id = uid();
  const p2Id = uid();
  const p3Id = uid();
  const p4Id = uid();
  return {
    products: [
      {
        id: p1Id,
        name: "عباية المسائية الذهبية",
        description: "تصميم مسائي راقٍ بتطريز ذهبي يدوي وحاشية مزخرفة، تناسب المناسبات الخاصة.",
        category: "occasions",
        price: 340,
        discount: 0,
        colors: [
          { name: "أسود", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=900&q=80" },
          { name: "بني داكن", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&q=80" },
        ],
        sizes: ["S", "M", "L", "XL"],
        stock: {
          "أسود|S": 3, "أسود|M": 5, "أسود|L": 4, "أسود|XL": 2,
          "بني داكن|S": 2, "بني داكن|M": 3, "بني داكن|L": 2, "بني داكن|XL": 1,
        },
      },
      {
        id: p2Id,
        name: "عباية يومية بسيطة",
        description: "عباية مريحة بقصة عصرية تناسب الإطلالة اليومية والعمل.",
        category: "everyday",
        price: 180,
        discount: 10,
        colors: [
          { name: "أسود", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80" },
        ],
        sizes: ["S", "M", "L"],
        stock: { "أسود|S": 4, "أسود|M": 6, "أسود|L": 3 },
      },
      {
        id: p3Id,
        name: "عباية الخليج الفاخرة",
        description: "عباية سوداء كلاسيكية بتطريز ذهبي يدوي على الأكمام والياقة.",
        category: "black",
        price: 280,
        discount: 0,
        colors: [
          { name: "أسود", image: "https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&q=80" },
        ],
        sizes: ["M", "L", "XL"],
        stock: { "أسود|M": 4, "أسود|L": 5, "أسود|XL": 3 },
      },
      {
        id: p4Id,
        name: "عباية مفتوحة عصرية",
        description: "عباية مفتوحة بقصة فضفاضة وحزام علوي، لإطلالة جريئة ومميزة.",
        category: "open",
        price: 260,
        discount: 15,
        colors: [
          { name: "أسود", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80" },
          { name: "بيج", image: "https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=80" },
        ],
        sizes: ["S", "M", "L"],
        stock: { "أسود|S": 2, "أسود|M": 3, "أسود|L": 2, "بيج|S": 1, "بيج|M": 2, "بيج|L": 1 },
      },
    ],
    orders: [],
    settings: {
      storeName: "عبايات أمل",
      headline: "عبايات وأكثر تجدينها لدى عبايات أمل",
      currency: "₪",
      contact: {
        phone: "+970 59 0000000",
        whatsapp: "+970 59 0000000",
      },
      bankAccounts: [
        {
          id: uid(),
          bankName: "بنك فلسطين",
          accountName: "عبايات أمل",
          accountNumber: "0000-0000-0000",
          iban: "PS00 PALS 0000 0000 0000 0000 0000 0",
        },
      ],
      coupons: [
        { id: uid(), code: "WELCOME10", type: "percent", value: 10, minOrder: 0, active: true, usedCount: 0 },
        { id: uid(), code: "AMAL20",    type: "percent", value: 20, minOrder: 300, active: true, usedCount: 0 },
      ],
      admin: { username: "admin", password: "admin123" },
    },
  };
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* =========================================================
   ProductsAPI
========================================================= */
const ProductsAPI = {
  list()       { return loadDB().products; },
  get(id)      { return loadDB().products.find(p => p.id === id); },

  /* المخزون الإجمالي لمنتج (مجموع كل التركيبات) */
  totalStock(p) {
    return Object.values(p.stock || {}).reduce((s, v) => s + Number(v || 0), 0);
  },

  /* المخزون لتركيبة لون+مقاس */
  variantStock(p, color, size) {
    return Number(p.stock?.[`${color}|${size}`] || 0);
  },

  /* السعر بعد الخصم */
  finalPrice(p) {
    const d = Number(p.discount || 0);
    return d > 0 ? Math.round(p.price * (100 - d) / 100) : p.price;
  },

  save(product) {
    const db = loadDB();
    if (product.id) {
      const idx = db.products.findIndex(p => p.id === product.id);
      if (idx >= 0) db.products[idx] = product; else db.products.push(product);
    } else {
      product.id = uid();
      db.products.push(product);
    }
    saveDB(db);
    return product;
  },

  remove(id) {
    const db = loadDB();
    db.products = db.products.filter(p => p.id !== id);
    saveDB(db);
  },

  decrementVariant(id, color, size, qty) {
    const db = loadDB();
    const p = db.products.find(x => x.id === id);
    if (!p) return;
    const key = `${color}|${size}`;
    p.stock[key] = Math.max(0, Number(p.stock[key] || 0) - qty);
    saveDB(db);
  },
};

/* =========================================================
   OrdersAPI
========================================================= */
const OrdersAPI = {
  list() { return loadDB().orders.slice().reverse(); },

  add(order) {
    const db = loadDB();
    order.id = uid();
    order.createdAt = new Date().toISOString();
    order.status = "awaiting";  /* بانتظار تأكيد الدفع */
    db.orders.push(order);
    saveDB(db);
    /* خصم المخزون فوراً (تحفّظ) */
    order.items.forEach(it =>
      ProductsAPI.decrementVariant(it.productId, it.color, it.size, it.qty)
    );
    return order;
  },

  updateStatus(id, status) {
    const db = loadDB();
    const o = db.orders.find(x => x.id === id);
    if (!o) return;
    o.status = status;
    if (status === "pending"   && !o.paymentVerifiedAt) o.paymentVerifiedAt = new Date().toISOString();
    if (status === "shipped"   && !o.shippedAt)         o.shippedAt = new Date().toISOString();
    if (status === "delivered" && !o.deliveredAt)       o.deliveredAt = new Date().toISOString();
    saveDB(db);
  },
};

/* =========================================================
   SettingsAPI
========================================================= */
const SettingsAPI = {
  get()  { return loadDB().settings; },
  save(patch) {
    const db = loadDB();
    db.settings = { ...db.settings, ...patch };
    saveDB(db);
    return db.settings;
  },

  /* الحسابات البنكية */
  addBank(account) {
    const db = loadDB();
    account.id = uid();
    db.settings.bankAccounts.push(account);
    saveDB(db);
    return account;
  },
  updateBank(id, patch) {
    const db = loadDB();
    const b = db.settings.bankAccounts.find(x => x.id === id);
    if (b) Object.assign(b, patch);
    saveDB(db);
  },
  removeBank(id) {
    const db = loadDB();
    db.settings.bankAccounts = db.settings.bankAccounts.filter(b => b.id !== id);
    saveDB(db);
  },
};

/* =========================================================
   CouponsAPI  —  أكواد الخصم
========================================================= */
const CouponsAPI = {
  list() { return loadDB().settings.coupons || []; },

  save(coupon) {
    const db = loadDB();
    db.settings.coupons = db.settings.coupons || [];
    if (coupon.id) {
      const idx = db.settings.coupons.findIndex(c => c.id === coupon.id);
      if (idx >= 0) db.settings.coupons[idx] = coupon; else db.settings.coupons.push(coupon);
    } else {
      coupon.id = uid();
      coupon.usedCount = 0;
      db.settings.coupons.push(coupon);
    }
    saveDB(db);
    return coupon;
  },

  remove(id) {
    const db = loadDB();
    db.settings.coupons = (db.settings.coupons || []).filter(c => c.id !== id);
    saveDB(db);
  },

  /* تحقق من كود + احسب قيمة الخصم */
  validate(code, subtotal) {
    const c = this.list().find(x =>
      (x.code || "").toUpperCase() === (code || "").toUpperCase().trim()
    );
    if (!c) return { ok: false, reason: "الكود غير موجود" };
    if (!c.active) return { ok: false, reason: "هذا الكود غير مُفعَّل" };
    if (Number(subtotal) < Number(c.minOrder || 0))
      return { ok: false, reason: `الحد الأدنى للطلب ${c.minOrder} ₪` };
    const discount = c.type === "percent"
      ? Math.round(subtotal * Number(c.value) / 100)
      : Math.min(Number(c.value), subtotal);
    return { ok: true, coupon: c, discount };
  },

  recordUse(code) {
    const db = loadDB();
    const c = (db.settings.coupons || []).find(x =>
      (x.code || "").toUpperCase() === (code || "").toUpperCase()
    );
    if (c) { c.usedCount = (c.usedCount || 0) + 1; saveDB(db); }
  },
};

/* =========================================================
   AuthAPI  —  دخول الأدمن
========================================================= */
const AuthAPI = {
  isLoggedIn() { return sessionStorage.getItem(AUTH_KEY) === "yes"; },
  login(username, password) {
    const a = loadDB().settings.admin;
    if (username === a.username && password === a.password) {
      sessionStorage.setItem(AUTH_KEY, "yes");
      return true;
    }
    return false;
  },
  logout() { sessionStorage.removeItem(AUTH_KEY); },
  changePassword(currentPwd, newPwd) {
    const db = loadDB();
    if (db.settings.admin.password !== currentPwd) return false;
    db.settings.admin.password = newPwd;
    saveDB(db);
    return true;
  },
};

/* =========================================================
   Utils
========================================================= */
const Utils = {
  cityById(id)     { return GAZA_CITIES.find(c => c.id === id); },
  categoryById(id) { return CATEGORIES.find(c => c.id === id); },
  statusInfo(id)   { return ORDER_STATUSES.find(s => s.id === id) || { label: id, color: "muted" }; },
  fmt(n)           { return new Intl.NumberFormat("ar-EG").format(n) + " ₪"; },
  formatDate(iso)  { return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }); },

  /* قراءة ملف صورة إلى base64 (لـ drag-and-drop) */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  },
};

/* جعل كل شيء متاحاً للنوافذ */
Object.assign(window, {
  ProductsAPI, OrdersAPI, SettingsAPI, CouponsAPI, AuthAPI, Utils,
  GAZA_CITIES, CATEGORIES, ORDER_STATUSES,
  LOW_STOCK_THRESHOLD, DEFAULT_SIZES, DEFAULT_COLORS,
});
