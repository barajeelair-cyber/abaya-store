/* =========================================================
   Supabase Adapter Layer
   ---------------------------------------------------------
   إذا كان Supabase مُهيَّأ في supabase-config.js، يستبدل هذا
   الملف الـ APIs المعرّفة في data.js بنسخ تتحدث مع Supabase
   مباشرة. الواجهة نفسها (نفس أسماء الدوال) فلا يحتاج باقي
   الكود لأي تعديل.
========================================================= */

(function () {
  if (!window.isSupabaseConfigured?.()) {
    console.info("[Supabase] غير مُهيَّأ، نستخدم localStorage");
    return;
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_PRODUCTS, BUCKET_PROOFS, BUCKET_HERO } = window.AMAL_CONFIG;

  /* تحميل مكتبة supabase-js من CDN ديناميكياً */
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  script.onload = init;
  document.head.appendChild(script);

  function init() {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    console.info("[Supabase] متصل ✓");

    /* ====== Products ====== */
    window.ProductsAPI = {
      _cache: null,
      async list() {
        if (this._cache) return this._cache;
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (error) { console.error(error); return []; }
        this._cache = (data || []).map(mapProductFromDB);
        return this._cache;
      },
      async get(id) {
        const list = await this.list();
        return list.find(p => p.id === id);
      },
      totalStock(p) {
        return Object.values(p.stock || {}).reduce((s, v) => s + Number(v || 0), 0);
      },
      variantStock(p, color, size) {
        return Number(p.stock?.[`${color}|${size}`] || 0);
      },
      finalPrice(p) {
        const d = Number(p.discount || 0);
        return d > 0 ? Math.round(p.price * (100 - d) / 100) : p.price;
      },
      colorImages(colorObj) {
        if (!colorObj) return [];
        if (Array.isArray(colorObj.images)) return colorObj.images;
        if (colorObj.image) return [colorObj.image];
        return [];
      },
      coverImage(p) {
        const c = p.colors?.[0];
        return this.colorImages(c)[0] || "";
      },
      async save(product) {
        const payload = mapProductToDB(product);
        let result;
        if (product.id) {
          ({ data: result, error: result } = await supabase.from("products").update(payload).eq("id", product.id).select().single());
        } else {
          ({ data: result, error: result } = await supabase.from("products").insert(payload).select().single());
        }
        this._cache = null;
        return result ? mapProductFromDB(result) : product;
      },
      async remove(id) {
        await supabase.from("products").delete().eq("id", id);
        this._cache = null;
      },
      async decrementVariant(id, color, size, qty) {
        const p = await this.get(id);
        if (!p) return;
        const key = `${color}|${size}`;
        p.stock[key] = Math.max(0, Number(p.stock[key] || 0) - qty);
        await this.save(p);
      },
    };

    /* ====== Orders ====== */
    window.OrdersAPI = {
      async list() {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (error) { console.error(error); return []; }
        return (data || []).map(mapOrderFromDB);
      },
      async add(order) {
        const payload = mapOrderToDB(order);
        const { data, error } = await supabase.from("orders").insert(payload).select().single();
        if (error) { console.error(error); throw error; }
        /* خصم المخزون */
        for (const it of order.items) {
          await ProductsAPI.decrementVariant(it.productId, it.color, it.size, it.qty);
        }
        return mapOrderFromDB(data);
      },
      async updateStatus(id, status) {
        const patch = { status };
        if (status === "pending")   patch.payment_verified_at = new Date().toISOString();
        if (status === "shipped")   patch.shipped_at          = new Date().toISOString();
        if (status === "delivered") patch.delivered_at        = new Date().toISOString();
        await supabase.from("orders").update(patch).eq("id", id);
      },
    };

    /* ====== Lookups (categories, cities, fabrics, cuts, coupons, banks, reviews) ====== */
    function makeRemoteLookupAPI(table) {
      return {
        async list() {
          const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: true });
          if (error) { console.error(error); return []; }
          return data || [];
        },
        async save(item) {
          const op = item.id ? "update" : "insert";
          if (op === "update") {
            const { data } = await supabase.from(table).update(item).eq("id", item.id).select().single();
            return data;
          } else {
            const { data } = await supabase.from(table).insert(item).select().single();
            return data;
          }
        },
        async remove(id) { await supabase.from(table).delete().eq("id", id); },
      };
    }

    window.CategoriesAPI = {
      ...makeRemoteLookupAPI("categories"),
      async active() { return (await this.list()).filter(c => c.active !== false); },
    };
    window.CitiesAPI = {
      ...makeRemoteLookupAPI("cities"),
      async active() { return (await this.list()).filter(c => c.active !== false); },
    };
    window.FabricsAPI = makeRemoteLookupAPI("fabrics");
    window.CutsAPI    = makeRemoteLookupAPI("cuts");
    window.CouponsAPI = {
      ...makeRemoteLookupAPI("coupons"),
      async validate(code, subtotal) {
        const { data } = await supabase.from("coupons").select("*").ilike("code", code).single();
        if (!data) return { ok: false, reason: "الكود غير موجود" };
        if (!data.active) return { ok: false, reason: "هذا الكود غير مُفعَّل" };
        if (Number(subtotal) < Number(data.min_order || 0))
          return { ok: false, reason: `الحد الأدنى للطلب ${data.min_order} ₪` };
        const discount = data.type === "percent"
          ? Math.round(subtotal * Number(data.value) / 100)
          : Math.min(Number(data.value), subtotal);
        return { ok: true, coupon: data, discount };
      },
      async recordUse(code) {
        const { data } = await supabase.from("coupons").select("*").ilike("code", code).single();
        if (data) await supabase.from("coupons").update({ used_count: (data.used_count || 0) + 1 }).eq("id", data.id);
      },
    };

    window.ReviewsAPI = {
      async list() {
        const { data } = await supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false });
        return data || [];
      },
      async save(review) { return await supabase.from("reviews").upsert(review).select().single(); },
      async remove(id)   { await supabase.from("reviews").delete().eq("id", id); },
      avgRating: async function () {
        const list = await this.list();
        if (!list.length) return 0;
        return list.reduce((s, r) => s + Number(r.rating || 0), 0) / list.length;
      },
    };

    /* ====== Settings ====== */
    window.SettingsAPI = {
      _cache: null,
      async _load() {
        if (this._cache) return this._cache;
        const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single();
        this._cache = data || {};
        const { data: banks } = await supabase.from("bank_accounts").select("*").eq("active", true);
        this._cache.bankAccounts = banks || [];
        return this._cache;
      },
      get() { return this._cache || { contact: {}, bankAccounts: [], textOverrides: { ar:{}, en:{} } }; },
      async refresh() { this._cache = null; return await this._load(); },
      async save(patch) {
        const dbPatch = { ...patch };
        if (patch.contact) dbPatch.contact = patch.contact;
        await supabase.from("store_settings").update(dbPatch).eq("id", 1);
        this._cache = null;
        return await this._load();
      },
      async addBank(account) {
        const { data } = await supabase.from("bank_accounts").insert(account).select().single();
        this._cache = null;
        return data;
      },
      async updateBank(id, patch) {
        await supabase.from("bank_accounts").update(patch).eq("id", id);
        this._cache = null;
      },
      async removeBank(id) {
        await supabase.from("bank_accounts").delete().eq("id", id);
        this._cache = null;
      },
    };

    /* ====== Customers ====== */
    window.CustomersAPI = {
      async findByPhone(phone) {
        const p = String(phone || "").replace(/\D/g, "");
        if (!p) return null;
        const { data } = await supabase.from("customers").select("*").eq("phone", p).single();
        return data;
      },
      async register({ name, phone, password }) {
        if (!name || !phone || !password) return { ok: false, reason: "missing_fields" };
        if (String(password).length < 4) return { ok: false, reason: "weak_password" };
        if (await this.findByPhone(phone)) return { ok: false, reason: "phone_exists" };
        const passwordHash = await hashPassword(password);
        const { data, error } = await supabase.from("customers").insert({
          name: name.trim(),
          phone: String(phone).replace(/\D/g, ""),
          password_hash: passwordHash,
        }).select().single();
        if (error) return { ok: false, reason: error.message };
        localStorage.setItem("abaya_amal_customer_session", data.id);
        return { ok: true, customer: data };
      },
      async login(phone, password) {
        const c = await this.findByPhone(phone);
        if (!c) return { ok: false, reason: "not_found" };
        const ok = await verifyPassword(password, c.password_hash);
        if (!ok) return { ok: false, reason: "wrong_password" };
        localStorage.setItem("abaya_amal_customer_session", c.id);
        return { ok: true, customer: c };
      },
      logout() { localStorage.removeItem("abaya_amal_customer_session"); },
      async current() {
        const id = localStorage.getItem("abaya_amal_customer_session");
        if (!id) return null;
        const { data } = await supabase.from("customers").select("*").eq("id", id).single();
        return data;
      },
    };

    /* ====== Storage helper ====== */
    window.uploadToStorage = async function (bucket, file, path) {
      const filename = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      const { data, error } = await supabase.storage.from(bucket).upload(filename, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return publicUrl;
    };

    /* أعلِم باقي الكود أن APIs جاهزة */
    window.dispatchEvent(new Event("supabase-ready"));
  }

  /* ===== Mappers (DB ↔ JS) ===== */
  function mapProductFromDB(p) {
    return {
      id: p.id,
      name: p.name,
      description: p.description || "",
      category: p.category,
      fabric: p.fabric,
      cut: p.cut,
      price: Number(p.price),
      discount: Number(p.discount || 0),
      isOpen: !!p.is_open,
      isEmbroidered: !!p.is_embroidered,
      isBestseller: !!p.is_bestseller,
      isNew: !!p.is_new,
      colors: p.colors || [],
      sizes: p.sizes || [],
      stock: p.stock || {},
    };
  }
  function mapProductToDB(p) {
    return {
      name: p.name,
      description: p.description,
      category: p.category,
      fabric: p.fabric,
      cut: p.cut,
      price: p.price,
      discount: p.discount,
      is_open: !!p.isOpen,
      is_embroidered: !!p.isEmbroidered,
      is_bestseller: !!p.isBestseller,
      is_new: !!p.isNew,
      colors: p.colors,
      sizes: p.sizes,
      stock: p.stock,
    };
  }
  function mapOrderFromDB(o) {
    return {
      id: o.id,
      createdAt: o.created_at,
      status: o.status,
      customer: {
        name: o.customer_name,
        phone: o.customer_phone,
        area: o.customer_area,
        notes: o.customer_notes,
      },
      cityId: o.city_id,
      cityName: o.city_name,
      deliveryFee: Number(o.delivery_fee || 0),
      items: o.items || [],
      subtotal: Number(o.subtotal || 0),
      savings: Number(o.savings || 0),
      couponCode: o.coupon_code,
      couponDiscount: Number(o.coupon_discount || 0),
      total: Number(o.total || 0),
      paymentProof: o.payment_proof_url,
      paymentVerifiedAt: o.payment_verified_at,
      shippedAt: o.shipped_at,
      deliveredAt: o.delivered_at,
    };
  }
  function mapOrderToDB(o) {
    return {
      customer_name: o.customer.name,
      customer_phone: o.customer.phone,
      customer_area: o.customer.area,
      customer_notes: o.customer.notes,
      city_id: o.cityId,
      city_name: o.cityName,
      delivery_fee: o.deliveryFee,
      items: o.items,
      subtotal: o.subtotal,
      savings: o.savings,
      coupon_code: o.couponCode,
      coupon_discount: o.couponDiscount,
      total: o.total,
      payment_proof_url: o.paymentProof,
      status: "awaiting",
    };
  }

  /* ===== كلمة المرور (SHA-256 — مناسب لاستخدامنا، يمكن ترقيتها لـ bcrypt server-side) ===== */
  async function hashPassword(password) {
    const enc = new TextEncoder().encode("amal_salt_v1:" + password);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  async function verifyPassword(password, hash) {
    return (await hashPassword(password)) === hash;
  }
})();
