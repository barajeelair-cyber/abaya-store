/* =========================================================
   عبايات أمل  —  منطق لوحة الإدارة
   ========================================================= */

/* =====================================================
   تسجيل الدخول
===================================================== */
const $loginScreen = document.getElementById("loginScreen");
const $appShell    = document.getElementById("appShell");
const $loginForm   = document.getElementById("loginForm");
const $loginError  = document.getElementById("loginError");

function showLogin() { $loginScreen.style.display = "flex"; $appShell.style.display = "none"; }
function showApp()   { $loginScreen.style.display = "none"; $appShell.style.display = "grid"; bootApp(); }

/* بدأ بإظهار شاشة الدخول دائماً  —  سنبدّلها بالتطبيق الكامل في نهاية
   الملف بعد أن تكون كل الـ const declarations قد عُيّنت (تجنّب TDZ). */
showLogin();

$loginForm.onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData($loginForm);
  const remember = f.get("remember") === "on";
  if (AuthAPI.login(f.get("username"), f.get("password"), remember)) {
    $loginError.textContent = "";
    showApp();
  } else {
    $loginError.textContent = t("admin.login.error");
  }
};
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  AuthAPI.logout(); location.reload();
});

/* =====================================================
   زر «نشر التحديثات للجميع»
   يضع علامة نشر جديدة في قاعدة البيانات، فتلتقطها كل الأجهزة في كل
   الدول وتُحدّث نفسها تلقائياً عند فتح المتجر أو العودة إليه — دون
   الحاجة لمسح ذاكرة المتصفح.
===================================================== */
document.getElementById("publishBtn")?.addEventListener("click", async () => {
  const btn = document.getElementById("publishBtn");
  const original = btn.innerHTML;
  btn.disabled = true; btn.style.opacity = ".7"; btn.innerHTML = "⏳ جاري النشر...";
  try {
    const now = Date.now();
    if (window.supabaseClient) {
      /* اقرأ site_info الحالي وادمج علامة النشر دون المساس بأي محتوى */
      const { data, error: rerr } = await window.supabaseClient
        .from("store_settings").select("site_info").eq("id", 1).single();
      if (rerr) throw rerr;
      const info = (data && data.site_info) || {};
      info.__publishedAt = now;
      const { error } = await window.supabaseClient
        .from("store_settings").update({ site_info: info }).eq("id", 1);
      if (error) throw error;
      try { localStorage.setItem("amal_publish_seen", String(now)); } catch (_) {}
    } else if (window.SiteInfoAPI?.update) {
      window.SiteInfoAPI.update({ __publishedAt: now });
    } else {
      throw new Error("no backend");
    }
    btn.innerHTML = "✅ تم النشر للجميع";
    if (typeof showToast === "function")
      showToast("تم نشر التحديثات — ستظهر على كل الأجهزة خلال لحظات ✓");
    setTimeout(() => { btn.innerHTML = original; btn.disabled = false; btn.style.opacity = "1"; }, 2600);
  } catch (e) {
    console.error("[publish]", e);
    btn.innerHTML = original; btn.disabled = false; btn.style.opacity = "1";
    if (typeof showToast === "function") showToast("تعذّر النشر، حاولي المحاولة مجدداً");
  }
});

/* =====================================================
   PWA  —  تسجيل Service Worker وزر التثبيت
===================================================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(err => console.warn("SW reg failed:", err));
  });

  /* عند تفعيل SW جديد، أعِد تحميل الصفحة لتجلب نسخة JS/CSS طازجة */
  let swReloadOnce = false;
  navigator.serviceWorker.addEventListener("message", (e) => {
    if (e.data?.type === "sw-updated" && !swReloadOnce) {
      swReloadOnce = true;
      location.reload();
    }
  });
}

let deferredPwaPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  document.getElementById("installBtnAdmin")?.style.setProperty("display", "block");
});
window.addEventListener("appinstalled", () => {
  deferredPwaPrompt = null;
  showToast(t("pwa.installed"));
});

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

document.getElementById("installBtnAdmin")?.addEventListener("click", async () => {
  if (isStandalone()) { showToast(t("pwa.installed")); return; }
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    const { outcome } = await deferredPwaPrompt.userChoice;
    if (outcome === "accepted") {
      document.getElementById("installBtnAdmin").style.display = "none";
    }
    deferredPwaPrompt = null;
  } else {
    document.getElementById("iosInstallModal").classList.add("open");
  }
});
document.getElementById("iosInstallClose")?.addEventListener("click", () => {
  document.getElementById("iosInstallModal").classList.remove("open");
});

if (isStandalone()) {
  const btn = document.getElementById("installBtnAdmin");
  if (btn) btn.style.display = "none";
}

/* =====================================================
   إقلاع الواجهة بعد الدخول
===================================================== */
function bootApp() {
  applyTranslations();
  fillCategorySelects();
  fillFilters();
  refreshAll();
  applyContactSettings();
  setupHeroBgControls();
  renderBanksList();
  renderCouponsList();
  renderCategoriesAdmin();
  renderCitiesAdmin();
  renderFabricsAdmin();
  renderCutsAdmin();
  renderReviewsAdmin();
  renderSiteInfoEditor();
  renderSizeChartsEditor();
  renderTextsEditor();
  updateLangButtons();
}

/* تبديل اللغة */
function updateLangButtons() {
  const label = getLang() === "ar" ? "English" : "العربية";
  ["langToggleLogin", "langToggleAdmin"].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.textContent = label;
  });
}
function toggleLang() {
  const next = getLang() === "ar" ? "en" : "ar";
  setLang(next);
  applyTranslations();
  updateLangButtons();
  if ($appShell.style.display !== "none") {
    fillCategorySelects();
    fillFilters();
    refreshAll();
    applyContactSettings();
    renderBanksList();
    renderCouponsList();
    renderCategoriesAdmin();
    renderCitiesAdmin();
    renderTextsEditor();
  }
}
document.getElementById("langToggleLogin")?.addEventListener("click", toggleLang);
document.getElementById("langToggleAdmin")?.addEventListener("click", toggleLang);

/* تطبيق الترجمة في شاشة الدخول قبل الإقلاع */
applyTranslations();
updateLangButtons();

/* تنقل الصفحات */
document.querySelectorAll(".menu-item[data-page]").forEach(b =>
  b.addEventListener("click", () => gotoPage(b.dataset.page))
);
document.querySelectorAll("[data-goto]").forEach(b =>
  b.addEventListener("click", () => gotoPage(b.dataset.goto))
);
function gotoPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === "page-" + name));
  document.querySelectorAll(".menu-item[data-page]").forEach(m => m.classList.toggle("active", m.dataset.page === name));
}

const $toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  $toast.textContent = msg; $toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("show"), 2200);
}

/* تنبيه الأدمن عند فشل أي حفظ على الخادم (بدل الفشل الصامت) */
let lastWriteErrAt = 0;
window.addEventListener("data-write-error", () => {
  /* امنع تكرار الرسائل المتلاحقة */
  const now = Date.now();
  if (now - lastWriteErrAt < 3000) return;
  lastWriteErrAt = now;
  showToast(getLang() === "en"
    ? "⚠️ A change could not be saved to the server. Check your connection and retry."
    : "⚠️ تعذّر حفظ التغيير على الخادم. تحقّقي من الاتصال وأعيدي المحاولة.");
});

/* تنبيه الأدمن أن التطبيق يعمل ببيانات غير متصلة */
window.addEventListener("data-offline", () => {
  showToast(getLang() === "en"
    ? "⚠️ Working offline — changes may not be saved to the server."
    : "⚠️ تعملين دون اتصال — قد لا تُحفظ التغييرات على الخادم.");
});

/* =====================================================
   Dashboard
===================================================== */
function isToday(iso) {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear()
      && d.getMonth()    === n.getMonth()
      && d.getDate()     === n.getDate();
}

function renderDateDisplay() {
  const d = new Date();
  const locale = getLang() === "ar" ? "ar-EG" : "en-US";
  const txt = d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  ["dateDisplay", "dateDisplayDelivery", "dateDisplayCustomers"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  });
}

function renderStats() {
  const products = ProductsAPI.list();
  const orders   = OrdersAPI.list();
  const lowStock = products.filter(p => {
    const t = ProductsAPI.totalStock(p);
    return t > 0 && t <= LOW_STOCK_THRESHOLD;
  }).length;
  const awaiting = orders.filter(o => o.status === "awaiting").length;
  const pending  = orders.filter(o => o.status === "pending").length;

  const todaysOrders = orders.filter(o => isToday(o.createdAt));
  const todayCount = todaysOrders.length;
  const todaySales = todaysOrders
    .filter(o => o.status !== "cancelled")
    .reduce((s, o) => s + (o.total || 0), 0);

  document.getElementById("statsRow").innerHTML = `
    <div class="stat">
      <div class="label">${t("admin.stat.today_orders")}</div>
      <div class="value">${todayCount}</div>
      <div class="hint">${todayCount ? todayCount + " " + t("admin.stat.today_orders_hint") : t("admin.stat.today_orders_none")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.stat.today_sales")}</div>
      <div class="value">${Utils.fmt(todaySales)}</div>
      <div class="hint">${t("admin.stat.today_sales_hint")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.stat.total_products")}</div>
      <div class="value">${products.length}</div>
      <div class="hint">${products.length ? t("admin.stat.products_in_catalog") : t("admin.stat.products_none")}</div>
    </div>
    <div class="stat ${lowStock ? "danger" : ""}">
      <div class="label">${t("admin.stat.stock_alert")}</div>
      <div class="value">${lowStock}</div>
      <div class="hint">${lowStock ? t("admin.stat.stock_alert_hint") : t("admin.stat.stock_ok")}</div>
    </div>`;

  /* شارات */
  const lowBadge  = document.getElementById("lowStockBadge");
  const pendBadge = document.getElementById("pendingBadge");
  const totalAlert = awaiting + pending;
  if (lowStock > 0)   { lowBadge.style.display  = "inline-block"; lowBadge.textContent  = lowStock; }
  else lowBadge.style.display = "none";
  if (totalAlert > 0) { pendBadge.style.display = "inline-block"; pendBadge.textContent = totalAlert; }
  else pendBadge.style.display = "none";

  /* عداد الطلبات في رأس البانل */
  const ordersCountDash = document.getElementById("ordersCountDash");
  if (ordersCountDash) ordersCountDash.textContent = orders.length;
}

