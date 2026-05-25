/* =========================================================
   عبايات أمل  —  طبقة البيانات المشتركة
   ---------------------------------------------------------
   تستخدم localStorage كقاعدة بيانات مؤقتة.
   عند الانتقال إلى Backend حقيقي، استبدلي محتوى الدوال
   فقط (مثل ProductsAPI.list) باستدعاء fetch.
   ========================================================= */

const DB_KEY = "abaya_amal_v2";
const AUTH_KEY = "abaya_amal_admin_session";
const AUTH_REMEMBER_KEY = "abaya_amal_admin_remember";
const CUST_KEY = "abaya_amal_customer_session";
const LANG_KEY = "abaya_amal_lang";

/* =========================================================
   i18n  —  Internationalization
========================================================= */
const I18N = {
  ar: {
    /* Brand */
    "brand.tagline": "Abaya and more",
    "brand.full": "عبايات أمل",

    /* Contact bar */
    "contact.phone": "هاتف",
    "contact.whatsapp": "واتساب",
    "contact.instagram": "إنستغرام",
    "contact.track": "📦 تتبع طلبي",
    "contact.lang_toggle": "EN",

    /* Nav */
    "nav.products": "المنتجات",
    "nav.categories": "التصنيفات",
    "nav.admin": "لوحة الإدارة",
    "nav.cart": "عربة التسوق",

    /* Hero */
    "hero.headline": "عبايات وأكثر تجدينها لدى عبايات أمل",
    "hero.sub": "تشكيلة منتقاة من العبايات الفاخرة، عملية ومناسبات وسوداء ومفتوحة. توصيل لكل مدن قطاع غزة.",
    "hero.cta": "تسوّقي الآن",

    /* Sections */
    "section.collection": "تشكيلتنا",
    "section.no_products": "لا توجد منتجات في هذا التصنيف بعد.",

    /* Special quick-view tabs */
    "category.favorites": "❤️ المفضلة",
    "category.bestseller": "🔥 الأكثر مبيعاً",
    "favorites.empty": "لا توجد عبايات في المفضلة بعد. اضغطي ♡ على أي منتج لإضافته.",
    "favorites.added": "تمت الإضافة إلى المفضلة ❤️",
    "favorites.removed": "تمت الإزالة من المفضلة",

    /* Reviews */
    "reviews.title": "آراء عميلاتنا",
    "reviews.subtitle": "ما تقوله سيداتنا الجميلات عن تجربتهن مع عبايات أمل",
    "reviews.verified": "مشترية موثّقة",
    "reviews.write": "اكتبي رأيك",
    "reviews.your_name": "اسمك",
    "reviews.your_rating": "تقييمك",
    "reviews.your_comment": "تعليقك",
    "reviews.submit": "إرسال",
    "reviews.thanks": "شكراً لرأيك! سيظهر بعد المراجعة.",
    "reviews.avg_label": "متوسط التقييم",
    "reviews.based_on": "بناءً على",
    "reviews.review_count": "مراجعة",

    /* Site info */
    "siteInfo.title": "عن عبايات أمل",
    "siteInfo.about": "من نحن",
    "siteInfo.shipping": "الشحن والتوصيل",
    "siteInfo.return": "سياسة الاستبدال",
    "siteInfo.faq": "أسئلة شائعة",

    /* Footer policies links */
    "policy.privacy": "سياسة الخصوصية",
    "policy.exchange": "سياسة الاستبدال والاسترجاع",
    "policy.cod": "سياسة الدفع عند الاستلام",
    "policy.terms": "الشروط العامة والأحكام",
    "policy.size_calc": "احسبي مقاسك",
    "policy.legal_title": "روابط مهمة",
    "policy.close": "إغلاق",

    /* Size guide additions */
    "sizeGuide.system_intl": "النظام الدولي",
    "sizeGuide.system_gulf": "النظام الخليجي",
    "sizeGuide.calc_title": "🧮 احسبي مقاسك تلقائياً",
    "sizeGuide.calc_chest": "محيط الصدر (سم)",
    "sizeGuide.calc_waist": "محيط الخصر (سم)",
    "sizeGuide.calc_hips": "محيط الأرداف (سم)",
    "sizeGuide.calc_height": "الطول (سم)",
    "sizeGuide.calc_weight": "الوزن (كجم)",
    "sizeGuide.calc_hint": "أدخلي طولكِ ووزنكِ، وسنقترح المقاس المناسب من الجدول الخليجي.",
    "sizeGuide.calc_btn": "اعرفي مقاسي",
    "sizeGuide.calc_result": "مقاسك المناسب",
    "sizeGuide.calc_no_match": "أدخلي قياساتك أعلاه لمعرفة المقاس",

    /* Categories */
    "category.all": "الكل",
    "category.new": "الجديد",
    "category.khaleeji": "عبايات خليجية",
    "category.black": "عبايات سوداء",
    "category.colored": "عبايات ملونة",
    "category.luxury": "عبايات فخمة",
    "category.everyday": "عبايات يومية",
    "category.embroidered": "عبايات مطرزة",
    "category.eid": "العيد ورمضان",
    "category.offers": "العروض",
    /* تصنيفات قديمة (احتفاظ بها للتوافق) */
    "category.occasions": "عبايات مناسبات",
    "category.open": "عبايات مفتوحة",

    /* Filters */
    "filters.title": "🔍 فلاتر",
    "filters.fabric": "القماش",
    "filters.cut": "القَصّة",
    "filters.price": "السعر",
    "filters.color": "اللون",
    "filters.size": "المقاس",
    "filters.open": "مفتوحة",
    "filters.closed": "مغلقة",
    "filters.plain": "سادة",
    "filters.embroidered": "مطرزة",
    "filters.daily": "يومية",
    "filters.occasion": "مناسبة",
    "filters.available": "متوفر فقط",
    "filters.bestseller": "الأكثر مبيعاً",
    "filters.new": "جديد",
    "filters.clear": "مسح الفلاتر",
    "filters.from": "من",
    "filters.to": "إلى",
    "filters.toggle_open": "إظهار الفلاتر",
    "filters.toggle_close": "إخفاء الفلاتر",

    /* Fabrics */
    "fabric.crepe":   "كريب",
    "fabric.nada":    "ندى",
    "fabric.silk":    "حرير",
    "fabric.chiffon": "شيفون",
    "fabric.linen":   "لينن",
    "fabric.velvet":  "مخمل",
    "fabric.satin":   "ساتان",
    "fabric.summer":  "قماش صيفي",
    "fabric.winter":  "قماش شتوي",

    /* Cuts */
    "cut.kloush":   "كلوش",
    "cut.farasha":  "فراشة",
    "cut.besht":    "بشت",
    "cut.kimono":   "كيمونو",
    "cut.straight": "مستقيمة",
    "cut.buttons":  "بأزرار",
    "cut.wrap":     "لف / Wrap",
    "cut.wide":     "واسعة",
    "cut.waisted":  "بخصر محدد",

    /* Product card */
    "product.view": "عرض",
    "product.unavailable": "غير متوفر",
    "product.limited": "قطع محدودة",
    "product.out_of_stock": "نفد المخزون",
    "product.discount_label": "خصم",

    /* Size Guide */
    "sizeGuide.title": "📏 دليل المقاسات",
    "sizeGuide.subtitle": "احسبي مقاسك بدقة بمتر قماش (تيب) ثم قارنيه بالجدول.",
    "sizeGuide.link": "معرفة مقاسي",
    "sizeGuide.measure_chest": "الصدر",
    "sizeGuide.measure_waist": "الخصر",
    "sizeGuide.measure_hips": "الأرداف",
    "sizeGuide.measure_length": "الطول",
    "sizeGuide.size": "المقاس",
    "sizeGuide.chest_cm": "الصدر",
    "sizeGuide.waist_cm": "الخصر",
    "sizeGuide.sleeve_cm": "الأكمام",
    "sizeGuide.hips_cm": "الأرداف",
    "sizeGuide.length_cm": "طول العباية",
    "sizeGuide.intl": "EU / US",
    "sizeGuide.unit_note": "جميع القياسات بالسنتيمتر (cm)",
    "sizeGuide.tips_title": "💡 كيف تقيسين بدقة؟",
    "sizeGuide.tip1": "استخدمي متر قماش (شريط قياس مرن) وقفي بشكل طبيعي.",
    "sizeGuide.tip2_label": "الصدر:",
    "sizeGuide.tip2": "قيسي حول أعرض جزء من الصدر.",
    "sizeGuide.tip3_label": "الخصر:",
    "sizeGuide.tip3": "قيسي عند أضيق نقطة (حول السرّة).",
    "sizeGuide.tip4_label": "الأرداف:",
    "sizeGuide.tip4": "قيسي حول أعرض جزء من الأرداف.",
    "sizeGuide.tip5_label": "الطول:",
    "sizeGuide.tip5": "من أعلى الكتف إلى الكعب.",
    "sizeGuide.tip6": "إذا كان قياسك بين مقاسين، اختاري المقاس الأكبر للراحة.",

    /* Product details */
    "product.color": "اللون:",
    "product.size": "المقاس:",
    "product.stock_choose_size": "اختاري المقاس لمعرفة المتوفر",
    "product.stock_available": "متوفر:",
    "product.stock_piece": "قطعة",
    "product.size_out": "نفد هذا المقاس",
    "product.add_to_cart": "أضيفي إلى العربة",

    /* Cart */
    "cart.title": "🛍️ عربة التسوق",
    "cart.empty": "عربة التسوق فارغة.",
    "cart.empty_sub": "اختاري ما يناسبك من التشكيلة.",
    "cart.subtotal": "المجموع الفرعي",
    "cart.checkout": "إتمام الطلب",
    "cart.add_success": "تمت الإضافة إلى عربة التسوق ✨",
    "cart.stock_less": "الكمية المتاحة أقل",
    "cart.no_more": "لا يوجد كمية أكبر",
    "cart.variant_out": "نفد المخزون لهذه التركيبة",

    /* Checkout */
    "checkout.title": "إتمام الطلب",
    "checkout.sub": "املئي بياناتك، حوّلي المبلغ على أحد الحسابات، ثم ارفعي صورة التحويل.",
    "checkout.name": "الاسم الكامل",
    "checkout.phone": "رقم الجوال",
    "checkout.city": "المدينة / المنطقة",
    "checkout.city_placeholder": "اختاري المدينة...",
    "checkout.area": "الحي / الشارع",
    "checkout.area_placeholder": "حي الرمال - شارع عمر المختار",
    "checkout.notes": "ملاحظات (اختياري)",
    "checkout.notes_placeholder": "معلم قريب، وقت تواصل مفضل...",
    "checkout.coupon_q": "🎟️ هل لديكِ كود خصم؟",
    "checkout.coupon_placeholder": "أدخلي الكود (مثل WELCOME10)",
    "checkout.apply": "تطبيق",
    "checkout.banks": "💳 حوّلي المبلغ على أحد الحسابات التالية:",
    "checkout.proof": "📸 ارفعي صورة التحويل (مطلوبة لتأكيد الطلب):",
    "checkout.upload_hint": "اسحبي الصورة هنا أو انقري للاختيار",
    "checkout.upload_hint_2": "PNG / JPG  —  حتى 10 ميجا",
    "checkout.confirm": "تأكيد الطلب",
    "checkout.cancel": "إلغاء",
    "checkout.items_count": "عدد القطع",
    "checkout.subtotal": "المجموع الفرعي",
    "checkout.discount_products": "خصم المنتجات",
    "checkout.coupon_line": "كود الخصم",
    "checkout.delivery": "التوصيل",
    "checkout.total": "الإجمالي",
    "checkout.delivery_to": "توصيل",
    "checkout.bank_name": "اسم الحساب",
    "checkout.bank_number": "رقم الحساب",
    "checkout.bank_iban": "IBAN",
    "checkout.bank_phone": "تحويل لرقم الجوال",
    "checkout.bank_phone_fast": "أسرع طريقة للتحويل",
    "checkout.copy": "نسخ",
    "checkout.copied": "تم النسخ",
    "checkout.select_city": "اختاري المدينة",
    "checkout.upload_first": "ارفعي صورة التحويل أولاً",
    "checkout.image_too_big": "حجم الصورة كبير (10 ميجا حد أقصى)",
    "checkout.no_banks": "لا توجد حسابات بنكية مضافة. تواصلي مع الإدارة.",

    /* Coupon */
    "coupon.not_found": "الكود غير موجود",
    "coupon.inactive": "هذا الكود غير مُفعَّل",
    "coupon.min_order": "الحد الأدنى للطلب",
    "coupon.applied": "✓ تم تطبيق الكود",
    "coupon.discount_percent": "خصم",

    /* Success */
    "success.title": "تم استلام طلبك بنجاح!",
    "success.body": "طلبك الآن بانتظار تأكيد الدفع من قِبَل الإدارة، وسنتواصل معكِ قريباً عبر الجوال أو الواتساب.",
    "success.btn": "شكراً لكِ",

    /* Tracking */
    "track.title": "📦 تتبع طلبي",
    "track.sub": "أدخلي رمز الطلب الذي وصلكِ (مثل AMA-XXXXXX) لمعرفة حالته.",
    "track.code": "رمز الطلب",
    "track.search": "بحث",
    "track.close": "إغلاق",
    "track.not_found": "❌ لم نجد طلباً بهذا الرمز.",
    "track.not_found_hint": "تأكدي من الرمز أو تواصلي معنا عبر الواتساب.",
    "track.code_label": "رقم الطلب",
    "track.status_now": "الحالة الحالية",
    "track.date": "التاريخ",
    "track.city": "المدينة",
    "track.cancelled": "⛔ الطلب ملغي",

    /* Order statuses */
    "status.awaiting": "بانتظار تأكيد الدفع",
    "status.pending": "قيد المعالجة",
    "status.shipped": "تم الشحن",
    "status.delivered": "تم التوصيل",
    "status.cancelled": "ملغي",

    /* Cities */
    "city.gaza": "مدينة غزة",
    "city.north": "شمال غزة",
    "city.jabalia": "جباليا",
    "city.beitlahia": "بيت لاهيا",
    "city.beithanoun": "بيت حانون",
    "city.nuseirat": "النصيرات",
    "city.bureij": "البريج",
    "city.maghazi": "المغازي",
    "city.zawaida": "الزوايدة",
    "city.deirbalah": "دير البلح",
    "city.khanyounis": "خان يونس",
    "city.rafah": "رفح",

    /* Footer */
    "footer.copyright": "جميع الحقوق محفوظة. صُنع بحبٍّ في قطاع غزة.",

    /* Admin: login */
    "admin.login.title": "لوحة الإدارة",
    "admin.login.sub": "عبايات أمل  —  تسجيل الدخول",
    "admin.login.username": "اسم المستخدم",
    "admin.login.password": "كلمة المرور",
    "admin.login.signin": "دخول",
    "admin.login.error": "اسم المستخدم أو كلمة المرور غير صحيحة",
    "admin.login.default": "الافتراضي:",
    "admin.login.change_hint": "غيّريه من الإعدادات.",

    /* Admin: sidebar */
    "admin.brand.sub": "لوحة عبايات أمل",
    "admin.menu.dashboard": "📊 لوحة القيادة",
    "admin.menu.products": "👗 المنتجات",
    "admin.menu.inventory": "📦 المخزون",
    "admin.menu.orders": "🧾 الطلبات",
    "admin.menu.delivery": "🚚 التوصيل",
    "admin.menu.customers": "👥 العملاء",
    "admin.menu.settings": "⚙️ الإعدادات",
    "admin.menu.view_store": "🛍️ عرض المتجر",
    "admin.logout": "🚪 تسجيل خروج",

    /* Admin: dashboard */
    "admin.dash.title": "لوحة القيادة",
    "admin.stat.today_orders": "طلبات اليوم",
    "admin.stat.today_orders_hint": "طلب جديد اليوم",
    "admin.stat.today_orders_none": "لا توجد طلبات اليوم بعد",
    "admin.stat.today_sales": "مبيعات اليوم",
    "admin.stat.today_sales_hint": "من الطلبات المؤكدة",
    "admin.stat.total_products": "إجمالي المنتجات",
    "admin.stat.products_in_catalog": "في الكتالوج",
    "admin.stat.products_none": "لا منتجات",
    "admin.stat.stock_alert": "تنبيه مخزون",
    "admin.stat.stock_alert_hint": "قطع قاربت على النفاد",
    "admin.stat.stock_ok": "كل شيء جيد",
    "admin.dash.orders": "الطلبات",
    "admin.dash.view_all": "عرض الكل",
    "admin.dash.city_stats": "الطلبات حسب المدينة",
    "admin.dash.no_orders": "لا توجد طلبات بعد.",

    /* Admin: common table headers */
    "admin.col.code": "الرمز",
    "admin.col.customer": "الزبون",
    "admin.col.phone": "الجوال",
    "admin.col.city": "المدينة",
    "admin.col.pieces": "القطع",
    "admin.col.total": "المجموع",
    "admin.col.status": "الطلبات",
    "admin.col.date": "التاريخ",
    "admin.col.details": "تفاصيل",
    "admin.col.image": "الصورة",
    "admin.col.name": "الاسم",
    "admin.col.category": "التصنيف",
    "admin.col.price": "السعر",
    "admin.col.discount": "الخصم",
    "admin.col.colors": "الألوان",
    "admin.col.stock": "المخزون",
    "admin.col.actions": "إجراءات",
    "admin.col.orders_count": "عدد الطلبات",
    "admin.col.total_amount": "الإجمالي",

    /* Admin: products */
    "admin.products.title": "المنتجات",
    "admin.products.sub": "إضافة، تعديل، وحذف العبايات",
    "admin.products.add": "+ إضافة منتج جديد",
    "admin.products.search": "🔎 ابحثي عن منتج...",
    "admin.products.all_categories": "كل التصنيفات",
    "admin.products.none": "لا توجد منتجات.",
    "admin.product.add_title": "إضافة منتج",
    "admin.product.edit_title": "تعديل المنتج",
    "admin.product.sub": "معلومات المنتج، ألوانه (لكلٍ صورته)، والمخزون لكل تركيبة لون+مقاس.",
    "admin.product.field.name": "اسم المنتج",
    "admin.product.field.category": "التصنيف",
    "admin.product.field.price": "السعر (₪)",
    "admin.product.field.discount": "الخصم % (اختياري)",
    "admin.product.field.sizes": "المقاسات (افصلي بفاصلة)",
    "admin.product.field.description": "الوصف",
    "admin.product.colors_section": "الألوان والصور",
    "admin.product.add_color": "+ إضافة لون",
    "admin.product.color_name": "اسم اللون (مثال: أسود)",
    "admin.product.delete_color": "حذف",
    "admin.product.upload_hint": "اسحبي صورة هنا أو انقري للاختيار",
    "admin.product.upload_have": "صورة جاهزة (يمكن سحب أخرى للاستبدال)",
    "admin.product.stock_section": "المخزون لكل تركيبة (لون × مقاس)",
    "admin.product.rebuild": "↻ إعادة بناء الجدول",
    "admin.product.stock_help": "أضيفي ألواناً ومقاسات لعرض جدول المخزون.",
    "admin.product.size_axis": "اللون \\ المقاس",
    "admin.product.save": "حفظ",
    "admin.product.cancel": "إلغاء",
    "admin.product.deleted": "تم الحذف",
    "admin.product.added": "تمت إضافة المنتج",
    "admin.product.updated": "تم تعديل المنتج",
    "admin.product.confirm_delete": "حذف",
    "admin.product.need_color": "أضيفي لوناً واحداً على الأقل",
    "admin.product.need_color_names": "أكملي أسماء الألوان",
    "admin.product.need_color_images": "ارفعي صورة لكل لون",
    "admin.product.need_sizes": "أضيفي مقاساً واحداً على الأقل",
    "admin.product.image_too_big": "حجم الصورة كبير (الحد 10 ميجا)",

    /* Admin: inventory */
    "admin.inv.title": "المخزون",
    "admin.inv.sub": "تنبيهات عند نزول إجمالي المخزون عن",
    "admin.inv.section": "القطع التي تحتاج إلى تجديد",
    "admin.inv.total": "الإجمالي",
    "admin.inv.status": "الحالة",
    "admin.inv.variants": "التركيبات",
    "admin.inv.save_changes": "حفظ التحديثات",
    "admin.inv.all_good": "✓ كل المنتجات بحالة جيدة.",
    "admin.inv.updated": "تم تحديث المخزون",
    "admin.stock.out": "نفد",
    "admin.stock.low": "منخفض",
    "admin.stock.piece": "قطعة",

    /* Admin: orders */
    "admin.orders.title": "الطلبات",
    "admin.orders.sub": "إدارة الطلبات وتحديث حالاتها",
    "admin.orders.all_cities": "كل المدن",
    "admin.orders.all_statuses": "كل الحالات",
    "admin.orders.count": "إجمالي:",
    "admin.orders.none": "لا توجد طلبات.",
    "admin.order.detail_title": "تفاصيل الطلب",
    "admin.order.detail_sub": "معلومات الزبونة، القطع المطلوبة، وصورة التحويل",
    "admin.order.code_label": "رقم الطلب",
    "admin.order.status_label": "الحالة",
    "admin.order.name": "الاسم",
    "admin.order.phone": "الجوال",
    "admin.order.city": "المدينة",
    "admin.order.area": "الحي/الشارع",
    "admin.order.notes": "ملاحظات",
    "admin.order.date": "التاريخ",
    "admin.order.products": "المنتجات:",
    "admin.order.subtotal": "المجموع الفرعي",
    "admin.order.discount_products": "خصم المنتجات",
    "admin.order.coupon": "كود الخصم",
    "admin.order.delivery": "التوصيل",
    "admin.order.total": "الإجمالي",
    "admin.order.proof": "صورة التحويل:",
    "admin.order.no_proof": "⚠️ لا توجد صورة تحويل مرفقة",
    "admin.order.update_status": "تحديث الحالة",
    "admin.order.verify_payment": "✓ تأكيد الدفع",
    "admin.order.print": "🖨️ طباعة الفاتورة",
    "admin.order.close": "إغلاق",
    "admin.order.view": "عرض",
    "admin.order.status_updated": "تم تحديث حالة الطلب",
    "admin.order.payment_verified": "تم تأكيد الدفع، الطلب الآن قيد المعالجة",
    "admin.order.new_alert": "طلب جديد!",

    /* Admin: delivery */
    "admin.delivery.title": "التوصيل",
    "admin.delivery.sub": "إدارة الطلبات الجاهزة للشحن والتوصيل",
    "admin.delivery.in_progress": "الطلبات قيد التوصيل",
    "admin.delivery.ready_ship": "جاهز للشحن",
    "admin.delivery.in_transit": "قيد التوصيل",
    "admin.delivery.delivered": "تم التوصيل",
    "admin.delivery.active_cities": "مدن نشطة",
    "admin.delivery.completed": "طلبات مكتملة",
    "admin.delivery.in_shipment": "في الشحنة الحالية",
    "admin.delivery.quick_action": "إجراء سريع",
    "admin.delivery.ship_now": "↑ شحن الآن",
    "admin.delivery.mark_delivered": "✓ تم التوصيل",
    "admin.delivery.none": "لا توجد طلبات قيد التوصيل حالياً.",
    "admin.delivery.updated": "تم تحديث الحالة ✓",

    /* Admin: customers */
    "admin.customers.title": "العملاء",
    "admin.customers.sub": "قائمة العملاء وسجل طلباتهم",
    "admin.customers.list": "قائمة العملاء",
    "admin.customers.search": "🔎 ابحثي بالاسم أو الجوال...",
    "admin.customers.total": "إجمالي العملاء",
    "admin.customers.unique": "عميل فريد",
    "admin.customers.repeat": "عملاء متكررون",
    "admin.customers.repeat_hint": "طلبوا أكثر من مرة",
    "admin.customers.total_spent": "إجمالي الإنفاق",
    "admin.customers.spent_hint": "من كل العملاء",
    "admin.customers.avg": "متوسط الطلب",
    "admin.customers.avg_hint": "قيمة الطلب الواحد",
    "admin.customers.last_order": "آخر طلب",
    "admin.customers.none": "لا يوجد عملاء بعد.",

    /* Admin: settings */
    "admin.settings.title": "الإعدادات",
    "admin.settings.sub": "معلومات التواصل والحسابات البنكية والأمان",
    "admin.settings.contact": "📞 معلومات التواصل",
    "admin.settings.phone": "رقم الاتصال",
    "admin.settings.whatsapp": "رقم الواتساب",
    "admin.settings.instagram": "اسم حساب إنستغرام (بدون @)",
    "admin.settings.sound": "إشعار صوتي عند وصول طلب جديد",
    "admin.settings.sound_toggle": "تشغيل صوت تنبيه",
    "admin.settings.headline": "عنوان الصفحة (Headline)",
    "admin.settings.save_contact": "حفظ معلومات التواصل",
    "admin.settings.contact_saved": "تم حفظ المعلومات",
    "admin.settings.banks": "🏦 الحسابات البنكية",
    "admin.settings.add_bank": "+ إضافة حساب",
    "admin.settings.bank_name": "اسم البنك",
    "admin.settings.bank_holder": "اسم صاحب الحساب",
    "admin.settings.bank_number": "رقم الحساب",
    "admin.settings.bank_iban": "IBAN",
    "admin.settings.bank_saved": "تم حفظ الحساب",
    "admin.settings.bank_delete_confirm": "حذف هذا الحساب؟",
    "admin.settings.no_banks": "لا توجد حسابات. اضغطي \"إضافة حساب\".",
    "admin.settings.coupons": "🎟️ أكواد الخصم",
    "admin.settings.add_coupon": "+ إضافة كود",
    "admin.settings.coupon_code": "الكود",
    "admin.settings.coupon_type": "النوع",
    "admin.settings.coupon_value": "القيمة",
    "admin.settings.coupon_min": "أدنى طلب",
    "admin.settings.coupon_status": "الحالة",
    "admin.settings.coupon_usage": "الاستخدام",
    "admin.settings.coupon_percent": "نسبة %",
    "admin.settings.coupon_fixed": "مبلغ ثابت ₪",
    "admin.settings.coupon_active": "فعّال",
    "admin.settings.coupon_inactive": "موقوف",
    "admin.settings.coupon_uses": "مرة",
    "admin.settings.coupon_saved": "تم حفظ الكود ✓",
    "admin.settings.coupon_need_code": "أدخلي الكود أولاً",
    "admin.settings.coupon_delete_confirm": "حذف هذا الكود؟",
    "admin.settings.no_coupons": "لا توجد أكواد. اضغطي \"إضافة كود\".",
    "admin.settings.password": "🔒 تغيير كلمة المرور",
    "admin.settings.pwd_current": "الكلمة الحالية",
    "admin.settings.pwd_new": "الكلمة الجديدة",
    "admin.settings.pwd_confirm": "تأكيد الجديدة",
    "admin.settings.pwd_update": "تحديث كلمة المرور",
    "admin.settings.pwd_mismatch": "الكلمة الجديدة غير متطابقة",
    "admin.settings.pwd_wrong": "الكلمة الحالية غير صحيحة",
    "admin.settings.pwd_updated": "تم تحديث كلمة المرور ✓",
    "admin.save": "حفظ",
    "admin.delete": "حذف",

    /* Admin: categories + text editor */
    "admin.settings.categories": "📁 إدارة التصنيفات",
    "admin.settings.add_category": "+ إضافة تصنيف",
    "admin.settings.categories_help": "أضيفي تصنيفات جديدة بأسماء عربية وإنجليزية. ستظهر تلقائياً في المتجر وفي إضافة المنتجات.",
    "admin.cat.name_ar": "الاسم بالعربية",
    "admin.cat.name_en": "الاسم بالإنجليزية",
    "admin.cat.active": "مفعّل",
    "admin.cat.no_cats": "لا توجد تصنيفات. اضغطي \"إضافة تصنيف\".",
    "admin.cat.saved": "تم حفظ التصنيف ✓",
    "admin.cat.deleted": "تم حذف التصنيف",
    "admin.cat.delete_confirm": "حذف هذا التصنيف؟ المنتجات المرتبطة به ستحتاج إعادة تصنيف.",
    "admin.cat.need_names": "أكملي الاسم بالعربية والإنجليزية",
    "admin.settings.texts": "✏️ نصوص الواجهة",
    "admin.settings.texts_help": "عدّلي النصوص التي تظهر في المتجر باللغتين العربية والإنجليزية. اتركي الحقل فارغاً لاستخدام النص الافتراضي.",
    "admin.txt.default": "(افتراضي)",
    "admin.txt.placeholder_ar": "النص بالعربية (اتركي فارغاً للافتراضي)",
    "admin.txt.placeholder_en": "النص بالإنجليزية (اتركي فارغاً للافتراضي)",
    "admin.txt.save": "حفظ",
    "admin.txt.reset": "إعادة",
    "admin.txt.saved": "تم حفظ النص ✓",
    "admin.txt.reset_done": "تم استرجاع النص الافتراضي",
    "admin.txt.section.branding": "الهوية",
    "admin.txt.section.hero": "القسم العلوي",
    "admin.txt.section.sections": "العناوين",
    "admin.txt.section.checkout": "صفحة الدفع",
    "admin.txt.section.footer": "التذييل",
    "admin.txt.section.tracking": "تتبع الطلب",

    /* Admin: hero background */
    "admin.settings.hero_bg": "🖼️ خلفية البانر الرئيسي",
    "admin.settings.hero_bg_help": "ارفعي صورة فاخرة (قماش، حرير، إلخ) لتظهر خلفية الـ Hero في الصفحة الرئيسية، وتحكمي بشفافيتها.",
    "admin.settings.hero_bg_upload": "رفع صورة الخلفية",
    "admin.settings.hero_bg_drop": "اسحبي الصورة هنا أو انقري للاختيار",
    "admin.settings.hero_bg_clear": "حذف الصورة",
    "admin.settings.hero_bg_opacity": "شفافية الخلفية",
    "admin.settings.hero_bg_opacity_help": "0% = شفافة تماماً  ·  100% = ظاهرة بقوة",
    "admin.settings.hero_bg_saved": "تم حفظ خلفية البانر ✓",

    /* Admin: cities management */
    "admin.settings.cities": "🚚 مدن التوصيل",
    "admin.settings.add_city": "+ إضافة مدينة",
    "admin.settings.cities_help": "عدّلي رسوم التوصيل لكل مدينة، أو أضيفي/احذفي مدن. تعطيل المدينة يخفيها من قائمة الزبون.",
    "admin.city.name_ar": "الاسم بالعربية",
    "admin.city.name_en": "الاسم بالإنجليزية",
    "admin.city.fee": "رسوم التوصيل (₪)",
    "admin.city.active": "مفعّلة",
    "admin.city.no_cities": "لا توجد مدن. اضغطي \"إضافة مدينة\".",
    "admin.city.saved": "تم حفظ المدينة ✓",
    "admin.city.deleted": "تم حذف المدينة",
    "admin.city.delete_confirm": "حذف هذه المدينة؟",
    "admin.city.need_names": "أكملي الاسم بالعربية والإنجليزية",

    /* Customer Auth */
    "auth.title": "حسابي",
    "auth.welcome": "مرحباً بكِ في عبايات أمل",
    "auth.tab_login": "تسجيل دخول",
    "auth.tab_register": "حساب جديد",
    "auth.guest_text": "أو يمكنكِ المتابعة بدون حساب",
    "auth.guest_btn": "متابعة كزائرة",
    "auth.name": "الاسم الكامل",
    "auth.phone": "رقم الجوال",
    "auth.password": "كلمة المرور (4 أحرف على الأقل)",
    "auth.password_login": "كلمة المرور",
    "auth.login_btn": "دخول",
    "auth.register_btn": "إنشاء حساب",
    "auth.logout": "تسجيل خروج",
    "auth.my_orders": "📦 طلباتي",
    "auth.welcome_back": "أهلاً",
    "auth.account_btn": "حسابي",
    "auth.err.missing_fields": "أكملي كل الحقول",
    "auth.err.weak_password": "كلمة المرور قصيرة جداً (4 أحرف على الأقل)",
    "auth.err.phone_exists": "هذا الرقم مسجَّل مسبقاً. سجّلي الدخول.",
    "auth.err.not_found": "لم نجد حساباً بهذا الرقم",
    "auth.err.wrong_password": "كلمة المرور غير صحيحة",
    "auth.registered": "تم إنشاء حسابك بنجاح ✨",
    "auth.logged_in": "أهلاً بكِ مجدداً ✨",
    "auth.logged_out": "تم تسجيل الخروج",
    "auth.my_orders_title": "📦 طلباتي",
    "auth.no_orders": "لا توجد طلبات بعد. تسوّقي وارجعي لتري طلباتك هنا.",

    /* Admin login remember */
    "admin.login.remember": "تذكرني على هذا الجهاز",

    /* Footer */
    "footer.admin_link": "دخول الإدارة",

    /* PWA */
    "pwa.install": "📲 تثبيت التطبيق",
    "pwa.install_full": "تثبيت تطبيق عبايات أمل",
    "pwa.install_admin": "تثبيت تطبيق الإدارة",
    "pwa.ios_title": "تثبيت على iPhone",
    "pwa.ios_step1": "اضغطي زر المشاركة في Safari ⬆️",
    "pwa.ios_step2": "اختاري \"إضافة إلى الشاشة الرئيسية\"",
    "pwa.ios_step3": "اضغطي \"إضافة\" في الأعلى",
    "pwa.android_title": "تثبيت التطبيق",
    "pwa.android_body": "اضغطي \"تثبيت\" عند ظهور النافذة لتظهر أيقونة التطبيق على شاشتك الرئيسية.",
    "pwa.installed": "✓ التطبيق مثبَّت بالفعل",
    "pwa.close": "إغلاق",
  },

  en: {
    /* Brand */
    "brand.tagline": "Abaya and more",
    "brand.full": "Amal Abayas",

    /* Contact bar */
    "contact.phone": "Phone",
    "contact.whatsapp": "WhatsApp",
    "contact.instagram": "Instagram",
    "contact.track": "📦 Track my order",
    "contact.lang_toggle": "AR",

    /* Nav */
    "nav.products": "Products",
    "nav.categories": "Categories",
    "nav.admin": "Admin",
    "nav.cart": "Cart",

    /* Hero */
    "hero.headline": "Abaya and more — found at Amal",
    "hero.sub": "A curated collection of luxury abayas — everyday, occasions, classic black, and open styles. Delivery across all Gaza Strip cities.",
    "hero.cta": "Shop Now",

    /* Sections */
    "section.collection": "Our Collection",
    "section.no_products": "No products in this category yet.",

    /* Special quick-view tabs */
    "category.favorites": "❤️ Favorites",
    "category.bestseller": "🔥 Bestsellers",
    "favorites.empty": "No favorites yet. Tap ♡ on any product to add it.",
    "favorites.added": "Added to favorites ❤️",
    "favorites.removed": "Removed from favorites",

    /* Reviews */
    "reviews.title": "Customer Reviews",
    "reviews.subtitle": "What our wonderful customers say about Amal Abayas",
    "reviews.verified": "Verified buyer",
    "reviews.write": "Write a review",
    "reviews.your_name": "Your name",
    "reviews.your_rating": "Your rating",
    "reviews.your_comment": "Your comment",
    "reviews.submit": "Submit",
    "reviews.thanks": "Thanks! Your review will appear after moderation.",
    "reviews.avg_label": "Average rating",
    "reviews.based_on": "Based on",
    "reviews.review_count": "reviews",

    /* Site info */
    "siteInfo.title": "About Amal Abayas",
    "siteInfo.about": "About us",
    "siteInfo.shipping": "Shipping & Delivery",
    "siteInfo.return": "Return Policy",
    "siteInfo.faq": "FAQ",

    /* Footer policies links */
    "policy.privacy": "Privacy Policy",
    "policy.exchange": "Exchange & Return Policy",
    "policy.cod": "Cash on Delivery Policy",
    "policy.terms": "Terms & Conditions",
    "policy.size_calc": "Find your size",
    "policy.legal_title": "Important Links",
    "policy.close": "Close",

    /* Size guide additions */
    "sizeGuide.system_intl": "International",
    "sizeGuide.system_gulf": "Gulf (Khaleeji)",
    "sizeGuide.calc_title": "🧮 Calculate my size",
    "sizeGuide.calc_chest": "Chest (cm)",
    "sizeGuide.calc_waist": "Waist (cm)",
    "sizeGuide.calc_hips": "Hips (cm)",
    "sizeGuide.calc_height": "Height (cm)",
    "sizeGuide.calc_weight": "Weight (kg)",
    "sizeGuide.calc_hint": "Enter your height and weight to get the recommended Gulf size.",
    "sizeGuide.calc_btn": "Find my size",
    "sizeGuide.calc_result": "Your size is",
    "sizeGuide.calc_no_match": "Enter your measurements above to see your size",

    /* Categories */
    "category.all":         "All",
    "category.new":         "New Arrivals",
    "category.khaleeji":    "Gulf Abayas",
    "category.black":       "Black Abayas",
    "category.colored":     "Colored Abayas",
    "category.luxury":      "Luxury Abayas",
    "category.everyday":    "Everyday Abayas",
    "category.embroidered": "Embroidered Abayas",
    "category.eid":         "Eid & Ramadan",
    "category.offers":      "Special Offers",
    "category.occasions":   "Occasion Abayas",
    "category.open":        "Open Abayas",

    /* Filters */
    "filters.title": "🔍 Filters",
    "filters.fabric": "Fabric",
    "filters.cut": "Cut",
    "filters.price": "Price",
    "filters.color": "Color",
    "filters.size": "Size",
    "filters.open": "Open",
    "filters.closed": "Closed",
    "filters.plain": "Plain",
    "filters.embroidered": "Embroidered",
    "filters.daily": "Everyday",
    "filters.occasion": "Occasion",
    "filters.available": "Available only",
    "filters.bestseller": "Bestsellers",
    "filters.new": "New",
    "filters.clear": "Clear filters",
    "filters.from": "From",
    "filters.to": "To",
    "filters.toggle_open": "Show filters",
    "filters.toggle_close": "Hide filters",

    /* Fabrics */
    "fabric.crepe":   "Crepe",
    "fabric.nada":    "Nada",
    "fabric.silk":    "Silk",
    "fabric.chiffon": "Chiffon",
    "fabric.linen":   "Linen",
    "fabric.velvet":  "Velvet",
    "fabric.satin":   "Satin",
    "fabric.summer":  "Summer fabric",
    "fabric.winter":  "Winter fabric",

    /* Cuts */
    "cut.kloush":   "Klouch (A-line)",
    "cut.farasha":  "Butterfly",
    "cut.besht":    "Besht",
    "cut.kimono":   "Kimono",
    "cut.straight": "Straight",
    "cut.buttons":  "Buttoned",
    "cut.wrap":     "Wrap",
    "cut.wide":     "Wide",
    "cut.waisted":  "Fitted waist",

    /* Product card */
    "product.view": "View",
    "product.unavailable": "Unavailable",
    "product.limited": "Limited stock",
    "product.out_of_stock": "Out of stock",
    "product.discount_label": "OFF",

    /* Size Guide */
    "sizeGuide.title": "📏 Size Guide",
    "sizeGuide.subtitle": "Measure yourself with a soft tape, then match to the chart below.",
    "sizeGuide.link": "Find my size",
    "sizeGuide.measure_chest": "Chest",
    "sizeGuide.measure_waist": "Waist",
    "sizeGuide.measure_hips": "Hips",
    "sizeGuide.measure_length": "Length",
    "sizeGuide.size": "Size",
    "sizeGuide.chest_cm": "Chest",
    "sizeGuide.waist_cm": "Waist",
    "sizeGuide.sleeve_cm": "Sleeve",
    "sizeGuide.hips_cm": "Hips",
    "sizeGuide.length_cm": "Abaya Length",
    "sizeGuide.intl": "EU / US",
    "sizeGuide.unit_note": "All measurements are in centimeters (cm)",
    "sizeGuide.tips_title": "💡 How to measure accurately",
    "sizeGuide.tip1": "Use a soft tape measure and stand naturally.",
    "sizeGuide.tip2_label": "Chest:",
    "sizeGuide.tip2": "Measure around the fullest part of your chest.",
    "sizeGuide.tip3_label": "Waist:",
    "sizeGuide.tip3": "Measure at the narrowest point (around your navel).",
    "sizeGuide.tip4_label": "Hips:",
    "sizeGuide.tip4": "Measure around the fullest part of your hips.",
    "sizeGuide.tip5_label": "Length:",
    "sizeGuide.tip5": "From the top of your shoulder to your heel.",
    "sizeGuide.tip6": "If your measurement is between two sizes, pick the larger for comfort.",

    /* Product details */
    "product.color": "Color:",
    "product.size": "Size:",
    "product.stock_choose_size": "Pick a size to see availability",
    "product.stock_available": "Available:",
    "product.stock_piece": "pieces",
    "product.size_out": "This size is out of stock",
    "product.add_to_cart": "Add to cart",

    /* Cart */
    "cart.title": "🛍️ Shopping Cart",
    "cart.empty": "Your cart is empty.",
    "cart.empty_sub": "Pick something from the collection.",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Checkout",
    "cart.add_success": "Added to cart ✨",
    "cart.stock_less": "Less stock available",
    "cart.no_more": "No more stock available",
    "cart.variant_out": "This variant is out of stock",

    /* Checkout */
    "checkout.title": "Checkout",
    "checkout.sub": "Fill in your details, transfer the amount to one of the accounts, then upload the transfer receipt.",
    "checkout.name": "Full Name",
    "checkout.phone": "Mobile Number",
    "checkout.city": "City / Area",
    "checkout.city_placeholder": "Select your city...",
    "checkout.area": "Neighborhood / Street",
    "checkout.area_placeholder": "Al-Remal — Omar Al-Mukhtar St.",
    "checkout.notes": "Notes (optional)",
    "checkout.notes_placeholder": "Nearby landmark, preferred contact time...",
    "checkout.coupon_q": "🎟️ Have a discount code?",
    "checkout.coupon_placeholder": "Enter code (e.g. WELCOME10)",
    "checkout.apply": "Apply",
    "checkout.banks": "💳 Transfer the amount to one of these accounts:",
    "checkout.proof": "📸 Upload transfer receipt (required to confirm order):",
    "checkout.upload_hint": "Drag image here or click to choose",
    "checkout.upload_hint_2": "PNG / JPG — up to 10 MB",
    "checkout.confirm": "Confirm Order",
    "checkout.cancel": "Cancel",
    "checkout.items_count": "Items",
    "checkout.subtotal": "Subtotal",
    "checkout.discount_products": "Product discount",
    "checkout.coupon_line": "Discount code",
    "checkout.delivery": "Delivery",
    "checkout.total": "Total",
    "checkout.delivery_to": "delivery",
    "checkout.bank_name": "Account name",
    "checkout.bank_number": "Account number",
    "checkout.bank_iban": "IBAN",
    "checkout.bank_phone": "Mobile transfer",
    "checkout.bank_phone_fast": "Fastest transfer method",
    "checkout.copy": "Copy",
    "checkout.copied": "Copied",
    "checkout.select_city": "Please select a city",
    "checkout.upload_first": "Please upload the transfer receipt first",
    "checkout.image_too_big": "Image too large (10 MB max)",
    "checkout.no_banks": "No bank accounts available. Contact the store.",

    /* Coupon */
    "coupon.not_found": "Code not found",
    "coupon.inactive": "This code is not active",
    "coupon.min_order": "Minimum order",
    "coupon.applied": "✓ Code applied",
    "coupon.discount_percent": "off",

    /* Success */
    "success.title": "Your order was received!",
    "success.body": "Your order is now awaiting payment verification by the store. We'll contact you soon via phone or WhatsApp.",
    "success.btn": "Thank you",

    /* Tracking */
    "track.title": "📦 Track my order",
    "track.sub": "Enter your order code (e.g. AMA-XXXXXX) to see its status.",
    "track.code": "Order code",
    "track.search": "Search",
    "track.close": "Close",
    "track.not_found": "❌ No order found with this code.",
    "track.not_found_hint": "Check the code or contact us via WhatsApp.",
    "track.code_label": "Order code",
    "track.status_now": "Current status",
    "track.date": "Date",
    "track.city": "City",
    "track.cancelled": "⛔ Order cancelled",

    /* Order statuses */
    "status.awaiting": "Awaiting payment verification",
    "status.pending": "Processing",
    "status.shipped": "Shipped",
    "status.delivered": "Delivered",
    "status.cancelled": "Cancelled",

    /* Cities */
    "city.gaza": "Gaza City",
    "city.north": "North Gaza",
    "city.jabalia": "Jabalia",
    "city.beitlahia": "Beit Lahia",
    "city.beithanoun": "Beit Hanoun",
    "city.nuseirat": "Nuseirat",
    "city.bureij": "Bureij",
    "city.maghazi": "Maghazi",
    "city.zawaida": "Zawayda",
    "city.deirbalah": "Deir al-Balah",
    "city.khanyounis": "Khan Younis",
    "city.rafah": "Rafah",

    /* Footer */
    "footer.copyright": "All rights reserved. Made with love in Gaza.",

    /* Admin: login */
    "admin.login.title": "Admin Panel",
    "admin.login.sub": "Amal Abayas — Sign in",
    "admin.login.username": "Username",
    "admin.login.password": "Password",
    "admin.login.signin": "Sign in",
    "admin.login.error": "Invalid username or password",
    "admin.login.default": "Default:",
    "admin.login.change_hint": "Change it from Settings.",

    /* Admin: sidebar */
    "admin.brand.sub": "Amal Admin",
    "admin.menu.dashboard": "📊 Dashboard",
    "admin.menu.products": "👗 Products",
    "admin.menu.inventory": "📦 Inventory",
    "admin.menu.orders": "🧾 Orders",
    "admin.menu.delivery": "🚚 Delivery",
    "admin.menu.customers": "👥 Customers",
    "admin.menu.settings": "⚙️ Settings",
    "admin.menu.view_store": "🛍️ View Store",
    "admin.logout": "🚪 Sign out",

    /* Admin: dashboard */
    "admin.dash.title": "Dashboard",
    "admin.stat.today_orders": "Today's Orders",
    "admin.stat.today_orders_hint": "new orders today",
    "admin.stat.today_orders_none": "No orders yet today",
    "admin.stat.today_sales": "Today's Sales",
    "admin.stat.today_sales_hint": "From confirmed orders",
    "admin.stat.total_products": "Total Products",
    "admin.stat.products_in_catalog": "In catalog",
    "admin.stat.products_none": "No products",
    "admin.stat.stock_alert": "Stock Alert",
    "admin.stat.stock_alert_hint": "Items running low",
    "admin.stat.stock_ok": "All good",
    "admin.dash.orders": "Orders",
    "admin.dash.view_all": "View all",
    "admin.dash.city_stats": "Orders by city",
    "admin.dash.no_orders": "No orders yet.",

    /* Admin: columns */
    "admin.col.code": "Code",
    "admin.col.customer": "Customer",
    "admin.col.phone": "Phone",
    "admin.col.city": "City",
    "admin.col.pieces": "Items",
    "admin.col.total": "Total",
    "admin.col.status": "Status",
    "admin.col.date": "Date",
    "admin.col.details": "Details",
    "admin.col.image": "Image",
    "admin.col.name": "Name",
    "admin.col.category": "Category",
    "admin.col.price": "Price",
    "admin.col.discount": "Discount",
    "admin.col.colors": "Colors",
    "admin.col.stock": "Stock",
    "admin.col.actions": "Actions",
    "admin.col.orders_count": "Orders",
    "admin.col.total_amount": "Total",

    /* Admin: products */
    "admin.products.title": "Products",
    "admin.products.sub": "Add, edit, and remove abayas",
    "admin.products.add": "+ Add new product",
    "admin.products.search": "🔎 Search products...",
    "admin.products.all_categories": "All categories",
    "admin.products.none": "No products.",
    "admin.product.add_title": "Add Product",
    "admin.product.edit_title": "Edit Product",
    "admin.product.sub": "Product info, colors (each with its image), and stock per color × size.",
    "admin.product.field.name": "Product name",
    "admin.product.field.category": "Category",
    "admin.product.field.price": "Price (₪)",
    "admin.product.field.discount": "Discount % (optional)",
    "admin.product.field.sizes": "Sizes (comma-separated)",
    "admin.product.field.description": "Description",
    "admin.product.colors_section": "Colors & Images",
    "admin.product.add_color": "+ Add color",
    "admin.product.color_name": "Color name (e.g. Black)",
    "admin.product.delete_color": "Remove",
    "admin.product.upload_hint": "Drag image here or click to choose",
    "admin.product.upload_have": "Image ready (drag another to replace)",
    "admin.product.stock_section": "Stock per variant (color × size)",
    "admin.product.rebuild": "↻ Rebuild grid",
    "admin.product.stock_help": "Add colors and sizes to see the stock grid.",
    "admin.product.size_axis": "Color \\ Size",
    "admin.product.save": "Save",
    "admin.product.cancel": "Cancel",
    "admin.product.deleted": "Deleted",
    "admin.product.added": "Product added",
    "admin.product.updated": "Product updated",
    "admin.product.confirm_delete": "Delete",
    "admin.product.need_color": "Add at least one color",
    "admin.product.need_color_names": "Fill in all color names",
    "admin.product.need_color_images": "Upload an image for each color",
    "admin.product.need_sizes": "Add at least one size",
    "admin.product.image_too_big": "Image too large (10 MB max)",

    /* Admin: inventory */
    "admin.inv.title": "Inventory",
    "admin.inv.sub": "Alert when total stock falls below",
    "admin.inv.section": "Items that need restocking",
    "admin.inv.total": "Total",
    "admin.inv.status": "Status",
    "admin.inv.variants": "Variants",
    "admin.inv.save_changes": "Save changes",
    "admin.inv.all_good": "✓ All products are in good shape.",
    "admin.inv.updated": "Stock updated",
    "admin.stock.out": "Out",
    "admin.stock.low": "Low",
    "admin.stock.piece": "pcs",

    /* Admin: orders */
    "admin.orders.title": "Orders",
    "admin.orders.sub": "Manage orders and update their status",
    "admin.orders.all_cities": "All cities",
    "admin.orders.all_statuses": "All statuses",
    "admin.orders.count": "Total:",
    "admin.orders.none": "No orders.",
    "admin.order.detail_title": "Order Details",
    "admin.order.detail_sub": "Customer info, items, and transfer receipt",
    "admin.order.code_label": "Order #",
    "admin.order.status_label": "Status",
    "admin.order.name": "Name",
    "admin.order.phone": "Phone",
    "admin.order.city": "City",
    "admin.order.area": "Neighborhood/Street",
    "admin.order.notes": "Notes",
    "admin.order.date": "Date",
    "admin.order.products": "Items:",
    "admin.order.subtotal": "Subtotal",
    "admin.order.discount_products": "Product discount",
    "admin.order.coupon": "Discount code",
    "admin.order.delivery": "Delivery",
    "admin.order.total": "Total",
    "admin.order.proof": "Transfer receipt:",
    "admin.order.no_proof": "⚠️ No transfer receipt attached",
    "admin.order.update_status": "Update Status",
    "admin.order.verify_payment": "✓ Verify Payment",
    "admin.order.print": "🖨️ Print invoice",
    "admin.order.close": "Close",
    "admin.order.view": "View",
    "admin.order.status_updated": "Order status updated",
    "admin.order.payment_verified": "Payment verified — order is now processing",
    "admin.order.new_alert": "new orders!",

    /* Admin: delivery */
    "admin.delivery.title": "Delivery",
    "admin.delivery.sub": "Manage orders ready for shipping and delivery",
    "admin.delivery.in_progress": "Orders in delivery",
    "admin.delivery.ready_ship": "Ready to ship",
    "admin.delivery.in_transit": "In transit",
    "admin.delivery.delivered": "Delivered",
    "admin.delivery.active_cities": "Active cities",
    "admin.delivery.completed": "Completed orders",
    "admin.delivery.in_shipment": "In current shipment",
    "admin.delivery.quick_action": "Quick action",
    "admin.delivery.ship_now": "↑ Ship now",
    "admin.delivery.mark_delivered": "✓ Mark delivered",
    "admin.delivery.none": "No orders currently in delivery.",
    "admin.delivery.updated": "Status updated ✓",

    /* Admin: customers */
    "admin.customers.title": "Customers",
    "admin.customers.sub": "Customer list and their order history",
    "admin.customers.list": "Customer list",
    "admin.customers.search": "🔎 Search by name or phone...",
    "admin.customers.total": "Total customers",
    "admin.customers.unique": "Unique customers",
    "admin.customers.repeat": "Repeat customers",
    "admin.customers.repeat_hint": "Ordered more than once",
    "admin.customers.total_spent": "Total spent",
    "admin.customers.spent_hint": "Across all customers",
    "admin.customers.avg": "Average order",
    "admin.customers.avg_hint": "Per-order value",
    "admin.customers.last_order": "Last order",
    "admin.customers.none": "No customers yet.",

    /* Admin: settings */
    "admin.settings.title": "Settings",
    "admin.settings.sub": "Contact info, bank accounts, and security",
    "admin.settings.contact": "📞 Contact info",
    "admin.settings.phone": "Phone number",
    "admin.settings.whatsapp": "WhatsApp number",
    "admin.settings.instagram": "Instagram handle (without @)",
    "admin.settings.sound": "Sound alert on new order",
    "admin.settings.sound_toggle": "Play notification sound",
    "admin.settings.headline": "Page headline",
    "admin.settings.save_contact": "Save contact info",
    "admin.settings.contact_saved": "Settings saved",
    "admin.settings.banks": "🏦 Bank Accounts",
    "admin.settings.add_bank": "+ Add account",
    "admin.settings.bank_name": "Bank name",
    "admin.settings.bank_holder": "Account holder name",
    "admin.settings.bank_number": "Account number",
    "admin.settings.bank_iban": "IBAN",
    "admin.settings.bank_saved": "Account saved",
    "admin.settings.bank_delete_confirm": "Delete this account?",
    "admin.settings.no_banks": "No accounts. Click \"Add account\".",
    "admin.settings.coupons": "🎟️ Discount Codes",
    "admin.settings.add_coupon": "+ Add code",
    "admin.settings.coupon_code": "Code",
    "admin.settings.coupon_type": "Type",
    "admin.settings.coupon_value": "Value",
    "admin.settings.coupon_min": "Min order",
    "admin.settings.coupon_status": "Status",
    "admin.settings.coupon_usage": "Uses",
    "admin.settings.coupon_percent": "Percent %",
    "admin.settings.coupon_fixed": "Fixed ₪",
    "admin.settings.coupon_active": "Active",
    "admin.settings.coupon_inactive": "Inactive",
    "admin.settings.coupon_uses": "uses",
    "admin.settings.coupon_saved": "Code saved ✓",
    "admin.settings.coupon_need_code": "Enter the code first",
    "admin.settings.coupon_delete_confirm": "Delete this code?",
    "admin.settings.no_coupons": "No codes. Click \"Add code\".",
    "admin.settings.password": "🔒 Change Password",
    "admin.settings.pwd_current": "Current password",
    "admin.settings.pwd_new": "New password",
    "admin.settings.pwd_confirm": "Confirm new",
    "admin.settings.pwd_update": "Update password",
    "admin.settings.pwd_mismatch": "New password doesn't match",
    "admin.settings.pwd_wrong": "Current password is incorrect",
    "admin.settings.pwd_updated": "Password updated ✓",
    "admin.save": "Save",
    "admin.delete": "Delete",

    /* Admin: categories + text editor */
    "admin.settings.categories": "📁 Categories",
    "admin.settings.add_category": "+ Add category",
    "admin.settings.categories_help": "Add new categories with Arabic and English names. They will appear in the store and in product editing automatically.",
    "admin.cat.name_ar": "Arabic name",
    "admin.cat.name_en": "English name",
    "admin.cat.active": "Active",
    "admin.cat.no_cats": "No categories. Click \"Add category\".",
    "admin.cat.saved": "Category saved ✓",
    "admin.cat.deleted": "Category deleted",
    "admin.cat.delete_confirm": "Delete this category? Products in it will need to be re-categorized.",
    "admin.cat.need_names": "Fill in both Arabic and English names",
    "admin.settings.texts": "✏️ Interface Texts",
    "admin.settings.texts_help": "Edit the texts shown in the store in both Arabic and English. Leave a field empty to use the default text.",
    "admin.txt.default": "(default)",
    "admin.txt.placeholder_ar": "Arabic text (leave empty for default)",
    "admin.txt.placeholder_en": "English text (leave empty for default)",
    "admin.txt.save": "Save",
    "admin.txt.reset": "Reset",
    "admin.txt.saved": "Text saved ✓",
    "admin.txt.reset_done": "Text restored to default",
    "admin.txt.section.branding": "Branding",
    "admin.txt.section.hero": "Hero section",
    "admin.txt.section.sections": "Section titles",
    "admin.txt.section.checkout": "Checkout",
    "admin.txt.section.footer": "Footer",
    "admin.txt.section.tracking": "Order tracking",

    /* Admin: hero background */
    "admin.settings.hero_bg": "🖼️ Hero Background",
    "admin.settings.hero_bg_help": "Upload a luxury fabric/silk image to display as the hero background, and control its opacity.",
    "admin.settings.hero_bg_upload": "Upload background image",
    "admin.settings.hero_bg_drop": "Drag image here or click to choose",
    "admin.settings.hero_bg_clear": "Remove image",
    "admin.settings.hero_bg_opacity": "Background opacity",
    "admin.settings.hero_bg_opacity_help": "0% = fully transparent · 100% = fully visible",
    "admin.settings.hero_bg_saved": "Hero background saved ✓",

    /* Admin: cities management */
    "admin.settings.cities": "🚚 Delivery Cities",
    "admin.settings.add_city": "+ Add city",
    "admin.settings.cities_help": "Edit delivery fees per city, or add/remove cities. Deactivating a city hides it from customer dropdown.",
    "admin.city.name_ar": "Arabic name",
    "admin.city.name_en": "English name",
    "admin.city.fee": "Delivery fee (₪)",
    "admin.city.active": "Active",
    "admin.city.no_cities": "No cities. Click \"Add city\".",
    "admin.city.saved": "City saved ✓",
    "admin.city.deleted": "City deleted",
    "admin.city.delete_confirm": "Delete this city?",
    "admin.city.need_names": "Fill in both Arabic and English names",

    /* Customer Auth */
    "auth.title": "My Account",
    "auth.welcome": "Welcome to Amal Abayas",
    "auth.tab_login": "Sign in",
    "auth.tab_register": "Create account",
    "auth.guest_text": "Or continue without an account",
    "auth.guest_btn": "Continue as guest",
    "auth.name": "Full name",
    "auth.phone": "Mobile number",
    "auth.password": "Password (at least 4 chars)",
    "auth.password_login": "Password",
    "auth.login_btn": "Sign in",
    "auth.register_btn": "Create account",
    "auth.logout": "Sign out",
    "auth.my_orders": "📦 My orders",
    "auth.welcome_back": "Welcome",
    "auth.account_btn": "My Account",
    "auth.err.missing_fields": "Please fill in all fields",
    "auth.err.weak_password": "Password too short (at least 4 characters)",
    "auth.err.phone_exists": "This number is already registered. Sign in instead.",
    "auth.err.not_found": "No account with this number",
    "auth.err.wrong_password": "Incorrect password",
    "auth.registered": "Account created successfully ✨",
    "auth.logged_in": "Welcome back ✨",
    "auth.logged_out": "Signed out",
    "auth.my_orders_title": "📦 My Orders",
    "auth.no_orders": "No orders yet. Shop and come back to see your orders here.",

    /* Admin login remember */
    "admin.login.remember": "Remember me on this device",

    /* Footer */
    "footer.admin_link": "Admin Login",

    /* PWA */
    "pwa.install": "📲 Install App",
    "pwa.install_full": "Install Amal Abayas app",
    "pwa.install_admin": "Install Admin app",
    "pwa.ios_title": "Install on iPhone",
    "pwa.ios_step1": "Tap the Share button in Safari ⬆️",
    "pwa.ios_step2": "Select \"Add to Home Screen\"",
    "pwa.ios_step3": "Tap \"Add\" at the top",
    "pwa.android_title": "Install App",
    "pwa.android_body": "Tap \"Install\" when the prompt appears so the app icon appears on your home screen.",
    "pwa.installed": "✓ App already installed",
    "pwa.close": "Close",
  },
};

