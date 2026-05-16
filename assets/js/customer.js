/* =========================================================
   عبايات أمل  —  منطق واجهة الزبون
   ========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();

let currentCategory = "all";
let currentProduct  = null;          /* داخل المودال */
let selectedColor   = null;
let selectedSize    = null;
let paymentProof    = null;          /* base64 data URL */
let appliedCoupon   = null;          /* { code, discount, coupon } */

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
  const s = SettingsAPI.get();
  document.getElementById("headlineText").textContent = s.headline || "عبايات وأكثر تجدينها لدى عبايات أمل";

  const phoneText = s.contact?.phone || "";
  const waText    = s.contact?.whatsapp || "";
  const tel       = (phoneText || "").replace(/[^\d+]/g, "");
  const waNumber  = (waText || "").replace(/[^\d]/g, "");

  $("phoneText").textContent    = phoneText;
  $("whatsappText").textContent = waText;
  $("footerPhoneText").textContent = phoneText;
  if (tel)      $("phoneLink").href       = `tel:${tel}`;
  if (waNumber) $("whatsappLink").href    = `https://wa.me/${waNumber}`;
  if (tel)      $("footerPhone").href     = `tel:${tel}`;
  if (waNumber) $("footerWa").href        = `https://wa.me/${waNumber}`;
}

function $(id) { return document.getElementById(id); }

/* =========================================================
   التصنيفات
========================================================= */
function renderCategories() {
  $catsBar.innerHTML = CATEGORIES.map(c => `
    <button class="cat-pill ${c.id === currentCategory ? "active" : ""}" data-id="${c.id}">
      ${c.name}
    </button>`).join("");
  $catsBar.querySelectorAll(".cat-pill").forEach(b => {
    b.onclick = () => {
      currentCategory = b.dataset.id;
      const cat = Utils.categoryById(currentCategory);
      $catTitle.textContent = cat.id === "all" ? "تشكيلتنا" : cat.name;
      renderCategories();
      renderProducts();
    };
  });
}

/* =========================================================
   عرض المنتجات
========================================================= */
function renderProducts() {
  let products = ProductsAPI.list();
  if (currentCategory !== "all") {
    products = products.filter(p => p.category === currentCategory);
  }

  $grid.innerHTML = products.length ? products.map(p => {
    const total = ProductsAPI.totalStock(p);
    const out   = total === 0;
    const low   = !out && total <= LOW_STOCK_THRESHOLD;
    const cover = p.colors?.[0]?.image || "";
    const final = ProductsAPI.finalPrice(p);
    const hasDiscount = Number(p.discount) > 0;

    return `
      <article class="card" data-id="${p.id}">
        <div class="img-wrap">
          ${out ? `<span class="badge badge-out">نفد المخزون</span>` : ""}
          ${low && !out ? `<span class="badge badge-low">قطع محدودة</span>` : ""}
          ${hasDiscount ? `<span class="badge badge-discount">خصم ${p.discount}%</span>` : ""}
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
              ${out ? "غير متوفر" : "عرض"}
            </button>
          </div>
        </div>
      </article>`;
  }).join("") : `<p style="grid-column:1/-1; text-align:center; color:var(--muted); padding:50px 0;">لا توجد منتجات في هذا التصنيف بعد.</p>`;

  $grid.querySelectorAll(".card").forEach(card => {
    card.querySelector(".view-btn")?.addEventListener("click", () => openProductModal(card.dataset.id));
    card.addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") openProductModal(card.dataset.id);
    });
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
  renderProductModal();
  $pModal.classList.add("open");
}
function closeProductModal() { $pModal.classList.remove("open"); }
document.getElementById("closeProductModal").onclick = closeProductModal;

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

  $pdContent.innerHTML = `
    <div class="image-side">
      <div class="main-image">
        <img src="${escapeHtml(colorObj?.image || "")}" alt="${escapeHtml(p.name)}">
      </div>
    </div>
    <div class="info-side">
      <h2>${escapeHtml(p.name)}</h2>
      <p class="desc">${escapeHtml(p.description || "")}</p>
      <div class="price-block">
        ${hasDiscount ? `<span class="price-old">${Utils.fmt(p.price)}</span>` : ""}
        <span class="price">${Utils.fmt(finalPrice)}</span>
        ${hasDiscount ? `<span class="badge badge-discount" style="position:static">خصم ${p.discount}%</span>` : ""}
      </div>

      <div class="opt-label">اللون:</div>
      <div class="colors-row" id="colorsRow">${colorsHtml}</div>

      <div class="opt-label">المقاس:</div>
      <div class="sizes-row" id="sizesRow">${sizesHtml}</div>

      ${variantStock !== null
        ? `<div class="stock-line ${variantStock <= LOW_STOCK_THRESHOLD ? "low" : ""}">
             ${variantStock === 0 ? "نفد هذا المقاس" : "متوفر: " + variantStock + " قطعة"}
           </div>`
        : `<div class="stock-line">اختاري المقاس لمعرفة المتوفر</div>`
      }

      <div class="pdetails-actions">
        <button class="btn-gold" id="addToCartBtn" ${!selectedSize || variantStock === 0 ? "disabled" : ""}>
          أضيفي إلى العربة
        </button>
      </div>
    </div>`;

  /* ربط الأحداث */
  $pdContent.querySelectorAll(".color-chip").forEach(b => {
    b.onclick = () => {
      selectedColor = b.dataset.color;
      selectedSize  = null;
      renderProductModal();
    };
  });
  $pdContent.querySelectorAll(".size-chip:not(:disabled)").forEach(b => {
    b.onclick = () => {
      selectedSize = b.dataset.sz;
      renderProductModal();
    };
  });
  const addBtn = $pdContent.querySelector("#addToCartBtn");
  if (addBtn) addBtn.onclick = () => addCurrentToCart();
}