function renderCityStats() {
  const orders = OrdersAPI.list();
  const map = {};
  orders.forEach(o => {
    if (!map[o.cityId]) map[o.cityId] = { cityId: o.cityId, count: 0, total: 0 };
    map[o.cityId].count++;
    if (o.status !== "cancelled") map[o.cityId].total += (o.total || 0);
  });
  const rows = Object.values(map).sort((a, b) => b.count - a.count);
  document.getElementById("cityStatsBody").innerHTML = rows.length
    ? rows.map(r => `<tr><td>${escapeHtml(Utils.cityById(r.cityId)?.name || r.cityId)}</td><td>${r.count}</td><td>${Utils.fmt(r.total)}</td></tr>`).join("")
    : `<tr><td colspan="3" style="text-align:center; color:var(--muted)">${t("admin.dash.no_orders")}</td></tr>`;
}

function orderCode(id) { return "AMA-" + String(id).slice(-6).toUpperCase(); }
function itemsCount(o)  { return o.items.reduce((n, it) => n + it.qty, 0); }

function renderRecentOrders() {
  const recent = OrdersAPI.list().slice(0, 6);
  document.getElementById("recentOrders").innerHTML = recent.length
    ? recent.map(o => `
        <tr data-id="${o.id}" style="cursor:pointer;">
          <td><span class="order-code">${orderCode(o.id)}</span></td>
          <td>
            <div class="cust-name">${escapeHtml(o.customer.name)}</div>
            <div class="cust-sub" dir="ltr">${escapeHtml(o.customer.phone)}</div>
          </td>
          <td>${escapeHtml(Utils.cityById(o.cityId)?.name || o.cityName)}</td>
          <td>${itemsCount(o)}</td>
          <td>${Utils.fmt(o.total)}</td>
          <td><span class="pill ${o.status}">${Utils.statusInfo(o.status).label}</span></td>
        </tr>`).join("")
    : `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:20px;">${t("admin.dash.no_orders")}</td></tr>`;

  document.querySelectorAll("#recentOrders tr[data-id]").forEach(tr => {
    tr.onclick = () => openOrderModal(tr.dataset.id);
  });
}

/* =====================================================
   المنتجات
===================================================== */
const $productModal = document.getElementById("productModal");
const $productForm  = document.getElementById("productForm");
const $productTitle = document.getElementById("productModalTitle");
const $searchInput  = document.getElementById("searchProducts");
const $filterCat    = document.getElementById("filterCategory");
const $colorsCont   = document.getElementById("colorsContainer");
const $stockGrid    = document.getElementById("stockGrid");

function fillCategorySelects() {
  let cats = CategoriesAPI.list().filter(c => c.active !== false);
  if (cats.length === 0) {
    CategoriesAPI.save({ name_ar: "عام", name_en: "General", active: true });
    cats = CategoriesAPI.list().filter(c => c.active !== false);
  }
  const lang = getLang();
  const opts = cats.map(c => {
    const name = (lang === "en" && c.name_en) ? c.name_en : c.name_ar;
    return `<option value="${c.id}">${escapeHtml(name)}</option>`;
  }).join("");
  const formCat = document.getElementById("formCategory");
  if (formCat) formCat.innerHTML = opts;
  if ($filterCat) $filterCat.innerHTML = `<option value="">${t("admin.products.all_categories")}</option>` + opts;
  /* مربعات اختيار التصنيفات المتعددة في نموذج المنتج */
  const catsBox = document.getElementById("formCategoriesBox");
  if (catsBox) {
    catsBox.innerHTML = cats.map(c => {
      const name = (lang === "en" && c.name_en) ? c.name_en : c.name_ar;
      return `<label style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border:1px solid var(--line); border-radius:999px; cursor:pointer; font-size:13px;">
        <input type="checkbox" class="form-cat-cb" value="${escapeAttr(c.id)}"> ${escapeHtml(name)}
      </label>`;
    }).join("");
  }

  /* أيضاً عبّئ select الأقمشة والقَصّات من القائمة الفعلية (Supabase)
     بدل القائمة الافتراضية الثابتة، حتى تظهر كل الأقمشة/القصات التي
     تديرها المالكة وتُحفظ/تُعرض بشكل صحيح عند تعديل المنتج. */
  const fabricSel = document.getElementById("formFabric");
  if (fabricSel) {
    const fabs = (window.FabricsAPI && window.FabricsAPI.list && window.FabricsAPI.list().length)
      ? window.FabricsAPI.list() : DEFAULT_FABRICS;
    fabricSel.innerHTML = `<option value="">—</option>` + fabs.map(f => {
      const name = (lang === "en" && f.name_en) ? f.name_en
        : (f.name_ar || f.name_en || t("fabric." + f.id));
      return `<option value="${f.id}">${escapeHtml(name)}</option>`;
    }).join("");
  }
  const cutSel = document.getElementById("formCut");
  if (cutSel) {
    const cuts = (window.CutsAPI && window.CutsAPI.list && window.CutsAPI.list().length)
      ? window.CutsAPI.list() : DEFAULT_CUTS;
    cutSel.innerHTML = `<option value="">—</option>` + cuts.map(c => {
      const name = (lang === "en" && c.name_en) ? c.name_en
        : (c.name_ar || c.name_en || t("cut." + c.id));
      return `<option value="${c.id}">${escapeHtml(name)}</option>`;
    }).join("");
  }
}

let workingColors = []; /* في وقت تحرير المنتج */
let workingSizes  = [];

function colorBlockHTML(idx, c) {
  const images = Array.isArray(c.images) ? c.images : (c.image ? [c.image] : []);
  const previews = images.map((src, i) => `
    <div class="color-image-thumb">
      <img src="${escapeAttr(src)}" alt="">
      <button type="button" class="rm" data-act="remove-image" data-img-idx="${i}">✕</button>
    </div>`).join("");

  return `
    <div class="color-block" data-idx="${idx}">
      <div class="row">
        <input class="color-name" type="text" placeholder="اسم اللون (مثال: أسود)"
               value="${escapeAttr(c.name || "")}" />
        <button type="button" class="icon-btn-sm danger" data-act="remove-color">حذف</button>
      </div>
      <div class="color-images-grid">${previews}</div>
      <label class="dropzone" data-idx="${idx}">
        <input type="file" accept="image/*" multiple />
        <div class="uz-icon">📁</div>
        <div>${images.length ? "أضيفي صوراً أخرى" : "اسحبي صوراً هنا أو انقري للاختيار (يمكن متعددة)"}</div>
        <div style="font-size:12px; margin-top:4px;">PNG / JPG  —  حتى 10 ميجا لكل صورة</div>
      </label>
    </div>`;
}

function renderColors() {
  $colorsCont.innerHTML = workingColors.length
    ? workingColors.map((c, i) => colorBlockHTML(i, c)).join("")
    : `<p style="color:var(--muted); font-size:13px; margin:0;">لا توجد ألوان مضافة بعد.</p>`;

  /* اسم اللون */
  $colorsCont.querySelectorAll(".color-name").forEach((input) => {
    input.oninput = () => {
      const idx = +input.closest(".color-block").dataset.idx;
      workingColors[idx].name = input.value.trim();
      renderStockGrid();
    };
  });

  /* حذف اللون */
  $colorsCont.querySelectorAll('[data-act="remove-color"]').forEach((btn) => {
    btn.onclick = () => {
      const idx = +btn.closest(".color-block").dataset.idx;
      workingColors.splice(idx, 1);
      renderColors();
      renderStockGrid();
    };
  });

  /* رفع الصور (drag + click)  —  يدعم متعددة */
  $colorsCont.querySelectorAll(".dropzone").forEach((zone) => {
    const idx = +zone.dataset.idx;
    const fileInput = zone.querySelector("input[type=file]");
    fileInput.onchange = (e) => handleImageFiles(idx, e.target.files);

    ["dragover", "dragenter"].forEach(evt =>
      zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.add("dragover"); })
    );
    ["dragleave", "drop"].forEach(evt =>
      zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.remove("dragover"); })
    );
    zone.addEventListener("drop", e => {
      const fs = e.dataTransfer.files;
      if (fs && fs.length) handleImageFiles(idx, fs);
    });
  });

  /* حذف صورة واحدة (داخل grid معاينات اللون) */
  $colorsCont.querySelectorAll('[data-act="remove-image"]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const colorIdx = +btn.closest(".color-block").dataset.idx;
      const imgIdx = +btn.dataset.imgIdx;
      if (!Array.isArray(workingColors[colorIdx].images)) {
        workingColors[colorIdx].images = workingColors[colorIdx].image ? [workingColors[colorIdx].image] : [];
      }
      workingColors[colorIdx].images.splice(imgIdx, 1);
      delete workingColors[colorIdx].image;  /* تخلّص من الحقل القديم */
      renderColors();
    };
  });
}

async function handleImageFiles(idx, files) {
  if (!files || files.length === 0) return;
  if (!Array.isArray(workingColors[idx].images)) {
    workingColors[idx].images = workingColors[idx].image ? [workingColors[idx].image] : [];
    delete workingColors[idx].image;
  }
  const useStorage = !!(window.uploadToStorage && window.AMAL_CONFIG?.BUCKET_PRODUCTS);
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { showToast(t("admin.product.image_too_big")); continue; }
    try {
      if (useStorage) {
        /* رفع إلى Supabase Storage  —  يخزّن URL قصير في DB بدل base64 */
        showToast("⏳ جاري رفع الصورة...");
        const url = await window.uploadToStorage(window.AMAL_CONFIG.BUCKET_PRODUCTS, file);
        workingColors[idx].images.push(url);
        showToast("✓ تم رفع الصورة");
      } else {
        /* localStorage fallback - base64 */
        const dataUrl = await Utils.fileToDataURL(file);
        workingColors[idx].images.push(dataUrl);
      }
    } catch (err) {
      console.error("[image upload]", err);
      showToast("فشل رفع الصورة: " + (err.message || err));
    }
  }
  renderColors();
}

/* shim للتوافق مع أي استدعاء قديم */
async function handleImageFile(idx, file) {
  if (file) await handleImageFiles(idx, [file]);
}

document.getElementById("addColorBtn").onclick = () => {
  workingColors.push({ name: "", image: "" });
  renderColors();
  renderStockGrid();
};

document.getElementById("sizesInput").oninput = (e) => {
  workingSizes = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
  renderStockGrid();
};
document.getElementById("rebuildStockBtn").onclick = renderStockGrid;

