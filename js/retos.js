/* ============================================================
   PELU ADVENTURES — Generador de retos por NIVEL (1 a 10)
   Matemáticas, lógica, inglés y dinero. Cada materia tiene su
   propio nivel, que sube o baja solo según cómo le va a la niña
   (ver Aventura.ronda en aventuras.js).

   Nivel aproximado: 1–2 = 2º básico · 3–4 = 3º–4º · 5–6 = 5º–6º
                     7–8 = 7º–8º · 9–10 = 1º medio (desafío)

   Cada generador devuelve una pregunta:
     { escena: html, pregunta: texto, ok: "respuesta", malas: [...], exp: html,
       hablar?: "texto en inglés para el botón 🔊" }
   Las opciones incorrectas salen de ERRORES TÍPICOS (no números al azar).
   El contenido escrito (vocabulario, frases, acertijos) vive en
   ingles-*.js y logica-contenido.js.
   ============================================================ */

const R = {
  ri: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  mezclar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; },
  mcm(a, b) { return a / R.mcd(a, b) * b; },
  red(x) { return Math.round(x * 100) / 100; },
  // Número a texto chileno: 12.500 · 2,75 · −3
  n(x) {
    x = R.red(x);
    let s = Number.isInteger(x) ? (Math.abs(x) >= 10000 ? Math.abs(x).toLocaleString("es-CL") : String(Math.abs(x)))
                                : String(Math.abs(x)).replace(".", ",");
    return (x < 0 ? "−" : "") + s;
  },
  pesos(x) { return "$" + Math.round(x).toLocaleString("es-CL"); },
  frac(a, b) {                      // fracción simplificada como texto
    if (b < 0) { a = -a; b = -b; }
    const g = R.mcd(a, b) || 1; a /= g; b /= g;
    return b === 1 ? R.n(a) : `${a < 0 ? "−" : ""}${Math.abs(a)}/${b}`;
  },
  fracSin(a, b) { return `${a}/${b}`; }, // sin simplificar (para distractores)
  eq: s => `<div class="ecuacion">${s}</div>`,
  primo(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; },
  factores(n) { const f = []; let d = 2; while (n > 1) { while (n % d === 0) { f.push(d); n /= d; } d++; } return f; },
  invertir(n) { const s = String(Math.abs(n)).split("").reverse().join(""); return Number(s) * Math.sign(n || 1); },

  // Distractores numéricos: primero los errores típicos, luego cercanos
  // (±10 mantiene la última cifra: así no se descartan mirando solo la unidad)
  numMalas(ans, tipicos = [], permitirNeg = false) {
    const set = new Set();
    const add = v => {
      if (v === undefined || v === null || !isFinite(v)) return;
      v = R.red(v);
      if (v === R.red(ans) || (!permitirNeg && v < 0)) return;
      set.add(v);
    };
    tipicos.forEach(add);
    const paso = Math.abs(ans) >= 1000 ? 100 : Math.abs(ans) >= 100 ? 10 : Number.isInteger(ans) ? 10 : 0.1;
    const extra = [ans + paso, ans - paso, ans + 1, ans - 1, ans + 2 * paso, ans - 2, ans + 2, R.invertir(ans)];
    for (const c of R.mezclar(extra)) { if (set.size >= 6) break; add(Number.isInteger(ans) ? Math.round(c) : c); }
    for (let k = 3; set.size < 3; k++) add(ans + k);
    return [...set].slice(0, 3).map(R.n);
  },
};

/* ------------------------------------------------------------
   Utilidad: elegir un generador según el nivel.
   Mezcla el nivel actual (más peso) con los dos anteriores.
   ------------------------------------------------------------ */
function elegirGenerador(lista, nivel) {
  const pool = [];
  lista.forEach(g => {
    const d = nivel - g.nivel;
    const peso = d === 0 ? 4 : d === 1 ? 2 : d === 2 ? 1 : 0;
    for (let i = 0; i < peso; i++) pool.push(g);
  });
  // si el nivel es muy bajo para algunos, usa los más cercanos
  return pool.length ? R.pick(pool) : lista.reduce((a, b) => Math.abs(b.nivel - nivel) < Math.abs(a.nivel - nivel) ? b : a);
}

const NOMBRES = ["Pelu", "Luna", "Mia", "Nina", "la Directora Estela", "el Profe Búho", "Don Tortu"];
const quien = () => R.pick(NOMBRES);

/* ============================================================
   MATEMÁTICAS
   ============================================================ */
