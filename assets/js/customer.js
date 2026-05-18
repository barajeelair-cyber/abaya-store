/* =========================================================
   عبايات أمل  —  منطق واجهة الزبون
   ========================================================= */

document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

let currentCategory = "all";
let currentProduct  = null;          /* داخل المودال */
let selectedColor   = null;
let selectedSize    = null;
let selectedImageIdx = 0;
let paymentProof    = null;          /* base64 data URL */
let appliedCoupon   = null;          /* { code, discount, coupon } */

/* حالة الفلاتر */
const filters = {
  fabric: new Set(),
  cut: new Set(),
  color: new Set(),
  size: new Set(),
  priceMin: null,
  priceMax: null,
  bestseller: false,
  isNew: false,
  embroidered: false,
  open: false,
  availableOnly: false,
};

const cart = new Map();              /* key = `${id}|${color}|${size}` */

/* ---------- DOM ---------- */
const $grid       = document.getElementById("productsGrid");
const $catsBar    = document.getElementById("categoriesBar");
const $catTitle   = document.getElementById("categoryTitle");
const $overlay    = document.getElementById("cartOverlay");
const $drawer     = document.getElementById("cartDrawer");
const $cartBody   = document.getElementById("cartBody");
const $cartBadge  = document.getElementById("cartBadge");
const $subTotal   = document.getElementById("subTotal");
const $openCart   = document.getElementById("openCart");
const $closeCart  = document.getElementById("closeCart");
const $goCheckout = document.getElementById("goCheckout");
const $checkout   = document.getElementById("checkoutModal");
const $citySel    = document.getElementById("citySelect");
const $summary    = document.getElementById("checkoutSummary");
const $form       = document.getElementById("checkoutForm");
const $cancelChk  = document.getElementById("cancelCheckout");
const $toast      = document.getElementById("toast");
const $bankList   = document.getElementById("bankAccountsList");
const $proofZone  = document.getElementById("proofZone");
const $proofInput = document.getElementById("proofInput");
const $proofPrev  = document.getElementById("proofPreview");
const $successMd  = document.getElementById("successModal");
const $pModal     = document.getElementById("productModal");
const $pdContent  = document.getElementById("pdetailsContent");

/* ---------- تطبيق إعدادات المتجر ---------- */
function applySettings() {
  applyTranslations();
  const s = SettingsAPI.get();
  if (getLang() === "ar" && s.headline) {
    const h = document.getElementById("headlineText");
    if (h) h.textContent = s.headline;
  }

  /* خلفية Hero  —  من الإعدادات إن كانت محفوظة */
  const heroSection = document.getElementById("heroSection");
  if (heroSection) {
    if (s.heroBgImage) {
      heroSection.style.setProperty("--hero-image", `url("${s.heroBgImage}")`);
    }
    const op = (s.heroBgOpacity !== undefined) ? Number(s.heroBgOpacity) : 0.55;
    heroSection.style.setProperty("--hero-bg-opacity", String(op));
  }

  const phoneText = s.contact?.phone || "";
  const waText    = s.contact?.whatsapp || "";
  const igHandle  = (s.contact?.instagram || "").replace(/^@/, "");
  const tel       = (phoneText || "").replace(/[^\d+]/g, "");
  const waNumber  = (waText || "").replace(/[^\d]/g, "");

  /* helpers آمنة - تتجاهل العناصر المحذوفة من DOM بدل ما ترمي خطأ */
  const setText = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
  const setHref = (id, href) => { const el = $(id); if (el) el.href = href; };
  const setDisplay = (id, disp) => { const el = $(id); if (el) el.style.display = disp; };

  setText("phoneText",       phoneText);
  setText("whatsappText",    waText);
  setText("instagramText",   igHandle ? "@" + igHandle : "");
  setText("footerPhoneText", phoneText);

  if (tel)      { setHref("phoneLink", `tel:${tel}`);    setHref("footerPhone", `tel:${tel}`); }
  if (waNumber) { setHref("whatsappLink", `https://wa.me/${waNumber}`); setHref("footerWa", `https://wa.me/${waNumber}`); }

  if (igHandle) {
    setHref("instagramLink", `https://instagram.com/${igHandle}`);
    setHref("footerIg",      `https://instagram.com/${igHandle}`);
  } else {
    setDisplay("instagramLink", "none");
    setDisplay("footerIg",      "none");
  }
}

/* ---------- تتبع الطلب ---------- */
function openTrackModal() {
  document.getElementById("trackInput").value = "";
  document.getElementById("trackResult").innerHTML = "";
  document.getElementById("trackModal").classList.add("open");
}
function closeTrackModal() { document.getElementById("trackModal").classList.remove("open"); }

function trackOrder() {
  const codeInput = (document.getElementById("trackInput").value || "").trim().toUpperCase();
  const result = document.getElementById("trackResult");
  if (!codeInput) { result.innerHTML = ""; return; }

  /* الرمز يأتي بصيغة AMA-XXXXXX أو فقط XXXXXX */
  const wanted = codeInput.replace(/^AMA-?/, "");
  const order = OrdersAPI.list().find(o =>
    String(o.id).slice(-6).toUpperCase() === wanted
  );

  if (!order) {
    result.innerHTML = `
      <div class="bank-card" style="border-color:var(--danger); text-align:center;">
        <p style="color:var(--danger); margin:0;">${t("track.not_found")}<br><small style="color:var(--muted)">${t("track.not_found_hint")}</small></p>
      </div>`;
    return;
  }

  const statusInfo = Utils.statusInfo(order.status);
  const steps = ["awaiting", "pending", "shipped", "delivered"];
  const isCancelled = order.status === "cancelled";
  const currentStepIdx = steps.indexOf(order.status);

  const itemsHtml = order.items.map(it => `
    <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:13px;">
      <span>${escapeHtml(it.name)}  —  ${escapeHtml(it.color)} · ${escapeHtml(it.size)} × ${it.qty}</span>
      <span>${Utils.fmt(it.price * it.qty)}</span>
    </div>`).join("");

  const stepsHtml = isCancelled
    ? `<div style="text-align:center; color:var(--danger); padding:14px 0; font-weight:700;">${t("track.cancelled")}</div>`
    : `
      <div class="track-steps">
        ${steps.map((s, i) => {
          const done = i <= currentStepIdx;
          const label = Utils.statusInfo(s).label;
          return `<div class="step ${done ? 'done' : ''}">
            <div class="dot">${done ? '✓' : i + 1}</div>
            <div class="label">${label}</div>
          </div>`;
        }).join('<div class="line ' + (currentStepIdx > 0 ? 'done' : '') + '"></div>')}
      </div>`;

  const cityName = Utils.cityById(order.cityId)?.name || order.cityName;

  result.innerHTML = `
    <div class="bank-card" style="background: linear-gradient(135deg, #1a1408, #0c0c0c);">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted)">${t("track.code_label")}</span>
        <strong style="color:var(--gold-2)">AMA-${String(order.id).slice(-6).toUpperCase()}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted)">${t("track.status_now")}</span>
        <strong style="color:var(--gold-2)">${statusInfo.label}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted)">${t("track.date")}</span>
        <strong>${Utils.formatDate(order.createdAt)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted)">${t("track.city")}</span>
        <strong>${escapeHtml(cityName)}</strong>
      </div>
      ${stepsHtml}
      <div style="border-top:1px dashed var(--line); margin-top:10px; padding-top:8px;">
        ${itemsHtml}
        <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px dashed var(--line);">
          <strong>${t("checkout.total")}</strong>
          <strong style="color:var(--gold-2)">${Utils.fmt(order.total)}</strong>
        </div>
      </div>
    </div>`;
}

