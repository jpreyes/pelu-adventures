/* ============================================================
   PELU ADVENTURES — Casa de muñecas y Vestidor (estilo Avatar World)
   Casa: 4 cuartos en corte (dormitorio, estudio, living, cocina).
   Los muebles fijos reaccionan al tocarlos (luces, tele, refri,
   cocina, cama, ventana = día/noche). Pelu, las mascotas y los
   muebles comprados se ARRASTRAN (posiciones guardadas en
   Estado.data.posiciones, en % de la casa).
   Vestidor: escenario con Pelu grande y accesorios dibujados.
   ============================================================ */

const Casa = {
  noche: false, luz: { dorm: false, est: false, liv: true, coc: false },
  canal: 1, refri: false, cocinando: false, durmiendo: false, tab: "muebles",

  // ancho (% de la casa) de cada mueble comprado al ponerlo
  ANCHO: { cama: 18, alfombra: 20, planta: 6, lampara: 5.5, tele: 12, sillon: 16, mesa: 10, cuadro: 7, globos: 7, pecera: 8, piano: 14, libros: 11 },

  abrir(tab) { if (tab) this.tab = tab; this.render(); },

  render() {
    app().innerHTML = `
      ${barra()}
      <div class="escena casa2" id="casa2">
        <div class="casa-cab">
          <button class="volver" onclick="Juego.volver()">← Volver</button>
          <h1>Casa de Pelu</h1>
          <button class="btn-noche" id="btn-noche" onclick="Casa.alternarNoche()">${this.botonNoche()}</button>
        </div>
        <div class="casa-muneca ${this.noche ? "de-noche" : ""}" id="casa-tablero">${this.casaHTML()}</div>
        <div class="casa-bandeja" id="casa-bandeja">${this.bandejaHTML()}</div>
      </div>`;
    Juego._initArrastreCasa();
  },

  // Repinta solo la casa (sin animar toda la pantalla)
  pintar() {
    const t = document.getElementById("casa-tablero");
    if (!t) return this.render();
    t.className = "casa-muneca" + (this.noche ? " de-noche" : "");
    t.innerHTML = this.casaHTML();
    Juego._initArrastreCasa();
    const b = document.getElementById("btn-noche"); if (b) b.innerHTML = this.botonNoche();
  },
  pintarBandeja() { const b = document.getElementById("casa-bandeja"); if (b) b.innerHTML = this.bandejaHTML(); },

  botonNoche() { return this.noche ? `${Arte.icono("sol", "#e0a51c", 22)} Día` : `${Arte.icono("luna", "#6a45d4", 22)} Noche`; },

  /* ---------- la casa ---------- */
  casaHTML() {
    const e = Estado.data, P = e.posiciones;
    const pos = (key, dx, dy) => P[key] || { x: dx, y: dy };
    const cuarto = (id, nombre, css, fondo, objetos) => {
      const oscuro = this.noche && !this.luz[id] ? 1 : 0, tibio = this.luz[id] ? (this.noche ? 1 : .4) : 0;
      return `<div class="cuarto2" style="${css};background:${fondo}">
        <span class="rotulo">${nombre}</span><div class="piso"></div>${objetos}
        <div class="sombra" style="opacity:${oscuro}"></div><div class="calido calido-${id}" style="opacity:${tibio}"></div></div>`;
    };
    const fijo = (id, css, svg, etiqueta) => `<button class="fijo" style="${css}" onclick="Casa.tocar('${id}', this)" aria-label="${etiqueta}">${svg}</button>`;
    const S = this.SVG;

    const dorm = cuarto("dorm", "Dormitorio", "left:1.5%;top:20.74%;width:60%;height:37.78%",
      "radial-gradient(#ffc9e0 2px, transparent 2.6px) 0 0 / 22px 22px, #ffe8f2",
      `<div class="alfombra" style="left:31.25%;top:73.5%;width:50%">${S.alfombra("#c9b6f5", "#ddd0fb")}</div>` +
      fijo("ventana", "left:6.25%;top:14.7%;width:22.9%", S.ventana(this.noche), "Ventana") +
      `<div class="deco-pared" style="left:40.8%;top:8.8%;width:11.7%">${S.cuadroEstrella()}</div>` +
      fijo("cama", "left:33.3%;top:43.1%;width:45.8%", S.cama(), "Cama") +
      fijo("lampDorm", "left:82.5%;top:31.4%;width:13.3%", S.lampMesa(this.luz.dorm), "Lámpara") +
      this.visitaHTML());
    const est = cuarto("est", "Estudio", "left:63%;top:20.74%;width:35.5%;height:37.78%",
      "repeating-linear-gradient(90deg, #f1eaff 0 18px, #e7ddff 18px 36px)",
      fijo("libros", "left:6.3%;top:16.7%;width:36.6%", S.estante(), "Estante de libros") +
      fijo("lampEst", "left:52.8%;top:34.3%;width:40.8%", S.escritorio(this.luz.est), "Escritorio con lámpara"));
    const liv = cuarto("liv", "Living", "left:1.5%;top:60.74%;width:60%;height:37.78%",
      "radial-gradient(#c9ecd6 2px, transparent 2.6px) 0 0 / 26px 26px, #e8f8ef",
      `<div class="alfombra" style="left:22.9%;top:76.5%;width:58.3%">${S.alfombra("#ffc9e0", "#ffdcea")}</div>` +
      fijo("tele", "left:4.6%;top:28.4%;width:25.8%", S.tele(this.canal), "Televisión") +
      fijo("sofa", "left:33.3%;top:48%;width:44.2%", S.sofa(), "Sofá") +
      fijo("lampLiv", "left:80.4%;top:14.7%;width:11.25%", S.lampPie(this.luz.liv), "Lámpara de pie") +
      `<div class="deco-pared" style="left:91.5%;top:55%;width:8.3%">${S.planta()}</div>`);
    const coc = cuarto("coc", "Cocina", "left:63%;top:60.74%;width:35.5%;height:37.78%",
      "linear-gradient(#fff6d6 0 52%, transparent 52%), repeating-conic-gradient(#ffffff 0 25%, #ffe7a8 0 50%) 0 0 / 26px 26px",
      fijo("refri", "left:5.6%;top:13.7%;width:36.6%", S.refri(this.refri), "Refrigerador") +
      fijo("estufa", "left:39.4%;top:45.1%;width:33.8%", S.estufa(this.cocinando), "Cocina") +
      fijo("lampCoc", "left:75.4%;top:0;width:21.8%", S.lampTecho(this.luz.coc), "Lámpara de la cocina") +
      `<div class="deco-pared" style="left:75.4%;top:57.8%;width:23.2%">${S.mesita()}</div>`);

    // arrastrables: muebles comprados, mascotas y Pelu
    const muebles = e.habitacion.map((id, i) => {
      const p = pos("mueble:" + id, 14 + (i % 5) * 17, i < 5 ? 88 : 50);
      return `<div class="obj-casa mueble-casa" data-key="mueble:${id}" data-tipo="mueble" data-id="${id}"
               style="left:${p.x}%;top:${p.y}%;width:${this.ANCHO[id] || 9}%">${Arte.mueble(id) || buscar(DATA.muebles, id).emoji}</div>`;
    }).join("");
    const mascotas = e.poseidos.mascotas.map((id, i) => {
      const p = pos("mascota:" + id, 12 + i * 9, 90);
      return `<div class="obj-casa mascota-anim" data-key="mascota:${id}" data-tipo="mascota" data-id="${id}"
               style="left:${p.x}%;top:${p.y}%;width:6.5%">${Arte.mascota(id) || buscar(DATA.mascotas, id).emoji}</div>`;
    }).join("");
    const pk = pos("pelu:pelu", 50, 82);

    return `
      <svg class="casa-techo" viewBox="92 0 840 108" aria-hidden="true">
        <rect x="760" y="34" width="48" height="56" rx="6" fill="#d9a3bf"/><rect x="754" y="28" width="60" height="12" rx="5" fill="#c98fae"/>
        <path d="M92 108L512 16L932 108Z" fill="#ff6fae" stroke="#e0508f" stroke-width="6" stroke-linejoin="round"/>
        <path d="M200 90L512 26L824 90" fill="none" stroke="#ff9cc8" stroke-width="5" stroke-linecap="round"/>
        <circle cx="512" cy="72" r="22" fill="#fff"/><path d="M512 84l-10 -10a6.5 6.5 0 0 1 10 -8a6.5 6.5 0 0 1 10 8z" fill="#ff6fae"/>
      </svg>
      <div class="casa-cuerpo"></div>
      ${dorm}${est}<div class="losa"></div>${liv}${coc}
      ${this.durmiendo ? `<div class="zzz" style="left:44%;top:27%">Z z z</div>` : ""}
      <div class="burbuja" id="burbuja-pelu"></div>
      ${muebles}${mascotas}
      <div class="obj-casa pelu-obj" id="pelu-casa" data-key="pelu:pelu" data-tipo="pelu" data-id="pelu"
           style="left:${pk.x}%;top:${pk.y}%;width:9%">${dibujarPelu(80, this.durmiendo ? "dormida" : "feliz")}</div>`;
  },

  // Una amiga de visita (cambia cada día)
  visitaHTML() {
    const amigas = ["luna", "mia", "nina"], dia = Math.floor(Date.now() / 864e5);
    this.visita = amigas[dia % 3];
    return `<button class="fijo visita" style="left:34.6%;top:12.7%;width:14.6%" onclick="Casa.tocar('visita', this)" aria-label="Amiga de visita">${Arte.gata(this.visita, { expresion: this.durmiendo ? "dormida" : "feliz" })}</button>`;
  },

  /* ---------- tocar los muebles fijos ---------- */
  tocar(id, el) {
    const luz = k => { this.luz[k] = !this.luz[k]; this.pintar(); this.revisarLuces(); };
    const decir = t => Juego.burbuja(t, el);
    switch (id) {
      case "ventana": return this.alternarNoche();
      case "cama":
        this.durmiendo = !this.durmiendo; this.pintar();
        return Juego.burbuja(this.durmiendo ? "Zzz… hora de la siesta" : "¡Buenos días!", document.getElementById("pelu-casa"));
      case "lampDorm": return luz("dorm");
      case "lampEst": return luz("est");
      case "lampLiv": return luz("liv");
      case "lampCoc": return luz("coc");
      case "tele": this.canal = (this.canal + 1) % 4; return this.pintar();
      case "refri": this.refri = !this.refri; this.pintar(); if (this.refri) Juego.burbuja("¡Hay pastel de frutilla!", document.querySelector('[aria-label="Refrigerador"]')); return;
      case "estufa":
        this.cocinando = !this.cocinando; this.pintar();
        if (this.cocinando) Juego.burbuja("¡Qué rico huele! En el Café puedes cocinar de verdad.", document.querySelector('[aria-label="Cocina"]'));
        return;
      case "libros": return decir(rnd(["«Hechizos para gatitas curiosas»", "«El gran libro de los acertijos»", "«Inglés para brujitas: nivel " + Retos.nivel("ingles") + "»"]));
      case "sofa": Juego.saltoPelu(); return decir("¡Boing! El sofá rebota.");
      case "visita": {
        const n = { luna: "Luna", mia: "Mia", nina: "Nina" }[this.visita];
        return decir(n + ": " + rnd(["¡Me encanta tu casa!", "¿Jugamos a las escondidas?", "Tu cama es súper suave.", "¿Decoramos juntas?"]));
      }
    }
  },

  alternarNoche() {
    this.noche = !this.noche;
    const c = document.getElementById("casa2"); if (c) c.classList.toggle("de-noche", this.noche);
    this.pintar(); this.revisarLuces();
  },
  revisarLuces() {
    if (this.noche && Object.values(this.luz).every(Boolean) && window.Misiones) Misiones.registrar("luces");
  },

  /* ---------- bandeja inferior ---------- */
  bandejaHTML() {
    const e = Estado.data;
    const tab = (id, txt, ico) => `<button class="tab ${this.tab === id ? "activa" : ""}" onclick="Casa.tab='${id}';Casa.pintarBandeja()">${Arte.icono(ico, "currentColor", 18)} ${txt}</button>`;
    let items = "";
    if (this.tab === "muebles") {
      items = DATA.muebles.filter(m => Estado.tiene("muebles", m.id)).map(m => {
        const puesto = e.habitacion.includes(m.id);
        return `<button class="item-casa ${puesto ? "activo" : ""}" onclick="Casa.alternarMueble('${m.id}')">
          <span class="item-dibujo">${Arte.mueble(m.id) || m.emoji}</span><span class="item-nombre">${m.nombre}</span>
          <span class="item-tag ${puesto ? "si" : ""}">${puesto ? "En la casa" : "Guardado"}</span></button>`;
      }).join("");
      items += `<button class="item-casa tienda" onclick="Juego.origenTienda='casa';Juego.tienda('muebles')"><span class="item-dibujo">${Arte.icono("tienda", "#e0508f", 34)}</span><span class="item-nombre">Comprar más</span></button>`;
    } else if (this.tab === "mascotas") {
      items = DATA.mascotas.filter(m => Estado.tiene("mascotas", m.id)).map(m =>
        `<button class="item-casa" onclick="Casa.mimarMascota('${m.id}')"><span class="item-dibujo">${Arte.mascota(m.id) || m.emoji}</span>
          <span class="item-nombre">${m.nombre}</span><span class="item-tag si">Mimar</span></button>`).join("");
      items += `<button class="item-casa tienda" onclick="Juego.origenTienda='casa';Juego.tienda('mascotas')"><span class="item-dibujo">${Arte.icono("tienda", "#e0508f", 34)}</span><span class="item-nombre">Adoptar más</span></button>`;
    } else {
      items = [["acariciar", "Acariciar", "corazon"], ["premio", "Darle premio", "chispa"], ["jugar", "Jugar", "pata"]].map(([t, n, ico]) =>
        `<button class="item-casa" onclick="Juego.mimo('${t}')"><span class="item-dibujo">${Arte.icono(ico, "#e0508f", 34)}</span><span class="item-nombre">${n}</span></button>`).join("") +
        `<button class="item-casa tienda" onclick="Juego.closet()"><span class="item-dibujo">${Arte.icono("ropa", "#6a45d4", 34)}</span><span class="item-nombre">Vestidor</span></button>`;
    }
    return `
      <div class="bandeja-top">
        <div class="tabs">${tab("muebles", "Muebles", "mueble")}${tab("mascotas", "Mascotas", "pata")}${tab("mimos", "Mimos", "corazon")}</div>
        <span class="bandeja-pista">${this.tab === "muebles" ? "Toca un mueble para ponerlo y arrástralo a cualquier cuarto" : this.tab === "mascotas" ? "Arrastra a tus mascotas por la casa" : "Consiente a Pelu"}</span>
      </div>
      <div class="bandeja-items">${items}</div>`;
  },

  alternarMueble(id) {
    const h = Estado.data.habitacion, i = h.indexOf(id);
    if (i >= 0) { h.splice(i, 1); toast("Guardado en el baúl"); }
    else { h.push(id); confeti(); }
    Estado.guardar(); this.pintar(); this.pintarBandeja();
  },
  mimarMascota(id) {
    const el = document.querySelector(`.obj-casa[data-key="mascota:${id}"]`);
    Juego.reaccionMascota(id, el);
  },

  /* ---------- muebles fijos dibujados (del mockup aprobado) ---------- */
  SVG: {
    ventana: n => `<svg viewBox="0 0 110 96" aria-hidden="true"><rect x="4" y="4" width="102" height="84" rx="10" fill="#fff"/>
      <rect x="12" y="12" width="86" height="68" rx="6" fill="${n ? "#2b2d6e" : "#bfe6ff"}"/>
      ${n ? `<circle cx="72" cy="30" r="10" fill="#fff6c9"/><circle cx="67" cy="26" r="9" fill="#2b2d6e"/><circle cx="30" cy="30" r="2" fill="#fff"/><circle cx="44" cy="58" r="1.8" fill="#fff"/><circle cx="84" cy="62" r="1.5" fill="#fff"/>`
          : `<circle cx="76" cy="30" r="10" fill="#ffd96a"/><ellipse cx="36" cy="56" rx="18" ry="8" fill="#fff"/>`}
      <path d="M55 12V80M12 46H98" stroke="#fff" stroke-width="5"/><path d="M2 4Q16 40 6 90H0V4ZM108 4Q94 40 104 90H110V4Z" fill="#ff8fb8"/></svg>`,
    cuadroEstrella: () => `<svg viewBox="0 0 56 46" aria-hidden="true"><rect x="2" y="2" width="52" height="42" rx="6" fill="#fff" stroke="#e9c49b" stroke-width="3"/><path d="M28 10l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffc83d"/></svg>`,
    cama: () => `<svg viewBox="0 0 220 94" aria-hidden="true"><rect x="4" y="6" width="36" height="84" rx="12" fill="#ff8fb8" stroke="#e0508f" stroke-width="3"/>
      <rect x="26" y="46" width="186" height="34" rx="10" fill="#fff" stroke="#e8dcef" stroke-width="3"/><path d="M90 40H206a8 8 0 0 1 8 8V78H90Z" fill="#8a63f0"/>
      <path d="M100 52h10M122 62h10M146 52h10M170 62h10M190 52h10" stroke="#b89cff" stroke-width="4" stroke-linecap="round"/>
      <rect x="36" y="32" width="48" height="24" rx="12" fill="#fff" stroke="#e8dcef" stroke-width="3"/><rect x="30" y="78" width="10" height="14" rx="3" fill="#c98a4b"/><rect x="198" y="78" width="10" height="14" rx="3" fill="#c98a4b"/></svg>`,
    lampMesa: on => `<svg viewBox="0 0 64 116" aria-hidden="true">${on ? `<path d="M14 36L50 36L64 110H0Z" fill="rgba(255,220,120,.35)"/>` : ""}
      <path d="M14 8H50L58 38H6Z" fill="${on ? "#ffe07a" : "#fff3d0"}" stroke="#e0a51c" stroke-width="3" stroke-linejoin="round"/>
      <rect x="29" y="38" width="6" height="38" fill="#b98a5c"/><rect x="8" y="76" width="48" height="38" rx="6" fill="#c98a4b"/><rect x="14" y="86" width="36" height="8" rx="3" fill="#a86b35"/></svg>`,
    estante: () => `<svg viewBox="0 0 104 146" aria-hidden="true"><rect x="2" y="2" width="100" height="142" rx="6" fill="#c98a4b"/>
      <rect x="8" y="8" width="88" height="38" fill="#a86b35"/><rect x="8" y="52" width="88" height="38" fill="#a86b35"/><rect x="8" y="96" width="88" height="42" fill="#a86b35"/>
      <rect x="12" y="14" width="12" height="32" rx="2" fill="#ff6fae"/><rect x="26" y="18" width="10" height="28" rx="2" fill="#4db3ff"/><rect x="38" y="12" width="14" height="34" rx="2" fill="#8a63f0"/><rect x="58" y="20" width="10" height="26" rx="2" fill="#3ccf8c"/><path d="M72 46L82 18L90 21L80 46Z" fill="#ffc83d"/>
      <rect x="12" y="60" width="14" height="30" rx="2" fill="#ffc83d"/><rect x="28" y="58" width="10" height="32" rx="2" fill="#ff9a4d"/><circle cx="66" cy="76" r="13" fill="#b89cff"/><circle cx="66" cy="76" r="6" fill="#fff" opacity=".5"/>
      <rect x="12" y="104" width="30" height="34" rx="3" fill="#fff"/><rect x="48" y="102" width="12" height="36" rx="2" fill="#ff6fae"/><rect x="62" y="106" width="12" height="32" rx="2" fill="#4db3ff"/></svg>`,
    escritorio: on => `<svg viewBox="0 0 116 110" aria-hidden="true">${on ? `<path d="M40 30L70 30L96 70H20Z" fill="rgba(255,220,120,.4)"/>` : ""}
      <path d="M40 10L70 14L66 32L36 28Z" fill="${on ? "#ffe07a" : "#fff3d0"}" stroke="#e0a51c" stroke-width="3" stroke-linejoin="round"/>
      <path d="M54 30L46 70" stroke="#6a45d4" stroke-width="4" stroke-linecap="round"/><rect x="4" y="70" width="108" height="10" rx="4" fill="#c98a4b"/>
      <rect x="12" y="80" width="8" height="28" fill="#a86b35"/><rect x="96" y="80" width="8" height="28" fill="#a86b35"/>
      <circle cx="90" cy="58" r="11" fill="#4db3ff"/><path d="M80 56q10 -6 20 2" fill="none" stroke="#3ccf8c" stroke-width="4"/><rect x="88" y="68" width="4" height="4" fill="#a86b35"/></svg>`,
    tele: canal => {
      const fondo = ["#2b2438", "#9fdcff", "#b89cff", "#3a9ad8"][canal];
      const prog = [
        "",
        `<circle cx="86" cy="28" r="9" fill="#ffd96a"/><path d="M11 71Q40 44 62 60Q84 44 113 64V71Z" fill="#3ccf8c"/><circle cx="42" cy="48" r="7" fill="#fff"/><path d="M36 43l2-6 4 4zM48 43l-2-6-4 4z" fill="#fff"/>`,
        `<path d="M40 58V26L74 20V52" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34" cy="58" r="7" fill="#fff"/><circle cx="68" cy="52" r="7" fill="#fff"/>`,
        `<path d="M30 40q14-12 28 0q-14 12-28 0zM58 40l10-8v16z" fill="#ff9a4d"/><path d="M66 58q10-8 20 0q-10 8-20 0zM86 58l7-6v12z" fill="#ffd54a"/><circle cx="90" cy="26" r="3" fill="#fff" opacity=".7"/>`,
      ][canal];
      return `<svg viewBox="0 0 124 122" aria-hidden="true"><rect x="4" y="4" width="116" height="74" rx="10" fill="#46304f"/>
        <rect x="11" y="11" width="102" height="60" rx="6" fill="${fondo}"/>${prog}
        <rect x="54" y="78" width="16" height="10" fill="#6d5a86"/><rect x="14" y="88" width="96" height="30" rx="6" fill="#c98a4b"/><circle cx="62" cy="103" r="4" fill="#a86b35"/></svg>`;
    },
    sofa: () => `<svg viewBox="0 0 212 84" aria-hidden="true"><rect x="16" y="6" width="180" height="46" rx="18" fill="#9b7af2"/>
      <rect x="4" y="34" width="36" height="44" rx="14" fill="#8a63f0"/><rect x="172" y="34" width="36" height="44" rx="14" fill="#8a63f0"/>
      <rect x="30" y="42" width="152" height="30" rx="10" fill="#b39bff"/><path d="M106 44V70" stroke="#9b7af2" stroke-width="3"/>
      <rect x="18" y="76" width="8" height="8" rx="2" fill="#6a45d4"/><rect x="186" y="76" width="8" height="8" rx="2" fill="#6a45d4"/></svg>`,
    lampPie: on => `<svg viewBox="0 0 54 150" aria-hidden="true">${on ? `<circle cx="27" cy="22" r="26" fill="rgba(255,220,120,.35)"/>` : ""}
      <path d="M10 4H44L50 34H4Z" fill="${on ? "#ffe07a" : "#fff3d0"}" stroke="#e0a51c" stroke-width="3" stroke-linejoin="round"/>
      <rect x="24" y="34" width="6" height="106" fill="#6d5a86"/><ellipse cx="27" cy="144" rx="20" ry="5" fill="#6d5a86"/></svg>`,
    planta: () => `<svg viewBox="0 0 40 68" aria-hidden="true"><path d="M20 40Q4 30 8 10Q18 20 20 40Q22 18 34 8Q38 30 20 40" fill="#3ccf8c"/><path d="M8 40H32L28 66H12Z" fill="#ff9a4d"/></svg>`,
    refri: abierto => `<svg viewBox="0 0 104 152" aria-hidden="true"><rect x="4" y="4" width="78" height="144" rx="12" fill="#bfeee0" stroke="#8fd9c3" stroke-width="3"/>
      ${abierto
        ? `<rect x="10" y="10" width="66" height="132" rx="8" fill="#fff"/><path d="M10 52H76M10 96H76" stroke="#dff3ec" stroke-width="4"/>
           <rect x="16" y="22" width="14" height="28" rx="3" fill="#e2f2ff" stroke="#4db3ff" stroke-width="2"/><circle cx="48" cy="40" r="9" fill="#ff6b7a"/><rect x="46" y="28" width="3" height="5" fill="#3ccf8c"/>
           <path d="M16 90h40l-4-18h-32z" fill="#ffd9e8"/><path d="M16 72q20-10 36 0" fill="#ff8fb8"/><circle cx="36" cy="66" r="4" fill="#ff6b7a"/>
           <rect x="16" y="104" width="22" height="30" rx="4" fill="#ffc83d"/><circle cx="56" cy="122" r="11" fill="#ff9a4d"/><path d="M78 6L100 20V148L78 148Z" fill="#a8e6d4"/>`
        : `<path d="M4 56H82" stroke="#8fd9c3" stroke-width="3"/><rect x="66" y="20" width="6" height="24" rx="3" fill="#fff"/><rect x="66" y="68" width="6" height="30" rx="3" fill="#fff"/>
           <circle cx="28" cy="30" r="8" fill="#ff6fae"/><path d="M20 90l6-8 6 8z" fill="#ffc83d"/>`}</svg>`,
    estufa: coc => `<svg viewBox="0 0 96 88" aria-hidden="true">
      ${coc ? `<path class="vapor" d="M40 12q-6-6 0-12M52 12q-6-6 0-12" fill="none" stroke="#c9c1d3" stroke-width="3" stroke-linecap="round"/><path d="M34 36q6-8 12 0M50 36q6-8 12 0" fill="none" stroke="#ff9a4d" stroke-width="3"/>` : ""}
      <rect x="28" y="16" width="40" height="22" rx="6" fill="#ff6fae"/><rect x="24" y="14" width="48" height="6" rx="3" fill="#e0508f"/>
      <rect x="4" y="38" width="88" height="48" rx="8" fill="#f3f0f6" stroke="#d9d0e2" stroke-width="3"/><rect x="14" y="50" width="68" height="28" rx="5" fill="#46304f"/>
      <circle cx="20" cy="44" r="2.5" fill="#8a63f0"/><circle cx="76" cy="44" r="2.5" fill="#8a63f0"/></svg>`,
    lampTecho: on => `<svg viewBox="0 0 62 74" aria-hidden="true"><rect x="29" y="0" width="4" height="36" fill="#6d5a86"/>
      ${on ? `<circle cx="31" cy="54" r="26" fill="rgba(255,220,120,.35)"/>` : ""}
      <path d="M8 58Q31 22 54 58Z" fill="${on ? "#ffe07a" : "#fff3d0"}" stroke="#e0a51c" stroke-width="3" stroke-linejoin="round"/></svg>`,
    mesita: () => `<svg viewBox="0 0 66 62" aria-hidden="true"><rect x="2" y="24" width="62" height="8" rx="3" fill="#c98a4b"/><rect x="10" y="32" width="6" height="30" fill="#a86b35"/><rect x="50" y="32" width="6" height="30" fill="#a86b35"/><path d="M24 22h18l-3-10h-12z" fill="#c98a4b"/><path d="M22 12q11-12 22 0z" fill="#ff8fb8"/></svg>`,
    alfombra: (a, b) => `<svg viewBox="0 0 240 46" aria-hidden="true"><ellipse cx="120" cy="23" rx="118" ry="20" fill="${a}"/><ellipse cx="120" cy="23" rx="96" ry="14" fill="${b}"/></svg>`,
  },
};

