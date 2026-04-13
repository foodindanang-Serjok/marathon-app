var CACHE = "marathon-v2";
var FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon.png",
  "./logo.png",
  "./icon-512.png",
  "./meditation.m4a"
];

// Установка — кэшируем все файлы
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// Активация — удаляем старый кэш
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Запросы — сначала кэш, потом сеть
self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, copy);
        });
        return response;
      });
    }).catch(function() {
      return caches.match("./index.html");
    })
  );
});
