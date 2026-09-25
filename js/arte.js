/* ============================================================
   PELU ADVENTURES — Arte (SVG en línea, sin imágenes)
   Una sola fuente del estilo visual "Avatar World":
   - Gatitas (Pelu y sus amigas) con paletas, expresiones y
     accesorios dibujados (la ropa del Vestidor).
   - Edificios del Pueblo e íconos de interfaz (trazo redondeado).
   - Retratos para la novela y texturas para el mundo Phaser.
   Muebles, mascotas, otros personajes, lugares y adornos se
   dibujan en arte-extra.js (A.MUEBLES, A.MASCOTAS, ...).
   Todo se genera como texto SVG: funciona sin internet.
   ============================================================ */

(function () {
  const A = window.Arte = window.Arte || {};
  const NS = 'xmlns="http://www.w3.org/2000/svg"';

  /* ---------- Paletas de las gatitas ---------- */
  A.PALETAS = {
    pelu:   { pelaje: "#fffdfd", linea: "#e3d6e8", oreja: "#ffc9e0", mejilla: "#ffc9e0", ojo: "#4a3a4a", pupila: "#4a3a4a", nariz: "#ff8fb8", boca: "#c9a2b8", bigote: "#e3d6e8" },
    luna:   { pelaje: "#3d3450", linea: "#2b2438", oreja: "#7d6a96", mejilla: "#6d5a86", ojo: "#ffd54a", pupila: "#2b2438", nariz: "#ff9ec4", boca: "#8c7aa3", bigote: "#6d5f80" },
    mia:    { pelaje: "#ffb45e", linea: "#e08a3a", oreja: "#ffd9b8", mejilla: "#ffcfb0", ojo: "#4a3a4a", pupila: "#4a3a4a", nariz: "#ff8fb8", boca: "#b0703a", bigote: "#e08a3a", accesorios: ["lazo_mia"] },
    nina:   { pelaje: "#e0d2bd", linea: "#b9a88f", oreja: "#f3d9c9", mejilla: "#f3c9c0", ojo: "#6aa8d8", pupila: "#2b3a4a", nariz: "#ff9ec4", boca: "#a08a70", bigote: "#b9a88f", accesorios: ["flor_nina"] },
    estela: { pelaje: "#d6cce6", linea: "#a99cc4", oreja: "#efdcf2", mejilla: "#f0cde0", ojo: "#4a3a4a", pupila: "#4a3a4a", nariz: "#ff9ec4", boca: "#9a86b0", bigote: "#a99cc4", accesorios: ["sombrero_estela", "gafas_media_luna"] },
    tigrin: { pelaje: "#ffa94d", linea: "#e07a2d", oreja: "#ffd3a8", mejilla: "#ffc49a", ojo: "#3b7a3b", pupila: "#1f3a1f", nariz: "#ff8fb8", boca: "#b0703a", bigote: "#e07a2d", rayas: "#e07a2d", accesorios: ["vincha"] },
  };

  /* ---------- Accesorios (en coordenadas de la gatita: 200×215) ----------
     formas: [d, relleno, trazo, grosor]. detras: se dibuja detrás del cuerpo.
     mini: viewBox para la miniatura en el Vestidor y la Tienda. */
  const c = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const estrella = (cx, cy, r) => {
    let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1); }
    return d + "Z";
  };
  A.ACC = {
    gorro_estrella: { mini: "20 -70 160 130", formas: [
      ["M34 56Q100 22 166 56Q100 76 34 56Z", "#6a45d4", "#4f2fb3", 3],
      ["M70 48L118 -62L132 44Z", "#8a63f0", "#6a45d4", 3],
      ["M72 40Q100 30 130 38L131 48Q100 40 72 50Z", "#ffc83d"],
      [estrella(112, -8, 9), "#ffc83d"], [estrella(98, 22, 5), "#fff3b0"]] },
    corona: { mini: "40 -20 120 80", formas: [
      ["M62 50L58 6L80 26L100 -8L120 26L142 6L138 50Z", "#ffc83d", "#e0a51c", 3],
      [c(100, 30, 6), "#ff6fae"], [c(76, 38, 4.5), "#4db3ff"], [c(124, 38, 4.5), "#3ccf8c"]] },
    gorro_lana: { mini: "30 -30 140 100", formas: [
      ["M44 60Q42 0 100 -4Q158 0 156 60Z", "#3ccf8c", "#22a86c", 3],
      ["M40 48H160V66H40Z", "#ffffff", "#e3d6e8", 3],
      ["M60 30v14M80 20v24M100 16v28M120 20v24M140 30v14", "none", "#22a86c", 3],
      [c(100, -10, 14), "#ffffff", "#e3d6e8", 3]] },
    flor_pelo: { mini: "110 -10 80 70", formas: [
      [c(150, 14, 11) + c(166, 26, 11) + c(160, 44, 11) + c(140, 44, 11) + c(134, 26, 11), "#ff8fb8", "#e0508f", 2],
      [c(150, 32, 8), "#ffc83d"]] },
    gafas_sol: { mini: "40 70 120 60", formas: [
      ["M56 88H96V100Q96 114 80 114H72Q56 114 56 100Z", "#46304f", "#2b2438", 3],
      ["M104 88H144V100Q144 114 128 114H120Q104 114 104 100Z", "#46304f", "#2b2438", 3],
      ["M96 92Q100 88 104 92", "none", "#2b2438", 4],
      ["M62 94l8 -3M110 94l8 -3", "none", "#ffffff", 3]] },
    gafas_corazon: { mini: "40 70 120 60", formas: [
      ["M78 118L58 96a11 11 0 0 1 20 -12a11 11 0 0 1 20 12Z", "rgba(255,111,174,.75)", "#e0508f", 4],
      ["M122 118L102 96a11 11 0 0 1 20 -12a11 11 0 0 1 20 12Z", "rgba(255,111,174,.75)", "#e0508f", 4],
      ["M97 96Q100 92 103 96", "none", "#e0508f", 4]] },
    lazo_rosa: { mini: "60 125 80 55", formas: [
      ["M100 150L74 136L74 166ZM100 150L126 136L126 166Z", "#ff6fae", "#e0508f", 3], [c(100, 150, 8), "#ff8fb8", "#e0508f", 3]] },
    bufanda: { mini: "40 125 120 90", formas: [
      ["M50 140Q100 166 150 140L152 158Q100 184 48 158Z", "#8a63f0", "#6a45d4", 3],
      ["M118 160L128 206L112 208L106 164Z", "#ff6fae", "#e0508f", 3],
      ["M60 150Q100 172 140 150", "none", "#ffc83d", 5]] },
    mochila: { detras: true, mini: "120 120 80 90", formas: [
      ["M140 136h40a8 8 0 0 1 8 8v48a8 8 0 0 1 -8 8h-40a8 8 0 0 1 -8 -8v-48a8 8 0 0 1 8 -8z", "#ff9a4d", "#e07a2d", 3],
      ["M142 166h36", "none", "#e07a2d", 3], [c(160, 182, 5), "#ffc83d"]] },
    alas: { detras: true, mini: "-10 100 220 110", formas: [
      ["M60 150Q0 110 8 160Q14 196 60 170Z", "rgba(180,220,255,.85)", "#4db3ff", 3],
      ["M140 150Q200 110 192 160Q186 196 140 170Z", "rgba(180,220,255,.85)", "#4db3ff", 3],
      ["M26 150Q40 156 52 160M174 150Q160 156 148 160", "none", "#ffffff", 3]] },
    // accesorios fijos de personajes (no están en la tienda)
    murcielago: { formas: [["M150 -4q10 -12 20 0q10 -12 20 0q-6 2 -10 10q-6 -6 -10 -2q-4 -4 -10 2q-4 -8 -10 -10z", "#46304f", "#2b2438", 2], [c(166, 0, 1.6) + c(174, 0, 1.6), "#ffd54a"]] },
    sombrero_estela: { formas: [
      ["M26 58Q100 20 174 58Q100 80 26 58Z", "#4f2fb3", "#3a2090", 3],
      ["M66 50L96 -66L136 46Z", "#6a45d4", "#4f2fb3", 3],
      ["M68 42Q100 30 134 38L135 48Q100 40 68 52Z", "#ff6fae"],
      ["M112 -10a9 9 0 1 0 8 -10a7 7 0 1 1 -8 10z", "#ffe89a"]] },
    gafas_media_luna: { formas: [["M62 104Q78 116 94 104M106 104Q122 116 138 104M94 104Q100 100 106 104", "none", "#a8740a", 3.5]] },
    lazo_mia: { formas: [["M146 40L128 28L130 50ZM146 40L164 30L160 52Z", "#3ccf8c", "#22a86c", 2.5], [c(146, 40, 5), "#9ae6c3", "#22a86c", 2]] },
    flor_nina: { formas: [[c(58, 34, 7) + c(68, 42, 7) + c(62, 54, 7) + c(50, 52, 7) + c(46, 40, 7), "#b89cff", "#8a63f0", 2], [c(57, 45, 5), "#ffc83d"]] },
    vincha: { formas: [["M46 62Q100 30 154 62", "none", "#ff6b7a", 9], ["M46 62Q100 30 154 62", "none", "#ffffff", 2]] },
  };
  // qué slot del Vestidor ocupa cada prenda de DATA.ropa
  A.SLOT_DE = { gorro_estrella: "sombrero", corona: "sombrero", gorro_lana: "sombrero", flor_pelo: "sombrero",
    gafas_sol: "gafas", gafas_corazon: "gafas", lazo_rosa: "collar", bufanda: "collar", mochila: "mochila", alas: "mochila" };

  A.formas = lista => lista.map(([d, f, s, w]) =>
    `<path d="${d}" fill="${f}"${s ? ` stroke="${s}" stroke-width="${w || 3}" stroke-linejoin="round" stroke-linecap="round"` : ""}/>`).join("");

  /* ---------- Gatita completa ----------
     opts: expresion ("feliz" | "sorpresa" | "guino" | "dormida"), accesorios [ids],
           ancho (px), clase. viewBox amplio para que quepan sombreros y alas. */
  A.VB_GATA = "-20 -70 240 300";
  A.gata = function (id = "pelu", o = {}) {
    const p = typeof id === "string" ? (A.PALETAS[id] || A.PALETAS.pelu) : id;
    const expr = o.expresion || "feliz";
    const ids = (o.accesorios || []).concat(o.sinPropios ? [] : (p.accesorios || []));
    const acc = ids.map(k => A.ACC[k]).filter(Boolean);
    const atras = A.formas([].concat(...acc.filter(a => a.detras).map(a => a.formas)));
    const frente = A.formas([].concat(...acc.filter(a => !a.detras).map(a => a.formas)));
    const L = `stroke="${p.linea}" stroke-width="3" stroke-linejoin="round"`;
    const ojoAbierto = (cx, alto) => `<ellipse cx="${cx}" cy="98" rx="11" ry="${alto}" fill="${p.ojo}"/>` +
      (p.ojo !== p.pupila ? `<ellipse cx="${cx + 1}" cy="100" rx="5" ry="${alto - 5}" fill="${p.pupila}"/>` : "") +
      `<circle cx="${cx + 4}" cy="93" r="4" fill="#fff"/>`;
    const ojoCerrado = cx => `<path d="M${cx - 10} 98q10 9 20 0" fill="none" stroke="${p.pupila}" stroke-width="4" stroke-linecap="round"/>`;
    const alto = expr === "sorpresa" ? 16 : 13;
    const ojos = expr === "dormida" ? ojoCerrado(78) + ojoCerrado(122)
      : expr === "guino" ? `<path d="M68 98q10 -9 20 0" fill="none" stroke="${p.pupila}" stroke-width="4" stroke-linecap="round"/>` + ojoAbierto(122, alto)
      : ojoAbierto(78, alto) + ojoAbierto(122, alto);
    const boca = expr === "sorpresa" ? `<ellipse cx="100" cy="126" rx="6" ry="7" fill="${p.boca}"/>`
      : `<path d="M100 120q-9 9 -18 2M100 120q9 9 18 2" fill="none" stroke="${p.boca}" stroke-width="3" stroke-linecap="round"/>`;
    const rayas = p.rayas ? `<path d="M86 44q14 10 28 0M80 58q20 10 40 0M70 150q10 8 0 18M130 150q-10 8 0 18" fill="none" stroke="${p.rayas}" stroke-width="5" stroke-linecap="round"/>` : "";
    return `<svg ${NS} viewBox="${A.VB_GATA}"${o.ancho ? ` width="${o.ancho}" height="${Math.round(o.ancho * 1.25)}"` : ""} class="${o.clase || "gata-svg"}" aria-hidden="true">` +
      `<ellipse cx="100" cy="212" rx="60" ry="8" fill="rgba(60,40,80,.14)"/>` + atras +
      `<path d="M150 175q45 -5 35 -45q-3 -12 -14 -8q10 5 6 22q-6 22 -33 18z" fill="${p.pelaje}" ${L}/>` +
      `<ellipse cx="100" cy="168" rx="52" ry="40" fill="${p.pelaje}" ${L}/>` +
      `<ellipse cx="80" cy="200" rx="16" ry="11" fill="${p.pelaje}" ${L}/><ellipse cx="120" cy="200" rx="16" ry="11" fill="${p.pelaje}" ${L}/>` +
      `<path d="M52 70L40 14L92 52ZM148 70L160 14L108 52Z" fill="${p.pelaje}" ${L}/>` +
      `<path d="M55 58L49 28L80 50ZM145 58L151 28L120 50Z" fill="${p.oreja}"/>` +
      `<circle cx="100" cy="98" r="58" fill="${p.pelaje}" ${L}/>` + rayas +
      `<ellipse cx="64" cy="115" rx="12" ry="8" fill="${p.mejilla}" opacity=".85"/><ellipse cx="136" cy="115" rx="12" ry="8" fill="${p.mejilla}" opacity=".85"/>` +
      ojos + `<path d="M100 112l8 6q-8 7 -16 0z" fill="${p.nariz}"/>` + boca +
      `<path d="M44 104H20M46 114H22M156 104H180M154 114H178" stroke="${p.bigote}" stroke-width="2.5" stroke-linecap="round"/>` +
      frente + `</svg>`;
  };

  // Cara sola (para el avatar de la barra y los perfiles)
  A.cara = function (id = "pelu", tam = 44) {
    const p = A.PALETAS[id] || A.PALETAS.pelu, L = `stroke="${p.linea}" stroke-width="3"`;
    return `<svg ${NS} viewBox="30 20 140 140" width="${tam}" height="${tam}" aria-hidden="true">` +
      `<path d="M52 70L40 14L92 52ZM148 70L160 14L108 52Z" fill="${p.pelaje}" ${L}/><path d="M55 58L49 28L80 50ZM145 58L151 28L120 50Z" fill="${p.oreja}"/>` +
      `<circle cx="100" cy="98" r="58" fill="${p.pelaje}" ${L}/><ellipse cx="78" cy="98" rx="11" ry="13" fill="${p.ojo}"/><ellipse cx="122" cy="98" rx="11" ry="13" fill="${p.ojo}"/>` +
      `<circle cx="82" cy="93" r="4" fill="#fff"/><circle cx="126" cy="93" r="4" fill="#fff"/><path d="M100 112l8 6q-8 7 -16 0z" fill="${p.nariz}"/>` +
      `<ellipse cx="64" cy="115" rx="12" ry="8" fill="${p.mejilla}"/><ellipse cx="136" cy="115" rx="12" ry="8" fill="${p.mejilla}"/></svg>`;
  };

  // Miniatura de una prenda (Vestidor, Tienda)
  A.prenda = function (id, tam = 64) {
    const a = A.ACC[id]; if (!a) return "";
    return `<svg ${NS} viewBox="${a.mini || "0 0 200 215"}" width="${tam}" height="${Math.round(tam * .76)}" aria-hidden="true">${A.formas(a.formas)}</svg>`;
  };

  // Envuelve un dibujo {vb, svg} de arte-extra.js
  A.dibujo = function (d, o = {}) {
    if (!d) return "";
    const [, , w, h] = d.vb.split(/\s+/).map(Number);
    const size = o.ancho ? ` width="${o.ancho}" height="${Math.round(o.ancho * h / w)}"` : (o.alto ? ` height="${o.alto}" width="${Math.round(o.alto * w / h)}"` : "");
    return `<svg ${NS} viewBox="${d.vb}"${size} class="${o.clase || ""}" aria-hidden="true">${d.svg}</svg>`;
  };
  A.mueble = (id, o) => A.dibujo((A.MUEBLES || {})[id], o);
  A.mascota = (id, o) => A.dibujo((A.MASCOTAS || {})[id], o);
  A.lugar = (id, o) => A.dibujo((A.LUGARES || {})[id], o);
  A.deco = (id, o) => A.dibujo((A.DECO || {})[id], o);

  /* ---------- Personajes: gatitas + los de arte-extra ---------- */
  A.EMOJI_A_PJ = { "🐈‍⬛": "luna", "🐱": "mia", "🐈": "nina", "🧙‍♀️": "estela", "🦉": "buho", "🐢": "tortu", "🪞": "espejo", "🐒": "chango", "🦎": "draco", "🐯": "tigrin" };
  A.NOMBRE_A_PJ = { "Luna": "luna", "Mia": "mia", "Nina": "nina", "Directora Estela": "estela", "Profe Búho": "buho", "Don Tortu": "tortu",
    "Espejo Susurrante": "espejo", "Chango": "chango", "Draco": "draco", "Rival Tigrín": "tigrin", "Tigrín": "tigrin" };
  A.clavePersonaje = (quien, emoji) => A.NOMBRE_A_PJ[quien] || A.EMOJI_A_PJ[emoji] || null;
  A.personaje = function (clave, o = {}) {
    if (A.PALETAS[clave]) return A.gata(clave, o);
    const d = (A.PERSONAJES_EXTRA || {})[clave];
    return d ? A.dibujo(d, o) : "";
  };

  // Texturas de personajes para el mundo caminable (Phaser)
  A.cargarPhaser = function (scene) {
    const claves = ["luna", "mia", "nina", "estela", "tigrin"].concat(Object.keys(A.PERSONAJES_EXTRA || {}));
    claves.forEach(k => {
      const svg = A.PALETAS[k] ? A.gata(k, { ancho: 150 }) : A.dibujo(A.PERSONAJES_EXTRA[k], { ancho: 150 });
      if (!svg) return;
      const m = svg.match(/width="(\d+)" height="(\d+)"/);
      scene.load.svg("pj_" + k, "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg))),
        { width: m ? +m[1] : 150, height: m ? +m[2] : 160 });
    });
  };

  /* ---------- Íconos de interfaz (trazo redondeado, 24×24) ---------- */
  const ICONOS = {
    casa: "M3 11l9-7 9 7v9h-6v-6H9v6H3z",
    album: "M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14M9 8h7M9 12h5",
    ajustes: "M4 7h9M17 7h3M4 17h3M11 17h9M17.5 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0M11.5 17a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0",
    mapa: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15",
    juegos: "M8 7h8a5.5 5.5 0 0 1 0 11H8A5.5 5.5 0 0 1 8 7zM7 10.5v4M5 12.5h4M16 11.5h.01M18 14h.01",
    ropa: "M8 3L3.5 6.5l2.5 4 2-1V21h8V9.5l2 1 2.5-4L16 3c-.8 1.6-2.2 2.5-4 2.5S8.8 4.6 8 3z",
    atras: "M15 5l-7 7 7 7",
    luna: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
    sol: "M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 1 1 9 0M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8",
    camara: "M4 8h3l2-3h6l2 3h3v11H4zM15.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 1 1 7 0",
    candado: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
    explorar: "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0M15.5 8.5l-2 5-5 2 2-5z",
    tienda: "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",
    mas: "M12 5v14M5 12h14",
    check: "M5 12l5 5 9-10",
    corazon: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
    historia: "M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z",
    cerrar: "M6 6l12 12M18 6L6 18",
    chispa: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
    mueble: "M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M3 12h18v5H3zM5 17v3M19 17v3",
    pata: "M8.5 7a1.8 2.2 0 1 1-.1 0zM15.5 7a1.8 2.2 0 1 1-.1 0zM5 11.5a1.6 2 0 1 1-.1 0zM19 11.5a1.6 2 0 1 1-.1 0zM12 12c-3 0-5 3-5 5.5 0 1.5 1.2 2.5 2.7 2.5.9 0 1.5-.5 2.3-.5s1.4.5 2.3.5c1.5 0 2.7-1 2.7-2.5C17 15 15 12 12 12z",
  };
  A.icono = (n, color = "currentColor", tam = 24, grosor = 2.2) =>
    `<svg ${NS} class="ico" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONOS[n] || ""}"/></svg>`;
  A.estrella = (tam = 24) =>
    `<svg ${NS} class="ico" width="${tam}" height="${tam}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffc83d" stroke="#e0a51c" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

  /* ---------- Edificios del Pueblo ---------- */
  const sw = n => `stroke-width="${n}"`;
  A.EDIFICIOS = {
    colegio: { vb: "0 0 232 236", svg:
      `<ellipse cx="116" cy="228" rx="104" ry="9" fill="rgba(60,40,80,.18)"/>` +
      `<rect x="44" y="96" width="144" height="130" rx="10" fill="#e9e0ff" stroke="#c8b6f5" ${sw(3)}/>` +
      `<rect x="14" y="70" width="52" height="156" rx="10" fill="#ded2fb" stroke="#c8b6f5" ${sw(3)}/><rect x="166" y="70" width="52" height="156" rx="10" fill="#ded2fb" stroke="#c8b6f5" ${sw(3)}/>` +
      `<path d="M6 76L40 6L74 76ZM158 76L192 6L226 76Z" fill="#7a52e0" stroke="#6a45d4" ${sw(3)} stroke-linejoin="round"/>` +
      `<path d="M36 102L116 30L196 102Z" fill="#8a63f0" stroke="#6a45d4" ${sw(3)} stroke-linejoin="round"/>` +
      `<rect x="114" y="0" width="4" height="34" fill="#6a45d4"/><path d="M118 2L146 10L118 18Z" fill="#ff6fae"/>` +
      `<path d="M92 226V178Q116 150 140 178V226Z" fill="#6a45d4"/><circle cx="132" cy="196" r="3.5" fill="#ffc83d"/>` +
      `<path d="${estrella(116, 124, 13)}" fill="#ffc83d"/>` +
      `<path d="M30 120Q40 106 50 120V142H30ZM182 120Q192 106 202 120V142H182ZM58 150Q68 136 78 150V172H58ZM154 150Q164 136 174 150V172H154Z" fill="#ffe89a"/>` +
      `<path d="M36 44a8 8 0 1 0 8 -8a6 6 0 1 1 -8 8z" fill="#ffe89a"/>` },
    casa: { vb: "0 0 196 180", svg:
      `<ellipse cx="98" cy="172" rx="86" ry="8" fill="rgba(60,40,80,.18)"/>` +
      `<circle class="humo" cx="146" cy="14" r="7" fill="#fff"/><circle class="humo humo2" cx="150" cy="10" r="9" fill="#fff"/>` +
      `<rect x="134" y="26" width="22" height="46" rx="4" fill="#d9a3bf"/>` +
      `<rect x="28" y="76" width="140" height="94" rx="12" fill="#ffe6f1" stroke="#f5bcd4" ${sw(3)}/>` +
      `<path d="M12 84L98 16L184 84Z" fill="#ff6fae" stroke="#e0508f" ${sw(4)} stroke-linejoin="round"/>` +
      `<path d="M40 72L98 28L156 72" fill="none" stroke="#ff9cc8" ${sw(4)} stroke-linecap="round"/>` +
      `<circle cx="98" cy="56" r="10" fill="#fff"/><path d="M98 61l-5 -5a3.2 3.2 0 0 1 5 -4a3.2 3.2 0 0 1 5 4z" fill="#ff6fae"/>` +
      `<path d="M82 170V128Q98 110 114 128V170Z" fill="#a67be8"/><circle cx="108" cy="148" r="3.5" fill="#ffc83d"/>` +
      `<circle cx="56" cy="118" r="18" fill="#c6ebff" stroke="#fff" ${sw(5)}/><path d="M56 101V135M39 118H73" stroke="#fff" ${sw(3)}/>` +
      `<rect x="126" y="102" width="30" height="30" rx="8" fill="#c6ebff" stroke="#fff" ${sw(5)}/>` +
      `<rect x="36" y="140" width="40" height="10" rx="4" fill="#b98a5c"/><circle cx="44" cy="137" r="5" fill="#ff8fb8"/><circle cx="56" cy="136" r="5" fill="#ffd54a"/><circle cx="68" cy="137" r="5" fill="#b89cff"/>` },
    cafe: { vb: "0 0 170 150", svg:
      `<ellipse cx="85" cy="143" rx="76" ry="7" fill="rgba(60,40,80,.18)"/>` +
      `<rect x="14" y="40" width="142" height="100" rx="10" fill="#fff4e0" stroke="#f3d6a8" ${sw(3)}/>` +
      `<rect x="6" y="30" width="158" height="18" rx="6" fill="#ff9a4d"/>` +
      `<path d="M6 48h22a11 11 0 0 1-22 0zM50 48h22a11 11 0 0 1-22 0zM94 48h22a11 11 0 0 1-22 0zM138 48h22a11 11 0 0 1-22 0z" fill="#fff"/>` +
      `<path d="M28 48h22a11 11 0 0 1-22 0zM72 48h22a11 11 0 0 1-22 0zM116 48h22a11 11 0 0 1-22 0z" fill="#ff9a4d"/>` +
      `<rect x="54" y="4" width="62" height="30" rx="10" fill="#fff" stroke="#f3d6a8" ${sw(3)}/><path d="M72 22h26l-4 9h-18z" fill="#c98a4b"/><path d="M71 22q0 -10 14 -10q14 0 14 10z" fill="#ff8fb8"/>` +
      `<rect x="26" y="74" width="60" height="44" rx="8" fill="#c6ebff" stroke="#fff" ${sw(4)}/><path d="M104 140V92Q120 78 136 92V140Z" fill="#ff9a4d"/>` +
      `<circle cx="44" cy="100" r="7" fill="#ff8fb8"/><circle cx="64" cy="102" r="6" fill="#ffd54a"/>` },
    tienda: { vb: "0 0 184 160", svg:
      `<ellipse cx="92" cy="152" rx="82" ry="7" fill="rgba(60,40,80,.18)"/>` +
      `<rect x="14" y="42" width="156" height="108" rx="10" fill="#fff3c4" stroke="#f0d88a" ${sw(3)}/>` +
      `<path d="M6 34H178L170 62H14Z" fill="#3cc9b0"/><path d="M26 34L22 62H40L44 34ZM62 34L58 62H76L80 34ZM98 34L96 62H114L116 34ZM134 34L134 62H152L152 34Z" fill="#fff"/>` +
      `<rect x="44" y="6" width="96" height="28" rx="10" fill="#ff6fae"/><path d="${estrella(92, 20, 9)}" fill="#fff"/>` +
      `<rect x="24" y="76" width="78" height="52" rx="8" fill="#c6ebff" stroke="#fff" ${sw(4)}/>` +
      `<rect x="34" y="98" width="16" height="22" rx="4" fill="#ff8fb8"/><circle cx="68" cy="106" r="10" fill="#ffd54a"/><rect x="82" y="94" width="12" height="26" rx="4" fill="#8a63f0"/>` +
      `<path d="M118 150V96Q136 80 154 96V150Z" fill="#3cc9b0"/>` },
    muelle: { vb: "0 0 140 96", svg:
      `<rect x="10" y="40" width="110" height="20" rx="4" fill="#c98a4b"/><path d="M24 40V60M44 40V60M64 40V60M84 40V60M104 40V60" stroke="#a86b35" ${sw(3)}/>` +
      `<rect x="20" y="58" width="8" height="26" fill="#a86b35"/><rect x="100" y="58" width="8" height="26" fill="#a86b35"/>` +
      `<path d="M96 40L126 6" stroke="#8a5a2a" ${sw(4)} stroke-linecap="round"/><path d="M126 6Q134 40 128 60" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="128" cy="62" r="5" fill="#ff6b7a"/>` },
  };
  A.edificio = (id, o) => A.dibujo(A.EDIFICIOS[id], o);

  /* ---------- Ícono dibujado de cada aventura (tarjetas de los lugares) ----------
     [grupo, clave, oscuro]: los adornos (DECO) son claros, van sobre una ficha morada. */
  A.AVENTURA_DIBUJO = {
    regar_flores: ["LUGARES", "jardin"], conchas: ["LUGARES", "playa"], mercado: ["LUGARES", "tienda"],
    carrera_bosque: ["LUGARES", "bosque"], gran_carrera: ["LUGARES", "jardin"], cocinar: ["LUGARES", "cocina"],
    pescar: ["LUGARES", "lago"], escapar: ["LUGARES", "cuarto"], acertijos_buho: ["PERSONAJES_EXTRA", "buho"],
    cofre_palabras: ["DECO", "libro", true], biblioteca: ["DECO", "libro", true], puente_patrones: ["DECO", "estrella", true],
    amigos: ["DECO", "corazon", true], bucear: ["DECO", "pez", true], clase_pociones: ["DECO", "pocion", true],
    cap1: ["DECO", "castillo", true], cap2: ["DECO", "chispa", true], cap3: ["PERSONAJES_EXTRA", "espejo"], cap4: ["DECO", "globo", true],
  };
  A.aventura = function (a) {
    const m = A.AVENTURA_DIBUJO[a.id]; if (!m) return null;
    const d = (A[m[0]] || {})[m[1]]; if (!d) return null;
    return { svg: A.dibujo(d), oscuro: !!m[2] };
  };
})();