let workingStock = {}; /* { "لون|مقاس": عدد } */

function renderStockGrid() {
  if (workingColors.length === 0 || workingSizes.length === 0) {
    $stockGrid.innerHTML = `<tr><td style="text-align:center; color:var(--muted); padding:14px;">
      أضيفي ألواناً ومقاسات لعرض جدول المخزون.</td></tr>`;
    return;
  }
  const header = `<tr><th>اللون \\ المقاس</th>${workingSizes.map(sz => `<th>${escapeHtml(sz)}</th>`).join("")}</tr>`;
  const rows = workingColors.map(c => {
    const cells = workingSizes.map(sz => {
      const key = `${c.name}|${sz}`;
      const val = workingStock[key] ?? 0;
      return `<td><input type="number" min="0" step="1" value="${val}" data-key="${escapeAttr(key)}"></td>`;
    }).join("");
    return `<tr><th>${escapeHtml(c.name || "—")}</th>${cells}</tr>`;
  }).join("");
  $stockGrid.innerHTML = header + rows;

  $stockGrid.querySelectorAll("input").forEach(inp => {
    inp.oninput = () => {
      workingStock[inp.dataset.key] = Math.max(0, Number(inp.value) || 0);
    };
  });
}

document.getElementById("addProductBtn").onclick = () => openProductModal(null);
document.getElementById("cancelProduct").onclick = () => $productModal.classList.remove("open");

/* تحديد/قراءة التصنيفات المتعددة في نموذج المنتج */
function setFormCategories(ids) {
  const set = new Set(ids || []);
  document.querySelectorAll("#formCategoriesBox .form-cat-cb").forEach(cb => { cb.checked = set.has(cb.value); });
}
function getFormCategories() {
  return [...document.querySelectorAll("#formCategoriesBox .form-cat-cb:checked")].map(cb => cb.value);
}

function openProductModal(product) {
  /* تأكد دائماً أن قائمة التصنيفات محدّثة قبل فتح المودال */
  fillCategorySelects();
  $productForm.reset();
  if (product) {
    $productTitle.textContent = t("admin.product.edit_title");
    $productForm.id.value          = product.id;
    $productForm.name.value         = product.name;
    setFormCategories((product.categories && product.categories.length)
      ? product.categories : (product.category ? [product.category] : []));
    $productForm.price.value        = product.price;
    $productForm.discount.value     = product.discount || 0;
    $productForm.description.value  = product.description || "";
    $productForm.sizes.value        = (product.sizes || []).join(", ");
    if ($productForm.fabric) $productForm.fabric.value = product.fabric || "";
    if ($productForm.cut)    $productForm.cut.value    = product.cut    || "";
    if ($productForm.isOpen)         $productForm.isOpen.checked         = !!product.isOpen;
    if ($productForm.isEmbroidered)  $productForm.isEmbroidered.checked  = !!product.isEmbroidered;
    if ($productForm.isBestseller)   $productForm.isBestseller.checked   = !!product.isBestseller;
    if ($productForm.isNew)          $productForm.isNew.checked          = !!product.isNew;
    /* صيغة جديدة للألوان: نضمن أن لكل لون مصفوفة .images */
    workingColors = (product.colors || []).map(c => ({
      name: c.name,
      images: Array.isArray(c.images) && c.images.length
                ? c.images.slice()
                : (c.image ? [c.image] : []),
    }));
    workingSizes  = (product.sizes || []).slice();
    workingStock  = Object.assign({}, product.stock || {});
  } else {
    $productTitle.textContent = t("admin.product.add_title");
    $productForm.id.value = "";
    /* منتج جديد: فعّل أول تصنيف افتراضياً */
    const firstCb = document.querySelector("#formCategoriesBox .form-cat-cb");
    setFormCategories(firstCb ? [firstCb.value] : []);
    workingColors = [];
    workingSizes  = [];
    workingStock  = {};
  }
  renderColors();
  renderStockGrid();
  $productModal.classList.add("open");
}

$productForm.onsubmit = (e) => {
  e.preventDefault();
  const f = $productForm;

  /* تحقق */
  if (!f.name.value.trim()) { showToast(getLang() === "en" ? "Enter product name" : "اكتبي اسم المنتج"); return; }
  const selectedCats = getFormCategories();
  if (selectedCats.length === 0) { showToast(getLang() === "en" ? "Select at least one category" : "اختاري تصنيفاً واحداً على الأقل"); return; }
  if (!f.price.value || Number(f.price.value) <= 0) { showToast(getLang() === "en" ? "Enter a valid price" : "اكتبي سعراً صحيحاً"); return; }
  if (workingColors.length === 0) { showToast(t("admin.product.need_color")); return; }
  if (workingColors.some(c => !c.name)) { showToast(t("admin.product.need_color_names")); return; }
  /* تحقق أن لكل لون صورة واحدة على الأقل (في الصيغة الجديدة .images أو القديمة .image) */
  if (workingColors.some(c => {
    const imgs = Array.isArray(c.images) ? c.images : (c.image ? [c.image] : []);
    return imgs.length === 0;
  })) { showToast(t("admin.product.need_color_images")); return; }
  if (workingSizes.length === 0) { showToast(t("admin.product.need_sizes")); return; }

  /* نظّف المخزون من تركيبات قديمة لم تعد موجودة */
  const cleanStock = {};
  workingColors.forEach(c => workingSizes.forEach(sz => {
    const k = `${c.name}|${sz}`;
    cleanStock[k] = Number(workingStock[k] || 0);
  }));

  /* طبّع الألوان: حوّل الصيغة القديمة .image إلى .images[]  */
  const normalizedColors = workingColors.map(c => ({
    name: c.name,
    images: Array.isArray(c.images) ? c.images.slice() : (c.image ? [c.image] : []),
  }));

  const product = {
    id: f.id.value || undefined,
    name: f.name.value.trim(),
    categories: selectedCats,
    category: selectedCats[0],
    fabric: (f.fabric && f.fabric.value) || "",
    cut:    (f.cut    && f.cut.value)    || "",
    isOpen:        !!(f.isOpen && f.isOpen.checked),
    isEmbroidered: !!(f.isEmbroidered && f.isEmbroidered.checked),
    isBestseller:  !!(f.isBestseller && f.isBestseller.checked),
    isNew:         !!(f.isNew && f.isNew.checked),
    price: Number(f.price.value),
    discount: Math.max(0, Math.min(90, Number(f.discount.value) || 0)),
    description: f.description.value.trim(),
    colors: normalizedColors,
    sizes:  workingSizes,
    stock:  cleanStock,
  };
  try {
    ProductsAPI.save(product);
  } catch (err) {
    /* عادةً QuotaExceededError من localStorage عندما تكون الصور كبيرة جداً */
    const msg = getLang() === "en"
      ? "Saving failed — images may be too large. Try smaller images (<1 MB each)."
      : "فشل الحفظ - الصور قد تكون كبيرة جداً. جرّبي صوراً أصغر (<1 ميجا للصورة).";
    showToast(msg);
    console.error("ProductsAPI.save error:", err);
    return;
  }
  $productModal.classList.remove("open");
  showToast(product.id ? t("admin.product.updated") : t("admin.product.added"));
  refreshAll();
};

