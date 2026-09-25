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
      edad: 10,                      // ajusta la dificultad; crece con ella
      poseidos: {                    // ids de cosas desbloqueadas
        ropa: DATA.ropa.filter(x => x.inicial).map(x => x.id),
        muebles: DATA.muebles.filter(x => x.inicial).map(x => x.id),
        mascotas: DATA.mascotas.filter(x => x.inicial).map(x => x.id),
        lugares: DATA.lugares.filter(x => x.desbloqueado).map(x => x.id),
      },
      vestido: { sombrero: "gorro_estrella", collar: "lazo_rosa", gafas: null, mochila: null },
      habitacion: [],                     // muebles comprados puestos en la casa (la casa ya viene amueblada)
      casaV2: true,                       // save creado con la casa de muñecas nueva
      posiciones: {},                     // key -> {x,y} en % dentro de la casa (arrastre libre)
      aventurasHechas: {},                // id -> veces completada
      coleccion: [],                      // tesoros secretos encontrados
      coleccionPeces: [],                 // especies de peces atrapadas (emoji)
      historia: [],                       // capítulos de la novela completados
      historiaPagada: [],                 // capítulos cuyas estrellas ya se cobraron
      niveles: {},                        // nivel 1–10 por materia (se adapta solo; ver retos.js)
    };
  },

  cargar() {
    try {
      const raw = localStorage.getItem(Perfil.clave());
      this.data = raw ? JSON.parse(raw) : this.nuevo();
    } catch (e) {
      this.data = this.nuevo();
    }
    // Saves anteriores a "historiaPagada": lo ya leído ya se cobró
    if (!Array.isArray(this.data.historiaPagada)) this.data.historiaPagada = (this.data.historia || []).slice();
    const casaVieja = !this.data.casaV2;        // se mira ANTES de rellenar campos nuevos
    // Asegura campos nuevos si el save es viejo
    const base = this.nuevo();
    for (const k in base) if (!(k in this.data)) this.data[k] = base[k];
    // …y también dentro de "poseidos" (categorías nuevas de la tienda)
    for (const c in base.poseidos) if (!Array.isArray(this.data.poseidos[c])) this.data.poseidos[c] = base.poseidos[c];
    // Si un objeto se renombró o borró de DATA, lo quitamos para no romper la casa
    const existe = (lista, id) => lista.some(x => x.id === id);
    ["ropa", "muebles", "mascotas"].forEach(c => {
      this.data.poseidos[c] = this.data.poseidos[c].filter(id => existe(DATA[c], id));
    });
    this.data.habitacion = this.data.habitacion.filter(id => existe(DATA.muebles, id));
    // Casa de muñecas (v2): ya viene amueblada, así que la cama y alfombra iniciales sobran,
    // y las posiciones de la casa anterior (otro diseño) se reinician una sola vez.
    if (casaVieja) {
      this.data.habitacion = this.data.habitacion.filter(id => id !== "cama" && id !== "alfombra");
      Object.keys(this.data.posiciones).forEach(k => delete this.data.posiciones[k]);
      this.data.casaV2 = true;
    }
    // Abre cualquier lugar marcado como desbloqueado (para saves viejos)
    DATA.lugares.forEach(l => {
      if (l.desbloqueado && !this.data.poseidos.lugares.includes(l.id)) this.data.poseidos.lugares.push(l.id);
    });
  },

  guardar() {
    try {
      localStorage.setItem(Perfil.clave(), JSON.stringify(this.data));
    } catch (e) {
      // Sin espacio o modo privado: el juego sigue, pero avisamos una vez
      if (!this._avisoGuardado) { this._avisoGuardado = true; toast("⚠️ No se pudo guardar el progreso en este equipo"); }
    }
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
// Escapa texto del usuario (nombres) antes de meterlo en HTML
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

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
      <button class="btn-redondo" onclick="Juego.inicio()" aria-label="Ir al pueblo">${Arte.icono("casa", "#6a45d4", 24)}</button>
      <div class="monedas">${Arte.estrella(24)}<span>${Estado.data.estrellas}</span></div>
      <div class="barra-der">
        <button class="btn-redondo" onclick="Juego.album()" aria-label="Álbum">${Arte.icono("album", "#6a45d4", 24)}</button>
        <button class="btn-redondo" onclick="Juego.ajustes()" aria-label="Ajustes">${Arte.icono("ajustes", "#6a45d4", 24)}</button>
      </div>
    </div>`;
}

/* ---------- Pelu vestida: gatita SVG con sus accesorios dibujados (arte.js) ---------- */
function dibujarPelu(tam = 120, expresion = "feliz") {
  const acc = Object.values(Estado.data.vestido).filter(Boolean);
  return `<div class="pelu" style="width:${tam}px">${Arte.gata("pelu", { expresion, accesorios: acc })}</div>`;
}

/* ============================================================
   ROUTER DE ESCENAS
   ============================================================ */
const Juego = {

  iniciar() {
    // Pide al navegador que no borre el progreso (Safari lo hace tras 7 días sin uso)
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    if (!Perfil.actual()) return this.perfiles();
    Estado.cargar();
    this.inicio();
  },

  // Olvida cualquier "vuelta pendiente" (a un relato o al mundo caminable).
  // Se usa en salidas deliberadas: 🏠, cambiar de jugadora.
  limpiarPendientes() {
    if (typeof Mundo !== "undefined") Mundo.pendiente = null;
    if (typeof Historia !== "undefined") Historia.esperandoJuego = false;
  },

  // Marca una aventura como jugada (quita el "¡Nueva!" de su tarjeta)
  registrarJugada(id) {
    Estado.data.aventurasHechas[id] = (Estado.data.aventurasHechas[id] || 0) + 1;
    Estado.guardar();
  },

  /* ---------- INICIO: el Pueblo ilustrado (pueblo.js) ---------- */
  origen: "pueblo",          // desde dónde se entró a un lugar: "pueblo" o "mapa" (Minijuegos)
  inicio() {
    this.limpiarPendientes();                 // salida deliberada al hub
    this.origen = "pueblo";
    Pueblo.render();
  },

  abrirMinijuegos() { this.origen = "mapa"; this.mapa(); },

  // Botón "Volver" de los lugares, la casa, el vestidor, ajustes…
  volver() { return this.origen === "mapa" ? this.mapa() : this.inicio(); },

  /* ---------- PERFILES (varias jugadoras) ---------- */
  perfiles() {
    this.limpiarPendientes();
    const l = Perfil.lista();
    // El nombre va en data-n (escapado): así un apóstrofe no rompe el onclick
    const colores = ["pelu", "luna", "mia", "nina"];
    const cards = l.map((n, i) => `
      <div class="perfil-card" data-n="${esc(n)}" onclick="Juego.entrarPerfil(this.dataset.n)">
        <div class="perfil-avatar">${Arte.cara(colores[i % 4], 64)}</div>
        <div class="perfil-nombre">${esc(n)}</div>
        <button class="perfil-x" aria-label="Borrar" onclick="event.stopPropagation();Juego.borrarPerfil(this.parentNode.dataset.n)">✕</button>
      </div>`).join("");
    app().innerHTML = `
      <div class="escena perfiles-escena">
        <div class="saludo"><div class="pelu" style="width:120px">${Arte.gata("pelu", { accesorios: ["gorro_estrella", "lazo_rosa"] })}</div>
          <h1>Pelu Adventures</h1>
          <p class="sub">¿Quién va a jugar hoy?</p>
        </div>
        <div class="grid-perfiles">${cards}
          <div class="perfil-card nuevo" onclick="Juego.nuevoPerfil()">
            <div class="perfil-avatar">${Arte.icono("mas", "#8a63f0", 44, 2.6)}</div>
            <div class="perfil-nombre">Nueva jugadora</div>
          </div>
        </div>
      </div>`;
  },

  nuevoPerfil() {
    app().innerHTML = `
      <div class="escena perfiles-escena">
        <h1>¿Cómo te llamas?</h1>
        <div class="pelu" style="width:110px;margin:10px auto">${Arte.gata("pelu", { expresion: "guino" })}</div>
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
    const nombre = ((inp ? inp.value : "") || "").trim().slice(0, 14) || "Jugadora";
    const yaExiste = Perfil.lista().includes(nombre);
    Perfil.crear(nombre);
    Estado.cargar();
    if (yaExiste) toast(`¡Hola de nuevo, ${nombre}! 💖`); else confeti();
    this.inicio();
  },

  entrarPerfil(n) { Perfil.elegir(n); Estado.cargar(); this.inicio(); },

  borrarPerfil(n) {
    if (confirm(`¿Borrar a ${n} y su progreso?`)) { Perfil.borrar(n); this.perfiles(); }
  },

  /* ---------- MINIJUEGOS (tarjetas de lugares) ----------
     explicito = la niña lo abrió (dock / Volver). Si no, venimos de terminar
     un juego y volvemos al lugar donde estaba. */
  mapa(explicito = false) {
    // por si venimos de un juego Phaser, aseguramos ver el menu HTML
    const ph = document.getElementById("juego-phaser");
    if (ph) { ph.style.display = "none"; ph.innerHTML = ""; }
    document.getElementById("app").style.display = "";
    // Si el juego estaba incrustado en una novela, volvemos al relato (no al mapa)
    if (typeof Historia !== "undefined" && Historia.esperandoJuego) {
      Historia.esperandoJuego = false;
      return Historia.reanudarDesdeJuego();
    }
    // Si veníamos del mundo caminable, regresamos ahí donde estábamos
    if (typeof Mundo !== "undefined" && Mundo.pendiente) {
      const p = Mundo.pendiente; Mundo.pendiente = null;
      return Mundo.reanudar(p);
    }
    if (!explicito && this.ultimoLugar) return this.lugar(this.ultimoLugar);
    this.origen = "mapa"; this.ultimoLugar = null;

    const lugares = DATA.lugares.map(l => {
      const abierto = Estado.tiene("lugares", l.id);
      return `
        <div class="lugar ${abierto ? "" : "cerrado"}" style="background:${l.color}"
             onclick="Juego.${abierto ? `entrar('${l.id}')` : `desbloquearLugar('${l.id}')`}">
          <div class="lugar-emoji">${Arte.lugar(l.id) || l.emoji}</div>
          <div class="lugar-nombre">${l.nombre}</div>
          ${abierto ? "" : `<div class="candado">${Arte.icono("candado", "#7d6887", 16)} ${l.precio}</div>`}
        </div>`;
    }).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <button class="volver" onclick="Juego.inicio()">← Pueblo</button>
        <div class="saludo">
          <h1>Minijuegos</h1>
          <p class="sub">Elige un lugar y entra directo a sus retos.</p>
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
    this.mapa(true);
  },

  /* ---------- ENTRAR A UN LUGAR ---------- */
  entrar(id) {
    // Si el juego estaba incrustado en una novela (cocina/escape vuelven por aquí),
    // retomamos el relato en vez de ir al lugar.
    if (typeof Historia !== "undefined" && Historia.esperandoJuego) {
      Historia.esperandoJuego = false;
      return Historia.reanudarDesdeJuego();
    }
    if (typeof Mundo !== "undefined" && Mundo.pendiente) {
      const p = Mundo.pendiente; Mundo.pendiente = null;
      return Mundo.reanudar(p);
    }
    if (id === "casa")   return this.casa();
    return this.lugar(id);             // la Tienda también: ahí vive el Mercadito
  },

  // Lugar genérico con sus aventuras
  lugar(id) {
    const l = buscar(DATA.lugares, id);
    this.ultimoLugar = id;
    const avs = DATA.aventuras.filter(a => a.lugar === id);
    const tarjetas = avs.map(a => {
      const hechas = Estado.data.aventurasHechas[a.id] || 0;
      // Desbloqueo progresivo: si "requiere" otro reto, debe estar completado
      const bloqueada = a.requiere && !this.retoHecho(a.requiere);
      if (bloqueada) {
        const req = buscar(DATA.aventuras, a.requiere);
        return `
          <div class="aventura bloqueada" onclick="Juego.avBloqueada('${req ? req.nombre : ""}')">
            <div class="aventura-emoji">${Arte.icono("candado", "#9a8aa6", 30)}</div>
            <div>
              <div class="aventura-nombre">${a.nombre}</div>
              <div class="aventura-tag tag-${a.tipo}">Termina ${req ? req.nombre : "lo anterior"} primero</div>
            </div>
          </div>`;
      }
      return `
        <div class="aventura" onclick="Aventura.empezar('${a.id}')">
          ${(d => `<div class="aventura-emoji ${d && d.oscuro ? "oscuro" : ""}">${d ? d.svg : a.emoji}</div>`)(Arte.aventura(a))}
          <div>
            <div class="aventura-nombre">${a.nombre}</div>
            <div class="aventura-tag tag-${a.tipo}">${a.etiqueta || this.nombreTipo(a.tipo)}</div>
          </div>
          ${hechas ? `<div class="hechas">✓${hechas}</div>` : `<div class="nueva">¡Nueva!</div>`}
        </div>`;
    }).join("") || `<p class="sub">Aún no hay aventuras aquí… ¡pronto habrá más! ✨</p>`;

    app().innerHTML = `
      ${barra()}
      <div class="escena" style="background:${l.color}">
        <button class="volver" onclick="Juego.ultimoLugar=null;Juego.volver()">← Volver</button>
        <div class="lugar-cabecera">
          <span class="lugar-emoji-grande">${Arte.lugar(l.id, { ancho: 88 }) || l.emoji}</span>
          <h1>${l.nombre}</h1>
        </div>
        ${id === "tienda" ? `
          <div class="acciones-casa">
            <button class="btn grande" onclick="Juego.origenTienda='lugar';Juego.tienda('ropa')">${Arte.icono("tienda", "#fff", 22)} Comprar ropa, muebles y mascotas</button>
          </div>` : ""}
        <h2>Aventuras</h2>
        <div class="lista-aventuras">${tarjetas}</div>
      </div>`;
  },

  // ¿Un reto/capítulo ya fue completado? (sirve para el desbloqueo progresivo)
  retoHecho(id) {
    if (Estado.data.historia && Estado.data.historia.includes(id)) return true;
    return (Estado.data.aventurasHechas[id] || 0) > 0;
  },

  avBloqueada(nombreReq) {
    toast(`🔒 Primero termina ${nombreReq || "el capítulo anterior"}`);
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
      historia: "📖 Historia",
    })[t] || t;
  },

  /* ---------- CASA y VESTIDOR: ver casa.js (aquí quedan los ayudantes de arrastre y reacciones) ---------- */

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

  /* ---------- TIENDA ---------- */
  tienda(cat) {
    const cats = [["ropa", "Ropa", "ropa"], ["muebles", "Muebles", "mueble"], ["mascotas", "Mascotas", "pata"]];
    const tabs = cats.map(([c, n, ico]) =>
      `<button class="tab ${c === cat ? "activa" : ""}" onclick="Juego.tienda('${c}')">${Arte.icono(ico, "currentColor", 18)} ${n}</button>`).join("");
    const dibujo = item => (cat === "ropa" ? Arte.prenda(item.id, 88) : cat === "muebles" ? Arte.mueble(item.id, { alto: 70 }) : Arte.mascota(item.id, { alto: 70 })) || item.emoji;

    const fuente = { ropa: DATA.ropa, muebles: DATA.muebles, mascotas: DATA.mascotas }[cat];
    const items = fuente.map(item => {
      const tiene = Estado.tiene(cat, item.id);
      const puede = Estado.data.estrellas >= item.precio;
      return `
        <div class="producto ${tiene ? "comprado" : ""}">
          <div class="producto-emoji">${dibujo(item)}</div>
          <div class="producto-nombre">${item.nombre}</div>
          ${tiene
            ? `<div class="etiqueta-tengo">${Arte.icono("check", "#22a86c", 18, 3)} Lo tienes</div>`
            : `<button class="btn-comprar ${puede ? "" : "no"}" onclick="Juego.comprar('${cat}','${item.id}')">${Arte.estrella(18)} ${item.precio}</button>`}
        </div>`;
    }).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena">
        <button class="volver" onclick="Juego.volverTienda()">← Volver</button>
        <h1>Tienda del Pueblo</h1>
        <div class="tabs">${tabs}</div>
        <div class="grid-tienda">${items}</div>
      </div>`;
  },

  // La tienda se abre desde la casa, el lugar Tienda o el vestidor: vuelve a donde estaba
  volverTienda() {
    const o = this.origenTienda; this.origenTienda = null;
    if (o === "casa") return Casa.abrir();
    if (o === "lugar") return this.lugar("tienda");
    return this.volver();
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
        <button class="volver" onclick="Juego.volver()">← Volver</button>
        <h1>Ajustes</h1>
        <div class="ajuste">
          <p><b>Edad / dificultad:</b> ${e} ${e >= 11 ? "(nivel avanzado)" : "años"}</p>
          <p class="sub">Define el nivel inicial de cada materia. Cambiarla reinicia los niveles de abajo.</p>
          <div class="botones-edad">
            ${[4,5,6,7,8,9,10,11,12,13].map(n =>
              `<button class="btn-edad ${n===e?"activa":""}" onclick="Juego.setEdad(${n})">${n}</button>`).join("")}
          </div>
        </div>
        <div class="ajuste">
          <p><b>Nivel de cada materia</b> (1 a 10)</p>
          <p class="sub" style="text-align:left">Sube solo con 4 o 5 respuestas correctas de 5, y baja con 2 o menos. También puedes ajustarlo aquí.</p>
          <div class="niveles-materias">
            ${Object.entries(Retos.MATERIAS).map(([m, nombre]) => {
              const nv = Retos.nivel(m);
              return `<div class="nivel-fila">
                <span class="nombre">${nombre}</span>
                <span class="nivel-barra"><i style="width:${nv * 10}%"></i></span>
                <button class="btn-edad" aria-label="Bajar nivel" onclick="Retos.setNivel('${m}', ${nv - 1}); Juego.ajustes()">−</button>
                <span class="valor">${nv}</span>
                <button class="btn-edad" aria-label="Subir nivel" onclick="Retos.setNivel('${m}', ${nv + 1}); Juego.ajustes()">+</button>
              </div>`;
            }).join("")}
          </div>
        </div>
        <div class="ajuste">
          <p><b>Jugadora:</b> ${esc(Perfil.actual() || "—")}</p>
          <button class="btn" onclick="Juego.cambiarJugadora()">Cambiar jugadora</button>
        </div>
        <div class="ajuste">
          <button class="btn rojo" onclick="Juego.confirmarReinicio()">Empezar de nuevo</button>
        </div>
      </div>`;
  },

  setEdad(n) { Estado.data.edad = n; Estado.data.niveles = {}; Estado.guardar(); this.ajustes(); },

  cambiarJugadora() { this.perfiles(); },

  confirmarReinicio() {
    if (confirm("¿Borrar todo y empezar de nuevo? Se perderán las estrellas y objetos.")) {
      Estado.reiniciar();
      toast("¡Nuevo comienzo! 🌱");
      this.inicio();
    }
  },
};

/* arranque */
window.addEventListener("DOMContentLoaded", () => Juego.iniciar());
