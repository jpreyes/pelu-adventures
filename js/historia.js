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
      { fin: { estrellas: 20, mensaje: "Capítulo 3 completado. Aprendiste a reconocer la “voz mentirosa” y a responderle con la verdad. ¡Eres tu propia amiga! Pronto habrá más aventuras en el colegio…" } },
    ],
  },
};

if (typeof window !== "undefined") window.Historia = Historia;
