const CACHE_NAME = 'home-warehouse-v5';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png'
];

// ========== 安裝：快取核心資源 ==========
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ========== 啟動：清理舊快取並接管所有頁面 ==========
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ========== 攔截請求：Network-First 策略 ==========
// 核心修復：對頁面和核心資源先從網路取，失敗才用快取
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理同源請求
  if (url.origin !== self.location.origin) {
    return;
  }

  // 對導航請求（頁面本身）使用 Network-First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 對 JS/CSS 使用 Network-First（確保總是拿到最新版）
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 對圖片等其他資源使用 Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Network-First：先嘗試網路，失敗才用快取
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // 如果連快取都沒有，返回離線頁面
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    throw error;
  }
}

// Stale-While-Revalidate：立即返回快取，同時在背景更新快取
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // 背景更新快取
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  // 如果有快取，先返回快取；否則等待網路
  return cachedResponse || fetchPromise;
}
