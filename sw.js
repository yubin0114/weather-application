const CACHE_NAME = "weather-app-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./CSS/style.css",
  "./javascript/script.js",
  "./manifest.json"
];

// 서비스 워커 설치 및 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 네트워크 요청 제어
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});