function renderProductsTable() {
  const q = ($searchInput.value || "").trim();
  const cat = $filterCat.value;
  let products = ProductsAPI.list();
  if (q)   products = products.filter(p => p.name.includes(q));
  if (cat) products = products.filter(p => p.category === cat);

  document.getElementById("productsTable").innerHTML = products.length
    ? products.map(p => {
        const total = ProductsAPI.totalStock(p);
        const cover = ProductsAPI.coverImage(p) || p.colors?.[0]?.image || "";
        const catName = Utils.categoryById(p.category)?.name || "—";
        return `
        <tr>
          <td><img class="thumb" src="${escapeAttr(cover)}" alt=""></td>
          <td>${escapeHtml(p.name)}<br><small style="color:var(--muted)">${escapeHtml(truncate(p.description, 50))}</small></td>
          <td>${escapeHtml(catName)}</td>
          <td>${Utils.fmt(p.price)}</td>
          <td>${p.discount ? p.discount + "%" : "—"}</td>
          <td>${(p.colors || []).map(c => escapeHtml(c.name)).join(" · ") || "—"}</td>
          <td>${stockPill(total)}</td>
          <td>
            <div class="actions">
              <button class="icon-btn-sm" data-act="edit" data-id="${p.id}">${getLang() === "ar" ? "تعديل" : "Edit"}</button>
              <button class="icon-btn-sm danger" data-act="del" data-id="${p.id}">${t("admin.delete")}</button>
            </div>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:30px;">${t("admin.products.none")}</td></tr>`;

  document.querySelectorAll("#productsTable button[data-act]").forEach(b => {
    b.onclick = () => {
      const p = ProductsAPI.get(b.dataset.id);
      if (b.dataset.act === "edit") openProductModal(p);
      else if (b.dataset.act === "del" && confirm((getLang() === "en" ? "Delete " : "حذف ") + `"${p.name}"؟`)) {
        ProductsAPI.remove(p.id);
        showToast(t("admin.product.deleted"));
        refreshAll();
      }
    };
  });
}
$searchInput.oninput = renderProductsTable;
$filterCat.onchange = renderProductsTable;

function stockPill(stock) {
  if (stock === 0) return `<span class="pill outstock">${t("admin.stock.out")}</span>`;
  if (stock <= LOW_STOCK_THRESHOLD) return `<span class="pill lowstock">${t("admin.stock.low")} (${stock})</span>`;
  return `<span class="pill ok">${stock}</span>`;
}

/* =====================================================
   المخزون (يعرض التركيبات لكل منتج منخفض)
===================================================== */
document.getElementById("threshold").textContent = LOW_STOCK_THRESHOLD;

function renderInventory() {
  const items = ProductsAPI.list()
    .filter(p => ProductsAPI.totalStock(p) <= LOW_STOCK_THRESHOLD);

  document.getElementById("inventoryTable").innerHTML = items.length
    ? items.map(p => {
        const total = ProductsAPI.totalStock(p);
        const variantsHtml = `
          <table class="stock-grid" style="margin-top:6px;">
            <tr><th>${t("admin.product.size_axis")}</th>${p.sizes.map(s => `<th>${escapeHtml(s)}</th>`).join("")}</tr>
            ${p.colors.map(c => `
              <tr>
                <th>${escapeHtml(c.name)}</th>
                ${p.sizes.map(s => {
                  const k = `${c.name}|${s}`;
                  const v = Number(p.stock[k] || 0);
                  return `<td><input type="number" min="0" value="${v}" data-pid="${p.id}" data-key="${escapeAttr(k)}" style="width:60px;"></td>`;
                }).join("")}
              </tr>`).join("")}
          </table>
          <button class="icon-btn-sm ok" data-save="${p.id}" style="margin-top:8px;">${t("admin.inv.save_changes")}</button>`;
        return `
          <tr>
            <td style="vertical-align:top;">
              <div style="display:flex; align-items:center; gap:10px;">
                <img class="thumb" src="${escapeAttr(ProductsAPI.coverImage(p) || p.colors?.[0]?.image || "")}" alt="">
                <div>${escapeHtml(p.name)}<br><small style="color:var(--muted)">${Utils.fmt(p.price)}</small></div>
              </div>
            </td>
            <td>${total}</td>
            <td>${stockPill(total)}</td>
            <td>${variantsHtml}</td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="4" style="text-align:center; color:var(--ok); padding:30px;">${t("admin.inv.all_good")}</td></tr>`;

  document.querySelectorAll("button[data-save]").forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.save;
      const p = ProductsAPI.get(pid);
      document.querySelectorAll(`input[data-pid="${pid}"]`).forEach(inp => {
        p.stock[inp.dataset.key] = Math.max(0, Number(inp.value) || 0);
      });
      ProductsAPI.save(p);
      showToast(t("admin.inv.updated"));
      refreshAll();
    };
  });
}

/* =====================================================
   الطلبات
===================================================== */
const $filterCity   = document.getElementById("filterCity");
const $filterStatus = document.getElementById("filterStatus");
const $orderModal   = document.getElementById("orderModal");
const $orderBody    = document.getElementById("orderModalBody");
const $orderStatus  = document.getElementById("orderStatusSelect");
const $verifyBtn    = document.getElementById("verifyPaymentBtn");
let currentOrderId = null;

function fillFilters() {
  const cities = CitiesAPI.list();
  const lang = getLang();
  const cityOpts = cities.map(c => {
    const name = (lang === "en" && c.name_en) ? c.name_en : c.name_ar;
    return `<option value="${c.id}">${escapeHtml(name)}</option>`;
  }).join("");
  $filterCity.innerHTML = `<option value="">${t("admin.orders.all_cities")}</option>` + cityOpts;
  $filterStatus.innerHTML = `<option value="">${t("admin.orders.all_statuses")}</option>` +
    ORDER_STATUSES.map(s => `<option value="${s.id}">${t("status." + s.id)}</option>`).join("");
  $orderStatus.innerHTML = ORDER_STATUSES.map(s => `<option value="${s.id}">${t("status." + s.id)}</option>`).join("");
}
$filterCity.onchange   = renderOrders;
$filterStatus.onchange = renderOrders;

function renderOrders() {
  const cityFilter   = $filterCity.value;
  const statusFilter = $filterStatus.value;
  const orders = OrdersAPI.list().filter(o =>
    (!cityFilter   || o.cityId === cityFilter) &&
    (!statusFilter || o.status === statusFilter)
  );
  document.getElementById("ordersCount").textContent = orders.length;
  document.getElementById("ordersTable").innerHTML = orders.length
    ? orders.map(o => `
        <tr>
          <td><span class="order-code">${orderCode(o.id)}</span></td>
          <td>
            <div class="cust-name">${escapeHtml(o.customer.name)}</div>
            <div class="cust-sub" dir="ltr">${escapeHtml(o.customer.phone)}</div>
          </td>
          <td dir="ltr" style="text-align:right;">${escapeHtml(o.customer.phone)}</td>
          <td>${escapeHtml(Utils.cityById(o.cityId)?.name || o.cityName)}</td>
          <td>${Utils.fmt(o.total)}</td>
          <td><span class="pill ${o.status}">${Utils.statusInfo(o.status).label}</span></td>
          <td>${Utils.formatDate(o.createdAt)}</td>
          <td><button class="icon-btn-sm" data-id="${o.id}">${t("admin.order.view")}</button></td>
        </tr>`).join("")
    : `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:30px;">${t("admin.orders.none")}</td></tr>`;

  document.querySelectorAll("#ordersTable button[data-id]").forEach(b =>
    b.onclick = () => openOrderModal(b.dataset.id)
  );
}

/* =====================================================
   التوصيل
===================================================== */
function renderDelivery() {
  const orders = OrdersAPI.list();
  const cityFilter = document.getElementById("deliveryCityFilter")?.value || "";

  /* فلترة على الطلبات المؤكدة فقط (ليست awaiting أو cancelled) */
  let delivOrders = orders.filter(o => o.status === "pending" || o.status === "shipped");
  if (cityFilter) delivOrders = delivOrders.filter(o => o.cityId === cityFilter);

  /* إحصاءات */
  const readyToShip = orders.filter(o => o.status === "pending").length;
  const inTransit   = orders.filter(o => o.status === "shipped").length;
  const delivered   = orders.filter(o => o.status === "delivered").length;
  const cityCount   = new Set(delivOrders.map(o => o.cityId)).size;

  document.getElementById("deliveryStats").innerHTML = `
    <div class="stat">
      <div class="label">${t("admin.delivery.ready_ship")}</div>
      <div class="value">${readyToShip}</div>
      <div class="hint">${t("status.pending")}</div>
    </div>
    <div class="stat warn">
      <div class="label">${t("admin.delivery.in_transit")}</div>
      <div class="value">${inTransit}</div>
      <div class="hint">${t("status.shipped")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.delivery.delivered")}</div>
      <div class="value">${delivered}</div>
      <div class="hint">${t("admin.delivery.completed")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.delivery.active_cities")}</div>
      <div class="value">${cityCount}</div>
      <div class="hint">${t("admin.delivery.in_shipment")}</div>
    </div>`;

  /* ملء قائمة المدن */
  const $dCity = document.getElementById("deliveryCityFilter");
  if ($dCity) {
    const curr = $dCity.value;
    const cities = CitiesAPI.list();
    const lang = getLang();
    $dCity.innerHTML = `<option value="">${t("admin.orders.all_cities")}</option>` +
      cities.map(c => {
        const name = (lang === "en" && c.name_en) ? c.name_en : c.name_ar;
        return `<option value="${c.id}">${escapeHtml(name)}</option>`;
      }).join("");
    $dCity.value = curr;
    $dCity.onchange = renderDelivery;
  }

  document.getElementById("deliveryTable").innerHTML = delivOrders.length
    ? delivOrders.map(o => {
        const nextStatus = o.status === "pending" ? "shipped" : "delivered";
        const nextLabel  = o.status === "pending" ? t("admin.delivery.ship_now") : t("admin.delivery.mark_delivered");
        return `
        <tr>
          <td><span class="order-code">${orderCode(o.id)}</span></td>
          <td>
            <div class="cust-name">${escapeHtml(o.customer.name)}</div>
            <div class="cust-sub" dir="ltr">${escapeHtml(o.customer.phone)}</div>
          </td>
          <td>${escapeHtml(Utils.cityById(o.cityId)?.name || o.cityName)}<br><small style="color:var(--muted)">${escapeHtml(o.customer.area)}</small></td>
          <td>${itemsCount(o)}</td>
          <td>${Utils.fmt(o.total)}</td>
          <td><span class="pill ${o.status}">${Utils.statusInfo(o.status).label}</span></td>
          <td><button class="icon-btn-sm ok" data-quick="${o.id}" data-next="${nextStatus}">${nextLabel}</button></td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:30px;">${t("admin.delivery.none")}</td></tr>`;

  document.querySelectorAll("button[data-quick]").forEach(b => {
    b.onclick = () => {
      OrdersAPI.updateStatus(b.dataset.quick, b.dataset.next);
      showToast(t("admin.delivery.updated"));
      refreshAll();
    };
  });
}

/* =====================================================
   العملاء
===================================================== */
function aggregateCustomers() {
  const orders = OrdersAPI.list();
  const map = {};
  orders.forEach(o => {
    const key = (o.customer.phone || "").trim() || o.customer.name;
    if (!map[key]) map[key] = {
      name: o.customer.name, phone: o.customer.phone,
      orderCount: 0, totalSpent: 0,
      cityIds: new Set(), lastOrder: o.createdAt,
    };
    map[key].orderCount++;
    map[key].cityIds.add(o.cityId);
    if (o.status !== "cancelled") map[key].totalSpent += (o.total || 0);
    if (new Date(o.createdAt) > new Date(map[key].lastOrder)) map[key].lastOrder = o.createdAt;
  });
  return Object.values(map).sort((a, b) => b.orderCount - a.orderCount);
}

function renderCustomers() {
  const customers = aggregateCustomers();
  const q = (document.getElementById("searchCustomers")?.value || "").trim();
  const filtered = q
    ? customers.filter(c => (c.name || "").includes(q) || (c.phone || "").includes(q))
    : customers;

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const repeat = customers.filter(c => c.orderCount > 1).length;

  document.getElementById("customersStats").innerHTML = `
    <div class="stat">
      <div class="label">${t("admin.customers.total")}</div>
      <div class="value">${customers.length}</div>
      <div class="hint">${t("admin.customers.unique")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.customers.repeat")}</div>
      <div class="value">${repeat}</div>
      <div class="hint">${t("admin.customers.repeat_hint")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.customers.total_spent")}</div>
      <div class="value">${Utils.fmt(totalSpent)}</div>
      <div class="hint">${t("admin.customers.spent_hint")}</div>
    </div>
    <div class="stat">
      <div class="label">${t("admin.customers.avg")}</div>
      <div class="value">${customers.length ? Utils.fmt(Math.round(totalSpent / customers.reduce((s,c)=>s+c.orderCount,0) || 1)) : "0 ₪"}</div>
      <div class="hint">${t("admin.customers.avg_hint")}</div>
    </div>`;

  document.getElementById("customersCount").textContent = filtered.length;
  document.getElementById("customersTable").innerHTML = filtered.length
    ? filtered.map(c => `
        <tr>
          <td><div class="cust-name">${escapeHtml(c.name)}</div></td>
          <td dir="ltr" style="text-align:right;">${escapeHtml(c.phone)}</td>
          <td>${[...c.cityIds].map(id => escapeHtml(Utils.cityById(id)?.name || id)).join(" · ")}</td>
          <td>${c.orderCount}</td>
          <td>${Utils.fmt(c.totalSpent)}</td>
          <td>${Utils.formatDate(c.lastOrder)}</td>
        </tr>`).join("")
    : `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:30px;">${t("admin.customers.none")}</td></tr>`;
}

document.addEventListener("input", (e) => {
  if (e.target?.id === "searchCustomers") renderCustomers();
});

function openOrderModal(id) {
  const o = OrdersAPI.list().find(x => x.id === id);
  if (!o) return;
  currentOrderId = id;

  const itemsHtml = o.items.map(it => `
    <div class="it">
      <span>${escapeHtml(it.name)}  —  ${escapeHtml(it.color)} · ${escapeHtml(it.size)} × ${it.qty}</span>
      <span>${Utils.fmt(it.price * it.qty)}</span>
    </div>`).join("");


  const cityName = Utils.cityById(o.cityId)?.name || o.cityName;
  const proofLabel  = t("admin.order.proof");
  const noProof     = t("admin.order.no_proof");

  $orderBody.innerHTML = `
    <div class="order-detail">
      <div class="line"><span>${t("admin.order.code_label")}</span><strong>${orderCode(o.id)}</strong></div>
      <div class="line"><span>${t("admin.order.status_label")}</span><strong><span class="pill ${o.status}">${Utils.statusInfo(o.status).label}</span></strong></div>
      <div class="line"><span>${t("admin.order.name")}</span><strong>${escapeHtml(o.customer.name)}</strong></div>
      <div class="line"><span>${t("admin.order.phone")}</span><strong dir="ltr">${escapeHtml(o.customer.phone)}</strong></div>
      <div class="line"><span>${t("admin.order.city")}</span><strong>${escapeHtml(cityName)}</strong></div>
      <div class="line"><span>${t("admin.order.area")}</span><strong>${escapeHtml(o.customer.area)}</strong></div>
      ${o.customer.notes ? `<div class="line"><span>${t("admin.order.notes")}</span><strong>${escapeHtml(o.customer.notes)}</strong></div>` : ""}
      <div class="line"><span>${t("admin.order.date")}</span><strong>${Utils.formatDate(o.createdAt)}</strong></div>
      <div class="items"><strong>${t("admin.order.products")}</strong>${itemsHtml}</div>
      <div class="line" style="margin-top:8px;"><span>${t("admin.order.subtotal")}</span><strong>${Utils.fmt(o.subtotal)}</strong></div>
      ${o.savings > 0 ? `<div class="line"><span>${t("admin.order.discount_products")}</span><strong style="color:var(--ok)">− ${Utils.fmt(o.savings)}</strong></div>` : ""}
      ${o.couponDiscount > 0 ? `<div class="line"><span>${t("admin.order.coupon")} (${escapeHtml(o.couponCode || "")})</span><strong style="color:var(--ok)">− ${Utils.fmt(o.couponDiscount)}</strong></div>` : ""}
      <div class="line"><span>${t("admin.order.delivery")}</span><strong>${Utils.fmt(o.deliveryFee)}</strong></div>
      <div class="line"><span>${t("admin.order.total")}</span><strong style="color:var(--gold)">${Utils.fmt(o.total)}</strong></div>
      ${o.senderName ? `<div class="line"><span>👤 اسم صاحب الحوالة</span><strong>${escapeHtml(o.senderName)}</strong></div>` : ""}
      ${o.transferBank ? `<div class="line"><span>🏦 حُوّل إلى حساب</span><strong>${escapeHtml(o.transferBank)}</strong></div>` : ""}
      ${o.paymentProof
        ? `<div class="proof"><strong>${proofLabel}</strong><br><a href="${o.paymentProof}" target="_blank"><img src="${o.paymentProof}" alt=""></a></div>`
        : `<div class="proof" style="color:var(--danger)"><strong>${noProof}</strong></div>`}
    </div>`;
  $orderStatus.value = o.status;
  $verifyBtn.style.display = o.status === "awaiting" ? "inline-block" : "none";
  $orderModal.classList.add("open");
}
document.getElementById("closeOrderModal").onclick = () => $orderModal.classList.remove("open");
document.getElementById("saveOrderStatus").onclick = () => {
  if (!currentOrderId) return;
  OrdersAPI.updateStatus(currentOrderId, $orderStatus.value);
  $orderModal.classList.remove("open");
  showToast(t("admin.order.status_updated"));
  refreshAll();
};
$verifyBtn.onclick = () => {
  if (!currentOrderId) return;
  OrdersAPI.updateStatus(currentOrderId, "pending");
  $orderModal.classList.remove("open");
  showToast(t("admin.order.payment_verified"));
  refreshAll();
};

/* =====================================================
   الإعدادات
===================================================== */
function applyContactSettings() {
  const s = SettingsAPI.get();
  document.getElementById("cfgPhone").value    = s.contact?.phone || "";
  document.getElementById("cfgWa").value       = s.contact?.whatsapp || "";
  document.getElementById("cfgIg").value       = s.contact?.instagram || "";
  document.getElementById("cfgHeadline").value = s.headline || "";
  document.getElementById("cfgSound").checked  = s.soundEnabled !== false;
  /* خلفية البانر */
  const opacity = (s.heroBgOpacity !== undefined) ? Math.round(Number(s.heroBgOpacity) * 100) : 55;
  const opEl = document.getElementById("heroBgOpacity");
  const opValEl = document.getElementById("heroBgOpacityValue");
  if (opEl) opEl.value = opacity;
  if (opValEl) opValEl.textContent = opacity;
  const preview = document.getElementById("heroBgPreview");
  if (preview) {
    preview.innerHTML = s.heroBgImage
      ? `<img src="${s.heroBgImage}" alt="hero bg" style="max-width:240px; max-height:120px; border-radius:8px; border:1px solid var(--line);">`
      : `<p style="color:var(--muted); font-size:12px; margin:0;">— لا توجد صورة محفوظة —</p>`;
  }
}

/* رفع/حذف خلفية الـ hero */
function setupHeroBgControls() {
  const zone = document.getElementById("heroBgZone");
  const file = document.getElementById("heroBgFile");
  const clearBtn = document.getElementById("heroBgClear");
  const opEl = document.getElementById("heroBgOpacity");
  const opValEl = document.getElementById("heroBgOpacityValue");

  if (file) {
    file.onchange = async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (f.size > 10 * 1024 * 1024) { showToast(t("admin.product.image_too_big")); return; }
      const useStorage = !!(window.uploadToStorage && window.AMAL_CONFIG?.BUCKET_HERO);
      try {
        let imageRef;
        if (useStorage) {
          showToast("⏳ جاري رفع الخلفية...");
          imageRef = await window.uploadToStorage(window.AMAL_CONFIG.BUCKET_HERO, f);
        } else {
          imageRef = await Utils.fileToDataURL(f);
        }
        SettingsAPI.save({ heroBgImage: imageRef });
        showToast(t("admin.settings.hero_bg_saved"));
      } catch (err) {
        console.error("[hero bg]", err);
        showToast("فشل رفع الصورة: " + (err.message || err));
        return;
      }
      applyContactSettings();
    };
  }
  if (zone) {
    ["dragover","dragenter"].forEach(evt =>
      zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.add("dragover"); }));
    ["dragleave","drop"].forEach(evt =>
      zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.remove("dragover"); }));
    zone.addEventListener("drop", e => {
      const f = e.dataTransfer.files?.[0];
      if (f) { file.files = e.dataTransfer.files; file.dispatchEvent(new Event("change")); }
    });
  }
  if (clearBtn) {
    clearBtn.onclick = () => {
      SettingsAPI.save({ heroBgImage: "" });
      showToast(t("admin.settings.hero_bg_saved"));
      applyContactSettings();
    };
  }
  if (opEl) {
    opEl.oninput = () => {
      if (opValEl) opValEl.textContent = opEl.value;
    };
    opEl.onchange = () => {
      SettingsAPI.save({ heroBgOpacity: Number(opEl.value) / 100 });
      showToast(t("admin.settings.hero_bg_saved"));
    };
  }
}
document.getElementById("contactForm").onsubmit = (e) => {
  e.preventDefault();
  SettingsAPI.save({
    contact: {
      phone:     document.getElementById("cfgPhone").value.trim(),
      whatsapp:  document.getElementById("cfgWa").value.trim(),
      instagram: document.getElementById("cfgIg").value.trim().replace(/^@/, ""),
    },
    headline: document.getElementById("cfgHeadline").value.trim(),
    soundEnabled: document.getElementById("cfgSound").checked,
  });
  showToast(t("admin.settings.contact_saved"));
};