function $(id) { return document.getElementById(id); }

/* =========================================================
   التصنيفات
========================================================= */
function renderCategories() {
  const cats = getActiveCategories();
  /* تبويبات خاصة: المفضلة + الأكثر مبيعاً، تظهر أولاً */
  const favCount = FavoritesAPI.count();
  const specialTabs = [
    { id: "__favorites__",  name: t("category.favorites") + (favCount ? ` (${favCount})` : ""), cls: "cat-pill-special cat-pill-fav" },
    { id: "__bestseller__", name: t("category.bestseller"), cls: "cat-pill-special cat-pill-best" },
  ];

  $catsBar.innerHTML = [
    ...specialTabs.map(s =>
      `<button class="cat-pill ${s.cls} ${s.id === currentCategory ? "active" : ""}" data-id="${s.id}">${s.name}</button>`),
    ...cats.map(c => {
      const info = Utils.categoryById(c.id);
      return `<button class="cat-pill ${c.id === currentCategory ? "active" : ""}" data-id="${c.id}">${escapeHtml(info.name)}</button>`;
    })
  ].join("");

  $catsBar.querySelectorAll(".cat-pill").forEach(b => {
    b.onclick = () => {
      currentCategory = b.dataset.id;
      let title;
      if (currentCategory === "__favorites__")       title = t("category.favorites");
      else if (currentCategory === "__bestseller__") title = t("category.bestseller");
      else {
        const cat = Utils.categoryById(currentCategory);
        title = cat.id === "all" ? t("section.collection") : cat.name;
      }
      $catTitle.textContent = title;
      renderCategories();
      renderProducts();
    };
  });
}

/* =========================================================
   عرض المنتجات
========================================================= */
function productMatchesFilters(p) {
  if (filters.fabric.size && !filters.fabric.has(p.fabric)) return false;
  if (filters.cut.size && !filters.cut.has(p.cut)) return false;
  if (filters.color.size) {
    const productColors = (p.colors || []).map(c => c.name);
    if (!productColors.some(n => filters.color.has(n))) return false;
  }
  if (filters.size.size) {
    const productSizes = p.sizes || [];
    if (!productSizes.some(s => filters.size.has(s))) return false;
  }
  const price = ProductsAPI.finalPrice(p);
  if (filters.priceMin !== null && price < filters.priceMin) return false;
  if (filters.priceMax !== null && price > filters.priceMax) return false;
  if (filters.bestseller   && !p.isBestseller) return false;
  if (filters.isNew        && !p.isNew) return false;
  if (filters.embroidered  && !p.isEmbroidered) return false;
  if (filters.open         && !p.isOpen) return false;
  if (filters.availableOnly && ProductsAPI.totalStock(p) === 0) return false;
  return true;
}

function renderProducts() {
  let products = ProductsAPI.list();
  if (currentCategory === "__favorites__") {
    const favs = FavoritesAPI.list();
    products = products.filter(p => favs.includes(p.id));
    if (products.length === 0) {
      $grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--muted); padding:50px 0;">${t("favorites.empty")}</p>`;
      return;
    }
  } else if (currentCategory === "__bestseller__") {
    products = products.filter(p => p.isBestseller);
  } else if (currentCategory !== "all") {
    products = products.filter(p => p.category === currentCategory);
  }
  products = products.filter(productMatchesFilters);

  $grid.innerHTML = products.length ? products.map(p => {
    const total = ProductsAPI.totalStock(p);
    const out   = total === 0;
    const low   = !out && total <= LOW_STOCK_THRESHOLD;
    const cover = ProductsAPI.coverImage(p);
    const final = ProductsAPI.finalPrice(p);
    const hasDiscount = Number(p.discount) > 0;

    const isFav = FavoritesAPI.has(p.id);
    return `
      <article class="card" data-id="${p.id}">
        <button class="fav-btn ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="favorite">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div class="img-wrap">
          ${out ? `<span class="badge badge-out">${t("product.out_of_stock")}</span>` : ""}
          ${low && !out ? `<span class="badge badge-low">${t("product.limited")}</span>` : ""}
          ${hasDiscount ? `<span class="badge badge-discount">${t("product.discount_label")} ${p.discount}%</span>` : ""}
          <img src="${escapeHtml(cover)}" alt="${escapeHtml(p.name)}" loading="lazy" />
        </div>
        <div class="card-body">
          <h3>${escapeHtml(p.name)}</h3>
          <p class="desc">${escapeHtml(truncate(p.description, 70))}</p>
          <div class="card-row">
            <div>
              ${hasDiscount ? `<span class="price-old">${Utils.fmt(p.price)}</span>` : ""}
              <span class="price">${Utils.fmt(final)}</span>
            </div>
            <button class="view-btn" ${out ? "disabled" : ""}>
              ${out ? t("product.unavailable") : t("product.view")}
            </button>
          </div>
        </div>
      </article>`;
  }).join("") : `<p style="grid-column:1/-1; text-align:center; color:var(--muted); padding:50px 0;">${t("section.no_products")}</p>`;

  $grid.querySelectorAll(".card").forEach(card => {
    card.querySelector(".view-btn")?.addEventListener("click", () => openProductModal(card.dataset.id));
    card.addEventListener("click", e => {
      /* تجاهل النقر إذا كان على زر (المفضلة أو العرض) */
      if (e.target.closest("button")) return;
      openProductModal(card.dataset.id);
    });
  });
  /* زر المفضلة */
  $grid.querySelectorAll(".fav-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const pid = btn.dataset.fav;
      const added = FavoritesAPI.toggle(pid);
      btn.classList.toggle("active", added);
      const svg = btn.querySelector("svg");
      if (svg) svg.setAttribute("fill", added ? "currentColor" : "none");
      showToast(t(added ? "favorites.added" : "favorites.removed"));
      /* أعِد رسم التبويبات لتحديث العدد */
      renderCategories();
    };
  });
}

