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

self.addEventListener("push", function (event) {
  if (!event.data) return;
  const datos = event.data.json();
  event.waitUntil(
    self.registration.showNotification(datos.titulo || "La Bankera RD", {
      body: datos.cuerpo || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: datos.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (listaClientes) {
      for (const cliente of listaClientes) {
        if (cliente.url.includes(self.location.origin) && "focus" in cliente) {
          cliente.navigate(url);
          return cliente.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
