
const CACHE_NAME = 'europlan-v1';
const ASSETS = [
  './index.html',
  './index.tsx',
  './App.tsx',
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
  // Estrategia: Network first, fallback to cache para asegurar que Gemini funcione
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