/* =========================================================
   مودال تفاصيل المنتج (اختيار لون+مقاس)
========================================================= */
function openProductModal(id) {
  const p = ProductsAPI.get(id);
  if (!p) return;
  currentProduct = p;
  selectedColor  = p.colors?.[0]?.name || null;
  selectedSize   = null;
  selectedImageIdx = 0;
  renderProductModal();
  $pModal.classList.add("open");
}
function closeProductModal() { $pModal.classList.remove("open"); }
document.getElementById("closeProductModal")?.addEventListener("click", closeProductModal);

function renderProductModal() {
  const p = currentProduct;
  const colorObj = p.colors.find(c => c.name === selectedColor) || p.colors[0];
  const finalPrice = ProductsAPI.finalPrice(p);
  const hasDiscount = Number(p.discount) > 0;

  /* المقاسات المتاحة لهذا اللون */
  const sizesHtml = p.sizes.map(sz => {
    const stk = ProductsAPI.variantStock(p, selectedColor, sz);
    return `<button class="size-chip ${selectedSize === sz ? "active" : ""}" data-sz="${sz}" ${stk === 0 ? "disabled" : ""}>${sz}</button>`;
  }).join("");

  const colorsHtml = p.colors.map(c =>
    `<button class="color-chip ${c.name === selectedColor ? "active" : ""}" data-color="${escapeHtml(c.name)}">${escapeHtml(c.name)}</button>`
  ).join("");

  const variantStock = selectedSize ? ProductsAPI.variantStock(p, selectedColor, selectedSize) : null;

  /* صور اللون المُختار (تدعم الصيغة القديمة .image والجديدة .images[]) */
  const images = ProductsAPI.colorImages(colorObj);
  if (selectedImageIdx >= images.length) selectedImageIdx = 0;
  const mainSrc = images[selectedImageIdx] || "";
  const thumbsHtml = images.length > 1 ? `
    <div class="thumbs-row">
      ${images.map((src, i) =>
        `<button type="button" class="thumb-btn ${i === selectedImageIdx ? "active" : ""}" data-img-idx="${i}">
          <img src="${escapeHtml(src)}" alt="">
        </button>`
      ).join("")}
    </div>` : "";

  $pdContent.innerHTML = `
    <div class="image-side">
      <div class="main-image">
        <img src="${escapeHtml(mainSrc)}" alt="${escapeHtml(p.name)}">
      </div>
      ${thumbsHtml}
    </div>
    <div class="info-side">
      <h2>${escapeHtml(p.name)}</h2>
      <p class="desc">${escapeHtml(p.description || "")}</p>
      <div class="price-block">
        ${hasDiscount ? `<span class="price-old">${Utils.fmt(p.price)}</span>` : ""}
        <span class="price">${Utils.fmt(finalPrice)}</span>
        ${hasDiscount ? `<span class="badge badge-discount" style="position:static">${t("product.discount_label")} ${p.discount}%</span>` : ""}
      </div>

      <div class="opt-label">${t("product.color")}</div>
      <div class="colors-row" id="colorsRow">${colorsHtml}</div>

      <div class="opt-label opt-label-row">
        <span>${t("product.size")}</span>
        <button type="button" class="size-guide-link" id="openSizeGuideBtn">📏 ${t("sizeGuide.link")}</button>
      </div>
      <div class="sizes-row" id="sizesRow">${sizesHtml}</div>

      ${variantStock !== null
        ? `<div class="stock-line ${variantStock <= LOW_STOCK_THRESHOLD ? "low" : ""}">
             ${variantStock === 0 ? t("product.size_out") : t("product.stock_available") + " " + variantStock + " " + t("product.stock_piece")}
           </div>`
        : `<div class="stock-line">${t("product.stock_choose_size")}</div>`
      }

      <div class="pdetails-actions">
        <button class="btn-gold" id="addToCartBtn" ${!selectedSize || variantStock === 0 ? "disabled" : ""}>
          ${t("product.add_to_cart")}
        </button>
      </div>
    </div>`;

  /* ربط الأحداث */
  $pdContent.querySelectorAll(".color-chip").forEach(b => {
    b.onclick = () => {
      selectedColor = b.dataset.color;
      selectedSize  = null;
      selectedImageIdx = 0;
      renderProductModal();
    };
  });
  $pdContent.querySelectorAll(".size-chip:not(:disabled)").forEach(b => {
    b.onclick = () => {
      selectedSize = b.dataset.sz;
      renderProductModal();
    };
  });
  /* صور إضافية */
  $pdContent.querySelectorAll(".thumb-btn").forEach(b => {
    b.onclick = () => {
      selectedImageIdx = Number(b.dataset.imgIdx);
      renderProductModal();
    };
  });
  const addBtn = $pdContent.querySelector("#addToCartBtn");
  if (addBtn) addBtn.onclick = () => addCurrentToCart();
  /* رابط دليل المقاسات داخل نافذة المنتج */
  $pdContent.querySelector("#openSizeGuideBtn")?.addEventListener("click", () => {
    document.getElementById("sizeGuideModal")?.classList.add("open");
  });
}

function addCurrentToCart() {
  if (!currentProduct || !selectedColor || !selectedSize) return;
  const p = currentProduct;
  const stk = ProductsAPI.variantStock(p, selectedColor, selectedSize);
  if (stk <= 0) { showToast(t("cart.variant_out")); return; }

  const key = `${p.id}|${selectedColor}|${selectedSize}`;
  const existing = cart.get(key);
  const qty = existing ? existing.qty + 1 : 1;
  if (qty > stk) { showToast(t("cart.stock_less")); return; }

  const colorObj = p.colors.find(c => c.name === selectedColor);
  cart.set(key, {
    productId: p.id,
    name: p.name,
    price: ProductsAPI.finalPrice(p),
    originalPrice: p.price,
    discount: p.discount || 0,
    color: selectedColor,
    size: selectedSize,
    image: ProductsAPI.colorImages(colorObj)[0] || "",
    qty,
  });
  renderCart();
  closeProductModal();
  openCart();
  showToast(t("cart.add_success"));
}