function getLang() {
  return localStorage.getItem(LANG_KEY) || "ar";
}
function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}
let _overridesCache = null;
function _loadOverrides() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) { _overridesCache = { ar: {}, en: {} }; return; }
    const db = JSON.parse(raw);
    _overridesCache = db.settings?.textOverrides || { ar: {}, en: {} };
  } catch (e) { _overridesCache = { ar: {}, en: {} }; }
}
function t(key) {
  if (_overridesCache === null) _loadOverrides();
  const lang = getLang();
  const override = _overridesCache[lang]?.[key];
  if (override) return override;
  return (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;
}

/* قائمة النصوص القابلة للتحرير من لوحة الإدارة */
const EDITABLE_TEXTS = [
  { key: "brand.full",         section: "branding", label_ar: "اسم المتجر",                   label_en: "Store name" },
  { key: "brand.tagline",      section: "branding", label_ar: "العنوان الفرعي للماركة",      label_en: "Brand tagline" },
  { key: "hero.headline",      section: "hero",     label_ar: "العنوان الرئيسي في الصفحة",   label_en: "Hero headline" },
  { key: "hero.sub",           section: "hero",     label_ar: "الوصف تحت العنوان الرئيسي",   label_en: "Hero subtitle" },
  { key: "hero.cta",           section: "hero",     label_ar: "نص زر التسوق",               label_en: "Shop button text" },
  { key: "section.collection", section: "sections", label_ar: "عنوان قسم المنتجات",          label_en: "Products section title" },
  { key: "success.title",      section: "checkout", label_ar: "عنوان رسالة نجاح الطلب",     label_en: "Order success title" },
  { key: "success.body",       section: "checkout", label_ar: "نص رسالة نجاح الطلب",        label_en: "Order success body" },
  { key: "success.btn",        section: "checkout", label_ar: "زر تأكيد نجاح الطلب",        label_en: "Success button" },
  { key: "footer.copyright",   section: "footer",   label_ar: "نص حقوق النشر في التذييل",    label_en: "Footer copyright" },
  { key: "track.sub",          section: "tracking", label_ar: "وصف صفحة تتبع الطلب",        label_en: "Tracking page description" },
];

/* Apply translations to all elements with [data-i18n] */
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    el.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key));
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    el.setAttribute("title", t(key));
  });
}

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
    try {
      const db = JSON.parse(raw);
      /* migrations  —  أضِف الحقول الجديدة لقواعد البيانات القديمة */
      if (!db.settings.categories) db.settings.categories = defaultCategories();
      /* اكتشف وإستبدل قوائم التصنيفات القديمة (offers/sale/khaleeji/luxury/new) */
      const oldCatIds = new Set(["offers", "sale", "khaleeji", "luxury", "new"]);
      if (db.settings.categories.some(c => oldCatIds.has(c.id))) {
        db.settings.categories = defaultCategories();
      }
      if (!db.settings.textOverrides) db.settings.textOverrides = { ar: {}, en: {} };
      if (!db.settings.cities) db.settings.cities = defaultCities();
      if (!db.settings.customers) db.settings.customers = [];
      /* أعِد بيانات دخول الأدمن الافتراضية إن كانت مفقودة (يصلح قواعد
         بيانات جزئية كُتبت بالخطأ، حتى لا يتعطّل تسجيل الدخول) */
      if (!db.settings.admin) db.settings.admin = { username: "admin", password: "admin123" };
      if (db.settings.heroBgOpacity === undefined) db.settings.heroBgOpacity = 0.55;
      if (db.settings.heroBgImage === undefined) db.settings.heroBgImage = "";
      /* migrations جديدة: fabrics, cuts, reviews, siteInfo, sizeCharts */
      if (!db.settings.fabrics)   db.settings.fabrics = DEFAULT_FABRICS.slice();
      if (!db.settings.cuts)      db.settings.cuts    = DEFAULT_CUTS.slice();
      if (!db.settings.reviews)   db.settings.reviews = defaultReviews();
      if (!db.settings.siteInfo)  db.settings.siteInfo = defaultSiteInfo();
      /* أضف السياسات الأربع إن لم تكن موجودة */
      const policiesDefaults = defaultSiteInfo();
      ["privacyPolicy", "exchangePolicy", "codPolicy", "termsConditions"].forEach(k => {
        if (!db.settings.siteInfo[k]) db.settings.siteInfo[k] = policiesDefaults[k];
      });
      if (!db.settings.sizeCharts) db.settings.sizeCharts = defaultSizeCharts();
      /* فحص النسخة القديمة من جدول المقاسات الخليجي:
         إن لم يحتو على عمود sleeve أو احتوى مقاسات قديمة (40،42،44...) - استبدله */
      const gulf = db.settings.sizeCharts.gulf;
      if (Array.isArray(gulf) && gulf.length > 0) {
        const hasOldSizes = gulf.some(r => ["40","42","44","46","48","50"].includes(r.size));
        const hasSleeve   = gulf.every(r => r.sleeve !== undefined);
        if (hasOldSizes || !hasSleeve) {
          db.settings.sizeCharts = defaultSizeCharts();
        }
      }
      return db;
    } catch (e) { /* corrupt */ }
  }
  const seed = seedData();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  _overridesCache = null;   /* أبطل كاش النصوص عند أي تحديث */
}

