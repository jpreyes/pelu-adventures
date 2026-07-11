/* ============================================================
   PELU ADVENTURES — El Buceo de Pelu (Phaser 3, pixel)
   Pelu se sumerge automaticamente. Muevete ⬅➡ (o desliza)
   para juntar perlas y joyas, recoge burbujas para no quedarte
   sin aire y esquiva las medusas. Llega al cofre del fondo.
   Desarrolla: puntería, anticipación y manejo de un recurso (aire).
   ============================================================ */

const PeluSwim = {
  game: null,
  keys: { left: false, right: false, down: false },
  retornoLugar: "playa",
  cfg: { fondo: 4600, vyBase: 130, aguaTop: 120 },

  start(lugar = "playa") {
    this.retornoLugar = lugar;
    document.getElementById("app").style.display = "none";
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "block";
    cont.innerHTML = `
      <div id="phaser-canvas"></div>
      <button id="btn-salir-juego">✕ Salir</button>
      <div id="controles-tactiles">
        <div class="lado-izq">
          <button class="ctrl" data-k="left">◀</button>
          <button class="ctrl" data-k="right">▶</button>
        </div>
        <button class="ctrl salto" data-k="down">BUCEAR ⬇</button>
      </div>`;
    document.getElementById("btn-salir-juego").onclick = () => this.finish(0, true);
    cont.querySelectorAll(".ctrl").forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); this.keys[k] = true; };
      const off = e => { e.preventDefault(); this.keys[k] = false; };
      b.addEventListener("pointerdown", on);
      b.addEventListener("pointerup", off);
      b.addEventListener("pointerleave", off);
      b.addEventListener("pointercancel", off);
    });

    this.keys = { left: false, right: false, down: false };
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaser-canvas",
      width: 900, height: 480,
      backgroundColor: "#2a6f9e",
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [SwimScene],
    });
  },

  finish(recompensa, salioAntes = false) {
    if (this.game) { this.game.destroy(true); this.game = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none"; cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    if (recompensa > 0) {
      Estado.ganar(recompensa);
      if (typeof confeti === "function") confeti();
      toast(`+${recompensa} ⭐ ¡Gran buceo, Pelu!`);
    } else if (salioAntes) { toast("Volvimos al mundo 🗺️"); }
    Juego.mapa();
  },
};

/* ============================================================ */
class SwimScene extends Phaser.Scene {
  constructor() { super("SwimScene"); }

  preload() { PeluSprite.cargar(this); }

  create() {
    const C = PeluSwim.cfg;
    this.C = C;
    this.perlas = 0; this.joyas = 0; this.aire = 100; this.termino = false; this.stun = 0;

    // Agua en bandas de color (mas oscura hacia el fondo) — look pixelado
    const tonos = [0x3f8fbf, 0x357fae, 0x2a6f9e, 0x22608b, 0x1b5178, 0x154566];
    const bandaH = C.fondo / tonos.length;
    tonos.forEach((t, i) => this.add.rectangle(450, i * bandaH + bandaH / 2, 900, bandaH + 2, t).setDepth(-5));
    // burbujitas decorativas
    for (let i = 0; i < 60; i++)
      this.add.circle(Phaser.Math.Between(20, 880), Phaser.Math.Between(160, C.fondo), Phaser.Math.Between(2, 5), 0xffffff)
        .setAlpha(0.15).setDepth(-4);
    // superficie
    this.add.rectangle(450, C.aguaTop, 900, 8, 0xbfe9ff).setScrollFactor(1).setDepth(-3);
    this.add.rectangle(450, C.aguaTop - 30, 900, 60, 0x9fe0ff).setDepth(-3);

    // Pelu buceando
    this.pelu = this.add.image(450, C.aguaTop + 40, "pelu").setDisplaySize(46, 46).setDepth(10);
    this.hookX = 450;

    // Items y peligros distribuidos por profundidad
    this.items = [];
    for (let y = 300; y < C.fondo - 220; y += Phaser.Math.Between(90, 150)) {
      const x = Phaser.Math.Between(60, 840);
      const r = Math.random();
      if (r < 0.5) this.addItem(x, y, "perla", "🦪");
      else if (r < 0.68) this.addItem(x, y, "joya", "💎");
      else if (r < 0.86) this.addItem(x, y, "aire", "🫧");
      else this.addMedusa(x, y);
    }
    // tesoro secreto raro
    if (Math.random() < 0.5) this.addItem(Phaser.Math.Between(80, 820), Phaser.Math.Between(1200, C.fondo - 400), "secreto", "💰");
    // cofre final
    this.cofre = this.add.text(450, C.fondo - 120, "🧰", { fontSize: "44px" }).setOrigin(0.5).setDepth(5);
    this.add.text(450, C.fondo - 70, "¡El cofre!", { fontSize: "18px", fontFamily: "Comic Sans MS, sans-serif",
      color: "#fff" }).setOrigin(0.5).setDepth(5);

    // puntero: seguir el dedo horizontalmente
    this.input.on("pointerdown", p => { this.punteroX = p.worldX; this.punteroOn = true; });
    this.input.on("pointermove", p => { if (p.isDown) this.punteroX = p.worldX; });
    this.input.on("pointerup", () => { this.punteroOn = false; });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.crearHUD();
    this.cartel("¡Bucea! Junta 🦪 💎, agarra 🫧 aire y esquiva 🪼", 3000);
  }