/* الحسابات البنكية */
const $banksList = document.getElementById("banksList");
function renderBanksList() {
  const banks = SettingsAPI.get().bankAccounts || [];
  $banksList.innerHTML = banks.length ? banks.map(b => `
    <div class="bank-row" data-id="${b.id}">
      <input class="input" data-f="bankName"      value="${escapeAttr(b.bankName || b.bank_name || "")}"           placeholder="اسم البنك">
      <input class="input" data-f="accountName"   value="${escapeAttr(b.accountName || b.account_name || "")}"     placeholder="اسم صاحب الحساب">
      <input class="input" data-f="accountNumber" value="${escapeAttr(b.accountNumber || b.account_number || "")}" placeholder="رقم الحساب">
      <input class="input" data-f="iban"          value="${escapeAttr(b.iban || "")}"                              placeholder="IBAN">
      <input class="input" data-f="phone"         value="${escapeAttr(b.phone || "")}"                             placeholder="جوال التحويل (اختياري)">
      <div class="actions">
        <button class="icon-btn-sm ok"     data-act="save-bank">حفظ</button>
        <button class="icon-btn-sm danger" data-act="del-bank">حذف</button>
      </div>
    </div>
  `).join("") : `<p style="color:var(--muted); font-size:13px;">لا توجد حسابات. اضغطي "إضافة حساب".</p>`;

  $banksList.querySelectorAll(".bank-row").forEach(row => {
    const id = row.dataset.id;
    row.querySelector('[data-act="save-bank"]').onclick = () => {
      const patch = {};
      row.querySelectorAll("input[data-f]").forEach(inp => patch[inp.dataset.f] = inp.value.trim());
      SettingsAPI.updateBank(id, patch);
      showToast(t("admin.settings.bank_saved"));
    };
    row.querySelector('[data-act="del-bank"]').onclick = () => {
      if (!confirm(t("admin.settings.bank_delete_confirm"))) return;
      SettingsAPI.removeBank(id);
      renderBanksList();
      showToast(t("admin.product.deleted"));
    };
  });
}
document.getElementById("addBankBtn").onclick = () => {
  SettingsAPI.addBank({ bankName: "", accountName: "", accountNumber: "", iban: "" });
  renderBanksList();
};