const GEN_MATE = [
  // ---------- Nivel 1 ----------
  { nivel: 1, fn() {                                   // suma con llevada
    let a, b; do { a = R.ri(15, 68); b = R.ri(15, 79); } while ((a % 10) + (b % 10) < 10);
    const ans = a + b;
    return { escena: R.eq(`${a} <span>+</span> ${b}`), pregunta: "¿Cuánto suma?", ok: R.n(ans),
      malas: R.numMalas(ans, [ans - 10, ans + 10]),
      exp: `Unidades: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)} → escribes ${(a + b) % 10} y <b>llevas 1</b> a las decenas. Total: <b>${ans}</b>.` };
  } },
  { nivel: 1, fn() {                                   // resta pidiendo prestado
    let a, b; do { a = R.ri(41, 98); b = R.ri(12, a - 10); } while ((b % 10) <= (a % 10));
    const ans = a - b;
    const error = Math.abs((a % 10) - (b % 10)) + (Math.floor(a / 10) - Math.floor(b / 10)) * 10;
    return { escena: R.eq(`${a} <span>−</span> ${b}`), pregunta: "¿Cuánto queda?", ok: R.n(ans),
      malas: R.numMalas(ans, [error, ans + 10]),
      exp: `A ${a % 10} no le alcanza para restar ${b % 10}: pide una decena prestada (${10 + (a % 10)} − ${b % 10}). Resultado: <b>${ans}</b>.` };
  } },
  // ---------- Nivel 2 ----------
  { nivel: 2, fn() {
    const a = R.ri(125, 789), b = R.ri(108, 899), ans = a + b;
    return { escena: R.eq(`${a} <span>+</span> ${b}`), pregunta: "¿Cuánto suma?", ok: R.n(ans),
      malas: R.numMalas(ans, [ans - 10, ans - 100, ans + 100]), exp: `${a} + ${b} = <b>${ans}</b>. Revisa las llevadas en decenas y centenas.` };
  } },
  { nivel: 2, fn() {
    const a = R.ri(302, 985), b = R.ri(117, a - 40), ans = a - b;
    return { escena: R.eq(`${a} <span>−</span> ${b}`), pregunta: "¿Cuánto queda?", ok: R.n(ans),
      malas: R.numMalas(ans, [ans + 10, ans - 10, ans + 100]), exp: `${a} − ${b} = <b>${ans}</b>. Comprueba: ${ans} + ${b} = ${a}.` };
  } },
  { nivel: 2, fn() {
    const a = R.ri(4, 12), b = R.ri(6, 12), ans = a * b;
    return { escena: R.eq(`${a} <span>×</span> ${b}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [a * (b - 1), a * (b + 1), a + b]), exp: `${a} × ${b} = <b>${ans}</b>. Truco: ${a} × ${b - 1} = ${a * (b - 1)}, y le sumas ${a}.` };
  } },
  { nivel: 2, fn() {
    const b = R.ri(4, 12), q = R.ri(4, 12), a = b * q;
    return { escena: R.eq(`${a} <span>÷</span> ${b}`), pregunta: "¿Cuánto da?", ok: R.n(q),
      malas: R.numMalas(q, [q + 1, q - 1, a - b]), exp: `${a} ÷ ${b} = <b>${q}</b>, porque ${b} × ${q} = ${a}.` };
  } },
  // ---------- Nivel 3 ----------
  { nivel: 3, fn() {
    const a = R.ri(23, 98), b = R.ri(3, 9), ans = a * b, d = Math.floor(a / 10) * 10, u = a % 10;
    return { escena: R.eq(`${a} <span>×</span> ${b}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [d * b + u, ans - 10, ans + b]), exp: `Por partes: ${d} × ${b} = ${d * b} y ${u} × ${b} = ${u * b}. Suma: <b>${ans}</b>.` };
  } },
  { nivel: 3, fn() {
    const b = R.ri(3, 9), q = R.ri(14, 99), a = b * q;
    return { escena: R.eq(`${a} <span>÷</span> ${b}`), pregunta: "¿Cuánto da?", ok: R.n(q),
      malas: R.numMalas(q, [q + 1, q - 1, q + 10]), exp: `${a} ÷ ${b} = <b>${q}</b>. Comprueba: ${b} × ${q} = ${a}.` };
  } },
  { nivel: 3, fn() {
    const a = R.ri(3, 20), b = R.ri(2, 9), c = R.ri(2, 9), ans = a + b * c;
    return { escena: R.eq(`${a} <span>+</span> ${b} <span>×</span> ${c}`), pregunta: "¿Cuánto da?", ok: R.n(ans),
      malas: R.numMalas(ans, [(a + b) * c, a + b + c]), exp: `Primero la multiplicación: ${b} × ${c} = ${b * c}. Después la suma: ${a} + ${b * c} = <b>${ans}</b>.` };
  } },
  { nivel: 3, fn() {
    const t = R.ri(0, 2);
    if (t === 0) {
      const c = R.ri(3, 6), b = R.ri(3, 8), a = b * c + R.ri(5, 30), ans = a - b * c, q = quien();
      return { escena: `<p class="problema">${q} tiene <b>${a}</b> galletas 🍪 y le regala <b>${b}</b> a cada una de sus <b>${c}</b> amigas.</p>`,
        pregunta: "¿Cuántas galletas le quedan?", ok: R.n(ans), malas: R.numMalas(ans, [a - b, a - b - c, b * c]),
        exp: `Regala ${b} × ${c} = ${b * c} galletas. Quedan ${a} − ${b * c} = <b>${ans}</b>.` };
    }
    if (t === 1) {
      const p = R.ri(12, 35), d = R.ri(4, 9), ans = p * d, q = quien();
      return { escena: `<p class="problema">${q} lee <b>${p}</b> páginas 📖 cada día.</p>`, pregunta: `¿Cuántas páginas lee en ${d} días?`,
        ok: R.n(ans), malas: R.numMalas(ans, [p + d, ans - p, ans + p]), exp: `${p} × ${d} = <b>${ans}</b> páginas.` };
    }
    const k = R.ri(3, 8), c = R.ri(6, 15), n = k * c;
    return { escena: `<p class="problema">Hay <b>${n}</b> dulces 🍬 para repartir en partes iguales entre <b>${k}</b> gatitas.</p>`,
      pregunta: "¿Cuántos dulces recibe cada una?", ok: R.n(c), malas: R.numMalas(c, [n - k, c + 1, c - 1]),
      exp: `${n} ÷ ${k} = <b>${c}</b>, porque ${k} × ${c} = ${n}.` };
  } },
  // ---------- Nivel 4 ----------
  { nivel: 4, fn() {
    const a = R.ri(13, 49), b = R.ri(13, 39), ans = a * b, db = Math.floor(b / 10), ub = b % 10;
    return { escena: R.eq(`${a} <span>×</span> ${b}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [a * ub + a * db, ans - a, ans + 10]),
      exp: `${a} × ${b} = ${a} × ${db * 10} + ${a} × ${ub} = ${a * db * 10} + ${a * ub} = <b>${ans}</b>. ¡No olvides que el ${db} vale ${db * 10}!` };
  } },
  { nivel: 4, fn() {
    let a, b; do { a = R.ri(30, 99); b = R.ri(3, 9); } while (a % b === 0);
    const r = a % b, q = Math.floor(a / b);
    return { escena: R.eq(`${a} <span>÷</span> ${b}`), pregunta: "¿Cuál es el RESTO de esta división?", ok: R.n(r),
      malas: R.numMalas(r, [q, b - r, r + 1].filter(v => v !== r)), exp: `${b} × ${q} = ${b * q}, y ${a} − ${b * q} = <b>${r}</b>. El resto siempre es menor que ${b}.` };
  } },
  { nivel: 4, fn() {
    const d = R.pick([3, 4, 5, 6, 8]), nn = R.ri(2, d - 1), N = d * R.ri(3, 12), ans = N / d * nn;
    if (R.mcd(nn, d) !== 1) return this.fn();
    return { escena: R.eq(`${nn}/${d} <span>de</span> ${N}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [N / d, N - ans, N * nn]), exp: `Divide en ${d} partes: ${N} ÷ ${d} = ${N / d}. Toma ${nn}: ${N / d} × ${nn} = <b>${ans}</b>.` };
  } },
  { nivel: 4, fn() {
    const n = R.ri(3, 7), p = R.ri(3, 9) * 100, m = Math.ceil(n * p / 1000) * 1000 + R.pick([0, 1000]), ans = m - n * p, q = quien();
    return { escena: `<p class="problema">${q} compra <b>${n}</b> cuadernos 📒 de <b>${R.pesos(p)}</b> y paga con <b>${R.pesos(m)}</b>.</p>`,
      pregunta: "¿Cuánto vuelto recibe?", ok: R.pesos(ans), malas: [R.pesos(m - p), R.pesos(n * p), R.pesos(ans + 100)].filter(x => x !== R.pesos(ans)),
      exp: `Gasta ${n} × ${R.pesos(p)} = ${R.pesos(n * p)}. Vuelto: ${R.pesos(m)} − ${R.pesos(n * p)} = <b>${R.pesos(ans)}</b>.` };
  } },
  { nivel: 4, fn() {
    const w = R.ri(4, 19), h = R.ri(3, 15), ans = 2 * (w + h);
    return { escena: `<div class="figura-rect" style="--w:${w};--h:${h}"><span>${w} cm</span><span>${h} cm</span></div>`,
      pregunta: "¿Cuál es el PERÍMETRO del rectángulo?", ok: `${ans} cm`, malas: [`${w * h} cm`, `${w + h} cm`, `${ans + 2} cm`],
      exp: `Perímetro = suma de los 4 lados: ${w} + ${h} + ${w} + ${h} = <b>${ans} cm</b>.` };
  } },
  // ---------- Nivel 5 ----------
  { nivel: 5, fn() {
    const t = R.ri(0, 2), x = R.ri(6, 45);
    if (t === 0) { const a = R.ri(8, 60), b = x + a;
      return { escena: R.eq(`x <span>+</span> ${a} = ${b}`), pregunta: "¿Cuánto vale x?", ok: R.n(x), malas: R.numMalas(x, [b + a, x + 1, b]),
        exp: `Resta ${a} a los dos lados: x = ${b} − ${a} = <b>${x}</b>.` }; }
    if (t === 1) { const a = R.ri(3, 12), b = a * x;
      return { escena: R.eq(`${a}x = ${b}`), pregunta: "¿Cuánto vale x?", ok: R.n(x), malas: R.numMalas(x, [b - a, b * a, x + 1]),
        exp: `Divide por ${a}: x = ${b} ÷ ${a} = <b>${x}</b>.` }; }
    const a = R.ri(5, 30), b = x - a > 0 ? x - a : x + a; const real = b + a;
    return { escena: R.eq(`x <span>−</span> ${a} = ${b}`), pregunta: "¿Cuánto vale x?", ok: R.n(real), malas: R.numMalas(real, [b - a, real + 1, Math.abs(b - a) + 10]),
      exp: `Suma ${a} a los dos lados: x = ${b} + ${a} = <b>${real}</b>.` };
  } },
  { nivel: 5, fn() {
    let p, q; do { q = R.ri(3, 12); p = R.ri(1, q - 1); } while (R.mcd(p, q) !== 1);
    const k = R.ri(2, 9), ok = `${p}/${q}`;
    const malas = [`${p}/${q + 1}`, `${p + 1}/${q}`, `${p * k}/${q}`, `${q}/${p}`].filter(s => s !== ok);
    return { escena: R.eq(`${p * k}/${q * k}`), pregunta: "Simplifica la fracción al máximo", ok, malas: R.mezclar(malas).slice(0, 3),
      exp: `Arriba y abajo se pueden dividir por ${k}: ${p * k} ÷ ${k} = ${p}, ${q * k} ÷ ${k} = ${q} → <b>${ok}</b>.` };
  } },
  { nivel: 5, fn() {
    const d = R.ri(5, 12), a = R.ri(1, d - 2), b = R.ri(1, d - a - 1), ok = R.frac(a + b, d);
    const malas = [R.fracSin(a + b, d + d), R.frac(a * b, d), R.frac(a + b + 1, d), R.fracSin(a + b, d)].filter(s => s !== ok);
    return { escena: R.eq(`${a}/${d} <span>+</span> ${b}/${d}`), pregunta: "¿Cuánto suma?", ok, malas: [...new Set(malas)].slice(0, 3),
      exp: `Con el mismo denominador, se suman solo los de arriba: ${a} + ${b} = ${a + b} → ${a + b}/${d}${ok !== `${a + b}/${d}` ? ` = <b>${ok}</b> simplificado` : ""}. ¡El ${d} no se suma!` };
  } },
  { nivel: 5, fn() {
    const a = R.ri(12, 95) / 10, b = R.ri(105, 480) / 100, ans = R.red(a + b);
    return { escena: R.eq(`${R.n(a)} <span>+</span> ${R.n(b)}`), pregunta: "¿Cuánto suma?", ok: R.n(ans),
      malas: R.numMalas(ans, [R.red(a * 10 + b) / 10, ans + 1, ans - 0.1, R.red(a + b * 10) / 10]),
      exp: `Alinea las comas: ${R.n(a)}0 + ${R.n(b)} = <b>${R.n(ans)}</b>.` };
  } },
  { nivel: 5, fn() {
    const p = R.pick([10, 20, 25, 50, 75, 5]), base = 100 / R.mcd(p, 100), N = base * R.ri(2, 12), ans = N * p / 100;
    return { escena: R.eq(`${p}% <span>de</span> ${N}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [N - ans, N / p, ans * 10, N * p / 10]),
      exp: `${p}% es ${p}/100. ${N} × ${p} ÷ 100 = <b>${R.n(ans)}</b>.` };
  } },
  { nivel: 5, fn() {
    const a = R.ri(2, 12), b = R.ri(2, 9), c = R.ri(2, 9), d = R.ri(1, 20), ans = (a + b) * c - d;
    return { escena: R.eq(`(${a} <span>+</span> ${b}) <span>×</span> ${c} <span>−</span> ${d}`), pregunta: "¿Cuánto da?", ok: R.n(ans),
      malas: R.numMalas(ans, [a + b * c - d, (a + b) * (c - d), (a + b) * c + d], true),
      exp: `Primero el paréntesis: ${a} + ${b} = ${a + b}. Luego ${a + b} × ${c} = ${(a + b) * c}. Al final − ${d} = <b>${ans}</b>.` };
  } },
  { nivel: 5, fn() {
    const w = R.ri(6, 25), h = R.ri(4, 18), ans = w * h;
    return { escena: `<div class="figura-rect" style="--w:${w};--h:${h}"><span>${w} m</span><span>${h} m</span></div>`,
      pregunta: "¿Cuál es el ÁREA del jardín rectangular?", ok: `${ans} m²`, malas: [`${2 * (w + h)} m²`, `${w + h} m²`, `${ans + w} m²`],
      exp: `Área = largo × ancho = ${w} × ${h} = <b>${ans} m²</b>.` };
  } },
  // ---------- Nivel 6 ----------
  { nivel: 6, fn() {
    const x = R.ri(3, 19), a = R.ri(2, 9), b = R.ri(1, 40), c = a * x + b;
    return { escena: R.eq(`${a}x <span>+</span> ${b} = ${c}`), pregunta: "¿Cuánto vale x?", ok: R.n(x),
      malas: R.numMalas(x, [c - b, (c + b) / a, x + 1, (c / a) - b]),
      exp: `Resta ${b}: ${a}x = ${c - b}. Divide por ${a}: x = <b>${x}</b>.` };
  } },
  { nivel: 6, fn() {
    let b, d; do { b = R.ri(2, 8); d = R.ri(2, 9); } while (b === d);
    const a = R.ri(1, b - 1), c = R.ri(1, d - 1), num = a * d + c * b, den = b * d, ok = R.frac(num, den);
    const malas = [R.frac(a + c, b + d), R.fracSin(a + c, b * d), R.frac(num + 1, den), R.frac(a * c, b * d)].filter(s => s !== ok);
    return { escena: R.eq(`${a}/${b} <span>+</span> ${c}/${d}`), pregunta: "¿Cuánto suma?", ok, malas: [...new Set(malas)].slice(0, 3),
      exp: `Busca el mismo denominador: ${a}/${b} = ${a * d}/${den} y ${c}/${d} = ${c * b}/${den}. Suma: ${num}/${den} = <b>${ok}</b>.` };
  } },
  { nivel: 6, fn() {
    const a = R.ri(12, 99) / 10, b = R.ri(3, 9), ans = R.red(a * b);
    return { escena: R.eq(`${R.n(a)} <span>×</span> ${b}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [ans * 10, ans / 10, ans + b]), exp: `Multiplica sin la coma: ${Math.round(a * 10)} × ${b} = ${Math.round(a * 10) * b}. Tenía 1 decimal → <b>${R.n(ans)}</b>.` };
  } },
  { nivel: 6, fn() {
    const p = R.pick([15, 30, 35, 40, 45, 60, 12, 8]), base = 100 / R.mcd(p, 100), N = base * R.ri(1, 9) * (base < 10 ? 10 : 1), ans = N * p / 100;
    return { escena: R.eq(`${p}% <span>de</span> ${R.n(N)}`), pregunta: "¿Cuánto es?", ok: R.n(ans),
      malas: R.numMalas(ans, [N - ans, ans * 10, N * p / 10, ans + N / 10]),
      exp: `${p}% de ${R.n(N)} = ${R.n(N)} × ${p} ÷ 100 = <b>${R.n(ans)}</b>. Truco: 10% = ${R.n(N / 10)}.` };
  } },
  { nivel: 6, fn() {
    const t = R.ri(0, 2);
    if (t === 0) { const a = R.ri(11, 20), ans = a * a;
      return { escena: R.eq(`${a}²`), pregunta: "¿Cuánto es?", ok: R.n(ans), malas: R.numMalas(ans, [a * 2, ans - a, ans + 10]),
        exp: `${a}² = ${a} × ${a} = <b>${ans}</b> (no ${a} × 2).` }; }
    if (t === 1) { const a = R.ri(2, 6), ans = a ** 3;
      return { escena: R.eq(`${a}³`), pregunta: "¿Cuánto es?", ok: R.n(ans), malas: R.numMalas(ans, [a * 3, a * a, ans + a]),
        exp: `${a}³ = ${a} × ${a} × ${a} = <b>${ans}</b>.` }; }
    const n = R.ri(5, 10), ans = 2 ** n;
    return { escena: R.eq(`2<sup>${n}</sup>`), pregunta: "¿Cuánto es?", ok: R.n(ans), malas: R.numMalas(ans, [2 * n, ans / 2, ans * 2]),
      exp: `Duplica ${n} veces: 2, 4, 8, 16… → 2<sup>${n}</sup> = <b>${ans}</b>.` };
  } },
  { nivel: 6, fn() {
    const g = R.ri(2, 12), a = g * R.ri(2, 7), b = g * R.ri(2, 7);
    if (a === b) return this.fn();
    if (R.ri(0, 1)) { const ans = R.mcd(a, b);
      return { escena: R.eq(`MCD(${a}, ${b})`), pregunta: "¿Cuál es el máximo común divisor?", ok: R.n(ans),
        malas: R.numMalas(ans, [Math.min(a, b), R.mcm(a, b), ans / 2 >= 1 && Number.isInteger(ans / 2) ? ans / 2 : ans + 2]),
        exp: `El número más grande que divide a ${a} y a ${b} es <b>${ans}</b>: ${a} = ${ans} × ${a / ans}, ${b} = ${ans} × ${b / ans}.` }; }
    const ans = R.mcm(a, b);
    return { escena: R.eq(`mcm(${a}, ${b})`), pregunta: "¿Cuál es el mínimo común múltiplo?", ok: R.n(ans),
      malas: R.numMalas(ans, [a * b, R.mcd(a, b), Math.max(a, b)]),
      exp: `El menor número que está en la tabla del ${a} y del ${b} es <b>${ans}</b>.` };
  } },
  { nivel: 6, fn() {
    const prom = R.ri(5, 60), ns = [R.ri(1, prom * 2), R.ri(1, prom * 2), R.ri(1, prom * 2)];
    const ultimo = prom * 4 - ns.reduce((a, b) => a + b, 0);
    if (ultimo < 1) return this.fn();
    ns.push(ultimo); const suma = prom * 4;
    return { escena: R.eq(R.mezclar(ns).join(", ")), pregunta: "¿Cuál es el PROMEDIO de estos 4 números?", ok: R.n(prom),
      malas: R.numMalas(prom, [suma, suma / 2, prom + 1]), exp: `Suma todo: ${suma}. Divide por 4: <b>${prom}</b>.` };
  } },
  { nivel: 6, fn() {
    const b = R.ri(3, 16) * 2, h = R.ri(3, 14), ans = b * h / 2;
    return { escena: `<div class="figura-tri"><span>base ${b} cm</span><span>altura ${h} cm</span></div>`,
      pregunta: "¿Cuál es el área del triángulo?", ok: `${ans} cm²`, malas: [`${b * h} cm²`, `${b + h} cm²`, `${ans + h} cm²`],
      exp: `Área del triángulo = base × altura ÷ 2 = ${b} × ${h} ÷ 2 = <b>${ans} cm²</b>.` };
  } },
  // ---------- Nivel 7 ----------
  { nivel: 7, fn() {
    const t = R.ri(0, 2);
    if (t === 0) { const a = -R.ri(5, 30), b = R.ri(3, 40), ans = a + b;
      return { escena: R.eq(`${R.n(a)} <span>+</span> ${b}`), pregunta: "¿Cuánto da?", ok: R.n(ans), malas: R.numMalas(ans, [-ans, -(Math.abs(a) + b), Math.abs(a) + b], true),
        exp: `Estás en ${R.n(a)} y avanzas ${b}: llegas a <b>${R.n(ans)}</b>. Piensa en un termómetro 🌡️.` }; }
    if (t === 1) { const a = -R.ri(2, 12), b = -R.ri(2, 12), ans = a * b;
      return { escena: R.eq(`(${R.n(a)}) <span>×</span> (${R.n(b)})`), pregunta: "¿Cuánto da?", ok: R.n(ans), malas: R.numMalas(ans, [-ans, a + b, -(a + b)], true),
        exp: `Menos por menos da MÁS: ${Math.abs(a)} × ${Math.abs(b)} = <b>${ans}</b>.` }; }
    const a = R.ri(3, 20), b = R.ri(a + 3, a + 30), ans = a - b;
    return { escena: R.eq(`${a} <span>−</span> ${b}`), pregunta: "¿Cuánto da?", ok: R.n(ans), malas: R.numMalas(ans, [-ans, ans - 10, ans + 1], true),
      exp: `${b} es más grande que ${a}, así que el resultado es negativo: ${a} − ${b} = <b>${R.n(ans)}</b>.` };
  } },
  { nivel: 7, fn() {
    const a = R.ri(2, 6), b = R.ri(2, 9), c = R.ri(2, 5), d = R.ri(2, 6), e = R.ri(1, 30), ans = a * (b + c * d) - e;
    return { escena: R.eq(`${a} <span>×</span> (${b} <span>+</span> ${c} <span>×</span> ${d}) <span>−</span> ${e}`), pregunta: "¿Cuánto da?", ok: R.n(ans),
      malas: R.numMalas(ans, [a * (b + c) * d - e, a * b + c * d - e, a * (b + c * d) + e], true),
      exp: `Dentro del paréntesis, primero × : ${c} × ${d} = ${c * d}; + ${b} = ${b + c * d}. Luego × ${a} = ${a * (b + c * d)}; − ${e} = <b>${ans}</b>.` };
  } },
  { nivel: 7, fn() {
    const n = R.ri(11, 25), N = n * n;
    return { escena: R.eq(`√${N}`), pregunta: "¿Cuál es la raíz cuadrada?", ok: R.n(n), malas: R.numMalas(n, [N / 2, n + 1, n - 1]),
      exp: `Porque ${n} × ${n} = ${N}, √${N} = <b>${n}</b>.` };
  } },
  { nivel: 7, fn() {
    const u = R.ri(3, 15) * 50, k = R.ri(2, 6), m = R.ri(k + 1, k + 9), obj = R.pick(["lápices ✏️", "chocolates 🍫", "stickers ⭐", "globos 🎈"]);
    return { escena: `<p class="problema">Si <b>${k}</b> ${obj} cuestan <b>${R.pesos(u * k)}</b>…</p>`, pregunta: `¿Cuánto cuestan ${m}?`,
      ok: R.pesos(u * m), malas: [R.pesos(u * k * m), R.pesos(u * k + m * 100), R.pesos(u * (m + 1))],
      exp: `Uno cuesta ${R.pesos(u * k)} ÷ ${k} = ${R.pesos(u)}. Entonces ${m} cuestan ${m} × ${R.pesos(u)} = <b>${R.pesos(u * m)}</b>.` };
  } },
  { nivel: 7, fn() {
    const c = R.pick([
      () => { const v = R.ri(12, 95) / 10; return [`${R.n(v)} km`, "metros", v * 1000, "m", "1 km = 1.000 m", [v * 100, v * 10]]; },
      () => { const v = R.ri(12, 95) / 10; return [`${R.n(v)} m`, "centímetros", v * 100, "cm", "1 m = 100 cm", [v * 10, v * 1000]]; },
      () => { const v = R.ri(12, 95) / 10; return [`${R.n(v)} kg`, "gramos", v * 1000, "g", "1 kg = 1.000 g", [v * 100, v * 10]]; },
      () => { const v = R.ri(3, 19) / 2; return [`${R.n(v)} horas`, "minutos", v * 60, "min", "1 hora = 60 min", [v * 100, v * 10 * 6 / 10]]; },
      () => { const v = R.ri(1500, 9500); return [`${R.n(v)} mL`, "litros", v / 1000, "L", "1 L = 1.000 mL", [v / 100, v / 10]]; },
    ])();
    const [txt, a, ans, un, regla, err] = c;
    return { escena: R.eq(txt), pregunta: `¿Cuántos ${a} son?`, ok: `${R.n(ans)} ${un}`,
      malas: [...new Set(err.concat([ans + 1]).map(v => `${R.n(v)} ${un}`))].filter(s => s !== `${R.n(ans)} ${un}`).slice(0, 3),
      exp: `${regla}. Entonces ${txt} = <b>${R.n(ans)} ${un}</b>.` };
  } },
  { nivel: 7, fn() {
    const P = R.ri(8, 60) * 500, p = R.pick([10, 20, 25, 30, 40, 50, 15]), des = P * p / 100, ans = P - des;
    return { escena: `<p class="problema">Una mochila 🎒 cuesta <b>${R.pesos(P)}</b> y tiene <b>${p}% de descuento</b>.</p>`,
      pregunta: "¿Cuánto hay que pagar?", ok: R.pesos(ans), malas: [R.pesos(des), R.pesos(P - p * 100), R.pesos(P + des)],
      exp: `El descuento es ${p}% de ${R.pesos(P)} = ${R.pesos(des)}. Pagas ${R.pesos(P)} − ${R.pesos(des)} = <b>${R.pesos(ans)}</b>.` };
  } },
  { nivel: 7, fn() {
    const a = R.ri(1, 7), b = R.ri(a + 1, 9), c = R.ri(1, 7), d = R.ri(c + 1, 9), ok = R.frac(a * c, b * d);
    const malas = [R.frac(a * c, b + d), R.frac(a + c, b + d), R.frac(a * d, b * c), R.fracSin(a * c, b * d)].filter(s => s !== ok);
    return { escena: R.eq(`${a}/${b} <span>×</span> ${c}/${d}`), pregunta: "¿Cuánto es?", ok, malas: [...new Set(malas)].slice(0, 3),
      exp: `Se multiplica arriba con arriba y abajo con abajo: ${a * c}/${b * d} = <b>${ok}</b>.` };
  } },
  // ---------- Nivel 8 ----------
  { nivel: 8, fn() {
    const x = R.ri(2, 15), c = R.ri(1, 6), a = c + R.ri(1, 6), b = R.ri(1, 25), d = (a - c) * x + b;
    return { escena: R.eq(`${a}x <span>+</span> ${b} = ${c}x <span>+</span> ${d}`), pregunta: "¿Cuánto vale x?", ok: R.n(x),
      malas: R.numMalas(x, [(d - b) / (a + c), d - b, x + 1].map(v => Number.isInteger(v) ? v : Math.round(v))),
      exp: `Pasa las x a un lado: ${a}x − ${c}x = ${a - c}x. Los números al otro: ${d} − ${b} = ${d - b}. Entonces ${a - c}x = ${d - b} → x = <b>${x}</b>.` };
  } },
  { nivel: 8, fn() {
    const base = R.pick([2, 3, 5, 7]), m = R.ri(2, 7), n = R.ri(2, 6), t = R.ri(0, 2);
    if (t === 0) return { escena: R.eq(`${base}<sup>${m}</sup> <span>×</span> ${base}<sup>${n}</sup> = ${base}<sup>?</sup>`), pregunta: "¿Qué exponente va en el ?", ok: R.n(m + n),
      malas: R.numMalas(m + n, [m * n, m + n + 1, Math.abs(m - n)]), exp: `Misma base multiplicando: se SUMAN los exponentes. ${m} + ${n} = <b>${m + n}</b>.` };
    if (t === 1) return { escena: R.eq(`(${base}<sup>${m}</sup>)<sup>${n}</sup> = ${base}<sup>?</sup>`), pregunta: "¿Qué exponente va en el ?", ok: R.n(m * n),
      malas: R.numMalas(m * n, [m + n, m * n + 1, m * n - 1]), exp: `Potencia de una potencia: se MULTIPLICAN los exponentes. ${m} × ${n} = <b>${m * n}</b>.` };
    const mm = m + n;
    return { escena: R.eq(`${base}<sup>${mm}</sup> <span>÷</span> ${base}<sup>${n}</sup> = ${base}<sup>?</sup>`), pregunta: "¿Qué exponente va en el ?", ok: R.n(m),
      malas: R.numMalas(m, [mm + n, mm / n, m + 1].map(v => Math.round(v))), exp: `Misma base dividiendo: se RESTAN los exponentes. ${mm} − ${n} = <b>${m}</b>.` };
  } },
  { nivel: 8, fn() {
    const primos = [41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    const trampa = [51, 57, 87, 91, 93, 119, 111, 117, 133, 69, 77, 81, 99, 39, 49];
    const ok = R.pick(primos), malas = R.mezclar(trampa).slice(0, 3);
    return { escena: `<p class="problema">Un número primo solo se divide por 1 y por sí mismo.</p>`, pregunta: "¿Cuál de estos es PRIMO?", ok: String(ok), malas: malas.map(String),
      exp: `<b>${ok}</b> es primo. Los otros no: ${malas.map(m => `${m} = ${R.factores(m).join(" × ")}`).join(" · ")}.` };
  } },
  { nivel: 8, fn() {
    const N = R.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 60, 64, 72, 80, 90, 96, 100]);
    const divs = []; for (let i = 1; i <= N; i++) if (N % i === 0) divs.push(i);
    const ans = divs.length;
    return { escena: R.eq(`${N}`), pregunta: `¿Cuántos divisores tiene ${N}?`, ok: R.n(ans), malas: R.numMalas(ans, [ans - 1, ans + 1, ans - 2]),
      exp: `Los divisores de ${N} son: ${divs.join(", ")} → <b>${ans}</b>.` };
  } },
  { nivel: 8, fn() {
    const a = R.ri(1, 8), b = R.ri(2, 9), c = R.ri(1, 8), d = R.ri(2, 9), ok = R.frac(a * d, b * c);
    if (c === d || a === b) return this.fn();   // evita "8/8" (vale 1): otra vez
    const malas = [R.frac(a * c, b * d), R.frac(b * c, a * d), R.frac(a + d, b + c)].filter(s => s !== ok);
    return { escena: R.eq(`${a}/${b} <span>÷</span> ${c}/${d}`), pregunta: "¿Cuánto es?", ok, malas: [...new Set(malas)].slice(0, 3),
      exp: `Dividir es multiplicar por la fracción dada vuelta: ${a}/${b} × ${d}/${c} = ${a * d}/${b * c} = <b>${ok}</b>.` };
  } },
  { nivel: 8, fn() {
    const P = R.ri(4, 40) * 1000, p = R.pick([10, 15, 20, 25, 30, 12]), ans = P * (100 + p) / 100;
    return { escena: `<p class="problema">Una entrada al cine 🎬 costaba <b>${R.pesos(P)}</b> y subió <b>${p}%</b>.</p>`, pregunta: "¿Cuánto cuesta ahora?",
      ok: R.pesos(ans), malas: [R.pesos(P * p / 100), R.pesos(P + p * 100), R.pesos(P * (100 - p) / 100)],
      exp: `Sube ${p}% de ${R.pesos(P)} = ${R.pesos(P * p / 100)}. Nuevo precio: <b>${R.pesos(ans)}</b>.` };
  } },
  { nivel: 8, fn() {
    if (R.ri(0, 1)) { const a = R.ri(30, 100), b = R.ri(20, 150 - a), ans = 180 - a - b;
      return { escena: `<div class="figura-tri"><span>${a}°</span><span>${b}°</span><span>?</span></div>`, pregunta: "¿Cuánto mide el ángulo que falta?", ok: `${ans}°`,
        malas: [`${360 - a - b}°`, `${ans + 10}°`, `${a + b}°`], exp: `Los ángulos de un triángulo suman 180°: 180 − ${a} − ${b} = <b>${ans}°</b>.` }; }
    const a = R.ri(60, 120), b = R.ri(60, 120), c = R.ri(40, 110), ans = 360 - a - b - c;
    if (ans <= 20) return this.fn();
    return { escena: R.eq(`${a}°, ${b}°, ${c}°, ?`), pregunta: "Son los 4 ángulos de un cuadrilátero. ¿Cuánto mide el que falta?", ok: `${ans}°`,
      malas: [`${180 - (a + b + c) % 180}°`, `${ans + 10}°`, `${ans - 10}°`].filter(s => s !== `${ans}°`), exp: `Los 4 ángulos de un cuadrilátero suman 360°: 360 − ${a} − ${b} − ${c} = <b>${ans}°</b>.` };
  } },
  // ---------- Nivel 9 ----------
  { nivel: 9, fn() {
    const x = R.ri(5, 40), y = R.ri(2, x - 1), S = x + y, D = x - y, q = R.ri(0, 1);
    return { escena: R.eq(`x <span>+</span> y = ${S}<br>x <span>−</span> y = ${D}`), pregunta: `¿Cuánto vale ${q ? "y" : "x"}?`, ok: R.n(q ? y : x),
      malas: R.numMalas(q ? y : x, [q ? x : y, S, (S + D)]),
      exp: `Suma las dos ecuaciones: 2x = ${S + D} → x = ${x}. Entonces y = ${S} − ${x} = ${y}. Respuesta: <b>${q ? y : x}</b>.` };
  } },
  { nivel: 9, fn() {
    const a = R.ri(2, 9), b = R.ri(1, 15), x = a * R.ri(2, 12), c = x / a + b;
    return { escena: R.eq(`x/${a} <span>+</span> ${b} = ${c}`), pregunta: "¿Cuánto vale x?", ok: R.n(x),
      malas: R.numMalas(x, [c - b, (c - b) / a, c * a - b]), exp: `Resta ${b}: x/${a} = ${c - b}. Multiplica por ${a}: x = <b>${x}</b>.` };
  } },
  { nivel: 9, fn() {
    const r = R.ri(1, 9), az = R.ri(1, 9), v = R.ri(1, 9), tot = r + az + v, col = R.pick([["roja", r], ["azul", az], ["verde", v]]), ok = R.frac(col[1], tot);
    const malas = [R.frac(col[1], tot - col[1]), R.fracSin(col[1], 3), R.frac(tot - col[1], tot), R.frac(1, tot)].filter(s => s !== ok);
    return { escena: `<p class="problema">En una bolsa hay <b>${r}</b> bolitas rojas 🔴, <b>${az}</b> azules 🔵 y <b>${v}</b> verdes 🟢.</p>`,
      pregunta: `Si sacas una sin mirar, ¿qué probabilidad hay de que sea ${col[0]}?`, ok, malas: [...new Set(malas)].slice(0, 3),
      exp: `Casos favorables ÷ casos totales = ${col[1]}/${tot}${ok !== `${col[1]}/${tot}` ? ` = <b>${ok}</b>` : ` → <b>${ok}</b>`}.` };
  } },
  { nivel: 9, fn() {
    const a = R.ri(2, 9), b = R.ri(-5, 12), n = R.pick([10, 15, 20, 25, 50, 100]), t = k => a * k + b, ans = t(n);
    return { escena: `<div class="secuencia">${[1, 2, 3, 4].map(k => `<span>${R.n(t(k))}</span>`).join("")}<span>…</span></div>`,
      pregunta: `¿Cuál es el término número ${n}?`, ok: R.n(ans), malas: R.numMalas(ans, [a * n, t(1) * n, ans + a], true),
      exp: `Sube de ${a} en ${a}: el término k es ${a}·k ${b >= 0 ? "+" : "−"} ${Math.abs(b)}. Para k = ${n}: ${a} × ${n} ${b >= 0 ? "+" : "−"} ${Math.abs(b)} = <b>${R.n(ans)}</b>.` };
  } },
  { nivel: 9, fn() {
    const v = R.ri(4, 12) * 10, t = R.ri(2, 6), d = v * t;
    if (R.ri(0, 1)) return { escena: `<p class="problema">Un tren 🚆 recorre <b>${d} km</b> en <b>${t} horas</b>.</p>`, pregunta: "¿A qué velocidad va (km/h)?",
      ok: `${v} km/h`, malas: [`${d * t} km/h`, `${v + 10} km/h`, `${d - t} km/h`], exp: `Velocidad = distancia ÷ tiempo = ${d} ÷ ${t} = <b>${v} km/h</b>.` };
    return { escena: `<p class="problema">Un auto 🚗 va a <b>${v} km/h</b> durante <b>${t} horas</b>.</p>`, pregunta: "¿Cuántos km recorre?",
      ok: `${d} km`, malas: [`${v + t} km`, `${d + v} km`, `${v / 2 * t} km`], exp: `Distancia = velocidad × tiempo = ${v} × ${t} = <b>${d} km</b>.` };
  } },
  { nivel: 9, fn() {
    const p = R.pick([20, 25, 30, 40, 60, 75, 15, 12]), N = (100 / R.mcd(p, 100)) * R.ri(2, 12), parte = N * p / 100;
    return { escena: R.eq(`El ${p}% de un número es ${R.n(parte)}`), pregunta: "¿Cuál es el número?", ok: R.n(N),
      malas: R.numMalas(N, [parte * p / 100, parte + p, N / 2]), exp: `Si ${p}% es ${R.n(parte)}, entonces 1% es ${R.n(parte / p)} y 100% es <b>${R.n(N)}</b>.` };
  } },
  // ---------- Nivel 10 ----------
  { nivel: 10, fn() {
    const n = R.pick([20, 30, 40, 50, 60, 80, 100]), ans = n * (n + 1) / 2;
    return { escena: R.eq(`1 + 2 + 3 + … + ${n}`), pregunta: "¿Cuánto suma todo?", ok: R.n(ans), malas: R.numMalas(ans, [n * n, n * (n - 1) / 2, ans + n]),
      exp: `El truco de Gauss: junta el primero con el último (1 + ${n} = ${n + 1}). Hay ${n / 2} parejas: ${n / 2} × ${n + 1} = <b>${ans}</b>.` };
  } },
  { nivel: 10, fn() {
    if (R.ri(0, 1)) { const k = R.ri(4, 6), f = [1, 1, 2, 6, 24, 120, 720][k];
      return { escena: `<p class="problema">${quien()} quiere ordenar <b>${k}</b> libros 📚 distintos en una repisa.</p>`, pregunta: "¿De cuántas formas distintas puede ordenarlos?",
        ok: R.n(f), malas: R.numMalas(f, [k * k, k * (k - 1), f / 2]), exp: `${k} opciones para el primero, ${k - 1} para el segundo…: ${Array.from({ length: k }, (_, i) => k - i).join(" × ")} = <b>${f}</b>.` }; }
    const a = R.ri(3, 7), b = R.ri(2, 6), c = R.ri(2, 4), ans = a * b * c;
    return { escena: `<p class="problema">Pelu tiene <b>${a}</b> sombreros 🎩, <b>${b}</b> capas y <b>${c}</b> varitas 🪄.</p>`, pregunta: "¿Cuántos disfraces distintos puede armar (1 de cada cosa)?",
      ok: R.n(ans), malas: R.numMalas(ans, [a + b + c, a * b, a * b + c]), exp: `Se multiplican las opciones: ${a} × ${b} × ${c} = <b>${ans}</b>.` };
  } },
  { nivel: 10, fn() {
    const x = R.ri(4, 15), a = R.ri(1, 40), b = x * x + a;
    return { escena: R.eq(`x² <span>+</span> ${a} = ${b}`), pregunta: "Si x es positivo, ¿cuánto vale x?", ok: R.n(x),
      malas: R.numMalas(x, [(b - a) / 2, b - a, x + 1]), exp: `x² = ${b} − ${a} = ${x * x}. ¿Qué número por sí mismo da ${x * x}? x = <b>${x}</b>.` };
  } },
  { nivel: 10, fn() {
    const p = R.ri(3, 10), k = R.ri(2, 8), m = R.pick([2, 3]), suma = p + m * p + 2 * k;
    return { escena: `<p class="problema">Pelu tiene ${m === 2 ? "el doble" : "el triple"} de la edad de su prima. Dentro de <b>${k}</b> años, sus edades sumarán <b>${suma}</b>.</p>`,
      pregunta: "¿Cuántos años tiene Pelu hoy?", ok: R.n(m * p), malas: R.numMalas(m * p, [p, m * p + k, (suma - k) / 2].map(Math.round)),
      exp: `Si la prima tiene p años, Pelu tiene ${m}p. En ${k} años: p + ${k} + ${m}p + ${k} = ${suma} → ${m + 1}p = ${suma - 2 * k} → p = ${p}. Pelu: <b>${m * p}</b>.` };
  } },
  { nivel: 10, fn() {
    const P = R.ri(4, 30) * 1000, a = R.pick([20, 30, 40, 50]), b = R.pick([10, 20, 25]), ans = P * (100 - a) / 100 * (100 - b) / 100;
    return { escena: `<p class="problema">Un juego 🎲 cuesta <b>${R.pesos(P)}</b>. Tiene <b>${a}%</b> de descuento, y en caja te hacen <b>${b}% más</b> sobre el precio ya rebajado.</p>`,
      pregunta: "¿Cuánto pagas?", ok: R.pesos(ans), malas: [R.pesos(P * (100 - a - b) / 100), R.pesos(P * (100 - a) / 100), R.pesos(ans - 500)],
      exp: `Primero −${a}%: ${R.pesos(P * (100 - a) / 100)}. Luego −${b}% de eso: <b>${R.pesos(ans)}</b>. (¡No es lo mismo que −${a + b}%!)` };
  } },
  { nivel: 10, fn() {
    const prom = R.ri(5, 6) + R.pick([0, 0.5]), notas = [R.ri(40, 70) / 10, R.ri(40, 70) / 10, R.ri(40, 70) / 10, R.ri(40, 70) / 10].map(R.red);
    const quinta = R.red(prom * 5 - notas.reduce((a, b) => a + b, 0));
    if (quinta < 1 || quinta > 7) return this.fn();
    return { escena: `<p class="problema">Las primeras 4 notas de Luna son <b>${notas.map(R.n).join(" · ")}</b>. Quiere terminar con promedio <b>${R.n(prom)}</b> en 5 notas.</p>`,
      pregunta: "¿Qué nota necesita en la quinta?", ok: R.n(quinta), malas: R.numMalas(quinta, [prom, quinta + 0.5, quinta - 0.5]),
      exp: `Las 5 notas deben sumar ${R.n(prom)} × 5 = ${R.n(prom * 5)}. Ya tiene ${R.n(notas.reduce((a, b) => a + b, 0))}. Le falta <b>${R.n(quinta)}</b>.` };
  } },
];

