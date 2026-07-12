/* ============================================================
   PELU ADVENTURES — MUNDO CAMINABLE (modo "Historia")
   Un valle explorable estilo Sneaky Sasquatch: Pelu camina,
   habla con personajes y entra a las casas/lugares para jugar.
   Todo dibujado de forma procedural (sin imágenes). Pelu es su
   SVG de siempre. Cámara que sigue, y-sorting para profundidad.

   Retorno: al entrar a una actividad se guarda Mundo.pendiente
   con la posición; cuando la actividad vuelve por Juego.mapa()/
   entrar(), esos métodos detectan Mundo.pendiente y reabren el
   mundo donde estaba (ver game.js).
   ============================================================ */

const Mundo = {
  game: null,
  keys: { up: false, down: false, left: false, right: false, action: false },
  pendiente: null,          // {x,y} para reaparecer al volver de una actividad

  W: 1800, H: 1300,         // tamaño del valle
  VW: 960, VH: 540,         // viewport (canvas)

  start(spawn) {
    Mundo.spawn = spawn && spawn.x ? spawn : { x: 520, y: 820 };
    document.getElementById("app").style.display = "none";
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "block";
    cont.innerHTML = `
      <div id="phaser-canvas"></div>
      <button id="btn-salir-juego" onclick="Mundo.salir()">✕ Salir</button>
      <div id="mundo-dpad">
        <button class="mctrl" data-k="up">▲</button>
        <div class="mfila">
          <button class="mctrl" data-k="left">◀</button>
          <button class="mctrl" data-k="right">▶</button>
        </div>
        <button class="mctrl" data-k="down">▼</button>
      </div>
      <button id="mundo-accion" data-k="action">✋</button>`;

    // Controles táctiles -> Mundo.keys
    Mundo.keys = { up: false, down: false, left: false, right: false, action: false };
    cont.querySelectorAll("[data-k]").forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); Mundo.keys[k] = true; };
      const off = e => { e.preventDefault(); Mundo.keys[k] = false; };
      b.addEventListener("pointerdown", on);
      b.addEventListener("pointerup", off);
      b.addEventListener("pointerleave", off);
      b.addEventListener("pointercancel", off);
    });

    Mundo.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaser-canvas",
      width: Mundo.VW, height: Mundo.VH,
      backgroundColor: "#8fd36a",
      pixelArt: false,            // estética suave (no pixel) tipo Sneaky Sasquatch
      physics: { default: "arcade", arcade: { debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [MundoScene],
    });
  },

  salir() {
    Mundo.pendiente = null;
    if (Mundo.game) { Mundo.game.destroy(true); Mundo.game = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none"; cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    Juego.inicio();
  },

  // Entra a una actividad; recuerda dónde estaba Pelu para volver
  entrarActividad(peluX, peluY, fn) {
    Mundo.pendiente = { x: peluX, y: peluY };
    if (Mundo.game) { Mundo.game.destroy(true); Mundo.game = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none"; cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    fn();
  },
};

/* ============================================================ */
class MundoScene extends Phaser.Scene {
  constructor() { super("MundoScene"); }

  preload() { PeluSprite.cargar(this); }

  create() {
    const W = Mundo.W, H = Mundo.H;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    this.muros = this.physics.add.staticGroup();
    this.zonas = [];       // interacciones {x,y,r,tipo,label,run}
    this.dialogo = null;   // {lineas, i, nombre}

    this.dibujarSuelo();
    this.dibujarDecoracion();
    this.crearLugares();
    this.crearNPCs();

    // --- Pelu ---
    const s = Mundo.spawn;
    this.pelu = this.physics.add.image(s.x, s.y, "pelu").setScale(0.34);
    this.pelu.body.setCollideWorldBounds(true);
    this.pelu.body.setSize(96, 70);
    this.pelu.body.setOffset(27, 88);   // caja de colisión en las patas
    this.physics.add.collider(this.pelu, this.muros);
    this.cameras.main.startFollow(this.pelu, true, 0.12, 0.12);

    // --- Teclado ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaAccion = this.input.keyboard.addKeys({ sp: Phaser.Input.Keyboard.KeyCodes.SPACE, en: Phaser.Input.Keyboard.KeyCodes.ENTER });
    this._prevAccion = false;

    // --- Cartel de interacción (fijo a la cámara) ---
    this.prompt = this.add.text(Mundo.VW / 2, Mundo.VH - 64, "", {
      fontFamily: "system-ui, sans-serif", fontSize: "22px", color: "#4a2a4a",
      backgroundColor: "#fff7fc", padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9000).setVisible(false);

    // Rótulo de bienvenida
    this.toastMundo("¡Explora el valle de Pelu! 🐾  Camina y toca ✋ para hablar o entrar.");
  }

  /* --------- SUELO: pasto, caminos, río, lago --------- */
  dibujarSuelo() {
    const W = Mundo.W, H = Mundo.H;
    const g = this.add.graphics().setDepth(0);

    // Pasto base + parches suaves
    g.fillStyle(0x84cb5c, 1).fillRect(0, 0, W, H);
    const parche = (x, y, rx, ry, c) => { g.fillStyle(c, 1).fillEllipse(x, y, rx, ry); };
    for (let i = 0; i < 46; i++) {
      const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(0, H);
      parche(x, y, Phaser.Math.Between(120, 320), Phaser.Math.Between(90, 220),
        Phaser.Math.RND.pick([0x93d46a, 0x77bd50, 0x8ed064]));
    }

    // Caminos de tierra (uniendo casa - colegio - tienda - café)
    const camino = (pts, ancho) => {
      g.lineStyle(ancho + 10, 0xd0b26c, 1);
      this.trazo(g, pts);
      g.lineStyle(ancho, 0xe6cf94, 1);
      this.trazo(g, pts);
    };
    camino([[520, 860], [700, 620], [900, 470]], 60);      // casa -> café -> colegio
    camino([[900, 470], [1240, 720], [1440, 940]], 56);    // colegio -> tienda
    camino([[520, 860], [1160, 560]], 46);                 // atajo hacia el lago

    // Río (banda azul ondulada, decorativa) + puente
    g.fillStyle(0x4fb0e4, 1);
    const rio = [];
    for (let y = -40; y <= H + 40; y += 40) {
      rio.push([200 + Math.sin(y / 130) * 70, y]);
    }
    this.banda(g, rio, 90, 0x4fb0e4);
    this.banda(g, rio, 54, 0x8ad4f2);
    // Puente de madera sobre el río (en el camino)
    g.fillStyle(0xb5814e, 1).fillRoundedRect(120, 812, 190, 84, 10);
    g.fillStyle(0x9c6b3f, 1);
    for (let i = 0; i < 6; i++) g.fillRect(132 + i * 30, 818, 16, 72);

    // Lago (elipse) con orilla de arena + brillo; zona de pesca
    const LX = 1420, LY = 360, LRX = 300, LRY = 210;
    g.fillStyle(0xead6a0, 1).fillEllipse(LX, LY, LRX * 2 + 60, LRY * 2 + 46);
    g.fillStyle(0x3fa9e0, 1).fillEllipse(LX, LY, LRX * 2, LRY * 2);
    g.fillStyle(0x7fcaf0, 0.6).fillEllipse(LX - 60, LY - 50, LRX, LRY * 0.7);
    // Muelle de madera hacia el lago
    g.fillStyle(0xb5814e, 1).fillRoundedRect(1150, 470, 150, 46, 8);
    // El lago bloquea el paso (colisión aproximada con varios rects)
    this.bloquearElipse(LX, LY + 20, LRX - 30, LRY - 20);
    this.lagoZona = { x: 1150, y: 500 };
  }

  // traza una polilínea suave
  trazo(g, pts) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
  }
  // dibuja una "banda" gruesa a lo largo de una polilínea (para el río)
  banda(g, pts, ancho, color) {
    g.lineStyle(ancho, color, 1);
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
  }
  // aproxima el bloqueo de una elipse con rectángulos estáticos
  bloquearElipse(cx, cy, rx, ry) {
    const pasos = 5;
    for (let i = 0; i < pasos; i++) {
      const t = (i + 0.5) / pasos;
      const yy = cy - ry + t * 2 * ry;
      const w = 2 * rx * Math.sqrt(Math.max(0, 1 - Math.pow((yy - cy) / ry, 2)));
      this.muro(cx, yy, w, (2 * ry) / pasos + 6);
    }
  }

  // crea un muro invisible (colisión)
  muro(x, y, w, h) {
    const r = this.add.rectangle(x, y, w, h).setVisible(false);
    this.physics.add.existing(r, true);
    this.muros.add(r);
    return r;
  }

  /* --------- ÁRBOLES, ARBUSTOS, FLORES, ROCAS --------- */
  dibujarDecoracion() {
    const W = Mundo.W, H = Mundo.H;
    // Árboles (con y-sorting y colisión de tronco)
    const arboles = [
      [340, 420], [520, 300], [760, 260], [1080, 250], [250, 640], [1620, 720],
      [1500, 1080], [1180, 1120], [820, 1180], [420, 1120], [1360, 600], [640, 900],
      [980, 760], [1260, 980], [160, 380], [1680, 460], [720, 1000], [300, 980],
    ];
    arboles.forEach(([x, y]) => this.arbol(x, y));

    // Arbustos y flores (decorativos, sin colisión)
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(60, W - 60), y = Phaser.Math.Between(60, H - 60);
      this.arbusto(x, y);
    }
    const flores = ["🌼", "🌸", "🌷", "🌻"];
    for (let i = 0; i < 34; i++) {
      const x = Phaser.Math.Between(60, W - 60), y = Phaser.Math.Between(60, H - 60);
      this.add.text(x, y, Phaser.Math.RND.pick(flores), { fontSize: "20px" }).setOrigin(0.5).setDepth(y - 20);
    }
    const rocas = [[600, 700], [1300, 430], [900, 1050], [1550, 900]];
    rocas.forEach(([x, y]) => this.add.text(x, y, "🪨", { fontSize: "26px" }).setOrigin(0.5).setDepth(y));
  }

  arbol(x, y) {
    // sombra en el suelo
    this.add.graphics().setDepth(1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + 6, 78, 30);
    const c = this.add.container(x, y).setDepth(y);
    const g = this.add.graphics();
    g.fillStyle(0x9c6b3f, 1).fillRoundedRect(-9, -18, 18, 34, 5);       // tronco
    g.fillStyle(0x3f8a3d, 1).fillCircle(-24, -46, 34);                   // copa
    g.fillStyle(0x3f8a3d, 1).fillCircle(24, -46, 34);
    g.fillStyle(0x4e9d4a, 1).fillCircle(0, -70, 42);
    g.fillStyle(0x5fb45a, 1).fillCircle(-10, -80, 20);                   // brillo
    c.add(g);
    // tronco bloquea el paso
    this.muro(x, y + 6, 26, 18);
  }

  arbusto(x, y) {
    const g = this.add.graphics().setDepth(y - 10);
    g.fillStyle(0x2a3a24, 0.14).fillEllipse(x, y + 4, 44, 16);
    g.fillStyle(0x3f8a3d, 1).fillCircle(x - 12, y, 15);
    g.fillStyle(0x4e9d4a, 1).fillCircle(x + 2, y - 4, 17);
    g.fillStyle(0x4e9d4a, 1).fillCircle(x + 14, y, 14);
  }

  /* --------- CASAS / LUGARES (con entrada) --------- */
  crearLugares() {
    // Casa de Pelu -> vestir y decorar
    this.casa(360, 800, 0xf6e3c9, 0xd9694f, "🏠", "Casa de Pelu", () =>
      Mundo.entrarActividad(430, 860, () => Juego.casa()));

    // Colegio de Brujitas -> capítulos de la novela
    this.casa(900, 360, 0xd7c3f0, 0x7d5ba6, "🏰", "Colegio", () =>
      Mundo.entrarActividad(900, 470, () => Juego.lugar("colegio")), 1.35);

    // Café Mágico -> cocina
    this.casa(700, 540, 0xffe0c0, 0xe08a3c, "🧁", "Café", () =>
      Mundo.entrarActividad(640, 620, () => PeluCook.start("cocina")));

    // Tienda del pueblo -> comprar
    this.casa(1440, 940, 0xf7e2a6, 0xe0a63c, "🏪", "Tienda", () =>
      Mundo.entrarActividad(1360, 1000, () => Juego.tienda("ropa")));

    // Lago -> pesca (zona en el muelle)
    this.zonas.push({
      x: this.lagoZona.x, y: this.lagoZona.y, r: 90, tipo: "lugar", label: "🎣 Pescar en el lago",
      run: () => Mundo.entrarActividad(1150, 560, () => PeluFish.start("lago")),
    });
    this.add.text(this.lagoZona.x, this.lagoZona.y - 10, "🎣", { fontSize: "30px" }).setOrigin(0.5).setDepth(this.lagoZona.y);
  }

  // Dibuja una casita cuqui y registra su zona de entrada
  casa(x, y, muro, techo, emoji, nombre, run, esc = 1) {
    const w = 150 * esc, h = 110 * esc;
    this.add.graphics().setDepth(1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + h / 2, w * 1.05, 34);
    const c = this.add.container(x, y).setDepth(y + h / 2);
    const g = this.add.graphics();
    g.fillStyle(muro, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);          // cuerpo
    g.fillStyle(techo, 1).fillTriangle(-w / 2 - 14, -h / 2 + 6, w / 2 + 14, -h / 2 + 6, 0, -h / 2 - 62 * esc); // techo
    g.fillStyle(0x9fd8f0, 1).fillRoundedRect(-w / 2 + 18, -h / 2 + 24, 34 * esc, 34 * esc, 6); // ventana
    g.fillStyle(0x8a5a3c, 1).fillRoundedRect(w / 2 - 52 * esc, -6, 40 * esc, h / 2 + 6, 6);   // puerta
    g.fillStyle(0xffe08a, 1).fillCircle(w / 2 - 20 * esc, h / 4, 3);         // manija
    c.add(g);
    // cartel con emoji + nombre
    this.add.text(x, y - h / 2 - 66 * esc, emoji, { fontSize: `${34 * esc}px` }).setOrigin(0.5).setDepth(y + h);
    this.add.text(x, y + h / 2 + 14, nombre, {
      fontFamily: "system-ui, sans-serif", fontSize: "18px", color: "#fff",
      stroke: "#00000055", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9000);
    // colisión del cuerpo (para no atravesar la casa)
    this.muro(x, y + 6, w * 0.9, h * 0.8);
    // zona de entrada frente a la puerta
    this.zonas.push({ x: x + w / 2 - 20, y: y + h / 2 + 26, r: 80, tipo: "lugar", label: `Entrar: ${nombre}`, run });
  }

  /* --------- PERSONAJES (hablar) --------- */
  crearNPCs() {
    this.npc(980, 440, "🧙‍♀️", "Directora Estela", [
      "¡Hola, Pelu! Bienvenida al valle.",
      "En el Colegio te esperan nuevas aventuras… entra cuando quieras. 🏰",
      "Recuerda: ser diferente es tu superpoder. ✨",
    ]);
    this.npc(1080, 400, "🐱", "Mia", [
      "Hey, Pelu. Perdón por lo de la feria…",
      "Aprendí que ganar sola no es tan divertido. ¿Jugamos juntas? 💜",
    ]);
    this.npc(1170, 560, "🐈‍⬛", "Luna", [
      "¡Pelu! ¿Vamos a pescar al lago? 🎣",
      "Tú tranquila, con paciencia sale el pez más lindo.",
    ]);
    this.npc(520, 960, "🐈", "Nina", [
      "Estas flores son mágicas… ¿las hueles? 🌸",
      "Gracias por incluirme siempre, Pelu.",
    ]);
  }

  npc(x, y, emoji, nombre, lineas) {
    this.add.graphics().setDepth(y - 1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + 16, 44, 16);
    this.add.text(x, y, emoji, { fontSize: "40px" }).setOrigin(0.5).setDepth(y);
    this.add.text(x, y - 34, nombre, {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#fff",
      stroke: "#00000055", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9000);
    this.zonas.push({ x, y, r: 78, tipo: "npc", nombre, lineas, label: `Hablar con ${nombre}` });
  }

  /* --------- BUCLE --------- */
  update() {
    if (!this.pelu) return;
    const k = Mundo.keys, cur = this.cursors;
    const accion = k.action || this.teclaAccion.sp.isDown || this.teclaAccion.en.isDown;
    const accionPress = accion && !this._prevAccion;   // flanco de subida
    this._prevAccion = accion;

    // Diálogo abierto: la acción avanza / cierra; sin moverse
    if (this.dialogo) {
      this.pelu.body.setVelocity(0, 0);
      if (accionPress) this.avanzarDialogo();
      return;
    }

    // Movimiento
    const v = 210;
    let vx = 0, vy = 0;
    if (k.left || cur.left.isDown) vx = -1;
    else if (k.right || cur.right.isDown) vx = 1;
    if (k.up || cur.up.isDown) vy = -1;
    else if (k.down || cur.down.isDown) vy = 1;
    const len = Math.hypot(vx, vy) || 1;
    this.pelu.body.setVelocity((vx / len) * v, (vy / len) * v);
    if (vx < 0) this.pelu.setFlipX(true);
    else if (vx > 0) this.pelu.setFlipX(false);
    // pequeño rebote al caminar
    const mov = vx || vy;
    this.pelu.setScale(0.34, 0.34 + (mov ? Math.abs(Math.sin(this.time.now / 90)) * 0.03 : 0));
    this.pelu.setDepth(this.pelu.y);

    // Zona más cercana en rango
    let cerca = null, dmin = 1e9;
    for (const z of this.zonas) {
      const d = Phaser.Math.Distance.Between(this.pelu.x, this.pelu.y, z.x, z.y);
      if (d < z.r && d < dmin) { dmin = d; cerca = z; }
    }
    this.zonaActiva = cerca;
    if (cerca) { this.prompt.setText("✋ " + cerca.label).setVisible(true); }
    else this.prompt.setVisible(false);

    if (accionPress && cerca) {
      if (cerca.tipo === "npc") this.abrirDialogo(cerca);
      else if (cerca.run) cerca.run();
    }
  }

  /* --------- DIÁLOGO --------- */
  abrirDialogo(z) {
    this.dialogo = { lineas: z.lineas, i: 0, nombre: z.nombre };
    this.prompt.setVisible(false);
    this.cajaDialogo = this.add.container(Mundo.VW / 2, Mundo.VH - 92).setScrollFactor(0).setDepth(9500);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.97).fillRoundedRect(-410, -60, 820, 118, 18);
    g.lineStyle(4, 0xff9ecb, 1).strokeRoundedRect(-410, -60, 820, 118, 18);
    this.txtNombre = this.add.text(-392, -48, "", { fontFamily: "system-ui, sans-serif", fontSize: "18px", color: "#c2477e", fontStyle: "bold" });
    this.txtLinea = this.add.text(-392, -18, "", { fontFamily: "system-ui, sans-serif", fontSize: "22px", color: "#3a2a3a", wordWrap: { width: 780 } });
    this.txtSeguir = this.add.text(392, 40, "✋ seguir ▶", { fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#b090a0" }).setOrigin(1, 0.5);
    this.cajaDialogo.add([g, this.txtNombre, this.txtLinea, this.txtSeguir]);
    this.pintarDialogo();
  }

  pintarDialogo() {
    this.txtNombre.setText(this.dialogo.nombre);
    this.txtLinea.setText(this.dialogo.lineas[this.dialogo.i]);
  }

  avanzarDialogo() {
    this.dialogo.i++;
    if (this.dialogo.i >= this.dialogo.lineas.length) {
      this.cajaDialogo.destroy();
      this.dialogo = null;
    } else this.pintarDialogo();
  }

  toastMundo(txt) {
    const t = this.add.text(Mundo.VW / 2, 40, txt, {
      fontFamily: "system-ui, sans-serif", fontSize: "17px", color: "#4a2a4a",
      backgroundColor: "#fff7fcdd", padding: { x: 14, y: 8 }, align: "center",
      wordWrap: { width: Mundo.VW - 80 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(9000);
    this.tweens.add({ targets: t, alpha: 0, delay: 3800, duration: 900, onComplete: () => t.destroy() });
  }
}

if (typeof window !== "undefined") window.Mundo = Mundo;
