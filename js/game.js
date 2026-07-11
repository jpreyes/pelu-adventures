/* ============================================================
   PELU ADVENTURES — Lógica del juego
   Sin librerías. Funciona abriendo index.html en el navegador.
   El progreso se guarda solo en este equipo (localStorage).
   ============================================================ */

/* ---------- Perfiles (varias jugadoras en el mismo equipo) ---------- */
const Perfil = {
  K_LISTA: "pelu_perfiles",
  K_ACTUAL: "pelu_perfil_actual",
  lista() { try { return JSON.parse(localStorage.getItem(this.K_LISTA)) || []; } catch (e) { return []; } },
  actual() { return localStorage.getItem(this.K_ACTUAL) || null; },
  clave() { return "pelu_save_v1_" + (this.actual() || "default"); },
  guardarLista(l) { localStorage.setItem(this.K_LISTA, JSON.stringify(l)); },
  crear(nombre) {
    nombre = (nombre || "").trim().slice(0, 14) || "Jugadora";
    const l = this.lista();
    if (!l.includes(nombre)) { l.push(nombre); this.guardarLista(l); }
    this.elegir(nombre);
  },
  elegir(nombre) { localStorage.setItem(this.K_ACTUAL, nombre); },
  borrar(nombre) {
    this.guardarLista(this.lista().filter(n => n !== nombre));
    localStorage.removeItem("pelu_save_v1_" + nombre);
    if (this.actual() === nombre) localStorage.removeItem(this.K_ACTUAL);
  },
};

/* ---------- Estado y guardado ---------- */
const Estado = {
  data: null,

  nuevo() {
    return {
      estrellas: 20,                 // monedas iniciales para empezar a jugar
      edad: 9,                       // ajusta la dificultad; crece con ella
      poseidos: {                    // ids de cosas desbloqueadas
        ropa: DATA.ropa.filter(x => x.inicial).map(x => x.id),
        muebles: DATA.muebles.filter(x => x.inicial).map(x => x.id),
        mascotas: DATA.mascotas.filter(x => x.inicial).map(x => x.id),
        lugares: DATA.lugares.filter(x => x.desbloqueado).map(x => x.id),
      },
      vestido: { sombrero: "gorro_estrella", collar: "lazo_rosa", gafas: null, mochila: null },
      habitacion: ["cama", "alfombra"],   // muebles colocados en la casa
      posiciones: {},                     // key -> {x,y} en % dentro de la casa (arrastre libre)
      aventurasHechas: {},                // id -> veces completada
      coleccion: [],                      // tesoros secretos encontrados
      coleccionPeces: [],                 // especies de peces atrapadas (emoji)
    };
  },

  cargar() {
    try {
      const raw = localStorage.getItem(Perfil.clave());
      this.data = raw ? JSON.parse(raw) : this.nuevo();
    } catch (e) {
      this.data = this.nuevo();
    }
    // Asegura campos nuevos si el save es viejo
    const base = this.nuevo();
    for (const k in base) if (!(k in this.data)) this.data[k] = base[k];
  },

  guardar() {
    localStorage.setItem(Perfil.clave(), JSON.stringify(this.data));
  },

  reiniciar() {
    this.data = this.nuevo();
    this.guardar();
  },

  tiene(cat, id) { return this.data.poseidos[cat].includes(id); },

  comprar(cat, item) {
    if (this.tiene(cat, item.id)) return "ya";
    if (this.data.estrellas < item.precio) return "sin_dinero";
    this.data.estrellas -= item.precio;
    this.data.poseidos[cat].push(item.id);
    this.guardar();
    return "ok";
  },

  ganar(estrellas) {
    this.data.estrellas += estrellas;
    this.guardar();
  },
};

/* ---------- Utilidades ---------- */
const $ = sel => document.querySelector(sel);
const app = () => document.getElementById("app");
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
const buscar = (arr, id) => arr.find(x => x.id === id);

// Devuelve n opciones numéricas distintas (incluye la respuesta), mezcladas.
// Siempre termina: acota los intentos y rellena si faltan (evita congelarse
// con respuestas chicas como 0 o 1).
function opcionesNumericas(respuesta, n = 4) {
  const set = new Set([respuesta]);
  const rango = Math.max(3, Math.round(Math.abs(respuesta) * 0.25));
  let intentos = 0;
  while (set.size < n && intentos++ < 60) {
    const d = respuesta + (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * rango));
    if (d >= 0 && d !== respuesta) set.add(d);
  }
  for (let d = 0; set.size < n; d++) if (d !== respuesta) set.add(d);
  return shuffle([...set]);
}

