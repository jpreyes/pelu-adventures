/* Arte extra: muebles, mascotas, personajes, lugares y adornos (SVG en línea, sin imágenes). */
(function () {
  const A = window.Arte = window.Arte || {};
  // Cada dibujo: { vb: "minX minY w h", svg: `<path .../>...` }  (solo el contenido interno, sin la etiqueta <svg>)

  // ---------- ayudantes ----------
  const n1 = v => +v.toFixed(1);
  const J = 'stroke-linejoin="round" stroke-linecap="round"';
  const s = (c, w = 3) => `stroke="${c}" stroke-width="${w}" ${J}`;
  // Ojo estilo gatitas: elipse oscura + brillo blanco
  const ojo = (x, y, rx = 6, ry = 7) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#46304f"/><circle cx="${n1(x + rx * 0.35)}" cy="${n1(y - ry * 0.4)}" r="${n1(rx * 0.4)}" fill="#fff"/>`;
  const mej = (x, y, rx = 6, ry = 4, c = "#ffc9e0") =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".85"/>`;
  // Refleja horizontalmente un grupo dentro de un ancho w
  const esp = (w, g) => `<g transform="translate(${w} 0) scale(-1 1)">${g}</g>`;
  const estrellaD = (cx, cy, R, ri, n = 5) => {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? ri : R;
      d += (i ? "L" : "M") + n1(cx + r * Math.cos(a)) + " " + n1(cy + r * Math.sin(a)) + " ";
    }
    return d + "Z";
  };
  const chispaD = (cx, cy, r) =>
    `M${cx} ${cy - r} Q${n1(cx + r * .12)} ${n1(cy - r * .12)} ${cx + r} ${cy} Q${n1(cx + r * .12)} ${n1(cy + r * .12)} ${cx} ${cy + r} Q${n1(cx - r * .12)} ${n1(cy + r * .12)} ${cx - r} ${cy} Q${n1(cx - r * .12)} ${n1(cy - r * .12)} ${cx} ${cy - r} Z`;
  const libroR = (x, y, w, h, f, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${f}" ${s(c, 2)}/>`;
  const tulipa = (cx, cy, f, c) =>
    `<path d="M${cx - 7} ${cy - 6} L${n1(cx - 3.5)} ${n1(cy - 2.5)} L${cx} ${cy - 7} L${n1(cx + 3.5)} ${n1(cy - 2.5)} L${cx + 7} ${cy - 6} V${cy + 1} Q${cx + 7} ${cy + 8} ${cx} ${cy + 8} Q${cx - 7} ${cy + 8} ${cx - 7} ${cy + 1} Z" fill="${f}" ${s(c, 2)}/>`;
  const alrededor = (cx, cy, rx, ry, k, fn) => {
    let o = "";
    for (let i = 0; i < k; i++) {
      const a = i * 2 * Math.PI / k;
      o += fn(n1(cx + rx * Math.cos(a)), n1(cy + ry * Math.sin(a)), i);
    }
    return o;
  };

  // =====================================================================
  // MUEBLES (vista lateral, apoyados en el borde inferior)
  // =====================================================================
  A.MUEBLES = {
    cama: { vb: "0 0 220 110", svg:
      `<rect x="38" y="84" width="10" height="24" rx="3" fill="#c98a4b" ${s("#a86b35", 2.5)}/>` +
      `<rect x="176" y="84" width="10" height="24" rx="3" fill="#c98a4b" ${s("#a86b35", 2.5)}/>` +
      `<rect x="6" y="6" width="36" height="100" rx="14" fill="#ff8fb8" ${s("#e0508f")}/>` +
      `<path d="M24 38 l-8 -8 a5 5 0 0 1 8 -6.5 a5 5 0 0 1 8 6.5 z" fill="#fff"/>` +
      `<rect x="34" y="54" width="162" height="34" rx="10" fill="#fff" ${s("#e8dcef")}/>` +
      `<path d="M92 48 H182 a10 10 0 0 1 10 10 V88 H92 Z" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<path d="M94 58 H190" stroke="#b89cff" stroke-width="4"/>` +
      `<path d="M106 72 h8 M128 80 h8 M150 72 h8 M170 80 h8" stroke="#b89cff" stroke-width="4" stroke-linecap="round"/>` +
      `<rect x="44" y="36" width="48" height="24" rx="12" fill="#fff" ${s("#e8dcef")}/>` +
      `<rect x="188" y="44" width="26" height="62" rx="11" fill="#ff8fb8" ${s("#e0508f")}/>` +
      `<circle cx="201" cy="60" r="4" fill="#ffc9e0"/>` },

    alfombra: { vb: "0 0 220 40", svg:
      `<path d="M14 15 H4 M13 21 H2 M14 27 H4 M206 15 H216 M207 21 H218 M206 27 H216" ${s("#8a63f0", 2.5)}/>` +
      `<ellipse cx="110" cy="21" rx="98" ry="16" fill="#c9b6f5" ${s("#8a63f0")}/>` +
      `<ellipse cx="110" cy="21" rx="78" ry="11" fill="#ddd0fb"/>` +
      `<ellipse cx="110" cy="21" rx="46" ry="6" fill="#efe8ff"/>` +
      alrededor(110, 21, 88, 13.5, 14, (x, y) => `<circle cx="${x}" cy="${y}" r="2.3" fill="#ff8fb8"/>`) },

    planta: { vb: "0 0 90 130", svg:
      `<path d="M45 84 Q14 64 20 26 Q44 42 45 84 Z" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<path d="M45 84 Q76 64 70 26 Q46 42 45 84 Z" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<path d="M45 84 Q10 82 6 50 Q36 50 45 84 Z" fill="#4fd89a" ${s("#22a86c")}/>` +
      `<path d="M45 84 Q80 82 84 50 Q54 50 45 84 Z" fill="#4fd89a" ${s("#22a86c")}/>` +
      `<path d="M45 84 Q26 50 45 10 Q64 50 45 84 Z" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<path d="M45 78 Q42 50 45 22 M42 80 Q28 70 14 56 M48 80 Q62 70 76 56" fill="none" ${s("#22a86c", 2)}/>` +
      `<path d="M24 92 H66 L60 126 H30 Z" fill="#ff9a4d" ${s("#e07a2d")}/>` +
      `<rect x="18" y="82" width="54" height="12" rx="5" fill="#ff9a4d" ${s("#e07a2d")}/>` +
      `<circle cx="36" cy="108" r="3" fill="#ffc83d"/><circle cx="45" cy="112" r="3" fill="#ffc83d"/><circle cx="54" cy="108" r="3" fill="#ffc83d"/>` +
      `<path d="M30 99 L33 118" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>` },

    lampara: { vb: "0 0 60 160", svg:
      `<rect x="27" y="40" width="6" height="108" rx="2" fill="#8a63f0" ${s("#6a45d4", 2)}/>` +
      `<ellipse cx="30" cy="151" rx="22" ry="6" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<path d="M14 6 H46 L54 42 H6 Z" fill="#ffe07a" ${s("#e0a51c")}/>` +
      `<path d="M9 35 H51" stroke="#ff8fb8" stroke-width="4"/>` +
      `<path d="M18 12 L14 28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>` +
      `<path d="M42 43 V55" ${s("#e0a51c", 2)}/><circle cx="42" cy="58" r="3" fill="#ffc83d" ${s("#e0a51c", 1.5)}/>` },

    tele: { vb: "0 0 130 130", svg:
      `<path d="M58 22 L42 7 M72 22 L88 7" ${s("#46304f")}/>` +
      `<circle cx="42" cy="6" r="3.5" fill="#ff6fae"/><circle cx="88" cy="6" r="3.5" fill="#ffc83d"/>` +
      `<rect x="6" y="20" width="118" height="74" rx="12" fill="#46304f" ${s("#2e1f35")}/>` +
      `<rect x="14" y="28" width="102" height="58" rx="7" fill="#9fdcff"/>` +
      `<circle cx="96" cy="42" r="8" fill="#ffd96a"/>` +
      `<ellipse cx="40" cy="44" rx="10" ry="5" fill="#fff"/><ellipse cx="50" cy="41" rx="7" ry="5" fill="#fff"/>` +
      `<path d="M14 80 Q40 58 64 70 Q90 56 116 72 V79 a7 7 0 0 1 -7 7 H21 a7 7 0 0 1 -7 -7 Z" fill="#3ccf8c"/>` +
      `<path d="M21 36 q3 -4 9 -4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>` +
      `<circle cx="113" cy="90" r="2" fill="#3ccf8c"/>` +
      `<rect x="56" y="94" width="18" height="8" fill="#6d5a86"/>` +
      `<rect x="10" y="100" width="110" height="28" rx="6" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<path d="M65 104 V124" ${s("#a86b35", 2)}/>` +
      `<circle cx="56" cy="114" r="3" fill="#a86b35"/><circle cx="74" cy="114" r="3" fill="#a86b35"/>` },

    sillon: { vb: "0 0 200 100", svg:
      `<rect x="22" y="84" width="10" height="14" rx="3" fill="#a86b35"/><rect x="168" y="84" width="10" height="14" rx="3" fill="#a86b35"/>` +
      `<rect x="20" y="8" width="160" height="56" rx="22" fill="#9b7af2" ${s("#6a45d4")}/>` +
      `<circle cx="70" cy="30" r="3" fill="#6a45d4"/><circle cx="100" cy="28" r="3" fill="#6a45d4"/><circle cx="130" cy="30" r="3" fill="#6a45d4"/>` +
      `<rect x="38" y="26" width="34" height="28" rx="11" fill="#ff8fb8" ${s("#e0508f")} transform="rotate(-12 55 40)"/>` +
      `<rect x="30" y="54" width="140" height="30" rx="10" fill="#b39bff" ${s("#6a45d4")}/>` +
      `<path d="M100 57 V81" stroke="#9b7af2" stroke-width="3"/>` +
      `<rect x="6" y="40" width="36" height="50" rx="15" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<rect x="158" y="40" width="36" height="50" rx="15" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<path d="M16 50 h14 M170 50 h14" stroke="#b39bff" stroke-width="4" stroke-linecap="round"/>` },

    mesa: { vb: "0 0 140 100", svg:
      `<rect x="22" y="52" width="10" height="46" rx="3" fill="#c98a4b" ${s("#a86b35", 2.5)}/>` +
      `<rect x="108" y="52" width="10" height="46" rx="3" fill="#c98a4b" ${s("#a86b35", 2.5)}/>` +
      `<path d="M10 48 Q10 40 18 40 H122 Q130 40 130 48 V60 ${"q-7.5 8 -15 0 ".repeat(8)}Z" fill="#ffc9e0" ${s("#e0508f")}/>` +
      `<path d="M20 47 H56" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>` +
      `<path d="M70 24 V12" ${s("#22a86c")}/><ellipse cx="76" cy="18" rx="5" ry="2.5" fill="#3ccf8c" transform="rotate(-30 76 18)"/>` +
      `<path d="M62 40 Q56 30 64 24 H76 Q84 30 78 40 Z" fill="#4db3ff" ${s("#2a8fdc")}/>` +
      alrededor(70, 9, 5, 5, 5, (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#ff6fae"/>`) +
      `<circle cx="70" cy="9" r="3" fill="#ffc83d"/>` },

    cuadro: { vb: "0 0 110 100", svg:
      `<path d="M28 18 L55 5 L82 18" fill="none" ${s("#a86b35", 2)}/>` +
      `<circle cx="55" cy="5" r="3" fill="#ffc83d" ${s("#e0a51c", 1.5)}/>` +
      `<rect x="4" y="14" width="102" height="82" rx="6" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<rect x="13" y="23" width="84" height="64" rx="3" fill="#bfe6ff"/>` +
      `<circle cx="78" cy="38" r="8" fill="#ffc83d"/>` +
      `<ellipse cx="32" cy="37" rx="9" ry="5" fill="#fff"/><ellipse cx="40" cy="34" rx="7" ry="5" fill="#fff"/>` +
      `<path d="M13 74 L36 48 L52 64 L64 52 L97 82 V87 H13 Z" fill="#b89cff"/>` +
      `<path d="M36 48 L30.5 54.5 L36 52.5 L41 55.5 Z M64 52 L59.5 56.5 L64 55 L68 57 Z" fill="#fff"/>` +
      `<path d="M13 87 V76 Q34 66 55 76 Q76 68 97 76 V87 Z" fill="#3ccf8c"/>` +
      `<rect x="13" y="23" width="84" height="64" rx="3" fill="none" ${s("#a86b35", 2)}/>` +
      `<circle cx="9" cy="19" r="2.5" fill="#ffc83d"/><circle cx="101" cy="19" r="2.5" fill="#ffc83d"/><circle cx="9" cy="91" r="2.5" fill="#ffc83d"/><circle cx="101" cy="91" r="2.5" fill="#ffc83d"/>` },

    globos: { vb: "0 0 100 150", svg:
      `<path d="M30 72 Q22 104 50 136 M70 68 Q80 102 50 136 M50 94 Q42 114 50 136" fill="none" ${s("#9a8aa8", 2)}/>` +
      `<ellipse cx="70" cy="36" rx="22" ry="27" fill="#4db3ff" ${s("#2a8fdc")}/>` +
      `<path d="M70 62 l-4 6 h8 z" fill="#4db3ff" ${s("#2a8fdc", 2)}/>` +
      `<ellipse cx="62" cy="24" rx="4.5" ry="8" fill="#fff" opacity=".55" transform="rotate(-20 62 24)"/>` +
      `<ellipse cx="30" cy="40" rx="22" ry="27" fill="#ff8fb8" ${s("#e0508f")}/>` +
      `<path d="M30 66 l-4 6 h8 z" fill="#ff8fb8" ${s("#e0508f", 2)}/>` +
      `<ellipse cx="22" cy="28" rx="4.5" ry="8" fill="#fff" opacity=".55" transform="rotate(-20 22 28)"/>` +
      `<ellipse cx="50" cy="62" rx="22" ry="27" fill="#ffd95a" ${s("#e0a51c")}/>` +
      `<path d="M50 88 l-4 6 h8 z" fill="#ffd95a" ${s("#e0a51c", 2)}/>` +
      `<ellipse cx="42" cy="50" rx="4.5" ry="8" fill="#fff" opacity=".6" transform="rotate(-20 42 50)"/>` +
      `<rect x="40" y="132" width="20" height="16" rx="4" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<path d="M50 133 V147" stroke="#efe8ff" stroke-width="2.5"/>` +
      `<path d="M50 132 l-7 -5 v9 z M50 132 l7 -5 v9 z" fill="#ff6fae" ${s("#e0508f", 1.5)}/>` },

    pecera: { vb: "0 0 110 110", svg:
      `<rect x="28" y="98" width="54" height="10" rx="3" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<path d="M34 18 C2 34 2 94 34 102 H76 C108 94 108 34 76 18 Z" fill="#e2f4ff" ${s("#2a8fdc")}/>` +
      `<path d="M15 46 C11 72 17 92 36 99 H74 C93 92 99 72 95 46 Z" fill="#4db3ff" opacity=".5"/>` +
      `<path d="M15 46 q10 -5 20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>` +
      `<path d="M28 98 Q22 86 28 76 Q34 66 28 58" fill="none" ${s("#3ccf8c", 4)}/>` +
      `<path d="M35 98 Q40 88 35 80" fill="none" ${s("#22a86c", 3)}/>` +
      `<circle cx="45" cy="97" r="4" fill="#ffc9e0"/><circle cx="53" cy="98" r="3.5" fill="#b89cff"/><circle cx="62" cy="97" r="4" fill="#ffc83d"/><circle cx="71" cy="98" r="3" fill="#ff8fb8"/>` +
      `<path d="M66 71 L79 62 V80 Z" fill="#ff9a4d" ${s("#e07a2d", 2.5)}/>` +
      `<path d="M50 63 Q56 54 62 63 Z" fill="#ffc83d" ${s("#e07a2d", 2)}/>` +
      `<ellipse cx="55" cy="71" rx="14" ry="10" fill="#ff9a4d" ${s("#e07a2d", 2.5)}/>` +
      ojo(48, 69, 2.6, 3.2) + mej(47, 75, 3, 2) +
      `<circle cx="42" cy="54" r="3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="37" cy="41" r="2.2" fill="none" stroke="#bfe6ff" stroke-width="2"/>` +
      `<path d="M22 52 Q18 66 23 82" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>` +
      `<ellipse cx="55" cy="18" rx="22" ry="5" fill="#efe8ff" ${s("#2a8fdc")}/>` },

    piano: { vb: "0 0 150 120", svg:
      `<rect x="20" y="100" width="10" height="18" rx="3" fill="#6a45d4"/><rect x="120" y="100" width="10" height="18" rx="3" fill="#6a45d4"/>` +
      `<rect x="14" y="74" width="122" height="34" rx="6" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<path d="M75 96 l-7 -7 a4.5 4.5 0 0 1 7 -5.5 a4.5 4.5 0 0 1 7 5.5 z" fill="#ffc9e0"/>` +
      `<circle cx="64" cy="103" r="2.5" fill="#ffc83d"/><circle cx="86" cy="103" r="2.5" fill="#ffc83d"/>` +
      `<rect x="14" y="10" width="122" height="52" rx="8" fill="#8a63f0" ${s("#6a45d4")}/>` +
      `<rect x="8" y="4" width="134" height="12" rx="6" fill="#9b7af2" ${s("#6a45d4")}/>` +
      `<rect x="56" y="22" width="38" height="28" rx="3" fill="#fff" ${s("#d9d0e2", 2)}/>` +
      `<path d="M66 42 V30 L82 27 V39" fill="none" ${s("#46304f", 2)}/><circle cx="63.5" cy="42" r="3" fill="#46304f"/><circle cx="79.5" cy="39" r="3" fill="#46304f"/>` +
      `<rect x="6" y="58" width="138" height="20" rx="4" fill="#fff" ${s("#6a45d4")}/>` +
      `<path d="M19.8 60 V76 M33.6 60 V76 M47.4 60 V76 M61.2 60 V76 M75 60 V76 M88.8 60 V76 M102.6 60 V76 M116.4 60 V76 M130.2 60 V76" stroke="#d9d0e2" stroke-width="1.5"/>` +
      [19.8, 33.6, 61.2, 75, 88.8, 116.4, 130.2].map(x => `<rect x="${n1(x - 3.5)}" y="59.5" width="7" height="11" rx="1.5" fill="#46304f"/>`).join("") },

    libros: { vb: "0 0 120 100", svg:
      `<rect x="10" y="88" width="12" height="10" rx="3" fill="#a86b35"/><rect x="98" y="88" width="12" height="10" rx="3" fill="#a86b35"/>` +
      `<rect x="4" y="4" width="112" height="88" rx="6" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<rect x="12" y="12" width="96" height="32" rx="2" fill="#a86b35"/><rect x="12" y="52" width="96" height="32" rx="2" fill="#a86b35"/>` +
      libroR(15, 18, 11, 26, "#ff6fae", "#e0508f") + libroR(27, 22, 9, 22, "#4db3ff", "#2a8fdc") +
      libroR(37, 15, 13, 29, "#8a63f0", "#6a45d4") + libroR(51, 20, 9, 24, "#3ccf8c", "#22a86c") +
      `<path d="M61 44 L70 19 L78 22 L69 44 Z" fill="#ffc83d" ${s("#e0a51c", 2)}/>` +
      `<circle cx="90" cy="31" r="5" fill="#3ccf8c" ${s("#22a86c", 2)}/><circle cx="98" cy="30" r="5" fill="#3ccf8c" ${s("#22a86c", 2)}/><circle cx="94" cy="25" r="5" fill="#3ccf8c" ${s("#22a86c", 2)}/>` +
      `<path d="M86 36 H102 L100 44 H88 Z" fill="#ff9a4d" ${s("#e07a2d", 2)}/>` +
      `<path d="M16 23 h9 M16 38 h9 M38 20 h11 M38 38 h11" stroke="#fff" stroke-width="2" opacity=".6"/>` +
      libroR(14, 76, 30, 8, "#4db3ff", "#2a8fdc") + libroR(16, 68, 26, 8, "#ff6fae", "#e0508f") + libroR(18, 60, 22, 8, "#ffc83d", "#e0a51c") +
      libroR(48, 58, 10, 26, "#8a63f0", "#6a45d4") + libroR(59, 62, 9, 22, "#3ccf8c", "#22a86c") + libroR(69, 56, 12, 28, "#ff9a4d", "#e07a2d") +
      `<path d="M49 62 h8 M70 60 h10 M70 78 h10" stroke="#fff" stroke-width="2" opacity=".6"/>` +
      `<circle cx="95" cy="69" r="10" fill="#bfe6ff" ${s("#2a8fdc", 2)}/>` +
      `<path d="${estrellaD(95, 70, 5, 2.2)}" fill="#ffc83d"/>` +
      `<path d="M86 84 V78 H104 V84 Z" fill="#6a45d4" ${s("#6a45d4", 2)}/>` },
  };

  // =====================================================================
  // MASCOTAS (sentadas, de frente)
  // =====================================================================
  const alaMariposa =
    `<path d="M58 58 C40 18 6 16 10 44 C12 62 36 70 58 66 Z" fill="#ff8fb8" ${s("#e0508f", 2.5)}/>` +
    `<path d="M58 68 C40 70 16 84 24 100 C32 114 54 102 58 80 Z" fill="#b89cff" ${s("#8a63f0", 2.5)}/>` +
    `<circle cx="27" cy="39" r="7" fill="#fff" opacity=".7"/><circle cx="40" cy="52" r="4" fill="#ffc83d"/><circle cx="36" cy="92" r="5" fill="#efe8ff"/>`;
  const orejaPerro = `<path d="M38 30 C22 30 14 54 20 68 C24 76 34 72 36 60 Z" fill="#c98a4b" ${s("#a86b35", 2.5)}/>`;
  const orejaConejo = `<path d="M46 44 C34 26 34 4 44 3 C54 2 56 26 54 44 Z" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/><path d="M46 38 C40 24 40 10 44 9 C49 9 50 24 50 38 Z" fill="#ffc9e0"/>`;
  const alaPollito = `<path d="M24 66 Q10 78 20 94 Q30 90 30 76 Z" fill="#ffc83d" ${s("#e0a51c", 2.5)}/>`;
  const orejaUni = `<path d="M40 44 L34 22 L52 36 Z" fill="#fdfaff" ${s("#cdb8ee", 2.5)}/><path d="M41 38 L38 27 L47 35 Z" fill="#ffc9e0"/>`;

  A.MASCOTAS = {
    mariposa: { vb: "0 0 120 120", svg:
      alaMariposa + esp(120, alaMariposa) +
      `<path d="M54 34 Q48 16 38 12 M66 34 Q72 16 82 12" fill="none" ${s("#6a45d4", 2.5)}/>` +
      `<circle cx="38" cy="12" r="4" fill="#ff6fae"/><circle cx="82" cy="12" r="4" fill="#ff6fae"/>` +
      `<ellipse cx="60" cy="84" rx="9" ry="26" fill="#8a63f0" ${s("#6a45d4", 2.5)}/>` +
      `<path d="M53 80 H67 M53 92 H67" stroke="#b89cff" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="60" cy="46" r="16" fill="#efe8ff" ${s("#8a63f0", 2.5)}/>` +
      ojo(54, 45, 3.5, 4.5) + ojo(66, 45, 3.5, 4.5) + mej(49, 52, 3.5, 2.5) + mej(71, 52, 3.5, 2.5) +
      `<path d="M56 53 Q60 57 64 53" fill="none" ${s("#6a45d4", 2)}/>` },

    perrito: { vb: "0 0 120 120", svg:
      `<path d="M86 100 Q108 98 104 74 Q100 70 96 75 Q98 90 84 92 Z" fill="#f6d2a8" ${s("#c98a4b", 2.5)}/>` +
      `<ellipse cx="60" cy="94" rx="30" ry="22" fill="#f6d2a8" ${s("#c98a4b", 2.5)}/>` +
      `<ellipse cx="60" cy="100" rx="16" ry="13" fill="#fff4e6"/>` +
      `<ellipse cx="47" cy="112" rx="10" ry="6.5" fill="#fff4e6" ${s("#c98a4b", 2.5)}/>` +
      `<ellipse cx="73" cy="112" rx="10" ry="6.5" fill="#fff4e6" ${s("#c98a4b", 2.5)}/>` +
      `<path d="M36 78 Q60 94 84 78" fill="none" ${s("#ff6fae", 5)}/>` +
      `<circle cx="60" cy="88" r="4.5" fill="#ffc83d" ${s("#e0a51c", 2)}/>` +
      `<circle cx="60" cy="52" r="30" fill="#f6d2a8" ${s("#c98a4b", 2.5)}/>` +
      `<ellipse cx="72" cy="46" rx="10" ry="9" fill="#e8b884"/>` +
      orejaPerro + esp(120, orejaPerro) +
      `<ellipse cx="60" cy="66" rx="14" ry="10" fill="#fff4e6"/>` +
      ojo(48, 48, 5, 6) + ojo(72, 48, 5, 6) + mej(41, 60, 5, 3.5) + mej(79, 60, 5, 3.5) +
      `<path d="M57 70 Q60 77 63 70 Z" fill="#ff8fb8"/>` +
      `<path d="M60 63 V67 M60 67 Q55 72 51 68 M60 67 Q65 72 69 68" fill="none" ${s("#46304f", 2)}/>` +
      `<ellipse cx="60" cy="60" rx="6" ry="4.5" fill="#46304f"/><circle cx="58" cy="58.6" r="1.5" fill="#fff"/>` },

    conejo: { vb: "0 0 120 120", svg:
      `<circle cx="88" cy="104" r="9" fill="#fff" ${s("#b9a5e8", 2.5)}/>` +
      orejaConejo + esp(120, orejaConejo) +
      `<ellipse cx="60" cy="98" rx="28" ry="19" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/>` +
      `<ellipse cx="44" cy="113" rx="12" ry="5" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/>` +
      `<ellipse cx="76" cy="113" rx="12" ry="5" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/>` +
      `<circle cx="60" cy="62" r="26" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/>` +
      `<ellipse cx="51" cy="93" rx="6" ry="7" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/>` +
      `<ellipse cx="69" cy="93" rx="6" ry="7" fill="#f7f2ff" ${s("#b9a5e8", 2.5)}/>` +
      ojo(50, 60, 4.5, 5.5) + ojo(70, 60, 4.5, 5.5) + mej(42, 70, 5, 3.5) + mej(78, 70, 5, 3.5) +
      `<rect x="57.5" y="74.5" width="5" height="4.5" rx="1" fill="#fff" ${s("#b9a5e8", 1.2)}/>` +
      `<path d="M60 72 V74.5 M60 74.5 Q56.5 77 54 74.5 M60 74.5 Q63.5 77 66 74.5" fill="none" ${s("#9c86c8", 2)}/>` +
      `<path d="M56.5 68 H63.5 L60 72 Z" fill="#ff8fb8" ${s("#ff8fb8", 1.5)}/>` },

    pajaro: { vb: "0 0 120 120", svg:
      `<path d="M49 108 V117 M44 117 H54 M71 108 V117 M66 117 H76" ${s("#ff9a4d", 3)}/>` +
      `<path d="M56 30 Q50 14 58 13 Q60 21 62 27 Q64 15 72 17 Q67 23 64 30 Z" fill="#ffc83d" ${s("#e0a51c", 2.5)}/>` +
      `<ellipse cx="60" cy="68" rx="40" ry="42" fill="#ffe07a" ${s("#e0a51c", 2.5)}/>` +
      `<ellipse cx="60" cy="86" rx="24" ry="20" fill="#fff3c4"/>` +
      alaPollito + esp(120, alaPollito) +
      ojo(47, 56, 5, 6) + ojo(73, 56, 5, 6) + mej(38, 68, 6, 4, "#ffb3cf") + mej(82, 68, 6, 4, "#ffb3cf") +
      `<path d="M53 63 H67 L60 72 Z" fill="#ff9a4d" ${s("#e07a2d", 2)}/>` },

    tortuga: { vb: "0 0 120 120", svg:
      `<path d="M112 92 L119 98 L112 102 Z" fill="#bdf0d3" ${s("#22a86c", 2)}/>` +
      `<ellipse cx="100" cy="108" rx="12" ry="9" fill="#bdf0d3" ${s("#22a86c", 2.5)}/>` +
      `<path d="M24 92 Q24 34 72 34 Q118 34 116 92 Z" fill="#3ccf8c" ${s("#22a86c", 2.5)}/>` +
      `<path d="M64 48 L84 48 L94 62 L84 76 L64 76 L56 62 Z" fill="#7fe0b0" ${s("#22a86c", 2)}/>` +
      `<ellipse cx="106" cy="64" rx="5" ry="11" fill="#7fe0b0" ${s("#22a86c", 2)}/>` +
      `<path d="M86 41 Q98 42 105 50" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>` +
      `<rect x="20" y="86" width="98" height="12" rx="6" fill="#ffe07a" ${s("#e0a51c", 2.5)}/>` +
      `<ellipse cx="44" cy="108" rx="12" ry="9" fill="#bdf0d3" ${s("#22a86c", 2.5)}/>` +
      `<circle cx="32" cy="66" r="22" fill="#bdf0d3" ${s("#22a86c", 2.5)}/>` +
      ojo(24, 62, 4.5, 5.5) + ojo(40, 62, 4.5, 5.5) + mej(18, 72, 4.5, 3) + mej(46, 72, 4.5, 3) +
      `<path d="M27 75 Q32 80 37 75" fill="none" ${s("#22a86c", 2.5)}/>` },

    unicornio: { vb: "0 0 120 120", svg:
      `<circle cx="94" cy="80" r="6.5" fill="#bfe6ff" ${s("#2a8fdc", 2)}/>` +
      `<circle cx="97" cy="91" r="8" fill="#b89cff" ${s("#8a63f0", 2)}/>` +
      `<circle cx="91" cy="103" r="9" fill="#ff8fb8" ${s("#e0508f", 2)}/>` +
      `<ellipse cx="60" cy="98" rx="28" ry="18" fill="#fdfaff" ${s("#cdb8ee", 2.5)}/>` +
      `<ellipse cx="46" cy="112" rx="9" ry="6" fill="#b89cff" ${s("#8a63f0", 2.5)}/>` +
      `<ellipse cx="74" cy="112" rx="9" ry="6" fill="#b89cff" ${s("#8a63f0", 2.5)}/>` +
      `<circle cx="36" cy="84" r="8" fill="#bfe6ff" ${s("#2a8fdc", 2)}/>` +
      `<circle cx="32" cy="68" r="9" fill="#b89cff" ${s("#8a63f0", 2)}/>` +
      `<circle cx="36" cy="52" r="9" fill="#ff8fb8" ${s("#e0508f", 2)}/>` +
      orejaUni + esp(120, orejaUni) +
      `<path d="M54 36 L60 4 L66 36 Z" fill="#ffe07a" ${s("#e0a51c", 2.5)}/>` +
      `<path d="M56 27 L64.5 25 M57.5 18 L62.8 16.5" ${s("#e0a51c", 2)}/>` +
      `<ellipse cx="60" cy="62" rx="27" ry="26" fill="#fdfaff" ${s("#cdb8ee", 2.5)}/>` +
      `<circle cx="61" cy="37" r="7" fill="#b89cff" ${s("#8a63f0", 2)}/>` +
      `<circle cx="50" cy="39" r="8" fill="#ff8fb8" ${s("#e0508f", 2)}/>` +
      `<ellipse cx="60" cy="76" rx="15" ry="10" fill="#ffe0ee"/>` +
      `<ellipse cx="55" cy="75" rx="1.8" ry="2.5" fill="#e0508f"/><ellipse cx="65" cy="75" rx="1.8" ry="2.5" fill="#e0508f"/>` +
      `<path d="M54 81 Q60 85 66 81" fill="none" ${s("#e0508f", 2)}/>` +
      ojo(49, 60, 5, 6) + ojo(71, 60, 5, 6) +
      `<path d="M44.5 57 l-3.5 -2 M75.5 57 l3.5 -2" ${s("#46304f", 2)}/>` +
      mej(40, 69, 5, 3.5) + mej(80, 69, 5, 3.5) },
  };

  // =====================================================================
  // PERSONAJES EXTRA (cuerpo entero, tamaño de Pelu 200x215)
  // =====================================================================
  const penachoBuho = `<path d="M56 72 L40 28 L84 56 Z" fill="#c98a4b" ${s("#a86b35")}/>`;
  const alaBuho = `<path d="M44 118 Q18 160 46 196 Q60 164 56 124 Z" fill="#a86b35" ${s("#8a5526")}/>`;
  const piesBuho = x => `<circle cx="${x - 10}" cy="205" r="6" fill="#ffc83d" ${s("#e0a51c", 2.5)}/><circle cx="${x + 10}" cy="205" r="6" fill="#ffc83d" ${s("#e0a51c", 2.5)}/><circle cx="${x}" cy="207" r="6" fill="#ffc83d" ${s("#e0a51c", 2.5)}/>`;
  const cejaTortu = `<path d="M66 56 Q68 44 80 46 Q88 42 94 52 Q82 54 66 56 Z" fill="#fff" ${s("#cfc6d6", 2)}/>`;
  const manchaTortu = `<circle cx="46" cy="124" r="8" fill="#7fe0b0" ${s("#22a86c", 2)}/><circle cx="42" cy="150" r="8" fill="#7fe0b0" ${s("#22a86c", 2)}/><circle cx="50" cy="176" r="7" fill="#7fe0b0" ${s("#22a86c", 2)}/>`;
  const alaDraco = `<path d="M64 146 Q34 112 20 132 Q32 134 28 148 Q42 144 44 158 Q54 150 66 154 Z" fill="#b89cff" ${s("#8a63f0")}/>`;
  const cuernoDraco = `<path d="M70 50 L60 18 L86 40 Z" fill="#ffe07a" ${s("#e0a51c")}/>`;
  const orejaChango = `<circle cx="44" cy="94" r="20" fill="#c98a4b" ${s("#a86b35")}/><circle cx="44" cy="94" r="11" fill="#f6dcbc"/>`;

  A.PERSONAJES_EXTRA = {
    buho: { vb: "0 0 200 215", svg:
      penachoBuho + esp(200, penachoBuho) +
      `<ellipse cx="100" cy="130" rx="60" ry="76" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<ellipse cx="100" cy="156" rx="40" ry="44" fill="#f6e0c4"/>` +
      `<path d="M86 140 q7 7 14 0 M100 140 q7 7 14 0 M79 156 q7 7 14 0 M93 156 q7 7 14 0 M107 156 q7 7 14 0 M86 172 q7 7 14 0 M100 172 q7 7 14 0" fill="none" ${s("#e0b98a", 2.5)}/>` +
      `<circle cx="77" cy="100" r="27" fill="#f6e0c4" ${s("#e0b98a", 2.5)}/>` +
      `<circle cx="123" cy="100" r="27" fill="#f6e0c4" ${s("#e0b98a", 2.5)}/>` +
      ojo(77, 100, 11, 13) + ojo(123, 100, 11, 13) +
      `<path d="M55 96 L44 88 M145 96 L156 88 M98 97 Q100 92 102 97" fill="none" ${s("#46304f", 4)}/>` +
      `<circle cx="77" cy="100" r="22" fill="#fff" fill-opacity=".15" ${s("#46304f", 4)}/>` +
      `<circle cx="123" cy="100" r="22" fill="#fff" fill-opacity=".15" ${s("#46304f", 4)}/>` +
      `<path d="M91 120 H109 L100 134 Z" fill="#ffc83d" ${s("#e0a51c", 2.5)}/>` +
      mej(56, 128, 8, 5.5) + mej(144, 128, 8, 5.5) +
      alaBuho + esp(200, alaBuho) +
      piesBuho(80) + piesBuho(120) +
      `<rect x="76" y="46" width="48" height="14" rx="4" fill="#46304f"/>` +
      `<path d="M56 42 L100 26 L144 42 L100 58 Z" fill="#5a3f66" ${s("#46304f")}/>` +
      `<path d="M100 42 Q128 42 136 58" fill="none" ${s("#ffc83d", 3)}/>` +
      `<circle cx="100" cy="42" r="3.5" fill="#ffc83d"/>` +
      `<path d="M132 58 H140 L142 70 H130 Z" fill="#ffc83d" ${s("#e0a51c", 2)}/>` },

    tortu: { vb: "0 0 200 215", svg:
      `<ellipse cx="100" cy="142" rx="64" ry="58" fill="#3ccf8c" ${s("#22a86c")}/>` +
      manchaTortu + esp(200, manchaTortu) +
      `<ellipse cx="78" cy="196" rx="18" ry="14" fill="#bdf0d3" ${s("#22a86c")}/>` +
      `<ellipse cx="122" cy="196" rx="18" ry="14" fill="#bdf0d3" ${s("#22a86c")}/>` +
      `<path d="M70 206 v3 M78 207 v3 M86 206 v3 M114 206 v3 M122 207 v3 M130 206 v3" ${s("#22a86c", 2)}/>` +
      `<ellipse cx="52" cy="150" rx="11" ry="22" fill="#bdf0d3" ${s("#22a86c")} transform="rotate(28 52 150)"/>` +
      `<ellipse cx="100" cy="146" rx="42" ry="48" fill="#ffe89a" ${s("#e0a51c")}/>` +
      `<path d="M64 130 H136 M62 150 H138 M68 170 H132 M100 100 V192" ${s("#e0a51c", 2)}/>` +
      `<path d="M162 206 V124 Q162 106 147 106 Q134 106 134 118" fill="none" ${s("#a86b35", 9)}/>` +
      `<path d="M162 206 V124 Q162 106 147 106 Q134 106 134 118" fill="none" ${s("#c98a4b", 5)}/>` +
      `<ellipse cx="150" cy="148" rx="11" ry="22" fill="#bdf0d3" ${s("#22a86c")} transform="rotate(-28 150 148)"/>` +
      `<circle cx="161" cy="166" r="10" fill="#bdf0d3" ${s("#22a86c")}/>` +
      `<circle cx="100" cy="70" r="44" fill="#bdf0d3" ${s("#22a86c")}/>` +
      cejaTortu + esp(200, cejaTortu) +
      ojo(82, 70, 9, 10) + ojo(118, 70, 9, 10) + mej(68, 88, 8, 5) + mej(132, 88, 8, 5) +
      `<circle cx="95" cy="84" r="1.8" fill="#22a86c"/><circle cx="105" cy="84" r="1.8" fill="#22a86c"/>` +
      `<path d="M92 101 Q100 108 108 101" fill="none" ${s("#22a86c")}/>` +
      `<path d="M100 92 Q88 84 78 92 Q86 100 100 95 Q114 100 122 92 Q112 84 100 92 Z" fill="#fff" ${s("#cfc6d6", 2)}/>` +
      `<path d="M100 118 L86 110 V126 Z M100 118 L114 110 V126 Z" fill="#ff6fae" ${s("#e0508f", 2.5)}/>` +
      `<circle cx="100" cy="118" r="4" fill="#e0508f"/>` },

    espejo: { vb: "0 0 200 215", svg:
      `<path d="M58 212 Q60 198 100 196 Q140 198 142 212 Z" fill="#a797c4" ${s("#6d5a86")}/>` +
      `<rect x="92" y="160" width="16" height="40" rx="5" fill="#a797c4" ${s("#6d5a86")}/>` +
      `<rect x="88" y="178" width="24" height="8" rx="4" fill="#c8b6f5" ${s("#6d5a86", 2.5)}/>` +
      `<path d="M76 22 Q80 4 100 10 Q120 4 124 22 Z" fill="#a797c4" ${s("#6d5a86")}/>` +
      `<circle cx="100" cy="14" r="5" fill="#8a63f0" ${s("#6a45d4", 2)}/>` +
      `<ellipse cx="100" cy="92" rx="62" ry="76" fill="#a797c4" ${s("#6d5a86")}/>` +
      alrededor(100, 92, 56, 70, 20, (x, y) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#efe8ff"/>`) +
      `<circle cx="36" cy="92" r="7" fill="#c8b6f5" ${s("#6d5a86", 2.5)}/>` +
      `<circle cx="164" cy="92" r="7" fill="#c8b6f5" ${s("#6d5a86", 2.5)}/>` +
      `<circle cx="100" cy="168" r="7" fill="#c8b6f5" ${s("#6d5a86", 2.5)}/>` +
      `<ellipse cx="100" cy="92" rx="48" ry="64" fill="#d6def2" ${s("#6d5a86")}/>` +
      `<ellipse cx="100" cy="126" rx="36" ry="15" fill="#fff" opacity=".25"/>` +
      `<path d="M72 134 q9 -7 18 0 t18 0 t18 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>` +
      `<path d="M76 70 q8 -6 16 -2 M108 68 q8 -4 16 2" fill="none" stroke="#6d5a86" stroke-width="3" stroke-linecap="round" opacity=".3"/>` +
      `<ellipse cx="84" cy="86" rx="7" ry="10" fill="#6d5a86" opacity=".35"/>` +
      `<ellipse cx="116" cy="86" rx="7" ry="10" fill="#6d5a86" opacity=".35"/>` +
      `<ellipse cx="100" cy="112" rx="6" ry="8" fill="#6d5a86" opacity=".3"/>` +
      `<path d="M66 60 Q58 80 62 106" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>` +
      `<circle cx="71" cy="49" r="2.5" fill="#fff" opacity=".75"/>` +
      `<path d="${chispaD(130, 50, 7)}" fill="#fff" opacity=".85"/>` },

    chango: { vb: "0 0 200 215", svg:
      `<path d="M134 186 Q182 196 182 158 Q182 138 164 140 Q154 142 158 154" fill="none" ${s("#a86b35", 10)}/>` +
      `<path d="M134 186 Q182 196 182 158 Q182 138 164 140 Q154 142 158 154" fill="none" ${s("#c98a4b", 5)}/>` +
      `<ellipse cx="100" cy="172" rx="42" ry="34" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<ellipse cx="100" cy="176" rx="26" ry="22" fill="#f6dcbc"/>` +
      `<ellipse cx="78" cy="203" rx="16" ry="9" fill="#f6dcbc" ${s("#a86b35")}/>` +
      `<ellipse cx="122" cy="203" rx="16" ry="9" fill="#f6dcbc" ${s("#a86b35")}/>` +
      `<ellipse cx="54" cy="166" rx="11" ry="26" fill="#c98a4b" ${s("#a86b35")} transform="rotate(28 54 166)"/>` +
      `<path d="M32 198 Q14 184 22 158 Q28 172 40 178 Q50 184 50 194 Z" fill="#ffe07a" ${s("#e0a51c")}/>` +
      `<circle cx="22" cy="158" r="2.5" fill="#a86b35"/>` +
      `<circle cx="42" cy="188" r="9" fill="#f6dcbc" ${s("#a86b35")}/>` +
      `<ellipse cx="146" cy="168" rx="11" ry="26" fill="#c98a4b" ${s("#a86b35")} transform="rotate(-22 146 168)"/>` +
      `<circle cx="156" cy="190" r="9" fill="#f6dcbc" ${s("#a86b35")}/>` +
      orejaChango + esp(200, orejaChango) +
      `<path d="M92 42 Q90 24 104 26 Q98 32 110 40 Z" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<circle cx="100" cy="92" r="54" fill="#c98a4b" ${s("#a86b35")}/>` +
      `<circle cx="80" cy="88" r="22" fill="#f6dcbc"/><circle cx="120" cy="88" r="22" fill="#f6dcbc"/>` +
      `<ellipse cx="100" cy="118" rx="36" ry="24" fill="#f6dcbc"/>` +
      ojo(82, 90, 10, 12) + ojo(118, 90, 10, 12) + mej(68, 116, 9, 6) + mej(132, 116, 9, 6) +
      `<ellipse cx="95" cy="110" rx="2.5" ry="2" fill="#a86b35"/><ellipse cx="105" cy="110" rx="2.5" ry="2" fill="#a86b35"/>` +
      `<path d="M84 122 Q100 136 116 122" fill="none" ${s("#a86b35")}/>` },

    draco: { vb: "0 0 200 215", svg:
      `<path d="M130 188 Q168 206 178 176" fill="none" ${s("#22a86c", 16)}/>` +
      `<path d="M130 188 Q168 206 178 176" fill="none" ${s("#3ccf8c", 10)}/>` +
      `<path d="M168 178 L186 156 L192 184 Z" fill="#ff9a4d" ${s("#e07a2d")}/>` +
      alaDraco + esp(200, alaDraco) +
      `<ellipse cx="100" cy="168" rx="44" ry="38" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<ellipse cx="100" cy="172" rx="28" ry="28" fill="#ffe89a" ${s("#e0a51c", 2.5)}/>` +
      `<path d="M80 162 H120 M78 176 H122 M82 190 H118" ${s("#e0a51c", 2)}/>` +
      `<ellipse cx="78" cy="203" rx="16" ry="9" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<ellipse cx="122" cy="203" rx="16" ry="9" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<circle cx="70" cy="207" r="2" fill="#fff"/><circle cx="78" cy="209" r="2" fill="#fff"/><circle cx="86" cy="207" r="2" fill="#fff"/>` +
      `<circle cx="114" cy="207" r="2" fill="#fff"/><circle cx="122" cy="209" r="2" fill="#fff"/><circle cx="130" cy="207" r="2" fill="#fff"/>` +
      `<ellipse cx="62" cy="160" rx="9" ry="16" fill="#3ccf8c" ${s("#22a86c")} transform="rotate(30 62 160)"/>` +
      `<ellipse cx="138" cy="160" rx="9" ry="16" fill="#3ccf8c" ${s("#22a86c")} transform="rotate(-30 138 160)"/>` +
      cuernoDraco + esp(200, cuernoDraco) +
      `<path d="M90 40 L100 25 L110 40 Z" fill="#ff9a4d" ${s("#e07a2d")}/>` +
      `<circle cx="100" cy="88" r="52" fill="#3ccf8c" ${s("#22a86c")}/>` +
      `<path d="M62 60 Q72 46 88 42" fill="none" stroke="#7fe0b0" stroke-width="5" stroke-linecap="round"/>` +
      ojo(80, 86, 11, 13) + ojo(120, 86, 11, 13) + mej(64, 106, 9, 6) + mej(136, 106, 9, 6) +
      `<circle cx="94" cy="106" r="2" fill="#22a86c"/><circle cx="106" cy="106" r="2" fill="#22a86c"/>` +
      `<path d="M84 116 Q100 130 116 116" fill="none" ${s("#22a86c")}/>` +
      `<path d="M104.5 122.4 L107.5 127.5 L110 120.4 Z" fill="#fff" ${s("#22a86c", 1.5)}/>` },
  };

  // =====================================================================
  // LUGARES (iconos 64x64 para las tarjetas del menú)
  // =====================================================================
  A.LUGARES = {
    casa: { vb: "0 0 64 64", svg:
      `<rect x="42" y="12" width="7" height="14" rx="1.5" fill="#d9a3bf" ${s("#b97f9f", 2)}/>` +
      `<rect x="12" y="28" width="40" height="28" rx="3" fill="#ffe6f1" ${s("#f0a8c8", 2.2)}/>` +
      `<path d="M5 32 L32 9 L59 32 Z" fill="#ff6fae" ${s("#e0508f", 2.2)}/>` +
      `<path d="M32 27 l-4 -4 a2.6 2.6 0 0 1 4 -3.4 a2.6 2.6 0 0 1 4 3.4 z" fill="#fff"/>` +
      `<path d="M27 56 V44 Q32 38 37 44 V56 Z" fill="#a67be8" ${s("#8a63f0", 2)}/>` +
      `<circle cx="34.5" cy="50" r="1.2" fill="#ffc83d"/>` +
      `<circle cx="20" cy="41" r="4.5" fill="#c6ebff" ${s("#fff", 2)}/>` +
      `<rect x="40" y="37" width="9" height="9" rx="2" fill="#c6ebff" ${s("#fff", 2)}/>` +
      `<rect x="6" y="55" width="52" height="4" rx="2" fill="#3ccf8c"/>` },

    jardin: { vb: "0 0 64 64", svg:
      `<path d="M20 46 V26 M32 46 V18 M44 46 V26" ${s("#22a86c", 2.5)}/>` +
      `<path d="M20 42 Q12 38 12 30 Q20 32 20 42 Z M44 42 Q52 38 52 30 Q44 32 44 42 Z M32 42 Q40 36 38 28 Q32 32 32 42 Z" fill="#3ccf8c" ${s("#22a86c", 1.8)}/>` +
      tulipa(20, 24, "#ff8fb8", "#e0508f") + tulipa(32, 15, "#ffd95a", "#e0a51c") + tulipa(44, 24, "#b89cff", "#8a63f0") +
      `<rect x="8" y="45" width="48" height="14" rx="3" fill="#c98a4b" ${s("#a86b35", 2.2)}/>` +
      `<path d="M10 52 H54" ${s("#a86b35", 1.5)}/>` },

    cocina: { vb: "0 0 64 64", svg:
      `<ellipse cx="32" cy="57" rx="12" ry="3.5" fill="#c8b6f5" ${s("#8a63f0", 2)}/>` +
      `<rect x="29" y="48" width="6" height="9" fill="#c8b6f5" ${s("#8a63f0", 2)}/>` +
      `<ellipse cx="32" cy="48" rx="24" ry="4.5" fill="#efe8ff" ${s("#8a63f0", 2.2)}/>` +
      `<path d="M19 32 H45 L41 46 H23 Z" fill="#ffe07a" ${s("#e0a51c", 2.2)}/>` +
      `<path d="M25.5 34 L27 44.5 M32 34 V44.5 M38.5 34 L37 44.5" ${s("#e0a51c", 1.5)}/>` +
      `<path d="M17 33 Q14 26 21 24 Q21 14 32 13 Q43 14 43 24 Q50 26 47 33 Z" fill="#ffc9e0" ${s("#e0508f", 2.2)}/>` +
      `<path d="M22 28 Q32 32 42 28" fill="none" ${s("#e0508f", 1.5)}/>` +
      `<path d="M24 21 l2.5 -1" ${s("#4db3ff", 2)}/><path d="M37 19 l2 1.5" ${s("#8a63f0", 2)}/><path d="M29 24 l1.5 1.5" ${s("#3ccf8c", 2)}/><path d="M40 25 l-1 2" ${s("#4db3ff", 2)}/>` +
      `<path d="M32 9 Q34 5 37 4" fill="none" ${s("#22a86c", 1.5)}/>` +
      `<circle cx="32" cy="11" r="4" fill="#ff5a7a" ${s("#e0508f", 2)}/><circle cx="30.8" cy="9.8" r="1.2" fill="#fff"/>` },

    lago: { vb: "0 0 64 64", svg:
      `<circle cx="12" cy="12" r="6" fill="#ffc83d" ${s("#e0a51c", 1.8)}/>` +
      `<ellipse cx="32" cy="46" rx="28" ry="13" fill="#4db3ff" ${s("#2a8fdc", 2.2)}/>` +
      `<ellipse cx="38" cy="43" rx="15" ry="5" fill="#86d0f5"/>` +
      `<path d="M12 50 q4 -3 8 0 M40 55 q4 -3 8 0" fill="none" ${s("#fff", 1.8)}/>` +
      `<rect x="10" y="32" width="4" height="16" rx="1" fill="#a86b35"/><rect x="26" y="32" width="4" height="16" rx="1" fill="#a86b35"/>` +
      `<rect x="4" y="28" width="30" height="7" rx="2" fill="#c98a4b" ${s("#a86b35", 2)}/>` +
      `<path d="M12 29 V34 M20 29 V34 M28 29 V34" ${s("#a86b35", 1.2)}/>` +
      `<path d="M30 28 L50 8" ${s("#a86b35", 2.5)}/>` +
      `<path d="M50 8 V38" stroke="#46304f" stroke-width="1" opacity=".7"/>` +
      `<circle cx="50" cy="40" r="3" fill="#ff6fae" ${s("#e0508f", 1.5)}/>` +
      `<path d="M43 52 l4 -3 v6 z" fill="#ff9a4d" ${s("#e07a2d", 1.5)}/>` +
      `<ellipse cx="38" cy="52" rx="5.5" ry="3.2" fill="#ff9a4d" ${s("#e07a2d", 1.5)}/>` },

    cuarto: { vb: "0 0 64 64", svg:
      `<path d="M10 60 V24 Q10 3 32 3 Q54 3 54 24 V60 Z" fill="#efe8ff" ${s("#b89cff", 2.2)}/>` +
      `<path d="M16 58 V25 Q16 9 32 9 Q48 9 48 25 V58 Z" fill="#8a63f0" ${s("#6a45d4", 2.2)}/>` +
      `<path d="M26 12 V57 M38 12 V57" ${s("#6a45d4", 1.5)}/>` +
      `<ellipse cx="32" cy="38" rx="6" ry="9" fill="#ffc83d" ${s("#e0a51c", 2)}/>` +
      `<circle cx="32" cy="35.5" r="2.4" fill="#46304f"/><path d="M30.8 36.5 L29.8 42.5 H34.2 L33.2 36.5 Z" fill="#46304f"/>` +
      `<rect x="6" y="57" width="52" height="5" rx="2" fill="#c8b6f5" ${s("#8a63f0", 2)}/>` +
      `<path d="${chispaD(58, 9, 5)}" fill="#ffc83d"/><path d="${chispaD(6, 15, 4)}" fill="#ffc83d"/>` },

    colegio: { vb: "0 0 64 64", svg:
      `<rect x="5" y="24" width="14" height="34" rx="2" fill="#ded2fb" ${s("#8a63f0", 2)}/>` +
      `<rect x="45" y="24" width="14" height="34" rx="2" fill="#ded2fb" ${s("#8a63f0", 2)}/>` +
      `<rect x="16" y="30" width="32" height="28" rx="2" fill="#e9e0ff" ${s("#8a63f0", 2)}/>` +
      `<path d="M3 26 L12 6 L21 26 Z M43 26 L52 6 L61 26 Z" fill="#8a63f0" ${s("#6a45d4", 2)}/>` +
      `<path d="M32 15 V4" ${s("#6a45d4", 1.5)}/><path d="M32 4 L40 6.5 L32 9 Z" fill="#ff6fae"/>` +
      `<path d="M13 32 L32 14 L51 32 Z" fill="#8a63f0" ${s("#6a45d4", 2)}/>` +
      `<path d="M27 58 V48 Q32 42 37 48 V58 Z" fill="#6a45d4"/>` +
      `<path d="${estrellaD(32, 38, 4.5, 2)}" fill="#ffc83d"/>` +
      `<path d="M9 38 Q12 34 15 38 V44 H9 Z M49 38 Q52 34 55 38 V44 H49 Z" fill="#ffe89a"/>` },

    tienda: { vb: "0 0 64 64", svg:
      `<rect x="10" y="24" width="44" height="34" rx="3" fill="#fff4e0" ${s("#f0c27a", 2.2)}/>` +
      `<rect x="15" y="36" width="18" height="13" rx="2" fill="#bfe6ff" ${s("#f0c27a", 2)}/>` +
      `<circle cx="20" cy="45" r="2.5" fill="#ff8fb8"/><circle cx="27" cy="45" r="2.5" fill="#ffc83d"/>` +
      `<path d="M38 58 V40 Q43.5 34 49 40 V58 Z" fill="#ff9a4d" ${s("#e07a2d", 2)}/><circle cx="46" cy="50" r="1.2" fill="#fff"/>` +
      `<rect x="20" y="5" width="24" height="11" rx="3" fill="#fff" ${s("#f0c27a", 2)}/>` +
      `<path d="${estrellaD(32, 10.8, 4, 1.8)}" fill="#ffc83d"/>` +
      `<rect x="6" y="15" width="52" height="10" rx="3" fill="#fff"/>` +
      `<path d="M8 16 H12.5 V24 H8 Z M19 16 H25.5 V24 H19 Z M32 16 H38.5 V24 H32 Z M45 16 H51.5 V24 H45 Z" fill="#ff9a4d"/>` +
      `<rect x="6" y="15" width="52" height="10" rx="3" fill="none" ${s("#e07a2d", 2.2)}/>` +
      [6, 19, 32, 45].map((x, i) => `<path d="M${x} 25 h13 a6.5 6.5 0 0 1 -13 0 z" fill="${i % 2 ? "#fff" : "#ff9a4d"}" ${s("#e07a2d", 1.8)}/>`).join("") },

    bosque: { vb: "0 0 64 64", svg:
      `<ellipse cx="32" cy="55" rx="29" ry="5" fill="#9fd96f" ${s("#22a86c", 2)}/>` +
      `<rect x="19" y="42" width="6" height="12" rx="1.5" fill="#a86b35"/>` +
      `<path d="M22 5 L36 26 H30 L40 44 H4 L14 26 H8 Z" fill="#3ccf8c" ${s("#22a86c", 2.2)}/>` +
      `<path d="M20 11 L14 20 M16 30 L11 38" fill="none" stroke="#9be7c0" stroke-width="2" stroke-linecap="round"/>` +
      `<rect x="43" y="46" width="6" height="9" rx="1.5" fill="#a86b35"/>` +
      `<path d="M46 18 L58 34 H53 L61 48 H31 L39 34 H34 Z" fill="#2fbf7e" ${s("#22a86c", 2.2)}/>` +
      `<path d="M44 23 L39 30 M40 38 L36 44" fill="none" stroke="#9be7c0" stroke-width="2" stroke-linecap="round"/>` },

    playa: { vb: "0 0 64 64", svg:
      `<path d="M3 60 Q4 46 32 45 Q60 46 61 60 Z" fill="#ffe89a" ${s("#e0a51c", 2.2)}/>` +
      `<path d="M31 9 L35 52" ${s("#a86b35", 2.5)}/>` +
      `<path d="M7 27 Q12 7 31 6 Q52 7 56 26 Q51 21 45 23.5 Q40 18 34 21 Q27 17 22 22 Q15 20 7 27 Z" fill="#ff6fae"/>` +
      `<path d="M22 22 Q24 12 31 6 Q34 13 34 21 Q27 17 22 22 Z M45 23.5 Q46 13 31 6 Q50 8 56 26 Q51 21 45 23.5 Z" fill="#fff"/>` +
      `<path d="M7 27 Q12 7 31 6 Q52 7 56 26 Q51 21 45 23.5 Q40 18 34 21 Q27 17 22 22 Q15 20 7 27 Z" fill="none" ${s("#e0508f", 2.2)}/>` +
      `<circle cx="31" cy="6" r="2" fill="#ffc83d" ${s("#e0a51c", 1.5)}/>` +
      `<circle cx="48" cy="52" r="6" fill="#fff"/>` +
      `<path d="M48 46 A6 6 0 0 1 54 52 L48 52 Z" fill="#ff6fae"/><path d="M48 58 A6 6 0 0 1 42 52 L48 52 Z" fill="#4db3ff"/>` +
      `<circle cx="48" cy="52" r="6" fill="none" ${s("#2a8fdc", 1.8)}/>` +
      `<path d="${estrellaD(15, 53, 5.5, 2.6)}" fill="#ff9a4d" ${s("#e07a2d", 1.5)}/>` },
  };

  // =====================================================================
  // DECO (adornos 40x40 para fondos de historias; rellenos claros)
  // =====================================================================
  const alaMurci = `<path d="M15 17 Q8 9 2 14 Q6 17 4 22 Q9 20 10 25 Q13 21 16 24 Z" fill="#b89cff" ${s("#6a45d4", 2)}/>`;
  const orejaMurci = `<path d="M14.5 13 L15 5 L19 11 Z" fill="#b89cff" ${s("#6a45d4", 1.8)}/>`;
  const paginaLibro = `<path d="M20 13 Q12 7 4 9 V30 Q12 28 20 32 Z" fill="#fff" ${s("#b89cff", 1.5)}/><path d="M7.5 14 Q11 13.5 16.5 15 M7.5 19 Q11 18.5 16.5 20 M7.5 24 Q11 23.5 16.5 25" fill="none" ${s("#c8b6f5", 1.5)}/>`;
  const telarana = (() => {
    const c = 20, rs = [5.5, 11, 16.5], k = 8;
    let d = "";
    for (let i = 0; i < k; i++) {
      const a = i * Math.PI * 2 / k;
      d += `M${c} ${c} L${n1(c + 18.5 * Math.cos(a))} ${n1(c + 18.5 * Math.sin(a))} `;
    }
    rs.forEach(r => {
      for (let i = 0; i < k; i++) {
        const a1 = i * Math.PI * 2 / k, a2 = (i + 1) * Math.PI * 2 / k, am = (a1 + a2) / 2, rm = r * 0.8;
        d += `M${n1(c + r * Math.cos(a1))} ${n1(c + r * Math.sin(a1))} Q${n1(c + rm * Math.cos(am))} ${n1(c + rm * Math.sin(am))} ${n1(c + r * Math.cos(a2))} ${n1(c + r * Math.sin(a2))} `;
      }
    });
    return `<path d="${d.trim()}" fill="none" ${s("#efe8ff", 1.3)}/>`;
  })();

  A.DECO = {
    estrella: { vb: "0 0 40 40", svg:
      `<path d="${estrellaD(20, 21.5, 17, 7.5)}" fill="#ffe07a" ${s("#e0a51c", 2)}/>` +
      `<circle cx="15.5" cy="17" r="2" fill="#fff" opacity=".85"/>` },

    luna: { vb: "0 0 40 40", svg:
      `<path d="M24 5.5 A15 15 0 1 0 33 27.5 A13 13 0 0 1 24 5.5 Z" fill="#fff6c9" ${s("#e0a51c", 2)}/>` +
      `<path d="M10.5 19 q3 3 6 0" fill="none" ${s("#e0a51c", 1.8)}/>` + mej(12, 24.5, 2.6, 1.7, "#ffb3cf") },

    chispa: { vb: "0 0 40 40", svg:
      `<path d="${chispaD(20, 20, 18)}" fill="#fff4b0" ${s("#ffc83d", 2)}/>` +
      `<circle cx="20" cy="20" r="2.5" fill="#fff"/>` },

    murcielago: { vb: "0 0 40 40", svg:
      `<g transform="translate(0 4)">` +
      alaMurci + esp(40, alaMurci) + orejaMurci + esp(40, orejaMurci) +
      `<circle cx="20" cy="18" r="7.5" fill="#c9b6f5" ${s("#6a45d4", 2)}/>` +
      `<circle cx="17.3" cy="17" r="2.2" fill="#fff"/><circle cx="22.7" cy="17" r="2.2" fill="#fff"/>` +
      `<circle cx="17.6" cy="17.4" r="1.1" fill="#46304f"/><circle cx="22.4" cy="17.4" r="1.1" fill="#46304f"/>` +
      `<path d="M18.3 21.5 l1 2 l1 -2 z M19.7 21.5 l1 2 l1 -2 z" fill="#fff"/>` +
      `</g>` },

    nube: { vb: "0 0 40 40", svg:
      `<path d="M10 31 Q2 31 3 24 Q4 18 11 19 Q12 10 21 10 Q29 10 30 18 Q38 18 37 25 Q36 31 30 31 Z" fill="#fff" ${s("#bfd3ee", 2)}/>` +
      `<path d="M14 17 Q16 13.5 20 13.5" fill="none" ${s("#e2f4ff", 2)}/>` },

    burbuja: { vb: "0 0 40 40", svg:
      `<circle cx="20" cy="20" r="15" fill="#bfe6ff" fill-opacity=".35" ${s("#e2f4ff", 2)}/>` +
      `<path d="M11 17 Q13 10.5 19 8.5" fill="none" ${s("#fff", 2.5)}/>` +
      `<circle cx="27.5" cy="27" r="2" fill="#fff" opacity=".8"/>` },

    corazon: { vb: "0 0 40 40", svg:
      `<path d="M20 35 C10 28 3 22 3 14 C3 8 8 4 13 4 C16.5 4 19 6 20 9 C21 6 23.5 4 27 4 C32 4 37 8 37 14 C37 22 30 28 20 35 Z" fill="#ff8fb8" ${s("#e0508f", 2)}/>` +
      `<ellipse cx="11" cy="12" rx="2.5" ry="3.8" fill="#fff" opacity=".75" transform="rotate(25 11 12)"/>` },

    hoja: { vb: "0 0 40 40", svg:
      `<path d="M7 34 L3.5 37.5" ${s("#22a86c", 2)}/>` +
      `<path d="M7 34 Q3 12 33 5 Q37 30 7 34 Z" fill="#9be7c0" ${s("#22a86c", 2)}/>` +
      `<path d="M9 32 Q18 21 30 9 M16 24 L14 17 M22 18 L27 20" fill="none" ${s("#22a86c", 1.5)}/>` },

    flor: { vb: "0 0 40 40", svg:
      alrededor(20, 20, 8.5, 8.5, 5, (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#ffc9e0" ${s("#e0508f", 2)}/>`) +
      `<circle cx="20" cy="20" r="5.5" fill="#ffe07a" ${s("#e0a51c", 2)}/>` +
      `<circle cx="18.5" cy="18.5" r="1.4" fill="#fff"/>` },

    vela: { vb: "0 0 40 40", svg:
      `<circle cx="20" cy="9" r="7.5" fill="#fff4b0" opacity=".45"/>` +
      `<rect x="14.5" y="16" width="11" height="19" rx="2" fill="#fff4e0" ${s("#e0a51c", 2)}/>` +
      `<path d="M17.5 16 V21 a1.5 1.5 0 0 0 3 0 V16" fill="#fff"/>` +
      `<ellipse cx="20" cy="35" rx="11" ry="3.5" fill="#ffc9e0" ${s("#e0508f", 2)}/>` +
      `<path d="M20 16 V14" ${s("#46304f", 1.5)}/>` +
      `<path d="M20 3 Q26 10 20 14 Q14 10 20 3 Z" fill="#ffc83d" ${s("#ff9a4d", 1.5)}/>` +
      `<ellipse cx="20" cy="10.5" rx="1.8" ry="2.5" fill="#fff"/>` },

    libro: { vb: "0 0 40 40", svg:
      `<path d="M2 12 V33 Q11 31 20 35 Q29 31 38 33 V12 Q29 10 20 14 Q11 10 2 12 Z" fill="#8a63f0" ${s("#6a45d4", 2)}/>` +
      paginaLibro + esp(40, paginaLibro) +
      `<path d="M20 13 V32" ${s("#b89cff", 1.5)}/>` },

    pocion: { vb: "0 0 40 40", svg:
      `<path d="M16 7 H24 V14 Q34 18 34 27 Q34 36 20 36 Q6 36 6 27 Q6 18 16 14 Z" fill="#efe8ff" ${s("#8a63f0", 2)}/>` +
      `<path d="M7.2 24.5 Q13 21.5 20 24.5 Q27 27.5 32.8 24.5 Q34 35 20 35 Q6 35 7.2 24.5 Z" fill="#ff8fb8"/>` +
      `<path d="M16 7 H24 V14 Q34 18 34 27 Q34 36 20 36 Q6 36 6 27 Q6 18 16 14 Z" fill="none" ${s("#8a63f0", 2)}/>` +
      `<rect x="14.5" y="3" width="11" height="5.5" rx="2" fill="#c98a4b" ${s("#a86b35", 1.5)}/>` +
      `<circle cx="16" cy="29" r="1.8" fill="#fff" opacity=".85"/><circle cx="23" cy="31" r="1.2" fill="#fff" opacity=".85"/>` +
      `<path d="M10 22 Q11 19 14 17.5" fill="none" ${s("#fff", 2)}/>` },

    globo: { vb: "0 0 40 40", svg:
      `<path d="M20 31.5 Q16 34 20 36 Q24 38 20 39.5" fill="none" ${s("#efe8ff", 1.5)}/>` +
      `<ellipse cx="20" cy="16" rx="11" ry="13.5" fill="#ff8fb8" ${s("#e0508f", 2)}/>` +
      `<path d="M20 29.5 l-2.5 3 h5 z" fill="#ff8fb8" ${s("#e0508f", 1.5)}/>` +
      `<ellipse cx="15.5" cy="11" rx="2.5" ry="4" fill="#fff" opacity=".7" transform="rotate(-20 15.5 11)"/>` },

    pez: { vb: "0 0 40 40", svg:
      `<path d="M28 20 L37 12 V28 Z" fill="#ffb070" ${s("#e07a2d", 2)}/>` +
      `<path d="M13 12 Q18 6 23 12.5 Z" fill="#ffe07a" ${s("#e07a2d", 1.5)}/>` +
      `<ellipse cx="17" cy="20" rx="13" ry="9" fill="#ffb070" ${s("#e07a2d", 2)}/>` +
      `<path d="M21 12.5 Q24.5 20 21 27.5" fill="none" ${s("#ffe07a", 2)}/>` +
      ojo(10.5, 18.5, 2.2, 2.6) + mej(9.5, 23.5, 2, 1.3) +
      `<circle cx="5" cy="7" r="2.5" fill="none" ${s("#bfe6ff", 1.5)}/>` },

    caramelo: { vb: "0 0 40 40", svg:
      `<path d="M11 20 L2 12 Q4 20 2 28 Z M29 20 L38 12 Q36 20 38 28 Z" fill="#ffc9e0" ${s("#e0508f", 2)}/>` +
      `<circle cx="20" cy="20" r="9.5" fill="#ff8fb8"/>` +
      `<path d="M14 14 L26 26 M12 20 L20 28 M20 12 L28 20" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>` +
      `<circle cx="20" cy="20" r="9.5" fill="none" ${s("#e0508f", 2)}/>` },

    castillo: { vb: "0 0 40 40", svg:
      `<rect x="4" y="14" width="8" height="22" rx="1" fill="#efe8ff" ${s("#8a63f0", 1.8)}/>` +
      `<rect x="28" y="14" width="8" height="22" rx="1" fill="#efe8ff" ${s("#8a63f0", 1.8)}/>` +
      `<rect x="10" y="18" width="20" height="18" rx="1" fill="#efe8ff" ${s("#8a63f0", 1.8)}/>` +
      `<path d="M3 15 L8 5 L13 15 Z M27 15 L32 5 L37 15 Z" fill="#b89cff" ${s("#8a63f0", 1.8)}/>` +
      `<path d="M9 20 L20 7 L31 20 Z" fill="#b89cff" ${s("#8a63f0", 1.8)}/>` +
      `<path d="M17 36 V30 Q20 26 23 30 V36 Z" fill="#8a63f0"/>` +
      `<path d="M6.5 22 H9.5 V26 H6.5 Z M30.5 22 H33.5 V26 H30.5 Z" fill="#ffe89a"/>` },

    varita: { vb: "0 0 40 40", svg:
      `<path d="M7 35 L23 19" ${s("#6a45d4", 6)}/><path d="M7 35 L23 19" ${s("#efe8ff", 3)}/>` +
      `<path d="${estrellaD(27, 13, 10, 4.3)}" fill="#ffe07a" ${s("#e0a51c", 2)}/>` +
      `<circle cx="9" cy="10" r="1.6" fill="#fff"/><circle cx="36" cy="27" r="1.6" fill="#fff"/>` +
      `<path d="${chispaD(34, 34, 3.5)}" fill="#fff4b0"/>` },

    telarana: { vb: "0 0 40 40", svg:
      telarana +
      `<path d="M25 27 l-3 -2 M25 29 l-3 1.5 M31 27 l3 -2 M31 29 l3 1.5" ${s("#efe8ff", 1.2)}/>` +
      `<circle cx="28" cy="28" r="3.3" fill="#8a63f0" ${s("#efe8ff", 1)}/>` +
      `<circle cx="27" cy="27.4" r=".8" fill="#fff"/><circle cx="29" cy="27.4" r=".8" fill="#fff"/>` },

    cafe: { vb: "0 0 40 40", svg:
      `<path d="M15 10 Q13 7.5 15 5 M21 10 Q19 7.5 21 5" fill="none" ${s("#fff", 2)}/>` +
      `<ellipse cx="19" cy="35" rx="15" ry="3" fill="#ffc9e0" ${s("#e0508f", 2)}/>` +
      `<path d="M29 19 Q36 19 36 24 Q36 29 28 29" fill="none" ${s("#e0508f", 2.5)}/>` +
      `<path d="M8 15 H30 V25 Q30 34 19 34 Q8 34 8 25 Z" fill="#fff" ${s("#e0508f", 2)}/>` +
      `<ellipse cx="19" cy="15" rx="11" ry="2.6" fill="#a86b35" ${s("#e0508f", 2)}/>` +
      `<path d="M19 28.5 l-3.2 -3.2 a2 2 0 0 1 3.2 -2.6 a2 2 0 0 1 3.2 2.6 z" fill="#ff8fb8"/>` },

    galleta: { vb: "0 0 40 40", svg:
      `<circle cx="20" cy="20" r="15.5" fill="#e8b27a" ${s("#a86b35", 2)}/>` +
      `<path d="M9 14 Q12 8.5 17.5 6.5" fill="none" ${s("#f6d2a8", 2)}/>` +
      `<ellipse cx="14" cy="15" rx="2.4" ry="2" fill="#7a4a2a"/><ellipse cx="24" cy="12" rx="2.2" ry="1.8" fill="#7a4a2a"/>` +
      `<ellipse cx="27.5" cy="22" rx="2.6" ry="2" fill="#7a4a2a"/><ellipse cx="15" cy="25.5" rx="2.3" ry="2" fill="#7a4a2a"/>` +
      `<ellipse cx="21" cy="19.5" rx="2" ry="1.7" fill="#7a4a2a"/><ellipse cx="22" cy="29" rx="1.8" ry="1.5" fill="#7a4a2a"/>` +
      `<circle cx="10" cy="21" r="1" fill="#f6d2a8"/><circle cx="30" cy="15" r="1" fill="#f6d2a8"/><circle cx="28" cy="29" r="1" fill="#f6d2a8"/>` },
  };
})();