/* =========================================================
   السلة
========================================================= */
function changeQty(key, delta) {
  const item = cart.get(key);
  if (!item) return;
  const p = ProductsAPI.get(item.productId);
  const stk = ProductsAPI.variantStock(p, item.color, item.size);
  const next = item.qty + delta;
  if (next <= 0) cart.delete(key);
  else if (next > stk) { showToast(t("cart.no_more")); return; }
  else item.qty = next;
  renderCart();
}
function removeFromCart(key) { cart.delete(key); renderCart(); }

function cartSubtotal() {
  let s = 0; cart.forEach(it => s += it.qty * it.price); return s;
}
function cartSavings() {
  let s = 0; cart.forEach(it => s += it.qty * Math.max(0, it.originalPrice - it.price)); return s;
}

function renderCart() {
  if (cart.size === 0) {
    $cartBody.innerHTML = `<div class="cart-empty">${t("cart.empty")}<br/>${t("cart.empty_sub")}</div>`;
    $goCheckout.disabled = true;
  } else {
    $cartBody.innerHTML = [...cart.entries()].map(([key, it]) => `
      <div class="cart-item" data-key="${escapeHtml(key)}">
        <img src="${escapeHtml(it.image)}" alt="">
        <div class="info">
          <h5>${escapeHtml(it.name)}</h5>
          <div class="meta">${escapeHtml(it.color)} · ${escapeHtml(it.size)} · ${Utils.fmt(it.price)}</div>
          <div class="qty">
            <button data-act="dec">−</button>
            <span>${it.qty}</span>
            <button data-act="inc">+</button>
          </div>
        </div>
        <button class="remove" data-act="rm" aria-label="إزالة">🗑️</button>
      </div>
    `).join("");

    $cartBody.querySelectorAll(".cart-item").forEach(row => {
      const key = row.dataset.key;
      row.querySelector('[data-act="inc"]').onclick = () => changeQty(key, +1);
      row.querySelector('[data-act="dec"]').onclick = () => changeQty(key, -1);
      row.querySelector('[data-act="rm"]').onclick  = () => removeFromCart(key);
    });
    $goCheckout.disabled = false;
  }
  $cartBadge.textContent = [...cart.values()].reduce((n, it) => n + it.qty, 0);
  $subTotal.textContent  = Utils.fmt(cartSubtotal());
}

function openCart()  { $drawer.classList.add("open"); $overlay.classList.add("open"); }
function closeCart() { $drawer.classList.remove("open"); $overlay.classList.remove("open"); }
$openCart?.addEventListener("click", openCart);
$closeCart?.addEventListener("click", closeCart);
$overlay?.addEventListener("click", closeCart);

/* =========================================================
   إتمام الطلب
========================================================= */
function fillCities() {
  const cities = CitiesAPI.active();
  const lang = getLang();
  $citySel.innerHTML =
    `<option value="" disabled selected>${t("checkout.city_placeholder")}</option>` +
    cities.map(c => {
      const name = (lang === "en" && c.name_en) ? c.name_en : c.name_ar;
      return `<option value="${c.id}">${escapeHtml(name)}  —  ${t("checkout.delivery_to")} ${c.fee} ₪</option>`;
    }).join("");
}

function renderBankAccounts() {
  const banks = SettingsAPI.get().bankAccounts || [];
  $bankList.innerHTML = banks.length ? banks.map(b => `
    <div class="bank-card">
      <h5>🏦 ${escapeHtml(b.bankName)}</h5>
      <div class="row"><span>${t("checkout.bank_name")}</span><strong>${escapeHtml(b.accountName)}</strong></div>
      <div class="row">
        <span>${t("checkout.bank_number")}</span>
        <strong>${escapeHtml(b.accountNumber)}</strong>
        <button type="button" class="copy" data-copy="${escapeHtml(b.accountNumber)}">${t("checkout.copy")}</button>
      </div>
      <div class="row">
        <span>${t("checkout.bank_iban")}</span>
        <strong>${escapeHtml(b.iban)}</strong>
        <button type="button" class="copy" data-copy="${escapeHtml(b.iban)}">${t("checkout.copy")}</button>
      </div>
    </div>
  `).join("") : `<p style="color:var(--muted); font-size:13px;">${t("checkout.no_banks")}</p>`;

  $bankList.querySelectorAll(".copy").forEach(b =>
    b.onclick = () => { navigator.clipboard.writeText(b.dataset.copy); showToast(t("checkout.copied")); }
  );
}

function renderSummary() {
  const sub = cartSubtotal();
  const saved = cartSavings();
  const city = Utils.cityById($citySel.value);
  const fee = city ? city.fee : 0;

  /* أعد التحقق من الكوبون لو تغيّر المجموع الفرعي */
  let couponDiscount = 0;
  if (appliedCoupon) {
    const v = CouponsAPI.validate(appliedCoupon.code, sub);
    if (v.ok) { couponDiscount = v.discount; appliedCoupon.discount = couponDiscount; }
    else { appliedCoupon = null; setCouponStatus(v.reason, "err"); }
  }

  const total = Math.max(0, sub + fee - couponDiscount);
  $summary.innerHTML = `
    <div class="row"><span>${t("checkout.items_count")}</span><span>${[...cart.values()].reduce((n,it)=>n+it.qty,0)}</span></div>
    <div class="row"><span>${t("checkout.subtotal")}</span><span>${Utils.fmt(sub)}</span></div>
    ${saved > 0 ? `<div class="row discount"><span>${t("checkout.discount_products")}</span><span>− ${Utils.fmt(saved)}</span></div>` : ""}
    ${couponDiscount > 0 ? `<div class="row discount"><span>${t("checkout.coupon_line")} (${escapeHtml(appliedCoupon.code)})</span><span>− ${Utils.fmt(couponDiscount)}</span></div>` : ""}
    <div class="row"><span>${t("checkout.delivery")} ${city ? "(" + city.name + ")" : ""}</span><span>${Utils.fmt(fee)}</span></div>
    <div class="row total"><span>${t("checkout.total")}</span><span>${Utils.fmt(total)}</span></div>
  `;
}

function setCouponStatus(msg, kind) {
  const el = document.getElementById("couponStatus");
  if (!el) return;
  el.textContent = msg || "";
  el.className = "coupon-status" + (kind ? " " + kind : "");
}