  addItem(x, y, tipo, emoji) {
    const o = this.add.text(x, y, emoji, { fontSize: "26px" }).setOrigin(0.5).setDepth(5);
    o.tipo = tipo;
    this.tweens.add({ targets: o, x: x + Phaser.Math.Between(-12, 12), duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.items.push(o);
  }

  addMedusa(x, y) {
    const o = this.add.text(x, y, "🪼", { fontSize: "30px" }).setOrigin(0.5).setDepth(5);
    o.tipo = "medusa"; o.vx = Phaser.Math.Between(30, 60) * (Math.random() < 0.5 ? 1 : -1);
    this.items.push(o);
  }

  crearHUD() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(40);
    const panel = (x, y, w, h) => {
      g.fillStyle(0x0e3a55).fillRect(x, y, w, h);
      g.fillStyle(0x2a6f9e).fillRect(x + 3, y + 3, w - 6, h - 6);
    };
    panel(12, 12, 150, 40); panel(720, 12, 168, 40);
    const est = { fontSize: "20px", fontFamily: "Comic Sans MS, sans-serif", color: "#fff" };
    this.add.text(20, 20, "🦪", { fontSize: "20px" }).setScrollFactor(0).setDepth(41);
    this.txtPerlas = this.add.text(44, 20, "0", est).setScrollFactor(0).setDepth(41);
    this.add.text(92, 20, "💎", { fontSize: "20px" }).setScrollFactor(0).setDepth(41);
    this.txtJoyas = this.add.text(118, 20, "0", est).setScrollFactor(0).setDepth(41);
    // barra de aire
    this.add.text(726, 20, "AIRE", { fontSize: "16px", fontFamily: "Comic Sans MS, sans-serif", color: "#fff" })
      .setScrollFactor(0).setDepth(41);
    this.aireBg = this.add.rectangle(790, 32, 90, 12, 0x0e3a55).setOrigin(0, 0.5).setScrollFactor(0).setDepth(41);
    this.aireFill = this.add.rectangle(791, 32, 88, 8, 0x4fd0ff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(42);
  }

  cartel(txt, dur) {
    const c = this.add.text(450, 110, txt, { fontSize: "19px", fontFamily: "Comic Sans MS, sans-serif",
      align: "center", color: "#fff", backgroundColor: "#0e3a55cc", padding: { x: 12, y: 8 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(60);
    this.time.delayedCall(dur, () => c && c.destroy());
  }

  brillito(x, y, txt) {
    const s = this.add.text(x, y, txt, { fontSize: "20px", fontFamily: "Comic Sans MS, sans-serif",
      color: "#fff", stroke: "#0e3a55", strokeThickness: 3 }).setOrigin(0.5).setDepth(62);
    this.tweens.add({ targets: s, y: y - 34, alpha: 0, duration: 650, onComplete: () => s.destroy() });
  }

  update(time, delta) {
    if (this.termino) return;
    const C = this.C, dt = delta / 1000;
    const k = PeluSwim.keys;
    const izq = this.cursors.left.isDown || k.left;
    const der = this.cursors.right.isDown || k.right;
    const bucea = this.cursors.down.isDown || k.down;

    if (this.stun > 0) this.stun -= dt;

    // Descenso automatico (mas rapido si bucea)
    const vy = C.vyBase * (bucea ? 1.9 : 1) * (this.stun > 0 ? 0.3 : 1);
    this.pelu.y += vy * dt;

    // Horizontal: teclas o dedo
    if (this.punteroOn && this.punteroX != null) {
      this.pelu.x = Phaser.Math.Linear(this.pelu.x, Phaser.Math.Clamp(this.punteroX, 24, 876), 0.2);
    } else {
      if (izq) this.pelu.x -= 260 * dt;
      if (der) this.pelu.x += 260 * dt;
    }
    this.pelu.x = Phaser.Math.Clamp(this.pelu.x, 24, 876);
    this.pelu.setFlipX(izq && !der);
    this.pelu.angle = Math.sin(time / 200) * 4;   // vaivén al nadar

    // Cámara sigue la profundidad
    this.cameras.main.scrollY = Phaser.Math.Clamp(this.pelu.y - 150, 0, C.fondo - 480);

    // Aire baja con el tiempo; sin aire = pierde puntos y respira un poco
    this.aire -= (bucea ? 9 : 6) * dt;
    if (this.aire <= 0) {
      this.aire = 45;
      this.perlas = Math.max(0, this.perlas - 1);
      this.txtPerlas.setText(this.perlas);
      this.brillito(this.pelu.x, this.pelu.y - 20, "¡sin aire!");
    }
    this.aireFill.width = 88 * Phaser.Math.Clamp(this.aire, 0, 100) / 100;
    this.aireFill.fillColor = this.aire < 30 ? 0xff6b6b : 0x4fd0ff;

    // Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const o = this.items[i];
      if (o.tipo === "medusa") {
        o.x += o.vx * dt;
        if (o.x < 20 || o.x > 880) o.vx *= -1;
      }
      if (Math.abs(o.x - this.pelu.x) < 26 && Math.abs(o.y - this.pelu.y) < 26) {
        if (o.tipo === "medusa") {
          if (this.stun <= 0) {
            this.stun = 0.7; this.aire = Math.max(0, this.aire - 16);
            this.brillito(o.x, o.y, "¡ay! 🪼");
            this.cameras.main.shake(150, 0.006);
          }
          continue; // la medusa no se consume
        }
        this.cobrar(o);
        o.destroy(); this.items.splice(i, 1);
      }
    }

    // Llegar al cofre
    if (this.pelu.y >= this.cofre.y - 26) this.ganar();
  }

  cobrar(o) {
    if (o.tipo === "perla") { this.perlas++; this.txtPerlas.setText(this.perlas); this.brillito(o.x, o.y, "🦪 +1"); }
    else if (o.tipo === "joya") { this.joyas++; this.txtJoyas.setText(this.joyas); this.brillito(o.x, o.y, "💎 +3"); }
    else if (o.tipo === "aire") { this.aire = Math.min(100, this.aire + 32); this.brillito(o.x, o.y, "🫧 aire"); }
    else if (o.tipo === "secreto") {
      Estado.data.coleccion.push("💰"); Estado.guardar();
      this.perlas += 3; this.txtPerlas.setText(this.perlas);
      this.brillito(o.x, o.y, "¡tesoro! 💰");
    }
  }

  ganar() {
    if (this.termino) return;
    this.termino = true;
    const bonus = 10;
    const total = this.perlas + this.joyas * 3 + bonus;
    const txt = `🧰 ¡Cofre del fondo!\n🦪 ${this.perlas}  +  💎 ${this.joyas}×3\n+ ${bonus} cofre\n= ${total} ⭐`;
    const c = this.add.text(450, 240, txt, { fontSize: "26px", align: "center",
      fontFamily: "Comic Sans MS, sans-serif", color: "#fff", backgroundColor: "#0e3a55ee",
      padding: { x: 24, y: 18 } }).setOrigin(0.5).setScrollFactor(0).setDepth(70);
    this.tweens.add({ targets: c, scale: { from: 0.6, to: 1 }, duration: 400, ease: "Back.out" });
    this.time.delayedCall(2600, () => PeluSwim.finish(total));
  }
}

if (typeof window !== "undefined") window.PeluSwim = PeluSwim;
