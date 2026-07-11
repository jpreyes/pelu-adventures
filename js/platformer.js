/* ============================================================
   PELU ADVENTURES — Aventura de Plataformas (Phaser 3)
   Estilo: islas flotantes con pasto y roca, cocoteros, agua,
   monedas, gemas y corazones. Más reto: enemigos, vidas,
   escalera, plataforma móvil y cronómetro.
   Controles: flechas/ESPACIO o botones en pantalla (táctil).
   Las recompensas se suman al progreso del juego (Estado).
   ============================================================ */

const PeluPlatformer = {
  game: null,
  keys: { left: false, right: false, up: false, down: false, jump: false },
  retornoLugar: "bosque",

  // ---- Nivel (fácil de editar). y = superficie de pasto ----
  nivel: {
    ancho: 3400, alto: 540,
    spawn: { x: 90, y: 360 },
    // islas: x izquierda, y tope del pasto, w ancho
    islas: [
      { x: 0,    y: 430, w: 560,  palmera: true },
      { x: 700,  y: 360, w: 200 },
      { x: 980,  y: 300, w: 170 },
      { x: 1240, y: 250, w: 170, palmera: true },
      { x: 1240, y: 470, w: 360 },              // isla baja bajo la escalera
      { x: 1700, y: 330, w: 180 },
      { x: 1980, y: 270, w: 160 },
      { x: 2260, y: 360, w: 200 },
      { x: 2680, y: 300, w: 220, palmera: true },
      { x: 3020, y: 430, w: 380 },
    ],
    moviles: [ { x: 2520, y: 380, w: 130, dx: 0, dy: 70, vel: 60 } ],
    escaleras: [ { x: 1320, y1: 228, y2: 448, pisoY: 449 } ],
    monedas: [
      {x:200,y:380},{x:280,y:380},{x:360,y:380},{x:760,y:310},{x:1040,y:250},
      {x:1300,y:200},{x:1500,y:430},{x:1760,y:280},{x:2040,y:220},{x:2320,y:310},
      {x:2740,y:250},{x:3100,y:380},{x:3180,y:380},{x:3260,y:380},
    ],
    gemas: [ {x:1320,y:150}, {x:2560,y:300}, {x:2060,y:170} ],
    corazones: [ {x:1500,y:380} ],
    enemigos: [
      { x: 380, y: 410, rango: 130 },
      { x: 2330, y: 340, rango: 80 },
      { x: 3150, y: 410, rango: 150 },
    ],
    secreto: { x: 2790, y: 230 },
    meta: { x: 3300, y: 380 },
  },

  start(lugar = "bosque") {
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
          <div class="cruz-vert">
            <button class="ctrl chico" data-k="up">▲</button>
            <button class="ctrl chico" data-k="down">▼</button>
          </div>
          <button class="ctrl" data-k="right">▶</button>
        </div>
        <button class="ctrl salto" data-k="jump">SALTAR ⬆</button>
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

    this.keys = { left: false, right: false, up: false, down: false, jump: false };
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaser-canvas",
      width: 900, height: 480,
      backgroundColor: "#7ec8f0",
      pixelArt: true,
      physics: { default: "arcade", arcade: { gravity: { y: 1050 }, debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [PlatformScene],
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
      toast(`+${recompensa} ⭐ ¡Gran aventura, Pelu!`);
    } else if (salioAntes) {
      toast("Volvimos al mundo 🗺️");
    }
    Juego.mapa();
  },
};

/* ============================================================
   ESCENA DE PLATAFORMAS
   ============================================================ */
class PlatformScene extends Phaser.Scene {
  constructor() { super("PlatformScene"); }

  preload() { PeluSprite.cargar(this); }

  create() {
    const N = PeluPlatformer.nivel;
    this.N = N;
    this.monedasN = 0; this.gemasN = 0; this.vidas = 3; this.maxVidas = 3;
    this.tiempo = 90; this.termino = false; this.invuln = false; this.climbing = false;

    this.crearTexturas();

    this.physics.world.setBounds(0, 0, N.ancho, 720);
    this.cameras.main.setBounds(0, 0, N.ancho, 480);

    this.fondo(N.ancho);

    // ---- Islas (visual + cuerpo de colisión en el pasto) ----
    this.suelos = [];
    N.islas.forEach(is => {
      this.dibujarIsla(is.x, is.y, is.w, is.palmera);
      // cuerpo grueso (50px) con el tope en el pasto: evita que Pelu lo atraviese al caer rápido
      const cuerpo = this.add.rectangle(is.x + is.w / 2, is.y + 25, is.w - 8, 50);
      cuerpo.setVisible(false);
      this.physics.add.existing(cuerpo, true);
      this.suelos.push(cuerpo);
    });

    // ---- Plataformas móviles ----
    this.moviles = [];
    N.moviles.forEach(m => {
      const r = this.add.rectangle(m.x, m.y, m.w, 24, 0xc98b46).setStrokeStyle(4, 0x8a5a2b);
      r.pasto = this.add.rectangle(m.x, m.y - 10, m.w, 8, 0x86e060);
      this.physics.add.existing(r);
      r.body.setAllowGravity(false).setImmovable(true);
      r.eje = m.dx ? "x" : "y";
      r.minA = m.eje === "x" ? m.x - m.dx : m.y - m.dy;
      r.maxA = m.eje === "x" ? m.x + m.dx : m.y + m.dy;
      r.body.setVelocity(m.dx ? m.vel : 0, m.dy ? m.vel : 0);
      this.moviles.push(r);
    });

    // ---- Escaleras ----
    this.escaleras = N.escaleras;
    N.escaleras.forEach(L => this.dibujarEscalera(L));

    // ---- Pelu ----
    const p = this.add.image(0, 0, "pelu");
    p.setDisplaySize(54, 58);
    this.player = this.physics.add.existing(p);
    this.player.body.setSize(p.width * 0.46, p.width * 0.6).setOffset(p.width * 0.27, p.width * 0.32);
    this.player.body.setBounce(0.02);
    this.player.setPosition(N.spawn.x, N.spawn.y).setDepth(8);
    this.facing = 1;

    // Accesorios equipados que siguen a Pelu
    this.accesorios = [];
    const v = Estado.data.vestido;
    const addAcc = (id, dx, dy, atras) => {
      const r = buscar(DATA.ropa, id); if (!r) return;
      const t = this.add.text(0, 0, r.emoji, { fontSize: "26px" }).setOrigin(0.5).setDepth(atras ? 6 : 11);
      this.accesorios.push({ t, dx, dy });
    };
    addAcc(v.mochila, -18, 2, true);
    addAcc(v.sombrero, 0, -30, false);
    addAcc(v.gafas, 0, -6, false);
    addAcc(v.collar, 0, 18, false);

    this.physics.add.collider(this.player, this.suelos);
    this.physics.add.collider(this.player, this.moviles);

    // ---- Coleccionables ----
    this.coleccion = [];
    N.monedas.forEach(c => this.addColeccionable(c.x, c.y, "moneda", "moneda"));
    N.gemas.forEach(c => this.addColeccionable(c.x, c.y, "gema", "gema"));
    N.corazones.forEach(c => this.addColeccionable(c.x, c.y, "corazon", "corazon"));

    // ---- Tesoro secreto ----
    this.secreto = this.add.image(N.secreto.x, N.secreto.y, "gema").setTint(0xff7ad9).setScale(1.1);
    this.tweens.add({ targets: this.secreto, angle: 360, duration: 3000, repeat: -1 });

    // ---- Meta ----
    this.meta = this.add.text(N.meta.x, N.meta.y, "🏁", { fontSize: "52px" }).setOrigin(0.5);
    this.tweens.add({ targets: this.meta, y: N.meta.y - 8, duration: 700, yoyo: true, repeat: -1 });

    // ---- Enemigos ----
    this.enemigos = [];
    N.enemigos.forEach(e => {
      const en = this.physics.add.image(e.x, e.y, "enemigo");
      en.body.setSize(34, 22).setOffset(3, 10);
      en.minX = e.x - e.rango; en.maxX = e.x + e.rango;
      en.setVelocityX(70); en.setDepth(7);
      this.physics.add.collider(en, this.suelos);
      this.physics.add.collider(en, this.moviles);
      this.enemigos.push(en);
    });
    this.physics.add.overlap(this.player, this.enemigos, (pl, en) => this.tocarEnemigo(en));

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaSalto = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.crearHUD();

    // Cronómetro
    this.relojEvt = this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        if (this.termino) return;
        this.tiempo--;
        this.txtTiempo.setText(this.tiempo);
        if (this.tiempo <= 10) this.txtTiempo.setColor("#d23b3b");
        if (this.tiempo <= 0) this.acabarPorTiempo();
      },
    });

    this.cartel("¡Junta monedas y gemas, esquiva enemigos y llega a la 🏁!", 3000);
  }

  /* ---------- Texturas dibujadas ---------- */
  crearTexturas() {
    let g = this.make.graphics({ add: false });
    // Moneda
    g.fillStyle(0xf4c430).fillCircle(16, 16, 15);
    g.lineStyle(4, 0xc9971b).strokeCircle(16, 16, 15);
    g.fillStyle(0xffe79a).fillCircle(12, 11, 5);
    g.lineStyle(3, 0xd9a52a).strokeCircle(16, 16, 9);
    g.generateTexture("moneda", 32, 32); g.clear();
    // Gema (diamante)
    g.fillStyle(0x49c5ff).fillPoints([{x:16,y:1},{x:31,y:13},{x:16,y:31},{x:1,y:13}], true);
    g.fillStyle(0x8de2ff).fillPoints([{x:16,y:1},{x:23,y:13},{x:16,y:31},{x:9,y:13}], true);
    g.lineStyle(2, 0x2a9fd6).strokePoints([{x:16,y:1},{x:31,y:13},{x:16,y:31},{x:1,y:13}], true);
    g.generateTexture("gema", 32, 32); g.clear();
    // Corazón
    g.fillStyle(0xff5a7a).fillCircle(10, 11, 8).fillCircle(22, 11, 8);
    g.fillTriangle(2, 13, 30, 13, 16, 30);
    g.fillStyle(0xffb3c4).fillCircle(8, 9, 3);
    g.generateTexture("corazon", 32, 31); g.clear();
    // Enemigo (bicho con púas)
    g.fillStyle(0x8a5cc7).fillRoundedRect(3, 10, 34, 22, 10);
    g.fillStyle(0x6f44a8);
    for (let i = 0; i < 5; i++) g.fillTriangle(6 + i * 7, 11, 12 + i * 7, 11, 9 + i * 7, 2);
    g.fillStyle(0xffffff).fillCircle(14, 20, 5).fillCircle(26, 20, 5);
    g.fillStyle(0x3a2a55).fillCircle(15, 21, 2.5).fillCircle(27, 21, 2.5);
    g.generateTexture("enemigo", 40, 34); g.destroy();
  }

  /* ---------- Fondo: colinas en parallax + agua + nubes ---------- */
  fondo(ancho) {
    for (let x = 60; x < ancho; x += 320) {
      this.add.text(x, 50 + (x % 130), "☁", { fontSize: "46px", color: "#ffffff" }).setScrollFactor(0.3).setDepth(-5).setAlpha(0.95);
    }
    // colinas lejanas
    for (let x = -100; x < ancho; x += 260) {
      this.add.circle(x, 470, 150, 0x9bd86a).setScrollFactor(0.5).setDepth(-4).setAlpha(0.7);
    }
    for (let x = -50; x < ancho; x += 230) {
      this.add.circle(x, 480, 130, 0x6fc24a).setScrollFactor(0.7).setDepth(-3).setAlpha(0.85);
    }
    // agua al fondo (fijo a cámara)
    this.add.rectangle(450, 462, 900, 60, 0x49b6e8).setScrollFactor(0).setDepth(-2).setAlpha(0.9);
    this.add.rectangle(450, 446, 900, 8, 0x8fdcff).setScrollFactor(0).setDepth(-2).setAlpha(0.7);
  }

  /* ---------- Dibujar una isla flotante ---------- */
  dibujarIsla(x, y, w, palmera) {
    const g = this.add.graphics().setDepth(0);
    const grassH = 18, bodyH = Math.min(120, 60 + w * 0.15);
    // tierra/roca (se angosta hacia abajo)
    g.fillStyle(0xd9b27c);
    g.fillPoints([
      { x: x, y: y + grassH }, { x: x + w, y: y + grassH },
      { x: x + w * 0.82, y: y + grassH + bodyH * 0.7 },
      { x: x + w * 0.6, y: y + grassH + bodyH },
      { x: x + w * 0.4, y: y + grassH + bodyH },
      { x: x + w * 0.18, y: y + grassH + bodyH * 0.7 },
    ], true, true);
    // sombra de la roca
    g.fillStyle(0xc29b66);
    g.fillPoints([
      { x: x + w * 0.4, y: y + grassH + bodyH }, { x: x + w * 0.6, y: y + grassH + bodyH },
      { x: x + w * 0.82, y: y + grassH + bodyH * 0.7 }, { x: x + w * 0.7, y: y + grassH + bodyH * 0.5 },
    ], true, true);
    // piedras
    g.fillStyle(0xb58d5c);
    g.fillCircle(x + w * 0.3, y + grassH + 26, 9);
    g.fillCircle(x + w * 0.62, y + grassH + 34, 7);
    // pasto (capa superior redondeada)
    g.fillStyle(0x6fc24a);
    g.fillRoundedRect(x - 2, y, w + 4, grassH + 10, 10);
    g.fillStyle(0x86e060);
    g.fillRoundedRect(x - 2, y, w + 4, grassH - 4, 8);
    // borde de pasto ondulado
    g.fillStyle(0x6fc24a);
    for (let i = 0; i < w; i += 22) g.fillCircle(x + i + 11, y + grassH - 2, 8);
    // matita decorativa
    g.fillStyle(0x4fae2e);
    g.fillTriangle(x + 14, y + 2, x + 22, y + 2, x + 18, y - 12);
    g.fillTriangle(x + 20, y + 2, x + 28, y + 2, x + 24, y - 9);

    if (palmera) this.dibujarPalmera(x + w * 0.5, y);
  }

  dibujarPalmera(cx, baseY) {
    const g = this.add.graphics().setDepth(1);
    // tronco
    g.fillStyle(0xb07a45);
    g.fillRoundedRect(cx - 8, baseY - 74, 16, 78, 6);
    g.fillStyle(0x9c6736);
    for (let i = 0; i < 4; i++) g.fillRect(cx - 8, baseY - 64 + i * 16, 16, 4);
    // cocos
    g.fillStyle(0x6b4a2a).fillCircle(cx - 6, baseY - 74, 6).fillCircle(cx + 7, baseY - 72, 6);
    // hojas
    g.fillStyle(0x57b23a);
    const hoja = (ang) => {
      const ex = cx + Math.cos(ang) * 52, ey = baseY - 74 + Math.sin(ang) * 30;
      g.fillTriangle(cx, baseY - 78, ex, ey - 12, ex + 6, ey + 10);
    };
    hoja(Math.PI * 1.05); hoja(Math.PI * 1.25); hoja(Math.PI * 1.55);
    hoja(Math.PI * 1.75); hoja(Math.PI * 1.95);
    g.fillStyle(0x6fce4a);
    hoja(Math.PI * 1.4); hoja(Math.PI * 1.65);
  }

  dibujarEscalera(L) {
    const g = this.add.graphics().setDepth(2);
    const yBase = L.y2 + 22;  // que el dibujo llegue al pasto de la isla baja
    g.lineStyle(5, 0xb07a45);
    g.lineBetween(L.x - 12, L.y1, L.x - 12, yBase);
    g.lineBetween(L.x + 12, L.y1, L.x + 12, yBase);
    g.lineStyle(4, 0xcd9456);
    for (let yy = L.y1 + 8; yy < yBase; yy += 20) g.lineBetween(L.x - 12, yy, L.x + 12, yy);
  }

  addColeccionable(x, y, tex, tipo) {
    const o = this.add.image(x, y, tex).setDepth(5);
    o.tipo = tipo;
    this.tweens.add({ targets: o, y: y - 8, duration: 700 + Math.random() * 200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    if (tipo === "moneda") this.tweens.add({ targets: o, scaleX: 0.3, duration: 600, yoyo: true, repeat: -1 });
    this.coleccion.push(o);
  }

  /* ---------- HUD con paneles de madera ---------- */
  crearHUD() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(40);
    const panel = (x, y, w, h) => {
      g.fillStyle(0x7a4a22).fillRoundedRect(x, y, w, h, 12);
      g.fillStyle(0xb5832e).fillRoundedRect(x + 3, y + 3, w - 6, h - 6, 9);
      g.fillStyle(0xd8a64c).fillRoundedRect(x + 6, y + 6, w - 12, (h - 12) / 2, 6);
    };
    panel(12, 12, 120, 40);   // monedas
    panel(144, 12, 110, 40);  // gemas
    panel(12, 60, 168, 38);   // corazones
    panel(770, 12, 118, 40);  // tiempo

    const estilo = { fontSize: "22px", fontFamily: "Comic Sans MS, sans-serif", color: "#fff", stroke: "#5a3413", strokeThickness: 3 };
    this.add.image(34, 32, "moneda").setScrollFactor(0).setDepth(41).setScale(0.8);
    this.txtMon = this.add.text(54, 20, "0", estilo).setScrollFactor(0).setDepth(41);
    this.add.image(166, 32, "gema").setScrollFactor(0).setDepth(41).setScale(0.8);
    this.txtGem = this.add.text(186, 20, "0", estilo).setScrollFactor(0).setDepth(41);

    this.iconosVida = [];
    for (let i = 0; i < this.maxVidas; i++) {
      this.iconosVida.push(this.add.image(34 + i * 32, 79, "corazon").setScrollFactor(0).setDepth(41).setScale(0.7));
    }
    this.add.text(786, 18, "⏳", { fontSize: "24px" }).setScrollFactor(0).setDepth(41);
    this.txtTiempo = this.add.text(818, 20, "90", estilo).setScrollFactor(0).setDepth(41);
  }

  cartel(txt, dur) {
    const c = this.add.text(450, 96, txt, {
      fontSize: "20px", fontFamily: "Comic Sans MS, sans-serif", align: "center",
      color: "#5a3d5c", backgroundColor: "#ffffffdd", padding: { x: 14, y: 8 }, wordWrap: { width: 600 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
    this.time.delayedCall(dur, () => c && c.destroy());
  }

  brillito(x, y, emoji) {
    const s = this.add.text(x, y, emoji, { fontSize: "26px" }).setOrigin(0.5).setDepth(62);
    this.tweens.add({ targets: s, y: y - 36, alpha: 0, scale: 1.5, duration: 650, onComplete: () => s.destroy() });
  }

  /* ---------- Daño / enemigos ---------- */
  tocarEnemigo(en) {
    if (this.termino || !en.active) return;
    const cayendo = this.player.body.velocity.y > 60;
    const arriba = this.player.body.bottom <= en.body.center.y + 8;
    if (cayendo && arriba) {
      // pisotón
      en.destroy();
      this.player.body.setVelocityY(-480);
      this.brillito(en.x, en.y, "💥");
      this.monedasN += 2; this.txtMon.setText(this.monedasN);
    } else if (!this.invuln) {
      this.perderVida();
      const dir = this.player.x < en.x ? -1 : 1;
      this.player.body.setVelocity(dir * 240, -300);
    }
  }

  perderVida() {
    this.vidas--;
    if (this.iconosVida[this.vidas]) this.iconosVida[this.vidas].setAlpha(0.2);
    this.invuln = true;
    this.tweens.add({ targets: this.player, alpha: 0.3, duration: 120, yoyo: true, repeat: 6,
      onComplete: () => { this.player.setAlpha(1); this.invuln = false; } });
    if (this.vidas <= 0) {
      this.cartel("¡Ay! Pelu se mareó 😵 ¡Con calma, vuelve a empezar!", 2200);
      this.time.delayedCall(700, () => {
        this.vidas = this.maxVidas;
        this.iconosVida.forEach(i => i.setAlpha(1));
        this.player.setPosition(this.N.spawn.x, this.N.spawn.y);
        this.player.body.setVelocity(0, 0);
      });
    }
  }

  respawn() {
    this.perderVida();
    this.player.setPosition(this.N.spawn.x, this.N.spawn.y);
    this.player.body.setVelocity(0, 0);
  }

  /* ---------- Fin ---------- */
  acabarPorTiempo() {
    if (this.termino) return;
    this.cartel("¡Se acabó el tiempo! Igual lo hiciste genial 💛", 2000);
    this.ganar(false);
  }

  ganar(conBonus = true) {
    if (this.termino) return;
    this.termino = true;
    this.player.body.setVelocity(0, 0);
    this.relojEvt.remove();
    const bonusMeta = conBonus ? 8 : 0;
    const bonusTiempo = conBonus ? Math.floor(this.tiempo / 5) : 0;
    const total = this.monedasN + this.gemasN * 3 + bonusMeta + bonusTiempo;
    const txt = `${conBonus ? "🏁 ¡META! 🏁" : "⏳ ¡Fin!"}\n` +
      `🪙 ${this.monedasN}  +  💎 ${this.gemasN}×3` +
      (conBonus ? `\n+ ${bonusMeta} meta + ${bonusTiempo} tiempo` : "") +
      `\n= ${total} ⭐`;
    const c = this.add.text(450, 210, txt, {
      fontSize: "28px", align: "center", fontFamily: "Comic Sans MS, sans-serif",
      color: "#5a3d5c", backgroundColor: "#ffffffee", padding: { x: 24, y: 18 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(70);
    this.tweens.add({ targets: c, scale: { from: 0.6, to: 1 }, duration: 400, ease: "Back.out" });
    this.time.delayedCall(2400, () => PeluPlatformer.finish(total));
  }

  /* ---------- Bucle ---------- */
  update(time, delta) {
    if (this.termino) return;
    const body = this.player.body;
    const k = PeluPlatformer.keys;
    const izq = this.cursors.left.isDown || k.left;
    const der = this.cursors.right.isDown || k.right;
    const subir = this.cursors.up.isDown || k.up;
    const bajar = this.cursors.down.isDown || k.down;
    const enSuelo = body.blocked.down || body.touching.down;

    // ¿Está sobre una escalera?
    const esc = this.escaleras.find(L =>
      Math.abs(this.player.x - L.x) < 26 && this.player.y > L.y1 - 6 && this.player.y < L.y2 + 22);

    // Entrar a trepar SOLO al presionar (flanco), no mientras se mantiene:
    // así, al llegar al final con la tecla apretada, no vuelve a meterse.
    const subirEdge = subir && !this._prevSubir;
    const bajarEdge = bajar && !this._prevBajar;
    if (esc && (subirEdge || bajarEdge)) this.climbing = true;
    if (this.climbing && !esc) this.climbing = false;

    // Saltar: ▲/↑ salta cuando NO hay escalera; SALTAR siempre
    const salta = this.teclaSalto.isDown || k.jump || ((subir) && !esc && !this.climbing);

    if (this.climbing) {
      // Trepar: sin gravedad y atravesando las plataformas
      body.setAllowGravity(false);
      body.checkCollision.none = true;
      body.setVelocityY(subir ? -160 : bajar ? 160 : 0);
      // centra a Pelu en la escalera, pero permite salirse caminando
      if (!izq && !der) body.setVelocityX((esc.x - this.player.x) * 4);
      // soltarse al llegar al tope (subiendo) o al fondo (bajando).
      // body.reset recoloca el cuerpo y frena, evitando que atraviese la isla.
      if (subir && this.player.y <= esc.y1 + 2) { this.climbing = false; body.setVelocityY(0); }
      else if (bajar && this.player.y >= esc.y2) { this.climbing = false; body.reset(this.player.x, esc.pisoY || esc.y2); }
      if (this.teclaSalto.isDown || k.jump) { this.climbing = false; body.setVelocityY(-560); }
      if (!this.climbing) { body.setAllowGravity(true); body.checkCollision.none = false; }
    } else {
      body.setAllowGravity(true);
      body.checkCollision.none = false;
    }

    // recordar estado de teclas para detectar el flanco la próxima vez
    this._prevSubir = subir; this._prevBajar = bajar;

    // Horizontal
    if (izq) { body.setVelocityX(-240); this.facing = -1; }
    else if (der) { body.setVelocityX(240); this.facing = 1; }
    else if (!this.climbing) { body.setVelocityX(0); }
    this.player.setFlipX(this.facing === -1);

    // Salto (solo en el suelo y fuera de escalera)
    if (salta && enSuelo && !this.climbing) {
      body.setVelocityY(-580);
      this.tweens.add({ targets: this.player, scaleX: this.player.scaleX * 0.85, scaleY: this.player.scaleY * 1.15, duration: 110, yoyo: true });
    }
    if (enSuelo && (izq || der)) this.player.rotation = Math.sin(time / 60) * 0.07;
    else this.player.rotation = Phaser.Math.Linear(this.player.rotation, 0, 0.2);

    // Plataformas móviles: rebotan entre límites y llevan a Pelu encima
    this.moviles.forEach(m => {
      const v = m.body.velocity;
      const pos = m.eje === "x" ? m.x : m.y;
      const rapidez = m.eje === "x" ? Math.abs(v.x) : Math.abs(v.y);
      if (pos <= m.minA) m.body.setVelocity(m.eje === "x" ? rapidez : 0, m.eje === "y" ? rapidez : 0);
      if (pos >= m.maxA) m.body.setVelocity(m.eje === "x" ? -rapidez : 0, m.eje === "y" ? -rapidez : 0);
      // el pasto decorativo sigue a la plataforma
      m.pasto.x = m.x; m.pasto.y = m.y - 12;
      // si Pelu va encima, se mueve con la plataforma
      const sobre = body.touching.down && Math.abs(this.player.x - m.x) < m.width / 2 + 6 &&
        Math.abs(body.bottom - (m.y - 12)) < 16;
      if (sobre) { this.player.x += m.body.deltaX(); this.player.y += m.body.deltaY(); }
    });

    // Enemigos patrullan
    this.enemigos.forEach(en => {
      if (!en.active) return;
      if (en.x <= en.minX) en.setVelocityX(70);
      if (en.x >= en.maxX) en.setVelocityX(-70);
      en.setFlipX(en.body.velocity.x < 0);
    });

    // Accesorios siguen a Pelu
    this.accesorios.forEach(a => {
      a.t.x = this.player.x + a.dx * this.facing;
      a.t.y = this.player.y + a.dy;
      a.t.setFlipX(this.facing === -1);
    });

    // Recolectar
    this.coleccion = this.coleccion.filter(o => {
      if (Math.abs(o.x - this.player.x) < 30 && Math.abs(o.y - this.player.y) < 36) {
        if (o.tipo === "moneda") { this.monedasN++; this.txtMon.setText(this.monedasN); this.brillito(o.x, o.y, "🪙"); }
        else if (o.tipo === "gema") { this.gemasN++; this.txtGem.setText(this.gemasN); this.brillito(o.x, o.y, "💎"); }
        else if (o.tipo === "corazon") {
          if (this.vidas < this.maxVidas) { this.vidas++; this.iconosVida[this.vidas - 1].setAlpha(1); }
          this.brillito(o.x, o.y, "❤️");
        }
        o.destroy(); return false;
      }
      return true;
    });

    // Tesoro secreto
    if (this.secreto && Math.abs(this.secreto.x - this.player.x) < 32 && Math.abs(this.secreto.y - this.player.y) < 38) {
      Estado.data.coleccion.push("💎"); Estado.guardar();
      this.brillito(this.secreto.x, this.secreto.y, "💎");
      this.cartel("¡Tesoro secreto! 💎", 1600);
      this.secreto.destroy(); this.secreto = null;
    }

    // Caer al agua → pierde vida y reaparece
    if (this.player.y > 540) this.respawn();

    // Meta
    if (Math.abs(this.meta.x - this.player.x) < 44 && this.player.y < this.meta.y + 70) this.ganar(true);
  }
}

if (typeof window !== "undefined") window.PeluPlatformer = PeluPlatformer;
