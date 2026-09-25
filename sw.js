/* ============================================================
   PELU ADVENTURES — Service Worker (para jugar sin internet)
   Guarda el juego en el iPad/celular tras la primera carga.
   Sube el número de versión cuando cambies archivos para que
   se actualice el caché.
   ============================================================ */
const VERSION = "pelu-v26";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/lib/phaser.min.js",
  "./js/data.js",
  "./js/pelu-sprite.js",
  "./js/arte.js",
  "./js/arte-extra.js",
  "./js/pueblo.js",
  "./js/casa.js",
  "./js/game.js",
  "./js/ingles-vocab1.js",
  "./js/ingles-vocab2.js",
  "./js/ingles-frases.js",
  "./js/logica-contenido.js",
  "./js/retos.js",
  "./js/aventuras.js",
  "./js/platformer.js",
  "./js/race.js",
  "./js/cooking.js",
  "./js/fishing.js",
  "./js/swim.js",
  "./js/escape.js",
  "./js/historia.js",
  "./js/mundo.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  // cache:"reload" salta la caché HTTP del navegador: si no, una versión nueva
  // podía guardar copias viejas de los archivos y el iPad no veía los cambios.
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
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
      if (res.ok) {                               // no guardar errores (404/500)
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => {
      // Sin internet: solo las páginas caen a index.html (un .js no debe recibir HTML)
      if (e.request.mode === "navigate") return caches.match("./index.html");
      return Response.error();
    }))
  );
});