/* ============================================================
   DINERO (pesos chilenos 🇨🇱)
   ============================================================ */
const PRODUCTOS = [["🍎", "manzana", 300], ["🧃", "jugo", 700], ["🍫", "chocolate", 950], ["📒", "cuaderno", 1490], ["✏️", "lápiz", 390],
  ["🧁", "cupcake", 1200], ["🍦", "helado", 1350], ["🎈", "globo", 250], ["🧸", "peluche", 6990], ["📚", "libro", 8500], ["🍕", "pizza", 4990], ["🥐", "medialuna", 650]];
const GEN_DINERO = [
  { nivel: 1, fn() {
    const monedas = []; let tot = 0; const n = R.ri(3, 6);
    for (let i = 0; i < n; i++) { const m = R.pick([10, 50, 100, 100, 500]); monedas.push(m); tot += m; }
    return { escena: `<div class="monedas-fila">${monedas.sort((a, b) => b - a).map(m => `<span class="moneda m${m}">${m}</span>`).join("")}</div>`,
      pregunta: "¿Cuánta plata hay?", ok: R.pesos(tot), malas: [R.pesos(tot + 50), R.pesos(tot - 10), R.pesos(tot + 100)],
      exp: `Suma de mayor a menor: ${monedas.join(" + ")} = <b>${R.pesos(tot)}</b>.` };
  } },
  { nivel: 2, fn() {
    const [e, nom, p] = R.pick(PRODUCTOS.filter(x => x[2] < 1500)), pago = p < 1000 ? 1000 : 2000, v = pago - p;
    return { escena: `<div class="producto-mercado"><div class="grande-emoji">${e}</div><div class="precio-cartel">${R.pesos(p)}</div></div>`,
      pregunta: `Pelu paga el ${nom} con ${R.pesos(pago)}. ¿Cuánto vuelto recibe?`, ok: R.pesos(v), malas: [R.pesos(v + 100), R.pesos(v - 10), R.pesos(pago + p)].filter(x => x !== R.pesos(v)),
      exp: `Cuenta desde ${R.pesos(p)} hasta ${R.pesos(pago)}: faltan <b>${R.pesos(v)}</b>.` };
  } },
  { nivel: 4, fn() {
    const items = R.mezclar(PRODUCTOS.filter(x => x[2] < 2000)).slice(0, 3), tot = items.reduce((a, b) => a + b[2], 0), pago = Math.ceil(tot / 1000) * 1000 + R.pick([0, 1000, 2000]), v = pago - tot;
    return { escena: `<div class="lista-compra">${items.map(([e, n, p]) => `<div>${e} ${n} <b>${R.pesos(p)}</b></div>`).join("")}</div>`,
      pregunta: `Compra las 3 cosas y paga con ${R.pesos(pago)}. ¿Vuelto?`, ok: R.pesos(v), malas: [R.pesos(v + 100), R.pesos(v - 100), R.pesos(tot)].filter(x => x !== R.pesos(v)),
      exp: `Total: ${items.map(i => R.pesos(i[2])).join(" + ")} = ${R.pesos(tot)}. Vuelto: ${R.pesos(pago)} − ${R.pesos(tot)} = <b>${R.pesos(v)}</b>.` };
  } },
  { nivel: 5, fn() {
    const [e, nom, p] = R.pick(PRODUCTOS.filter(x => x[2] < 1500)), plata = R.ri(3, 15) * 1000, max = Math.floor(plata / p);
    return { escena: `<div class="producto-mercado"><div class="grande-emoji">${e}</div><div class="precio-cartel">${R.pesos(p)} c/u</div></div>`,
      pregunta: `Tienes ${R.pesos(plata)}. ¿Cuántos puedes comprar como máximo?`, ok: String(max), malas: R.numMalas(max, [max + 1, Math.round(plata / p), max - 1]),
      exp: `${R.pesos(plata)} ÷ ${R.pesos(p)} = ${R.n(R.red(plata / p))}. Solo cuentan los enteros: <b>${max}</b> (te sobran ${R.pesos(plata - max * p)}).` };
  } },
  { nivel: 6, fn() {
    const [e, nom, p] = R.pick(PRODUCTOS), des = R.pick([10, 20, 25, 30, 50]), ans = p * (100 - des) / 100;
    return { escena: `<div class="producto-mercado"><div class="grande-emoji">${e}</div><div class="precio-cartel">${R.pesos(p)} · −${des}%</div></div>`,
      pregunta: `¿Cuánto cuesta el ${nom} con el descuento?`, ok: R.pesos(ans), malas: [R.pesos(p * des / 100), R.pesos(p - des * 10), R.pesos(p - des)].filter(x => x !== R.pesos(ans)),
      exp: `${des}% de ${R.pesos(p)} = ${R.pesos(p * des / 100)}. Pagas <b>${R.pesos(ans)}</b>.` };
  } },
  { nivel: 7, fn() {
    const [e, nom, p] = R.pick(PRODUCTOS.filter(x => x[2] < 2000)), n = R.pick([3, 4, 5, 6]), a = n * p, b = n + R.ri(1, 3), pb = Math.round(p * b * R.pick([0.8, 0.9, 1.1, 1.2]) / 10) * 10;
    const ua = a / n, ub = pb / b, ok = ua < ub ? `Pack A (${n} por ${R.pesos(a)})` : `Pack B (${b} por ${R.pesos(pb)})`, otro = ua < ub ? `Pack B (${b} por ${R.pesos(pb)})` : `Pack A (${n} por ${R.pesos(a)})`;
    return { escena: `<div class="lista-compra"><div>${e} Pack A: ${n} por <b>${R.pesos(a)}</b></div><div>${e} Pack B: ${b} por <b>${R.pesos(pb)}</b></div></div>`,
      pregunta: `¿Qué pack de ${nom} conviene más?`, ok, malas: [otro, "Cuestan lo mismo por unidad", "No se puede saber"],
      exp: `Precio por unidad: A = ${R.pesos(ua)}, B = ${R.pesos(ub)}. Conviene el más barato por unidad: <b>${ok.split(" (")[0]}</b>.` };
  } },
  { nivel: 8, fn() {
    const [e, nom, p] = R.pick(PRODUCTOS.filter(x => x[2] < 2000)), ans = p * 2;
    return { escena: `<div class="producto-mercado"><div class="grande-emoji">${e}</div><div class="precio-cartel">Oferta 3×2 · ${R.pesos(p)} c/u</div></div>`,
      pregunta: `Con la oferta "lleva 3, paga 2", ¿cuánto pagas por 6 ${nom}s?`, ok: R.pesos(ans * 2), malas: [R.pesos(p * 6), R.pesos(p * 3), R.pesos(p * 5)],
      exp: `6 ${nom}s son 2 grupos de 3. En cada grupo pagas 2: ${R.pesos(p)} × 4 = <b>${R.pesos(ans * 2)}</b>.` };
  } },
  { nivel: 9, fn() {
    const meta = R.ri(15, 60) * 1000, ahorro = R.pick([1500, 2000, 2500, 3000, 3500]), tiene = R.ri(0, 5) * 1000, sem = Math.ceil((meta - tiene) / ahorro);
    return { escena: `<p class="problema">Nina quiere una bici 🚲 de <b>${R.pesos(meta)}</b>. Ya tiene <b>${R.pesos(tiene)}</b> y ahorra <b>${R.pesos(ahorro)}</b> cada semana.</p>`,
      pregunta: "¿Cuántas semanas necesita como mínimo?", ok: String(sem), malas: R.numMalas(sem, [Math.floor((meta - tiene) / ahorro), Math.ceil(meta / ahorro), sem + 1]),
      exp: `Le faltan ${R.pesos(meta - tiene)}. ${R.pesos(meta - tiene)} ÷ ${R.pesos(ahorro)} = ${R.n(R.red((meta - tiene) / ahorro))} → redondea hacia arriba: <b>${sem} semanas</b>.` };
  } },
  { nivel: 10, fn() {
    const P = R.ri(10, 40) * 1000, d = R.pick([20, 25, 30]), pago = Math.ceil(P * (100 - d) / 100 / 5000) * 5000 + 5000, v = pago - P * (100 - d) / 100;
    return { escena: `<p class="problema">Unos patines 🛼 cuestan <b>${R.pesos(P)}</b> con <b>${d}%</b> de descuento. Pelu paga con <b>${R.pesos(pago)}</b>.</p>`,
      pregunta: "¿Cuánto vuelto recibe?", ok: R.pesos(v), malas: [R.pesos(pago - P), R.pesos(P * d / 100), R.pesos(v + 1000)],
      exp: `Precio final: ${R.pesos(P)} − ${d}% = ${R.pesos(P * (100 - d) / 100)}. Vuelto: <b>${R.pesos(v)}</b>.` };
  } },
];

