/* ============================================================
   PELU ADVENTURES — Pueblo (pantalla de inicio), Misiones y Álbum
   El Pueblo es una escena ilustrada estilo "Avatar World": cada
   edificio se toca y abre su ficha; las amigas pasean y hablan;
   arriba va el avatar y abajo el dock. La escena usa un sistema
   de coordenadas de 1024×768 expresado en % (escala con la pantalla).
   ============================================================ */

/* ---------- Misión del día ---------- */
const Misiones = {
  LISTA: [
    { id: "ingles4",  texto: "Saca 4 de 5 en una ronda de inglés",        evento: "ronda_ingles",     meta: 1 },
    { id: "mate4",    texto: "Saca 4 de 5 en una ronda de números",       evento: "ronda_matematicas", meta: 1 },
    { id: "logica2",  texto: "Juega 2 rondas de lógica",                  evento: "jugada_logica",    meta: 2 },
    { id: "dinero",   texto: "Completa una ronda en el Mercadito",        evento: "jugada_dinero",    meta: 1 },
    { id: "cocina",   texto: "Cocina una receta en el Café",              evento: "cocinar",          meta: 1 },
    { id: "pesca",    texto: "Pesca 5 peces en el lago",                  evento: "pez",              meta: 5 },
    { id: "capitulo", texto: "Lee un capítulo de la historia completo",   evento: "capitulo",         meta: 1 },
    { id: "luces",    texto: "De noche, enciende las 4 luces de tu casa", evento: "luces",            meta: 1 },
    { id: "foto",     texto: "Crea un look en el Vestidor y sácale foto", evento: "foto",             meta: 1 },
    { id: "amigas",   texto: "Saluda a Luna, Mia y Nina en el pueblo",    evento: "saludo",           meta: 3 },
  ],
  PREMIO: 15,

  hoy() {
    const fecha = new Date().toISOString().slice(0, 10);
    let m = Estado.data.mision;
    if (!m || m.fecha !== fecha) {
      // la misión depende del día y de la jugadora (cada una tiene la suya)
      const semilla = (fecha + (Perfil.actual() || "")).split("").reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
      const def = this.LISTA[semilla % this.LISTA.length];
      m = Estado.data.mision = { fecha, id: def.id, progreso: 0, vistos: [], cobrada: false };
      Estado.guardar();
    }
    return { ...this.LISTA.find(x => x.id === m.id), estado: m };
  },

  // Avisa que pasó algo; si era la misión de hoy, suma progreso
  registrar(evento, n = 1, clave) {
    if (!Estado.data) return;
    const h = this.hoy(), m = h.estado;
    if (m.cobrada || h.evento !== evento) return;
    if (clave) { if (m.vistos.includes(clave)) return; m.vistos.push(clave); }
    m.progreso = Math.min(h.meta, m.progreso + n);
    if (m.progreso >= h.meta) {
      m.cobrada = true;
      Estado.ganar(this.PREMIO);
      setTimeout(() => { confeti(); toast(`¡Misión del día cumplida! +${this.PREMIO} ⭐`); }, 400);
    }
    Estado.guardar();
  },

  tarjeta() {
    const h = this.hoy(), m = h.estado, pct = Math.round(m.progreso / h.meta * 100);
    return `
      <div class="mision-card ${m.cobrada ? "cumplida" : ""}">
        <div class="mision-top"><span class="mision-ceja">Misión de hoy</span>
          <span class="mision-premio">${m.cobrada ? Arte.icono("check", "#22a86c", 16, 3) + " Lista" : "+" + this.PREMIO}</span></div>
        <div class="mision-texto">${h.texto}</div>
        <div class="mision-barra"><span class="barrita"><i style="width:${pct}%"></i></span><span class="num">${m.progreso}/${h.meta}</span></div>
      </div>`;
  },
};