function defaultCategories() {
  /* القائمة الفعلية لعبايات أمل  —  مرتّبة بالأولوية */
  return [
    { id: "everyday",      name_ar: "عملية",          name_en: "Practical",       active: true },
    { id: "black",         name_ar: "سوداء",          name_en: "Black",           active: true },
    { id: "colored",       name_ar: "ملونة",          name_en: "Colored",         active: true },
    { id: "embroidered",   name_ar: "تطريز",          name_en: "Embroidered",     active: true },
    { id: "open_2pieces",  name_ar: "مفتوحة قطعتين",  name_en: "Open Two-Piece",  active: true },
    { id: "cardigan",      name_ar: "كارديغان",       name_en: "Cardigan",        active: true },
    { id: "eid",           name_ar: "عيد ورمضان",     name_en: "Eid & Ramadan",   active: true },
    { id: "complete_look", name_ar: "كملي ستايلك",    name_en: "Complete Look",   active: true },
    { id: "blazer",        name_ar: "بليزر",          name_en: "Blazer",          active: true },
  ];
}

/* قائمة الأقمشة المتاحة  —  تظهر كفلتر وفي نموذج المنتج */
const DEFAULT_FABRICS = [
  { id: "crepe",   name_ar: "كريب",       name_en: "Crepe" },
  { id: "nada",    name_ar: "ندى",        name_en: "Nada" },
  { id: "silk",    name_ar: "حرير",       name_en: "Silk" },
  { id: "chiffon", name_ar: "شيفون",      name_en: "Chiffon" },
  { id: "linen",   name_ar: "لينن",       name_en: "Linen" },
  { id: "velvet",  name_ar: "مخمل",       name_en: "Velvet" },
  { id: "satin",   name_ar: "ساتان",      name_en: "Satin" },
  { id: "summer",  name_ar: "قماش صيفي",  name_en: "Summer fabric" },
  { id: "winter",  name_ar: "قماش شتوي",  name_en: "Winter fabric" },
];