function addCurrentToCart() {
  if (!currentProduct || !selectedColor || !selectedSize) return;
  const p = currentProduct;
  const stk = ProductsAPI.variantStock(p, selectedColor, selectedSize);
  if (stk <= 0) { showToast("نفد المخزون لهذه التركيبة"); return; }

  const key = `${p.id}|${selectedColor}|${selectedSize}`;
  const existing = cart.get(key);
  const qty = existing ? existing.qty + 1 : 1;
  if (qty > stk) { showToast("الكمية المتاحة أقل"); return; }

  const colorObj = p.colors.find(c => c.name === selectedColor);
  cart.set(key, {
    productId: p.id,
    name: p.name,
    price: ProductsAPI.finalPrice(p),
    originalPrice: p.price,
    discount: p.discount || 0,
    color: selectedColor,
    size: selectedSize,
    image: colorObj?.image || "",
    qty,
  });
  renderCart();
  closeProductModal();
  openCart();
  showToast("تمت الإضافة إلى عربة التسوق ✨");
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
  else if (next > stk) { showToast("لا يوجد كمية أكبر"); return; }
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
    $cartBody.innerHTML = `<div class="cart-empty">عربة التسوق فارغة.<br/>اختاري ما يناسبك من التشكيلة.</div>`;
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
$openCart.onclick  = openCart;
$closeCart.onclick = closeCart;
$overlay.onclick   = closeCart;

/* =========================================================
   إتمام الطلب
========================================================= */
function fillCities() {
  $citySel.innerHTML =
    `<option value="" disabled selected>اختاري المدينة...</option>` +
    GAZA_CITIES.map(c => `<option value="${c.id}">${c.name}  —  توصيل ${c.fee} ₪</option>`).join("");
}

function renderBankAccounts() {
  const banks = SettingsAPI.get().bankAccounts || [];
  $bankList.innerHTML = banks.length ? banks.map(b => `
    <div class="bank-card">
      <h5>🏦 ${escapeHtml(b.bankName)}</h5>
      <div class="row"><span>اسم الحساب</span><strong>${escapeHtml(b.accountName)}</strong></div>
      <div class="row">
        <span>رقم الحساب</span>
        <strong>${escapeHtml(b.accountNumber)}</strong>
        <button type="button" class="copy" data-copy="${escapeHtml(b.accountNumber)}">نسخ</button>
      </div>
      <div class="row">
        <span>IBAN</span>
        <strong>${escapeHtml(b.iban)}</strong>
        <button type="button" class="copy" data-copy="${escapeHtml(b.iban)}">نسخ</button>
      </div>
    </div>
  `).join("") : `<p style="color:var(--muted); font-size:13px;">لا توجد حسابات بنكية مضافة. تواصلي مع الإدارة.</p>`;

  $bankList.querySelectorAll(".copy").forEach(b =>
    b.onclick = () => { navigator.clipboard.writeText(b.dataset.copy); showToast("تم النسخ"); }
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
    <div class="row"><span>عدد القطع</span><span>${[...cart.values()].reduce((n,it)=>n+it.qty,0)}</span></div>
    <div class="row"><span>المجموع الفرعي</span><span>${Utils.fmt(sub)}</span></div>
    ${saved > 0 ? `<div class="row discount"><span>خصم المنتجات</span><span>− ${Utils.fmt(saved)}</span></div>` : ""}
    ${couponDiscount > 0 ? `<div class="row discount"><span>كود الخصم (${escapeHtml(appliedCoupon.code)})</span><span>− ${Utils.fmt(couponDiscount)}</span></div>` : ""}
    <div class="row"><span>التوصيل ${city ? "(" + city.name + ")" : ""}</span><span>${Utils.fmt(fee)}</span></div>
    <div class="row total"><span>الإجمالي</span><span>${Utils.fmt(total)}</span></div>
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
    const label = v.coupon.type === "percent" ? `خصم ${v.coupon.value}%` : `خصم ${v.coupon.value} ₪`;
    setCouponStatus(`✓ تم تطبيق الكود (${label})`, "ok");
  } else {
    appliedCoupon = null;
    setCouponStatus("✕ " + v.reason, "err");
  }
  renderSummary();
}

$goCheckout.onclick = () => {
  if (cart.size === 0) return;
  fillCities();
  renderBankAccounts();
  paymentProof = null;
  appliedCoupon = null;
  $proofPrev.innerHTML = "";
  document.getElementById("couponInput").value = "";
  setCouponStatus("", "");
  renderSummary();
  $checkout.classList.add("open");
};

document.getElementById("applyCouponBtn").onclick = applyCoupon;
document.getElementById("couponInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); applyCoupon(); }
});
$cancelChk.onclick = () => $checkout.classList.remove("open");
$citySel.onchange = renderSummary;