/* ============================================================
   LÓGICA
   ============================================================ */
const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function secuenciaNum(nivel) {
  const tipos = [
    [1, () => { const i = R.ri(1, 20), p = R.ri(3, 9); return [[0, 1, 2, 3, 4].map(k => i + p * k), `suma ${p} cada vez`]; }],
    [2, () => { const i = R.ri(60, 99), p = R.ri(4, 12); return [[0, 1, 2, 3, 4].map(k => i - p * k), `resta ${p} cada vez`]; }],
    [2, () => { const i = R.ri(1, 5); return [[0, 1, 2, 3, 4].map(k => i * 2 ** k), "cada número se duplica"]; }],
    [3, () => { const a = R.ri(2, 6), b = R.ri(7, 12), s = [R.ri(1, 10)]; for (let k = 1; k < 6; k++) s.push(s[k - 1] + (k % 2 ? a : b)); return [s, `alterna +${a} y +${b}`]; }],
    [4, () => { const s0 = R.ri(1, 5); return [[0, 1, 2, 3, 4].map(k => (s0 + k) ** 2), "son cuadrados: n × n"]; }],
    [4, () => { const i = R.ri(1, 3); return [[0, 1, 2, 3, 4].map(k => i * 3 ** k), "cada número se multiplica por 3"]; }],
    [5, () => { const s = [R.ri(1, 5), R.ri(2, 6)]; for (let k = 2; k < 6; k++) s.push(s[k - 1] + s[k - 2]); return [s, "cada número es la suma de los dos anteriores"]; }],
    [5, () => { const i = R.ri(1, 10), s = [i]; for (let k = 1; k < 6; k++) s.push(s[k - 1] + k); return [s, "se suma 1, luego 2, luego 3… (cada vez uno más)"]; }],
    [6, () => { const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43], o = R.ri(0, 7); return [pr.slice(o, o + 6), "son los números primos en orden"]; }],
    [6, () => { const i = R.ri(1, 4), s = [i]; for (let k = 1; k < 6; k++) s.push(s[k - 1] * 2 + 1); return [s, "× 2 y + 1"]; }],
    [7, () => { const a = R.ri(1, 5), b = R.ri(40, 60), s = []; for (let k = 0; k < 3; k++) { s.push(a + 3 * k); s.push(b - 5 * k); } return [s, `son dos secuencias intercaladas: una sube de 3 en 3 y otra baja de 5 en 5`]; }],
    [7, () => { const s0 = R.ri(1, 4); return [[0, 1, 2, 3, 4].map(k => (s0 + k) ** 3), "son cubos: n × n × n"]; }],
    [8, () => { const i = R.ri(2, 5), s = [i]; for (let k = 1; k < 6; k++) s.push(s[k - 1] * -2); return [s, "cada número se multiplica por −2"]; }],
    [8, () => { const s0 = R.ri(1, 4); return [[0, 1, 2, 3, 4].map(k => (s0 + k) ** 2 + (s0 + k)), "n² + n (o n × (n+1))"]; }],
    [9, () => { const s = [R.ri(1, 3), R.ri(1, 3), R.ri(1, 3)]; for (let k = 3; k < 7; k++) s.push(s[k - 1] + s[k - 2] + s[k - 3]); return [s, "cada número es la suma de los TRES anteriores"]; }],
    [9, () => { const i = R.ri(2, 4), s = [i]; for (let k = 1; k < 6; k++) s.push(s[k - 1] * (k + 1)); return [s, "× 2, × 3, × 4, × 5…"]; }],
    [10, () => { const s = [1]; for (let k = 1; k < 6; k++) s.push(s[k - 1] + (k * k)); return [s, "se suman los cuadrados: +1, +4, +9, +16…"]; }],
  ];
  const disp = tipos.filter(t => t[0] <= nivel && t[0] >= nivel - 4);
  const [sec, regla] = R.pick(disp.length ? disp : tipos)[1]();
  const ans = sec[sec.length - 1], vis = sec.slice(0, -1);
  return { escena: `<div class="secuencia">${vis.map(n => `<span>${R.n(n)}</span>`).join("")}<span class="hueco">?</span></div>`,
    pregunta: "¿Qué número sigue?", ok: R.n(ans), malas: R.numMalas(ans, [ans + (sec[sec.length - 2] - sec[sec.length - 3]), ans + 1, ans * 2], true),
    exp: `El truco: <b>${regla}</b>. Sigue el <b>${R.n(ans)}</b>.` };
}