// La expresión de Pelu en la casa respeta si está durmiendo
Juego._peluExpr = function (expresion) {
  const el = document.getElementById("pelu-casa");
  if (el) el.innerHTML = dibujarPelu(80, Casa.durmiendo ? "dormida" : expresion);
};

/* ============================================================
   VESTIDOR — escenario + accesorios dibujados
   ============================================================ */
const Vestidor = {
  slot: "sombrero",
  SLOTS: [
    ["sombrero", "Cabeza", "M4 17h16M6 17c0-6 2.5-11 6-13 3.5 2 6 7 6 13", "#6a45d4", "#efe8ff"],
    ["gafas", "Lentes", "M3 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M14 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M10 11.5c1.2-.8 2.8-.8 4 0", "#2a8fdc", "#e2f2ff"],
    ["collar", "Cuello", "M12 12L5 8v8zM12 12l7-4v8z", "#e0508f", "#ffe6f1"],
    ["mochila", "Espalda", "M12 6C9 3 3 4 4 10c.8 5 5 6 8 3 3 3 7.2 2 8-3 1-6-5-7-8-4z", "#22a86c", "#ddf8ea"],
  ],

  abrir() { this.render(); },

  render() {
    const cats = this.SLOTS.map(([id, nombre, d, color, fondo]) => `
      <button class="vest-cat ${this.slot === id ? "activa" : ""}" onclick="Vestidor.slot='${id}';Vestidor.render()">
        <span class="vest-caticon" style="background:${fondo}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg></span>
        ${nombre}</button>`).join("");
    const puesto = Estado.data.vestido[this.slot];
    const cartas = DATA.ropa.filter(r => r.slot === this.slot).map(r => {
      const tiene = Estado.tiene("ropa", r.id), activo = puesto === r.id;
      const tag = activo ? `<span class="item-tag puesto">Puesto</span>` : tiene ? `<span class="item-tag si">Tuyo</span>` : `<span class="item-tag precio">${Arte.estrella(12)} ${r.precio}</span>`;
      return `<button class="vest-carta ${activo ? "activa" : ""}" onclick="Vestidor.poner('${r.id}')" aria-label="${r.nombre}">
        ${Arte.prenda(r.id, 84) || r.emoji}<span class="item-nombre">${r.nombre}</span>${tag}</button>`;
    }).join("");
    const nombreSlot = this.SLOTS.find(s => s[0] === this.slot)[1];
    app().innerHTML = `
      ${barra()}
      <div class="escena vestidor2">
        <div class="casa-cab">
          <button class="volver" onclick="Juego.volver()">← Volver</button>
          <h1>Vestidor</h1><span class="cab-hueco"></span>
        </div>
        <div class="vest-grid">
          <div class="vest-cats">${cats}</div>
          <div class="vest-escenario" id="vest-escenario">
            <div class="telon izq"></div><div class="telon der"></div><div class="telon arriba"></div>
            <div class="foco"></div><div class="tarima"></div>
            <div class="vest-pelu" id="vest-pelu">${dibujarPelu(270)}</div>
            <div id="vest-foto"></div>
            <div class="vest-acciones">
              <button class="btn blanco" onclick="Vestidor.foto()">${Arte.icono("camara", "#6a45d4", 22)} Foto</button>
              <button class="btn blanco suave" onclick="Vestidor.quitarTodo()">Quitar todo</button>
            </div>
          </div>
          <div class="vest-items">
            <div class="vest-items-top"><h2>${nombreSlot}</h2><span>Toca para probar</span></div>
            <div class="vest-cartas">${cartas}</div>
            <div class="vest-nota">${Arte.icono("chispa", "#6a45d4", 26)}<span>Gana estrellas en los retos y en las misiones para comprar ropa nueva.</span></div>
          </div>
        </div>
      </div>`;
  },

  poner(id) {
    const r = buscar(DATA.ropa, id), v = Estado.data.vestido;
    if (!Estado.tiene("ropa", id)) {
      const res = Estado.comprar("ropa", r);
      if (res === "sin_dinero") return toast(`Te faltan estrellas: cuesta ${r.precio} ⭐`);
      confeti(); toast(`¡${r.nombre} es tuyo!`);
    }
    v[r.slot] = v[r.slot] === id ? null : id;
    Estado.guardar();
    this.render();
  },

  quitarTodo() { Object.keys(Estado.data.vestido).forEach(k => Estado.data.vestido[k] = null); Estado.guardar(); this.render(); },

  foto() {
    const f = document.getElementById("vest-foto");
    f.innerHTML = `<div class="flash"></div><div class="polaroid">${dibujarPelu(110)}<span>¡Look guardado!</span></div>`;
    if (window.Misiones) Misiones.registrar("foto");
  },
};

// El juego usa estas entradas desde muchos lugares
Juego.casa = () => Casa.abrir();
Juego.decorar = () => Casa.abrir("muebles");
Juego.closet = () => Vestidor.abrir();

if (typeof window !== "undefined") { window.Casa = Casa; window.Vestidor = Vestidor; }