/* أكواد الخصم */
const $couponsList = document.getElementById("couponsList");
function renderCouponsList() {
  if (!$couponsList) return;
  const coupons = CouponsAPI.list();
  $couponsList.innerHTML = coupons.length ? `
    <div class="coupon-row-admin" style="font-weight:700; color:var(--muted); font-size:12px;">
      <div>${t("admin.settings.coupon_code")}</div>
      <div>${t("admin.settings.coupon_type")}</div>
      <div>${t("admin.settings.coupon_value")}</div>
      <div>${t("admin.settings.coupon_min")}</div>
      <div>${t("admin.settings.coupon_status")}</div>
      <div>${t("admin.settings.coupon_usage")}</div>
      <div></div>
    </div>
    ${coupons.map(c => `
      <div class="coupon-row-admin" data-id="${c.id}">
        <input class="input" data-f="code"     value="${escapeAttr(c.code)}"     placeholder="WELCOME10" style="text-transform:uppercase;">
        <select class="input" data-f="type">
          <option value="percent" ${c.type === "percent" ? "selected" : ""}>${t("admin.settings.coupon_percent")}</option>
          <option value="fixed"   ${c.type === "fixed"   ? "selected" : ""}>${t("admin.settings.coupon_fixed")}</option>
        </select>
        <input class="input" data-f="value"    value="${Number(c.value || 0)}" type="number" min="0">
        <input class="input" data-f="minOrder" value="${Number(c.minOrder || 0)}" type="number" min="0">
        <label class="toggle">
          <input type="checkbox" data-f="active" ${c.active ? "checked" : ""}>
          <span>${c.active ? t("admin.settings.coupon_active") : t("admin.settings.coupon_inactive")}</span>
        </label>
        <div class="uses">${c.usedCount || 0} ${t("admin.settings.coupon_uses")}</div>
        <div class="actions">
          <button class="icon-btn-sm ok"     data-act="save-coupon">${t("admin.save")}</button>
          <button class="icon-btn-sm danger" data-act="del-coupon">${t("admin.delete")}</button>
        </div>
      </div>
    `).join("")}
  ` : `<p style="color:var(--muted); font-size:13px;">${t("admin.settings.no_coupons")}</p>`;

  $couponsList.querySelectorAll(".coupon-row-admin[data-id]").forEach(row => {
    const id = row.dataset.id;
    const cb = row.querySelector('input[data-f="active"]');
    if (cb) cb.onchange = () => {
      cb.nextElementSibling.textContent = cb.checked ? t("admin.settings.coupon_active") : t("admin.settings.coupon_inactive");
    };

    row.querySelector('[data-act="save-coupon"]').onclick = () => {
      const patch = { id };
      row.querySelectorAll("[data-f]").forEach(el => {
        const k = el.dataset.f;
        patch[k] = el.type === "checkbox" ? el.checked
                  : el.type === "number"  ? Number(el.value || 0)
                  : (k === "code" ? el.value.trim().toUpperCase() : el.value.trim());
      });
      if (!patch.code) { showToast(t("admin.settings.coupon_need_code")); return; }
      /* امنع تكرار الكود (الجدول يفرض أن يكون الكود فريداً) */
      const dupe = CouponsAPI.list().find(x => x.id !== id && (x.code || "").toUpperCase() === patch.code.toUpperCase());
      if (dupe) {
        showToast(getLang() === "en"
          ? `Code "${patch.code}" is already used — choose a different code`
          : `الكود "${patch.code}" مستخدم مسبقاً — اختاري كوداً مختلفاً`);
        return;
      }
      const existing = CouponsAPI.list().find(x => x.id === id);
      CouponsAPI.save({ ...existing, ...patch });
      renderCouponsList();
      showToast(t("admin.settings.coupon_saved"));
    };

    row.querySelector('[data-act="del-coupon"]').onclick = () => {
      if (!confirm(t("admin.settings.coupon_delete_confirm"))) return;
      CouponsAPI.remove(id);
      renderCouponsList();
      showToast(t("admin.product.deleted"));
    };
  });
}

document.getElementById("addCouponBtn")?.addEventListener("click", () => {
  CouponsAPI.save({ code: "NEW" + Math.floor(Math.random() * 1000), type: "percent", value: 10, minOrder: 0, active: true });
  renderCouponsList();
});

/* كلمة المرور */
document.getElementById("pwdForm").onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  if (f.get("next") !== f.get("confirm")) { showToast(t("admin.settings.pwd_mismatch")); return; }
  if (!AuthAPI.changePassword(f.get("current"), f.get("next"))) {
    showToast(t("admin.settings.pwd_wrong")); return;
  }
  e.target.reset();
  showToast(t("admin.settings.pwd_updated"));
};

/* =====================================================
   تحديث عام
===================================================== */
function refreshAll() {
  renderDateDisplay();
  renderStats();
  renderCityStats();
  renderRecentOrders();
  renderProductsTable();
  renderInventory();
  renderOrders();
  renderDelivery();
  renderCustomers();
  renderAdminInfo();
}

function renderAdminInfo() {
  const username = SettingsAPI.get().admin?.username || "admin";
  const $info = document.getElementById("adminInfo");
  if ($info) $info.textContent = `${username}@amal-abaya.loc`;
}

window.addEventListener("storage", (e) => {
  if (e.key === "abaya_amal_v2") { refreshAll(); checkForNewOrders(); }
});

/* =====================================================
   إشعار صوتي + وميض التبويب عند طلب جديد
===================================================== */
let lastSeenOrdersCount = 0;
let originalTitle = document.title;
let titleFlashTimer = null;

function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const playNote = (freq, t, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + dur + 0.05);
    };
    /* G5 → C6 */
    playNote(784, 0,    0.25);
    playNote(1046.5, 0.18, 0.35);
    setTimeout(() => ctx.close(), 800);
  } catch (e) {}
}

function flashTitle() {
  clearInterval(titleFlashTimer);
  let alt = true;
  titleFlashTimer = setInterval(() => {
    document.title = alt ? "🔔 طلب جديد!" : originalTitle;
    alt = !alt;
  }, 900);
  const stop = () => {
    if (!document.hidden) {
      clearInterval(titleFlashTimer);
      document.title = originalTitle;
      document.removeEventListener("visibilitychange", stop);
      window.removeEventListener("focus", stop);
    }
  };
  document.addEventListener("visibilitychange", stop);
  window.addEventListener("focus", stop);
}

function checkForNewOrders() {
  const orders = OrdersAPI.list();
  const count = orders.length;
  if (lastSeenOrdersCount === 0) { lastSeenOrdersCount = count; return; }
  if (count > lastSeenOrdersCount) {
    const soundOn = SettingsAPI.get().soundEnabled !== false;
    if (soundOn) chime();
    flashTitle();
    showToast(`🔔 ${count - lastSeenOrdersCount} ${t("admin.order.new_alert")}`);
  }
  lastSeenOrdersCount = count;
}

setInterval(checkForNewOrders, 5000);

/* =====================================================
   طباعة الفاتورة
===================================================== */
function printInvoice(orderId) {
  const o = OrdersAPI.list().find(x => x.id === orderId);
  if (!o) return;
  const s = SettingsAPI.get();
  const code = orderCode(o.id);

  const itemsRows = o.items.map(it => `
    <tr>
      <td>${escapeHtml(it.name)}<br><small style="color:#666;">${escapeHtml(it.color)} · ${escapeHtml(it.size)}</small></td>
      <td style="text-align:center;">${it.qty}</td>
      <td style="text-align:left;">${Utils.fmt(it.price)}</td>
      <td style="text-align:left;">${Utils.fmt(it.price * it.qty)}</td>
    </tr>`).join("");

  const win = window.open("", "_blank", "width=800,height=900");
  win.document.write(`<!DOCTYPE html>
  <html lang="ar" dir="rtl"><head>
    <meta charset="UTF-8">
    <title>فاتورة ${code}</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Cormorant+Garamond:wght@600&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Tajawal', sans-serif; padding: 30px; color: #1a1a1a; background: #fff; }
      .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px; }
      .brand { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 600; letter-spacing: -1px; }
      .brand-sub { color: #777; font-size: 13px; margin-top: 2px; }
      .invoice-info { text-align: left; font-size: 13px; }
      .invoice-info .code { font-size: 18px; font-weight: 700; }
      h3 { margin: 18px 0 8px; font-size: 15px; color: #555; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 14px; }
      th, td { padding: 10px 8px; border-bottom: 1px solid #eee; text-align: right; }
      th { background: #f7f5f0; }
      .totals { margin-top: 14px; }
      .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
      .totals .row.grand { border-top: 2px solid #000; margin-top: 8px; padding-top: 10px; font-weight: 800; font-size: 18px; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 6px; font-size: 14px; }
      .meta-grid div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #eee; }
      .meta-grid span { color: #777; }
      footer { margin-top: 36px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #eee; padding-top: 14px; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>
    <div class="head">
      <div>
        <div class="brand">Amal</div>
        <div class="brand-sub">Abaya and more · عبايات أمل</div>
        ${s.contact?.phone ? `<div style="font-size:12px; color:#777; margin-top:6px;">📞 ${escapeHtml(s.contact.phone)}</div>` : ""}
        ${s.contact?.whatsapp ? `<div style="font-size:12px; color:#777;">💬 ${escapeHtml(s.contact.whatsapp)}</div>` : ""}
        ${s.contact?.instagram ? `<div style="font-size:12px; color:#777;">📷 @${escapeHtml(s.contact.instagram)}</div>` : ""}
      </div>
      <div class="invoice-info">
        <div class="code">فاتورة ${code}</div>
        <div style="color:#777; margin-top:4px;">${Utils.formatDate(o.createdAt)}</div>
        <div style="margin-top:6px; padding:4px 10px; background:#000; color:#fff; border-radius:999px; display:inline-block; font-size:12px;">
          ${Utils.statusInfo(o.status).label}
        </div>
      </div>
    </div>

    <h3>بيانات الزبونة</h3>
    <div class="meta-grid">
      <div><span>الاسم</span><strong>${escapeHtml(o.customer.name)}</strong></div>
      <div><span>الجوال</span><strong dir="ltr">${escapeHtml(o.customer.phone)}</strong></div>
      <div><span>المدينة</span><strong>${escapeHtml(o.cityName)}</strong></div>
      <div><span>الحي/الشارع</span><strong>${escapeHtml(o.customer.area)}</strong></div>
      ${o.customer.notes ? `<div style="grid-column:1/-1;"><span>ملاحظات</span><strong>${escapeHtml(o.customer.notes)}</strong></div>` : ""}
    </div>

    <h3>المنتجات</h3>
    <table>
      <thead><tr><th>المنتج</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">السعر</th><th style="text-align:left;">الإجمالي</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>المجموع الفرعي</span><span>${Utils.fmt(o.subtotal)}</span></div>
      ${o.savings > 0 ? `<div class="row"><span>خصم المنتجات</span><span>− ${Utils.fmt(o.savings)}</span></div>` : ""}
      ${o.couponDiscount > 0 ? `<div class="row"><span>كود الخصم (${escapeHtml(o.couponCode || "")})</span><span>− ${Utils.fmt(o.couponDiscount)}</span></div>` : ""}
      <div class="row"><span>التوصيل</span><span>${Utils.fmt(o.deliveryFee)}</span></div>
      <div class="row grand"><span>الإجمالي</span><span>${Utils.fmt(o.total)}</span></div>
    </div>

    <footer>
      شكراً لتسوقكِ من <strong>Amal · Abaya and more</strong>  ·  عبايات أمل · توصيل لكل مدن قطاع غزة
    </footer>

    <script>setTimeout(() => window.print(), 400);<\/script>
  </body></html>`);
  win.document.close();
}

