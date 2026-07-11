/* ============================================================
   PELU ADVENTURES — Novela gráfica (motor + capítulos)
   Colegio de Gatitas Brujitas. Pelu es mitad brujita, mitad
   vampira: la única así. Tema: ser diferente es un superpoder
   (metáfora para una niña de altas capacidades).
   Motor sencillo de "visual novel": diálogos, decisiones que
   ramifican y pequeños retos. Todo en DOM (táctil).
   ============================================================ */

// Retrato de Pelu con look brujita-vampira (sombrero + murciélago)
function dibujarPeluBruja(tam = 96) {
  return `
    <div class="pelu-bruja" style="width:${tam}px;height:${tam * 1.35}px">
      <span class="pb-hat" style="font-size:${tam * 0.5}px">🎩</span>
      <span class="pb-bat" style="font-size:${tam * 0.34}px">🦇</span>
      <div class="pelu-svg" style="width:${tam}px">${PeluSprite.svg("feliz")}</div>
      <span class="pb-star" style="font-size:${tam * 0.26}px">✨</span>
    </div>`;
}

const Historia = {
  s: null,

  fondos: {
    puerta: { grad: "linear-gradient(160deg,#2a1a4a,#5a3a7a 70%,#7a5a9a)", deco: ["🏰", "🌙", "⭐", "✨", "🦇"] },
    clase:  { grad: "linear-gradient(160deg,#3a2a5a,#6a4a8a)", deco: ["🪄", "📚", "🕯️", "✨", "🔮"] },
    patio:  { grad: "linear-gradient(160deg,#20304a,#3a5a7a)", deco: ["🌙", "🌳", "⭐", "✨"] },
  },

  start(capId = "cap1", lugar = "colegio") {
    const beats = this.capitulos[capId];
    if (!beats) return;
    this.s = { capId, lugar, beats, i: 0, fondo: "puerta", etiquetas: {} };
    beats.forEach((b, idx) => { if (b.etiqueta !== undefined) this.s.etiquetas[b.etiqueta] = idx; });
    this.render();
  },

  salir() { Juego.entrar(this.s.lugar); },

  render() {
    const s = this.s;
    let b = s.beats[s.i];
    // procesar etiquetas y saltos hasta el próximo beat "visible"
    let guard = 0;
    while (b && !b.narra && !b.texto && !b.eleccion && !b.reto && !b.fin && guard++ < 200) {
      if (b.ir !== undefined) s.i = s.etiquetas[b.ir]; else s.i++;
      b = s.beats[s.i];
    }
    if (!b) return this.finCap({ estrellas: 10 });
    if (b.fondo) s.fondo = b.fondo;
    if (b.fin) return this.finCap(b.fin);

    const f = this.fondos[s.fondo] || this.fondos.puerta;
    const deco = f.deco.map((e, i) =>
      `<span class="nov-deco" style="left:${8 + i * 20}%;top:${10 + (i % 3) * 22}%;animation-delay:${i * 0.4}s">${e}</span>`).join("");

    let portada = "", caja = "", pie = "", clickable = "";

    if (b.narra) {
      caja = `<p class="nov-narra">${b.narra}</p>`;
      pie = `<div class="nov-continuar">▶ toca para seguir</div>`;
      clickable = `onclick="Historia.avanzar()"`;
    } else if (b.texto) {
      const retrato = b.retrato === "pelu"
        ? dibujarPeluBruja(96)
        : `<div class="nov-emoji">${b.retrato || "🐱"}</div>`;
      portada = `<div class="nov-portada ${b.retrato === "pelu" ? "es-pelu" : ""}">${retrato}</div>`;
      caja = `<div class="nov-quien">${b.quien || ""}</div><p class="nov-texto">${b.texto}</p>`;
      pie = `<div class="nov-continuar">▶ toca para seguir</div>`;
      clickable = `onclick="Historia.avanzar()"`;
    } else if (b.eleccion) {
      const ops = b.opciones.map((o, i) =>
        `<button class="btn nov-opcion" onclick="Historia.elegir(${i})">${o.t}</button>`).join("");
      portada = `<div class="nov-portada es-pelu">${dibujarPeluBruja(96)}</div>`;
      caja = `<p class="nov-texto">${b.eleccion}</p><div class="nov-opciones">${ops}</div>`;
    } else if (b.reto) {
      const ops = b.opciones.map((o, i) =>
        `<button class="btn nov-opcion" onclick="Historia.responder(${i})">${o.t}</button>`).join("");
      portada = `<div class="nov-portada es-pelu">${dibujarPeluBruja(96)}</div>`;
      caja = `<p class="nov-texto">✨ ${b.reto}</p><div class="nov-opciones">${ops}</div>`;
    }

    app().innerHTML = `
      ${barra()}
      <div class="escena novela-escena">
        <button class="volver" onclick="Historia.salir()">← Salir</button>
        <div class="nov-vista" style="background:${f.grad}" ${clickable}>
          <div class="nov-deco-capa">${deco}</div>
          ${portada}
        </div>
        <div class="nov-caja" ${clickable}>
          ${caja}
          ${pie}
        </div>
      </div>`;
  },

  avanzar() { this.s.i++; this.render(); },
  irA(et) { this.s.i = this.s.etiquetas[et]; this.render(); },

  elegir(i) {
    const b = this.s.beats[this.s.i];
    const o = b.opciones[i];
    if (o.ir !== undefined) this.irA(o.ir);
    else this.avanzar();
  },

  responder(i) {
    const b = this.s.beats[this.s.i];
    const o = b.opciones[i];
    if (o.ok) { confeti(); this.avanzar(); }
    else { toast(o.nudge || "Mmm… piensa otra vez 🤔"); }
  },

  finCap(fin) {
    const s = this.s;
    if (!Estado.data.historia) Estado.data.historia = [];
    if (!Estado.data.historia.includes(s.capId)) Estado.data.historia.push(s.capId);
    Estado.data.aventurasHechas[s.capId] = (Estado.data.aventurasHechas[s.capId] || 0) + 1;
    Estado.ganar(fin.estrellas || 10);
    confeti();
    app().innerHTML = `
      ${barra()}
      <div class="escena novela-escena">
        <div class="av-final">
          <div class="nov-portada es-pelu">${dibujarPeluBruja(110)}</div>
          <h1>📖 ¡Capítulo completado!</h1>
          <p class="av-texto">${fin.mensaje || "Sigue la aventura…"}</p>
          <div class="premio">+${fin.estrellas || 10} ⭐</div>
          <div class="botones-final">
            <button class="btn grande" onclick="Historia.start('${s.capId}','${s.lugar}')">🔁 Releer</button>
            <button class="btn" onclick="Historia.salir()">🏰 Volver</button>
          </div>
        </div>
      </div>`;
  },

  /* ============================================================
     CAPÍTULOS (el guion). Para agregar más, copia la estructura.
     ============================================================ */
  capitulos: {
    cap1: [
      { fondo: "puerta", narra: "Es de noche. Pelu llega por primera vez al Colegio de Gatitas Brujitas. Su corazón late fuerte… 💓" },
      { narra: "Pelu es especial: mitad brujita 🔮, mitad vampira 🦇. La única así en todo el colegio." },
      { quien: "Pelu", retrato: "pelu", texto: "¿Y si no encajo? Todas son brujitas de verdad… yo soy… diferente." },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "¡Bienvenida, Pelu! Te estábamos esperando. Nunca tuvimos una gatita mitad bruja, mitad vampira." },
      { quien: "Pelu", retrato: "pelu", texto: "¿Eso… está bien? ¿No es raro?" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Ser distinta no es raro, cielo. Es un regalo. Ya lo descubrirás. Ve a tu primera clase." },

      { fondo: "clase", narra: "En el aula, las gatitas brujitas practican hechizos. Pelu se sienta al fondo, calladita." },
      { quien: "Mia", retrato: "🐱", texto: "Miren… la nueva tiene colmillos. Tú no eres una brujita normal." },
      { quien: "Nina", retrato: "🐈", texto: "Jiji, es medio vampira. Qué rara." },
      { quien: "Pelu", retrato: "pelu", texto: "(Se me hace un nudo en la panza. Otra vez me siento fuera de lugar…)" },

      { eleccion: "¿Qué hace Pelu?", opciones: [
        { t: "🙈 Esconderse y quedarse callada", ir: "esconder" },
        { t: "🦇 Explicar con orgullo quién es", ir: "orgullo" },
      ] },

      { etiqueta: "esconder" },
      { quien: "Pelu", retrato: "pelu", texto: "(Bajo la mirada. Ojalá pudiera desaparecer…)" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "Oye… yo creo que tus colmillos son geniales. ¿Me puedo sentar contigo?" },
      { ir: "junta" },

      { etiqueta: "orgullo" },
      { quien: "Pelu", retrato: "pelu", texto: "Sí, soy mitad vampira. Y también mitad bruja. Puedo hacer cosas que nadie más puede." },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "¡Guau! Eso es INCREÍBLE. Yo quiero ser tu amiga." },
      { ir: "junta" },

      { etiqueta: "junta" },
      { fondo: "clase", narra: "De pronto, la sala se oscurece. La profesora lanza un reto: encender las Velas de Medianoche 🕯️." },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "Solo se encienden con magia de MEDIANOCHE… pero todas las brujitas nos dormimos de noche. ¡Nadie puede!" },
      { quien: "Pelu", retrato: "pelu", texto: "¡De noche! Yo soy vampira… ¡yo NO me duermo de noche! Déjenme intentarlo." },
      { reto: "Ayuda a Pelu con el hechizo. ¿Qué palabra combina la MAGIA de la noche?", opciones: [
        { t: "🌙 “Lunaluz”", ok: true },
        { t: "☀️ “Solaris”", nudge: "El sol no sale de noche 🌙 Piensa en lo que ve una vampira." },
        { t: "🔥 “Fuegón”", nudge: "No es fuego normal… es magia de la noche 🌙" },
      ] },

      { fondo: "clase", narra: "¡Las Velas de Medianoche se encienden con una luz plateada! ✨ Toda la clase mira asombrada." },
      { quien: "Mia", retrato: "🐱", texto: "Wow… lo logró. Ninguna de nosotras pudo…" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "¿Lo ven? Lo que hacía diferente a Pelu es JUSTO lo que salvó la clase." },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "Pelu, ¿seremos amigas? Me encanta cómo piensas distinto." },
      { quien: "Pelu", retrato: "pelu", texto: "¡Sí! Quizás ser diferente… no es tan malo después de todo. 💜" },
      { narra: "Y así, en su primer día, Pelu descubrió que aquello que la hacía sentir distinta era, en realidad, su magia más especial. 🦇🔮" },
      { fin: { estrellas: 15, mensaje: "Capítulo 1 completado. ¡Hiciste una amiga: Luna 🐈‍⬛! Pronto habrá más aventuras en el colegio…" } },
    ],
  },
};

if (typeof window !== "undefined") window.Historia = Historia;
