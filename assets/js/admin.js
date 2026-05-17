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

if (AuthAPI.isLoggedIn()) showApp(); else showLogin();

$loginForm.onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData($loginForm);
  if (AuthAPI.login(f.get("username"), f.get("password"))) {
    $loginError.textContent = "";
    showApp();
  } else {
    $loginError.textContent = t("admin.login.error");
  }
};
document.getElementById("logoutBtn").onclick = () => {
  AuthAPI.logout(); location.reload();
};

/* =====================================================
   إقلاع الواجهة بعد الدخول
===================================================== */
function bootApp() {
  applyTranslations();
  fillCategorySelects();
  fillFilters();
  refreshAll();
  applyContactSettings();
  renderBanksList();
  renderCouponsList();
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
  const opts = CATEGORIES.filter(c => c.id !== "all")
                  .map(c => `<option value="${c.id}">${t("category." + c.id)}</option>`).join("");
  document.getElementById("formCategory").innerHTML = opts;
  $filterCat.innerHTML = `<option value="">${t("admin.products.all_categories")}</option>` + opts;
}

let workingColors = []; /* في وقت تحرير المنتج */
let workingSizes  = [];

function colorBlockHTML(idx, c) {
  return `
    <div class="color-block" data-idx="${idx}">
      <div class="row">
        <input class="color-name" type="text" placeholder="اسم اللون (مثال: أسود)"
               value="${escapeAttr(c.name || "")}" />
        <button type="button" class="icon-btn-sm danger" data-act="remove-color">حذف</button>
      </div>
      <label class="dropzone" data-idx="${idx}">
        <input type="file" accept="image/*" />
        ${c.image
          ? `<div class="dropzone-preview">
               <img src="${escapeAttr(c.image)}" alt="">
               <div class="meta">صورة جاهزة (يمكن سحب أخرى للاستبدال)</div>
               <button type="button" class="rm" data-act="clear-img">✕</button>
             </div>`
          : `<div class="uz-icon">📁</div>
             <div>اسحبي صورة هنا أو انقري للاختيار</div>
             <div style="font-size:12px; margin-top:4px;">PNG / JPG</div>`}
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

  /* رفع الصور (drag + click) */
  $colorsCont.querySelectorAll(".dropzone").forEach((zone) => {
    const idx = +zone.dataset.idx;
    const fileInput = zone.querySelector("input[type=file]");
    fileInput.onchange = (e) => handleImageFile(idx, e.target.files?.[0]);

    ["dragover", "dragenter"].forEach(evt =>
      zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.add("dragover"); })
    );
    ["dragleave", "drop"].forEach(evt =>
      zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.remove("dragover"); })
    );
    zone.addEventListener("drop", e => {
      const f = e.dataTransfer.files?.[0];
      if (f) handleImageFile(idx, f);
    });

    /* مسح الصورة */
    zone.querySelector('[data-act="clear-img"]')?.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      workingColors[idx].image = "";
      renderColors();
    });
  });
}

async function handleImageFile(idx, file) {
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { showToast("حجم الصورة كبير (الحد 3 ميجا)"); return; }
  workingColors[idx].image = await Utils.fileToDataURL(file);
  renderColors();
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

function openProductModal(product) {
  $productForm.reset();
  if (product) {
    $productTitle.textContent = "تعديل المنتج";
    $productForm.id.value          = product.id;
    $productForm.name.value         = product.name;
    $productForm.category.value     = product.category || "everyday";
    $productForm.price.value        = product.price;
    $productForm.discount.value     = product.discount || 0;
    $productForm.description.value  = product.description || "";
    $productForm.sizes.value        = (product.sizes || []).join(", ");
    workingColors = JSON.parse(JSON.stringify(product.colors || []));
    workingSizes  = (product.sizes || []).slice();
    workingStock  = Object.assign({}, product.stock || {});
  } else {
    $productTitle.textContent = "إضافة منتج";
    $productForm.id.value = "";
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
  if (workingColors.length === 0) { showToast("أضيفي لوناً واحداً على الأقل"); return; }
  if (workingColors.some(c => !c.name)) { showToast("أكملي أسماء الألوان"); return; }
  if (workingColors.some(c => !c.image)) { showToast("ارفعي صورة لكل لون"); return; }
  if (workingSizes.length === 0) { showToast("أضيفي مقاساً واحداً على الأقل"); return; }

  /* نظّف المخزون من تركيبات قديمة لم تعد موجودة */
  const cleanStock = {};
  workingColors.forEach(c => workingSizes.forEach(sz => {
    const k = `${c.name}|${sz}`;
    cleanStock[k] = Number(workingStock[k] || 0);
  }));

  const product = {
    id: f.id.value || undefined,
    name: f.name.value.trim(),
    category: f.category.value,
    price: Number(f.price.value),
    discount: Math.max(0, Math.min(90, Number(f.discount.value) || 0)),
    description: f.description.value.trim(),
    colors: workingColors,
    sizes:  workingSizes,
    stock:  cleanStock,
  };
  ProductsAPI.save(product);
  $productModal.classList.remove("open");
  showToast(product.id ? "تم تعديل المنتج" : "تمت إضافة المنتج");
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
        const cover = p.colors?.[0]?.image || "";
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
      else if (b.dataset.act === "del" && confirm(`حذف "${p.name}"؟`)) {
        ProductsAPI.remove(p.id);
        showToast("تم الحذف");
        refreshAll();
      }
    };
  });
}
$searchInput.oninput = renderProductsTable;
$filterCat.onchange = renderProductsTable;

function stockPill(stock) {
  if (stock === 0) return `<span class="pill lowstock">${t("admin.stock.out")}</span>`;
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
            <tr><th>اللون \\ المقاس</th>${p.sizes.map(s => `<th>${escapeHtml(s)}</th>`).join("")}</tr>
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
          <button class="icon-btn-sm ok" data-save="${p.id}" style="margin-top:8px;">حفظ التحديثات</button>`;
        return `
          <tr>
            <td style="vertical-align:top;">
              <div style="display:flex; align-items:center; gap:10px;">
                <img class="thumb" src="${escapeAttr(p.colors[0]?.image || "")}" alt="">
                <div>${escapeHtml(p.name)}<br><small style="color:var(--muted)">${Utils.fmt(p.price)}</small></div>
              </div>
            </td>
            <td>${total}</td>
            <td>${stockPill(total)}</td>
            <td>${variantsHtml}</td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="4" style="text-align:center; color:var(--ok); padding:30px;">✓ كل المنتجات بحالة جيدة.</td></tr>`;

  document.querySelectorAll("button[data-save]").forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.save;
      const p = ProductsAPI.get(pid);
      document.querySelectorAll(`input[data-pid="${pid}"]`).forEach(inp => {
        p.stock[inp.dataset.key] = Math.max(0, Number(inp.value) || 0);
      });
      ProductsAPI.save(p);
      showToast("تم تحديث المخزون");
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
  $filterCity.innerHTML = `<option value="">${t("admin.orders.all_cities")}</option>` +
    GAZA_CITIES.map(c => `<option value="${c.id}">${t("city." + c.id)}</option>`).join("");
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
    $dCity.innerHTML = `<option value="">${t("admin.orders.all_cities")}</option>` +
      GAZA_CITIES.map(c => `<option value="${c.id}">${t("city." + c.id)}</option>`).join("");
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
  showToast("تم حفظ المعلومات");
};

