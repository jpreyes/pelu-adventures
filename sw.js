/* ============================================================
   PELU ADVENTURES — Service Worker (para jugar sin internet)
   Guarda el juego en el iPad/celular tras la primera carga.
   Sube el número de versión cuando cambies archivos para que
   se actualice el caché.
   ============================================================ */
const VERSION = "pelu-v18";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/lib/phaser.min.js",
  "./js/data.js",
  "./js/pelu-sprite.js",
  "./js/game.js",
  "./js/aventuras.js",
  "./js/platformer.js",
  "./js/race.js",
  "./js/cooking.js",
  "./js/fishing.js",
  "./js/swim.js",
  "./js/escape.js",
  "./js/historia.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
