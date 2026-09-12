// Service worker minimo: solo sirve para que el sitio se pueda "instalar" como
// app, y para mostrar un aviso si alguien lo abre sin internet. No guarda los
// resultados en cache, porque cambian seguido y mostrar un numero viejo por
// error seria peor que no mostrar nada.
const CACHE_NAME = "la-bankera-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(OFFLINE_URL);
    })
  );
});
