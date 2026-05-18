/* =========================================================
   Service Worker  —  عبايات أمل
   ---------------------------------------------------------
   استراتيجية: passthrough (لا يخزّن أي شيء)
   - يكفي وجوده لجعل التطبيق قابلاً للتثبيت كـ PWA
   - لا يعترض الـ fetches → المتصفح يجلب كل ملف من الشبكة
   - يحذف كل الكاش القديم عند التفعيل
   - يبلّغ الصفحات المفتوحة لتعيد التحميل بعد التحديث
========================================================= */

const VERSION = "amal-v7-passthrough";

self.addEventListener("install", (event) => {
  /* نشّط النسخة الجديدة فوراً دون انتظار */
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    /* احذف كل الكاش القديم  —  لا نحتاجه */
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));

    /* سيطر على كل العملاء (التبويبات) المفتوحين */
    await self.clients.claim();

    /* بلّغ كل التبويبات لتعيد التحميل بنسخة جديدة */
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(c => c.postMessage({ type: "sw-updated" }));
  })());
});

/* لا fetch listener  —  دع المتصفح يتولى الجلب بنفسه.
   هذا يجنّبنا أي ملفات قديمة محفوظة في الكاش. */