function applyCoupon() {
  const code = document.getElementById("couponInput").value.trim();
  if (!code) { appliedCoupon = null; setCouponStatus("", ""); renderSummary(); return; }
  const v = CouponsAPI.validate(code, cartSubtotal());
  if (v.ok) {
    appliedCoupon = { code: v.coupon.code, discount: v.discount, coupon: v.coupon };
    const label = v.coupon.type === "percent"
      ? `${v.coupon.value}% ${t("coupon.discount_percent")}`
      : `${v.coupon.value} ₪`;
    setCouponStatus(`${t("coupon.applied")} (${label})`, "ok");
  } else {
    /* الرسالة من validate تأتي كنص ثابت بالعربي - نخريطها للترجمات */
    const reasonMap = {
      "الكود غير موجود": "coupon.not_found",
      "هذا الكود غير مُفعَّل": "coupon.inactive",
    };
    const minReason = /الحد الأدنى/.test(v.reason);
    let msg = v.reason;
    if (reasonMap[v.reason]) msg = t(reasonMap[v.reason]);
    else if (minReason) msg = `${t("coupon.min_order")} ${v.reason.match(/\d+/)?.[0] || ""} ₪`;
    appliedCoupon = null;
    setCouponStatus("✕ " + msg, "err");
  }
  renderSummary();
}

if ($goCheckout) {
  $goCheckout.onclick = () => {
    if (cart.size === 0) return;
    fillCities();
    renderBankAccounts();
    paymentProof = null;
    appliedCoupon = null;
    if ($proofPrev) $proofPrev.innerHTML = "";
    const couponEl = document.getElementById("couponInput");
    if (couponEl) couponEl.value = "";
    setCouponStatus("", "");
    renderSummary();
    $checkout?.classList.add("open");
  };
}

document.getElementById("applyCouponBtn")?.addEventListener("click", applyCoupon);
document.getElementById("couponInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); applyCoupon(); }
});
$cancelChk?.addEventListener("click", () => $checkout?.classList.remove("open"));
$citySel?.addEventListener("change", renderSummary);

/* رفع صورة التحويل */
if ($proofInput) {
  $proofInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast(t("checkout.image_too_big")); return; }
    paymentProof = await Utils.fileToDataURL(file);
    if ($proofPrev) {
      $proofPrev.innerHTML = `
        <div class="upload-preview">
          <img src="${paymentProof}" alt="">
          <div class="meta">✓ ${(file.size/1024).toFixed(0)} KB</div>
          <button type="button" class="remove-img" id="removeProof">✕</button>
        </div>`;
      document.getElementById("removeProof")?.addEventListener("click", () => {
        paymentProof = null; $proofPrev.innerHTML = ""; $proofInput.value = "";
      });
    }
  };
}
/* Drag & Drop */
if ($proofZone && $proofInput) {
  ["dragover", "dragenter"].forEach(evt =>
    $proofZone.addEventListener(evt, e => { e.preventDefault(); $proofZone.classList.add("dragover"); })
  );
  ["dragleave", "drop"].forEach(evt =>
    $proofZone.addEventListener(evt, e => { e.preventDefault(); $proofZone.classList.remove("dragover"); })
  );
  $proofZone.addEventListener("drop", e => {
    const file = e.dataTransfer.files?.[0];
    if (file) { $proofInput.files = e.dataTransfer.files; $proofInput.dispatchEvent(new Event("change")); }
  });
}

/* إرسال الطلب */
if ($form) $form.onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData($form);
  const city = Utils.cityById(data.get("city"));
  if (!city) { showToast(t("checkout.select_city")); return; }
  if (!paymentProof) { showToast(t("checkout.upload_first")); return; }

  const items = [...cart.values()].map(it => ({
    productId: it.productId, name: it.name,
    price: it.price, qty: it.qty,
    color: it.color, size: it.size, image: it.image,
  }));
  const subtotal = cartSubtotal();
  const savings  = cartSavings();
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const couponCode     = appliedCoupon ? appliedCoupon.code : "";
  const total = Math.max(0, subtotal + city.fee - couponDiscount);

  OrdersAPI.add({
    customer: {
      name:  data.get("name"),
      phone: data.get("phone"),
      area:  data.get("area"),
      notes: data.get("notes") || "",
    },
    cityId: city.id, cityName: city.name,
    deliveryFee: city.fee,
    items, subtotal, savings,
    couponCode, couponDiscount,
    total,
    paymentProof,
  });

  if (couponCode) CouponsAPI.recordUse(couponCode);

  cart.clear();
  renderCart();
  renderProducts();
  $checkout.classList.remove("open");
  closeCart();
  $form.reset();
  paymentProof = null; $proofPrev.innerHTML = "";
  appliedCoupon = null;
  setCouponStatus("", "");
  $successMd.classList.add("open");
};
document.getElementById("successOk")?.addEventListener("click", () => $successMd?.classList.remove("open"));

/* =========================================================
   أدوات
========================================================= */
let toastTimer;
function showToast(msg) {
  $toast.textContent = msg; $toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("show"), 2200);
}
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function truncate(s, n) { s = s || ""; return s.length > n ? s.slice(0, n) + "…" : s; }

/* =========================================================
   دليل المقاسات التفاعلي (نظام دولي/خليجي + حاسبة)
========================================================= */
let currentSizeSystem = "intl";

function renderSizeTable() {
  if (!window.SizeChartsAPI) return;
  const charts = SizeChartsAPI.get();
  const rows = charts[currentSizeSystem] || [];
  const lang = getLang();
  const tbl = document.getElementById("sizeTable");
  if (!tbl) return;
  const intlHeader = currentSizeSystem === "intl" ? "EU / US" : (lang === "en" ? "Intl" : "دولي");
  tbl.innerHTML = `
    <thead><tr>
      <th>${t("sizeGuide.size")}</th>
      <th>${t("sizeGuide.chest_cm")}</th>
      <th>${t("sizeGuide.waist_cm")}</th>
      <th>${t("sizeGuide.hips_cm")}</th>
      <th>${t("sizeGuide.length_cm")}</th>
      <th>${intlHeader}</th>
    </tr></thead>
    <tbody>
      ${rows.map(r => `<tr><th>${escapeHtml(r.size)}</th><td>${escapeHtml(r.chest)}</td><td>${escapeHtml(r.waist)}</td><td>${escapeHtml(r.hips)}</td><td>${escapeHtml(r.length)}</td><td>${escapeHtml(r.intl)}</td></tr>`).join("")}
    </tbody>`;
  /* وصف ديناميكي */
  const $desc = document.getElementById("sizeGuideDesc");
  if ($desc) $desc.textContent = charts.description?.[lang] || charts.description?.ar || "";
}