/* الحسابات البنكية */
const $banksList = document.getElementById("banksList");
function renderBanksList() {
  const banks = SettingsAPI.get().bankAccounts || [];
  $banksList.innerHTML = banks.length ? banks.map(b => `
    <div class="bank-row" data-id="${b.id}">
      <input class="input" data-f="bankName"      value="${escapeAttr(b.bankName)}"      placeholder="اسم البنك">
      <input class="input" data-f="accountName"   value="${escapeAttr(b.accountName)}"   placeholder="اسم صاحب الحساب">
      <input class="input" data-f="accountNumber" value="${escapeAttr(b.accountNumber)}" placeholder="رقم الحساب">
      <input class="input" data-f="iban"          value="${escapeAttr(b.iban)}"          placeholder="IBAN">
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
      showToast("تم حفظ الحساب");
    };
    row.querySelector('[data-act="del-bank"]').onclick = () => {
      if (!confirm("حذف هذا الحساب؟")) return;
      SettingsAPI.removeBank(id);
      renderBanksList();
      showToast("تم الحذف");
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
      <div>الكود</div><div>النوع</div><div>القيمة</div><div>أدنى طلب</div>
      <div>الحالة</div><div>الاستخدام</div><div></div>
    </div>
    ${coupons.map(c => `
      <div class="coupon-row-admin" data-id="${c.id}">
        <input class="input" data-f="code"     value="${escapeAttr(c.code)}"     placeholder="WELCOME10" style="text-transform:uppercase;">
        <select class="input" data-f="type">
          <option value="percent" ${c.type === "percent" ? "selected" : ""}>نسبة %</option>
          <option value="fixed"   ${c.type === "fixed"   ? "selected" : ""}>مبلغ ثابت ₪</option>
        </select>
        <input class="input" data-f="value"    value="${Number(c.value || 0)}" type="number" min="0">
        <input class="input" data-f="minOrder" value="${Number(c.minOrder || 0)}" type="number" min="0">
        <label class="toggle">
          <input type="checkbox" data-f="active" ${c.active ? "checked" : ""}>
          <span>${c.active ? "فعّال" : "موقوف"}</span>
        </label>
        <div class="uses">${c.usedCount || 0} مرة</div>
        <div class="actions">
          <button class="icon-btn-sm ok"     data-act="save-coupon">حفظ</button>
          <button class="icon-btn-sm danger" data-act="del-coupon">حذف</button>
        </div>
      </div>
    `).join("")}
  ` : `<p style="color:var(--muted); font-size:13px;">لا توجد أكواد. اضغطي "إضافة كود".</p>`;

  $couponsList.querySelectorAll(".coupon-row-admin[data-id]").forEach(row => {
    const id = row.dataset.id;
    const cb = row.querySelector('input[data-f="active"]');
    if (cb) cb.onchange = () => {
      cb.nextElementSibling.textContent = cb.checked ? "فعّال" : "موقوف";
    };

    row.querySelector('[data-act="save-coupon"]').onclick = () => {
      const patch = { id };
      row.querySelectorAll("[data-f]").forEach(el => {
        const k = el.dataset.f;
        patch[k] = el.type === "checkbox" ? el.checked
                  : el.type === "number"  ? Number(el.value || 0)
                  : (k === "code" ? el.value.trim().toUpperCase() : el.value.trim());
      });
      if (!patch.code) { showToast("أدخلي الكود أولاً"); return; }
      const existing = CouponsAPI.list().find(x => x.id === id);
      CouponsAPI.save({ ...existing, ...patch });
      renderCouponsList();
      showToast("تم حفظ الكود ✓");
    };

    row.querySelector('[data-act="del-coupon"]').onclick = () => {
      if (!confirm("حذف هذا الكود؟")) return;
      CouponsAPI.remove(id);
      renderCouponsList();
      showToast("تم الحذف");
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
  if (f.get("next") !== f.get("confirm")) { showToast("الكلمة الجديدة غير متطابقة"); return; }
  if (!AuthAPI.changePassword(f.get("current"), f.get("next"))) {
    showToast("الكلمة الحالية غير صحيحة"); return;
  }
  e.target.reset();
  showToast("تم تحديث كلمة المرور ✓");
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

/* أدوات */
function truncate(s, n) { s = s || ""; return s.length > n ? s.slice(0, n) + "…" : s; }
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
