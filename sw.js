const CACHE_NAME = 'brin-parking-cache-v2';

const urlsToCache = [
  '/',
  '/forgotpassword.html',
  '/index.html',
  '/register.html',
  '/dashboard.html',
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

// Install event: Menyimpan aset ke cache baru dan langsung aktifkan
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event: Menghapus cache lama versi v1 yang bermasalah
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-First untuk halaman HTML agar selalu memuat file terbaru
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http') && !event.request.url.startsWith('https')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Jika yang diminta adalah file HTML, gunakan strategi Network-First (Cari ke server dulu)
  if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Jika offline, ambil dari cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Untuk aset selain HTML (gambar, css, js), gunakan Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
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