/* ============================================================
   PELU ADVENTURES — Cocina Mágica
   Juego de recetas por fases (todo táctil, ideal para iPad):
   1) elegir receta   2) ingredientes en orden y cantidad
   3) (mayores) suma total   4) mezclar   5) hornear (timing)
   6) decorar libre   7) servir a un amigo.
   Desarrolla: lectura, conteo, orden/secuencia, estimación de
   tiempo, creatividad y paciencia. Sin sensación de tarea.
   ============================================================ */

const PeluCook = {
  s: null,

  start(lugar = "cocina") {
    this.s = { lugar, receta: null, pasoIdx: 0, conteo: 0, recolectado: [], total: 0,
               horneado: "", toppings: [], estrellas: 0 };
    this.elegir();
  },

  salir() { Juego.entrar(this.s.lugar); },

  /* ---- 1) Elegir receta ---- */
  elegir() {
    const cards = DATA.recetas.map(r => `
      <div class="receta-card" onclick="PeluCook.empezarReceta('${r.id}')">
        <div class="receta-emoji">${r.emoji}</div>
        <div class="receta-nombre">${r.nombre}</div>
        <div class="receta-pasos">${r.pasos.length} pasos</div>
      </div>`).join("");
    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <button class="volver" onclick="PeluCook.salir()">← Volver</button>
        <h1>Cocina Mágica 🧁</h1>
        <div class="cocinera">${dibujarPelu(80)}<span class="gorro-chef">👩‍🍳</span></div>
        <p class="sub">¿Qué cocinamos hoy?</p>
        <div class="grid-recetas">${cards}</div>
      </div>`;
  },

  empezarReceta(id) {
    const r = buscar(DATA.recetas, id);
    this.s.receta = r; this.s.pasoIdx = 0; this.s.conteo = 0; this.s.recolectado = [];
    this.s.total = r.pasos.reduce((a, p) => a + p.cant, 0);
    this.ingredientes();
  },

  /* ---- 2) Ingredientes en orden ---- */
  ingredientes() {
    const r = this.s.receta;
    const paso = r.pasos[this.s.pasoIdx];

    // Lista/receta con progreso
    const lista = r.pasos.map((p, i) => {
      const hecho = i < this.s.pasoIdx;
      const actual = i === this.s.pasoIdx;
      const n = actual ? this.s.conteo : (hecho ? p.cant : 0);
      return `<div class="paso-receta ${hecho ? "hecho" : ""} ${actual ? "actual" : ""}">
                ${hecho ? "✅" : p.ing} ${p.cant} ${p.nombre} <span class="paso-cont">${n}/${p.cant}</span>
              </div>`;
    }).join("");

    // Botonera de ingredientes (el correcto + otros pasos + distractores), mezclada
    const opciones = shuffle([
      paso.ing,
      ...r.pasos.filter((_, i) => i !== this.s.pasoIdx).map(p => p.ing),
      ...r.distractores,
    ].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 7);

    const botones = opciones.map(em =>
      `<button class="ing-btn" onclick="PeluCook.tapIngrediente('${em}')">${em}</button>`).join("");

    const bowl = this.s.recolectado.map(e => `<span>${e}</span>`).join("");

    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <button class="volver" onclick="PeluCook.elegir()">← Recetas</button>
        <h1>${r.emoji} ${r.nombre}</h1>
        <div class="receta-lista">${lista}</div>
        <div class="instruccion">Agrega <b>${paso.cant} ${paso.nombre}</b> ${paso.ing}</div>
        <div class="bowl">🥣<div class="bowl-cont">${bowl}</div></div>
        <div class="ingredientes-tray">${botones}</div>
      </div>`;
  },

  tapIngrediente(em) {
    const r = this.s.receta;
    const paso = r.pasos[this.s.pasoIdx];
    if (em === paso.ing) {
      this.s.conteo++;
      this.s.recolectado.push(em);
      if (this.s.conteo >= paso.cant) {
        this.s.pasoIdx++;
        this.s.conteo = 0;
        if (this.s.pasoIdx >= r.pasos.length) {
          return (Estado.data.edad >= 8) ? this.sumaTotal() : this.mezclar();
        }
      }
      this.ingredientes();
    } else {
      toast(rnd(["Ese no toca aún 😺", "¡Mira la receta! 👀", "Casi, busca el correcto 🌱"]));
      const b = event && event.target; if (b) { b.classList.add("sacudir"); setTimeout(() => b.classList.remove("sacudir"), 400); }
    }
  },

  /* ---- 3) Suma total (mayores): integra matemáticas ---- */
  sumaTotal() {
    const correcto = this.s.total;
    const ops = opcionesNumericas(correcto, 3).map(v =>
      `<button class="opcion-reto" onclick="PeluCook.checkSuma(${v},${correcto})">${v}</button>`).join("");
    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <h1>¡Cuenta de cocinera! 🧮</h1>
        <div class="cocinera">${dibujarPelu(80)}</div>
        <p class="av-texto">Usaste estos ingredientes:</p>
        <div class="ecuacion">${this.s.receta.pasos.map(p => p.cant).join(" + ")}</div>
        <p class="reto-pregunta">¿Cuántos ingredientes en total?</p>
        <div class="reto-opciones">${ops}</div>
      </div>`;
  },

  checkSuma(v, correcto) {
    if (v === correcto) { this.s.estrellas += 3; confeti(); toast("¡Cuenta perfecta! +3 ⭐"); }
    else { toast(`Eran ${correcto}. ¡La próxima sale! 💗`); }
    this.mezclar();
  },

  /* ---- 4) Mezclar (tactil) ---- */
  mezclar() {
    this.s.mezcla = 0;
    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <h1>¡A mezclar! 🥄</h1>
        <div class="cocinera">${dibujarPelu(90)}</div>
        <div class="mezcla-bowl" id="mezcla-bowl">🥣</div>
        <div class="barra-prog"><div class="barra-prog-fill" id="mezcla-fill"></div></div>
        <button class="btn grande pulso" onclick="PeluCook.batir()">Mezclar 🥄</button>
      </div>`;
  },

  batir() {
    this.s.mezcla += 14;
    const fill = document.getElementById("mezcla-fill");
    const bowl = document.getElementById("mezcla-bowl");
    if (fill) fill.style.width = Math.min(100, this.s.mezcla) + "%";
    if (bowl) { bowl.style.transform = `rotate(${(this.s.mezcla % 2 ? 12 : -12)}deg)`; }
    if (this.s.mezcla >= 100) { setTimeout(() => this.hornear(), 250); }
  },

  /* ---- 5) Hornear (timing: detén en la zona perfecta) ---- */
  hornear() {
    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <h1>¡Al horno! 🔥</h1>
        <p class="sub">Detén la aguja en la <b>zona verde</b> para que quede perfecto.</p>
        <div class="horno">
          <div class="horno-pista">
            <div class="zona-perfecta"></div>
            <div class="aguja" id="aguja"></div>
          </div>
        </div>
        <button class="btn grande rojo" onclick="PeluCook.detenerHorno()">¡LISTO! 🛎️</button>
      </div>`;
    const aguja = document.getElementById("aguja");
    let pos = 0, dir = 1;
    const vel = 1.1 + Math.min(1.2, Estado.data.edad * 0.12); // más rápido = más difícil con la edad
    this.s._horno = setInterval(() => {
      pos += dir * vel;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      this.s._hpos = pos;
      if (aguja) aguja.style.left = pos + "%";
    }, 16);
  },

  detenerHorno() {
    clearInterval(this.s._horno);
    const pos = this.s._hpos || 0;
    // zona perfecta: 40%–60%; bien: 25%–75%
    let bonus = 0, msg = "";
    if (pos >= 40 && pos <= 60) { this.s.horneado = "perfecto"; bonus = 5; msg = "¡Perfecto! Doradito 🌟"; }
    else if (pos >= 25 && pos <= 75) { this.s.horneado = "bien"; bonus = 2; msg = "¡Quedó rico! 😋"; }
    else if (pos < 25) { this.s.horneado = "crudo"; msg = "Un poco crudo… ¡igual se come! 😅"; }
    else { this.s.horneado = "tostado"; msg = "Un pelín tostado 😆 ¡con cariño igual!"; }
    this.s.estrellas += bonus;
    confeti(); toast(msg);
    setTimeout(() => this.decorar(), 700);
  },

  /* ---- 6) Decorar (creatividad libre) ---- */
  decorar() {
    const r = this.s.receta;
    const base = this.s.horneado === "tostado" ? "🍪" : r.emoji;
    const tray = r.toppings.map(t =>
      `<button class="topping-btn" onclick="PeluCook.ponTopping('${t}')">${t}</button>`).join("");
    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <h1>¡Decora a tu gusto! 🎨</h1>
        <div class="plato">
          <div class="plato-base">${base}</div>
          <div class="toppings-zona" id="toppings-zona"></div>
        </div>
        <div class="ingredientes-tray">${tray}</div>
        <button class="btn grande" onclick="PeluCook.servir()">¡Servir! 🍽️</button>
      </div>`;
  },

  ponTopping(t) {
    if (this.s.toppings.length >= 12) return;
    this.s.toppings.push(t);
    const zona = document.getElementById("toppings-zona");
    const s = document.createElement("span");
    s.textContent = t;
    s.className = "topping-puesto";
    s.style.left = (15 + Math.random() * 70) + "%";
    s.style.top = (10 + Math.random() * 70) + "%";
    zona.appendChild(s);
  },

  /* ---- 7) Servir y recompensa ---- */
  servir() {
    const creat = Math.min(5, this.s.toppings.length);
    const total = 6 + this.s.estrellas + creat;
    Estado.data.aventurasHechas["cocinar"] = (Estado.data.aventurasHechas["cocinar"] || 0) + 1;
    Estado.ganar(total);
    confeti();
    const amigo = rnd(["🐰", "🐶", "🐤", "🦔", "🐢", "🐿️"]);
    const base = this.s.horneado === "tostado" ? "🍪" : this.s.receta.emoji;
    app().innerHTML = `
      ${barra()}
      <div class="escena cocina-escena">
        <div class="av-final">
          <div class="servir-escena">
            <span class="plato-base">${base}${this.s.toppings.slice(0,6).join("")}</span>
            <span class="amigo-feliz">${amigo}</span>
          </div>
          <h1>${rnd(DATA.animos)}</h1>
          <p class="av-texto">${amigo} probó tu ${this.s.receta.nombre} y… ¡le encantó! 💗</p>
          <div class="premio">+${total} ⭐</div>
          <div class="botones-final">
            <button class="btn grande" onclick="PeluCook.elegir()">👩‍🍳 Otra receta</button>
            <button class="btn" onclick="PeluCook.salir()">🏡 Volver</button>
          </div>
        </div>
      </div>`;
  },
};

if (typeof window !== "undefined") window.PeluCook = PeluCook;
