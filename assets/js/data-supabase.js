/* =========================================================
   Supabase Sync-Cache Adapter
   ---------------------------------------------------------
   البنية:
   1. عند بدء التطبيق نحمّل supabase-js + كل البيانات الأولية في cache
   2. بعد جاهزية الـ cache، نُطلق حدث 'data-ready'
   3. كل دوال القراءة (list/get) تُرجع من الـ cache مباشرة (sync)
   4. كل دوال الكتابة (save/remove) تكتب إلى Supabase + تُحدّث الـ cache
      مباشرة (تفاؤلياً) بحيث يستطيع الـ caller أن يقرأ الجديد فوراً
      بدون await
========================================================= */

(function () {
  /* يُبلّغ عن فشل كتابة في الخلفية: يسجّل في console ويُطلق حدثاً
     تلتقطه الواجهة لتعرض رسالة للمستخدم بدل الفشل الصامت. */
  function notifyWriteError(context, error) {
    console.error(`[${context}]`, error);
    try {
      window.dispatchEvent(new CustomEvent("data-write-error", {
        detail: { context, message: error?.message || String(error) },
      }));
    } catch (_) {}
  }
  /* يُبلّغ أن التطبيق يعمل في وضع غير متصل (localStorage) */
  function notifyOffline(reason) {
    console.warn("[Supabase] وضع غير متصل:", reason);
    try {
      window.dispatchEvent(new CustomEvent("data-offline", {
        detail: { reason: reason?.message || String(reason || "") },
      }));
    } catch (_) {}
  }
  window.notifyWriteError = notifyWriteError;

  if (!window.isSupabaseConfigured?.()) {
    console.info("[Supabase] غير مُهيَّأ، نستخدم localStorage");
    /* أطلق data-ready فوراً حتى تتابع الصفحة الرسم */
    window.addEventListener("DOMContentLoaded", () => {
      window.dispatchEvent(new Event("data-ready"));
    });
    if (document.readyState !== "loading") {
      setTimeout(() => window.dispatchEvent(new Event("data-ready")), 0);
    }
    return;
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_PRODUCTS, BUCKET_PROOFS, BUCKET_HERO } = window.AMAL_CONFIG;
  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";

  loadSupabase().then(initAdapter).catch(err => {
    /* فشل تحميل supabase-js أو جلب البيانات الأولية → نكمل بـ localStorage
       (الـ APIs المعرّفة في data.js تبقى فعّالة) ونُعلم الواجهة. */
    notifyOffline(err);
    window.dispatchEvent(new Event("data-ready"));
  });

  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) return resolve();
      const s = document.createElement("script");
      s.src = CDN;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  async function initAdapter() {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;

    /* ====== Caches ====== */
    const cache = {
      products:    [],
      orders:      [],
      categories:  [],
      cities:      [],
      fabrics:     [],
      cuts:        [],
      coupons:     [],
      reviews:     [],
      banks:       [],
      settings:    { textOverrides: { ar: {}, en: {} }, contact: {} },
    };

    /* جلب كل البيانات بالتوازي */
    const [
      productsRes, ordersRes, categoriesRes, citiesRes,
      fabricsRes, cutsRes, couponsRes, reviewsRes,
      banksRes, settingsRes,
    ] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort", { ascending: true }),
      supabase.from("cities").select("*"),
      supabase.from("fabrics").select("*"),
      supabase.from("cuts").select("*"),
      supabase.from("coupons").select("*"),
      supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }),
      supabase.from("bank_accounts").select("*").eq("active", true),
      supabase.from("store_settings").select("*").eq("id", 1).single(),
    ]);

    cache.products   = (productsRes.data   || []).map(mapProductFromDB);
    cache.orders     = (ordersRes.data     || []).map(mapOrderFromDB);
    cache.categories = categoriesRes.data  || [];
    cache.cities     = citiesRes.data      || [];
    cache.fabrics    = fabricsRes.data     || [];
    cache.cuts       = cutsRes.data        || [];
    cache.coupons    = couponsRes.data     || [];
    cache.reviews    = reviewsRes.data     || [];
    cache.banks      = banksRes.data       || [];
    cache.settings   = settingsRes.data    || { textOverrides: { ar: {}, en: {} }, contact: {} };
    cache.settings.bankAccounts = cache.banks;

    console.info(`[Supabase] جاهز ✓ — ${cache.products.length} منتج، ${cache.orders.length} طلب، ${cache.categories.length} تصنيف`);

    /* ===== ProductsAPI ===== */
    window.ProductsAPI = {
      list() { return cache.products; },
      get(id) { return cache.products.find(p => p.id === id); },
      totalStock(p) { return Object.values(p.stock || {}).reduce((s, v) => s + Number(v || 0), 0); },
      variantStock(p, color, size) { return Number(p.stock?.[`${color}|${size}`] || 0); },
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
      save(product) {
        const payload = mapProductToDB(product);
        /* نظّف حقول المفاتيح الأجنبية: قيمة فارغة "" أو معرّف غير موجود
           تخالف قيد FK وتُفشل الحفظ → نحوّلها إلى null. */
        if (!payload.category || !cache.categories.some(c => c.id === payload.category)) payload.category = null;
        if (!payload.fabric   || !cache.fabrics.some(f => f.id === payload.fabric))     payload.fabric   = null;
        if (!payload.cut      || !cache.cuts.some(c => c.id === payload.cut))           payload.cut      = null;
        const isUpdate = !!product.id;
        /* تحديث الـ cache مباشرة (تفاؤلياً) */
        if (isUpdate) {
          const idx = cache.products.findIndex(x => x.id === product.id);
          if (idx >= 0) cache.products[idx] = { ...product };
        } else {
          /* id مؤقت حتى ترجع DB */
          const tempId = "temp-" + Date.now();
          cache.products.unshift({ ...product, id: tempId });
          product.id = tempId;
        }
        /* اكتب إلى DB في الخلفية */
        (isUpdate
          ? supabase.from("products").update(payload).eq("id", product.id).select().single()
          : supabase.from("products").insert(payload).select().single()
        ).then(({ data, error }) => {
          if (error) { notifyWriteError("save product", error); return; }
          /* استبدل الـ temp id بالحقيقي */
          const real = mapProductFromDB(data);
          const idx = cache.products.findIndex(x => x.id === product.id);
          if (idx >= 0) cache.products[idx] = real;
          window.dispatchEvent(new Event("data-changed"));
        });
        return product;
      },
      remove(id) {
        cache.products = cache.products.filter(p => p.id !== id);
        supabase.from("products").delete().eq("id", id).then(({ error }) => {
          if (error) notifyWriteError("remove product", error);
        });
      },
      decrementVariant(id, color, size, qty) {
        const p = cache.products.find(x => x.id === id);
        if (!p) return;
        const key = `${color}|${size}`;
        p.stock[key] = Math.max(0, Number(p.stock[key] || 0) - qty);
        this.save(p);
      },
    };

    /* ===== OrdersAPI ===== */
    window.OrdersAPI = {
      list() { return cache.orders; },
      /* ترجع Promise بـ { ok, order, error } بعد تأكيد الحفظ فعلياً في DB
         حتى لا يُعرَض نجاح وهمي للزبونة إن فشلت الكتابة. */
      add(order) {
        const payload = mapOrderToDB(order);
        const tempId = "temp-" + Date.now();
        order.id = tempId;
        order.createdAt = new Date().toISOString();
        order.status = "awaiting";
        /* تحديث تفاؤلي للـ cache */
        cache.orders.unshift({ ...order });
        return supabase.from("orders").insert(payload).select().single()
          .then(({ data, error }) => {
            if (error) {
              notifyWriteError("add order", error);
              /* تراجع: أزل الطلب التفاؤلي لأن الحفظ فشل */
              cache.orders = cache.orders.filter(o => o.id !== tempId);
              return { ok: false, error };
            }
            const real = mapOrderFromDB(data);
            const idx = cache.orders.findIndex(x => x.id === tempId);
            if (idx >= 0) cache.orders[idx] = real;
            /* خصم المخزون بعد تأكيد الطلب فقط */
            order.items.forEach(it =>
              window.ProductsAPI.decrementVariant(it.productId, it.color, it.size, it.qty)
            );
            window.dispatchEvent(new Event("data-changed"));
            return { ok: true, order: real };
          })
          .catch(error => {
            notifyWriteError("add order", error);
            cache.orders = cache.orders.filter(o => o.id !== tempId);
            return { ok: false, error };
          });
      },
      updateStatus(id, status) {
        const o = cache.orders.find(x => x.id === id);
        const prevStatus = o ? o.status : null;
        if (o) o.status = status;
        const patch = { status };
        if (status === "pending")   patch.payment_verified_at = new Date().toISOString();
        if (status === "shipped")   patch.shipped_at          = new Date().toISOString();
        if (status === "delivered") patch.delivered_at        = new Date().toISOString();
        supabase.from("orders").update(patch).eq("id", id).then(({ error }) => {
          if (error) {
            /* تراجع عن تغيير الحالة المحلي عند الفشل */
            if (o && prevStatus !== null) o.status = prevStatus;
            notifyWriteError("update order status", error);
            window.dispatchEvent(new Event("data-changed"));
          }
        });
      },
    };

    /* ===== Lookups (sync wrappers) ===== */
    function makeLookupAPI(table, cacheKey) {
      return {
        list() { return cache[cacheKey]; },
        active() { return cache[cacheKey].filter(c => c.active !== false); },
        save(item) {
          if (item.id) {
            const idx = cache[cacheKey].findIndex(x => x.id === item.id);
            if (idx >= 0) cache[cacheKey][idx] = { ...cache[cacheKey][idx], ...item };
            supabase.from(table).update(item).eq("id", item.id).then(({ error }) => {
              if (error) notifyWriteError(`save ${table}`, error);
            });
          } else {
            const tempId = "temp-" + Date.now();
            const newItem = { ...item, id: tempId };
            cache[cacheKey].push(newItem);
            const insertItem = { ...item };
            /* ولّد معرّفاً من الاسم الإنجليزي، واضمن أنه فريد لا يتعارض مع
               أي معرّف موجود (وإلا فشل الحفظ بسبب تكرار المفتاح الأساسي). */
            let baseId = (insertItem.id
              || (insertItem.name_en || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
              || ("item-" + Date.now());
            let uniqueId = baseId;
            while (cache[cacheKey].some(x => x !== newItem && x.id === uniqueId)) {
              uniqueId = baseId + "-" + Math.random().toString(36).slice(2, 6);
            }
            insertItem.id = uniqueId;
            /* حدّث معرّف عنصر الذاكرة فوراً حتى لا يتعارض حفظ تالٍ سريع معه */
            newItem.id = uniqueId;
            supabase.from(table).insert(insertItem).select().single().then(({ data, error }) => {
              if (error) { notifyWriteError(`insert ${table}`, error); return; }
              if (data) Object.assign(newItem, data);
            });
          }
          return item;
        },
        remove(id) {
          cache[cacheKey] = cache[cacheKey].filter(x => x.id !== id);
          supabase.from(table).delete().eq("id", id).then(({ error }) => {
            if (error) notifyWriteError(`remove ${table}`, error);
          });
        },
      };
    }

    window.CategoriesAPI = makeLookupAPI("categories", "categories");
    window.CitiesAPI     = makeLookupAPI("cities",     "cities");
    window.FabricsAPI    = makeLookupAPI("fabrics",    "fabrics");
    window.CutsAPI       = makeLookupAPI("cuts",       "cuts");

    /* ===== CouponsAPI (لها خصوصيات) ===== */
    window.CouponsAPI = {
      list() { return cache.coupons; },
      save(coupon) {
        const payload = {
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value || 0),
          min_order: Number(coupon.minOrder || coupon.min_order || 0),
          active: coupon.active !== false,
        };
        if (coupon.id) {
          const idx = cache.coupons.findIndex(x => x.id === coupon.id);
          if (idx >= 0) cache.coupons[idx] = { ...cache.coupons[idx], ...payload };
          supabase.from("coupons").update(payload).eq("id", coupon.id).then(({ error }) => {
            if (error) notifyWriteError("save coupon", error);
          });
        } else {
          const tempId = "temp-" + Date.now();
          cache.coupons.push({ id: tempId, ...payload, used_count: 0 });
          supabase.from("coupons").insert(payload).select().single().then(({ data, error }) => {
            if (error) { notifyWriteError("insert coupon", error); return; }
            if (data) {
              const idx = cache.coupons.findIndex(x => x.id === tempId);
              if (idx >= 0) cache.coupons[idx] = data;
            }
          });
        }
        return coupon;
      },
      remove(id) {
        cache.coupons = cache.coupons.filter(c => c.id !== id);
        supabase.from("coupons").delete().eq("id", id).then(({ error }) => {
          if (error) notifyWriteError("remove coupon", error);
        });
      },
      validate(code, subtotal) {
        const c = cache.coupons.find(x => (x.code || "").toUpperCase() === (code || "").toUpperCase().trim());
        if (!c) return { ok: false, reason: "الكود غير موجود" };
        if (!c.active) return { ok: false, reason: "هذا الكود غير مُفعَّل" };
        const min = Number(c.min_order || c.minOrder || 0);
        if (Number(subtotal) < min) return { ok: false, reason: `الحد الأدنى للطلب ${min} ₪` };
        const discount = c.type === "percent"
          ? Math.round(subtotal * Number(c.value) / 100)
          : Math.min(Number(c.value), subtotal);
        return { ok: true, coupon: c, discount };
      },
      recordUse(code) {
        const c = cache.coupons.find(x => (x.code || "").toUpperCase() === (code || "").toUpperCase());
        if (c) {
          c.used_count = (c.used_count || 0) + 1;
          supabase.from("coupons").update({ used_count: c.used_count }).eq("id", c.id).then(({ error }) => {
            if (error) notifyWriteError("record coupon use", error);
          });
        }
      },
    };

    /* ===== ReviewsAPI ===== */
    window.ReviewsAPI = {
      list() { return cache.reviews; },
      save(review) {
        const payload = {
          name: review.name,
          rating: Number(review.rating || 5),
          comment: review.comment || review.text,
          verified: !!review.verified,
          approved: review.approved !== false,
        };
        if (review.id && !String(review.id).startsWith("temp-")) {
          const idx = cache.reviews.findIndex(r => r.id === review.id);
          if (idx >= 0) cache.reviews[idx] = { ...cache.reviews[idx], ...payload };
          supabase.from("reviews").update(payload).eq("id", review.id).then(({ error }) => {
            if (error) notifyWriteError("save review", error);
          });
        } else {
          const tempId = "temp-" + Date.now();
          cache.reviews.unshift({ id: tempId, ...payload, created_at: new Date().toISOString() });
          supabase.from("reviews").insert(payload).select().single().then(({ data, error }) => {
            if (error) { notifyWriteError("insert review", error); return; }
            if (data) {
              const idx = cache.reviews.findIndex(r => r.id === tempId);
              if (idx >= 0) cache.reviews[idx] = data;
            }
          });
        }
        return review;
      },
      remove(id) {
        cache.reviews = cache.reviews.filter(r => r.id !== id);
        supabase.from("reviews").delete().eq("id", id).then(({ error }) => {
          if (error) notifyWriteError("remove review", error);
        });
      },
      avgRating() {
        if (!cache.reviews.length) return 0;
        return cache.reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / cache.reviews.length;
      },
    };

    /* ===== SettingsAPI ===== */
    window.SettingsAPI = {
      get() { return cache.settings; },
      save(patch) {
        Object.assign(cache.settings, patch);
        const dbPatch = {};
        Object.keys(patch).forEach(k => {
          /* تحويل camelCase ↔ snake_case للحقول المعروفة */
          if (k === "heroBgImage")   dbPatch.hero_bg_image = patch[k];
          else if (k === "heroBgOpacity") dbPatch.hero_bg_opacity = patch[k];
          else if (k === "soundEnabled")  dbPatch.sound_enabled  = patch[k];
          else if (k === "textOverrides") dbPatch.text_overrides = patch[k];
          else if (k === "siteInfo")      dbPatch.site_info      = patch[k];
          else if (k === "sizeCharts")    dbPatch.size_charts    = patch[k];
          else if (k === "storeName")     dbPatch.store_name     = patch[k];
          else dbPatch[k] = patch[k];
        });
        supabase.from("store_settings").update(dbPatch).eq("id", 1).then(({ error }) => {
          if (error) notifyWriteError("save settings", error);
        });
        return cache.settings;
      },
      addBank(account) {
        const tempId = "temp-" + Date.now();
        const newBank = { ...account, id: tempId, active: true };
        cache.banks.push(newBank);
        cache.settings.bankAccounts = cache.banks;
        supabase.from("bank_accounts").insert({
          bank_name: account.bankName,
          account_name: account.accountName,
          account_number: account.accountNumber,
          iban: account.iban,
          phone: account.phone || null,
        }).select().single().then(({ data, error }) => {
          if (error) { notifyWriteError("add bank", error); return; }
          if (data) {
            const idx = cache.banks.findIndex(b => b.id === tempId);
            if (idx >= 0) cache.banks[idx] = data;
          }
        });
        return newBank;
      },
      updateBank(id, patch) {
        const b = cache.banks.find(x => x.id === id);
        if (b) Object.assign(b, patch);
        const dbPatch = {};
        if (patch.bankName)      dbPatch.bank_name      = patch.bankName;
        if (patch.accountName)   dbPatch.account_name   = patch.accountName;
        if (patch.accountNumber) dbPatch.account_number = patch.accountNumber;
        if (patch.iban !== undefined)  dbPatch.iban     = patch.iban;
        if (patch.phone !== undefined) dbPatch.phone    = patch.phone || null;
        supabase.from("bank_accounts").update(dbPatch).eq("id", id).then(({ error }) => {
          if (error) notifyWriteError("update bank", error);
        });
      },
      removeBank(id) {
        cache.banks = cache.banks.filter(b => b.id !== id);
        cache.settings.bankAccounts = cache.banks;
        supabase.from("bank_accounts").delete().eq("id", id).then(({ error }) => {
          if (error) notifyWriteError("remove bank", error);
        });
      },
    };

    /* ===== توحيد مفاتيح الإعدادات (snake_case ↔ camelCase) =====
       صفّ store_settings في القاعدة يستخدم snake_case (site_info,
       text_overrides, size_charts...) بينما تتوقّع واجهات القراءة
       camelCase. نوفّر الاسمين معاً حتى تقرأ الواجهة والمتجر القيم
       الحقيقية من Supabase بدل القيم الافتراضية. */
    function normalizeSettings() {
      const s = cache.settings || (cache.settings = {});
      const pair = (camel, snake) => {
        if (s[snake] != null && s[camel] == null) s[camel] = s[snake];
        if (s[camel] != null && s[snake] == null) s[snake] = s[camel];
      };
      pair("siteInfo", "site_info");
      pair("textOverrides", "text_overrides");
      pair("sizeCharts", "size_charts");
      pair("heroBgImage", "hero_bg_image");
      pair("heroBgOpacity", "hero_bg_opacity");
      pair("soundEnabled", "sound_enabled");
      pair("storeName", "store_name");
    }
    normalizeSettings();

    /* اجعل دالة الترجمة t() في المتجر تلتقط تخصيصات النصوص المخزّنة في
       Supabase: ننسخها إلى نفس مفتاح localStorage الذي تقرأه data.js ثم
       نعيد تحميل ذاكرة التخصيصات ونعيد تطبيق الترجمة. */
    function applyTextOverridesToRuntime() {
      try {
        const ov = cache.settings.textOverrides || cache.settings.text_overrides;
        if (!ov) return;
        /* استخدم loadDB/saveDB حتى تبقى قاعدة localStorage كاملة (تشمل
           بيانات دخول الأدمن) ولا نكتب قاعدة جزئية تُعطّل تسجيل الدخول. */
        if (typeof window.loadDB === "function" && typeof window.saveDB === "function") {
          const db = window.loadDB();
          db.settings.textOverrides = ov;
          window.saveDB(db);
        } else if (typeof window._loadOverrides === "function") {
          window._loadOverrides();
        }
        if (typeof window.applyTranslations === "function") window.applyTranslations();
      } catch (e) { console.warn("[Supabase] applyTextOverrides:", e); }
    }
    applyTextOverridesToRuntime();

    /* ===== SiteInfoAPI (من نحن / الشحن / الأسئلة / السياسات) ===== */
    window.SiteInfoAPI = {
      get() {
        return cache.settings.siteInfo || cache.settings.site_info
          || (typeof window.defaultSiteInfo === "function" ? window.defaultSiteInfo() : {});
      },
      update(patch) {
        const merged = { ...this.get(), ...patch };
        cache.settings.siteInfo = merged;
        cache.settings.site_info = merged;
        window.SettingsAPI.save({ siteInfo: merged });
        window.dispatchEvent(new Event("data-changed"));
        return merged;
      },
    };

    /* ===== TextOverridesAPI (نصوص الواجهة) ===== */
    window.TextOverridesAPI = {
      all() {
        return cache.settings.textOverrides || cache.settings.text_overrides || { ar: {}, en: {} };
      },
      get(lang, key) { return this.all()?.[lang]?.[key] || ""; },
      set(lang, key, value) {
        const o = JSON.parse(JSON.stringify(this.all() || { ar: {}, en: {} }));
        if (!o[lang]) o[lang] = {};
        if (value && String(value).trim()) o[lang][key] = String(value);
        else delete o[lang][key];
        cache.settings.textOverrides = o;
        cache.settings.text_overrides = o;
        window.SettingsAPI.save({ textOverrides: o });
        applyTextOverridesToRuntime();
        window.dispatchEvent(new Event("data-changed"));
      },
      reset(key) {
        const o = JSON.parse(JSON.stringify(this.all() || { ar: {}, en: {} }));
        if (o.ar) delete o.ar[key];
        if (o.en) delete o.en[key];
        cache.settings.textOverrides = o;
        cache.settings.text_overrides = o;
        window.SettingsAPI.save({ textOverrides: o });
        applyTextOverridesToRuntime();
        window.dispatchEvent(new Event("data-changed"));
      },
      editableKeys() { return window.EDITABLE_TEXTS || []; },
    };

    /* ===== SizeChartsAPI (جداول المقاسات) ===== */
    window.SizeChartsAPI = {
      get() {
        const charts = cache.settings.sizeCharts || cache.settings.size_charts;
        if (charts && Array.isArray(charts.gulf) && charts.gulf.length > 0
            && charts.gulf.every(r => r.sleeve !== undefined)) {
          return charts;
        }
        return (typeof window.defaultSizeCharts === "function") ? window.defaultSizeCharts() : (charts || {});
      },
      save(patch) {
        const merged = { ...this.get(), ...patch };
        cache.settings.sizeCharts = merged;
        cache.settings.size_charts = merged;
        window.SettingsAPI.save({ sizeCharts: merged });
        window.dispatchEvent(new Event("data-changed"));
        return merged;
      },
    };

    /* ===== Customers (للزبائن) ===== */
    window.CustomersAPI = {
      list() { return []; }, /* لا نسمح بقراءة قائمة الزبائن من client */
      async findByPhone(phone) {
        const p = String(phone || "").replace(/\D/g, "");
        if (!p) return null;
        const { data } = await supabase.from("customers").select("*").eq("phone", p).maybeSingle();
        return data;
      },
      async register({ name, phone, password }) {
        if (!name || !phone || !password) return { ok: false, reason: "missing_fields" };
        if (String(password).length < 4) return { ok: false, reason: "weak_password" };
        const existing = await this.findByPhone(phone);
        if (existing) return { ok: false, reason: "phone_exists" };
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
        const { data } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
        return data;
      },
    };

    /* ===== ضغط الصورة في المتصفح قبل الرفع =====
       يصغّر الأبعاد ويحوّل لـ JPEG لتقليل الحجم كثيراً، فيصبح الرفع
       أسرع وأنجح على الاتصالات الضعيفة (يتفادى "Failed to fetch"). */
    async function compressImage(file, maxDim, quality) {
      try {
        if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/gif") return file;
        const dataUrl = await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
        });
        const img = await new Promise((res, rej) => {
          const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl;
        });
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        if (scale >= 1 && file.size < 700 * 1024) return file; /* صغيرة أصلاً */
        w = Math.round(w * scale); h = Math.round(h * scale);
        const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
        if (!blob || blob.size >= file.size) return file; /* لا فائدة من الضغط */
        return new File([blob], (file.name || "image").replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      } catch (_) { return file; }
    }

    /* ===== رفع الصور إلى Storage (مع ضغط وإعادة محاولة) ===== */
    window.uploadToStorage = async function (bucket, file, path) {
      file = await compressImage(file, 1400, 0.82);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const filename = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      let lastErr;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { data, error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: true, contentType: file.type });
          if (error) { lastErr = error; continue; }
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
          return publicUrl;
        } catch (e) { lastErr = e; }
      }
      throw lastErr || new Error("upload failed");
    };

    /* ===== إعادة جلب البيانات من جديد (تحديث تلقائي) =====
       تُعيد تحميل الجداول الأساسية إلى نفس كائن الـ cache ثم تُطلق
       'data-changed' فتُعيد الصفحة الرسم. تُستدعى عند عودة التبويب
       للظهور حتى تظهر الإضافات الجديدة دون إعادة تحميل يدوية. */
    let _refreshing = false;
    let _lastRefresh = 0;
    async function refreshCache() {
      if (_refreshing) return;
      if (Date.now() - _lastRefresh < 4000) return; /* throttle */
      _refreshing = true;
      try {
        const [
          productsRes, ordersRes, categoriesRes, citiesRes,
          fabricsRes, cutsRes, couponsRes, reviewsRes,
          banksRes, settingsRes,
        ] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("categories").select("*").order("sort", { ascending: true }),
          supabase.from("cities").select("*"),
          supabase.from("fabrics").select("*"),
          supabase.from("cuts").select("*"),
          supabase.from("coupons").select("*"),
          supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false }),
          supabase.from("bank_accounts").select("*").eq("active", true),
          supabase.from("store_settings").select("*").eq("id", 1).single(),
        ]);
        /* لا نكتب فوق الـ cache إذا فشل الجلب (تفادي مسح البيانات) */
        if (productsRes.data)   cache.products   = productsRes.data.map(mapProductFromDB);
        if (ordersRes.data)     cache.orders     = ordersRes.data.map(mapOrderFromDB);
        if (categoriesRes.data) cache.categories = categoriesRes.data;
        if (citiesRes.data)     cache.cities     = citiesRes.data;
        if (fabricsRes.data)    cache.fabrics    = fabricsRes.data;
        if (cutsRes.data)       cache.cuts       = cutsRes.data;
        if (couponsRes.data)    cache.coupons    = couponsRes.data;
        if (reviewsRes.data)    cache.reviews    = reviewsRes.data;
        if (banksRes.data)    { cache.banks = banksRes.data; cache.settings.bankAccounts = cache.banks; }
        if (settingsRes.data) {
          const keep = cache.settings.bankAccounts;
          cache.settings = settingsRes.data;
          cache.settings.bankAccounts = keep;
          normalizeSettings();
          applyTextOverridesToRuntime();
        }
        _lastRefresh = Date.now();
        window.dispatchEvent(new Event("data-changed"));
      } catch (e) {
        console.warn("[Supabase] فشل التحديث التلقائي:", e);
      } finally {
        _refreshing = false;
      }
    }
    window.refreshSupabaseCache = refreshCache;

    /* ===== تحديث الكود تلقائياً عند نشر نسخة جديدة =====
       يقارن نسخة السكربت المحمّلة حالياً بالنسخة المعلنة على الخادم،
       فإذا نُشرت نسخة أحدث يعيد تحميل الصفحة مرة واحدة تلقائياً. هذا
       يمنع بقاء التبويبات/التطبيقات القديمة تعمل بكود قديم. */
    let _reloadedForVersion = false;
    function currentLoadedVersion() {
      try {
        const s = document.querySelector('script[src*="data-supabase.js"]');
        return s ? (new URL(s.src)).searchParams.get("v") : null;
      } catch (_) { return null; }
    }
    async function checkForNewVersion() {
      if (_reloadedForVersion) return;
      try {
        const mine = currentLoadedVersion();
        if (!mine) return;
        const res = await fetch(location.pathname + "?_vc=" + Date.now(), { cache: "no-store" });
        if (!res.ok) return;
        const html = await res.text();
        const m = html.match(/data-supabase\.js\?v=([A-Za-z0-9._-]+)/);
        const latest = m ? m[1] : null;
        if (latest && latest !== mine) {
          _reloadedForVersion = true;
          location.reload();
        }
      } catch (_) {}
    }
    window.checkForNewVersion = checkForNewVersion;

    /* ===== علامة «النشر» من لوحة التحكم =====
       عند ضغط المالكة على زر «نشر التحديثات» تتغيّر علامة النشر في
       قاعدة البيانات. هنا نقارنها بآخر علامة رآها هذا الجهاز، فإذا
       تغيّرت نُعيد تحميل الصفحة مرة واحدة لجلب كل جديد (محتوى وكود)
       دون أي حاجة لمسح ذاكرة المتصفح. */
    const PUBLISH_SEEN_KEY = "amal_publish_seen";
    function readPublishMarkerFromCache() {
      try {
        const s = cache.settings || {};
        const info = s.siteInfo || s.site_info;
        return info && info.__publishedAt != null ? String(info.__publishedAt) : null;
      } catch (_) { return null; }
    }
    /* خط الأساس عند التحميل: سجّل العلامة الحالية دون إعادة تحميل
       (التحميل الطازج يحتوي أصلاً على آخر نسخة). */
    try {
      const baseline = readPublishMarkerFromCache();
      if (baseline != null) localStorage.setItem(PUBLISH_SEEN_KEY, baseline);
    } catch (_) {}
    async function checkPublishMarker() {
      try {
        const { data } = await supabase.from("store_settings").select("site_info").eq("id", 1).single();
        const server = data && data.site_info && data.site_info.__publishedAt != null
          ? String(data.site_info.__publishedAt) : null;
        if (server == null) return;
        let seen = null;
        try { seen = localStorage.getItem(PUBLISH_SEEN_KEY); } catch (_) {}
        if (seen == null) { try { localStorage.setItem(PUBLISH_SEEN_KEY, server); } catch (_) {} return; }
        if (server !== seen) {
          try { localStorage.setItem(PUBLISH_SEEN_KEY, server); } catch (_) {}
          location.reload();
        }
      } catch (_) {}
    }
    window.checkPublishMarker = checkPublishMarker;

    /* حدّث البيانات + افحص النسخة وعلامة النشر عند عودة التبويب للظهور */
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") { checkForNewVersion(); checkPublishMarker(); refreshCache(); }
    });
    window.addEventListener("focus", () => { checkForNewVersion(); checkPublishMarker(); refreshCache(); });
    window.addEventListener("online", () => { checkPublishMarker(); refreshCache(); });

    /* ===== جاهز ===== */
    window.supabaseReady = true;
    window.dispatchEvent(new Event("data-ready"));
  }

  /* ===== Mappers ===== */
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
      price: Number(p.price || 0),
      discount: Number(p.discount || 0),
      is_open:        !!p.isOpen,
      is_embroidered: !!p.isEmbroidered,
      is_bestseller:  !!p.isBestseller,
      is_new:         !!p.isNew,
      colors: p.colors || [],
      sizes:  p.sizes  || [],
      stock:  p.stock  || {},
    };
  }
  function mapOrderFromDB(o) {
    return {
      id: o.id,
      createdAt: o.created_at,
      status: o.status,
      customer: {
        name: o.customer_name, phone: o.customer_phone,
        area: o.customer_area, notes: o.customer_notes,
      },
      cityId: o.city_id, cityName: o.city_name,
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

  async function hashPassword(password) {
    const enc = new TextEncoder().encode("amal_salt_v1:" + password);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  async function verifyPassword(password, hash) {
    return (await hashPassword(password)) === hash;
  }
})();
