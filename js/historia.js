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
    jardin: { grad: "linear-gradient(160deg,#243a3a,#3a6a5a 70%,#5a8a6a)", deco: ["🌙", "🌿", "🌸", "✨", "🦋"] },
    espejo: { grad: "linear-gradient(160deg,#14121e,#2a2440 70%,#3a3560)", deco: ["🪞", "🕯️", "🕸️", "✨", "🌙"] },
    feria:  { grad: "linear-gradient(160deg,#4a2a5a,#8a4a7a 60%,#d98ab0)", deco: ["🎪", "🎈", "🔮", "✨", "🍬"] },
    lago:   { grad: "linear-gradient(160deg,#1a3a5a,#2a6a9a 65%,#7ec8e8)", deco: ["🌙", "🐟", "🫧", "✨", "🎣"] },
    cafe:   { grad: "linear-gradient(160deg,#5a3a2a,#a5794a 70%,#e0b878)", deco: ["🧁", "☕", "🍪", "✨", "🍩"] },
    casita: { grad: "linear-gradient(160deg,#7a4a6a,#b57a9a 70%,#e8b8d0)", deco: ["🏠", "💜", "🧸", "✨", "🪟"] },
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
    while (b && !b.narra && !b.texto && !b.eleccion && !b.reto && !b.fin && !b.juego && guard++ < 200) {
      if (b.ir !== undefined) s.i = s.etiquetas[b.ir]; else s.i++;
      b = s.beats[s.i];
    }
    if (!b) return this.finCap({ estrellas: 10 });
    if (b.fondo) s.fondo = b.fondo;
    if (b.fin) return this.finCap(b.fin);
    if (b.juego) return this.lanzarJuego(b);   // reto jugable incrustado en el relato

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
        <button class="saltar-historia" onclick="event.stopPropagation();Historia.saltar()">Saltar ⏭️</button>
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

  // Saltarse el relato: si viene un mini-juego incrustado, va directo a él;
  // si no, salta al final del capítulo (sin perderse la parte jugable).
  saltar() {
    const b = this.s.beats;
    for (let j = this.s.i; j < b.length; j++) {
      if (b[j].juego) { this.s.i = j; return this.render(); }
    }
    for (let j = this.s.i; j < b.length; j++) {
      if (b[j].fin) { this.s.i = j; return this.render(); }
    }
    this.finCap({ estrellas: 10 });
  },

  // Lanza un mini-juego incrustado en la novela. Al terminar, el juego vuelve
  // por Juego.mapa()/entrar(), que detectan esperandoJuego y retoman el relato.
  esperandoJuego: false,
  modulosJuego: {
    plataformas: "PeluPlatformer", carrera: "PeluRace", cocina: "PeluCook",
    pesca: "PeluFish", buceo: "PeluSwim", escape: "PeluEscape",
  },
  lanzarJuego(b) {
    const lugar = b.lugar || this.s.lugar;
    this.s.i++;                     // al volver, seguimos en el beat siguiente
    this.esperandoJuego = true;
    // Actividades DOM (no Phaser): vestir/decorar y tienda
    if (b.juego === "casa")   { Juego.casa(); return; }
    if (b.juego === "tienda") { Juego.tienda("ropa"); return; }
    const mod = window[this.modulosJuego[b.juego]];
    if (mod && typeof mod.start === "function") { mod.start(lugar); }
    else { this.esperandoJuego = false; this.render(); }  // fallback: seguir el relato
  },
  reanudarDesdeJuego() { this.render(); },

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
      { fin: { estrellas: 15, mensaje: "Capítulo 1 completado. ¡Hiciste una amiga: Luna 🐈‍⬛! En el Capítulo 2 aprenderás qué hacer cuando algo aburre y el volcán crece por dentro… 🌋" } },
    ],

    cap2: [
      { fondo: "clase", narra: "Han pasado unos días. Pelu ya tiene una amiga del alma: Luna 🐈‍⬛. Hoy toca clase de hechizos… otra vez." },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Hoy repetiremos el hechizo de la burbuja flotante 🫧. Todas juntas, ¡una y otra vez, hasta que salga perfecto!" },
      { quien: "Pelu", retrato: "pelu", texto: "(¿Otra vez? Yo ya lo aprendí el primer día… y el segundo… y el tercero.)" },
      { narra: "Mientras las demás practican, Pelu ya hizo diez burbujas perfectas. Se aburre. Por dentro, algo empieza a hervir… 🌋" },
      { quien: "Pelu", retrato: "pelu", texto: "(Es como un volcán en mi panza. Todo va tan LENTO. ¡Siento que voy a estallar!)" },

      { eleccion: "El volcán crece por dentro. ¿Qué hace Pelu?", opciones: [
        { t: "🌋 Estallar: “¡Esto es aburridíííísimo!”", ir: "estallar" },
        { t: "🫁 Parar y respirar hondo", ir: "respirar" },
      ] },

      { etiqueta: "estallar" },
      { quien: "Pelu", retrato: "pelu", texto: "¡ESTO ES ABURRIDÍSIMO! ¡Ya me lo sé de memoria!" },
      { narra: "La sala queda en silencio. Mia y Nina se ríen por lo bajo. A Pelu le arden las mejillas de vergüenza. 😳" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Pelu, entiendo que te aburras. Pero el volcán salió sin permiso, ¿verdad? Ven, te enseño un truco." },
      { ir: "truco" },

      { etiqueta: "respirar" },
      { quien: "Pelu", retrato: "pelu", texto: "(Inhalo… 1, 2, 3… y suelto el aire despacito. El volcán baja un poquito.)" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Vi que te aburrías… y que respiraste en vez de estallar. Eso, Pelu, es magia muy poderosa. Ven conmigo." },
      { ir: "truco" },

      { etiqueta: "truco" },
      { fondo: "jardin", narra: "Estela lleva a Pelu al Jardín de la Luna 🌙. El aire es fresco y todo está en calma." },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Cuando algo es muy fácil y te aburres, el volcán crece. No eres mala: es que tu mente va rapidísimo y pide MÁS." },
      { quien: "Pelu", retrato: "pelu", texto: "¿Y entonces qué hago con el volcán? A veces me da miedo lo grande que se pone." },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Primero, la Respiración del Dragón 🐉: aire hondo por la nariz, y sueltas el humo despacio por la boca. El volcán se hace pequeñito." },

      { reto: "Cuando algo te aburre y sientes el volcán 🌋, ¿qué es lo primero y más sano que puedes hacer?", opciones: [
        { t: "🫁 Respirar y ponerle nombre a lo que siento", ok: true },
        { t: "🌋 Gritar para que todos me escuchen", nudge: "Gritar hace crecer el volcán 🌋 ¿Qué lo calma en vez de agrandarlo?" },
        { t: "🙊 Guardármelo y aguantar hasta reventar", nudge: "Guardarlo tampoco ayuda… el volcán necesita salir con calma, no de golpe." },
      ] },

      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "¡Exacto! Y ahora el segundo truco: convierte el aburrimiento en un reto NUEVO. Mira a tu alrededor… ¿quién necesita ayuda?" },

      { fondo: "clase", narra: "De vuelta en clase, Pelu ve a Luna. Su burbuja se pincha una y otra vez. Luna está a punto de llorar. 😢" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "No me sale… todas pueden menos yo. Soy un desastre." },
      { quien: "Pelu", retrato: "pelu", texto: "(Yo lo hago con los ojos cerrados… pero para Luna es dificilísimo. Ahora entiendo cómo se siente atascarse.)" },

      { eleccion: "Pelu tiene su “reto nuevo”. ¿Qué hace?", opciones: [
        { t: "💜 Ayudar a Luna con paciencia", ir: "ayudar" },
        { t: "🏆 Presumir lo fácil que es para mí", ir: "presumir" },
      ] },

      { etiqueta: "presumir" },
      { quien: "Pelu", retrato: "pelu", texto: "¡Es facilísimo, mira! Uno, dos, ¡listo! ¿Ves qué fácil es?" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "…Para ti. Yo ahora me siento peor todavía." },
      { narra: "Luna baja las orejas y se aleja triste. A Pelu se le encoge el corazón: presumir tampoco calmó nada. 💔" },
      { quien: "Pelu", retrato: "pelu", texto: "Perdón, Luna. No quise hacerte sentir mal. Empecemos de nuevo… ¿te ayudo de verdad esta vez?" },
      { ir: "ayudar" },

      { etiqueta: "ayudar" },
      { quien: "Pelu", retrato: "pelu", texto: "Luna, no eres un desastre. Hazlo LENTO conmigo: respira… y mueve la varita en círculos suaves, siguiendo el patrón." },
      { reto: "Para que la burbuja no se pinche, la varita sigue un patrón mágico. Continúa la serie: 🔵🔵🟣 · 🔵🔵🟣 · 🔵🔵…", opciones: [
        { t: "🟣", ok: true },
        { t: "🔵", nudge: "Mira el patrón: dos azules y un morado, y se repite → 🔵🔵🟣" },
        { t: "🔴", nudge: "No hay rojo en el patrón. Fíjate bien: 🔵🔵🟣 · 🔵🔵🟣…" },
      ] },
      { narra: "¡La burbuja de Luna se infla grande y brillante y sale flotando! 🫧✨ Luna salta de felicidad." },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "¡LO LOGRÉ! Gracias, Pelu… me tuviste paciencia y no te reíste de mí. 💜" },
      { quien: "Pelu", retrato: "pelu", texto: "(El volcán… desapareció solito. Ayudar a Luna se sintió mil veces mejor que hacer diez burbujas yo sola.)" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "¿Lo ves, Pelu? Tu mente rápida es un regalo. No para presumir… sino para ayudar y para buscar retos más grandes." },
      { narra: "Pelu aprendió que el aburrimiento no es su enemigo: es una señal de que necesita un reto mayor. Y que la paciencia también es una magia poderosa. 💜🐉" },
      { fin: { estrellas: 15, mensaje: "Capítulo 2 completado. Aprendiste la Respiración del Dragón 🐉 y que ayudar vale más que presumir. ¡Luna es tu mejor amiga! En el Cap. 3 aparece un espejo que susurra cosas feas… 🪞" } },
    ],

    cap3: [
      { fondo: "espejo", narra: "Buscando la biblioteca, Pelu se pierde por un pasillo oscuro del colegio. Al fondo, un espejo antiguo brilla con una luz fría. 🪞" },
      { narra: "Cuando Pelu se acerca, el espejo… le habla. Su voz es fría y burlona. 🥶" },
      { quien: "Espejo Susurrante", retrato: "🪞", texto: "Vaya, vaya… la gatita RARA. Mitad esto, mitad lo otro. No eres ni una cosa ni la otra, ¿verdad?" },
      { quien: "Pelu", retrato: "pelu", texto: "(Un nudo en la garganta. ¿Cómo sabe justo lo que más me asusta?)" },
      { quien: "Espejo Susurrante", retrato: "🪞", texto: "Ayer te equivocaste en un hechizo. Eso prueba que eres un desastre. TODO te sale mal." },
      { quien: "Pelu", retrato: "pelu", texto: "(¿Será… será verdad lo que dice?)" },

      { eleccion: "El espejo susurra cosas feas. ¿Qué hace Pelu?", opciones: [
        { t: "😔 Creerle al espejo", ir: "creer" },
        { t: "🤨 Dudar de lo que dice", ir: "dudar" },
      ] },

      { etiqueta: "creer" },
      { quien: "Pelu", retrato: "pelu", texto: "(Quizás tiene razón. Quizás sí soy rara y todo me sale mal…)" },
      { narra: "Con cada pensamiento triste, el espejo brilla más fuerte y crece. ¡Se alimenta de las dudas de Pelu! 😨" },
      { quien: "Espejo Susurrante", retrato: "🪞", texto: "Jajaja… sí, créeme. Cuanto más me crees, MÁS fuerte me hago." },
      { ir: "luna" },

      { etiqueta: "dudar" },
      { quien: "Pelu", retrato: "pelu", texto: "Un momento… ¿por qué un espejo sabría lo que soy? Solo me repite mis miedos." },
      { narra: "El espejo tiembla un poquito, como molesto. No le gusta nada que Pelu dude de él." },
      { ir: "luna" },

      { etiqueta: "luna" },
      { narra: "De pronto llega Luna corriendo por el pasillo. 🐈‍⬛" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "¡Pelu! ¡Aléjate de ahí! Es el Espejo Susurrante. Le dice cosas feas a todas… y se hace grande cuando le creemos." },
      { quien: "Pelu", retrato: "pelu", texto: "¿Entonces lo que dice… no es verdad?" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "Es la “voz mentirosa”. Dice tus miedos como si fueran hechos. Pero un miedo NO es un hecho." },

      { fondo: "espejo", narra: "Aparece la Directora Estela con su farol encendido. 🏮" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Ese espejo solo tiene el poder que tú le das. La voz mentirosa exagera: convierte UN error en “todo me sale mal”. Aprende a reconocerla." },

      { reto: "¿Cuál de estas es la “voz mentirosa” que exagera y te trata mal?", opciones: [
        { t: "🌀 “Me equivoqué en una suma, así que soy tonta y TODO me sale mal.”", ok: true },
        { t: "🙂 “Me equivoqué en una suma. La reviso y lo intento otra vez.”", nudge: "Esa es una voz amable y verdadera 🙂 Busca la que exagera y te insulta." },
        { t: "💜 “Me costó, pero pedí ayuda y aprendí.”", nudge: "Esa es una voz sabia y buena 💜 La mentirosa es la que exagera un error en un “todo”." },
      ] },

      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "¡Muy bien! Ahora el hechizo más poderoso: RESPÓNDELE con la verdad, como le hablarías a tu mejor amiga." },

      { reto: "El espejo dice: “¡Eres rara y no le importas a nadie!” ¿Qué le responde Pelu con la verdad?", opciones: [
        { t: "💜 “Soy diferente, y eso es mi magia. Y Luna es mi amiga de verdad.”", ok: true },
        { t: "😢 “Tienes razón… nadie me quiere.”", nudge: "Eso es creerle a la voz mentirosa 😢 Respóndele con lo que SÍ es verdad de ti." },
        { t: "😠 “¡Cállate, espejo feo!”", nudge: "No hace falta insultar 😊 Basta con decir, tranquila, la verdad amable sobre ti." },
      ] },

      { narra: "Con cada verdad que dice Pelu, el Espejo Susurrante se agrieta… ¡CRACK! Su luz fría se apaga y queda solo un espejo normal. ✨" },
      { quien: "Pelu", retrato: "pelu", texto: "(Me sentía tan mal… y solo era una voz asustada exagerando. No era la verdad.)" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "¡Lo callaste, Pelu! ¿Cómo lo hiciste?" },
      { quien: "Pelu", retrato: "pelu", texto: "Me hablé como te hablaría a ti: con cariño y con la verdad. 💜" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Esa, Pelu, es la magia más difícil de todas: ser tu propia amiga. La voz mentirosa volverá a veces… y ya sabes responderle." },
      { narra: "Pelu aprendió que sus miedos no son hechos, y que puede responderle a la voz mentirosa con la verdad y con cariño hacia sí misma. 🪞💜" },
      { fin: { estrellas: 20, mensaje: "Capítulo 3 completado. Aprendiste a reconocer la “voz mentirosa” y a responderle con la verdad. ¡Eres tu propia amiga! En el Cap. 4 hay una feria… y una amiga que quiere salirse con la suya. 🎪" } },
    ],

    cap4: [
      { fondo: "clase", narra: "Hoy el colegio prepara la Feria de las Brujitas 🎪. Cada grupo arma un puesto mágico. A Pelu le toca con Luna, Mia y Nina." },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "La regla es sencilla: entre las cuatro deciden QUÉ puesto hacer. Todas las ideas valen. ¡A ponerse de acuerdo!" },
      { quien: "Nina", retrato: "🐈", texto: "Emm… ¿y si hacemos un puesto de Burbujas de los Deseos? Cada quien pide un deseo y sopla…" },
      { quien: "Mia", retrato: "🐱", texto: "¿Burbujas? Bah, eso es de bebés. MI idea es un Castillo de Fuego Púrpura. Es mucho mejor. Hagamos la mía." },
      { quien: "Nina", retrato: "🐈", texto: "Bueno… si tú lo dices…" },
      { narra: "Pelu nota algo: Mia no está convenciendo… está EMPUJANDO. Y a Nina se le apagó la carita. 😔" },

      { quien: "Luna", retrato: "🐈‍⬛", texto: "Podríamos votar, ¿no? Así es justo para todas." },
      { quien: "Mia", retrato: "🐱", texto: "¡Sí, votemos! …Pero si votan por las burbujas, ya no las invito a mi fiesta de cumpleaños. 😼" },
      { narra: "Mia cambió el juego: ya no es una idea mejor… es un poquito de chantaje. Nina, asustada, levanta la mano por el castillo." },
      { quien: "Pelu", retrato: "pelu", texto: "(Yo entiendo a Mia… a veces mi idea también me parece la mejor y quiero que se haga a mi manera. Pero esto… no se siente justo.)" },

      { eleccion: "Mia está manipulando para salirse con la suya. ¿Qué hace Pelu?", opciones: [
        { t: "🤐 Callarse: la idea de Mia igual es buena", ir: "callar" },
        { t: "✋ Decir que así no se hace", ir: "hablar" },
      ] },

      { etiqueta: "callar" },
      { quien: "Pelu", retrato: "pelu", texto: "(Mejor no digo nada… la idea del castillo igual se ve genial.)" },
      { narra: "Pero Nina baja la cabecita y aprieta los labios para no llorar. A Luna se le borra la sonrisa. Algo se siente feo. 😞" },
      { quien: "Pelu", retrato: "pelu", texto: "(Ganar así… no se siente como ganar. No puedo quedarme callada mientras Nina se siente tan mal.)" },
      { ir: "hablar" },

      { etiqueta: "hablar" },
      { quien: "Pelu", retrato: "pelu", texto: "Momento, Mia. Que no invites a alguien a tu fiesta por votar distinto… eso no es votar. Así no se hace." },
      { quien: "Mia", retrato: "🐱", texto: "¡Pero es que la idea de Nina es floja y la mía es MUCHO mejor! La feria tiene que quedar perfecta." },
      { quien: "Pelu", retrato: "pelu", texto: "Te entiendo más de lo que crees. A mí también me pasa: veo mi idea clarísima y quiero que se haga YA. Pero mira la cara de Nina." },
      { narra: "Todas miran a Nina, que tiene los ojitos aguados. 🥺" },
      { quien: "Pelu", retrato: "pelu", texto: "Cuando empujamos y hacemos sentir mal a las demás para ganar… ganamos el juego, pero perdemos a las amigas. Y eso duele más." },

      { reto: "¿Cuál de estas cosas es MANIPULAR (torcer todo para salirte con la tuya)?", opciones: [
        { t: "😼 “Vota por mí o no te invito a mi fiesta.”", ok: true },
        { t: "🙂 “Me gusta mi idea porque brilla; ¿ustedes qué opinan?”", nudge: "Eso es explicar y escuchar, ¡es justo! 🙂 Busca la que presiona o chantajea." },
        { t: "🗳️ “Votemos y aceptamos lo que salga.”", nudge: "Eso es lo más justo de todo 🗳️ Manipular es forzar el resultado, no aceptarlo." },
      ] },

      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Bien visto, Pelu. Ser muy lista es un don. La pregunta es: ¿lo usas para ganar tú sola… o para que TODAS brillen?" },

      { quien: "Pelu", retrato: "pelu", texto: "Nina, tu idea de los deseos me gustó de verdad. ¿Y si las juntamos en vez de elegir solo una?" },
      { reto: "La idea de Nina te parece floja, pero a ella le encanta. ¿Qué hace una amiga empática?", opciones: [
        { t: "💜 Unir las dos: un Castillo con Burbujas de los Deseos", ok: true },
        { t: "🙅 Decirle que su idea es mala para que gane la mía", nudge: "Eso la haría sentir peor 🙅 La empatía busca que TODAS participen." },
        { t: "🎭 Fingir que votamos, pero hacer la mía igual", nudge: "Eso es manipular otra vez 🎭 Prueba una idea donde todas ganen." },
      ] },

      { fondo: "feria", narra: "Juntaron todo: un Castillo de Fuego Púrpura ✨ con Burbujas de los Deseos 🫧 flotando en las torres. ¡Quedó increíble, y fue idea de TODAS!" },
      { quien: "Nina", retrato: "🐈", texto: "¿En serio usamos mi idea? ¡Gracias! Me sentía invisible…" },
      { quien: "Mia", retrato: "🐱", texto: "Perdón, Nina. Me emocioné tanto con ganar que no te escuché. La feria quedó mejor contigo dentro." },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "Ese es el verdadero hechizo: que nadie se quede afuera. 💜" },
      { quien: "Pelu", retrato: "pelu", texto: "(Mi cabeza va rápido y mis ideas me encantan… pero cuidar cómo se sienten las demás es la magia más linda.)" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "Una idea brillante que hace sentir mal a las demás pierde su brillo. La inteligencia que INCLUYE es la más poderosa de todas." },
      { narra: "Pelu aprendió que ser lista no es para salirse con la suya, sino para que todas puedan brillar juntas. La empatía también es magia. 💜🎪" },
      { fondo: "feria", narra: "Justo entonces suena la campana del colegio: ¡RIIING! 🔔 Es el último día antes de las vacaciones de invierno. ❄️" },
      { quien: "Directora Estela", retrato: "🧙‍♀️", texto: "¡Felices vacaciones, brujitas! Descansen, jueguen en la nieve… y guarden energía para lo que viene. ❄️✨" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "¡Vacaciones de invierno, Pelu! ¿Te imaginas todo lo que podríamos hacer con la nieve mágica? ⛄" },
      { quien: "Pelu", retrato: "pelu", texto: "¡No puedo esperar! Nuestra primera aventura de invierno juntas. 💜❄️" },
      { narra: "Y así, con la primera nevada cayendo sobre el colegio, empiezan las vacaciones de invierno de Pelu… ❄️🏰" },
      { fin: { estrellas: 20, mensaje: "Capítulo 4 completado. Aprendiste que manipular gana el juego pero pierde amigas — y que tu inteligencia sirve para incluir a todas. ¡Empiezan las vacaciones de invierno! ❄️ No te pierdas las aventuras que vienen… ⛄✨" } },
    ],

    /* ========================================================
       MINI-NOVELAS POR LUGAR: una historia corta que ENVUELVE
       un mini-juego. Estructura: intro → { juego } → cierre.
       Plantilla para replicar en cada tarjeta del mundo.
       ======================================================== */
    lago_pesca: [
      { fondo: "lago", narra: "Es una tarde de vacaciones. Pelu llega al Lago Brillante, donde el agua guarda peces de todos los colores. 🎣" },
      { quien: "Pelu", retrato: "pelu", texto: "¡Quiero pescar el pececito más lindo para mi colección! ¿Me acompañas?" },
      { quien: "Luna", retrato: "🐈‍⬛", texto: "¡Claro! Yo te aviso si veo uno raro. Baja el anzuelo con calma y paciencia… ¡como aprendiste! 💜" },
      { narra: "Mueve el anzuelo con las flechas, baja a atrapar los peces y llena la canasta. ¡A pescar! 🐟" },
      { juego: "pesca", lugar: "lago" },
      { fondo: "lago", narra: "¡Splash! Pelu saca la caña del agua con la canasta llena. Los peces brillan bajo la luna. ✨" },
      { quien: "Pelu", retrato: "pelu", texto: "¡Míralos, Luna! Los voy a cuidar muy bien. Gracias por pescar conmigo. 💜" },
      { narra: "Pelu guardó sus peces en la colección del Lago. Otra linda tarde de vacaciones de invierno. ❄️🐟" },
      { fin: { estrellas: 3, mensaje: "Volviste del Lago Brillante con Pelu. Tus peces quedaron en la colección. 🎣✨" } },
    ],

    cafe_intro: [
      { fondo: "cafe", narra: "El Café Mágico huele a vainilla y chocolate. Pelu empuja la puertita… ¡tolón! suena la campanita. 🔔" },
      { quien: "Nina", retrato: "🐈", texto: "¡Pelu! Estoy un poco triste hoy… ¿me ayudas a preparar algo rico para animarnos? 🥺" },
      { quien: "Pelu", retrato: "pelu", texto: "¡Claro que sí! Un postre hecho con cariño arregla cualquier día. ¡A la cocina! 🧁" },
      { narra: "Elige la receta, agrega los ingredientes en orden, mezcla y hornea. ¡Tú puedes, chef Pelu! 🍳" },
      { juego: "cocina", lugar: "cocina" },
      { fondo: "cafe", narra: "El postre sale calentito y brillante. Nina da el primer mordisco… y sonríe de oreja a oreja. 😋" },
      { quien: "Nina", retrato: "🐈", texto: "¡Está DELICIOSO! Gracias, Pelu. Ya me siento mucho mejor. 💜" },
      { quien: "Pelu", retrato: "pelu", texto: "Cocinar juntas es mi parte favorita. ¡Vuelve cuando quieras al Café! ☕" },
      { fin: { estrellas: 3, mensaje: "Cocinaste algo rico en el Café Mágico y alegraste a Nina. 🧁✨" } },
    ],

    casa_intro: [
      { fondo: "casita", narra: "Pelu llega a su casita del Valle. Todo está tranquilo y calientito. 🏠💜" },
      { quien: "Pelu", retrato: "pelu", texto: "¡Hogar dulce hogar! Tengo ganas de probarme ropa nueva y ordenar mi cuarto. ¿Me acompañas?" },
      { narra: "Vístela a tu gusto y decora las habitaciones: arrastra los objetos y hazle mimos a Pelu. 🧸👗" },
      { juego: "casa", lugar: "casa" },
      { fondo: "casita", narra: "Con la casa ordenada y un look nuevo, Pelu se acurruca feliz en su rincón favorito. 🌙" },
      { quien: "Pelu", retrato: "pelu", texto: "Mi casita es mi lugar seguro. Aquí siempre puedo ser yo misma. 💜" },
      { fin: { estrellas: 3, mensaje: "Pasaste un rato lindo en casa con Pelu. 🏠✨" } },
    ],
  },
};

if (typeof window !== "undefined") window.Historia = Historia;