function parseRange(rangeStr) {
  /* "84–88" → {min:84, max:88} */
  const m = String(rangeStr || "").match(/(\d+)\D+(\d+)/);
  if (m) return { min: +m[1], max: +m[2] };
  const n = parseInt(rangeStr, 10);
  return isFinite(n) ? { min: n, max: n } : null;
}

function calculateSize(chest, waist, hips) {
  const charts = SizeChartsAPI.get();
  const rows = charts[currentSizeSystem] || [];
  /* لكل صف، احسب درجة التطابق (كم قياس داخل النطاق) */
  let best = null, bestScore = -1;
  rows.forEach(r => {
    let score = 0;
    [["chest", chest], ["waist", waist], ["hips", hips]].forEach(([k, val]) => {
      if (!val) return;
      const rng = parseRange(r[k]);
      if (!rng) return;
      if (val >= rng.min - 1 && val <= rng.max + 1) score += 2;
      else if (val < rng.min) score -= (rng.min - val) * 0.3;
      else score -= (val - rng.max) * 0.3;
    });
    if (score > bestScore) { bestScore = score; best = r; }
  });
  return best;
}

document.querySelectorAll(".sst-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentSizeSystem = btn.dataset.system;
    document.querySelectorAll(".sst-btn").forEach(b => b.classList.toggle("active", b === btn));
    renderSizeTable();
  });
});

document.getElementById("calcBtn")?.addEventListener("click", () => {
  const chest = Number(document.getElementById("calcChest")?.value);
  const waist = Number(document.getElementById("calcWaist")?.value);
  const hips  = Number(document.getElementById("calcHips")?.value);
  const $result = document.getElementById("calcResult");
  if (!$result) return;
  if (!chest && !waist && !hips) {
    $result.innerHTML = `<p style="color:var(--muted)">${t("sizeGuide.calc_no_match")}</p>`;
    return;
  }
  const match = calculateSize(chest, waist, hips);
  if (match) {
    $result.innerHTML = `
      <div class="calc-result-card">
        <span class="calc-result-label">${t("sizeGuide.calc_result")}</span>
        <span class="calc-result-size">${escapeHtml(match.size)}</span>
        <span class="calc-result-meta">${escapeHtml(match.intl)}</span>
      </div>`;
  } else {
    $result.innerHTML = `<p style="color:var(--danger)">${t("sizeGuide.calc_no_match")}</p>`;
  }
});

/* دليل المقاسات  —  ربط زر الإغلاق + ملء الجدول عند الفتح */
document.getElementById("sizeGuideClose")?.addEventListener("click", () =>
  document.getElementById("sizeGuideModal")?.classList.remove("open"));

/* رسم الجدول الأولي */
renderSizeTable();

/* تتبع الطلب  —  ربط الأحداث */
document.getElementById("trackOrderLink")?.addEventListener("click", (e) => {
  e.preventDefault(); openTrackModal();
});
document.getElementById("trackSearchBtn")?.addEventListener("click", trackOrder);
document.getElementById("trackCloseBtn")?.addEventListener("click", closeTrackModal);
document.getElementById("trackInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); trackOrder(); }
});

/* =========================================================
   PWA  —  تسجيل Service Worker وزر التثبيت
========================================================= */
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
  document.getElementById("installBtn")?.style.setProperty("display", "inline-block");
});

window.addEventListener("appinstalled", () => {
  deferredPwaPrompt = null;
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "none";
  showToast(t("pwa.installed"));
});

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

document.getElementById("installBtn")?.addEventListener("click", async () => {
  if (isStandalone()) { showToast(t("pwa.installed")); return; }
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    const { outcome } = await deferredPwaPrompt.userChoice;
    if (outcome === "accepted") {
      document.getElementById("installBtn").style.display = "none";
    }
    deferredPwaPrompt = null;
  } else if (isIOS()) {
    document.getElementById("iosInstallModal").classList.add("open");
  } else {
    /* لم يُفعَّل الـ install prompt بعد  —  اعرض تعليمات iOS كاحتياط */
    document.getElementById("iosInstallModal").classList.add("open");
  }
});

document.getElementById("iosInstallClose")?.addEventListener("click", () => {
  document.getElementById("iosInstallModal").classList.remove("open");
});

/* أخفِ الزر إذا كان التطبيق مثبَّتاً مسبقاً */
if (isStandalone()) {
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "none";
}

/* =========================================================
   حساب الزبون: تسجيل دخول / تسجيل حساب / متابعة كزائر
   كل ربط حدث محصَّن: نتحقق من وجود العنصر أولاً حتى لا يتعطل
   الـ JS لو كانت نسخة HTML قديمة محفوظة في كاش المتصفح.
========================================================= */
const $accountBtn = document.getElementById("accountBtn");
const $authModal  = document.getElementById("authModal");

function updateAccountButton() {
  if (!$accountBtn || !window.CustomersAPI) return;
  const c = CustomersAPI.current();
  const iconSvg = `
    <svg class="account-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="7.5" r="3.2"/>
      <path d="M8.2 7.5c-.2-1.8.5-3.5 1.8-4.4 1.4-1 3.5-1 4.9 0 1.3.9 2 2.6 1.8 4.4-.5-.7-1.4-1.3-2.5-1.6-1.7-.5-3.6-.5-5.3 0-1.1.3-2 .9-2.5 1.6"/>
      <path d="M5 21c1-4 3-7 7-7s6 3 7 7"/>
      <path d="M12 14v7" stroke-width="1"/>
    </svg>`;
  if (!c) {
    $accountBtn.innerHTML = `${iconSvg}<span>${t("auth.account_btn")}</span>`;
  } else {
    const short = (c.name || "").split(" ")[0];
    $accountBtn.innerHTML = `${iconSvg}<span>${escapeHtml(short)}</span>`;
  }
}

function openAuthModal()  { $authModal?.classList.add("open"); }
function closeAuthModal() { $authModal?.classList.remove("open"); }

if ($accountBtn && window.CustomersAPI) {
  $accountBtn.addEventListener("click", () => {
    const c = CustomersAPI.current();
    if (!c) { openAuthModal(); return; }
    const choice = prompt(
      `${t("auth.welcome_back")} ${c.name}\n\n1 - ${t("auth.my_orders")}\n2 - ${t("auth.logout")}`,
      "1"
    );
    if (choice === "1") openMyOrders();
    else if (choice === "2") {
      CustomersAPI.logout();
      updateAccountButton();
      showToast(t("auth.logged_out"));
    }
  });
}

/* تبويبات Auth */
document.querySelectorAll(".auth-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".auth-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".auth-form").forEach(f => {
      f.style.display = f.dataset.form === tab ? "block" : "none";
    });
  });
});

