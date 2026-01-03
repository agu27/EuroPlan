const CACHE_NAME = 'europlan-v1';
// En producción, los archivos .tsx no existen, Vite los empaqueta en .js
// Dejamos solo lo esencial que sabemos que existirá
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Network first con fallback a cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});