/* ============================================================
   PELU — Sprite de la gatita blanca (vectorial / SVG)
   Una sola fuente de verdad para "como se ve Pelu".
   Se usa en el menu (HTML, inline) y como textura en los
   juegos Phaser (via load.svg). El resto del juego es pixel art;
   Pelu se mantiene con este look suave a pedido.
   ============================================================ */

const PeluSprite = {
  // Devuelve el SVG de la carita/cuerpo de la gatita blanca.
  // expresion: "feliz" | "sorpresa" | "guino"
  svg(expresion = "feliz") {
    const ojoIzq = expresion === "guino"
      ? `<path d="M70 98 q8 -8 16 0" stroke="#4a3a4a" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="78" cy="98" rx="11" ry="${expresion === "sorpresa" ? 16 : 13}" fill="#4a3a4a"/>
         <circle cx="82" cy="93" r="4" fill="#fff"/>`;
    return `
<svg viewBox="0 0 200 215" xmlns="http://www.w3.org/2000/svg">
  <!-- cola -->
  <path d="M150 175 q45 -5 35 -45 q-3 -12 -14 -8 q10 5 6 22 q-6 22 -33 18 z" fill="#fbf7fb" stroke="#e7dfe9" stroke-width="2"/>
  <!-- cuerpo -->
  <ellipse cx="100" cy="168" rx="52" ry="40" fill="#fdfbfd" stroke="#e7dfe9" stroke-width="2.5"/>
  <!-- patitas -->
  <ellipse cx="80" cy="200" rx="16" ry="11" fill="#fdfbfd" stroke="#e7dfe9" stroke-width="2"/>
  <ellipse cx="120" cy="200" rx="16" ry="11" fill="#fdfbfd" stroke="#e7dfe9" stroke-width="2"/>
  <!-- orejas -->
  <path d="M52 70 L40 14 L92 52 Z" fill="#fdfbfd" stroke="#e7dfe9" stroke-width="2.5"/>
  <path d="M148 70 L160 14 L108 52 Z" fill="#fdfbfd" stroke="#e7dfe9" stroke-width="2.5"/>
  <path d="M55 58 L49 28 L80 50 Z" fill="#ffd1e8"/>
  <path d="M145 58 L151 28 L120 50 Z" fill="#ffd1e8"/>
  <!-- cabeza -->
  <circle cx="100" cy="98" r="58" fill="#fdfbfd" stroke="#e7dfe9" stroke-width="2.5"/>
  <!-- mejillas -->
  <ellipse cx="64" cy="115" rx="12" ry="8" fill="#ffd1e8" opacity="0.8"/>
  <ellipse cx="136" cy="115" rx="12" ry="8" fill="#ffd1e8" opacity="0.8"/>
  <!-- ojos -->
  ${ojoIzq}
  <ellipse cx="122" cy="98" rx="11" ry="${expresion === "sorpresa" ? 16 : 13}" fill="#4a3a4a"/>
  <circle cx="126" cy="93" r="4" fill="#fff"/>
  <!-- nariz -->
  <path d="M100 112 l8 6 q-8 7 -16 0 z" fill="#ff9ec4"/>
  <!-- boca -->
  <path d="M100 120 q-9 9 -18 2 M100 120 q9 9 18 2" stroke="#caa9bd" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- bigotes -->
  <g stroke="#e7dfe9" stroke-width="2.5" stroke-linecap="round">
    <path d="M44 104 H20 M46 114 H22 M156 104 H180 M154 114 H178"/>
  </g>
</svg>`;
  },

  // URI de datos del SVG (para <img> o Phaser load.svg).
  dataURI() {
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(this.svg("feliz"))));
  },

  // Carga la textura "pelu" en una escena Phaser (usar en preload()).
  cargar(scene, key = "pelu") {
    scene.load.svg(key, this.dataURI(), { width: 150, height: 161 });
  },
};

if (typeof window !== "undefined") window.PeluSprite = PeluSprite;
