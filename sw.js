const CACHE_NAME = 'flowtime-pro-cache-v1';
// All assets required for the app shell to work offline.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Roboto+Mono:wght@100..700&display=swap',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll, but be aware it fails if any single request fails.
        // For production, you might want to cache requests individually.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return from cache if found
        const fetchPromise = fetch(event.request).then(networkResponse => {
            // Check if we received a valid response to cache
            if (networkResponse && networkResponse.status === 200) {
              // Don't cache chrome-extension:// requests
                 if (!event.request.url.startsWith('chrome-extension://')) {
                    cache.put(event.request, networkResponse.clone());
                 }
            }
            return networkResponse;
        });

        // Return from cache, or wait for network
        return response || fetchPromise;

      });
    })
  );
});
