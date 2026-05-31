// ChemVibe Virtual Chemistry Lab - Progressive Web App Service Worker
const CACHE_NAME = 'chemvibe-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// On install, pre-cache the absolute core static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// On activation, clean up old legacy caches to release phone storage
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache storage:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept match fetch requests with an intelligent Network-First falling back to Cache strategy
// This guarantees instant responsiveness while keeping lab metrics up-to-date
self.addEventListener('fetch', (event) => {
  // Only handle standard local GET requests to prevent CORS interception or state post issues
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude third party API calls like Firebase or Gemini to avoid offline request locking
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If sound or code updates succeed, clone and cache the updated file on-the-fly
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache store when offline
        console.log('[Service Worker] Network request failed. Serving offline resource from Cache.');
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If accessing secondary subpages or files offline, fallback to index.html to allow SPA routing
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
