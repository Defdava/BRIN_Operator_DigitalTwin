const CACHE_NAME = 'brin-parking-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/register.html',
  '/login.html',
  '/previous-analysis.html',
  '/exportdata.html',
  '/parkiranalysis.html',
  '/profile.html',
  '/helpdesk.html',
  '/manifest.json',
  '/assets/brin_logo.png',
  '/assets/user.JPG',
  '/assets/fotobrin1.jpg',
  '/assets/fotobrin2.jpg',
  '/assets/fotobrin3.jpg',
  '/assets/fotobrin4.jpg',
  '/assets/fotobrin.jpg',
  '/assets/wave.mp4',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Skip caching untuk chrome-extension, devtools, dll.
  if (!event.request.url.startsWith('http') && !event.request.url.startsWith('https')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone request karena fetch hanya bisa dipakai sekali
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          networkResponse => {
            // Check apakah response valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone response untuk cache
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});