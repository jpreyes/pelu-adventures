/* ============================================================
   PELU ADVENTURES — Motor de Aventuras (mini-juegos)
   Cada aventura enseña una habilidad SIN sentirse como tarea:
   se viven como retos de exploración con Pelu.
   La dificultad usa Estado.data.edad para crecer con la niña.
   ============================================================ */

const Aventura = {
  actual: null,

  empezar(id) {
    this.actual = buscar(DATA.aventuras, id);
    this.intro();
  },

  // Pantalla de presentación de la aventura
  intro() {
    const a = this.actual;
    app().innerHTML = `
      ${barra()}
      <div class="escena aventura-escena">
        <button class="volver" onclick="Juego.entrar('${a.lugar}')">← Volver</button>
        <div class="av-intro">
          <div class="av-emoji-grande">${a.emoji}</div>
          <h1>${a.nombre}</h1>
          ${Retos.MATERIAS[a.tipo] ? `<div class="nivel-chip grande materia-${a.tipo}">Nivel ${Retos.nivel(a.tipo)} de 10 · ${this.PREGUNTAS_RONDA} preguntas</div>` : ""}
          <p class="av-texto">${a.intro}</p>
          ${dibujarPelu(80)}
          <button class="btn grande pulso" onclick="Aventura.jugar()">¡Empezar! ✨</button>
        </div>
      </div>`;
  },

  // Decide qué mini-juego correr según el tipo
  jugar() {
    const t = this.actual.tipo;
    if (t === "matematicas" || t === "ingles" || t === "logica" || t === "dinero") return this.ronda(t);
    if (t === "decision")    return this.decision();
    if (t === "plataformas") return PeluPlatformer.start(this.actual.lugar);
    if (t === "carrera")     return PeluRace.start(this.actual.lugar);
    if (t === "cocina")      return PeluCook.start(this.actual.lugar);
    if (t === "pesca")       return PeluFish.start(this.actual.lugar);
    if (t === "buceo")       return PeluSwim.start(this.actual.lugar);
    if (t === "escape")      return PeluEscape.start(this.actual.lugar);
    if (t === "historia")    return Historia.start(this.actual.capitulo, this.actual.lugar);
  },

  // Marco común para mostrar un reto con opciones
  pantalla({ titulo, escena, pregunta, opciones, onElegir }) {
    const ops = opciones.map((o, i) =>
      `<button class="opcion-reto" data-i="${i}">${o.etiqueta}</button>`).join("");
    app().innerHTML = `
      ${barra()}
      <div class="escena aventura-escena">
        <h1>${titulo}</h1>
        <div class="reto-escena">${escena}</div>
        <p class="reto-pregunta">${pregunta}</p>
        <div class="reto-opciones">${ops}</div>
        <div id="reto-feedback"></div>
      </div>`;
    document.querySelectorAll(".opcion-reto").forEach(btn => {
      btn.onclick = () => onElegir(parseInt(btn.dataset.i), btn);
    });
  },

  // Resultado final de la aventura
  exito(estrellas, mensajeExtra = "") {
    const a = this.actual;
    Estado.data.aventurasHechas[a.id] = (Estado.data.aventurasHechas[a.id] || 0) + 1;
    Estado.ganar(estrellas);
    confeti();
    // De vez en cuando, un tesoro secreto coleccionable
    let tesoro = "";
    // Solo tesoros que aún no tiene (la colección no se llena de repetidos)
    const faltan = ["🌟","🔮","🍀","🐚","🦴","🗿","🎏","🪶","🧿","🏺"].filter(t => !Estado.data.coleccion.includes(t));
    if (faltan.length && Math.random() < 0.3) {
      const t = rnd(faltan);
      Estado.data.coleccion.push(t);
      Estado.guardar();
      tesoro = `<p class="tesoro">¡Encontraste un tesoro secreto! ${t}</p>`;
    }
    app().innerHTML = `
      ${barra()}
      <div class="escena aventura-escena">
        <div class="av-final">
          ${dibujarPelu(110)}
          <h1>${rnd(DATA.animos)}</h1>
          ${mensajeExtra ? `<p class="av-texto">${mensajeExtra}</p>` : ""}
          <div class="premio">+${estrellas} ⭐</div>
          ${tesoro}
          <div class="botones-final">
            <button class="btn grande" onclick="Aventura.jugar()">🔁 Otra vez</button>
            <button class="btn" onclick="Juego.entrar('${a.lugar}')">🏡 Volver</button>
          </div>
        </div>
      </div>`;
  },

  // Animación de respuesta correcta/incorrecta
  feedback(btn, ok, alAcabar) {
    const fb = document.getElementById("reto-feedback");
    document.querySelectorAll(".opcion-reto").forEach(b => b.disabled = true);
    btn.classList.add(ok ? "correcta" : "incorrecta");
    fb.innerHTML = ok
      ? `<p class="msg-ok">${rnd(["¡Sí! 🎉","¡Correcto! 🌟","¡Genial! 💖"])}</p>`
      : `<p class="msg-no">${rnd(DATA.consuelos)}</p>`;
    setTimeout(alAcabar, ok ? 850 : 1400);
  },

  /* ============================================================
     RONDAS DE RETOS (matemáticas, inglés, lógica, dinero)
     5 preguntas por ronda. El nivel (1–10) de cada materia sube
     si le va muy bien y baja si le cuesta. Al equivocarse se
     muestra la respuesta correcta y POR QUÉ (se aprende del error).
     Las preguntas las genera Retos (retos.js).
     ============================================================ */
  PREGUNTAS_RONDA: 5,

  ronda(materia) {
    this.r = { materia, i: 0, aciertos: 0, racha: 0, mejorRacha: 0, marcas: [], nivel: Retos.nivel(materia) };
    this.siguientePregunta();
  },

  siguientePregunta() {
    const r = this.r, a = this.actual;
    if (r.i >= this.PREGUNTAS_RONDA) return this.finRonda();
    const q = Retos.generar(r.materia, r.nivel);
    r.q = q;
    const puntos = Array.from({ length: this.PREGUNTAS_RONDA }, (_, k) =>
      `<span class="punto ${k < r.i ? (r.marcas[k] ? "ok" : "no") : k === r.i ? "actual" : ""}"></span>`).join("");
    const largas = q.opcionesLargas || q.opciones.some(o => String(o).replace(/<[^>]+>/g, "").length > 14);
    app().innerHTML = `
      ${barra()}
      <div class="escena aventura-escena reto-ronda materia-${r.materia}">
        <div class="ronda-top">
          <button class="volver" onclick="Juego.entrar('${a.lugar}')">← Salir</button>
          <div class="ronda-puntos" aria-label="Pregunta ${r.i + 1} de ${this.PREGUNTAS_RONDA}">${puntos}</div>
          <div class="ronda-chips">
            ${r.racha >= 2 ? `<span class="racha-chip">🔥 ${r.racha}</span>` : ""}
            <span class="nivel-chip materia-${r.materia}">Nivel ${r.nivel}</span>
          </div>
        </div>
        <div class="ronda-titulo">${a.emoji} ${a.nombre} <span>· ${r.i + 1}/${this.PREGUNTAS_RONDA}</span></div>
        <div class="reto-escena">${q.escena}</div>
        <p class="reto-pregunta">${q.pregunta}</p>
        <div class="reto-opciones ${largas ? "largas" : ""}">
          ${q.opciones.map((o, k) => `<button class="opcion-reto" data-k="${k}">${o}</button>`).join("")}
        </div>
        <div id="reto-feedback"></div>
      </div>`;
    document.querySelectorAll(".reto-ronda .opcion-reto").forEach(b => {
      b.onclick = () => this.responderRonda(q.opciones[+b.dataset.k], b);
    });
  },

  responderRonda(valor, btn) {
    const r = this.r, q = r.q, ok = String(valor) === String(q.ok);
    document.querySelectorAll(".reto-ronda .opcion-reto").forEach(b => {
      b.disabled = true;
      if (q.opciones[+b.dataset.k] === String(q.ok)) b.classList.add("correcta");
    });
    if (!ok) btn.classList.add("incorrecta");
    r.marcas[r.i] = ok;
    if (ok) { r.aciertos++; r.racha++; r.mejorRacha = Math.max(r.mejorRacha, r.racha); }
    else r.racha = 0;
    r.i++;

    const fb = document.getElementById("reto-feedback");
    const oir = q.hablar ? `<button class="btn-oir" onclick="Aventura.hablar(${JSON.stringify(q.hablar).replace(/"/g, "&quot;")})">🔊 Escuchar</button>` : "";
    if (ok) {
      fb.innerHTML = `<div class="explicacion bien"><div class="exp-pelu">${dibujarPelu(62, "guino")}</div><div class="exp-texto">
        <b>${rnd(["¡Correcto! 🌟", "¡Genial! 💖", "¡Eso es! ✨", "¡Súper! 🎉"])}</b>
        ${q.exp ? `<p>${q.exp}</p>` : ""}${oir}
        <button class="btn grande" onclick="Aventura.siguientePregunta()">Siguiente →</button></div></div>`;
    } else {
      fb.innerHTML = `<div class="explicacion mal"><div class="exp-pelu">${dibujarPelu(62, "sorpresa")}</div><div class="exp-texto">
        <b>Casi… la respuesta es: <span class="resp">${q.ok}</span></b>
        ${q.exp ? `<p>${q.exp}</p>` : ""}${oir}
        <button class="btn grande" onclick="Aventura.siguientePregunta()">Siguiente →</button></div></div>`;
    }
    fb.querySelector(".explicacion").scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  // Voz del iPad (funciona sin internet) para escuchar el inglés
  hablar(texto) {
    try {
      const s = window.speechSynthesis; if (!s) return;
      s.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "en-US"; u.rate = 0.85;
      const v = s.getVoices().find(x => /^en(-|_)US/i.test(x.lang)) || s.getVoices().find(x => /^en/i.test(x.lang));
      if (v) u.voice = v;
      s.speak(u);
    } catch (e) {}
  },

  finRonda() {
    const r = this.r, n = this.PREGUNTAS_RONDA, antes = r.nivel;
    // Sube con 4 o 5 correctas; baja con 2 o menos (el juego se adapta a ella)
    let nuevo = antes;
    if (r.aciertos >= 4) nuevo = antes + 1;
    else if (r.aciertos <= 2) nuevo = antes - 1;
    Retos.setNivel(r.materia, nuevo);
    nuevo = Retos.nivel(r.materia);
    // Estrellas: más por nivel alto; bonus por ronda perfecta
    const porAcierto = 1 + Math.floor(antes / 3);
    const estrellas = r.aciertos * porAcierto + (r.aciertos === n ? 5 : 0);
    const estrellasFila = Array.from({ length: n }, (_, k) => `<span class="${r.marcas[k] ? "si" : ""}">★</span>`).join("");
    const msgNivel = nuevo > antes ? `<div class="nivel-cambio sube">🚀 ¡Subiste al <b>nivel ${nuevo}</b>!</div>`
      : nuevo < antes ? `<div class="nivel-cambio baja">💪 Practicamos en el <b>nivel ${nuevo}</b> y volvemos a subir</div>`
      : `<div class="nivel-cambio igual">Sigues en el <b>nivel ${nuevo}</b>. ¡4 de 5 para subir!</div>`;
    const extra = `
      <div class="resultado-ronda">
        <div class="estrellas-fila">${estrellasFila}</div>
        <p><b>${r.aciertos} de ${n}</b> correctas${r.mejorRacha >= 3 ? ` · 🔥 racha de ${r.mejorRacha}` : ""}</p>
        ${msgNivel}
      </div>`;
    if (r.aciertos === 0) {           // sin aciertos: no hay premio, pero sí ánimo
      Estado.data.aventurasHechas[this.actual.id] = (Estado.data.aventurasHechas[this.actual.id] || 0) + 1;
      Estado.guardar();
      app().innerHTML = `${barra()}
        <div class="escena aventura-escena"><div class="av-final">${dibujarPelu(110, "sorpresa")}
          <h1>¡Esta ronda estuvo difícil!</h1>${extra}
          <p class="av-texto">Equivocarse es parte de aprender. ¿Otra ronda?</p>
          <div class="botones-final"><button class="btn grande" onclick="Aventura.jugar()">🔁 Otra ronda</button>
          <button class="btn" onclick="Juego.entrar('${this.actual.lugar}')">🏡 Volver</button></div></div></div>`;
      return;
    }
    this.exito(estrellas, extra);
  },

  /* ============================================================
     5) DECISIÓN — situaciones de corazón (amistad, valores)
     Todas las opciones son seguras; refuerza la amabilidad
     y la confianza, sin "perder".
     ============================================================ */
  decision() {
    const a = this.actual;
    const escenas = [
      {
        texto: "Pelu ve a un erizo 🦔 sentado solito en una banca. Parece triste.",
        opciones: [
          { etiqueta: "🤗 Acercarse y saludar", bueno: true,
            resp: "El erizo sonríe. ¡Hiciste un nuevo amigo siendo amable! 💗" },
          { etiqueta: "👀 Mirarlo de lejos", bueno: false,
            resp: "Está bien ser tímida… pero un saludo puede alegrar a alguien. ¿Probamos? 🌱" },
        ],
      },
      {
        texto: "Una ardilla 🐿️ tiene muchas bellotas y a Pelu le encantaría una.",
        opciones: [
          { etiqueta: "🙏 Pedirla con amabilidad", bueno: true,
            resp: "La ardilla comparte feliz. ¡Pedir con respeto funciona! 🌟" },
          { etiqueta: "🤜 Quitársela rápido", bueno: false,
            resp: "Ups, eso la pone triste. Mejor pedir las cosas con cariño 💗" },
        ],
      },
      {
        texto: "Un amigo nuevo te ofrece subir a un lugar muy alto y un poco peligroso. 🪜",
        opciones: [
          { etiqueta: "🛑 Decir 'no, gracias' y avisar a un adulto", bueno: true,
            resp: "¡Muy valiente! Cuidarte a ti misma es lo más inteligente 🦸‍♀️" },
          { etiqueta: "🙈 Subir aunque dé miedo", bueno: false,
            resp: "Si algo da miedo o es peligroso, está bien decir NO y buscar ayuda 💗" },
        ],
      },
    ];
    const sc = rnd(escenas);
    const opciones = shuffle(sc.opciones).map(o => ({ etiqueta: o.etiqueta, _o: o }));

    this.pantalla({
      titulo: a.nombre,
      escena: `${dibujarPelu(80)}<p class="av-texto">${sc.texto}</p>`,
      pregunta: `¿Qué hace Pelu? Tú decides 💗`,
      opciones,
      onElegir: (i, btn) => {
        const o = opciones[i]._o;
        this.feedback(btn, o.bueno, () => o.bueno
          ? this.exito(4, o.resp)
          : (toast(o.resp), this.decision()));
      },
    });
  },
};
