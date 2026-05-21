/* =========================================================
   إعدادات Supabase  —  املئي القيم بعد إنشاء المشروع
   ---------------------------------------------------------
   كيف تحصلين على المفاتيح:
   1. اذهبي إلى https://supabase.com/dashboard
   2. اختاري مشروعك → Settings (⚙️) → API
   3. انسخي:
      - "Project URL" → ضعيها في SUPABASE_URL
      - "anon / public key" → ضعيها في SUPABASE_ANON_KEY
   ---------------------------------------------------------
   إذا تركتِ هذه القيم فارغة، سيستمر التطبيق باستخدام
   localStorage (الوضع الحالي). بمجرد ملئها يبدأ تلقائياً
   باستخدام Supabase.
========================================================= */

window.AMAL_CONFIG = {
  /* ضعي URL مشروع Supabase هنا (مثل: https://xxxxx.supabase.co) */
  SUPABASE_URL: "",

  /* ضعي anon/public key هنا (يبدأ بـ "eyJh...") */
  SUPABASE_ANON_KEY: "",

  /* مسارات Storage buckets */
  BUCKET_PRODUCTS: "product-images",
  BUCKET_PROOFS:   "payment-proofs",
  BUCKET_HERO:     "hero-bg",
};

/* هذه الدالة تتأكد إن كان Supabase مُهيَّأ */
window.isSupabaseConfigured = function () {
  const c = window.AMAL_CONFIG;
  return !!(c && c.SUPABASE_URL && c.SUPABASE_ANON_KEY);
};
