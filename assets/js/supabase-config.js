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
  /* مشروع: keuecilonmucsgwxuamc.supabase.co */
  SUPABASE_URL: "https://keuecilonmucsgwxuamc.supabase.co",

  /* anon public key  —  آمن للنشر (محمي بـ RLS) */
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldWVjaWxvbm11Y3Nnd3h1YW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjI5ODMsImV4cCI6MjA5NDg5ODk4M30.H_N7jLdfIffCLrv5QiabolAMuNlr_N_nLCGZrr-PWDo",

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