const GEN_LOGICA = [
  { nivel: 1, fn() {                                       // patrón de símbolos (A B B C…)
    const sim = R.mezclar(["🔴", "🔵", "🟡", "🟢", "⭐", "🌙", "🐾", "💜"]);
    const pat = R.pick([[0, 1, 1], [0, 1, 2], [0, 0, 1, 2], [0, 1, 2, 1], [0, 1, 1, 2, 2]]).map(i => sim[i]);
    let s = []; while (s.length < 10) s = s.concat(pat);
    const cut = R.ri(7, 9), ans = s[cut];
    return { escena: `<div class="secuencia">${s.slice(0, cut).map(x => `<span>${x}</span>`).join("")}<span class="hueco">?</span></div>`,
      pregunta: "¿Qué sigue en el patrón?", ok: ans, malas: R.mezclar([...new Set(pat)].filter(x => x !== ans).concat(sim.slice(5))).slice(0, 3),
      exp: `El patrón que se repite es: <b>${pat.join(" ")}</b>.` };
  } },
  { nivel: 1, fn() { return secuenciaNum(1); } },
  { nivel: 3, fn() { return secuenciaNum(3); } },
  { nivel: 5, fn() { return secuenciaNum(5); } },
  { nivel: 7, fn() { return secuenciaNum(7); } },
  { nivel: 9, fn() { return secuenciaNum(10); } },
  { nivel: 3, fn() {                                       // reloj
    const h = R.ri(1, 11), m = R.pick([0, 15, 20, 30, 40, 45, 50]), dh = R.ri(1, 4), dm = R.pick([15, 20, 30, 45, 50]);
    let tm = h * 60 + m + dh * 60 + dm; const fmt = t => { t = ((t % 720) + 720) % 720; const hh = Math.floor(t / 60) || 12; return `${hh}:${String(t % 60).padStart(2, "0")}`; };
    return { escena: R.eq(`🕒 ${fmt(h * 60 + m)}`), pregunta: `¿Qué hora será en ${dh} h y ${dm} min?`, ok: fmt(tm), malas: [fmt(tm + 60), fmt(tm - 10), fmt(h * 60 + m + dh * 60 + dm + 40)].filter(x => x !== fmt(tm)),
      exp: `${fmt(h * 60 + m)} + ${dh} h = ${fmt(h * 60 + m + dh * 60)}; + ${dm} min = <b>${fmt(tm)}</b>.` };
  } },
  { nivel: 3, fn() {                                       // balanza de frutas
    const frutas = R.mezclar(["🍎", "🍌", "🍓", "🍇", "🍐", "🥝"]).slice(0, 3), v = [R.ri(2, 9), R.ri(2, 9), R.ri(2, 9)];
    const [A, B, C] = frutas, [a, b, c] = v;
    const eqs = [`${A} + ${A} = ${2 * a}`, `${A} + ${B} = ${a + b}`, `${B} + ${C} + ${C} = ${b + 2 * c}`];
    const preg = R.ri(1, 2), ans = v[preg];
    return { escena: `<div class="balanzas">${eqs.map(e => `<div>${e}</div>`).join("")}</div>`, pregunta: `¿Cuánto vale ${frutas[preg]}?`, ok: R.n(ans),
      malas: R.numMalas(ans, [a, b + c, ans + 1].filter(x => x !== ans)),
      exp: `${A} vale ${a} (porque 2 × ${a} = ${2 * a}). Entonces ${B} = ${a + b} − ${a} = ${b}, y ${C} = (${b + 2 * c} − ${b}) ÷ 2 = ${c}.` };
  } },
  { nivel: 4, fn() {                                       // calendario
    const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"], i = R.ri(0, 6), n = R.pick([9, 12, 15, 17, 20, 23, 30, 45, 50, 100, 365]);
    const ans = dias[(i + n) % 7];
    return { escena: `<p class="problema">Hoy es <b>${dias[i]}</b> 📅</p>`, pregunta: `¿Qué día será dentro de ${n} días?`, ok: ans,
      malas: R.mezclar(dias.filter(d => d !== ans)).slice(0, 3), exp: `Cada 7 días se repite el mismo día. ${n} ÷ 7 deja resto ${n % 7}, así que avanzas ${n % 7} día${n % 7 === 1 ? "" : "s"} desde ${dias[i]}: <b>${ans}</b>.` };
  } },
  { nivel: 4, fn() { return sudoku4(4); } },
  { nivel: 7, fn() { return sudoku4(8); } },
  { nivel: 5, fn() {                                       // cuadrado mágico 3×3
    let base = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
    for (let r = R.ri(0, 3); r > 0; r--) base = base[0].map((_, i) => base.map(f => f[2 - i]));
    if (R.ri(0, 1)) base = base.map(f => f.slice().reverse());
    const k = R.ri(1, 4), s = R.ri(0, 10), g = base.map(f => f.map(v => v * k + s)), suma = 15 * k + 3 * s;
    const fi = R.ri(0, 2), co = R.ri(0, 2), ans = g[fi][co];
    const ocultos = new Set([`${fi},${co}`]);
    return { escena: `<div class="grilla g3">${g.map((f, r) => f.map((v, c) => `<span class="${r === fi && c === co ? "hueco" : ""}">${ocultos.has(`${r},${c}`) ? "?" : v}</span>`).join("")).join("")}</div>`,
      pregunta: "Cuadrado mágico: todas las filas, columnas y diagonales suman lo mismo. ¿Qué número falta?", ok: R.n(ans), malas: R.numMalas(ans, [ans + k, ans - k, suma - ans]),
      exp: `Cada línea suma <b>${suma}</b>. En esa fila: ${suma} − ${g[fi].filter((_, c) => c !== co).join(" − ")} = <b>${ans}</b>.` };
  } },
  { nivel: 6, fn() {                                       // código secreto / cifrado
    const palabras = ["PELU", "LUNA", "MIA", "NINA", "MAGIA", "BRUJA", "GATO", "BUHO", "VARITA", "ESTRELLA", "POCION", "LAGO"];
    const w = R.pick(palabras);
    if (R.ri(0, 1)) {
      const val = w.split("").reduce((a, c) => a + LETRAS.indexOf(c) + 1, 0);
      return { escena: `<p class="problema">Código secreto: A = 1, B = 2, C = 3… Z = 26</p>`, pregunta: `¿Cuánto vale la palabra ${w} (sumando sus letras)?`, ok: R.n(val),
        malas: R.numMalas(val, [val + 1, val - w.length, val + 10]), exp: `${w.split("").map(c => `${c}=${LETRAS.indexOf(c) + 1}`).join(" + ")} = <b>${val}</b>.` };
    }
    const d = R.ri(1, 3), cif = s => s.split("").map(c => LETRAS[(LETRAS.indexOf(c) + d) % 26]).join("");
    const otras = R.mezclar(palabras.filter(p => p !== w && p.length === w.length)).slice(0, 2);
    const malas = [...otras, w.split("").reverse().join(""), cif(w)].filter(x => x !== w);
    return { escena: `<p class="problema">Mensaje cifrado 🔐: <b class="cifrado">${cif(w)}</b><br>Cada letra se corrió <b>${d}</b> lugar${d > 1 ? "es" : ""} hacia adelante en el abecedario (sin Ñ).</p>`,
      pregunta: "¿Qué dice el mensaje?", ok: w, malas: [...new Set(malas)].slice(0, 3), exp: `Retrocede ${d} letra${d > 1 ? "s" : ""} cada una: ${cif(w)} → <b>${w}</b>.` };
  } },
  { nivel: 6, fn() {                                       // secuencia de letras
    const t = R.ri(0, 2); let idx, regla;
    if (t === 0) { const p = R.ri(2, 4), i = R.ri(0, 5); idx = [0, 1, 2, 3, 4].map(k => i + p * k); regla = `avanza ${p} letras cada vez`; }
    else if (t === 1) { const i = R.ri(0, 4); idx = [i, i + 1, i + 3, i + 6, i + 10]; regla = "avanza 1, luego 2, luego 3, luego 4 letras"; }
    else { const i = R.ri(20, 25), p = R.ri(2, 3); idx = [0, 1, 2, 3, 4].map(k => i - p * k); regla = `retrocede ${p} letras cada vez`; }
    const s = idx.map(k => LETRAS[k]), ans = s[4];
    const malas = [LETRAS[idx[4] + 1], LETRAS[idx[4] - 1], LETRAS[idx[3] + (idx[3] - idx[2])]].filter(x => x && x !== ans);
    return { escena: `<div class="secuencia">${s.slice(0, 4).map(x => `<span>${x}</span>`).join("")}<span class="hueco">?</span></div>`,
      pregunta: "¿Qué letra sigue?", ok: ans, malas: [...new Set(malas.concat(R.mezclar(LETRAS.split("")).filter(x => x !== ans)))].slice(0, 3),
      exp: `La secuencia <b>${regla}</b> (abecedario sin Ñ). Sigue la <b>${ans}</b>.` };
  } },
  // contenido escrito (acertijos, analogías, intrusos): se elige en Retos.logica
];

