/* ============================================================
   PELU ADVENTURES — MUNDOS CAMINABLES (modo "Historia")
   Varios mundos explorables estilo Sneaky Sasquatch: el Valle
   (hub), la Playa, la Isla Aventura, la Pista de Carreras y el
   Volcán. Se viaja entre mundos por "portales" (carteles).
   Todo dibujado de forma procedural (sin imágenes). Pelu es su
   SVG de siempre. Cámara que sigue, y-sorting por las patas.

   Retorno de actividades: Mundo.entrarActividad guarda
   Mundo.pendiente {x,y}; Juego.mapa()/entrar() lo detectan y
   reabren el mundo actual donde estaba (ver game.js).
   ============================================================ */

const Mundo = {
  game: null,
  keys: { up: false, down: false, left: false, right: false, action: false },
  pendiente: null,          // {x,y} para reaparecer al volver de una actividad
  actual: "valle",          // id del mundo activo
  spawn: null,              // punto de aparición para el próximo start
  VW: 960, VH: 540,         // viewport (canvas)

  start(world = "valle", spawn) {
    Mundo.actual = world;
    Mundo.spawn = spawn && spawn.x ? spawn : null;
    document.getElementById("app").style.display = "none";
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "block";
    // Montar el DOM (canvas + controles) solo una vez
    if (!document.getElementById("phaser-canvas")) {
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
    }
    if (Mundo.game) { Mundo.game.destroy(true); Mundo.game = null; }
    Mundo.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaser-canvas",
      width: Mundo.VW, height: Mundo.VH,
      backgroundColor: "#8fd36a",
      pixelArt: false,
      physics: { default: "arcade", arcade: { debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [MundoScene],
    });
  },

  // Viajar a otro mundo (por un portal)
  irA(world, spawn) { Mundo.pendiente = null; Mundo.start(world, spawn); },

  salir() {
    Mundo.pendiente = null;
    if (Mundo.game) { Mundo.game.destroy(true); Mundo.game = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none"; cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    Juego.inicio();
  },

  // Entra a una actividad; recuerda dónde estaba Pelu (y en qué mundo) para volver
  entrarActividad(peluX, peluY, fn) {
    Mundo.pendiente = { x: peluX, y: peluY };
    if (Mundo.game) { Mundo.game.destroy(true); Mundo.game = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none"; cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    fn();
  },

  // Reabrir el mundo actual tras una actividad (lo llama game.js)
  reanudar(spawn) { Mundo.start(Mundo.actual, spawn); },
};

/* ============================================================
   ESCENA — común para todos los mundos. Lee MUNDOS[Mundo.actual]
   y llama a su construir(scene) para dibujar su contenido.
   ============================================================ */
class MundoScene extends Phaser.Scene {
  constructor() { super("MundoScene"); }

  preload() { PeluSprite.cargar(this); }

  create() {
    const def = MUNDOS[Mundo.actual] || MUNDOS.valle;
    this.def = def;
    this.physics.world.setBounds(0, 0, def.W, def.H);
    this.cameras.main.setBounds(0, 0, def.W, def.H);
    this.cameras.main.setBackgroundColor(def.cielo || "#8fd36a");

    this.muros = this.physics.add.staticGroup();
    this.zonas = [];
    this.dialogo = null;

    def.construir(this);   // dibuja el mundo (suelo, deco, casas, npcs, portales)

    // --- Pelu ---
    const s = (Mundo.spawn && Mundo.spawn.x) ? Mundo.spawn : def.spawn;
    this.pelu = this.physics.add.image(s.x, s.y, "pelu").setScale(0.34);
    this.pelu.body.setCollideWorldBounds(true);
    this.pelu.body.setSize(96, 70);
    this.pelu.body.setOffset(27, 88);
    this.physics.add.collider(this.pelu, this.muros);
    this.cameras.main.startFollow(this.pelu, true, 0.12, 0.12);

    // --- Teclado ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaAccion = this.input.keyboard.addKeys({ sp: Phaser.Input.Keyboard.KeyCodes.SPACE, en: Phaser.Input.Keyboard.KeyCodes.ENTER });
    this._prevAccion = false;

    this.prompt = this.add.text(Mundo.VW / 2, Mundo.VH - 64, "", {
      fontFamily: "system-ui, sans-serif", fontSize: "22px", color: "#4a2a4a",
      backgroundColor: "#fff7fc", padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9000).setVisible(false);

    this.toastMundo(def.bienvenida || `¡${def.nombre}! 🐾  Camina y toca ✋ para hablar, entrar o viajar.`);
  }

  /* ---------------- HELPERS DE DIBUJO (usados por los mundos) --------------- */

  // pinta un suelo base con parches suaves de color
  suelo(base, parches, densidad = 44) {
    const W = this.def.W, H = this.def.H;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(base, 1).fillRect(0, 0, W, H);
    for (let i = 0; i < densidad; i++) {
      const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(0, H);
      g.fillStyle(Phaser.Math.RND.pick(parches), 1)
        .fillEllipse(x, y, Phaser.Math.Between(120, 320), Phaser.Math.Between(90, 220));
    }
    return g;
  }

  // camino de tierra a lo largo de una polilínea
  camino(g, pts, ancho, c1 = 0xd0b26c, c2 = 0xe6cf94) {
    g.lineStyle(ancho + 10, c1, 1); this.trazo(g, pts);
    g.lineStyle(ancho, c2, 1); this.trazo(g, pts);
  }
  trazo(g, pts) {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
  }
  banda(g, pts, ancho, color) {
    g.lineStyle(ancho, color, 1);
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
  }
  bloquearElipse(cx, cy, rx, ry) {
    const pasos = 5;
    for (let i = 0; i < pasos; i++) {
      const t = (i + 0.5) / pasos, yy = cy - ry + t * 2 * ry;
      const w = 2 * rx * Math.sqrt(Math.max(0, 1 - Math.pow((yy - cy) / ry, 2)));
      this.muro(cx, yy, w, (2 * ry) / pasos + 6);
    }
  }
  muro(x, y, w, h) {
    const r = this.add.rectangle(x, y, w, h).setVisible(false);
    this.physics.add.existing(r, true);
    this.muros.add(r);
    return r;
  }

  arbol(x, y) {
    this.add.graphics().setDepth(1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + 6, 78, 30);
    const c = this.add.container(x, y).setDepth(y + 16);
    const g = this.add.graphics();
    g.fillStyle(0x9c6b3f, 1).fillRoundedRect(-9, -18, 18, 34, 5);
    g.fillStyle(0x3f8a3d, 1).fillCircle(-24, -46, 34);
    g.fillStyle(0x3f8a3d, 1).fillCircle(24, -46, 34);
    g.fillStyle(0x4e9d4a, 1).fillCircle(0, -70, 42);
    g.fillStyle(0x5fb45a, 1).fillCircle(-10, -80, 20);
    c.add(g);
    this.muro(x, y + 6, 26, 18);
  }
  palmera(x, y) {
    this.add.graphics().setDepth(1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + 6, 70, 26);
    const c = this.add.container(x, y).setDepth(y + 16);
    const g = this.add.graphics();
    g.fillStyle(0xb0763f, 1).fillRoundedRect(-8, -66, 16, 84, 6);           // tronco alto
    g.fillStyle(0x3f9a4d, 1);
    [[-1, -1], [1, -1], [-1.3, -0.2], [1.3, -0.2], [0, -1.4]].forEach(([dx, dy]) =>
      g.fillEllipse(dx * 34, -70 + dy * 12, 60, 26));
    g.fillStyle(0x8a5a2c, 1).fillCircle(0, -66, 6);                          // cocos
    c.add(g);
    this.muro(x, y + 6, 22, 16);
  }
  arbusto(x, y) {
    const g = this.add.graphics().setDepth(y - 10);
    g.fillStyle(0x2a3a24, 0.14).fillEllipse(x, y + 4, 44, 16);
    g.fillStyle(0x3f8a3d, 1).fillCircle(x - 12, y, 15);
    g.fillStyle(0x4e9d4a, 1).fillCircle(x + 2, y - 4, 17);
    g.fillStyle(0x4e9d4a, 1).fillCircle(x + 14, y, 14);
  }
  roca(x, y, s = 26) { this.add.text(x, y, "🪨", { fontSize: s + "px" }).setOrigin(0.5).setDepth(y); }
  emojiDeco(x, y, e, s = 20) { this.add.text(x, y, e, { fontSize: s + "px" }).setOrigin(0.5).setDepth(y - 20); }

  // Casita con puerta -> zona de entrada
  casa(x, y, muro, techo, emoji, nombre, run, esc = 1) {
    const w = 150 * esc, h = 110 * esc;
    this.add.graphics().setDepth(1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + h / 2, w * 1.05, 34);
    const c = this.add.container(x, y).setDepth(y + h / 2);
    const g = this.add.graphics();
    g.fillStyle(muro, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.fillStyle(techo, 1).fillTriangle(-w / 2 - 14, -h / 2 + 6, w / 2 + 14, -h / 2 + 6, 0, -h / 2 - 62 * esc);
    g.fillStyle(0x9fd8f0, 1).fillRoundedRect(-w / 2 + 18, -h / 2 + 24, 34 * esc, 34 * esc, 6);
    g.fillStyle(0x8a5a3c, 1).fillRoundedRect(w / 2 - 52 * esc, -6, 40 * esc, h / 2 + 6, 6);
    g.fillStyle(0xffe08a, 1).fillCircle(w / 2 - 20 * esc, h / 4, 3);
    c.add(g);
    this.add.text(x, y - h / 2 - 66 * esc, emoji, { fontSize: `${34 * esc}px` }).setOrigin(0.5).setDepth(y + h);
    this.add.text(x, y + h / 2 + 14, nombre, {
      fontFamily: "system-ui, sans-serif", fontSize: "18px", color: "#fff", stroke: "#00000055", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9000);
    this.muro(x, y, w * 0.96, h);
    this.zonas.push({ x: x + w / 2 - 20, y: y + h / 2 + 26, r: 80, tipo: "lugar", label: `Entrar: ${nombre}`, run });
  }

  // Entrada simple (cueva/cartel de actividad) sin casa
  entrada(x, y, emoji, nombre, run, color = 0x6a4a3a) {
    this.add.graphics().setDepth(1).fillStyle(0x2a3a24, 0.18).fillEllipse(x, y + 20, 90, 30);
    const g = this.add.graphics().setDepth(y);
    g.fillStyle(color, 1).fillEllipse(x, y, 96, 80);               // boca/arco
    g.fillStyle(0x241a1a, 1).fillEllipse(x, y + 6, 64, 56);        // oscuridad
    this.add.text(x, y, emoji, { fontSize: "40px" }).setOrigin(0.5).setDepth(y + 1);
    this.add.text(x, y + 54, nombre, {
      fontFamily: "system-ui, sans-serif", fontSize: "17px", color: "#fff", stroke: "#00000066", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9000);
    this.zonas.push({ x, y: y + 40, r: 82, tipo: "lugar", label: `Entrar: ${nombre}`, run });
  }

  // Portal a otro mundo (cartel de madera)
  portal(x, y, emoji, label, destino, spawnDest) {
    this.add.graphics().setDepth(y - 1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + 26, 54, 16);
    const g = this.add.graphics().setDepth(y);
    g.fillStyle(0x9c6b3f, 1).fillRoundedRect(x - 6, y - 4, 12, 40, 3);
    g.fillStyle(0xead6a0, 1).fillRoundedRect(x - 52, y - 44, 104, 42, 8);
    g.lineStyle(3, 0xc9a86a, 1).strokeRoundedRect(x - 52, y - 44, 104, 42, 8);
    this.add.text(x, y - 34, emoji, { fontSize: "26px" }).setOrigin(0.5).setDepth(9000);
    this.add.text(x, y - 12, label, {
      fontFamily: "system-ui, sans-serif", fontSize: "14px", color: "#7a4a2a", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(9000);
    this.zonas.push({ x, y: y + 6, r: 84, tipo: "portal", label: `Viajar: ${label}`, run: () => Mundo.irA(destino, spawnDest) });
  }

  // Personaje con diálogo
  npc(x, y, emoji, nombre, lineas) {
    this.add.graphics().setDepth(y - 1).fillStyle(0x2a3a24, 0.16).fillEllipse(x, y + 16, 44, 16);
    this.add.text(x, y, emoji, { fontSize: "40px" }).setOrigin(0.5).setDepth(y);
    this.add.text(x, y - 34, nombre, {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#fff", stroke: "#00000055", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9000);
    this.zonas.push({ x, y, r: 78, tipo: "npc", nombre, lineas, label: `Hablar con ${nombre}` });
  }

  // Animalito ambiente (se mueve solo). Opcional: {nombre, lineas} para hablarle
  animal(x, y, emoji, opts = {}) {
    const size = opts.size || 26;
    this.add.graphics().setDepth(y - 2).fillStyle(0x2a3a24, 0.13).fillEllipse(x, y + size * 0.38, size * 0.9, size * 0.34);
    const t = this.add.text(x, y, emoji, { fontSize: size + "px" }).setOrigin(0.5).setDepth(y);
    if (opts.wander !== false) {
      this.tweens.add({
        targets: t, x: x + Phaser.Math.Between(-46, 46), y: y + Phaser.Math.Between(-24, 24),
        duration: Phaser.Math.Between(1600, 2800), yoyo: true, repeat: -1, ease: "sine.inout",
      });
    }
    if (opts.nombre) this.zonas.push({ x, y, r: 68, tipo: "npc", nombre: opts.nombre, lineas: opts.lineas || ["¡Hola!"], label: `Hablar con ${opts.nombre}` });
    return t;
  }

  /* ---------------- BUCLE ---------------- */
  update() {
    if (!this.pelu) return;
    const k = Mundo.keys, cur = this.cursors;
    const accion = k.action || this.teclaAccion.sp.isDown || this.teclaAccion.en.isDown;
    const accionPress = accion && !this._prevAccion;
    this._prevAccion = accion;

    if (this.dialogo) {
      this.pelu.body.setVelocity(0, 0);
      if (accionPress) this.avanzarDialogo();
      return;
    }

    const v = 210;
    let vx = 0, vy = 0;
    if (k.left || cur.left.isDown) vx = -1;
    else if (k.right || cur.right.isDown) vx = 1;
    if (k.up || cur.up.isDown) vy = -1;
    else if (k.down || cur.down.isDown) vy = 1;
    const len = Math.hypot(vx, vy) || 1;
    this.pelu.body.setVelocity((vx / len) * v, (vy / len) * v);
    if (vx < 0) this.pelu.setFlipX(true); else if (vx > 0) this.pelu.setFlipX(false);
    const mov = vx || vy;
    this.pelu.setScale(0.34, 0.34 + (mov ? Math.abs(Math.sin(this.time.now / 90)) * 0.03 : 0));
    this.pelu.setDepth(this.pelu.y + 24);   // profundidad por las patas

    let cerca = null, dmin = 1e9;
    for (const z of this.zonas) {
      const d = Phaser.Math.Distance.Between(this.pelu.x, this.pelu.y, z.x, z.y);
      if (d < z.r && d < dmin) { dmin = d; cerca = z; }
    }
    this.zonaActiva = cerca;
    if (cerca) this.prompt.setText("✋ " + cerca.label).setVisible(true);
    else this.prompt.setVisible(false);

    if (accionPress && cerca) {
      if (cerca.tipo === "npc") this.abrirDialogo(cerca);
      else if (cerca.run) cerca.run();
    }
  }

  /* ---------------- DIÁLOGO ---------------- */
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
    if (this.dialogo.i >= this.dialogo.lineas.length) { this.cajaDialogo.destroy(); this.dialogo = null; }
    else this.pintarDialogo();
  }
  toastMundo(txt) {
    const t = this.add.text(Mundo.VW / 2, 40, txt, {
      fontFamily: "system-ui, sans-serif", fontSize: "17px", color: "#4a2a4a",
      backgroundColor: "#fff7fcdd", padding: { x: 14, y: 8 }, align: "center", wordWrap: { width: Mundo.VW - 80 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(9000);
    this.tweens.add({ targets: t, alpha: 0, delay: 3800, duration: 900, onComplete: () => t.destroy() });
  }
}

/* ============================================================
   DEFINICIÓN DE LOS MUNDOS
   ============================================================ */
const MUNDOS = {

  /* ------------------------- EL VALLE (hub) ------------------------- */
  valle: {
    nombre: "Valle de Pelu", W: 1800, H: 1300, cielo: "#8fd36a", spawn: { x: 520, y: 820 },
    bienvenida: "¡Explora el Valle de Pelu! 🐾  Toca ✋ para hablar, entrar a las casas o viajar por los carteles.",
    construir(sc) {
      // Suelo + caminos + río + lago
      const g = sc.suelo(0x84cb5c, [0x93d46a, 0x77bd50, 0x8ed064], 46);
      sc.camino(g, [[360, 900], [700, 560], [980, 470]], 58);
      sc.camino(g, [[980, 470], [1240, 720], [1460, 1010]], 56);
      sc.camino(g, [[700, 560], [1150, 520]], 44);
      // Río + puente
      const rio = []; for (let y = -40; y <= sc.def.H + 40; y += 40) rio.push([200 + Math.sin(y / 130) * 70, y]);
      sc.banda(g, rio, 90, 0x4fb0e4); sc.banda(g, rio, 54, 0x8ad4f2);
      g.fillStyle(0xb5814e, 1).fillRoundedRect(120, 812, 190, 84, 10);
      g.fillStyle(0x9c6b3f, 1); for (let i = 0; i < 6; i++) g.fillRect(132 + i * 30, 818, 16, 72);
      // Lago
      const LX = 1420, LY = 360, LRX = 300, LRY = 210;
      g.fillStyle(0xead6a0, 1).fillEllipse(LX, LY, LRX * 2 + 60, LRY * 2 + 46);
      g.fillStyle(0x3fa9e0, 1).fillEllipse(LX, LY, LRX * 2, LRY * 2);
      g.fillStyle(0x7fcaf0, 0.6).fillEllipse(LX - 60, LY - 50, LRX, LRY * 0.7);
      g.fillStyle(0xb5814e, 1).fillRoundedRect(1150, 470, 150, 46, 8);
      sc.bloquearElipse(LX, LY + 20, LRX - 30, LRY - 20);

      // Árboles / arbustos / flores / rocas
      [[340, 420], [520, 300], [760, 260], [1080, 250], [250, 640], [1620, 720], [1500, 1080],
       [1180, 1120], [820, 1180], [420, 1120], [1360, 600], [640, 900], [980, 760], [1260, 980],
       [160, 380], [1680, 460], [720, 1000], [300, 980]].forEach(([x, y]) => sc.arbol(x, y));
      for (let i = 0; i < 40; i++) sc.arbusto(Phaser.Math.Between(60, sc.def.W - 60), Phaser.Math.Between(60, sc.def.H - 60));
      const flores = ["🌼", "🌸", "🌷", "🌻"];
      for (let i = 0; i < 34; i++) sc.emojiDeco(Phaser.Math.Between(60, sc.def.W - 60), Phaser.Math.Between(60, sc.def.H - 60), Phaser.Math.RND.pick(flores));
      [[600, 700], [1300, 430], [900, 1050], [1550, 900]].forEach(([x, y]) => sc.roca(x, y));

      // Casas (con MINI-HISTORIAS)
      sc.casa(360, 770, 0xf6e3c9, 0xd9694f, "🏠", "Casa de Pelu", () =>
        Mundo.entrarActividad(415, 880, () => Historia.start("casa_intro", "casa")));
      sc.casa(980, 320, 0xd7c3f0, 0x7d5ba6, "🏰", "Colegio", () =>
        Mundo.entrarActividad(1010, 480, () => Juego.lugar("colegio")), 1.35);
      sc.casa(700, 430, 0xffe0c0, 0xe08a3c, "🧁", "Café", () =>
        Mundo.entrarActividad(760, 550, () => Historia.start("cafe_intro", "cocina")));
      sc.casa(1460, 900, 0xf7e2a6, 0xe0a63c, "🏪", "Tienda", () =>
        Mundo.entrarActividad(1450, 1010, () => Juego.tienda("ropa")));

      // Muelle -> mini-historia de pesca
      sc.zonas.push({ x: 1150, y: 500, r: 90, tipo: "lugar", label: "🎣 Ir a pescar",
        run: () => Mundo.entrarActividad(1150, 560, () => Historia.start("lago_pesca", "lago")) });
      sc.add.text(1150, 490, "🎣", { fontSize: "30px" }).setOrigin(0.5).setDepth(500);

      // Personajes
      sc.npc(910, 470, "🧙‍♀️", "Directora Estela", [
        "¡Hola, Pelu! Bienvenida al Valle.",
        "En el Colegio te esperan aventuras… entra cuando quieras. 🏰",
        "Recuerda: ser diferente es tu superpoder. ✨"]);
      sc.npc(1040, 430, "🐱", "Mia", [
        "Perdón por lo de la feria…",
        "Aprendí que ganar sola no es tan divertido. ¿Jugamos juntas? 💜"]);
      sc.npc(1170, 560, "🐈‍⬛", "Luna", [
        "¡Pelu! ¿Vamos a pescar al lago? 🎣",
        "Con paciencia sale el pez más lindo."]);
      sc.npc(520, 960, "🐈", "Nina", [
        "Estas flores son mágicas… ¿las hueles? 🌸",
        "Gracias por incluirme siempre, Pelu."]);
      sc.npc(300, 560, "🦉", "Profe Búho", [
        "Uju… el saber vive en los libros y en la curiosidad.",
        "¿Sabías que las estrellas que juntas también cuentan una historia? ⭐"]);
      sc.npc(1560, 560, "🐢", "Don Tortu", [
        "Despacito… pero siempre llego. 🐢",
        "No corras tanto, pequeña: disfruta el camino."]);

      // Animalitos
      sc.animal(1300, 300, "🦆", { nombre: "Patito", lineas: ["¡Cuac! El agua está fresquita. 🦆"] });
      sc.animal(1360, 340, "🦆");
      sc.animal(560, 1040, "🐰", { nombre: "Conejito", lineas: ["¡Hop hop! ¿Jugamos a las escondidas? 🐰"] });
      sc.animal(420, 500, "🐿️"); sc.animal(1140, 300, "🐸");
      sc.animal(880, 620, "🦋", { size: 22 }); sc.animal(1240, 840, "🦋", { size: 22 });
      sc.animal(700, 340, "🐦", { size: 22 }); sc.animal(1500, 1140, "🐝", { size: 20 });
      sc.animal(1020, 1080, "🦔"); sc.animal(240, 880, "🐞", { size: 18 });

      // PORTALES a otros mundos
      sc.portal(1650, 220, "🌋", "Volcán", "volcan", { x: 600, y: 700 });
      sc.portal(1000, 1230, "🏖️", "Playa", "playa", { x: 640, y: 200 });
      sc.portal(140, 1060, "🏝️", "Isla", "isla", { x: 600, y: 200 });
      sc.portal(360, 1240, "🚲", "Pista", "pista", { x: 200, y: 380 });
    },
  },

  /* ------------------------- LA PLAYA (buceo) ------------------------- */
  playa: {
    nombre: "Playa Soleada", W: 1300, H: 900, cielo: "#7fd0e8", spawn: { x: 640, y: 200 },
    bienvenida: "🏖️ ¡La Playa! Métete al agua para bucear, o pasea por la arena. Toca ✋.",
    construir(sc) {
      const g = sc.suelo(0xf0dca6, [0xe9d29a, 0xf4e3b4, 0xecd6a0], 30);
      // Mar en la parte de abajo
      g.fillStyle(0x2fb0dd, 1).fillRect(0, 620, sc.def.W, sc.def.H - 620);
      g.fillStyle(0x8fe0f2, 0.7); for (let i = 0; i < 5; i++) g.fillEllipse(180 + i * 260, 636, 200, 26);
      // el mar bloquea (fila de muros) salvo la zona de buceo
      for (let x = 60; x < sc.def.W; x += 140) if (Math.abs(x - 650) > 130) sc.muro(x, 760, 140, 260);
      // Palmeras y rocas
      [[200, 380], [1080, 340], [420, 300], [900, 260], [1180, 520]].forEach(([x, y]) => sc.palmera(x, y));
      [[320, 520], [980, 560], [1120, 440]].forEach(([x, y]) => sc.roca(x, y));
      ["🐚", "⭐", "🏖️", "🪸"].forEach((e, i) => sc.emojiDeco(300 + i * 220, 560, e, 24));

      // Entrada de buceo (bote en la orilla)
      sc.entrada(650, 640, "🤿", "Bucear", () =>
        Mundo.entrarActividad(650, 560, () => PeluSwim.start("playa")), 0x2f8fbf);

      // Personajes / animales
      sc.npc(520, 360, "🐈‍⬛", "Luna", [
        "¡El mar está lindo hoy! ¿Buceamos a buscar perlas? 🦪",
        "Respira hondo y baja con calma, ¿va?"]);
      sc.animal(760, 700, "🦀", { nombre: "Cangrejito", lineas: ["¡Clac clac! Cuidado con mis pinzas… es broma. 🦀"] });
      sc.animal(300, 700, "🐚", { wander: false });
      sc.animal(500, 180, "🐦", { size: 22 }); sc.animal(1000, 160, "🐦", { size: 22 });
      sc.animal(880, 700, "🐠", { size: 22 }); sc.animal(1080, 720, "🐟", { size: 22 });

      sc.portal(120, 200, "⬅️", "Al Valle", "valle", { x: 1000, y: 1150 });
    },
  },

  /* ------------------- LA ISLA AVENTURA (plataformas) ------------------- */
  isla: {
    nombre: "Isla Aventura", W: 1200, H: 900, cielo: "#7ec8e8", spawn: { x: 600, y: 200 },
    bienvenida: "🏝️ ¡Isla Aventura! Entra a la cueva para el reto de plataformas. Toca ✋.",
    construir(sc) {
      // Isla de pasto rodeada de agua
      const g = sc.add.graphics().setDepth(0);
      g.fillStyle(0x4bb6e6, 1).fillRect(0, 0, sc.def.W, sc.def.H);              // mar
      g.fillStyle(0x86e0f2, 0.6); for (let i = 0; i < 8; i++) g.fillEllipse(Phaser.Math.Between(0, sc.def.W), Phaser.Math.Between(0, sc.def.H), 160, 26);
      g.fillStyle(0xecd6a0, 1).fillEllipse(600, 450, 980, 660);                 // playa
      g.fillStyle(0x6cbf52, 1).fillEllipse(600, 440, 820, 520);                 // pasto
      g.fillStyle(0x7ccc5e, 0.7).fillEllipse(520, 380, 300, 150);
      // el agua del borde bloquea
      sc.muro(600, 40, sc.def.W, 90); sc.muro(600, sc.def.H - 40, sc.def.W, 90);
      sc.muro(40, 450, 90, sc.def.H); sc.muro(sc.def.W - 40, 450, 90, sc.def.H);

      [[300, 340], [880, 360], [420, 620], [760, 640]].forEach(([x, y]) => sc.palmera(x, y));
      [[520, 560], [720, 320], [400, 460]].forEach(([x, y]) => sc.roca(x, y, 30));
      ["🌴", "🐚", "✨"].forEach((e, i) => sc.emojiDeco(360 + i * 240, 700, e, 22));

      // Cueva -> plataformas
      sc.entrada(600, 470, "🏃‍♀️", "Cueva de Plataformas", () =>
        Mundo.entrarActividad(600, 560, () => PeluPlatformer.start("bosque")), 0x5a4a3a);

      sc.npc(760, 500, "🐒", "Chango", [
        "¡Uh uh! La cueva tiene saltos, escaleras y monedas. 🪙",
        "Salta a los enemigos y sube la escalera hasta la meta. ¡Tú puedes!"]);
      sc.animal(360, 520, "🦜", { size: 24 }); sc.animal(840, 300, "🦋", { size: 20 });
      sc.animal(500, 700, "🦀"); sc.animal(680, 720, "🐢");

      sc.portal(600, 180, "⬅️", "Al Valle", "valle", { x: 200, y: 1000 });
    },
  },

  /* --------------------- LA PISTA (carrera de bici) --------------------- */
  pista: {
    nombre: "Pista de Carreras", W: 1300, H: 800, cielo: "#9bd36a", spawn: { x: 200, y: 380 },
    bienvenida: "🚲 ¡La Pista! Ve a la línea de salida para la carrera. Toca ✋.",
    construir(sc) {
      const g = sc.suelo(0x8ccb5c, [0x9bd36a, 0x7dbd50], 28);
      // pista ovalada (asfalto)
      g.lineStyle(120, 0x8a8f96, 1); g.strokeEllipse(650, 400, 900, 460);
      g.lineStyle(6, 0xffffff, 1); g.strokeEllipse(650, 400, 900, 460);
      // meta a rayas
      g.fillStyle(0xffffff, 1).fillRect(190, 330, 24, 140);
      g.fillStyle(0x333333, 1); for (let i = 0; i < 7; i++) g.fillRect(190, 330 + i * 20, 24, 10);
      [[650, 120], [650, 680], [980, 250]].forEach(([x, y]) => sc.arbol(x, y));
      ["🏁", "🚩", "⭐"].forEach((e, i) => sc.emojiDeco(400 + i * 260, 120, e, 24));

      sc.entrada(230, 400, "🚩", "Línea de Salida", () =>
        Mundo.entrarActividad(230, 470, () => PeluRace.start("jardin")), 0x555b62);

      sc.npc(430, 470, "🐯", "Rival Tigrín", [
        "¿Lista para la carrera, Pelu? ¡No te lo pondré fácil! 🐯",
        "Pero pase lo que pase… ¡jugamos limpio!"]);
      sc.animal(820, 560, "🐰"); sc.animal(560, 260, "🐦", { size: 22 });
      sc.animal(900, 520, "🦋", { size: 20 });

      sc.portal(150, 200, "⬅️", "Al Valle", "valle", { x: 360, y: 1180 });
    },
  },

  /* --------------------------- EL VOLCÁN --------------------------- */
  volcan: {
    nombre: "El Volcán", W: 1300, H: 900, cielo: "#caa07a", spawn: { x: 600, y: 700 },
    bienvenida: "🌋 ¡El Volcán! Entra a la cueva secreta para resolver el misterio. Toca ✋.",
    construir(sc) {
      const g = sc.suelo(0xb98a5c, [0xa9744a, 0xc79a68, 0x9c6640], 30);
      // el cono del volcán
      g.fillStyle(0x6e4a34, 1).fillTriangle(600, 60, 250, 520, 950, 520);
      g.fillStyle(0x5a3a28, 1).fillTriangle(600, 60, 430, 300, 770, 300);
      g.fillStyle(0xff7a3c, 1).fillEllipse(600, 90, 120, 40);            // cráter
      g.fillStyle(0xffc24a, 1).fillEllipse(600, 90, 64, 22);
      // ríos de lava
      g.lineStyle(26, 0xff5a2a, 1); sc.trazo(g, [[600, 100], [560, 300], [460, 500]]);
      g.lineStyle(26, 0xff5a2a, 1); sc.trazo(g, [[600, 100], [660, 320], [760, 520]]);
      // charcos de lava que bloquean
      [[460, 520], [760, 540]].forEach(([x, y]) => { g.fillStyle(0xff6a30, 1).fillEllipse(x, y, 120, 60); sc.muro(x, y, 110, 50); });
      [[300, 640], [900, 660], [520, 760]].forEach(([x, y]) => sc.roca(x, y, 30));
      ["🔥", "💨", "✨"].forEach((e, i) => sc.emojiDeco(360 + i * 260, 720, e, 22));

      // Cueva secreta -> escape room
      sc.entrada(600, 640, "🗝️", "Cueva Secreta", () =>
        Mundo.entrarActividad(600, 720, () => PeluEscape.start("cuarto")), 0x3a2a2a);

      sc.npc(820, 720, "🦎", "Draco", [
        "Grrr… ¿vienes a la cueva? Adentro hay un acertijo. 🗝️",
        "Busca las pistas y descubre el código. ¡Sin miedo!"]);
      sc.animal(420, 700, "🦂", { size: 24 }); sc.animal(980, 760, "🦇", { size: 22 });
      sc.animal(700, 780, "🐍", { size: 24 });

      sc.portal(600, 830, "⬅️", "Al Valle", "valle", { x: 1620, y: 300 });
    },
  },
};

if (typeof window !== "undefined") { window.Mundo = Mundo; window.MUNDOS = MUNDOS; }
