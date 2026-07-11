/* ============================================================
   PELU ADVENTURES — El Cuarto Secreto (escape room, DOM)
   Point-and-click: observa el cuarto, toca objetos, encuentra
   3 pistas (una escondida tras una llave), descubre el codigo
   del candado y escapa. Con boton de pista para no atascarse.
   Desarrolla: observacion, logica, secuencia y descubrimiento.
   ============================================================ */

const PeluEscape = {
  s: null,

  start(lugar = "cuarto") {
    const r = n => 1 + Math.floor(Math.random() * 9); // digitos 1-9
    this.s = {
      lugar,
      d1: r(), d2: r(), d3: r(),        // codigo secreto de 3 cifras
      c1: false, c2: false, c3: false,  // pistas descubiertas
      tieneLlave: false, cajonAbierto: false,
      tesoro: false, intentos: 0, ganado: false,
    };
    this.cuarto();
  },

  salir() { Juego.entrar(this.s.lugar); },

  /* ---- Cuarto ---- */
  cuarto() {
    const s = this.s;
    const track = c => c === false ? "•" : "?"; // placeholder no usado
    const slot = (ok, d) => `<span class="pista-slot ${ok ? "ok" : ""}">${ok ? d : "?"}</span>`;

    const inv = [];
    if (s.tieneLlave) inv.push("🔑");
    if (s.tesoro) inv.push("💎");

    app().innerHTML = `
      ${barra()}
      <div class="escena escape-escena">
        <button class="volver" onclick="PeluEscape.salir()">← Salir</button>
        <h1>Cuarto Secreto 🗝️</h1>
        <div class="cuarto">
          <button class="obj" style="left:10%;top:14%"  onclick="PeluEscape.tap('cuadro')">🖼️<span>Cuadro</span></button>
          <button class="obj" style="left:74%;top:12%"  onclick="PeluEscape.tap('reloj')">🕐<span>Reloj</span></button>
          <button class="obj" style="left:12%;top:60%"  onclick="PeluEscape.tap('maceta')">🪴<span>Maceta</span></button>
          <button class="obj" style="left:42%;top:58%"  onclick="PeluEscape.tap('cajon')">🗄️<span>Cajón</span></button>
          <button class="obj grande" style="left:70%;top:52%" onclick="PeluEscape.tap('candado')">🧰<span>🔒 Cofre</span></button>
          <button class="obj" style="left:44%;top:10%"  onclick="PeluEscape.tap('puerta')">🚪<span>Puerta</span></button>
          <div class="cuarto-pelu">${dibujarPelu(64)}</div>
        </div>

        <div class="escape-info">
          <div class="pistas-track">Código: ${slot(s.c1, s.d1)} ${slot(s.c2, s.d2)} ${slot(s.c3, s.d3)}</div>
          <div class="inventario">Mochila: ${inv.length ? inv.join(" ") : "—"}</div>
        </div>
        <button class="btn" onclick="PeluEscape.pista()">💡 Pista</button>
      </div>`;
  },

  /* ---- Modal ---- */
  modal(inner) {
    const d = document.createElement("div");
    d.className = "escape-modal";
    d.innerHTML = `<div class="escape-modal-caja">${inner}
      <button class="btn cerrar-modal" onclick="this.closest('.escape-modal').remove()">Cerrar</button></div>`;
    document.body.appendChild(d);
  },
  cerrarModales() { document.querySelectorAll(".escape-modal").forEach(m => m.remove()); },

  /* ---- Interacciones ---- */
  tap(id) {
    const s = this.s;
    if (id === "cuadro") {
      s.c1 = true;
      this.modal(`<h2>El Cuadro 🖼️</h2><div class="cuadro-arte">${"⭐".repeat(s.d1)}</div>
        <p>Cuentas <b>${s.d1}</b> estrellas.<br>La <b>1ª cifra</b> del código es <b>${s.d1}</b>.</p>`);
      this.cuarto();
    } else if (id === "reloj") {
      s.c2 = true;
      this.modal(`<h2>El Reloj 🕐</h2><div class="reloj-arte">🕐</div>
        <p>El reloj marca las <b>${s.d2}</b> en punto.<br>La <b>2ª cifra</b> es <b>${s.d2}</b>.</p>`);
      this.cuarto();
    } else if (id === "maceta") {
      if (!s.tieneLlave) {
        s.tieneLlave = true;
        confeti();
        this.modal(`<h2>La Maceta 🪴</h2><div class="cuadro-arte">🔑</div>
          <p>¡Escondida en la tierra había una <b>llave 🔑</b>! Va a tu mochila.</p>`);
      } else {
        this.modal(`<h2>La Maceta 🪴</h2><p>Ya buscaste aquí. Solo tierra y una plantita feliz 🌱.</p>`);
      }
      this.cuarto();
    } else if (id === "cajon") {
      if (!s.tieneLlave) {
        this.modal(`<h2>El Cajón 🗄️</h2><p>Está cerrado con llave 🔒. Busca una <b>llave</b> por el cuarto…</p>`);
      } else if (!s.cajonAbierto) {
        s.cajonAbierto = true; s.c3 = true; s.tesoro = true;
        confeti();
        this.modal(`<h2>¡Abriste el Cajón! 🗄️🔑</h2>
          <p>Dentro hay un papelito: <span class="nota">"La última cifra es <b>${s.d3}</b>"</span></p>
          <p>Y un <b>tesoro 💎</b> escondido. ¡A la mochila!</p>`);
      } else {
        this.modal(`<h2>El Cajón 🗄️</h2><p>Ya lo abriste. La última cifra es <b>${s.d3}</b>.</p>`);
      }
      this.cuarto();
    } else if (id === "candado") {
      this.teclado();
    } else if (id === "puerta") {
      if (s.ganado) this.escapar();
      else this.modal(`<h2>La Puerta 🚪</h2><p>Está cerrada. Abre el <b>cofre 🔒</b> con el código de 3 cifras para conseguir la llave dorada.</p>`);
    }
  },

  /* ---- Teclado del candado ---- */
  teclado(valor = "") {
    this.cerrarModales();
    const s = this.s;
    const nums = [1,2,3,4,5,6,7,8,9,0].map(n =>
      `<button class="tecla" onclick="PeluEscape.teclear(${n})">${n}</button>`).join("");
    this.modal(`
      <h2>El Cofre 🔒</h2>
      <p>Escribe el código de 3 cifras (mira las pistas).</p>
      <div class="display-codigo" id="codigo-display">${(valor + "___").slice(0, 3).split("").join(" ")}</div>
      <div class="keypad">${nums}</div>
      <div class="keypad-acciones">
        <button class="btn" onclick="PeluEscape.borrar()">⌫ Borrar</button>
        <button class="btn grande" onclick="PeluEscape.probarCodigo()">Probar ✓</button>
      </div>`);
    this._codigo = valor;
    this._pintarCodigo();
  },
  _pintarCodigo() {
    const d = document.getElementById("codigo-display");
    if (d) d.textContent = ((this._codigo || "") + "___").slice(0, 3).split("").join(" ");
  },
  teclear(n) { if ((this._codigo || "").length < 3) { this._codigo = (this._codigo || "") + n; this._pintarCodigo(); } },
  borrar() { this._codigo = (this._codigo || "").slice(0, -1); this._pintarCodigo(); },

  probarCodigo() {
    const s = this.s;
    const correcto = "" + s.d1 + s.d2 + s.d3;
    if ((this._codigo || "").length < 3) { toast("Faltan cifras 🔢"); return; }
    s.intentos++;
    if (this._codigo === correcto) {
      this.cerrarModales();
      s.ganado = true;
      confeti();
      this.modal(`<h2>¡CLIC! 🔓</h2><div class="cuadro-arte">🧰✨🗝️</div>
        <p>El cofre se abre y dentro está la <b>llave dorada 🗝️</b>.<br>¡Ahora toca la <b>puerta 🚪</b> para escapar!</p>`);
      this.cuarto();
    } else {
      toast(rnd(["Mmm, no abre 🔒", "Ese no es… revisa las pistas 👀", "Casi, ¡inténtalo otra vez! 🌱"]));
      this._codigo = "";
      this._pintarCodigo();
    }
  },

  /* ---- Pista contextual ---- */
  pista() {
    const s = this.s;
    let msg;
    if (!s.c1) msg = "¿Y si miras bien el 🖼️ cuadro? Cuenta lo que hay dibujado.";
    else if (!s.c2) msg = "El 🕐 reloj de la pared marca una hora… es una cifra.";
    else if (!s.tieneLlave) msg = "Falta una pista escondida. Revisa la 🪴 maceta a fondo.";
    else if (!s.cajonAbierto) msg = "Ya tienes la 🔑 llave. ¡Ábre el 🗄️ cajón!";
    else if (!s.ganado) msg = `Ya tienes las 3 cifras (${s.d1}${s.d2}${s.d3}). Ponlas en el 🔒 cofre.`;
    else msg = "¡Toca la 🚪 puerta para escapar!";
    this.modal(`<h2>💡 Pista</h2><p>${msg}</p>`);
  },

  /* ---- Escape / recompensa ---- */
  escapar() {
    this.cerrarModales();
    const s = this.s;
    if (s.tesoro && !Estado.data.coleccion.includes("💎")) Estado.data.coleccion.push("💎");
    const bonus = Math.max(0, 6 - (s.intentos - 1) * 2); // menos intentos = mas bonus
    const total = 10 + bonus + (s.tesoro ? 5 : 0);
    Estado.data.aventurasHechas["escapar"] = (Estado.data.aventurasHechas["escapar"] || 0) + 1;
    Estado.ganar(total);
    confeti();
    app().innerHTML = `
      ${barra()}
      <div class="escena escape-escena">
        <div class="av-final">
          <div class="escape-libre">🚪✨ ${dibujarPelu(90)} 🎉</div>
          <h1>${rnd(DATA.animos)}</h1>
          <p class="av-texto">¡Pelu resolvió el misterio y escapó del Cuarto Secreto! 🕵️‍♀️</p>
          <div class="premio">+${total} ⭐</div>
          ${s.tesoro ? `<p class="tesoro">Y se llevó un tesoro 💎</p>` : ""}
          <div class="botones-final">
            <button class="btn grande" onclick="PeluEscape.start('${s.lugar}')">🔁 Otro cuarto</button>
            <button class="btn" onclick="PeluEscape.salir()">🏡 Volver</button>
          </div>
        </div>
      </div>`;
  },
};

if (typeof window !== "undefined") window.PeluEscape = PeluEscape;
