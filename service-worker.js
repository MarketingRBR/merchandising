const CACHE_NAME = 'rbr-agenda-v5-julho';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo_rbr.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Deletando cache antigo:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Sempre busca da rede primeiro, usa cache só se falhar
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
        return networkResponse;
      }
      const responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
      return networkResponse;
    }).catch(() => caches.match(event.request))
  );
});