/* رفع صورة التحويل */
$proofInput.onchange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { showToast("حجم الصورة كبير (3 ميجا حد أقصى)"); return; }
  paymentProof = await Utils.fileToDataURL(file);
  $proofPrev.innerHTML = `
    <div class="upload-preview">
      <img src="${paymentProof}" alt="">
      <div class="meta">✓ تم تحميل صورة التحويل (${(file.size/1024).toFixed(0)} ك.ب)</div>
      <button type="button" class="remove-img" id="removeProof">✕</button>
    </div>`;
  document.getElementById("removeProof").onclick = () => {
    paymentProof = null; $proofPrev.innerHTML = ""; $proofInput.value = "";
  };
};
/* Drag & Drop */
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

/* إرسال الطلب */
$form.onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData($form);
  const city = Utils.cityById(data.get("city"));
  if (!city) { showToast("اختاري المدينة"); return; }
  if (!paymentProof) { showToast("ارفعي صورة التحويل أولاً"); return; }

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
document.getElementById("successOk").onclick = () => $successMd.classList.remove("open");

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
   إقلاع
========================================================= */
applySettings();
renderCategories();
renderProducts();
renderCart();

window.addEventListener("storage", (e) => {
  if (e.key === "abaya_amal_v2") { applySettings(); renderProducts(); }
});
