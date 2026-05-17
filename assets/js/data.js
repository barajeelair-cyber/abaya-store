/* =========================================================
   عبايات أمل  —  طبقة البيانات المشتركة
   ---------------------------------------------------------
   تستخدم localStorage كقاعدة بيانات مؤقتة.
   عند الانتقال إلى Backend حقيقي، استبدلي محتوى الدوال
   فقط (مثل ProductsAPI.list) باستدعاء fetch.
   ========================================================= */

const DB_KEY = "abaya_amal_v2";
const AUTH_KEY = "abaya_amal_admin_session";
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

    /* Categories */
    "category.all": "الكل",
    "category.everyday": "عبايات عملية",
    "category.occasions": "عبايات مناسبات",
    "category.black": "عبايات سوداء",
    "category.open": "عبايات مفتوحة",

    /* Product card */
    "product.view": "عرض",
    "product.unavailable": "غير متوفر",
    "product.limited": "قطع محدودة",
    "product.out_of_stock": "نفد المخزون",
    "product.discount_label": "خصم",

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
    "checkout.upload_hint_2": "PNG / JPG  —  حتى 3 ميجا",
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
    "checkout.copy": "نسخ",
    "checkout.copied": "تم النسخ",
    "checkout.select_city": "اختاري المدينة",
    "checkout.upload_first": "ارفعي صورة التحويل أولاً",
    "checkout.image_too_big": "حجم الصورة كبير (3 ميجا حد أقصى)",
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
    "admin.product.image_too_big": "حجم الصورة كبير (الحد 3 ميجا)",

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

    /* Categories */
    "category.all": "All",
    "category.everyday": "Everyday Abayas",
    "category.occasions": "Occasion Abayas",
    "category.black": "Black Abayas",
    "category.open": "Open Abayas",

    /* Product card */
    "product.view": "View",
    "product.unavailable": "Unavailable",
    "product.limited": "Limited stock",
    "product.out_of_stock": "Out of stock",
    "product.discount_label": "OFF",

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
    "checkout.upload_hint_2": "PNG / JPG — up to 3 MB",
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
    "checkout.copy": "Copy",
    "checkout.copied": "Copied",
    "checkout.select_city": "Please select a city",
    "checkout.upload_first": "Please upload the transfer receipt first",
    "checkout.image_too_big": "Image too large (3 MB max)",
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
    "admin.product.image_too_big": "Image too large (3 MB max)",

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
      if (!db.settings.textOverrides) db.settings.textOverrides = { ar: {}, en: {} };
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
  return [
    { id: "everyday",  name_ar: "عبايات عملية",   name_en: "Everyday Abayas",  active: true },
    { id: "occasions", name_ar: "عبايات مناسبات", name_en: "Occasion Abayas",  active: true },
    { id: "black",     name_ar: "عبايات سوداء",   name_en: "Black Abayas",     active: true },
    { id: "open",      name_ar: "عبايات مفتوحة",  name_en: "Open Abayas",      active: true },
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
        instagram: "amal.abaya",
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
      categories: defaultCategories(),
      textOverrides: { ar: {}, en: {} },
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
   CategoriesAPI  —  تصنيفات قابلة للتحرير من الإعدادات
========================================================= */
const CategoriesAPI = {
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
  cityById(id) {
    const c = GAZA_CITIES.find(x => x.id === id);
    if (!c) return null;
    return { ...c, name: t("city." + id) };
  },
  categoryById(id) {
    if (id === "all") return { id: "all", name: t("category.all") };
    const cats = SettingsAPI.get().categories || [];
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
  CategoriesAPI, TextOverridesAPI, AuthAPI, Utils,
  GAZA_CITIES, CATEGORIES, ORDER_STATUSES,
  LOW_STOCK_THRESHOLD, DEFAULT_SIZES, DEFAULT_COLORS,
  t, getLang, setLang, applyTranslations, I18N,
  getActiveCategories, EDITABLE_TEXTS,
});

/* تطبيق اللغة عند تحميل الصفحة */
setLang(getLang());
