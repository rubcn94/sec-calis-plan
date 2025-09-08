// sw.js — caché offline simple
const CACHE_NAME = 'sec-calis-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
  // Si luego separas CSS/JS/imagenes, añádelas aquí
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

// Estrategia cache-first con fallback a red
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        // Cachea GET navegaciones y archivos estáticos
        if (req.method === 'GET' && (req.mode === 'navigate' || req.url.startsWith(self.location.origin))) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
