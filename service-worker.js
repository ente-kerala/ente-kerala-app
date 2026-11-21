const CACHE_NAME = "ente-kerala-v3";

const APP_FILES = [
  "/ente-kerala-app/",
  "/ente-kerala-app/index.html",
  "/ente-kerala-app/style.css",
  "/ente-kerala-app/manifest.json",
  "/ente-kerala-app/icon-192.png",
  "/ente-kerala-app/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("ente-kerala-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