/* مراجعات افتراضية لدعم الصفحة */
function defaultReviews() {
  return [
    { id: uid(), name: "نور أبو رشيد", rating: 5, date: "2026-04-22", text: "العباية وصلت بحالة ممتازة، القماش فاخر والخياطة دقيقة. شكراً عبايات أمل!", verified: true },
    { id: uid(), name: "ريم الأغا",     rating: 5, date: "2026-04-18", text: "أجمل عباية لبستها بحياتي. التطريز الذهبي تحفة فنية حقيقية. ممتنة جداً.", verified: true },
    { id: uid(), name: "هبة شاهين",     rating: 4, date: "2026-04-10", text: "الجودة عالية، والمقاس مظبوط حسب الجدول. التوصيل أسرع مما توقعت.", verified: true },
    { id: uid(), name: "سحر النجار",    rating: 5, date: "2026-03-29", text: "موظفات المتجر متعاونات جداً، ساعدوني في اختيار المقاس المناسب. تجربة رائعة.", verified: false },
    { id: uid(), name: "علا حمدان",     rating: 5, date: "2026-03-15", text: "عباية المسائية مثل الصورة بالضبط. الحرير ناعم والتفصيل أنيق. سأطلب مرة ثانية بإذن الله.", verified: true },
    { id: uid(), name: "آلاء البطنيجي", rating: 4, date: "2026-03-02", text: "أحببت العباية كثيراً، اللون والخامة كما هو موصوف. سعر مناسب للجودة.", verified: true },
    { id: uid(), name: "مروى زقوت",     rating: 5, date: "2026-02-20", text: "خدمة ممتازة وتوصيل سريع لمدينة غزة. القماش ثقيل ومميز. أنصح بشدة.", verified: true },
    { id: uid(), name: "ميسر اشتيوي",   rating: 5, date: "2026-02-08", text: "تشكيلة العبايات المفتوحة رائعة، طلبت اثنتين وكلاهما بمستوى عالٍ. شكراً للأخوات.", verified: false },
  ];
}