document.getElementById("continueAsGuest")?.addEventListener("click", closeAuthModal);

document.getElementById("loginCustForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!window.CustomersAPI) return;
  const f = new FormData(e.target);
  const r = CustomersAPI.login(f.get("phone"), f.get("password"));
  if (r.ok) {
    closeAuthModal();
    updateAccountButton();
    showToast(t("auth.logged_in"));
    e.target.reset();
  } else {
    showToast(t("auth.err." + r.reason));
  }
});

document.getElementById("registerCustForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!window.CustomersAPI) return;
  const f = new FormData(e.target);
  const r = CustomersAPI.register({
    name: f.get("name"),
    phone: f.get("phone"),
    password: f.get("password"),
  });
  if (r.ok) {
    closeAuthModal();
    updateAccountButton();
    showToast(t("auth.registered"));
    e.target.reset();
  } else {
    showToast(t("auth.err." + r.reason));
  }
});

function openMyOrders() {
  if (!window.CustomersAPI) return;
  const c = CustomersAPI.current();
  if (!c) return;
  const phone = String(c.phone || "").replace(/\D/g, "");
  const myOrders = OrdersAPI.list().filter(o =>
    String(o.customer?.phone || "").replace(/\D/g, "") === phone
  );
  const body = document.getElementById("myOrdersBody");
  if (!body) return;
  body.innerHTML = myOrders.length ? myOrders.map(o => {
    const code = "AMA-" + String(o.id).slice(-6).toUpperCase();
    const status = Utils.statusInfo(o.status);
    const cityName = Utils.cityById(o.cityId)?.name || o.cityName;
    return `
      <div class="bank-card" style="margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:var(--gold-2)">${code}</strong>
          <span style="color:var(--muted); font-size:12px;">${Utils.formatDate(o.createdAt)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;">
          <span style="color:var(--muted)">${escapeHtml(cityName)} · ${o.items.reduce((n,it)=>n+it.qty,0)} ${t("product.stock_piece")}</span>
          <strong>${Utils.fmt(o.total)}</strong>
        </div>
        <div><span class="pill" style="background:rgba(212,175,55,.15); color:var(--gold-2); padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700;">${status.label}</span></div>
      </div>`;
  }).join("") : `<p style="text-align:center; color:var(--muted); padding:20px 0;">${t("auth.no_orders")}</p>`;
  document.getElementById("myOrdersModal")?.classList.add("open");
}
document.getElementById("myOrdersClose")?.addEventListener("click", () =>
  document.getElementById("myOrdersModal")?.classList.remove("open"));

/* عند فتح Checkout: لو العميل مسجَّل، عبّئ الحقول تلقائياً */
if ($goCheckout && window.CustomersAPI) {
  const originalGoCheckout = $goCheckout.onclick;
  $goCheckout.onclick = (e) => {
    const c = CustomersAPI.current();
    if (c) {
      try {
        $form.name.value  = c.name || "";
        $form.phone.value = c.phone || "";
        if (c.area)  $form.area.value = c.area;
        if (c.cityId) setTimeout(() => { $citySel.value = c.cityId; renderSummary(); }, 50);
      } catch (_e) {}
    }
    if (originalGoCheckout) originalGoCheckout(e);
  };
}

/* =========================================================
   آراء العملاء + معلومات الموقع
========================================================= */
function starsHtml(rating, size) {
  const sz = size || 16;
  const r = Math.round(Number(rating) || 0);
  return Array.from({length:5}, (_, i) =>
    `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="${i < r ? 'var(--gold)' : 'none'}" stroke="var(--gold)" stroke-width="1.4" style="vertical-align:middle;">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,10.26"/>
    </svg>`).join("");
}

