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
          <p class="av-texto">${a.intro}</p>
          ${dibujarPelu(80)}
          <button class="btn grande pulso" onclick="Aventura.jugar()">¡Empezar! ✨</button>
        </div>
      </div>`;
  },

  // Decide qué mini-juego correr según el tipo
  jugar() {
    const t = this.actual.tipo;
    if (t === "matematicas") return this.matematicas();
    if (t === "ingles")      return this.ingles();
    if (t === "logica")      return this.logica();
    if (t === "dinero")      return this.dinero();
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
    if (Math.random() < 0.3) {
      const t = rnd(["🌟","🔮","🍀","🐚","💎","🦴","🗿","🎏"]);
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
     1) MATEMÁTICAS — contar y sumar
     ============================================================ */
  matematicas() {
    const edad = Estado.data.edad;
    const a = this.actual;
    const icono = a.id === "conchas" ? "🐚" : "🌻";
    const ri = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

    // Elige operación según la edad — sube fuerte para altas capacidades
    let ops;
    if (edad <= 5) ops = ["contar", "sumar"];
    else if (edad <= 7) ops = ["sumar", "restar", "multiplicar"];
    else if (edad === 8) ops = ["sumar", "restar", "multiplicar", "dividir", "combo"];
    else if (edad === 9) ops = ["multiplicar", "dividir", "combo", "algebra", "multi2", "fraccion"];
    else if (edad === 10) ops = ["multi2", "dividir", "combo3", "algebra", "algebra2", "fraccion", "orden"];
    else if (edad === 11) ops = ["multi2", "combo3", "algebra2", "fraccion", "potencia", "porcentaje", "orden"];
    else ops = ["multi2", "fraccion", "algebra2", "potencia", "combo3", "porcentaje", "orden"];
    const op = rnd(ops);

    let respuesta, escena, pregunta, premio = 4;

    if (op === "contar") {
      respuesta = ri(2, 7);
      escena = `<div class="grupo grande-emoji">${icono.repeat(respuesta)}</div>`;
      pregunta = `¿Cuántos cuentas?`;
    } else if (op === "sumar") {
      const top = edad <= 5 ? 9 : edad <= 7 ? 20 : 75;
      const n1 = ri(2, top), n2 = ri(2, top);
      respuesta = n1 + n2;
      escena = `<div class="ecuacion">${n1} <span>+</span> ${n2}</div>`;
      pregunta = `¿Cuánto suma?`;
    } else if (op === "restar") {
      const n1 = ri(6, edad <= 7 ? 18 : 90), n2 = ri(1, n1);
      respuesta = n1 - n2;
      escena = `<div class="ecuacion">${n1} <span>−</span> ${n2}</div>`;
      pregunta = `¿Cuánto queda?`;
    } else if (op === "multiplicar") {
      const n1 = ri(2, 12), n2 = ri(2, 12);
      respuesta = n1 * n2;
      escena = `<div class="ecuacion">${n1} <span>×</span> ${n2}</div>`;
      pregunta = `¿Cuánto es?`; premio = 6;
    } else if (op === "dividir") { // resultado exacto
      const n2 = ri(2, 12), res = ri(2, 12);
      respuesta = res;
      escena = `<div class="ecuacion">${n2 * res} <span>÷</span> ${n2}</div>`;
      pregunta = `¿Cuánto da?`; premio = 6;
    } else if (op === "multi2") { // 2 dígitos × 1-2 dígitos
      const n1 = ri(13, edad >= 12 ? 49 : 29), n2 = ri(edad >= 11 ? 6 : 3, edad >= 12 ? 19 : 9);
      respuesta = n1 * n2;
      escena = `<div class="ecuacion">${n1} <span>×</span> ${n2}</div>`;
      pregunta = `¿Cuánto es?`; premio = 10;
    } else if (op === "algebra") { // ? + b = c   ó   a × ? = c
      if (ri(0, 1)) { const b = ri(3, 20), res = ri(3, 20); respuesta = res;
        escena = `<div class="ecuacion"><span>?</span> + ${b} = ${res + b}</div>`;
      } else { const a = ri(2, 9), res = ri(2, 9); respuesta = res;
        escena = `<div class="ecuacion">${a} <span>×</span> ? = ${a * res}</div>`; }
      pregunta = `¿Qué número falta? 🔎`; premio = 9;
    } else if (op === "algebra2") { // a × ? + c = total
      const a = ri(2, 6), res = ri(2, 9), c = ri(1, 12); respuesta = res;
      escena = `<div class="ecuacion">${a} <span>×</span> ? <span>+</span> ${c} = ${a * res + c}</div>`;
      pregunta = `¿Qué número es ? 🔎`; premio = 11;
    } else if (op === "combo3") { // a×b + c×d
      const a = ri(2, 8), b = ri(2, 8), c = ri(2, 8), d = ri(2, 8);
      respuesta = a * b + c * d;
      escena = `<div class="ecuacion">${a}<span>×</span>${b} <span>+</span> ${c}<span>×</span>${d}</div>`;
      pregunta = `Resuélvelo por partes. ¿Cuánto da?`; premio = 11;
    } else if (op === "fraccion") { // 1/d de N
      const d = rnd([2, 3, 4, 5]); const N = d * ri(2, 9); respuesta = N / d;
      escena = `<div class="ecuacion">1/${d} <span>de</span> ${N}</div>`;
      pregunta = `¿Cuánto es esa fracción?`; premio = 9;
    } else if (op === "potencia") { // cuadrado o cubo
      if (ri(0, 1)) { const a = ri(2, 12); respuesta = a * a;
        escena = `<div class="ecuacion">${a}²</div>`; pregunta = `¿Cuánto es ${a} al cuadrado?`;
      } else { const a = ri(2, 5); respuesta = a * a * a;
        escena = `<div class="ecuacion">${a}³</div>`; pregunta = `¿Cuánto es ${a} al cubo?`; }
      premio = 10;
    } else if (op === "porcentaje") { // 10/25/50/75% de N (resultado entero)
      const p = rnd([10, 25, 50, 75]);
      const mult = p === 10 ? 10 : p === 50 ? 2 : 4;
      const N = mult * ri(2, 12);
      respuesta = N * p / 100;
      escena = `<div class="ecuacion">${p}% <span>de</span> ${N}</div>`;
      pregunta = `¿Cuánto es ese porcentaje?`; premio = 12;
    } else if (op === "orden") { // orden de operaciones: a + b × c
      const a = ri(3, 15), b = ri(2, 9), c = ri(2, 9);
      respuesta = a + b * c;
      escena = `<div class="ecuacion">${a} <span>+</span> ${b} <span>×</span> ${c}</div>`;
      pregunta = `Ojo: primero la ×, después la +. ¿Cuánto da? 🔎`; premio = 12;
    } else { // combo de dos pasos: a × b + c
      const n1 = ri(2, 9), n2 = ri(2, 9), n3 = ri(2, 12);
      respuesta = n1 * n2 + n3;
      escena = `<div class="ecuacion">${n1} <span>×</span> ${n2} <span>+</span> ${n3}</div>`;
      pregunta = `Primero multiplica, luego suma. ¿Cuánto da?`; premio = 8;
    }

    // Opciones: la correcta + distractores plausibles (helper que nunca se cuelga)
    const opciones = opcionesNumericas(respuesta, 4).map(v => ({ etiqueta: v, valor: v }));

    this.pantalla({
      titulo: a.nombre, escena, pregunta, opciones,
      onElegir: (i, btn) => {
        const ok = opciones[i].valor === respuesta;
        this.feedback(btn, ok, () => ok ? this.exito(premio) : this.matematicas());
      },
    });
  },

  /* ============================================================
     2) INGLÉS — emparejar objeto con su palabra
     ============================================================ */
  ingles() {
    const a = this.actual;
    const edad = Estado.data.edad;

    // Niñas más grandes: traducir FRASES completas
    if (edad >= 8 && Math.random() < 0.6) {
      const f = rnd(DATA.frasesIngles);
      const opciones = shuffle([f.en, ...f.distractores]).map(t => ({ etiqueta: t, valor: t }));
      return this.pantalla({
        titulo: a.nombre,
        escena: `<div class="ingles-frase">“${f.es}”</div>`,
        pregunta: `¿Cómo se dice en inglés? 🇬🇧`,
        opciones,
        onElegir: (i, btn) => {
          const ok = opciones[i].valor === f.en;
          this.feedback(btn, ok, () => ok
            ? this.exito(6, `“${f.es}” → <b>${f.en}</b> 🌟`)
            : this.ingles());
        },
      });
    }

    // Más pequeñas: una palabra con su dibujo
    const correcta = rnd(DATA.palabrasIngles);
    const otras = shuffle(DATA.palabrasIngles.filter(p => p.en !== correcta.en)).slice(0, edad >= 8 ? 3 : 2);
    const opciones = shuffle([correcta, ...otras]).map(p => ({ etiqueta: p.en, valor: p.en }));
    this.pantalla({
      titulo: a.nombre,
      escena: `<div class="ingles-objeto">${correcta.emoji}</div>
               <p class="ingles-es">En español: <b>${correcta.es}</b></p>`,
      pregunta: `¿Cómo se dice en inglés? 🇬🇧`,
      opciones,
      onElegir: (i, btn) => {
        const ok = opciones[i].valor === correcta.en;
        this.feedback(btn, ok, () => ok
          ? this.exito(4, `<b>${correcta.es}</b> en inglés es <b>${correcta.en}</b> 🌟`)
          : this.ingles());
      },
    });
  },

  /* ============================================================
     3) LÓGICA — completar el patrón / secuencia
     ============================================================ */
  logica() {
    const a = this.actual;
    const edad = Estado.data.edad;

    // Mayores: secuencias numéricas (+n, ×2, cuadrados, Fibonacci…)
    if (edad >= 7 && Math.random() < (edad >= 9 ? 0.8 : 0.65)) {
      const ri = (mn, mx) => mn + Math.floor(Math.random() * (mx - mn + 1));
      let tipos = ["suma", "resta"];
      if (edad >= 8) tipos = tipos.concat(["doble", "salto"]);
      if (edad >= 9) tipos = tipos.concat(["triple", "cuadrados", "fibonacci"]);
      const tipo = rnd(tipos);
      let inicio, paso, seq = [], respuesta, regla;
      if (tipo === "doble") {
        inicio = ri(1, 4); seq = [inicio]; for (let i = 0; i < 4; i++) seq.push(seq[i] * 2);
        respuesta = seq[4]; seq = seq.slice(0, 4); regla = "cada número se duplica";
      } else if (tipo === "triple") {
        inicio = ri(1, 3); seq = [inicio]; for (let i = 0; i < 4; i++) seq.push(seq[i] * 3);
        respuesta = seq[4]; seq = seq.slice(0, 4); regla = "cada número se multiplica ×3";
      } else if (tipo === "cuadrados") {
        const s = ri(1, 3); for (let i = 0; i < 5; i++) { const n = s + i; seq.push(n * n); }
        respuesta = seq[4]; seq = seq.slice(0, 4); regla = "son números al cuadrado (1,4,9,16…)";
      } else if (tipo === "fibonacci") {
        seq = [ri(1, 3), ri(2, 4)]; for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2]);
        respuesta = seq[4]; seq = seq.slice(0, 4); regla = "cada número es la suma de los dos anteriores";
      } else if (tipo === "salto") {
        inicio = ri(2, 9); paso = ri(2, 5);
        for (let i = 0; i < 5; i++) seq.push(inicio + paso * i);
        respuesta = seq[4]; seq = seq.slice(0, 4); regla = `suma ${paso} cada vez`;
      } else {
        const signo = tipo === "suma" ? 1 : -1;
        paso = ri(2, edad >= 9 ? 9 : 4); inicio = signo > 0 ? ri(1, 10) : ri(25, 45);
        for (let i = 0; i < 5; i++) seq.push(inicio + signo * paso * i);
        respuesta = seq[4]; seq = seq.slice(0, 4);
        regla = `${signo > 0 ? "suma" : "resta"} ${paso} cada vez`;
      }
      const opciones = opcionesNumericas(respuesta, 4).map(v => ({ etiqueta: v, valor: v }));
      return this.pantalla({
        titulo: a.nombre,
        escena: `<div class="secuencia">${seq.map(n => `<span>${n}</span>`).join("")}<span class="hueco">❓</span></div>`,
        pregunta: `¿Qué número sigue? 🧩`,
        opciones,
        onElegir: (i, btn) => {
          const ok = opciones[i].valor === respuesta;
          this.feedback(btn, ok, () => ok
            ? this.exito(6, `El truco: <b>${regla}</b> 🧠`)
            : this.logica());
        },
      });
    }

    const simbolos = shuffle(["🔴","🔵","🟡","🟢","⭐","🌙"]).slice(0, edad <= 5 ? 2 : 3);
    const largoPatron = edad <= 5 ? 2 : 3;
    const patron = simbolos.slice(0, largoPatron);

    // Construye la secuencia repitiendo el patrón
    let sec = [];
    while (sec.length < (edad <= 5 ? 5 : 8)) sec = sec.concat(patron);
    const visibles = sec.slice(0, edad <= 5 ? 4 : 6);
    const respuesta = sec[visibles.length];

    const set = new Set([respuesta]);
    for (const s of shuffle(simbolos)) { set.add(s); if (set.size >= 3) break; }
    const opciones = shuffle([...set]).map(s => ({ etiqueta: s, valor: s }));

    this.pantalla({
      titulo: a.nombre,
      escena: `<div class="secuencia">${visibles.map(s => `<span>${s}</span>`).join("")}<span class="hueco">❓</span></div>`,
      pregunta: `¿Qué sigue en el patrón? 🧩`,
      opciones,
      onElegir: (i, btn) => {
        const ok = opciones[i].valor === respuesta;
        this.feedback(btn, ok, () => ok ? this.exito(5) : this.logica());
      },
    });
  },

  /* ============================================================
     4) DINERO — pagar la cantidad correcta de monedas
     ============================================================ */
  dinero() {
    const a = this.actual;
    const edad = Estado.data.edad;
    const productos = [["🍎","manzana"],["🍌","plátano"],["🧁","pastelito"],["🍪","galleta"],["🍓","fresa"]];
    const [emoji, nombre] = rnd(productos);
    const precio = 1 + Math.floor(Math.random() * (edad <= 5 ? 4 : 7));

    const set = new Set([precio]);
    let intD = 0;
    while (set.size < 3 && intD++ < 40) { const d = precio + (Math.floor(Math.random() * 5) - 2); if (d > 0 && d !== precio) set.add(d); }
    for (let d = 1; set.size < 3; d++) if (d !== precio) set.add(d);
    const opciones = shuffle([...set]).map(v => ({ etiqueta: `${"🪙".repeat(v)}<br>${v}`, valor: v }));

    this.pantalla({
      titulo: a.nombre,
      escena: `<div class="producto-mercado"><div class="grande-emoji">${emoji}</div>
               <div class="precio-cartel">Cuesta ${precio} 🪙</div></div>`,
      pregunta: `Pelu quiere la ${nombre}. ¿Con cuántas monedas la paga?`,
      opciones,
      onElegir: (i, btn) => {
        const ok = opciones[i].valor === precio;
        this.feedback(btn, ok, () => ok
          ? this.exito(5, `¡Pagaste justo! Manejar el dinero es un súper poder 💪`)
          : this.dinero());
      },
    });
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
