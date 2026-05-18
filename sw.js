/* =========================================================
   Service Worker  —  عبايات أمل
   استراتيجية: Cache-first مع fallback إلى الشبكة
========================================================= */

const CACHE_NAME = "amal-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./admin-manifest.json",
  "./assets/css/customer.css",
  "./assets/css/admin.css",
  "./assets/js/data.js",
  "./assets/js/customer.js",
  "./assets/js/admin.js",
  "./assets/img/logo.svg",
  "./assets/img/icon-512.svg",
  "./assets/img/og-image.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS).catch(() => null)   /* لا تفشل إذا فشل أصل واحد */
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  /* تجاهل خطابات google fonts وغيرها  —  دعها تذهب عبر الشبكة مباشرة */
  if (!req.url.startsWith(self.location.origin)) return;

  /* استراتيجية: network-first للملفات النصية (HTML/JS/CSS) لضمان آخر تحديث،
     وcache-first للصور لتسريع التحميل */
  const isAsset = /\.(svg|png|jpg|jpeg|webp|ico)$/i.test(req.url);

  if (isAsset) {
    /* cache-first للصور */
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => cached))
    );
  } else {
    /* network-first لـ HTML/JS/CSS */
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