// Sudoku 4×4: la celda con ? se puede deducir con fila, columna y cuadro
function sudoku4(dificultad) {
  const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
  const perm = R.mezclar([1, 2, 3, 4]), filas = R.mezclar([0, 1]).concat(R.mezclar([2, 3])), cols = R.mezclar([0, 1]).concat(R.mezclar([2, 3]));
  const g = filas.map(f => cols.map(c => perm[base[f][c] - 1]));
  for (let intento = 0; intento < 60; intento++) {
    const tf = R.ri(0, 3), tc = R.ri(0, 3), ocultas = new Set([`${tf},${tc}`]);
    const extra = Math.min(9, R.ri(dificultad - 1, dificultad + 2));
    while (ocultas.size < extra + 1) ocultas.add(`${R.ri(0, 3)},${R.ri(0, 3)}`);
    const vis = (r, c) => !ocultas.has(`${r},${c}`);
    const usados = new Set();
    for (let k = 0; k < 4; k++) { if (vis(tf, k)) usados.add(g[tf][k]); if (vis(k, tc)) usados.add(g[k][tc]); }
    const br = tf < 2 ? 0 : 2, bc = tc < 2 ? 0 : 2;
    for (let r = br; r < br + 2; r++) for (let c = bc; c < bc + 2; c++) if (vis(r, c)) usados.add(g[r][c]);
    if (usados.size === 3) {
      const ans = g[tf][tc];
      return { escena: `<div class="grilla g4">${g.map((f, r) => f.map((v, c) => `<span class="${r === tf && c === tc ? "hueco" : ""} ${c === 1 ? "borde-d" : ""} ${r === 1 ? "borde-b" : ""}">${r === tf && c === tc ? "?" : vis(r, c) ? v : ""}</span>`).join("")).join("")}</div>`,
        pregunta: "Sudoku: cada fila, columna y cuadro de 2×2 tiene 1, 2, 3 y 4. ¿Qué número va en la casilla morada?", ok: String(ans),
        malas: [1, 2, 3, 4].filter(x => x !== ans).map(String),
        exp: `Mirando su fila, su columna y su cuadro ya aparecen ${[...usados].sort().join(", ")}. El único que falta es <b>${ans}</b>.` };
    }
  }
  return secuenciaNum(4);
}

