const CACHE_NAME = '1rm-calculator-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// Installazione Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperto');
        return cache.addAll(urlsToCache);
      })
  );
  // Prendi immediatamente il controllo per aggiornare le risorse
  self.skipWaiting();
});

// Attivazione Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Rimozione vecchia cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Reclama i client subito per applicare l'update
  self.clients.claim();
});

// Intercettazione richieste
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first per CSS e JS per garantire aggiornamenti
  if (url.pathname.endsWith('/style.css') || url.pathname.endsWith('/script.js')) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch (err) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Cache-first per il resto
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});