/* معلومات الموقع الافتراضية */
function defaultSiteInfo() {
  return {
    aboutUs: {
      ar: "عبايات أمل علامة فلسطينية ولدت من شغف بالأناقة الراقية. نختار أجود الأقمشة ونحرص على تفاصيل التطريز اليدوي لتصل إليكِ عباية تليق بإطلالتك.",
      en: "Amal Abayas is a Palestinian brand born from a passion for refined elegance. We hand-pick the finest fabrics and meticulously craft every embroidery to bring you an abaya worthy of you.",
    },
    shipping: {
      ar: "نوصِّل لكل مدن قطاع غزة. الرسوم تختلف بحسب المدينة (15₪ - 30₪)، والتوصيل خلال 1-3 أيام عمل.",
      en: "We deliver to all Gaza Strip cities. Fees vary by city (15-30 ILS), with delivery in 1-3 business days.",
    },
    returnPolicy: {
      ar: "يمكنكِ استبدال أو إرجاع المنتج خلال 3 أيام من الاستلام بشرط أن يكون بحالته الأصلية وبدون استخدام.",
      en: "You can exchange or return within 3 days of receipt provided the item is in original condition and unused.",
    },
    faq: {
      ar: "تواصلي معنا عبر الواتساب لأي سؤال عن المقاس أو القماش أو التوصيل قبل الطلب.",
      en: "Contact us on WhatsApp for any question about size, fabric, or delivery before ordering.",
    },
    privacyPolicy: {
      ar: `نلتزم في عبايات أمل بحماية خصوصية عميلاتنا الكريمات. هذه السياسة توضح المعلومات التي نجمعها وكيف نستخدمها:

1. المعلومات التي نجمعها:
   • الاسم ورقم الجوال والعنوان (لإتمام التوصيل فقط)
   • بيانات الطلبات والمشتريات
   • صورة إيصال التحويل (لتأكيد الدفع)

2. كيف نستخدم معلوماتك:
   • تنفيذ الطلب وتوصيله
   • التواصل معكِ بشأن طلبك
   • تحسين تجربة التسوق لديكِ

3. حماية بياناتك:
   • لا نشارك معلوماتك مع أي طرف ثالث إلا لأغراض التوصيل
   • نستخدم تقنيات تشفير لحماية بياناتك
   • لكِ الحق في طلب حذف بياناتك في أي وقت

4. الكوكيز:
   • نستخدم كوكيز بسيطة لتذكّر تفضيلاتك (اللغة، السلة)

للاستفسار عن خصوصيتك، تواصلي معنا عبر الواتساب.`,
      en: `At Amal Abayas, we are committed to protecting our customers' privacy. This policy explains what information we collect and how we use it:

1. Information we collect:
   • Name, phone, and address (for delivery only)
   • Order and purchase data
   • Transfer receipt image (to confirm payment)

2. How we use your information:
   • Process and deliver your order
   • Contact you about your order
   • Improve your shopping experience

3. Protecting your data:
   • We do not share your information with third parties except for delivery purposes
   • We use encryption to protect your data
   • You have the right to request deletion of your data at any time

4. Cookies:
   • We use simple cookies to remember your preferences (language, cart)

For any privacy questions, contact us on WhatsApp.`,
    },
    exchangePolicy: {
      ar: `سياسة الاستبدال والاسترجاع في عبايات أمل:

✅ يمكنكِ استبدال أو إرجاع العباية خلال 3 أيام من الاستلام بشرط:
   • أن تكون بحالتها الأصلية (لم تُستخدم، لم تُغسل، لم تُعدّل)
   • محتفظة بالعلامات والتغليف الأصلي
   • مرفق معها فاتورة الشراء أو رمز الطلب

❌ لا يمكن استبدال أو استرجاع:
   • العبايات المخصصة (تفصيل خاص)
   • العبايات التي تم استخدامها أو غسلها
   • قطع التخفيضات النهائية

💰 رد المبلغ:
   • يتم رد ثمن العباية بالكامل بنفس طريقة الدفع
   • رسوم التوصيل غير قابلة للاسترداد
   • قد تطبق رسوم استرجاع رمزية (10 شيكل)

🔄 الاستبدال بحجم آخر:
   • مجاني إذا كان الحجم المتوفر بنفس السعر
   • تتم تغطية فرق السعر إن وُجد

للبدء بطلب استبدال أو إرجاع، تواصلي معنا عبر الواتساب مع ذكر رمز الطلب.`,
      en: `Exchange & Return Policy at Amal Abayas:

✅ You may exchange or return within 3 days of delivery provided:
   • Item is in original condition (unused, unwashed, unaltered)
   • Original tags and packaging are intact
   • Order receipt or code is included

❌ Non-returnable items:
   • Custom-made abayas (made-to-order)
   • Used or washed items
   • Final-sale discounted items

💰 Refunds:
   • Full item refund via the original payment method
   • Delivery fees are non-refundable
   • A small return fee may apply (10 ILS)

🔄 Size exchange:
   • Free if the replacement size is at the same price
   • Price difference will be charged if any

To start an exchange or return, contact us via WhatsApp with your order code.`,
    },
    codPolicy: {
      ar: `سياسة الدفع عند الاستلام في عبايات أمل:

نوفر خيار الدفع عند الاستلام لمدن قطاع غزة لراحتك التامة:

💵 كيف يعمل:
   • اطلبي عبايتك عبر الموقع
   • نقوم بتجهيز الطلب وشحنه
   • تدفعين المبلغ كاش عند استلام الطلب من المندوب

📦 شروط الدفع عند الاستلام:
   • متاح لجميع مدن قطاع غزة
   • الحد الأدنى للطلب: 100 شيكل
   • الحد الأقصى: 1500 شيكل (للطلبات الأكبر يلزم تحويل بنكي مسبق)
   • تأكيد الطلب يتم عبر الواتساب قبل الشحن

⚠️ ملاحظات مهمة:
   • في حال عدم استلام الطلب أو رفضه دون سبب، قد يتم إيقاف خاصية الدفع عند الاستلام مستقبلاً
   • يرجى توفير المبلغ بالضبط لتسهيل الاستلام
   • يحق للمندوب طلب هوية شخصية للتأكد

💳 الطرق الأخرى للدفع المتاحة:
   • تحويل بنكي
   • محفظة إلكترونية`,
      en: `Cash on Delivery (COD) Policy at Amal Abayas:

We offer cash on delivery for all Gaza Strip cities for your convenience:

💵 How it works:
   • Order your abaya through the website
   • We prepare and ship the order
   • You pay in cash when receiving from the courier

📦 COD conditions:
   • Available in all Gaza Strip cities
   • Minimum order: 100 ILS
   • Maximum order: 1500 ILS (larger orders require bank transfer)
   • Order is confirmed via WhatsApp before shipping

⚠️ Important notes:
   • If an order is unjustifiably refused, COD may be disabled on future orders
   • Please have exact change ready
   • The courier may request ID verification

💳 Other available payment methods:
   • Bank transfer
   • Electronic wallet`,
    },
    termsConditions: {
      ar: `الشروط العامة والأحكام لمتجر عبايات أمل:

1. القبول بالشروط:
   استخدامك لهذا الموقع وإجراؤك لطلب شراء يعني موافقتك على هذه الشروط.

2. المنتجات والأسعار:
   • جميع الأسعار معروضة بالشيكل (₪)
   • الأسعار قابلة للتغيير دون إشعار مسبق
   • نسعى لعرض ألوان المنتجات بدقة، لكن قد يختلف اللون قليلاً حسب شاشة الجهاز

3. الطلبات والشحن:
   • نحتفظ بحق إلغاء أي طلب لأسباب فنية أو مخزون
   • يتم تأكيد الطلب عبر الواتساب قبل الشحن
   • مدة التوصيل: 1-3 أيام عمل داخل قطاع غزة

4. المسؤولية:
   • لسنا مسؤولين عن أي تأخير في التوصيل لظروف خارجة عن إرادتنا
   • العميلة مسؤولة عن تقديم عنوان صحيح ومعلومات اتصال دقيقة

5. حقوق الملكية الفكرية:
   • جميع المحتويات (نصوص، صور، تصاميم) ملكية حصرية لعبايات أمل
   • يحظر استخدامها لأغراض تجارية دون إذن خطي

6. النزاعات:
   • أي نزاع يخضع لقوانين فلسطين
   • نسعى أولاً لحل النزاعات ودياً

7. التواصل:
   لأي استفسار، تواصلي معنا عبر الواتساب أو الإيميل.`,
      en: `General Terms & Conditions for Amal Abayas Store:

1. Acceptance of Terms:
   By using this website and placing an order, you agree to these terms.

2. Products & Pricing:
   • All prices are in Israeli Shekels (₪)
   • Prices are subject to change without notice
   • We strive to display product colors accurately, but actual colors may vary slightly depending on your screen

3. Orders & Shipping:
   • We reserve the right to cancel any order for technical or stock reasons
   • Orders are confirmed via WhatsApp before shipping
   • Delivery time: 1-3 business days within Gaza Strip

4. Liability:
   • We are not responsible for delivery delays due to circumstances beyond our control
   • The customer is responsible for providing accurate address and contact information

5. Intellectual Property:
   • All content (text, images, designs) is the exclusive property of Amal Abayas
   • Commercial use without written permission is prohibited

6. Disputes:
   • Any dispute is subject to Palestinian law
   • We first seek to resolve disputes amicably

7. Contact:
   For any inquiries, contact us via WhatsApp or email.`,
    },
  };
}