/* ============================================================
   INGLÉS
   ============================================================ */
const Ingles = {
  _vocab: null,
  vocab() {
    if (this._vocab) return this._vocab;
    const vistos = new Set(), lista = [];
    const agregar = (en, es, e, cat, n) => {
      const k = String(en).toLowerCase();
      if (!en || !es || vistos.has(k)) return;
      vistos.add(k); lista.push({ en, es, e: e || "", cat: cat || "Varios", n: n || 1 });
    };
    ((window.INGLES && window.INGLES.vocab) || []).forEach(v => agregar(...v));
    (DATA.palabrasIngles || []).forEach(p => agregar(p.en, p.es, p.emoji, "Varios", 1));
    this._vocab = lista;
    return lista;
  },
  nivelesVocab(nivel) { return nivel <= 2 ? [1] : nivel <= 4 ? [1, 2] : nivel <= 6 ? [2, 3] : nivel <= 8 ? [2, 3] : [3]; },
  nivelFrase(nivel) { return nivel <= 4 ? [1] : nivel <= 6 ? [1, 2] : nivel <= 8 ? [2, 3] : [3]; },

  // opciones del mismo tema y nivel parecido (así no se adivinan por descarte)
  distractores(item, campo, cuantas = 3) {
    const v = this.vocab(), val = item[campo];
    let pool = v.filter(x => x.cat === item.cat && x[campo] !== val && Math.abs(x.n - item.n) <= 1);
    if (pool.length < cuantas) pool = pool.concat(v.filter(x => x[campo] !== val && !pool.includes(x)));
    return R.mezclar(pool).slice(0, cuantas).map(x => x[campo]);
  },

  palabra(nivel, filtro = () => true) {
    const ns = this.nivelesVocab(nivel);
    const pool = this.vocab().filter(x => ns.includes(x.n) && filtro(x));
    return pool.length ? R.pick(pool) : R.pick(this.vocab());
  },

  // Errores de ortografía creíbles para "¿cuál está bien escrita?"
  malEscritas(w) {
    const vocales = { a: "e", e: "i", i: "e", o: "u", u: "o" }, set = new Set(), todas = new Set(this.vocab().map(x => x.en));
    const intentos = [
      () => { const i = R.ri(1, w.length - 2); return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); },
      () => { const m = w.match(/([a-z])\1/); if (m) return w.replace(m[0], m[1]); const i = R.ri(1, w.length - 2); return /[aeiou]/.test(w[i]) ? null : w.slice(0, i) + w[i] + w.slice(i); },
      () => { const idx = [...w].map((c, i) => vocales[c] ? i : -1).filter(i => i > 0); if (!idx.length) return null; const i = R.pick(idx); return w.slice(0, i) + vocales[w[i]] + w.slice(i + 1); },
      () => { const i = R.ri(1, w.length - 1); return w.slice(0, i) + w.slice(i + 1); },
      () => w.replace("ph", "f").replace("ck", "k").replace("igh", "ai").replace("ou", "ow").replace("ea", "ee"),
    ];
    for (let k = 0; k < 40 && set.size < 3; k++) {
      const m = R.pick(intentos)();
      if (m && m !== w && !todas.has(m) && m.length > 2) set.add(m);
    }
    return [...set];
  },

  generar(nivel) {
    const I = window.INGLES || { gramatica: [], frases: [] };
    const tipos = [];
    const agrega = (t, peso) => { for (let i = 0; i < peso; i++) tipos.push(t); };
    if (nivel <= 5) agrega("emoji", nivel <= 2 ? 4 : 2);
    agrega("esAEn", 3); agrega("enAEs", nivel <= 6 ? 3 : 2);
    if (nivel >= 3) agrega("intruso", 1);
    if (nivel >= 3 && I.gramatica.length) agrega("gramatica", nivel >= 7 ? 5 : 3);
    if (nivel >= 4 && I.frases.length) agrega("frase", nivel >= 7 ? 4 : 2);
    if (nivel >= 5) agrega("deletreo", 2);
    const t = R.pick(tipos);

    if (t === "gramatica" || t === "frase") {
      const ns = this.nivelFrase(nivel), lista = t === "gramatica" ? I.gramatica : I.frases;
      const pool = lista.filter(x => ns.includes(x.n)), g = R.pick(pool.length ? pool : lista);
      if (t === "gramatica") {
        const completa = g.t.replace("___", `<u>${g.ok}</u>`);
        return { escena: `<div class="ingles-frase">${g.t.replace("___", "<span class='blanco'>____</span>")}</div>${g.es ? `<p class="ingles-es">${g.es}</p>` : ""}`,
          pregunta: `Completa la frase ✍️ <span class="tema-chip">${g.tema || "Gramática"}</span>`, ok: g.ok, malas: g.no.slice(0, 3),
          exp: `${completa}<br>${g.exp || ""}`, hablar: g.t.replace("___", g.ok) };
      }
      return { escena: `<div class="ingles-frase">“${g.es}”</div>`, pregunta: "¿Cuál es la traducción correcta? 🇬🇧", ok: g.ok, malas: g.no.slice(0, 3),
        exp: `<b>${g.ok}</b><br>${g.exp || ""}`, hablar: g.ok, opcionesLargas: true };
    }
    if (t === "emoji") {
      const p = this.palabra(nivel, x => x.e);
      return { escena: `<div class="ingles-objeto">${p.e}</div>`, pregunta: "¿Cómo se dice en inglés? 🇬🇧", ok: p.en, malas: this.distractores(p, "en"),
        exp: `${p.e} = <b>${p.en}</b> (${p.es})`, hablar: p.en };
    }
    if (t === "esAEn") {
      const p = this.palabra(nivel);
      return { escena: `<div class="ingles-frase">${p.es}</div><p class="ingles-es">${p.cat}</p>`, pregunta: "¿Cómo se dice en inglés? 🇬🇧", ok: p.en, malas: this.distractores(p, "en"),
        exp: `${p.es} = <b>${p.en}</b> ${p.e}`, hablar: p.en };
    }
    if (t === "enAEs") {
      const p = this.palabra(nivel);
      return { escena: `<div class="ingles-frase">${p.en}</div><p class="ingles-es">${p.cat}</p>`, pregunta: "¿Qué significa en español? 🇨🇱", ok: p.es, malas: this.distractores(p, "es"),
        exp: `<b>${p.en}</b> = ${p.es} ${p.e}`, hablar: p.en };
    }
    if (t === "intruso") {
      const v = this.vocab(), cats = [...new Set(v.map(x => x.cat))].filter(c => v.filter(x => x.cat === c).length >= 4);
      const cat = R.pick(cats), ns = this.nivelesVocab(nivel);
      const del = R.mezclar(v.filter(x => x.cat === cat && ns.includes(x.n))).slice(0, 3);
      const intruso = R.pick(v.filter(x => x.cat !== cat && ns.includes(x.n)));
      if (del.length < 3 || !intruso) return this.generar(Math.max(1, nivel - 1));
      return { escena: `<p class="problema">Tres palabras son de la categoría <b>${cat}</b>…</p>`, pregunta: "¿Cuál NO pertenece? 🕵️‍♀️", ok: intruso.en,
        malas: del.map(x => x.en), exp: `<b>${intruso.en}</b> = ${intruso.es}. Las otras son de ${cat}: ${del.map(x => `${x.en} (${x.es})`).join(", ")}.`, hablar: intruso.en };
    }
    // deletreo
    const p = this.palabra(nivel, x => /^[a-z]+$/.test(x.en) && x.en.length >= (nivel >= 8 ? 7 : 5));
    const malas = this.malEscritas(p.en);
    if (malas.length < 3) return this.generar(nivel);
    return { escena: `<div class="ingles-frase">${p.es} ${p.e}</div>`, pregunta: "¿Cuál está bien escrita? 🔤", ok: p.en, malas,
      exp: `Se escribe <b>${p.en}</b>: ${p.en.toUpperCase().split("").join("-")}`, hablar: p.en };
  },
};