function confeti() {
  const cap = document.getElementById("confeti");
  const emojis = ["⭐", "✨", "💖", "🌟", "🎉", "🌈"];
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span");
    s.textContent = rnd(emojis);
    s.className = "confeti-pieza";
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 0.4 + "s";
    s.style.fontSize = 18 + Math.random() * 22 + "px";
    cap.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("ver"), 10);
  setTimeout(() => { t.classList.remove("ver"); setTimeout(() => t.remove(), 300); }, 2200);
}

/* ---------- Barra superior ---------- */
function barra() {
  return `
    <div class="barra">
      <button class="btn-redondo" onclick="Juego.mapa()">🗺️</button>
      <div class="monedas">⭐ <span>${Estado.data.estrellas}</span></div>
      <button class="btn-redondo" onclick="Juego.ajustes()">⚙️</button>
    </div>`;
}

/* ---------- Dibujo de Pelu vestida (gatita blanca SVG + accesorios) ---------- */
function dibujarPelu(tam = 120, expresion = "feliz") {
  const v = Estado.data.vestido;
  const e = id => { const r = buscar(DATA.ropa, id); return r ? r.emoji : ""; };
  const acc = (emoji, cls, frac, top, left = 50) => emoji
    ? `<span class="acc ${cls}" style="font-size:${tam * frac}px;top:${tam * top}px;left:${left}%">${emoji}</span>`
    : "";
  return `
    <div class="pelu" style="width:${tam}px;height:${tam * 1.12}px">
      ${acc(e(v.mochila), "a-mochila", 0.34, 0.45, 16)}
      <div class="pelu-svg" style="width:${tam}px">${PeluSprite.svg(expresion)}</div>
      ${acc(e(v.sombrero), "a-sombrero", 0.46, -0.06, 50)}
      ${acc(e(v.gafas),    "a-gafas",    0.36,  0.30, 50)}
      ${acc(e(v.collar),   "a-collar",   0.36,  0.78, 50)}
    </div>`;
}

/* ============================================================
   ROUTER DE ESCENAS
   ============================================================ */