document.getElementById("printInvoiceBtn")?.addEventListener("click", () => {
  if (currentOrderId) printInvoice(currentOrderId);
});

/* =====================================================
   إدارة التصنيفات
===================================================== */
const $categoriesList = () => document.getElementById("categoriesList");

function renderCategoriesAdmin() {
  const list = CategoriesAPI.list();
  const el = $categoriesList();
  if (!el) return;
  el.innerHTML = list.length ? `
    <div class="category-row" style="font-weight:700; color:var(--muted); font-size:12px;">
      <div data-i18n="admin.cat.name_ar">الاسم بالعربية</div>
      <div data-i18n="admin.cat.name_en">الاسم بالإنجليزية</div>
      <div data-i18n="admin.cat.active">مفعّل</div>
      <div></div>
    </div>
    ${list.map(c => `
      <div class="category-row" data-id="${c.id}">
        <input class="input" data-f="name_ar" value="${escapeAttr(c.name_ar)}" placeholder="${t("admin.cat.name_ar")}">
        <input class="input" data-f="name_en" value="${escapeAttr(c.name_en || "")}" placeholder="${t("admin.cat.name_en")}">
        <label class="toggle"><input type="checkbox" data-f="active" ${c.active !== false ? "checked" : ""}><span></span></label>
        <div class="actions">
          <button class="icon-btn-sm ok"     data-act="save-cat">${t("admin.save")}</button>
          <button class="icon-btn-sm danger" data-act="del-cat">${t("admin.delete")}</button>
        </div>
      </div>`).join("")}
  ` : `<p style="color:var(--muted); font-size:13px;">${t("admin.cat.no_cats")}</p>`;

  el.querySelectorAll(".category-row[data-id]").forEach(row => {
    const id = row.dataset.id;
    row.querySelector('[data-act="save-cat"]').onclick = () => {
      const name_ar = row.querySelector('[data-f="name_ar"]').value.trim();
      const name_en = row.querySelector('[data-f="name_en"]').value.trim();
      const active  = row.querySelector('[data-f="active"]').checked;
      if (!name_ar || !name_en) { showToast(t("admin.cat.need_names")); return; }
      CategoriesAPI.save({ id, name_ar, name_en, active });
      showToast(t("admin.cat.saved"));
      fillCategorySelects();
      renderProductsTable();
    };
    row.querySelector('[data-act="del-cat"]').onclick = () => {
      if (!confirm(t("admin.cat.delete_confirm"))) return;
      CategoriesAPI.remove(id);
      showToast(t("admin.cat.deleted"));
      renderCategoriesAdmin();
      fillCategorySelects();
      renderProductsTable();
    };
  });
}

document.getElementById("addCategoryBtn")?.addEventListener("click", () => {
  /* أنشئ تصنيفاً فارغاً جديداً */
  const newCat = {
    name_ar: "تصنيف جديد",
    name_en: "New category",
    active: true,
  };
  CategoriesAPI.save(newCat);
  renderCategoriesAdmin();
  fillCategorySelects();
});

/* =====================================================
   إدارة مدن التوصيل
===================================================== */
function renderCitiesAdmin() {
  const el = document.getElementById("citiesList");
  if (!el) return;
  const list = CitiesAPI.list();
  el.innerHTML = list.length ? `
    <div class="city-row" style="font-weight:700; color:var(--muted); font-size:12px;">
      <div>${t("admin.city.name_ar")}</div>
      <div>${t("admin.city.name_en")}</div>
      <div>${t("admin.city.fee")}</div>
      <div>${t("admin.city.active")}</div>
      <div></div>
    </div>
    ${list.map(c => `
      <div class="city-row" data-id="${c.id}">
        <input class="input" data-f="name_ar" value="${escapeAttr(c.name_ar)}" placeholder="${t("admin.city.name_ar")}">
        <input class="input" data-f="name_en" value="${escapeAttr(c.name_en || "")}" placeholder="${t("admin.city.name_en")}">
        <input class="input" data-f="fee" type="number" min="0" step="1" value="${Number(c.fee || 0)}">
        <label class="toggle"><input type="checkbox" data-f="active" ${c.active !== false ? "checked" : ""}><span></span></label>
        <div class="actions">
          <button class="icon-btn-sm ok"     data-act="save-city">${t("admin.save")}</button>
          <button class="icon-btn-sm danger" data-act="del-city">${t("admin.delete")}</button>
        </div>
      </div>`).join("")}
  ` : `<p style="color:var(--muted); font-size:13px;">${t("admin.city.no_cities")}</p>`;

  el.querySelectorAll(".city-row[data-id]").forEach(row => {
    const id = row.dataset.id;
    row.querySelector('[data-act="save-city"]').onclick = () => {
      const name_ar = row.querySelector('[data-f="name_ar"]').value.trim();
      const name_en = row.querySelector('[data-f="name_en"]').value.trim();
      const fee     = Math.max(0, Number(row.querySelector('[data-f="fee"]').value) || 0);
      const active  = row.querySelector('[data-f="active"]').checked;
      if (!name_ar || !name_en) { showToast(t("admin.city.need_names")); return; }
      CitiesAPI.save({ id, name_ar, name_en, fee, active });
      showToast(t("admin.city.saved"));
      fillFilters();
      renderDelivery();
    };
    row.querySelector('[data-act="del-city"]').onclick = () => {
      if (!confirm(t("admin.city.delete_confirm"))) return;
      CitiesAPI.remove(id);
      showToast(t("admin.city.deleted"));
      renderCitiesAdmin();
      fillFilters();
      renderDelivery();
    };
  });
}

document.getElementById("addCityBtn")?.addEventListener("click", () => {
  CitiesAPI.save({ name_ar: "مدينة جديدة", name_en: "New city", fee: 20, active: true });
  renderCitiesAdmin();
  fillFilters();
});

/* =====================================================
   إدارة الأقمشة والقَصّات (مولّد عام)
===================================================== */
function buildLookupAdmin(apiName, listElId, addBtnId, defaultRow) {
  return function render() {
    const el = document.getElementById(listElId);
    if (!el) return;
    /* احسم الـ API وقت الاستدعاء (وليس وقت التحميل) حتى نلتقط نسخة
       Supabase بعد جاهزيتها بدل نسخة data.js المحلية. */
    const api = window[apiName];
    if (!api) return;
    const items = api.list();
    el.innerHTML = items.length ? `
      <div class="category-row" style="font-weight:700; color:var(--muted); font-size:12px;">
        <div>الاسم بالعربية</div><div>الاسم بالإنجليزية</div><div></div><div></div>
      </div>
      ${items.map(c => `
        <div class="category-row" data-id="${c.id}">
          <input class="input" data-f="name_ar" value="${escapeAttr(c.name_ar || "")}" placeholder="اسم بالعربية">
          <input class="input" data-f="name_en" value="${escapeAttr(c.name_en || "")}" placeholder="English name">
          <div></div>
          <div class="actions">
            <button class="icon-btn-sm ok"     data-act="save">${t("admin.save")}</button>
            <button class="icon-btn-sm danger" data-act="del">${t("admin.delete")}</button>
          </div>
        </div>`).join("")}
    ` : `<p style="color:var(--muted); font-size:13px;">لا توجد عناصر. اضغطي زر الإضافة.</p>`;

    el.querySelectorAll(".category-row[data-id]").forEach(row => {
      const id = row.dataset.id;
      row.querySelector('[data-act="save"]').onclick = () => {
        const name_ar = row.querySelector('[data-f="name_ar"]').value.trim();
        const name_en = row.querySelector('[data-f="name_en"]').value.trim();
        if (!name_ar || !name_en) { showToast("أكملي الاسم بالعربية والإنجليزية"); return; }
        api.save({ id, name_ar, name_en });
        render();
        showToast("تم الحفظ ✓");
      };
      row.querySelector('[data-act="del"]').onclick = () => {
        if (!confirm("حذف هذا العنصر؟")) return;
        api.remove(id);
        render();
        showToast(t("admin.product.deleted"));
      };
    });

    document.getElementById(addBtnId).onclick = () => {
      api.save({ ...defaultRow });
      render();
    };
  };
}

const renderFabricsAdmin = buildLookupAdmin(
  "FabricsAPI", "fabricsList", "addFabricBtn",
  { name_ar: "قماش جديد", name_en: "New fabric" }
);
const renderCutsAdmin = buildLookupAdmin(
  "CutsAPI", "cutsList", "addCutBtn",
  { name_ar: "قَصّة جديدة", name_en: "New cut" }
);