/* ============================================================
   API pública
   ============================================================ */
const Retos = {
  MATERIAS: { matematicas: "Números", logica: "Lógica", ingles: "Inglés", dinero: "Dinero" },

  // Nivel inicial según la edad (10 años → nivel 7: arranca desafiante)
  nivelInicial() { return Math.max(1, Math.min(10, (Estado.data.edad || 10) - 3)); },
  nivel(m) {
    const nv = Estado.data.niveles || (Estado.data.niveles = {});
    if (!nv[m]) nv[m] = this.nivelInicial();
    return nv[m];
  },
  setNivel(m, n) { this.nivel(m); Estado.data.niveles[m] = Math.max(1, Math.min(10, n)); Estado.guardar(); },

  _recientes: [],
  // Genera una pregunta sin repetir las últimas vistas
  generar(materia, nivel) {
    let q, malas;
    for (let k = 0; k < 12; k++) {
      q = this._uno(materia, nivel);
      // opciones finales: sin repetidos ni vacíos; si faltan, se rellenan
      malas = [...new Set((q.malas || []).map(String))].filter(x => x && x !== String(q.ok));
      if (malas.length < 3) this.rellenar(String(q.ok), malas);
      const clave = materia + "|" + q.pregunta + "|" + q.escena;
      if (malas.length >= 3 && !this._recientes.includes(clave)) {
        this._recientes.push(clave); if (this._recientes.length > 300) this._recientes.shift();
        break;
      }
    }
    q.opciones = R.mezclar([String(q.ok), ...malas.slice(0, 3)]);
    return q;
  },

  // Completa opciones creíbles según el formato de la respuesta ($, °, cm, fracción, número)
  rellenar(ok, malas) {
    const add = x => { x = String(x); if (x !== ok && !malas.includes(x)) malas.push(x); };
    const f = ok.match(/^(\d+)\/(\d+)$/);
    if (f) { add(`${+f[1] + 1}/${f[2]}`); add(`${f[1]}/${+f[2] + 1}`); add(`${f[2]}/${f[1]}`); return; }
    const m = ok.match(/^(\$?)(−?[\d.,]+)(.*)$/);
    if (!m) return;
    const num = parseFloat(m[2].replace(/\./g, "").replace(",", ".").replace("−", "-"));
    const pasos = m[1] ? [1000, -100, 100, 500, -1000] : Number.isInteger(num) ? [10, -10, 1, -1, 2] : [0.5, -0.5, 1, -1];
    for (const p of pasos) {
      if (malas.length >= 3) break;
      const v = num + p;
      if (m[1]) { if (v > 0) add(R.pesos(v)); } else add(R.n(v) + m[3]);
    }
  },
  _uno(materia, nivel) {
    try {
      if (materia === "matematicas") return elegirGenerador(GEN_MATE, nivel).fn();
      if (materia === "dinero") return elegirGenerador(GEN_DINERO, nivel).fn();
      if (materia === "ingles") return Ingles.generar(nivel);
      if (materia === "logica") return this.logica(nivel);
    } catch (e) { console.warn("reto", materia, e); }
    return GEN_MATE[4].fn();                        // respaldo seguro
  },

  logica(nivel) {
    const L = window.LOGICA;
    if (L && Math.random() < 0.5) {
      const ns = nivel <= 3 ? [1] : nivel <= 5 ? [1, 2] : nivel <= 7 ? [2, 3] : [3];
      const tipo = R.pick(["acertijos", "acertijos", "analogias", "intrusos"]);
      const pool = (L[tipo] || []).filter(x => ns.includes(x.n));
      if (pool.length) {
        const x = R.pick(pool);
        if (tipo === "acertijos") return { escena: `<p class="problema acertijo">${x.q}</p>`, pregunta: "Piensa bien… 🧠", ok: x.ok, malas: x.no, exp: x.exp || "", opcionesLargas: true };
        if (tipo === "analogias") return { escena: `<p class="problema analogia"><b>${x.a}</b> es a <b>${x.b}</b><br>como <b>${x.c}</b> es a <span class="blanco">____</span></p>`,
          pregunta: "¿Qué palabra completa la analogía?", ok: x.ok, malas: x.no, exp: x.exp || "" };
        return { escena: `<p class="problema">${R.mezclar(x.items).map(i => `<span class="chip-palabra">${i}</span>`).join(" ")}</p>`,
          pregunta: "¿Cuál NO pertenece al grupo? 🕵️‍♀️", ok: x.ok, malas: x.items.filter(i => i !== x.ok), exp: x.exp || "" };
      }
    }
    return elegirGenerador(GEN_LOGICA, nivel).fn();
  },
};

if (typeof window !== "undefined") { window.Retos = Retos; window.R = R; window.GEN_MATE = GEN_MATE; window.GEN_LOGICA = GEN_LOGICA; window.GEN_DINERO = GEN_DINERO; window.Ingles = Ingles; }
