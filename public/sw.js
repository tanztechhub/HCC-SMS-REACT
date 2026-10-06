// Cache only the public offline page. School records and API responses stay online.
const OFFLINE_CACHE = 'hcc-pwa-offline-v1';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) => cache.add('/pwa/offline.html')));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('hcc-pwa-offline-') && key !== OFFLINE_CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || url.origin !== self.location.origin || url.pathname.startsWith('/hcc-sms/')) return;
  event.respondWith(fetch(event.request).catch(async () => (await caches.match('/pwa/offline.html')) || Response.error()));
});