const Juego = {

  iniciar() {
    if (!Perfil.actual()) return this.perfiles();
    Estado.cargar();
    this.mapa();
  },

  /* ---------- PERFILES (varias jugadoras) ---------- */
  perfiles() {
    const l = Perfil.lista();
    const cards = l.map(n => `
      <div class="perfil-card" onclick="Juego.entrarPerfil('${encodeURIComponent(n)}')">
        <div class="perfil-avatar">🐱</div>
        <div class="perfil-nombre">${n}</div>
        <button class="perfil-x" onclick="event.stopPropagation();Juego.borrarPerfil('${encodeURIComponent(n)}')">✕</button>
      </div>`).join("");
    app().innerHTML = `
      <div class="escena perfiles-escena">
        <div class="saludo"><div class="pelu-svg" style="width:90px;margin:0 auto">${PeluSprite.svg()}</div>
          <h1>Pelu Adventures</h1>
          <p class="sub">¿Quién va a jugar hoy? 💖</p>
        </div>
        <div class="grid-perfiles">${cards}
          <div class="perfil-card nuevo" onclick="Juego.nuevoPerfil()">
            <div class="perfil-avatar">➕</div>
            <div class="perfil-nombre">Nueva jugadora</div>
          </div>
        </div>
      </div>`;
  },

  nuevoPerfil() {
    app().innerHTML = `
      <div class="escena perfiles-escena">
        <h1>¿Cómo te llamas? ✨</h1>
        <div class="pelu-svg" style="width:90px;margin:10px auto">${PeluSprite.svg("feliz")}</div>
        <input id="nombre-input" class="nombre-input" maxlength="14" placeholder="Tu nombre" autocomplete="off" />
        <div class="botones-final">
          <button class="btn grande" onclick="Juego.crearPerfil()">¡Empezar! 🌟</button>
          <button class="btn" onclick="Juego.perfiles()">← Volver</button>
        </div>
      </div>`;
    const inp = document.getElementById("nombre-input");
    if (inp) { inp.focus(); inp.addEventListener("keydown", e => { if (e.key === "Enter") Juego.crearPerfil(); }); }
  },

  crearPerfil() {
    const inp = document.getElementById("nombre-input");
    Perfil.crear(inp ? inp.value : "Jugadora");
    Estado.cargar();
    confeti();
    this.mapa();
  },

  entrarPerfil(n) { Perfil.elegir(decodeURIComponent(n)); Estado.cargar(); this.mapa(); },

  borrarPerfil(n) {
    n = decodeURIComponent(n);
    if (confirm(`¿Borrar a ${n} y su progreso?`)) { Perfil.borrar(n); this.perfiles(); }
  },

  /* ---------- MAPA DEL MUNDO (tarjetas) ---------- */
  mapa() {
    // por si venimos de un juego Phaser, aseguramos ver el menu HTML
    const ph = document.getElementById("juego-phaser");
    if (ph) { ph.style.display = "none"; ph.innerHTML = ""; }
    document.getElementById("app").style.display = "";

    const lugares = DATA.lugares.map(l => {
      const abierto = Estado.tiene("lugares", l.id);
      return `
        <div class="lugar ${abierto ? "" : "cerrado"}" style="background:${l.color}"
             onclick="Juego.${abierto ? `entrar('${l.id}')` : `desbloquearLugar('${l.id}')`}">
          <div class="lugar-emoji">${l.emoji}</div>
          <div class="lugar-nombre">${l.nombre}</div>
          ${abierto ? "" : `<div class="candado">🔒 ${l.precio}⭐</div>`}
        </div>`;
    }).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <div class="saludo">
          ${dibujarPelu(90)}
          <h1>El Mundo de Pelu</h1>
          <p class="sub">¿A dónde vamos hoy, exploradora? 🧭</p>
        </div>
        <div class="grid-lugares">${lugares}</div>
      </div>`;
  },

  desbloquearLugar(id) {
    const l = buscar(DATA.lugares, id);
    if (Estado.data.estrellas < l.precio) {
      toast("Te faltan estrellas ⭐ ¡Vamos a una aventura!");
      return;
    }
    Estado.data.estrellas -= l.precio;
    Estado.data.poseidos.lugares.push(id);
    Estado.guardar();
    confeti();
    toast(`¡Descubriste ${l.nombre}! 🎉`);
    this.mapa();
  },

  /* ---------- ENTRAR A UN LUGAR ---------- */
  entrar(id) {
    if (id === "casa")   return this.casa();
    if (id === "tienda") return this.tienda("ropa");
    return this.lugar(id);
  },

  // Lugar genérico con sus aventuras
  lugar(id) {
    const l = buscar(DATA.lugares, id);
    const avs = DATA.aventuras.filter(a => a.lugar === id);
    const tarjetas = avs.map(a => {
      const hechas = Estado.data.aventurasHechas[a.id] || 0;
      return `
        <div class="aventura" onclick="Aventura.empezar('${a.id}')">
          <div class="aventura-emoji">${a.emoji}</div>
          <div>
            <div class="aventura-nombre">${a.nombre}</div>
            <div class="aventura-tag tag-${a.tipo}">${this.nombreTipo(a.tipo)}</div>
          </div>
          ${hechas ? `<div class="hechas">✓${hechas}</div>` : `<div class="nueva">¡Nueva!</div>`}
        </div>`;
    }).join("") || `<p class="sub">Aún no hay aventuras aquí… ¡pronto habrá más! ✨</p>`;

    app().innerHTML = `
      ${barra()}
      <div class="escena" style="background:${l.color}">
        <button class="volver" onclick="Juego.mapa()">← Mapa</button>
        <div class="lugar-cabecera">
          <span class="lugar-emoji-grande">${l.emoji}</span>
          <h1>${l.nombre}</h1>
        </div>
        <h2>Aventuras</h2>
        <div class="lista-aventuras">${tarjetas}</div>
      </div>`;
  },

  nombreTipo(t) {
    return ({
      matematicas: "🔢 Números",
      ingles: "🇬🇧 Inglés",
      logica: "🧩 Lógica",
      dinero: "💰 Monedas",
      decision: "💗 Corazón",
      plataformas: "🏃‍♀️ Acción",
      carrera: "🚲 Carrera",
      cocina: "🍳 Cocina",
      pesca: "🎣 Pesca",
      buceo: "🤿 Buceo",
      escape: "🧩 Misterio",
    })[t] || t;
  },

  /* ---------- CASA: 3 habitaciones, objetos arrastrables ---------- */
  casa() {
    const P = Estado.data.posiciones;
    // objeto arrastrable: pos guardada o default
    const obj = (tipo, id, contenido, defX, defY, extra = "") => {
      const key = tipo + ":" + id;
      const p = P[key] || { x: defX, y: defY };
      return `<div class="obj-casa ${extra}" data-key="${key}" data-tipo="${tipo}" data-id="${id}"
                style="left:${p.x}%;top:${p.y}%">${contenido}</div>`;
    };

    const muebles = Estado.data.habitacion.map((id, i) => {
      const m = buscar(DATA.muebles, id);
      const dx = 10 + (i % 3) * 30 + (i % 2) * 6, dy = 40 + (Math.floor(i / 3) % 3) * 16;
      return obj("mueble", id, `<span class="emo-mueble">${m.emoji}</span>`, dx, dy);
    }).join("");

    const mascotas = Estado.data.poseidos.mascotas.map((id, i) => {
      const m = buscar(DATA.mascotas, id);
      return obj("mascota", id, `<span class="emo-mascota">${m.emoji}</span>`, 16 + i * 16, 82, "mascota-anim");
    }).join("");

    const pk = Estado.data.posiciones["pelu:pelu"] || { x: 50, y: 55 };

    app().innerHTML = `
      ${barra()}
      <div class="escena casa">
        <button class="volver" onclick="Juego.mapa()">← Mapa</button>
        <h1>Casa de Pelu 🏠</h1>

        <div class="casa-tablero" id="casa-tablero">
          <div class="cuarto-bg r1"><span class="cuarto-nombre">Dormitorio</span></div>
          <div class="cuarto-bg r2"><span class="cuarto-nombre">Living</span></div>
          <div class="cuarto-bg r3"><span class="cuarto-nombre">Jardín</span></div>
          <div class="burbuja" id="burbuja-pelu"></div>
          ${muebles}
          ${mascotas}
          <div class="obj-casa pelu-obj" id="pelu-casa" data-key="pelu:pelu" data-tipo="pelu" data-id="pelu"
               style="left:${pk.x}%;top:${pk.y}%">${dibujarPelu(64)}</div>
        </div>

        <p class="sub casa-pista">Arrastra a Pelu, sus mascotas y los muebles para ordenar la casa. Tócalos para que reaccionen 🐾</p>
        <div class="acciones-casa mimos">
          <button class="btn" onclick="Juego.mimo('acariciar')">🤍 Acariciar</button>
          <button class="btn" onclick="Juego.mimo('premio')">🍪 Premio</button>
          <button class="btn" onclick="Juego.mimo('jugar')">🧶 Jugar</button>
        </div>
        <div class="acciones-casa">
          <button class="btn grande" onclick="Juego.closet()">👗 Vestir a Pelu</button>
          <button class="btn grande" onclick="Juego.decorar()">🛋️ Decorar</button>
        </div>
      </div>`;

    this._initArrastreCasa();
  },

  /* ---------- Arrastrar / ordenar los objetos de la casa ---------- */
  _initArrastreCasa() {
    const cont = document.getElementById("casa-tablero");
    if (!cont) return;
    let drag = null;
    cont.querySelectorAll(".obj-casa").forEach(el => {
      el.addEventListener("pointerdown", e => {
        e.preventDefault();
        drag = { el, key: el.dataset.key, moved: false, sx: e.clientX, sy: e.clientY };
        el.setPointerCapture(e.pointerId);
        el.classList.add("arrastrando");
      });
      el.addEventListener("pointermove", e => {
        if (!drag || drag.el !== el) return;
        if (Math.abs(e.clientX - drag.sx) > 5 || Math.abs(e.clientY - drag.sy) > 5) drag.moved = true;
        const r = cont.getBoundingClientRect();
        const x = Math.max(5, Math.min(95, (e.clientX - r.left) / r.width * 100));
        const y = Math.max(12, Math.min(92, (e.clientY - r.top) / r.height * 100));
        el.style.left = x + "%"; el.style.top = y + "%";
        drag.x = x; drag.y = y;
      });
      const fin = () => {
        if (!drag || drag.el !== el) return;
        el.classList.remove("arrastrando");
        if (drag.moved) {
          Estado.data.posiciones[drag.key] = { x: drag.x, y: drag.y };
          Estado.guardar();
        } else {
          this._tapObjeto(el.dataset.tipo, el.dataset.id, el);
        }
        drag = null;
      };
      el.addEventListener("pointerup", fin);
      el.addEventListener("pointercancel", fin);
    });
  },

  _tapObjeto(tipo, id, el) {
    if (tipo === "pelu") this.reaccionPelu(el);
    else if (tipo === "mascota") this.reaccionMascota(id, el);
    else if (tipo === "mueble") this.reaccionMueble(id, el);
  },

  /* ---------- Interacciones de la casa ---------- */
  _peluExpr(expresion) {
    const el = document.getElementById("pelu-casa");
    if (el) el.innerHTML = dibujarPelu(64, expresion);
  },
  burbuja(texto, el) {
    const cont = document.getElementById("casa-tablero");
    const b = document.getElementById("burbuja-pelu");
    if (!b || !cont) return;
    b.textContent = texto;
    if (el) {
      const r = cont.getBoundingClientRect(), er = el.getBoundingClientRect();
      b.style.left = ((er.left + er.width / 2 - r.left) / r.width * 100) + "%";
      b.style.top = Math.max(1, (er.top - r.top) / r.height * 100 - 6) + "%";
    }
    b.classList.add("ver");
    clearTimeout(this._burbTO);
    this._burbTO = setTimeout(() => b.classList.remove("ver"), 1800);
  },
  flotar(emojis, el) {
    const cont = document.getElementById("casa-tablero");
    if (!cont) return;
    let baseX = 50, baseY = 50;
    if (el) { const r = cont.getBoundingClientRect(), er = el.getBoundingClientRect();
      baseX = (er.left + er.width / 2 - r.left) / r.width * 100;
      baseY = (er.top - r.top) / r.height * 100; }
    emojis.forEach((em, i) => {
      const s = document.createElement("span");
      s.className = "mimo-emoji"; s.textContent = em;
      s.style.left = Math.max(2, Math.min(94, baseX - 6 + Math.random() * 12)) + "%";
      s.style.top = baseY + "%";
      s.style.animationDelay = i * 0.08 + "s";
      cont.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    });
  },
  saltoPelu() {
    const el = document.getElementById("pelu-casa");
    if (!el) return;
    el.classList.remove("brinca"); void el.offsetWidth; el.classList.add("brinca");
  },
  peluEl() { return document.getElementById("pelu-casa"); },

  reaccionPelu(el) {
    const frases = ["¡Miau! 😽", "prrr… 😻", "¡Me encanta estar contigo! 💕", "¿Jugamos? 🐾", "¡Hola! 🐱"];
    this.burbuja(rnd(frases), el || this.peluEl());
    this.flotar(["💕", "✨", "😽"], el || this.peluEl());
    this._peluExpr("feliz"); this.saltoPelu();
  },
  reaccionMascota(id, el) {
    const m = buscar(DATA.mascotas, id);
    const sonidos = { perrito: "¡Guau! 🐶", conejo: "¡Boing! 🐰", pajaro: "¡Pío pío! 🐤",
      tortuga: "…lento pero feliz 🐢", unicornio: "✨¡Magia!✨ 🦄", mariposa: "flap flap 🦋" };
    this.burbuja(sonidos[id] || `¡${m.nombre}! 💗`, el);
    this.flotar([m.emoji, "💗"], el);
  },
  reaccionMueble(id, el) {
    const react = {
      tele: ["¡Dibujos animados! 🎬", "📺✨"], planta: ["La plantita crece 🌱", "🌿✨"],
      lampara: ["¡Luz calentita! 💡", "✨"], sillon: ["¡Qué cómodo! 😌", "💤"],
      cama: ["Zzz… siesta 😴", "💤💤"], piano: ["♪ ♫ ¡Música! 🎶", "🎵🎶"],
      pecera: ["Glup glup 🐠", "💧🫧"], globos: ["¡Fiesta! 🎉", "🎈🎈"],
      libros: ["A leer un cuento 📖", "📚✨"], cuadro: ["Qué bonito 🖼️", "✨"],
      mesa: ["La mesita 🪑", "✨"], alfombra: ["Suavecita 🧶", "✨"],
    };
    const r = react[id] || ["✨", "✨"];
    if (r[0]) this.burbuja(r[0], el);
    this.flotar(r[1].split(""), el);
  },
  mimo(tipo) {
    const p = this.peluEl();
    if (tipo === "acariciar") { this.burbuja("¡Prrr, qué rico! 😽", p); this.flotar(["🤍", "💕", "✨"], p); this._peluExpr("feliz"); }
    else if (tipo === "premio") { this.burbuja("¡Ñam ñam! 😋", p); this.flotar(["🍪", "😋", "💛"], p); this._peluExpr("sorpresa"); }
    else if (tipo === "jugar") { this.burbuja("¡Yupi, a jugar! 🧶", p); this.flotar(["🧶", "🐾", "🎉"], p); this._peluExpr("guino"); }
    this.saltoPelu();
    clearTimeout(this._exprTO);
    this._exprTO = setTimeout(() => this._peluExpr("feliz"), 1600);
  },

  /* ---------- CLÓSET: vestir a Pelu ---------- */
  closet() {
    const slots = ["sombrero", "gafas", "collar", "mochila"];
    const seccion = slots.map(slot => {
      const items = DATA.ropa.filter(r => r.slot === slot && Estado.tiene("ropa", r.id));
      const ninguno = `<div class="opcion-ropa ${!Estado.data.vestido[slot] ? "activa" : ""}"
                        onclick="Juego.ponerRopa('${slot}', null)">🚫</div>`;
      const ops = items.map(r => `
        <div class="opcion-ropa ${Estado.data.vestido[slot] === r.id ? "activa" : ""}"
             onclick="Juego.ponerRopa('${slot}','${r.id}')" title="${r.nombre}">${r.emoji}</div>`).join("");
      return `<div class="fila-slot"><div class="slot-nombre">${this.iconoSlot(slot)}</div>
              <div class="opciones-ropa">${ninguno}${ops}</div></div>`;
    }).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <button class="volver" onclick="Juego.casa()">← Casa</button>
        <h1>Vestidor de Pelu 👗</h1>
        <div class="preview-pelu">${dibujarPelu(150)}</div>
        ${seccion}
        <button class="btn" onclick="Juego.tienda('ropa')">🛍️ Comprar más ropa</button>
      </div>`;
  },

  iconoSlot(s) {
    return ({ sombrero: "🎩 Cabeza", gafas: "🕶️ Cara", collar: "🎀 Cuello", mochila: "🎒 Espalda" })[s];
  },

  ponerRopa(slot, id) {
    Estado.data.vestido[slot] = id;
    Estado.guardar();
    this.closet();
  },

  /* ---------- DECORAR: poner/quitar muebles ---------- */
  decorar() {
    const propios = DATA.muebles.filter(m => Estado.tiene("muebles", m.id));
    const items = propios.map(m => {
      const puesto = Estado.data.habitacion.includes(m.id);
      return `<div class="opcion-mueble ${puesto ? "activa" : ""}"
               onclick="Juego.toggleMueble('${m.id}')" title="${m.nombre}">
               ${m.emoji}<span class="check">${puesto ? "✓" : "+"}</span></div>`;
    }).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <button class="volver" onclick="Juego.casa()">← Casa</button>
        <h1>Decorar la Casa 🛋️</h1>
        <p class="sub">Toca un mueble para ponerlo o quitarlo.</p>
        <div class="habitacion mini">
          <div class="muebles">${Estado.data.habitacion.map(id => buscar(DATA.muebles, id).emoji).join("")}</div>
          <div class="pelu-en-casa">${dibujarPelu(70)}</div>
        </div>
        <div class="grid-muebles">${items}</div>
        <button class="btn" onclick="Juego.tienda('muebles')">🛍️ Comprar más muebles</button>
      </div>`;
  },

  toggleMueble(id) {
    const h = Estado.data.habitacion;
    const i = h.indexOf(id);
    if (i >= 0) h.splice(i, 1); else h.push(id);
    Estado.guardar();
    this.decorar();
  },

  /* ---------- TIENDA ---------- */
  tienda(cat) {
    const cats = [["ropa", "👗 Ropa"], ["muebles", "🛋️ Muebles"], ["mascotas", "🐾 Mascotas"]];
    const tabs = cats.map(([c, n]) =>
      `<button class="tab ${c === cat ? "activa" : ""}" onclick="Juego.tienda('${c}')">${n}</button>`).join("");

    const fuente = { ropa: DATA.ropa, muebles: DATA.muebles, mascotas: DATA.mascotas }[cat];
    const items = fuente.map(item => {
      const tiene = Estado.tiene(cat, item.id);
      const puede = Estado.data.estrellas >= item.precio;
      return `
        <div class="producto ${tiene ? "comprado" : ""}">
          <div class="producto-emoji">${item.emoji}</div>
          <div class="producto-nombre">${item.nombre}</div>
          ${tiene
            ? `<div class="etiqueta-tengo">✓ Lo tienes</div>`
            : `<button class="btn-comprar ${puede ? "" : "no"}" onclick="Juego.comprar('${cat}','${item.id}')">⭐ ${item.precio}</button>`}
        </div>`;
    }).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <button class="volver" onclick="Juego.mapa()">← Mapa</button>
        <h1>Tienda del Pueblo 🏪</h1>
        <div class="tabs">${tabs}</div>
        <div class="grid-tienda">${items}</div>
      </div>`;
  },

  comprar(cat, id) {
    const item = buscar({ ropa: DATA.ropa, muebles: DATA.muebles, mascotas: DATA.mascotas }[cat], id);
    const r = Estado.comprar(cat, item);
    if (r === "sin_dinero") return toast("Te faltan estrellas ⭐ ¡A la aventura!");
    if (r === "ok") { confeti(); toast(`¡${item.nombre} es tuyo! 🎉`); }
    this.tienda(cat);
  },

  /* ---------- AJUSTES (para papá/mamá) ---------- */
  ajustes() {
    const e = Estado.data.edad;
    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <button class="volver" onclick="Juego.mapa()">← Mapa</button>
        <h1>Ajustes ⚙️</h1>
        <div class="ajuste">
          <p><b>Edad / dificultad:</b> ${e} ${e >= 11 ? "(nivel avanzado)" : "años"}</p>
          <p class="sub">Cambia qué tan difíciles son los números y los retos. Del 11 en adelante hay álgebra, fracciones y multi-paso. El juego crece con Celeste.</p>
          <div class="botones-edad">
            ${[4,5,6,7,8,9,10,11,12].map(n =>
              `<button class="btn-edad ${n===e?"activa":""}" onclick="Juego.setEdad(${n})">${n}</button>`).join("")}
          </div>
        </div>
        <div class="ajuste">
          <p><b>Colección de tesoros:</b> ${Estado.data.coleccion.length} encontrados ✨</p>
          <p><b>Peces atrapados:</b> ${(Estado.data.coleccionPeces||[]).join(" ") || "—"} (${(Estado.data.coleccionPeces||[]).length}/${DATA.peces.length}) 🎣</p>
        </div>
        <div class="ajuste">
          <p><b>Jugadora:</b> ${Perfil.actual() || "—"} 🐱</p>
          <button class="btn" onclick="Juego.cambiarJugadora()">🔁 Cambiar jugadora</button>
        </div>
        <div class="ajuste">
          <button class="btn rojo" onclick="Juego.confirmarReinicio()">🔄 Empezar de nuevo</button>
        </div>
      </div>`;
  },

  setEdad(n) { Estado.data.edad = n; Estado.guardar(); this.ajustes(); },

  cambiarJugadora() { this.perfiles(); },

  confirmarReinicio() {
    if (confirm("¿Borrar todo y empezar de nuevo? Se perderán las estrellas y objetos.")) {
      Estado.reiniciar();
      toast("¡Nuevo comienzo! 🌱");
      this.mapa();
    }
  },
};

/* arranque */
window.addEventListener("DOMContentLoaded", () => Juego.iniciar());
