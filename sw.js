var CACHE = "marathon-v10"; // ← при каждом обновлении менять цифру: v11, v12...
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

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// Команда от кнопки «Обновить»: включить новую версию сразу
self.addEventListener("message", function(e) {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(e) {
  // Отправку данных в Google Таблицу (POST) не трогаем — идёт напрямую в интернет
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, copy);
        }).catch(function() {});
        return response;
      });
    }).catch(function() {
      return caches.match("./index.html");
    })
  );
});