/* جداول المقاسات (دولي + خليجي)، قابلة للتعديل */
function defaultSizeCharts() {
  return {
    intl: [
      { size: "XS",  chest: "80–84",   waist: "60–64",   hips: "84–88",    length: "130", intl: "36 / 4" },
      { size: "S",   chest: "84–88",   waist: "64–68",   hips: "88–92",    length: "135", intl: "38 / 6" },
      { size: "M",   chest: "88–94",   waist: "68–74",   hips: "92–98",    length: "140", intl: "40 / 8–10" },
      { size: "L",   chest: "94–100",  waist: "74–80",   hips: "98–104",   length: "145", intl: "44 / 12" },
      { size: "XL",  chest: "100–108", waist: "80–88",   hips: "104–112",  length: "150", intl: "46 / 14" },
      { size: "XXL", chest: "108–116", waist: "88–96",   hips: "112–120",  length: "152", intl: "48 / 16" },
      { size: "3XL", chest: "116–124", waist: "96–104",  hips: "120–128",  length: "155", intl: "50 / 18" },
    ],
    gulf: [
      /* النظام الخليجي للعبايات: يعتمد طول الكم بدل الخصر (لأن العباية فضفاضة) */
      { size: "52", length: "128", sleeve: "67", chest: "109", hips: "117", intl: "L"  },
      { size: "54", length: "133", sleeve: "69", chest: "114", hips: "122", intl: "XL" },
      { size: "56", length: "138", sleeve: "71", chest: "119", hips: "130", intl: "XL-XXL" },
      { size: "58", length: "143", sleeve: "73", chest: "124", hips: "136", intl: "XXL" },
      { size: "60", length: "148", sleeve: "76", chest: "129", hips: "142", intl: "3XL" },
      { size: "62", length: "153", sleeve: "78", chest: "134", hips: "146", intl: "3XL+" },
    ],
    description: {
      ar: "دليل المقاسات الخليجي — اختاري المقاس بناءً على طولكِ ووزنكِ. عند الشك بين مقاسين، اختاري الأكبر للراحة.",
      en: "Gulf size guide — pick your size based on height and weight. When in doubt, choose the larger size for comfort.",
    },
  };
}

