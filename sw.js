// sw.js - Service Worker dengan filter aman untuk chrome-extension dan non-GET

const CACHE_NAME = 'brin-parking-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/profile.html',
  // Tambahkan aset statis lain jika ada (css, js, gambar, dll)
  // '/assets/user.JPG',
  // '/manifest.json',
  // '/icons/icon-192.png',
];

// Install event - cache aset statis saat SW pertama kali diinstall
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache install failed:', err))
  );
  // Skip waiting agar SW langsung aktif tanpa perlu refresh manual
  self.skipWaiting();
});

// Activate event - bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Klaim semua client agar SW langsung mengontrol halaman
  self.clients.claim();
});

// Fetch event - strategi cache-first + filter aman
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // SKIP caching jika:
  // 1. Bukan protokol http/https (chrome-extension, data:, chrome-search:, dll)
  // 2. Method bukan GET (Supabase auth pakai POST → jangan dicache)
  if (
    !url.startsWith('http://') && 
    !url.startsWith('https://') ||
    event.request.method !== 'GET'
  ) {
    // Langsung fetch tanpa cache
    event.respondWith(fetch(event.request).catch(() => {
      // Jika offline dan request gagal, return fallback kosong atau error handling
      return new Response('Offline', { status: 503 });
    }));
    return;
  }

  // Untuk request GET http/https normal → cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Kembalikan dari cache jika ada
        if (cachedResponse) {
          return cachedResponse;
        }

        // Jika tidak ada di cache → fetch dari network dan simpan ke cache
        return fetch(event.request).then(networkResponse => {
          // Cek apakah response valid sebelum dicache
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone response karena body hanya bisa dibaca sekali
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(err => console.error('Cache put failed:', err));

          return networkResponse;
        }).catch(() => {
          // Jika offline → return fallback (misal halaman offline)
          return caches.match('/index.html') || new Response('Offline', { status: 503 });
        });
      })
  );
});