/* ---------- Pueblo ---------- */
const Pueblo = {
  sel: null,
  LUGARES: {
    casa:    { nombre: "Casa de Pelu", desc: "Decora tus cuartos, juega con tus mascotas y recibe a tus amigas.", color: "#ff6fae", icono: "casa", ir: () => Juego.casa() },
    colegio: { nombre: "Colegio de Brujitas", desc: "Capítulos de la historia y clases de pociones, inglés y acertijos.", color: "#8a63f0", icono: "historia", ir: () => Juego.lugar("colegio") },
    cafe:    { nombre: "Café Mágico", desc: "Cocina recetas para tus amigas y gana estrellas.", color: "#ff9a4d", icono: "corazon", ir: () => Juego.lugar("cocina") },
    tienda:  { nombre: "Tienda del Pueblo", desc: "Ropa, muebles y mascotas nuevas. También está el Mercadito.", color: "#3cc9b0", icono: "tienda", ir: () => Juego.lugar("tienda") },
    muelle:  { nombre: "Muelle del Lago", desc: "Pesca peces raros para completar tu álbum.", color: "#4db3ff", icono: "chispa", ir: () => Juego.lugar("lago") },
  },
  // posición en la escena de 1024×768 (x, y, ancho)
  POS: { colegio: [398, 142, 232], casa: [86, 268, 196], cafe: [250, 480, 170], tienda: [716, 318, 184], muelle: [700, 548, 140] },
  AMIGAS: {
    pelu: { x: 300, y: 232, w: 80, nombre: "Pelu", frases: ["¡Hola! ¿Qué hacemos hoy?", "Me encanta nuestro pueblo.", "¿Vamos a ver mi casa? La decoré entera."] },
    luna: { x: 628, y: 520, w: 64, nombre: "Luna", frases: ["¿Vamos a pescar al muelle? Hoy pican los peces raros.", "Con paciencia sale el pez más lindo.", "¡Pelu! Te estaba buscando."] },
    mia:  { x: 452, y: 398, w: 60, nombre: "Mia", frases: ["Hoy en el Café hay cupcakes de frutilla.", "Aprendí que ganar sola no es tan divertido. ¿Jugamos juntas?", "¡Mira mi lazo nuevo!"] },
    nina: { x: 918, y: 474, w: 58, nombre: "Nina", frases: ["Encontré una flor mágica cerca de la tienda.", "Gracias por incluirme siempre, Pelu.", "¿Sabías que el lago tiene un pez dorado?"] },
  },
  pct: (v, total) => (v / total * 100).toFixed(2) + "%",

  render() {
    this.sel = null;
    const e = Estado.data;
    const edificios = Object.entries(this.POS).map(([id, [x, y, w]]) => `
      <button class="edif" id="edif-${id}" onclick="Pueblo.tocar('${id}')" aria-label="${this.LUGARES[id].nombre}"
              style="left:${this.pct(x, 1024)};top:${this.pct(y, 768)};width:${this.pct(w, 1024)}">
        ${Arte.edificio(id === "muelle" ? "muelle" : id)}
        <span class="etiqueta">${this.LUGARES[id].nombre}</span>
      </button>`).join("");
    const vestido = Object.values(e.vestido).filter(Boolean);
    const amigas = Object.entries(this.AMIGAS).map(([id, a]) => `
      <button class="gata-pueblo" onclick="Pueblo.hablar('${id}')" aria-label="${a.nombre}"
              style="left:${this.pct(a.x, 1024)};top:${this.pct(a.y, 768)};width:${this.pct(a.w, 1024)};animation-delay:${(a.x % 7) * .3}s">
        ${Arte.gata(id, { accesorios: id === "pelu" ? vestido : [] })}
        <span class="etiqueta chica">${a.nombre}</span>
      </button>`).join("");
    const carteles = [["Explorar el valle", "Mundo.start('valle')"], ["Volcán", "Mundo.start('volcan')"], ["Playa", "Mundo.start('playa')"]]
      .map(([t, fn], i) => `<button class="cartel" onclick="${fn}" style="top:${63 + i * 6.2}%">${t} <b>›</b></button>`).join("");
    const nivel = this.nivelJugadora();

    app().innerHTML = `
      <div class="pueblo">
        <div class="pueblo-escena">
          ${this.fondo()}
          <div class="nube" style="top:12%;animation-duration:60s">${this.nubeSvg(150)}</div>
          <div class="nube" style="top:22%;animation-duration:85s;animation-delay:-40s;opacity:.85">${this.nubeSvg(110)}</div>
          ${edificios}
          ${carteles}
          ${amigas}
          <div id="pueblo-globo" class="pueblo-globo" hidden></div>
          <div id="pueblo-ficha" class="pueblo-ficha" hidden></div>

          <div class="pueblo-hud">
            <button class="hud-avatar" onclick="Juego.ajustes()" aria-label="Mi perfil">
              <span class="hud-cara">${Arte.cara("pelu", 44)}</span>
              <span class="hud-datos"><b>${esc(Perfil.actual() || "Jugadora")}</b>
                <span class="hud-nivel">Nv ${nivel.n}<span class="barrita"><i style="width:${nivel.pct}%"></i></span></span></span>
            </button>
            <div class="hud-der">
              <div class="monedas">${Arte.estrella(26)}<span>${e.estrellas}</span></div>
              <button class="btn-redondo hud-btn" onclick="Juego.album()" aria-label="Álbum">${Arte.icono("album", "#6a45d4", 26)}</button>
              <button class="btn-redondo hud-btn" onclick="Juego.ajustes()" aria-label="Ajustes">${Arte.icono("ajustes", "#6a45d4", 26)}</button>
            </div>
          </div>
          ${Misiones.tarjeta()}

          <nav class="dock" aria-label="Menú">
            <button class="dockbtn activo" onclick="Juego.inicio()"><span class="dockico" style="background:#efe8ff">${Arte.icono("mapa", "#6a45d4", 30)}</span>Pueblo</button>
            <button class="dockbtn" onclick="Mundo.start('valle')"><span class="dockico" style="background:#ddf8ea">${Arte.icono("explorar", "#22a86c", 30)}</span>Explorar</button>
            <button class="dockbtn" onclick="Juego.abrirMinijuegos()"><span class="dockico" style="background:#e2f2ff">${Arte.icono("juegos", "#2a8fdc", 30)}</span>Minijuegos</button>
            <button class="dockbtn" onclick="Juego.closet()"><span class="dockico" style="background:#ffe6f1">${Arte.icono("ropa", "#e0508f", 30)}</span>Vestidor</button>
            <button class="dockbtn" onclick="Juego.casa()"><span class="dockico" style="background:#fff5d6">${Arte.icono("casa", "#c98a0a", 30)}</span>Mi casa</button>
          </nav>
        </div>
      </div>`;
  },

  // Nivel de jugadora = promedio de los niveles de sus materias
  nivelJugadora() {
    const nv = Object.keys(Retos.MATERIAS).map(m => Retos.nivel(m));
    const prom = nv.reduce((a, b) => a + b, 0) / nv.length;
    return { n: Math.floor(prom), pct: Math.round((prom % 1) * 100) || 8 };
  },

  tocar(id) {
    document.querySelectorAll(".edif.activo").forEach(b => b.classList.remove("activo"));
    const ficha = document.getElementById("pueblo-ficha");
    document.getElementById("pueblo-globo").hidden = true;
    if (this.sel === id) { this.sel = null; ficha.hidden = true; return; }
    this.sel = id;
    document.getElementById("edif-" + id).classList.add("activo");
    const l = this.LUGARES[id];
    ficha.innerHTML = `
      <span class="ficha-ico" style="background:${l.color}">${Arte.icono(l.icono, "#fff", 32, 2.4)}</span>
      <span class="ficha-texto"><b>${l.nombre}</b><span>${l.desc}</span></span>
      <button class="btn grande" onclick="Pueblo.entrar()">Entrar</button>`;
    ficha.hidden = false;
    ficha.classList.remove("aparece"); void ficha.offsetWidth; ficha.classList.add("aparece");
  },

  entrar() { const id = this.sel; if (!id) return; Juego.origen = "pueblo"; this.LUGARES[id].ir(); },

  hablar(id) {
    const a = this.AMIGAS[id], g = document.getElementById("pueblo-globo");
    document.getElementById("pueblo-ficha").hidden = true;
    document.querySelectorAll(".edif.activo").forEach(b => b.classList.remove("activo")); this.sel = null;
    // a veces la amiga recuerda la misión del día
    const h = Misiones.hoy();
    const frase = (!h.estado.cobrada && Math.random() < .35) ? `Oye, no olvides la misión de hoy: ${h.texto.toLowerCase()}.` : rnd(a.frases);
    g.innerHTML = `<b>${a.nombre}</b>${frase}`;
    g.style.left = this.pct(Math.min(a.x + a.w * .7, 780), 1024);
    g.style.top = this.pct(Math.max(90, a.y - 70), 768);
    g.hidden = false;
    g.classList.remove("aparece"); void g.offsetWidth; g.classList.add("aparece");
    if (id !== "pelu") Misiones.registrar("saludo", 1, id);
  },

  nubeSvg(w) {
    return `<svg width="${w}" viewBox="0 0 150 60" aria-hidden="true"><ellipse cx="50" cy="38" rx="44" ry="20" fill="#fff"/><ellipse cx="90" cy="30" rx="40" ry="26" fill="#fff"/><ellipse cx="120" cy="40" rx="28" ry="16" fill="#fff"/></svg>`;
  },

  fondo() {
    const camino = (d, a, b) => `<path d="${d}" fill="none" stroke="#f1dca6" stroke-width="${a}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fbeec8" stroke-width="${b}" stroke-linecap="round"/>`;
    const arbol = (x, y, r) => `<rect x="${x - 6}" y="${y + r * .4}" width="12" height="${r * 1.3}" rx="4" fill="#a5754a"/><circle cx="${x}" cy="${y}" r="${r}" fill="#5fbf62"/><circle cx="${x - r * .5}" cy="${y + r * .4}" r="${r * .65}" fill="#6fcc6c"/>`;
    const flores = [[250, 560], [700, 560], [380, 660], [330, 430], [560, 700], [150, 720]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="6" fill="#ff8fb8"/><circle cx="${x + 12}" cy="${y + 6}" r="5" fill="#ffd54a"/><circle cx="${x - 10}" cy="${y + 10}" r="5" fill="#b89cff"/>`).join("");
    return `<svg class="pueblo-fondo" viewBox="0 0 1024 768" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="cieloP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".45" stop-color="#e8f7ff"/></linearGradient></defs>
      <rect width="1024" height="768" fill="url(#cieloP)"/>
      <circle cx="890" cy="120" r="46" fill="#fff3b0"/><circle cx="890" cy="120" r="34" fill="#ffd96a"/>
      <path d="M0 330Q140 250 300 300Q430 240 560 290Q720 230 860 285Q960 250 1024 280V768H0Z" fill="#b9e58a"/>
      <path d="M0 380Q200 320 380 370Q560 330 740 372Q900 340 1024 360V768H0Z" fill="#9fd96f"/>
      <path d="M0 440Q260 400 520 440Q780 410 1024 430V768H0Z" fill="#8fd062"/>
      ${camino("M512 768C500 700 430 660 470 600C500 560 560 540 520 470C500 430 505 400 510 370", 58, 44)}
      ${camino("M478 590C400 560 300 540 200 480", 36, 24)}
      ${camino("M530 520C600 500 680 480 770 470", 34, 22)}
      <ellipse cx="850" cy="606" rx="170" ry="62" fill="#e9d6a2"/><ellipse cx="850" cy="604" rx="156" ry="52" fill="#56b8ec"/>
      <ellipse class="agua" cx="820" cy="596" rx="90" ry="20" fill="#86d0f5"/>
      ${arbol(156, 346, 30)}${arbol(646, 318, 28)}${arbol(972, 394, 32)}${arbol(212, 690, 28)}${arbol(620, 650, 26)}
      ${flores}
    </svg>`;
  },
};

/* ---------- Álbum de colección ---------- */
Juego.album = function () {
  const e = Estado.data;
  const TESOROS = ["🌟", "🔮", "🍀", "🐚", "🦴", "🗿", "🎏", "🪶", "🧿", "🏺", "🗺️", "💰", "💎"];
  const fichas = (lista, tiene) => lista.map(x => `<div class="album-ficha ${tiene(x) ? "si" : ""}">${tiene(x) ? x : "?"}</div>`).join("");
  const peces = DATA.peces || [];
  const pezEmoji = p => p.emoji || p;
  const caps = DATA.aventuras.filter(a => a.tipo === "historia");
  app().innerHTML = `
    ${barra()}
    <div class="escena album">
      <button class="volver" onclick="Juego.volver()">← Volver</button>
      <h1>Álbum de Pelu</h1>
      <p class="sub">Todo lo que has descubierto. ¡Completa cada página!</p>
      <section class="album-seccion"><h2>Tesoros secretos <span class="num">${TESOROS.filter(t => e.coleccion.includes(t)).length}/${TESOROS.length}</span></h2>
        <div class="album-grid">${fichas(TESOROS, t => e.coleccion.includes(t))}</div></section>
      <section class="album-seccion"><h2>Peces del lago <span class="num">${(e.coleccionPeces || []).length}/${peces.length}</span></h2>
        <div class="album-grid">${fichas(peces.map(pezEmoji), p => (e.coleccionPeces || []).includes(p))}</div></section>
      <section class="album-seccion"><h2>Historias leídas <span class="num">${caps.filter(c => Juego.retoHecho(c.capitulo || c.id)).length}/${caps.length}</span></h2>
        <div class="album-caps">${caps.map(c => `<div class="album-cap ${Juego.retoHecho(c.capitulo || c.id) ? "si" : ""}">
          <span>${Juego.retoHecho(c.capitulo || c.id) ? Arte.icono("check", "#22a86c", 18, 3) : Arte.icono("candado", "#b3a6ba", 18)}</span>${c.nombre}</div>`).join("")}</div></section>
    </div>`;
};

if (typeof window !== "undefined") { window.Pueblo = Pueblo; window.Misiones = Misiones; }
