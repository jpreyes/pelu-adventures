/* ============================================================
   PELU ADVENTURES — Mundo caminable (Phaser, pixel art)
   Estilo Avatar World: Pelu camina por un pueblo y entra a los
   lugares tocandolos (o caminando hasta su puerta). Reemplaza el
   antiguo mapa de tarjetas. Los lugares siguen viniendo de
   DATA.lugares; entrar delega en las pantallas HTML (Juego.*).
   ============================================================ */

const PeluWorld = {
  game: null, scene: null,
  keys: { left: false, right: false, up: false, down: false },

  // posiciones de cada lugar en el pueblo (centro de la casita)
  layout: {
    casa:   { x: 130, y: 170 },
    jardin: { x: 350, y: 160 },
    cocina: { x: 560, y: 170 },
    bosque: { x: 780, y: 160 },
    tienda: { x: 150, y: 350 },
    lago:   { x: 400, y: 360 },
    playa:  { x: 650, y: 350 },
  },

  start() {
    if (this.game) { this.game.destroy(true); this.game = null; }
    document.getElementById("app").style.display = "none";
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "block";
    cont.innerHTML = `
      <div id="phaser-canvas"></div>
      <div id="mundo-top">
        <div class="mundo-monedas">⭐ <span id="mundo-estrellas">${Estado.data.estrellas}</span></div>
        <button id="mundo-ajustes">⚙️</button>
      </div>
      <div id="controles-tactiles">
        <div class="dpad">
          <button class="ctrl chico" data-k="up">▲</button>
          <div class="dpad-mid">
            <button class="ctrl chico" data-k="left">◀</button>
            <button class="ctrl chico" data-k="right">▶</button>
          </div>
          <button class="ctrl chico" data-k="down">▼</button>
        </div>
        <div class="mundo-pista">Toca un lugar para entrar 🐾</div>
      </div>`;
    document.getElementById("mundo-ajustes").onclick = () => this.aPantalla(() => Juego.ajustes());
    this.keys = { left: false, right: false, up: false, down: false };
    const cont2 = cont;
    cont2.querySelectorAll(".ctrl").forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); this.keys[k] = true; };
      const off = e => { e.preventDefault(); this.keys[k] = false; };
      b.addEventListener("pointerdown", on);
      b.addEventListener("pointerup", off);
      b.addEventListener("pointerleave", off);
      b.addEventListener("pointercancel", off);
    });

    this.game = new Phaser.Game({
      type: Phaser.AUTO, parent: "phaser-canvas",
      width: 900, height: 480, backgroundColor: "#8fd66a",
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [WorldScene],
    });
  },

  // salir del mundo hacia una pantalla HTML (casa, tienda, aventura, ajustes)
  aPantalla(fn) {
    if (this.game) { this.game.destroy(true); this.game = null; this.scene = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none"; cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    fn();
  },

  // intentar entrar a un lugar (o desbloquearlo si esta cerrado)
  entrar(id) {
    const l = buscar(DATA.lugares, id);
    if (!Estado.tiene("lugares", id)) {
      if (Estado.data.estrellas < l.precio) { toast("Te faltan estrellas ⭐ ¡A una aventura!"); return; }
      Estado.data.estrellas -= l.precio;
      Estado.data.poseidos.lugares.push(id);
      Estado.guardar();
      if (typeof confeti === "function") confeti();
      toast(`¡Descubriste ${l.nombre}! 🎉`);
      const el = document.getElementById("mundo-estrellas"); if (el) el.textContent = Estado.data.estrellas;
      if (this.scene) this.scene.construirCasas();
      return;
    }
    this.aPantalla(() => Juego.entrar(id));
  },
};

/* ============================================================ */
class WorldScene extends Phaser.Scene {
  constructor() { super("WorldScene"); }

