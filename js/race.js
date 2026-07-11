/* ============================================================
   PELU ADVENTURES — La Gran Carrera (Phaser 3)
   Mecánica nueva: carrera en bicicleta (auto-runner).
   Pelu pedalea sola hacia la meta; tú saltas obstáculos,
   recoges monedas, aceleras/frenas y compites contra un rival.
   Desarrolla: reflejos, ritmo/timing, anticipación y superarse.
   ============================================================ */

const PeluRace = {
  game: null,
  keys: { left: false, right: false, up: false, jump: false },
  retornoLugar: "jardin",

  cfg: {
    meta: 6000,          // distancia a recorrer
    velBase: 250,        // velocidad de crucero
    velMax: 400,
    velMin: 120,
    velRival: 232,       // el rival es constante; ganas si no chocas
    pistaTop: 300,       // banda superior de la carretera
    pistaBot: 445,       // banda inferior
    carrilY: 372,        // posición vertical inicial de Pelu
  },

  start(lugar = "jardin") {
    this.retornoLugar = lugar;
    document.getElementById("app").style.display = "none";
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "block";
    cont.innerHTML = `
      <div id="phaser-canvas"></div>
      <button id="btn-salir-juego">✕ Salir</button>
      <div id="controles-tactiles">
        <div class="lado-izq">
          <div class="cruz-vert">
            <button class="ctrl" data-k="up">⬆</button>
            <button class="ctrl" data-k="down">⬇</button>
          </div>
        </div>
        <button class="ctrl salto" data-k="right">ACELERAR 💨</button>
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

    this.keys = { up: false, down: false, right: false };
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaser-canvas",
      width: 900, height: 480,
      backgroundColor: "#9fe0ff",
      pixelArt: true,
      physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [RaceScene],
    });
  },

  finish(recompensa, salioAntes = false) {
    if (this.game) { this.game.destroy(true); this.game = null; }
    const cont = document.getElementById("juego-phaser");
    cont.style.display = "none";
    cont.innerHTML = "";
    document.getElementById("app").style.display = "";
    if (recompensa > 0) {
      Estado.ganar(recompensa);
      if (typeof confeti === "function") confeti();
      toast(`+${recompensa} ⭐ ¡Qué carrera, Pelu!`);
    } else if (salioAntes) {
      toast("Volvimos al mundo 🗺️");
    }
    Juego.mapa();
  },
};

/* ============================================================
   ESCENA DE CARRERA
   ============================================================ */
class RaceScene extends Phaser.Scene {
  constructor() { super("RaceScene"); }

  preload() { PeluSprite.cargar(this); }

  create() {
    const C = PeluRace.cfg;
    this.C = C;
    this.monedas = 0; this.tiempo = 0; this.termino = false;
    this.penal = 0; this.vel = C.velBase; this.rivalFin = false; this.posicion = 1;

    this.crearTexturas();

    this.physics.world.setBounds(0, 0, C.meta + 600, 600);
    this.cameras.main.setBounds(0, 0, C.meta + 600, 480);

    this.fondo(C.meta + 600);

    // ---- Carretera (banda donde la bici sube y baja) ----
    const midY = (C.pistaTop + C.pistaBot) / 2, altoPista = C.pistaBot - C.pistaTop;
    this.add.rectangle((C.meta + 600) / 2, midY, C.meta + 600, altoPista + 30, 0x8a8f99);     // asfalto
    this.add.rectangle((C.meta + 600) / 2, C.pistaTop - 8, C.meta + 600, 12, 0x6fc24a);        // pasto borde sup
    this.add.rectangle((C.meta + 600) / 2, C.pistaBot + 8, C.meta + 600, 12, 0x6fc24a);        // pasto borde inf
    for (let x = 40; x < C.meta + 600; x += 90) {                                              // líneas centrales
      this.add.rectangle(x, midY, 46, 7, 0xfff4cf).setAlpha(0.85);
    }

    // ---- Meta ----
    this.dibujarMeta(C.meta);

    // ---- Pelu + bici (sin gravedad: se mueve arriba/abajo) ----
    const p = this.add.image(0, 0, "pelu").setDisplaySize(48, 52).setDepth(10);
    this.player = this.physics.add.existing(p);
    this.player.body.setAllowGravity(false);
    this.player.body.setSize(p.width * 0.4, p.width * 0.5).setOffset(p.width * 0.3, p.width * 0.34);
    this.player.setPosition(140, C.carrilY);
    this.rueda1 = this.add.image(0, 0, "rueda").setDepth(9);
    this.rueda2 = this.add.image(0, 0, "rueda").setDepth(9);
    this.cuadro = this.add.image(0, 0, "bici").setDepth(9);

    // ---- Rival (gatito naranjo en bici) ----
    this.rival = this.add.image(140, C.pistaTop + 30, "pelu").setDisplaySize(46, 50).setTint(0xffb060).setDepth(8);
    this.rivalRueda1 = this.add.image(0, 0, "rueda").setScale(0.85).setDepth(7);
    this.rivalRueda2 = this.add.image(0, 0, "rueda").setScale(0.85).setDepth(7);
    this.rivalCuadro = this.add.image(0, 0, "bici").setTint(0xffd0a0).setDepth(7);

    // ---- Obstáculos (conos a distintas alturas) y monedas ----
    this.obstaculos = []; this.coleccion = [];
    const ry = () => Phaser.Math.Between(C.pistaTop + 14, C.pistaBot - 8);
    let x = 700;
    while (x < C.meta - 200) {
      const o = this.add.image(x, ry(), "cono").setDepth(6);
      o.golpeado = false;
      this.obstaculos.push(o);
      // a veces un segundo cono cerca, para obligar a esquivar bien
      if (Math.random() < 0.4) {
        const o2 = this.add.image(x + 70, ry(), "cono").setDepth(6);
        o2.golpeado = false; this.obstaculos.push(o2);
      }
      // fila de monedas a una altura (premia esquivar y posicionarse)
      if (Math.random() < 0.7) {
        const cy = ry();
        for (let j = 0; j < 3; j++) this.addMoneda(x + 150 + j * 40, cy);
      }
      x += Phaser.Math.Between(340, 520);
    }

    this.cameras.main.startFollow(this.player, true, 0.12, 0);  // sigue solo en horizontal
    this.cameras.main.setFollowOffset(-160, 0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaSalto = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.crearHUD();
    this.relojEvt = this.time.addEvent({ delay: 100, loop: true, callback: () => { if (!this.termino) this.tiempo += 0.1; } });
    this.cartel("Usa ⬆⬇ para esquivar los conos 🚧, junta monedas 🪙 y gánale al rival! 🏁", 3400);
  }

  crearTexturas() {
    let g = this.make.graphics({ add: false });
    // Moneda
    g.fillStyle(0xf4c430).fillCircle(16, 16, 15);
    g.lineStyle(4, 0xc9971b).strokeCircle(16, 16, 15);
    g.fillStyle(0xffe79a).fillCircle(12, 11, 5);
    g.generateTexture("moneda", 32, 32); g.clear();
    // Cono de tránsito
    g.fillStyle(0xff7a1a).fillTriangle(16, 2, 4, 34, 28, 34);
    g.fillStyle(0xffffff).fillTriangle(16, 12, 10, 24, 22, 24);
    g.fillStyle(0xff7a1a).fillTriangle(16, 16, 13, 22, 19, 22);
    g.fillStyle(0xd9610f).fillRoundedRect(2, 33, 28, 7, 3);
    g.generateTexture("cono", 32, 42); g.clear();
    // Rueda
    g.fillStyle(0x2b2b33).fillCircle(15, 15, 14);
    g.fillStyle(0x55555f).fillCircle(15, 15, 10);
    g.lineStyle(2, 0xcfcfe0);
    for (let a = 0; a < 6; a++) { const r = a * Math.PI / 3; g.lineBetween(15, 15, 15 + Math.cos(r) * 10, 15 + Math.sin(r) * 10); }
    g.fillStyle(0xcfcfe0).fillCircle(15, 15, 3);
    g.generateTexture("rueda", 30, 30); g.clear();
    // Cuadro de la bici (marco rojo)
    g.lineStyle(5, 0xff5a5a);
    g.lineBetween(8, 30, 30, 30);   // base
    g.lineBetween(8, 30, 22, 12);   // sube
    g.lineBetween(30, 30, 22, 12);
    g.lineBetween(22, 12, 40, 14);  // manubrio
    g.lineBetween(8, 30, 18, 14);
    g.fillStyle(0x3a3a44).fillRoundedRect(15, 9, 12, 4, 2); // asiento
    g.generateTexture("bici", 46, 36); g.destroy();
  }

  fondo(ancho) {
    for (let x = 60; x < ancho; x += 300) {
      this.add.text(x, 50 + (x % 120), "☁", { fontSize: "44px", color: "#fff" }).setScrollFactor(0.3).setDepth(-5);
    }
    for (let x = -100; x < ancho; x += 240) {
      this.add.circle(x, 380, 140, 0x9bd86a).setScrollFactor(0.5).setDepth(-4).setAlpha(0.7);
    }
    for (let x = -50; x < ancho; x += 200) {
      this.add.triangle(x, 360, 0, 80, 60, -40, 120, 80, 0x7cc24a).setScrollFactor(0.65).setDepth(-3).setAlpha(0.8);
    }
  }

  dibujarMeta(x) {
    const C = this.C;
    const topY = C.pistaTop - 110;
    const g = this.add.graphics().setDepth(3);
    // franja a cuadros que cruza toda la pista
    for (let r = 0; r < 12; r++) for (let c = 0; c < 2; c++) {
      g.fillStyle((r + c) % 2 ? 0x000000 : 0xffffff);
      g.fillRect(x + c * 14, C.pistaTop - 10 + r * 14, 14, 14);
    }
    g.fillStyle(0x444444); g.fillRect(x - 4, topY, 8, 120);
    this.add.text(x + 26, topY, "🏁", { fontSize: "40px" }).setDepth(3);
  }

  addMoneda(x, y) {
    const o = this.add.image(x, y, "moneda").setDepth(5);
    this.tweens.add({ targets: o, scaleX: 0.3, duration: 500, yoyo: true, repeat: -1 });
    this.coleccion.push(o);
  }

  crearHUD() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(40);
    const panel = (x, y, w, h) => {
      g.fillStyle(0x7a4a22).fillRoundedRect(x, y, w, h, 12);
      g.fillStyle(0xb5832e).fillRoundedRect(x + 3, y + 3, w - 6, h - 6, 9);
      g.fillStyle(0xd8a64c).fillRoundedRect(x + 6, y + 6, w - 12, (h - 12) / 2, 6);
    };
    panel(12, 12, 120, 40);
    panel(760, 12, 128, 40);
    const estilo = { fontSize: "22px", fontFamily: "Comic Sans MS, sans-serif", color: "#fff", stroke: "#5a3413", strokeThickness: 3 };
    this.add.image(34, 32, "moneda").setScrollFactor(0).setDepth(41).setScale(0.8);
    this.txtMon = this.add.text(54, 20, "0", estilo).setScrollFactor(0).setDepth(41);
    this.add.text(770, 18, "⏱", { fontSize: "22px" }).setScrollFactor(0).setDepth(41);
    this.txtTiempo = this.add.text(800, 20, "0s", estilo).setScrollFactor(0).setDepth(41);

    // Barra de progreso de la carrera
    const bx = 250, bw = 420, by = 28;
    g.fillStyle(0x00000033).fillRoundedRect(bx, by - 8, bw, 16, 8);
    this.barBx = bx; this.barBw = bw; this.barBy = by;
    this.iconPelu = this.add.text(bx, by, "🐱", { fontSize: "22px" }).setOrigin(0.5).setScrollFactor(0).setDepth(42);
    this.iconRival = this.add.text(bx, by, "🐯", { fontSize: "20px" }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setAlpha(0.9);
    this.add.text(bx + bw, by, "🏁", { fontSize: "22px" }).setOrigin(0.5).setScrollFactor(0).setDepth(42);
  }

  cartel(txt, dur) {
    const c = this.add.text(450, 100, txt, {
      fontSize: "20px", fontFamily: "Comic Sans MS, sans-serif", align: "center",
      color: "#5a3d5c", backgroundColor: "#ffffffdd", padding: { x: 14, y: 8 }, wordWrap: { width: 620 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
    this.time.delayedCall(dur, () => c && c.destroy());
  }

  brillito(x, y, emoji) {
    const s = this.add.text(x, y, emoji, { fontSize: "24px" }).setOrigin(0.5).setDepth(62);
    this.tweens.add({ targets: s, y: y - 32, alpha: 0, scale: 1.4, duration: 600, onComplete: () => s.destroy() });
  }

  chocar(o) {
    if (o.golpeado || this.termino) return;
    o.golpeado = true;
    this.penal = 0.7;
    this.vel = this.C.velMin;
    this.brillito(o.x, o.y, "💢");
    this.tweens.add({ targets: o, angle: 80, y: o.y + 6, alpha: 0.4, duration: 300, onComplete: () => o.destroy() });
    this.cameras.main.shake(160, 0.006);
  }

  ganar() {
    if (this.termino) return;
    this.termino = true;
    this.player.body.setVelocity(0, 0);
    this.relojEvt.remove();
    const posBonus = this.posicion === 1 ? 15 : 6;
    const total = this.monedas + posBonus;
    const txt = `${this.posicion === 1 ? "🏆 ¡1er LUGAR! 🏆" : "🥈 ¡2º lugar! ¡Buena carrera!"}\n` +
      `🪙 ${this.monedas} monedas + ${posBonus} de premio\n⏱ ${this.tiempo.toFixed(1)}s\n= ${total} ⭐`;
    const c = this.add.text(450, 200, txt, {
      fontSize: "28px", align: "center", fontFamily: "Comic Sans MS, sans-serif",
      color: "#5a3d5c", backgroundColor: "#ffffffee", padding: { x: 24, y: 18 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(70);
    this.tweens.add({ targets: c, scale: { from: 0.6, to: 1 }, duration: 400, ease: "Back.out" });
    this.time.delayedCall(2600, () => PeluRace.finish(total));
  }

  update(time, delta) {
    if (this.termino) return;
    const C = this.C, dt = delta / 1000;
    const body = this.player.body;
    const k = PeluRace.keys;
    const acelera = this.cursors.right.isDown || k.right;
    const subir = this.cursors.up.isDown || k.up;
    const bajar = this.cursors.down.isDown || k.down;

    // Penalización tras chocar
    if (this.penal > 0) this.penal -= dt;

    // Velocidad de avance (acelera al mantener 💨; leve aumento por distancia)
    const impulso = Math.min(60, this.player.x / 120);
    let objetivo = C.velBase + impulso;
    if (acelera) objetivo = C.velMax + impulso;
    if (this.penal > 0) objetivo = Math.min(objetivo, C.velMin);
    this.vel = Phaser.Math.Linear(this.vel, objetivo, 0.08);
    body.setVelocityX(this.vel);

    // Subir / bajar por la carretera para esquivar (sin saltar)
    let vy = subir ? -260 : bajar ? 260 : 0;
    if (this.player.y <= C.pistaTop && vy < 0) { this.player.y = C.pistaTop; vy = 0; }
    if (this.player.y >= C.pistaBot && vy > 0) { this.player.y = C.pistaBot; vy = 0; }
    body.setVelocityY(vy);

    // Bici sigue a Pelu y las ruedas giran según la velocidad
    const spin = (this.vel / 200) * 0.5;
    this.cuadro.setPosition(this.player.x, this.player.y + 24);
    this.rueda1.setPosition(this.player.x - 16, this.player.y + 32).rotation += spin;
    this.rueda2.setPosition(this.player.x + 16, this.player.y + 32).rotation += spin;
    // se inclina un poco al subir/bajar; se tambalea si chocó
    this.player.rotation = this.penal > 0 ? Math.sin(time / 40) * 0.14
      : (subir ? -0.12 : bajar ? 0.12 : Math.sin(time / 120) * 0.03);

    // Rival avanza constante por su carril
    if (!this.rivalFin) {
      this.rival.x += C.velRival * dt;
      this.rival.y = C.pistaTop + 30 + Math.sin(this.rival.x / 120) * 10;
      if (this.rival.x >= C.meta) { this.rivalFin = true; if (this.player.x < C.meta) this.posicion = 2; }
    }
    this.rivalCuadro.setPosition(this.rival.x, this.rival.y + 24);
    this.rivalRueda1.setPosition(this.rival.x - 14, this.rival.y + 30).rotation += spin;
    this.rivalRueda2.setPosition(this.rival.x + 14, this.rival.y + 30).rotation += spin;

    // Barra de progreso
    const fp = Phaser.Math.Clamp(this.player.x / C.meta, 0, 1);
    const fr = Phaser.Math.Clamp(this.rival.x / C.meta, 0, 1);
    this.iconPelu.x = this.barBx + this.barBw * fp;
    this.iconRival.x = this.barBx + this.barBw * fr;
    this.txtTiempo.setText(this.tiempo.toFixed(1) + "s");

    // Obstáculos (overlap manual)
    this.obstaculos.forEach(o => {
      if (o.active && Math.abs(o.x - this.player.x) < 24 && Math.abs(o.y - this.player.y) < 28) this.chocar(o);
    });

    // Monedas
    this.coleccion = this.coleccion.filter(o => {
      if (Math.abs(o.x - this.player.x) < 30 && Math.abs(o.y - this.player.y) < 36) {
        this.monedas++; this.txtMon.setText(this.monedas); this.brillito(o.x, o.y, "🪙");
        o.destroy(); return false;
      }
      return true;
    });

    // Meta
    if (this.player.x >= C.meta) this.ganar();
  }
}

if (typeof window !== "undefined") window.PeluRace = PeluRace;
