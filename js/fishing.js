/* ============================================================
   PELU ADVENTURES — La Pesca de Pelu (Phaser 3)
   Mueve el anzuelo (⬅➡ o tocando el agua), bájalo con ⬇ y
   atrapa peces. Cada especie nueva entra a la colección.
   Desarrolla: paciencia, puntería, reflejos y coleccionismo.
   ============================================================ */

const PeluFish = {
  game: null,
  keys: { left: false, right: false, down: false },
  retornoLugar: "lago",
  cfg: { aguaTop: 168, aguaBot: 452, hookTop: 150, tiempo: 60 },

  start(lugar = "lago") {
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
        <button class="ctrl salto" data-k="down">BAJAR ⬇</button>
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
      backgroundColor: "#bfe9ff",
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [FishScene],
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
      toast(`+${recompensa} ⭐ ¡Buena pesca, Pelu!`);
    } else if (salioAntes) {
      toast("Volvimos al mundo 🗺️");
    }
    Juego.mapa();
  },
};

/* ============================================================ */
class FishScene extends Phaser.Scene {
  constructor() { super("FishScene"); }

  preload() { PeluSprite.cargar(this); }

  create() {
    const C = PeluFish.cfg;
    this.C = C;
    this.puntos = 0; this.tiempo = C.tiempo; this.termino = false;
    this.nuevasEspecies = 0; this.atrapado = null;

    // Cielo + agua
    this.add.rectangle(450, 84, 900, 168, 0x9fe0ff);
    this.add.rectangle(450, (C.aguaTop + 480) / 2, 900, 480 - C.aguaTop, 0x3aa6d8);
    this.add.rectangle(450, C.aguaTop, 900, 6, 0x8fdcff).setAlpha(0.7);
    for (let i = 0; i < 5; i++) this.add.text(80 + i * 190, 36, "☁", { fontSize: "40px", color: "#fff" }).setAlpha(0.9);
    // muelle
    this.add.rectangle(120, C.aguaTop, 200, 16, 0xb07a45);
    this.add.rectangle(60, C.aguaTop + 60, 12, 120, 0x9c6736);

    // Pelu pescando
    this.pelu = this.add.image(120, C.hookTop - 40, "pelu").setDisplaySize(64, 70).setDepth(10);

    // Anzuelo + línea
    this.hookX = 120; this.hookY = C.hookTop;
    this.linea = this.add.graphics().setDepth(4);
    this.anzuelo = this.add.text(this.hookX, this.hookY, "🪝", { fontSize: "26px" }).setOrigin(0.5, 0).setDepth(6);

    // Peces y basura
    this.bichos = [];
    for (let i = 0; i < 7; i++) this.spawnPez();
    for (let i = 0; i < 2; i++) this.spawnBasura();

    // Tocar el agua mueve el anzuelo y lo baja
    this.input.on("pointerdown", p => { this.punteroActivo = true; this.punteroX = p.worldX; });
    this.input.on("pointermove", p => { if (p.isDown) this.punteroX = p.worldX; });
    this.input.on("pointerup", () => { this.punteroActivo = false; });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.crearHUD();
    this.relojEvt = this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.termino) return;
      this.tiempo--; this.txtTiempo.setText(this.tiempo);
      if (this.tiempo <= 10) this.txtTiempo.setColor("#d23b3b");
      if (this.tiempo <= 0) this.terminar();
    }});
    this.cartel("¡Atrapa peces! Mueve el anzuelo y bájalo al agua 🎣", 3000);
  }

  spawnPez() {
    const tipo = this.elegirPez();
    const dir = Math.random() < 0.5 ? 1 : -1;
    const x = dir === 1 ? -30 : 930;
    const y = Phaser.Math.Between(this.C.aguaTop + 30, this.C.aguaBot);
    const vel = Phaser.Math.Between(tipo.vel[0], tipo.vel[1]) * dir;
    const o = this.add.text(x, y, tipo.emoji, { fontSize: "30px" }).setOrigin(0.5).setDepth(5);
    o.setFlipX(dir === 1);
    o.tipo = tipo; o.vel = vel; o.es = "pez"; o.enganchado = false;
    this.bichos.push(o);
  }

  spawnBasura() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const o = this.add.text(dir === 1 ? -30 : 930,
      Phaser.Math.Between(this.C.aguaTop + 40, this.C.aguaBot),
      rnd(DATA.basura), { fontSize: "26px" }).setOrigin(0.5).setDepth(5);
    o.vel = Phaser.Math.Between(30, 55) * dir; o.es = "basura"; o.enganchado = false;
    this.bichos.push(o);
  }

  elegirPez() {
    const total = DATA.peces.reduce((a, p) => a + p.peso, 0);
    let r = Math.random() * total;
    for (const p of DATA.peces) { if ((r -= p.peso) <= 0) return p; }
    return DATA.peces[0];
  }

  crearHUD() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(40);
    const panel = (x, y, w, h) => {
      g.fillStyle(0x7a4a22).fillRoundedRect(x, y, w, h, 12);
      g.fillStyle(0xb5832e).fillRoundedRect(x + 3, y + 3, w - 6, h - 6, 9);
      g.fillStyle(0xd8a64c).fillRoundedRect(x + 6, y + 6, w - 12, (h - 12) / 2, 6);
    };
    panel(12, 12, 130, 40); panel(770, 12, 118, 40);
    const est = { fontSize: "22px", fontFamily: "Comic Sans MS, sans-serif", color: "#fff", stroke: "#5a3413", strokeThickness: 3 };
    this.add.text(22, 18, "🐟", { fontSize: "22px" }).setDepth(41);
    this.txtPuntos = this.add.text(52, 20, "0", est).setDepth(41);
    this.add.text(786, 18, "⏳", { fontSize: "22px" }).setDepth(41);
    this.txtTiempo = this.add.text(820, 20, "" + this.tiempo, est).setDepth(41);
  }

  cartel(txt, dur) {
    const c = this.add.text(450, 96, txt, { fontSize: "20px", fontFamily: "Comic Sans MS, sans-serif",
      align: "center", color: "#1c4e63", backgroundColor: "#ffffffdd", padding: { x: 14, y: 8 } })
      .setOrigin(0.5).setDepth(60);
    this.time.delayedCall(dur, () => c && c.destroy());
  }

  brillito(x, y, txt) {
    const s = this.add.text(x, y, txt, { fontSize: "22px", fontFamily: "Comic Sans MS, sans-serif",
      color: "#fff", stroke: "#1c4e63", strokeThickness: 3 }).setOrigin(0.5).setDepth(62);
    this.tweens.add({ targets: s, y: y - 40, alpha: 0, scale: 1.3, duration: 700, onComplete: () => s.destroy() });
  }

  update(time, delta) {
    if (this.termino) return;
    const C = this.C, dt = delta / 1000;
    const k = PeluFish.keys;
    const izq = this.cursors.left.isDown || k.left;
    const der = this.cursors.right.isDown || k.right;
    const baja = this.cursors.down.isDown || k.down || this.punteroActivo;

    // Mover anzuelo en horizontal
    if (this.punteroActivo && this.punteroX != null) {
      this.hookX = Phaser.Math.Linear(this.hookX, Phaser.Math.Clamp(this.punteroX, 20, 880), 0.2);
    } else {
      if (izq) this.hookX -= 230 * dt;
      if (der) this.hookX += 230 * dt;
      this.hookX = Phaser.Math.Clamp(this.hookX, 20, 880);
    }
    // Bajar / subir anzuelo
    const objetivoY = baja ? C.aguaBot : C.hookTop;
    this.hookY = Phaser.Math.Linear(this.hookY, objetivoY, (baja ? 0.06 : 0.10));

    // Dibujar caña y línea
    this.pelu.x = Math.min(this.hookX, 240);
    this.linea.clear();
    this.linea.lineStyle(2, 0x5a3d2a);
    this.linea.lineBetween(this.pelu.x + 18, this.C.hookTop - 30, this.hookX, this.hookY);
    this.anzuelo.setPosition(this.hookX, this.hookY);

    // Mover bichos y revisar enganche
    for (let i = this.bichos.length - 1; i >= 0; i--) {
      const b = this.bichos[i];
      if (b.enganchado) { b.x = this.hookX; b.y = this.hookY + 16; continue; }
      b.x += b.vel * dt;
      // salió de pantalla → reciclar
      if (b.x < -50 || b.x > 950) {
        b.destroy(); this.bichos.splice(i, 1);
        if (b.es === "pez" || Math.random() < 0.6) this.spawnPez(); else this.spawnBasura();
        continue;
      }
      // enganchar si el anzuelo lo toca y no hay nada enganchado
      if (!this.atrapado && this.hookY > C.aguaTop &&
          Math.abs(b.x - this.hookX) < 22 && Math.abs(b.y - (this.hookY + 12)) < 20) {
        b.enganchado = true; this.atrapado = b;
        this.brillito(b.x, b.y, b.es === "pez" ? "¡pica!" : "¡basura!");
      }
    }

    // Si hay algo enganchado y subió hasta arriba → cobrar
    if (this.atrapado && this.hookY <= C.hookTop + 4) {
      this.cobrar(this.atrapado);
      this.atrapado = null;
    }
  }

  cobrar(b) {
    if (b.es === "basura") {
      this.brillito(this.hookX, 120, "🥾 ¡basura!");
      this.tiempo = Math.max(1, this.tiempo - 2);
      this.txtTiempo.setText(this.tiempo);
    } else {
      this.puntos += b.tipo.valor;
      this.txtPuntos.setText(this.puntos);
      // colección de especies
      if (!Estado.data.coleccionPeces.includes(b.tipo.emoji)) {
        Estado.data.coleccionPeces.push(b.tipo.emoji);
        Estado.guardar();
        this.nuevasEspecies++;
        this.brillito(this.hookX, 120, `¡Nuevo! ${b.tipo.emoji} ${b.tipo.nombre}`);
      } else {
        this.brillito(this.hookX, 120, `${b.tipo.emoji} +${b.tipo.valor}`);
      }
    }
    b.destroy();
    const idx = this.bichos.indexOf(b);
    if (idx >= 0) this.bichos.splice(idx, 1);
    this.spawnPez();
  }

  terminar() {
    if (this.termino) return;
    this.termino = true;
    this.relojEvt.remove();
    const bonus = this.nuevasEspecies * 3;
    const total = this.puntos + bonus;
    const col = Estado.data.coleccionPeces.length;
    const txt = `🎣 ¡Fin de la pesca!\n🐟 ${this.puntos} puntos` +
      (bonus ? `\n+ ${bonus} por especies nuevas` : "") +
      `\nColección: ${col}/${DATA.peces.length}\n= ${total} ⭐`;
    const c = this.add.text(450, 210, txt, { fontSize: "26px", align: "center",
      fontFamily: "Comic Sans MS, sans-serif", color: "#1c4e63", backgroundColor: "#ffffffee",
      padding: { x: 24, y: 18 } }).setOrigin(0.5).setDepth(70);
    this.tweens.add({ targets: c, scale: { from: 0.6, to: 1 }, duration: 400, ease: "Back.out" });
    this.time.delayedCall(2600, () => PeluFish.finish(total));
  }
}

if (typeof window !== "undefined") window.PeluFish = PeluFish;