  create() {
    PeluWorld.scene = this;
    PeluSprite.textura(this);

    this.dibujarPasto();
    this.casas = [];
    this.construirCasas();

    // Pelu
    this.pelu = this.add.image(450, 430, "pelu").setDisplaySize(42, 42).setDepth(50);
    this.target = null; this.destino = null; this.facing = 1;

    // sombra
    this.sombra = this.add.ellipse(450, 452, 30, 10, 0x000000, 0.18).setDepth(49);

    // etiqueta flotante del lugar cercano
    this.etiqueta = this.add.text(0, 0, "", { fontSize: "16px", fontFamily: "Comic Sans MS, sans-serif",
      color: "#fff", backgroundColor: "#4a3a44dd", padding: { x: 8, y: 4 } }).setOrigin(0.5, 1).setDepth(80).setVisible(false);

    // tocar el mundo: caminar; tocar una casa: ir y entrar
    this.input.on("pointerdown", p => {
      const casa = this.casaEn(p.worldX, p.worldY);
      if (casa) { this.destino = casa; this.target = { x: casa.px, y: casa.puertaY }; }
      else { this.destino = null; this.target = { x: Phaser.Math.Clamp(p.worldX, 20, 880), y: Phaser.Math.Clamp(p.worldY, 120, 460) }; }
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.espacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  dibujarPasto() {
    // pasto a cuadros (dos verdes) para textura pixel
    const g = this.add.graphics().setDepth(-10);
    const s = 30;
    for (let y = 0; y < 480; y += s) for (let x = 0; x < 900; x += s) {
      g.fillStyle(((x + y) / s) % 2 ? 0x8fd66a : 0x84cf60, 1);
      g.fillRect(x, y, s, s);
    }
    // caminito central
    g.fillStyle(0xe4c98a); g.fillRect(0, 250, 900, 46);
    g.fillStyle(0xd9ba76);
    for (let x = 10; x < 900; x += 44) g.fillRect(x, 266, 22, 14);
    // florecitas y arbolitos decorativos (bloques)
    const deco = this.add.graphics().setDepth(-9);
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(10, 880), y = Phaser.Math.Between(120, 470);
      if (Math.random() < 0.5) { deco.fillStyle(0xff8ac4); deco.fillRect(x, y, 4, 4); deco.fillStyle(0xffe066); deco.fillRect(x + 1, y + 1, 2, 2); }
      else { deco.fillStyle(0x4fae2e); deco.fillRect(x, y, 6, 6); }
    }
  }

  construirCasas() {
    this.casas.forEach(c => c.grupo.forEach(o => o.destroy()));
    this.casas = [];
    DATA.lugares.forEach(l => {
      const pos = PeluWorld.layout[l.id]; if (!pos) return;
      const abierto = Estado.tiene("lugares", l.id);
      const grupo = [];
      const roof = Phaser.Display.Color.HexStringToColor(l.color || "#ffd9ec").color;
      const g = this.add.graphics().setDepth(pos.y);
      const w = 78, h = 56, x = pos.x - w / 2, y = pos.y - h / 2;
      // paredes
      g.fillStyle(abierto ? 0xfff3e0 : 0xbdb6b0); g.fillRect(x, y, w, h);
      g.lineStyle(2, 0x4a3a44); g.strokeRect(x, y, w, h);
      // techo (bloques triangulares)
      g.fillStyle(abierto ? roof : 0x9a938d);
      for (let i = 0; i < w / 2 + 6; i += 3) g.fillRect(x - 6 + i, y - i * 0.5, (w + 12) - i * 2, 4);
      // puerta
      g.fillStyle(abierto ? 0x8a5a2b : 0x6b655f); g.fillRect(pos.x - 9, y + h - 22, 18, 22);
      g.fillStyle(0xffd54a); g.fillRect(pos.x + 4, y + h - 12, 2, 2);
      grupo.push(g);
      // cartel con el emoji del lugar
      grupo.push(this.add.text(pos.x, y - 16, l.emoji, { fontSize: "26px" }).setOrigin(0.5).setDepth(pos.y + 1)
        .setAlpha(abierto ? 1 : 0.6));
      // nombre
      grupo.push(this.add.text(pos.x, pos.y + h / 2 + 10, l.nombre, { fontSize: "13px",
        fontFamily: "Comic Sans MS, sans-serif", color: "#3a2f36", backgroundColor: "#ffffffcc",
        padding: { x: 4, y: 1 } }).setOrigin(0.5).setDepth(pos.y + 1));
      // candado + precio
      if (!abierto) grupo.push(this.add.text(pos.x, pos.y, `🔒${l.precio}⭐`, { fontSize: "14px",
        fontFamily: "Comic Sans MS, sans-serif", color: "#fff", backgroundColor: "#4a3a44cc",
        padding: { x: 4, y: 2 } }).setOrigin(0.5).setDepth(pos.y + 2));
      this.casas.push({ id: l.id, nombre: l.nombre, px: pos.x, py: pos.y, w, h,
        puertaY: pos.y + h / 2 + 6, abierto, grupo });
    });
  }

  casaEn(x, y) {
    return this.casas.find(c => Math.abs(x - c.px) < c.w / 2 + 6 && y > c.py - c.h / 2 - 20 && y < c.puertaY + 24);
  }

  update(time, delta) {
    const dt = delta / 1000, k = PeluWorld.keys;
    const izq = this.cursors.left.isDown || k.left;
    const der = this.cursors.right.isDown || k.right;
    const arr = this.cursors.up.isDown || k.up;
    const aba = this.cursors.down.isDown || k.down;
    const vel = 150;
    let vx = 0, vy = 0;

    if (izq || der || arr || aba) {
      this.target = null; this.destino = null;   // el dpad manda
      if (izq) vx -= 1; if (der) vx += 1; if (arr) vy -= 1; if (aba) vy += 1;
      const m = Math.hypot(vx, vy) || 1; vx = vx / m * vel; vy = vy / m * vel;
    } else if (this.target) {
      const dx = this.target.x - this.pelu.x, dy = this.target.y - this.pelu.y;
      const d = Math.hypot(dx, dy);
      if (d > 4) { vx = dx / d * vel; vy = dy / d * vel; }
      else { this.pelu.x = this.target.x; this.pelu.y = this.target.y; this.target = null; }
    }

    this.pelu.x = Phaser.Math.Clamp(this.pelu.x + vx * dt, 20, 880);
    this.pelu.y = Phaser.Math.Clamp(this.pelu.y + vy * dt, 120, 460);
    if (vx < -1) this.facing = -1; else if (vx > 1) this.facing = 1;
    this.pelu.setFlipX(this.facing === -1);
    this.pelu.setDepth(this.pelu.y + 1);
    // caminata: pequeño rebote
    const mov = Math.abs(vx) + Math.abs(vy) > 1;
    this.pelu.y += 0;
    this.pelu.setScale(this.pelu.scaleX, (46 / PeluSprite.H) * (mov ? (1 + Math.sin(time / 80) * 0.06) : 1));
    this.sombra.setPosition(this.pelu.x, this.pelu.y + 22);

    // lugar cercano → etiqueta + entrar
    const cerca = this.casas.find(c => Math.abs(c.px - this.pelu.x) < 46 && Math.abs(c.puertaY - this.pelu.y) < 34);
    if (cerca) {
      this.etiqueta.setText("▶ " + cerca.nombre).setPosition(this.pelu.x, this.pelu.y - 30).setVisible(true);
      const llegoDestino = this.destino && this.destino.id === cerca.id;
      if (llegoDestino || arr || this.espacio.isDown) { this.destino = null; PeluWorld.entrar(cerca.id); }
    } else {
      this.etiqueta.setVisible(false);
    }
  }
}

if (typeof window !== "undefined") window.PeluWorld = PeluWorld;