function renderReviews() {
  if (!window.ReviewsAPI) return;
  const reviews = ReviewsAPI.list();
  const avg = ReviewsAPI.avgRating();
  const $avg = document.getElementById("reviewsAvg");
  if ($avg) {
    $avg.innerHTML = reviews.length ? `
      <div class="avg-rating-card">
        <div class="avg-stars">${starsHtml(avg, 22)}</div>
        <div class="avg-num">${avg.toFixed(1)}<span>/5</span></div>
        <div class="avg-meta">${t("reviews.based_on")} ${reviews.length} ${t("reviews.review_count")}</div>
      </div>` : "";
  }
  const $grid = document.getElementById("reviewsGrid");
  if (!$grid) return;
  $grid.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="review-head">
        <div class="review-avatar">${escapeHtml((r.name || "?").charAt(0))}</div>
        <div>
          <div class="review-name">${escapeHtml(r.name)}${r.verified ? ` <span class="verified">✓ ${t("reviews.verified")}</span>` : ""}</div>
          <div class="review-date">${escapeHtml(r.date || "")}</div>
        </div>
      </div>
      <div class="review-stars">${starsHtml(r.rating, 16)}</div>
      <p class="review-text">"${escapeHtml(r.text)}"</p>
    </article>
  `).join("");
}

function renderSiteInfo() {
  if (!window.SiteInfoAPI) return;
  const info = SiteInfoAPI.get();
  const lang = getLang();
  const pick = (obj) => obj?.[lang] || obj?.ar || "";
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set("siteAboutText",    pick(info.aboutUs));
  set("siteShippingText", pick(info.shipping));
  set("siteFaqText",      pick(info.faq));
  /* ملاحظة: returnPolicy لم يعد يُعرض كبطاقة هنا - يُعرَض في Modal من رابط التذييل */
}

/* فتح Modal السياسات بمفتاح معيّن */
function openPolicy(key) {
  const info = SiteInfoAPI.get();
  const lang = getLang();
  const titleKeyMap = {
    privacy:  "policy.privacy",
    exchange: "policy.exchange",
    cod:      "policy.cod",
    terms:    "policy.terms",
  };
  const fieldMap = {
    privacy:  "privacyPolicy",
    exchange: "exchangePolicy",
    cod:      "codPolicy",
    terms:    "termsConditions",
  };
  const $title = document.getElementById("policyTitle");
  const $body  = document.getElementById("policyBody");
  if (!$title || !$body) return;
  $title.textContent = t(titleKeyMap[key]);
  const obj = info[fieldMap[key]] || {};
  const txt = obj[lang] || obj.ar || "";
  /* اعرض النص مع الحفاظ على السطور (\n → <br>) وتأمين HTML */
  $body.innerHTML = escapeHtml(txt).replace(/\n/g, "<br>");
  document.getElementById("policyModal")?.classList.add("open");
}

/* ربط أزرار السياسات في التذييل */
document.querySelectorAll("[data-policy]").forEach(btn => {
  btn.addEventListener("click", () => openPolicy(btn.dataset.policy));
});
document.getElementById("policyClose")?.addEventListener("click", () =>
  document.getElementById("policyModal")?.classList.remove("open"));

/* "احسبي مقاسك" يفتح Modal دليل المقاسات */
document.getElementById("openSizeCalcLink")?.addEventListener("click", () => {
  document.getElementById("sizeGuideModal")?.classList.add("open");
  /* انتقل تلقائياً للحاسبة بعد ثوانٍ */
  setTimeout(() => document.querySelector(".size-calc")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
});

/* =========================================================
   لوحة الفلاتر
========================================================= */
function uniqueProductValues(getter) {
  const vals = new Set();
  ProductsAPI.list().forEach(p => {
    const v = getter(p);
    if (Array.isArray(v)) v.forEach(x => x && vals.add(x));
    else if (v) vals.add(v);
  });
  return [...vals];
}

function renderFilterChips() {
  const lang = getLang();
  const lookupName = (item, prefix) => {
    /* جرّب الترجمة أولاً (للعناصر الافتراضية)، ثم name_ar/name_en من DB */
    const fromI18n = I18N[lang]?.[prefix + "." + item.id];
    if (fromI18n) return fromI18n;
    return (lang === "en" && item.name_en) ? item.name_en : (item.name_ar || item.id);
  };
  /* أقمشة - من DB */
  const fabricEl = document.getElementById("filterFabric");
  if (fabricEl) {
    fabricEl.innerHTML = FabricsAPI.list().map(f =>
      `<button type="button" class="filter-chip ${filters.fabric.has(f.id) ? "active" : ""}" data-filter="fabric" data-id="${f.id}">${escapeHtml(lookupName(f, "fabric"))}</button>`
    ).join("");
  }
  /* قَصّات - من DB */
  const cutEl = document.getElementById("filterCut");
  if (cutEl) {
    cutEl.innerHTML = CutsAPI.list().map(c =>
      `<button type="button" class="filter-chip ${filters.cut.has(c.id) ? "active" : ""}" data-filter="cut" data-id="${c.id}">${escapeHtml(lookupName(c, "cut"))}</button>`
    ).join("");
  }
  /* ألوان (مستخرجة من المنتجات) */
  const colorEl = document.getElementById("filterColor");
  if (colorEl) {
    const colors = uniqueProductValues(p => (p.colors || []).map(c => c.name));
    colorEl.innerHTML = colors.map(c =>
      `<button type="button" class="filter-chip ${filters.color.has(c) ? "active" : ""}" data-filter="color" data-id="${escapeHtml(c)}">${escapeHtml(c)}</button>`
    ).join("");
  }
  /* مقاسات (مستخرجة من المنتجات) */
  const sizeEl = document.getElementById("filterSize");
  if (sizeEl) {
    const sizes = uniqueProductValues(p => p.sizes || []);
    sizeEl.innerHTML = sizes.map(s =>
      `<button type="button" class="filter-chip ${filters.size.has(s) ? "active" : ""}" data-filter="size" data-id="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join("");
  }

  /* ربط الأحداث على كل الرقائق */
  document.querySelectorAll(".filter-chip[data-filter]").forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.filter;
      const id = btn.dataset.id;
      const set = filters[key];
      if (set.has(id)) set.delete(id); else set.add(id);
      renderFilterChips();
      renderProducts();
    };
  });
}

function bindFilterControls() {
  const $price = (id) => document.getElementById(id);
  $price("filterPriceMin")?.addEventListener("input", e => {
    filters.priceMin = e.target.value ? Number(e.target.value) : null;
    renderProducts();
  });
  $price("filterPriceMax")?.addEventListener("input", e => {
    filters.priceMax = e.target.value ? Number(e.target.value) : null;
    renderProducts();
  });
  const flagMap = {
    flagBestseller: "bestseller",
    flagNew: "isNew",
    flagEmbroidered: "embroidered",
    flagOpen: "open",
    flagAvailable: "availableOnly",
  };
  Object.keys(flagMap).forEach(id => {
    document.getElementById(id)?.addEventListener("change", e => {
      filters[flagMap[id]] = e.target.checked;
      renderProducts();
    });
  });
  document.getElementById("filtersToggle")?.addEventListener("click", () => {
    const panel = document.getElementById("filtersPanel");
    const btn   = document.getElementById("filtersToggle");
    const open  = panel.hidden;
    panel.hidden = !open;
    btn.classList.toggle("open", open);
  });
  document.getElementById("filtersClear")?.addEventListener("click", () => {
    filters.fabric.clear(); filters.cut.clear();
    filters.color.clear(); filters.size.clear();
    filters.priceMin = null; filters.priceMax = null;
    filters.bestseller = filters.isNew = filters.embroidered = filters.open = filters.availableOnly = false;
    /* امسح المدخلات */
    ["filterPriceMin", "filterPriceMax"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    ["flagBestseller","flagNew","flagEmbroidered","flagOpen","flagAvailable"].forEach(id => {
      const el = document.getElementById(id); if (el) el.checked = false;
    });
    renderFilterChips();
    renderProducts();
  });
}

/* =========================================================
   تبديل اللغة
========================================================= */
function updateLangButton() {
  const btn = document.getElementById("langToggle");
  if (!btn) return;
  /* الزر يعرض اللغة الأخرى (التي ستنتقلين إليها) */
  btn.textContent = getLang() === "ar" ? "English" : "العربية";
}
document.getElementById("langToggle")?.addEventListener("click", () => {
  const next = getLang() === "ar" ? "en" : "ar";
  setLang(next);
  updateLangButton();
  applySettings();         /* يطبق التراجم على كل [data-i18n] */
  renderCategories();
  renderFilterChips();
  renderProducts();
  renderCart();
  updateAccountButton();   /* تحديث زر الحساب باللغة الجديدة */
  renderReviews();
  renderSiteInfo();
  /* أعد فتح المودالات المفتوحة لتترجم محتواها */
  if ($checkout?.classList.contains("open")) {
    fillCities(); renderBankAccounts(); renderSummary();
  }
});
updateLangButton();

/* =========================================================
   إقلاع
========================================================= */
applySettings();
renderCategories();
renderFilterChips();
bindFilterControls();
renderProducts();
renderCart();
updateAccountButton();
renderReviews();
renderSiteInfo();

window.addEventListener("storage", (e) => {
  if (e.key === "abaya_amal_v2") {
    applySettings();
    renderCategories();
    renderProducts();
  }
});