/* =====================================================
   إدارة آراء العملاء
===================================================== */
function renderReviewsAdmin() {
  const el = document.getElementById("reviewsList");
  if (!el) return;
  const reviews = ReviewsAPI.list();
  el.innerHTML = reviews.length ? reviews.map(r => `
    <div class="review-row" data-id="${r.id}" style="background:#fff; border:1px solid var(--line); border-radius:10px; padding:14px; margin-bottom:10px;">
      <div class="row-2">
        <div class="field">
          <label>اسم العميلة</label>
          <input class="input" data-f="name" value="${escapeAttr(r.name)}">
        </div>
        <div class="field">
          <label>التقييم (1-5)</label>
          <input class="input" type="number" min="1" max="5" data-f="rating" value="${Number(r.rating || 5)}">
        </div>
      </div>
      <div class="row-2">
        <div class="field">
          <label>التاريخ</label>
          <input class="input" type="date" data-f="date" value="${escapeAttr(r.date || "")}">
        </div>
        <div class="field">
          <label class="toggle" style="padding:28px 0 0;"><input type="checkbox" data-f="verified" ${r.verified ? "checked" : ""}><span>مشترية موثّقة</span></label>
        </div>
      </div>
      <div class="field">
        <label>التعليق</label>
        <textarea class="input" rows="2" data-f="text">${escapeHtml(r.text || "")}</textarea>
      </div>
      <div class="actions">
        <button class="icon-btn-sm ok" data-act="save">${t("admin.save")}</button>
        <button class="icon-btn-sm danger" data-act="del">${t("admin.delete")}</button>
      </div>
    </div>
  `).join("") : `<p style="color:var(--muted); font-size:13px;">لا توجد مراجعات. اضغطي "+ إضافة رأي".</p>`;

  el.querySelectorAll(".review-row[data-id]").forEach(row => {
    const id = row.dataset.id;
    row.querySelector('[data-act="save"]').onclick = () => {
      const get = f => row.querySelector(`[data-f="${f}"]`);
      ReviewsAPI.save({
        id,
        name: get("name").value.trim(),
        rating: Math.max(1, Math.min(5, Number(get("rating").value) || 5)),
        date: get("date").value,
        verified: get("verified").checked,
        text: get("text").value.trim(),
      });
      renderReviewsAdmin();
      showToast("تم حفظ الرأي ✓");
    };
    row.querySelector('[data-act="del"]').onclick = () => {
      if (!confirm("حذف هذا الرأي؟")) return;
      ReviewsAPI.remove(id);
      renderReviewsAdmin();
      showToast(t("admin.product.deleted"));
    };
  });
}
document.getElementById("addReviewBtn")?.addEventListener("click", () => {
  ReviewsAPI.save({
    name: "زبونة جديدة",
    rating: 5,
    text: "اكتبي نص المراجعة هنا...",
    date: new Date().toISOString().slice(0, 10),
    verified: true,
  });
  renderReviewsAdmin();
});

/* =====================================================
   محرر معلومات الموقع
===================================================== */
function renderSiteInfoEditor() {
  const el = document.getElementById("siteInfoEditor");
  if (!el) return;
  const info = SiteInfoAPI.get();
  const sections = [
    { key: "aboutUs",         label: "✨ من نحن (يظهر في القسم الرئيسي)" },
    { key: "shipping",        label: "🚚 الشحن والتوصيل (يظهر في القسم الرئيسي)" },
    { key: "faq",             label: "💬 أسئلة شائعة (يظهر في القسم الرئيسي)" },
    { key: "privacyPolicy",   label: "🔒 سياسة الخصوصية (رابط التذييل)" },
    { key: "exchangePolicy",  label: "♻️ سياسة الاستبدال والاسترجاع (رابط التذييل)" },
    { key: "codPolicy",       label: "💵 سياسة الدفع عند الاستلام (رابط التذييل)" },
    { key: "termsConditions", label: "📜 الشروط العامة والأحكام (رابط التذييل)" },
  ];
  el.innerHTML = sections.map(s => `
    <div class="text-row" data-key="${s.key}">
      <div class="text-label"><strong>${s.label}</strong></div>
      <div class="text-inputs">
        <div>
          <label>🇸🇦 العربية</label>
          <textarea data-f="ar" rows="3">${escapeHtml(info[s.key]?.ar || "")}</textarea>
        </div>
        <div>
          <label>🇬🇧 English</label>
          <textarea data-f="en" rows="3">${escapeHtml(info[s.key]?.en || "")}</textarea>
        </div>
      </div>
      <div class="text-actions">
        <button class="icon-btn-sm ok" data-act="save">${t("admin.save")}</button>
      </div>
    </div>
  `).join("");

  el.querySelectorAll(".text-row").forEach(row => {
    const key = row.dataset.key;
    row.querySelector('[data-act="save"]').onclick = () => {
      const ar = row.querySelector('textarea[data-f="ar"]').value.trim();
      const en = row.querySelector('textarea[data-f="en"]').value.trim();
      const patch = {};
      patch[key] = { ar, en };
      SiteInfoAPI.update(patch);
      showToast("تم الحفظ ✓");
    };
  });
}

/* =====================================================
   محرر جداول المقاسات (الوصف فقط لتبسيط الواجهة)
===================================================== */
function renderSizeChartsEditor() {
  const el = document.getElementById("sizeChartsEditor");
  if (!el) return;
  const charts = SizeChartsAPI.get();
  el.innerHTML = `
    <div class="text-row">
      <div class="text-label"><strong>وصف دليل المقاسات (يظهر للزبونة)</strong></div>
      <div class="text-inputs">
        <div>
          <label>🇸🇦 العربية</label>
          <textarea id="sgDescAr" rows="3">${escapeHtml(charts.description?.ar || "")}</textarea>
        </div>
        <div>
          <label>🇬🇧 English</label>
          <textarea id="sgDescEn" rows="3">${escapeHtml(charts.description?.en || "")}</textarea>
        </div>
      </div>
      <div class="text-actions">
        <button class="icon-btn-sm ok" id="sgDescSave">${t("admin.save")}</button>
      </div>
    </div>
    <p style="color:var(--muted); font-size:12px; margin-top:10px;">
      ℹ️ القياسات في الجدول مبنية على المعايير العالمية والخليجية. لتعديل الأرقام مباشرة احفظي عبر:
      <code>SizeChartsAPI.save({intl:[...], gulf:[...]})</code> من Console.
    </p>`;

  document.getElementById("sgDescSave")?.addEventListener("click", () => {
    SizeChartsAPI.save({
      description: {
        ar: document.getElementById("sgDescAr").value.trim(),
        en: document.getElementById("sgDescEn").value.trim(),
      },
    });
    showToast("تم الحفظ ✓");
  });
}

/* =====================================================
   محرر نصوص الواجهة
===================================================== */
function renderTextsEditor() {
  const el = document.getElementById("textsEditor");
  if (!el) return;
  /* جمّع المفاتيح حسب القسم */
  const bySection = {};
  EDITABLE_TEXTS.forEach(item => {
    if (!bySection[item.section]) bySection[item.section] = [];
    bySection[item.section].push(item);
  });

  el.innerHTML = Object.keys(bySection).map(section => `
    <div class="text-section">
      <h4>${t("admin.txt.section." + section)}</h4>
      ${bySection[section].map(item => {
        const labelAr = item.label_ar;
        const labelEn = item.label_en;
        const label   = getLang() === "en" ? labelEn : labelAr;
        const arDefault = I18N.ar[item.key] || "";
        const enDefault = I18N.en[item.key] || "";
        const arOverride = TextOverridesAPI.get("ar", item.key);
        const enOverride = TextOverridesAPI.get("en", item.key);
        return `
          <div class="text-row" data-key="${escapeAttr(item.key)}">
            <div class="text-label">
              <strong>${escapeHtml(label)}</strong>
              <code style="display:block; color:var(--muted); font-size:11px; margin-top:2px;">${escapeHtml(item.key)}</code>
            </div>
            <div class="text-inputs">
              <div>
                <label>🇸🇦 العربية</label>
                <textarea data-f="ar" rows="1" placeholder="${escapeAttr(arDefault)}">${escapeHtml(arOverride)}</textarea>
                <small style="color:var(--muted)">${escapeHtml(arDefault)}</small>
              </div>
              <div>
                <label>🇬🇧 English</label>
                <textarea data-f="en" rows="1" placeholder="${escapeAttr(enDefault)}">${escapeHtml(enOverride)}</textarea>
                <small style="color:var(--muted)">${escapeHtml(enDefault)}</small>
              </div>
            </div>
            <div class="text-actions">
              <button class="icon-btn-sm ok" data-act="save-text">${t("admin.txt.save")}</button>
              <button class="icon-btn-sm" data-act="reset-text">${t("admin.txt.reset")}</button>
            </div>
          </div>`;
      }).join("")}
    </div>
  `).join("");

  el.querySelectorAll(".text-row").forEach(row => {
    const key = row.dataset.key;
    row.querySelector('[data-act="save-text"]').onclick = () => {
      const ar = row.querySelector('textarea[data-f="ar"]').value;
      const en = row.querySelector('textarea[data-f="en"]').value;
      TextOverridesAPI.set("ar", key, ar);
      TextOverridesAPI.set("en", key, en);
      showToast(t("admin.txt.saved"));
      applyTranslations();   /* أعد ترجمة DOM فوراً لتظهر التغييرات */
    };
    row.querySelector('[data-act="reset-text"]').onclick = () => {
      TextOverridesAPI.reset(key);
      row.querySelector('textarea[data-f="ar"]').value = "";
      row.querySelector('textarea[data-f="en"]').value = "";
      showToast(t("admin.txt.reset_done"));
      applyTranslations();
    };
  });
}

/* أدوات */
function truncate(s, n) { s = s || ""; return s.length > n ? s.slice(0, n) + "…" : s; }
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

/* =========================================================
   نهاية الملف: ننتظر data-ready عند استخدام Supabase
   ثم نُظهر اللوحة إن كان المستخدم مسجَّل دخول.
========================================================= */
function autoShowIfLoggedIn() {
  if (AuthAPI.isLoggedIn()) showApp();
}

if (window.isSupabaseConfigured?.()) {
  if (window.supabaseReady) {
    autoShowIfLoggedIn();
  } else {
    window.addEventListener("data-ready", autoShowIfLoggedIn, { once: true });
    setTimeout(() => { if (!window.supabaseReady) autoShowIfLoggedIn(); }, 8000);
  }
} else {
  autoShowIfLoggedIn();
}

/* أعد تحديث اللوحة عند تغيّر البيانات (مثلاً عند حفظ منتج) */
window.addEventListener("data-changed", () => {
  if ($appShell.style.display !== "none") {
    try { refreshAll(); } catch (e) { console.error(e); }
  }
});