/* قَصّات العبايات */
const DEFAULT_CUTS = [
  { id: "kloush",     name_ar: "كلوش",          name_en: "Klouch (A-line)" },
  { id: "farasha",    name_ar: "فراشة",         name_en: "Butterfly" },
  { id: "besht",      name_ar: "بشت",           name_en: "Besht" },
  { id: "kimono",     name_ar: "كيمونو",        name_en: "Kimono" },
  { id: "straight",   name_ar: "مستقيمة",       name_en: "Straight" },
  { id: "buttons",    name_ar: "بأزرار",        name_en: "Buttoned" },
  { id: "wrap",       name_ar: "لف / Wrap",     name_en: "Wrap" },
  { id: "wide",       name_ar: "واسعة",         name_en: "Wide" },
  { id: "waisted",    name_ar: "بخصر محدد",     name_en: "Fitted waist" },
];

function defaultCities() {
  return [
    { id: "gaza",       name_ar: "مدينة غزة",  name_en: "Gaza City",     fee: 15, active: true },
    { id: "north",      name_ar: "شمال غزة",   name_en: "North Gaza",    fee: 20, active: true },
    { id: "jabalia",    name_ar: "جباليا",     name_en: "Jabalia",       fee: 20, active: true },
    { id: "beitlahia",  name_ar: "بيت لاهيا",  name_en: "Beit Lahia",    fee: 25, active: true },
    { id: "beithanoun", name_ar: "بيت حانون",  name_en: "Beit Hanoun",   fee: 25, active: true },
    { id: "nuseirat",   name_ar: "النصيرات",   name_en: "Nuseirat",      fee: 20, active: true },
    { id: "bureij",     name_ar: "البريج",     name_en: "Bureij",        fee: 20, active: true },
    { id: "maghazi",    name_ar: "المغازي",    name_en: "Maghazi",       fee: 20, active: true },
    { id: "zawaida",    name_ar: "الزوايدة",   name_en: "Zawayda",       fee: 22, active: true },
    { id: "deirbalah",  name_ar: "دير البلح",  name_en: "Deir al-Balah", fee: 20, active: true },
    { id: "khanyounis", name_ar: "خان يونس",   name_en: "Khan Younis",   fee: 25, active: true },
    { id: "rafah",      name_ar: "رفح",        name_en: "Rafah",         fee: 30, active: true },
  ];
}

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
        category: "luxury",
        fabric: "satin",
        cut: "kloush",
        isOpen: false,
        isEmbroidered: true,
        isBestseller: true,
        isNew: false,
        price: 340,
        discount: 0,
        colors: [
          { name: "أسود",      images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=900&q=80"] },
          { name: "بني داكن",  images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&q=80"] },
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
        fabric: "crepe",
        cut: "straight",
        isOpen: false,
        isEmbroidered: false,
        isBestseller: false,
        isNew: true,
        price: 180,
        discount: 10,
        colors: [
          { name: "أسود", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80"] },
        ],
        sizes: ["S", "M", "L"],
        stock: { "أسود|S": 4, "أسود|M": 6, "أسود|L": 3 },
      },
      {
        id: p3Id,
        name: "عباية الخليج الفاخرة",
        description: "عباية سوداء كلاسيكية بتطريز ذهبي يدوي على الأكمام والياقة.",
        category: "khaleeji",
        fabric: "silk",
        cut: "kloush",
        isOpen: false,
        isEmbroidered: true,
        isBestseller: true,
        isNew: false,
        price: 280,
        discount: 0,
        colors: [
          { name: "أسود", images: ["https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&q=80"] },
        ],
        sizes: ["M", "L", "XL"],
        stock: { "أسود|M": 4, "أسود|L": 5, "أسود|XL": 3 },
      },
      {
        id: p4Id,
        name: "عباية مفتوحة عصرية",
        description: "عباية مفتوحة بقصة فضفاضة وحزام علوي، لإطلالة جريئة ومميزة.",
        category: "colored",
        fabric: "chiffon",
        cut: "wrap",
        isOpen: true,
        isEmbroidered: false,
        isBestseller: false,
        isNew: true,
        price: 260,
        discount: 15,
        colors: [
          { name: "أسود", images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80"] },
          { name: "بيج",  images: ["https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=80"] },
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
        instagram: "amal.abaya",
      },
      heroBgImage: "",      /* data URL أو رابط - يُحفظ من الإعدادات */
      heroBgOpacity: 0.55,  /* 0-1 */
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
      categories: defaultCategories(),
      cities: defaultCities(),
      fabrics: DEFAULT_FABRICS.slice(),
      cuts: DEFAULT_CUTS.slice(),
      reviews: defaultReviews(),
      siteInfo: defaultSiteInfo(),
      sizeCharts: defaultSizeCharts(),
      textOverrides: { ar: {}, en: {} },
      customers: [],
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
var ProductsAPI = {
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

  /* مصفوفة صور لون معيّن  —  تدعم الصيغة القديمة .image والجديدة .images[] */
  colorImages(color) {
    if (!color) return [];
    if (Array.isArray(color.images) && color.images.length) return color.images;
    if (color.image) return [color.image];
    return [];
  },

  /* صورة الغلاف لمنتج (أول صورة لأول لون) */
  coverImage(p) {
    const c = p?.colors?.[0];
    return c ? (this.colorImages(c)[0] || "") : "";
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
var OrdersAPI = {
  list() { return loadDB().orders.slice().reverse(); },

  /* ترجع Promise بـ { ok, order, error } لتتوافق مع طبقة Supabase
     ويتمكن المتصل من التأكد قبل عرض رسالة النجاح. */
  add(order) {
    try {
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
      return Promise.resolve({ ok: true, order });
    } catch (error) {
      console.error("[add order:localStorage]", error);
      return Promise.resolve({ ok: false, error });
    }
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
var SettingsAPI = {
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
   FabricsAPI / CutsAPI  —  أقمشة وقَصّات قابلة للتحرير
========================================================= */
function makeLookupAPI(key, defaults) {
  return {
    list() { return SettingsAPI.get()[key] || defaults; },
    save(item) {
      const db = loadDB();
      db.settings[key] = db.settings[key] || [];
      if (item.id && db.settings[key].find(x => x.id === item.id)) {
        const idx = db.settings[key].findIndex(x => x.id === item.id);
        db.settings[key][idx] = { ...db.settings[key][idx], ...item };
      } else {
        if (!item.id) {
          item.id = (item.name_en || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid();
        }
        db.settings[key].push(item);
      }
      saveDB(db);
      return item;
    },
    remove(id) {
      const db = loadDB();
      db.settings[key] = (db.settings[key] || []).filter(x => x.id !== id);
      saveDB(db);
    },
  };
}
var FabricsAPI = makeLookupAPI("fabrics", DEFAULT_FABRICS);
var CutsAPI    = makeLookupAPI("cuts",    DEFAULT_CUTS);

/* =========================================================
   ReviewsAPI  —  مراجعات العملاء
========================================================= */
var ReviewsAPI = {
  list() { return SettingsAPI.get().reviews || []; },
  save(review) {
    const db = loadDB();
    db.settings.reviews = db.settings.reviews || [];
    if (review.id && db.settings.reviews.find(r => r.id === review.id)) {
      const idx = db.settings.reviews.findIndex(r => r.id === review.id);
      db.settings.reviews[idx] = { ...db.settings.reviews[idx], ...review };
    } else {
      if (!review.id) review.id = uid();
      if (!review.date) review.date = new Date().toISOString().slice(0, 10);
      db.settings.reviews.unshift(review);
    }
    saveDB(db);
    return review;
  },
  remove(id) {
    const db = loadDB();
    db.settings.reviews = (db.settings.reviews || []).filter(r => r.id !== id);
    saveDB(db);
  },
  avgRating() {
    const reviews = this.list();
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
  },
};

/* =========================================================
   FavoritesAPI  —  المفضلة في localStorage (لكل جهاز)
========================================================= */
const FAVS_KEY = "abaya_amal_favs_v1";
const FavoritesAPI = {
  list() {
    try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]"); }
    catch { return []; }
  },
  has(id) { return this.list().includes(id); },
  add(id) {
    const list = this.list();
    if (!list.includes(id)) list.push(id);
    localStorage.setItem(FAVS_KEY, JSON.stringify(list));
  },
  remove(id) {
    const list = this.list().filter(x => x !== id);
    localStorage.setItem(FAVS_KEY, JSON.stringify(list));
  },
  toggle(id) {
    if (this.has(id)) { this.remove(id); return false; }
    this.add(id); return true;
  },
  count() { return this.list().length; },
};

/* =========================================================
   SiteInfoAPI  —  معلومات الموقع (من نحن / الشحن / الإرجاع)
========================================================= */
const SiteInfoAPI = {
  get() { return SettingsAPI.get().siteInfo || defaultSiteInfo(); },
  update(patch) {
    const db = loadDB();
    db.settings.siteInfo = { ...db.settings.siteInfo, ...patch };
    saveDB(db);
    return db.settings.siteInfo;
  },
};

/* =========================================================
   SizeChartsAPI
========================================================= */
const SizeChartsAPI = {
  get() {
    /* استخدم window.SettingsAPI ليلتقط تجاوز Supabase إن وُجد */
    const settings = (window.SettingsAPI || SettingsAPI).get();
    const charts = settings.sizeCharts || settings.size_charts;
    /* تحقق من النسخة الجديدة: يجب أن يحتوي gulf على عمود sleeve */
    if (charts && Array.isArray(charts.gulf) && charts.gulf.length > 0
        && charts.gulf.every(r => r.sleeve !== undefined)) {
      return charts;
    }
    return defaultSizeCharts();
  },
  save(patch) {
    const db = loadDB();
    db.settings.sizeCharts = { ...db.settings.sizeCharts, ...patch };
    saveDB(db);
    return db.settings.sizeCharts;
  },
};

/* =========================================================
   CitiesAPI  —  مدن التوصيل قابلة للتحرير
========================================================= */
var CitiesAPI = {
  list() { return SettingsAPI.get().cities || []; },
  active() { return this.list().filter(c => c.active !== false); },
  save(city) {
    const db = loadDB();
    db.settings.cities = db.settings.cities || [];
    if (city.id && db.settings.cities.find(c => c.id === city.id)) {
      const idx = db.settings.cities.findIndex(c => c.id === city.id);
      db.settings.cities[idx] = { ...db.settings.cities[idx], ...city };
    } else {
      if (!city.id) {
        city.id = (city.name_en || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid();
      }
      if (city.active === undefined) city.active = true;
      if (city.fee === undefined) city.fee = 0;
      db.settings.cities.push(city);
    }
    saveDB(db);
    return city;
  },
  remove(id) {
    const db = loadDB();
    db.settings.cities = (db.settings.cities || []).filter(c => c.id !== id);
    saveDB(db);
  },
};

/* =========================================================
   CategoriesAPI  —  تصنيفات قابلة للتحرير من الإعدادات
========================================================= */
var CategoriesAPI = {
  list() { return SettingsAPI.get().categories || []; },
  /* قائمة التصنيفات النشطة + "الكل" مُضافة في البداية */
  active() {
    const list = this.list().filter(c => c.active !== false);
    return [{ id: "all" }, ...list.map(c => ({ id: c.id }))];
  },
  save(cat) {
    const db = loadDB();
    db.settings.categories = db.settings.categories || [];
    if (cat.id && db.settings.categories.find(c => c.id === cat.id)) {
      const idx = db.settings.categories.findIndex(c => c.id === cat.id);
      db.settings.categories[idx] = { ...db.settings.categories[idx], ...cat };
    } else {
      /* id جديد: نولّده من name_en أو من uid */
      if (!cat.id) {
        cat.id = (cat.name_en || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid();
      }
      if (cat.active === undefined) cat.active = true;
      db.settings.categories.push(cat);
    }
    saveDB(db);
    return cat;
  },
  remove(id) {
    const db = loadDB();
    db.settings.categories = (db.settings.categories || []).filter(c => c.id !== id);
    saveDB(db);
  },
};

function getActiveCategories() { return CategoriesAPI.active(); }

/* =========================================================
   TextOverridesAPI  —  تخصيص نصوص الواجهة
========================================================= */
const TextOverridesAPI = {
  all() { return SettingsAPI.get().textOverrides || { ar: {}, en: {} }; },
  get(lang, key) {
    const o = this.all();
    return o?.[lang]?.[key] || "";
  },
  set(lang, key, value) {
    const db = loadDB();
    db.settings.textOverrides = db.settings.textOverrides || { ar: {}, en: {} };
    if (!db.settings.textOverrides[lang]) db.settings.textOverrides[lang] = {};
    if (value && String(value).trim()) {
      db.settings.textOverrides[lang][key] = String(value);
    } else {
      delete db.settings.textOverrides[lang][key];
    }
    saveDB(db);
  },
  reset(key) {
    const db = loadDB();
    if (db.settings.textOverrides?.ar) delete db.settings.textOverrides.ar[key];
    if (db.settings.textOverrides?.en) delete db.settings.textOverrides.en[key];
    saveDB(db);
  },
  editableKeys() { return EDITABLE_TEXTS; },
};

/* =========================================================
   CouponsAPI  —  أكواد الخصم
========================================================= */
var CouponsAPI = {
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
   AuthAPI  —  دخول الأدمن (مع خيار "تذكرني")
========================================================= */
const AuthAPI = {
  isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === "yes"
        || localStorage.getItem(AUTH_REMEMBER_KEY) === "yes";
  },
  login(username, password, remember) {
    const a = loadDB().settings.admin;
    if (username === a.username && password === a.password) {
      if (remember) {
        localStorage.setItem(AUTH_REMEMBER_KEY, "yes");
        sessionStorage.removeItem(AUTH_KEY);
      } else {
        sessionStorage.setItem(AUTH_KEY, "yes");
        localStorage.removeItem(AUTH_REMEMBER_KEY);
      }
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_REMEMBER_KEY);
  },
  changePassword(currentPwd, newPwd) {
    const db = loadDB();
    if (db.settings.admin.password !== currentPwd) return false;
    db.settings.admin.password = newPwd;
    saveDB(db);
    return true;
  },
};

/* =========================================================
   CustomersAPI  —  حسابات الزبائن
========================================================= */
const CustomersAPI = {
  list() { return loadDB().settings.customers || []; },

  findByPhone(phone) {
    const p = String(phone || "").replace(/\D/g, "");
    if (!p) return null;
    return this.list().find(c => String(c.phone || "").replace(/\D/g, "") === p);
  },

  register({ name, phone, password, area, cityId }) {
    if (!name || !phone || !password) return { ok: false, reason: "missing_fields" };
    if (String(password).length < 4) return { ok: false, reason: "weak_password" };
    if (this.findByPhone(phone)) return { ok: false, reason: "phone_exists" };
    const db = loadDB();
    db.settings.customers = db.settings.customers || [];
    const customer = {
      id: uid(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      password: String(password),
      area: area || "",
      cityId: cityId || "",
      createdAt: new Date().toISOString(),
    };
    db.settings.customers.push(customer);
    saveDB(db);
    /* سجّل دخول تلقائياً بعد التسجيل */
    localStorage.setItem(CUST_KEY, customer.id);
    return { ok: true, customer };
  },

  login(phone, password) {
    const c = this.findByPhone(phone);
    if (!c) return { ok: false, reason: "not_found" };
    if (c.password !== String(password)) return { ok: false, reason: "wrong_password" };
    localStorage.setItem(CUST_KEY, c.id);
    return { ok: true, customer: c };
  },

  logout() { localStorage.removeItem(CUST_KEY); },

  current() {
    const id = localStorage.getItem(CUST_KEY);
    if (!id) return null;
    return this.list().find(c => c.id === id) || null;
  },

  updateProfile(patch) {
    const id = localStorage.getItem(CUST_KEY);
    if (!id) return null;
    const db = loadDB();
    const c = (db.settings.customers || []).find(x => x.id === id);
    if (!c) return null;
    Object.assign(c, patch);
    saveDB(db);
    return c;
  },
};

/* =========================================================
   Utils
========================================================= */
const Utils = {
  cityById(id) {
    /* جرّب من CitiesAPI أولاً (يدعم Supabase override)، ثم Settings، ثم Legacy */
    let cities = [];
    if (window.CitiesAPI?.list) {
      try { cities = window.CitiesAPI.list() || []; } catch (e) {}
    }
    if (!cities.length) cities = (window.SettingsAPI || SettingsAPI).get().cities || [];
    const c = cities.find(x => x.id === id);
    if (!c) {
      const legacy = GAZA_CITIES.find(x => x.id === id);
      if (!legacy) return null;
      return { ...legacy, name: t("city." + id) };
    }
    const lang = getLang();
    return {
      id: c.id, fee: Number(c.fee || 0), active: c.active !== false,
      name: (lang === "en" && c.name_en) ? c.name_en : c.name_ar,
    };
  },
  categoryById(id) {
    if (id === "all") return { id: "all", name: t("category.all") };
    /* جرّب أولاً من CategoriesAPI (يدعم Supabase override)، ثم من Settings */
    let cats = [];
    if (window.CategoriesAPI?.list) {
      try { cats = window.CategoriesAPI.list() || []; } catch (e) {}
    }
    if (!cats.length) cats = (window.SettingsAPI || SettingsAPI).get().categories || [];
    const c = cats.find(x => x.id === id);
    if (!c) return { id, name: id };
    const lang = getLang();
    return { id: c.id, name: (lang === "en" && c.name_en) ? c.name_en : c.name_ar };
  },
  statusInfo(id) {
    const s = ORDER_STATUSES.find(x => x.id === id);
    if (!s) return { label: id, color: "muted" };
    return { ...s, label: t("status." + id) };
  },
  fmt(n) {
    const lang = getLang();
    const locale = lang === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(locale).format(n) + " ₪";
  },
  formatDate(iso) {
    const lang = getLang();
    const locale = lang === "ar" ? "ar-EG" : "en-US";
    return new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  },

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
  ProductsAPI, OrdersAPI, SettingsAPI, CouponsAPI,
  CategoriesAPI, CitiesAPI, TextOverridesAPI,
  FabricsAPI, CutsAPI, ReviewsAPI, FavoritesAPI,
  SiteInfoAPI, SizeChartsAPI,
  AuthAPI, CustomersAPI, Utils,
  GAZA_CITIES, CATEGORIES, ORDER_STATUSES,
  LOW_STOCK_THRESHOLD, DEFAULT_SIZES, DEFAULT_COLORS,
  DEFAULT_FABRICS, DEFAULT_CUTS,
  t, getLang, setLang, applyTranslations, I18N,
  getActiveCategories, EDITABLE_TEXTS,
});

/* تطبيق اللغة عند تحميل الصفحة */
setLang(getLang());
