/* ============================================================
   PELU ADVENTURES — Motor de Pixel Art
   Convierte "mapas" de pixeles (filas de caracteres + paleta)
   en canvas/imagenes nitidas (nearest-neighbor). Se usa para
   Pelu, objetos, tiles y decoracion. Sin archivos externos.
   ============================================================ */

const Pixel = {
  // Pinta un mapa (array de strings) con una paleta {char:'#rgb'|null}
  // en un canvas de 1px por celda. Escalar se hace por CSS/Phaser.
  canvas(map, palette) {
    const h = map.length, w = map[0].length;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d");
    for (let y = 0; y < h; y++) {
      const row = map[y];
      for (let x = 0; x < w; x++) {
        const col = palette[row[x]];
        if (col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); }
      }
    }
    return cv;
  },

  dataURL(map, palette) { return this.canvas(map, palette).toDataURL(); },

  // Registra el canvas como textura de una escena Phaser (idempotente).
  toTexture(scene, key, map, palette) {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, this.canvas(map, palette));
    return key;
  },

  // Igual pero desde un canvas ya hecho (p. ej. PeluSprite.canvas()).
  canvasToTexture(scene, key, cv) {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, cv);
    return key;
  },
};

if (typeof window !== "undefined") window.Pixel = Pixel;
