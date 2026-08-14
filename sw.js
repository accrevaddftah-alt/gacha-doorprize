const CACHE_NAME = 'gacha-doorprize-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// Menginstal Service Worker dan menyimpan file ke cache (memori lokal)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Menggunakan file dari cache jika sedang offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di memori offline, gunakan itu. Jika tidak, ambil dari internet.
        return response || fetch(event.request);
      })
  );
});