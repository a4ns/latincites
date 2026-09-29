// Штриховые иллюстрации к мнемоникам: холст 120×100, линия пера, один красный акцент.
// Классы: .a — красная линия, .af — красная заливка, .k — чёрная заливка.

const f = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;

// миндалевидный листок от точки (x,y) под углом a (рад), длиной s
const leaf = (x, y, a, s) => {
  const ca = Math.cos(a), sa = Math.sin(a);
  const p = (px, py) => `${f(x + px * ca - py * sa)} ${f(y + px * sa + py * ca)}`;
  return `<path d="M${p(0, 0)}Q${p(s * 0.5, -s * 0.42)} ${p(s, 0)}Q${p(s * 0.5, s * 0.42)} ${p(0, 0)}M${p(s * 0.1, 0)}L${p(s * 0.8, 0)}"/>`;
};

// зеркальное отражение ломаной по вертикальной оси x=60
const mirror = (pts) => pts.map(([x, y]) => [120 - x, y]);
// гладкая кривая через точки (Catmull-Rom → кубические Безье)
const spline = (P, closed = true) => {
  const n = P.length, g = (i) => P[(i + n) % n];
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = closed ? g(i - 1) : P[Math.max(i - 1, 0)], p1 = g(i), p2 = g(i + 1), p3 = closed ? g(i + 2) : P[Math.min(i + 2, n - 1)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
};
const poly = (pts, close = false) =>
  'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + (close ? 'Z' : '');

// параллелограмм-грань куба: точка (u,v) → (ox+u*ux+v*vx, oy+u*uy+v*vy)
const pip = (ox, oy, ux, uy, vx, vy, u, v) =>
  `<circle class="k" cx="${f(ox + u * ux + v * vx)}" cy="${f(oy + u * uy + v * vy)}" r="1.9"/>`;

function cube(cx, cy, size, rot, pips) {
  const k = size / 22;
  let g = `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${f(k * 100) / 100}) translate(0 -2)" stroke-width="${f(1.7 / k)}">`;
  g += `<path d="M0 -24L22 -12L0 0L-22 -12Z"/><path d="M-22 -12L0 0L0 28L-22 16Z"/><path d="M0 0L22 -12L22 16L0 28Z"/>`;
  for (const [px, py] of pips.top) g += `<circle class="k" cx="${px}" cy="${py}" r="1.9"/>`;
  for (const [u, v] of pips.left) g += pip(-22, -12, 22, 12, 0, 28, u, v);
  for (const [u, v] of pips.right) g += pip(0, 0, 22, -12, 0, 28, u, v);
  return g + '</g>';
}

// одна ветвь венка: зеркальная копия для левой стороны
function laurelBranch(mir) {
  const cx = 60, cy = 46, R = 31, N = 8;
  const X = (x) => (mir ? 120 - x : x);
  const A = (a) => (mir ? Math.PI - a : a);
  let stem = '', leaves = '';
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = rad(80 - 158 * t); // снизу-справа вверх по правой стороне, зазор наверху
    const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    stem += (i ? 'L' : 'M') + `${f(X(x))} ${f(y)}`;
    if (i > 0) {
      const angT = Math.atan2(-Math.cos(a), Math.sin(a)); // направление обхода
      leaves += leaf(X(x), y, A(angT + 0.62), 11.5);
      leaves += leaf(X(x), y, A(angT - 0.62), 10);
    }
  }
  return `<path d="${stem}"/>${leaves}`;
}

function star(cx, cy, R, r, cls = '') {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = rad(-90 + i * 36), rr = i % 2 ? r : R;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return `<path class="${cls}" d="${poly(pts, true)}"/>`;
}

export const ILL = {
  // ---- Alea iacta est
  dice: () =>
    cube(46, 58, 34, -14, {
      top: [[0, -12], [0, -19], [0, -5], [-11, -12], [11, -12]],
      left: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
      right: [[0.5, 0.5]],
    }) +
    cube(92, 30, 19, 24, {
      top: [[0, -12]],
      left: [[0.3, 0.3], [0.7, 0.7]],
      right: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    }) +
    `<path class="a" d="M6 86C16 74 24 68 34 65"/><path class="a" d="M3 76C12 66 20 61 28 58"/>` +
    `<path d="M30 94h40M38 98h24" stroke-dasharray="1.5 3.5"/>`,

  // ---- Veni, vidi, vici
  laurel: () =>
    laurelBranch(false) +
    laurelBranch(true) +
    `<path class="a" d="M60 80C52 73 44 75 42 81C46 86 54 84 60 80C66 84 74 86 78 81C76 75 68 73 60 80Z"/>` +
    `<path class="a" d="M57 84L51 96M63 84L69 96"/>`,

  // ---- Carpe diem
  carp: () =>
    `<g transform="rotate(-24 60 50)">` +
    `<path d="M102 52C100 38 84 30 66 32C54 34 44 42 34 50C44 58 54 66 66 68C84 70 100 64 102 52Z"/>` +
    `<path d="M34 50C26 44 18 36 10 30C16 42 16 58 10 70C18 64 26 56 34 50Z"/>` +
    `<path d="M62 33Q70 20 84 31"/>` +
    `<path class="a" d="M70 66Q72 78 86 72"/>` +
    `<circle class="k" cx="91" cy="46" r="2.2"/>` +
    `<path d="M80 40Q75 50 80 60M102 52L96 53M99 52q-2 6 -8 5"/>` +
    [50, 58, 66, 74].map((x) => `<path d="M${x} 46q5 5 0 10M${x + 4} 41q5 4 0 9"/>`).join('') +
    `</g>` +
    `<path d="M4 88q8 -6 16 0t16 0 16 0 16 0 16 0 16 0 16 0"/>` +
    `<circle cx="34" cy="72" r="2"/><circle cx="26" cy="64" r="1.4"/><circle cx="98" cy="78" r="1.6"/>`,

  // ---- Cogito, ergo sum
  head: () => {
    let sp = '';
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * 4 * Math.PI;
      const r = 2 + 1.05 * t;
      sp += (i ? 'L' : 'M') + `${f(56 + r * Math.cos(t))} ${f(43 + r * Math.sin(t))}`;
    }
    return (
      `<path d="M40 94C34 82 24 70 25 52C26 30 42 14 64 15C84 16 94 30 92 46L101 62L91 65L92 72C92 77 88 80 84 80L84 94"/>` +
      `<path d="M82 42q4 -3 8 0"/><path d="M50 60q-7 1 -6 9q1 5 6 4"/>` +
      `<path class="a" d="${sp}"/>`
    );
  },

  // ---- In vino veritas
  amphora: () =>
    `<ellipse cx="60" cy="16" rx="13" ry="3.6"/>` +
    `<path d="M49 20C49 30 34 33 34 55C34 72 46 82 50 87H70C74 82 86 72 86 55C86 33 71 30 71 20"/>` +
    `<path d="M50 87L52 94H68L70 87"/>` +
    `<path d="M49 24C30 20 26 44 35 48M71 24C90 20 94 44 85 48"/>` +
    `<path d="M35 47Q60 54 85 47M36 66Q60 73 84 66"/>` +
    `<g class="af" stroke="none">` +
    [[54, 58], [60, 58], [66, 58], [57, 63], [63, 63], [60, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('') +
    `</g>` +
    `<path d="M60 55Q60 51 64 49"/>`,

  // ---- Memento mori
  skull: () =>
    `<path d="M60 10C36 10 22 28 27 50C29 58 35 62 37 68V80H83V68C85 62 91 58 93 50C98 28 84 10 60 10Z"/>` +
    `<ellipse cx="46" cy="46" rx="8.5" ry="10"/><ellipse cx="74" cy="46" rx="8.5" ry="10"/>` +
    `<path d="M60 56L55 68H65Z"/>` +
    `<path d="M46 72V80M53 74V80M60 74V80M67 74V80M74 72V80M37 72H83"/>` +
    `<path class="a" d="M14 88L106 96M14 96L106 88"/>`,

  // ---- Homo homini lupus est
  wolf: () => {
    const half = [[60, 92], [49, 85], [41, 79], [31, 82], [35, 70], [23, 64], [31, 55], [21, 45], [30, 40], [23, 26], [27, 8], [45, 25], [60, 21]];
    const right = mirror(half).reverse();
    const outline = poly([...half, ...right.slice(1)], true);
    return (
      `<path d="${outline}"/>` +
      `<path d="M31 21L38 33M89 21L82 33"/>` +
      `<path class="k" d="M37 44L51 48L38 51ZM83 44L69 48L82 51Z"/>` +
      `<path d="M54 52L52 76M66 52L68 76M26 60L40 65M94 60L80 65"/>` +
      `<path class="af" d="M53 76H67L60 85Z"/>` +
      `<path class="a" d="M60 90V94"/>`
    );
  },

  // ---- Mens sana in corpore sano
  scales: () =>
    `<circle class="af" cx="60" cy="24" r="3"/><path d="M60 27V84M42 88H78M46 88L60 84L74 88"/>` +
    `<path d="M20 28Q60 22 100 28"/>` +
    `<path d="M20 28L5 60M20 28L35 60M100 28L85 60M100 28L115 60"/>` +
    `<path d="M3 60H37Q31 72 20 72Q9 72 3 60ZM83 60H117Q111 72 100 72Q89 72 83 60Z"/>` +
    `<path d="M14 60V50Q21 47.5 28 50V60M21 48.5V60"/>` +
    `<path d="M91 55H109M91 48V62M94 51V59M109 48V62M106 51V59"/>`,

  // ---- Per aspera ad astra
  ladder: () => {
    let g = `<path d="M36 96L46 26M76 96L68 26"/>`;
    for (let i = 0; i < 7; i++) {
      const t = i / 6, y = 90 - 60 * t;
      const lx = 36 + (46 - 36) * ((96 - y) / 70), rx = 76 + (68 - 76) * ((96 - y) / 70);
      g += `<path d="M${f(lx)} ${f(y)}L${f(rx)} ${f(y)}"/>`;
      g += `<path d="M${f(lx)} ${f(y - 4)}l-6 -3M${f(rx)} ${f(y - 4)}l6 -3"/>`;
    }
    return g + star(59, 14, 11, 4.5, 'a');
  },

  // ---- Tempus fugit
  hourglass: () =>
    `<path d="M32 10H88M32 92H88"/>` +
    `<path d="M40 10C40 34 56 42 60 50C64 42 80 34 80 10M40 92C40 68 56 58 60 50C64 58 80 68 80 92"/>` +
    `<path d="M49 30H71M52 24H68M55 18H65"/>` +
    `<path class="a" d="M60 46V70"/>` +
    `<path d="M44 88Q60 68 76 88M52 84H68M56 79H64"/>` +
    `<path d="M32 46Q12 42 6 26M32 54Q14 52 8 40M32 62Q18 62 12 52M88 46Q108 42 114 26M88 54Q106 52 112 40M88 62Q102 62 108 52"/>`,

  // ---- Dura lex, sed lex
  fasces: () => {
    let g = '';
    for (let i = 0; i < 7; i++) g += `<path d="M${42 + i * 6} 20V90"/>`;
    g += `<path d="M42 90Q60 96 78 90M42 20Q60 14 78 20"/>`;
    for (const y of [32, 52, 72]) g += `<path class="a" d="M40 ${y}H80M40 ${y + 5}H80" stroke-width="2.4"/>`;
    g += `<path d="M78 24L98 14Q106 28 98 42L78 36"/><path d="M90 20Q96 28 92 36"/>`;
    return g;
  },

  // ---- Festina lente: дельфин и якорь
  dolphin: () => {
    const body = spline([[106, 50], [98, 47.5], [90, 42], [80, 37], [66, 35], [50, 38], [36, 44], [26, 50], [21, 55], [27, 60], [38, 63], [52, 64], [68, 62], [82, 60], [94, 56], [102, 54]]);
    return (
      // якорь за дельфином
      `<circle cx="58" cy="9" r="3.5"/><path d="M58 12.5V86"/><path d="M45 21H71"/>` +
      `<path d="M30 68Q58 104 86 68"/><path d="M30 68L21 59L36 62ZM86 68L95 59L80 62Z"/>` +
      `<g transform="rotate(-17 58 52)">` +
      `<path class="bg" d="${body}"/>` +
      `<path d="M58 36Q56 24 46 20Q50 30 44 40"/>` +
      `<path d="M56 64Q52 76 44 80Q56 76 66 63"/>` +
      `<path d="M22 54Q12 44 3 46Q9 52 12 56Q9 62 3 68Q14 68 23 58"/>` +
      `<circle class="k" cx="89" cy="45" r="1.7"/><path d="M104 51L93 52"/>` +
      `</g>` +
      `<path class="a" d="M50 92H66"/>`
    );
  },

  // ---- Si vis pacem: меч и оливковая ветвь
  sword: () => {
    let olive = '';
    const P = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      P.push([26 + 46 * t + 8 * Math.sin(t * 5), 90 - 62 * t]);
    }
    olive += `<path class="a" d="${poly(P)}"/>`;
    for (let i = 1; i <= 8; i++) {
      const [x, y] = P[i];
      olive += `<g class="a">${leaf(x, y, -1.9 + (i % 2) * 2.2, 10)}</g>`;
    }
    return (
      `<path d="M60 4L70 62H50Z"/><path d="M60 10V56"/>` +
      `<path d="M40 62H80" stroke-width="3"/><path d="M60 62V86"/>` +
      `<circle cx="60" cy="90" r="4"/>` +
      olive
    );
  },

  // ---- Et tu, Brute?
  dagger: () =>
    `<path d="M60 86L52 46H68Z"/><path d="M60 82V50"/>` +
    `<path d="M42 46H78" stroke-width="3"/>` +
    `<path d="M56 46V24M64 46V24M54 24H66"/><circle cx="60" cy="18" r="5"/>` +
    `<path class="af" d="M58 92q-3 5 0 8q3 -3 0 -8z"/><circle class="af" cx="66" cy="94" r="1.6"/>`,

  // ---- Ecce homo
  thorns: () => {
    let a = '', b = '', sp = '';
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 * Math.PI, w = 3 * Math.sin(t * 5);
      a += (i ? 'L' : 'M') + `${f(60 + (38 + w) * Math.cos(t))} ${f(50 + (17 + w * 0.5) * Math.sin(t))}`;
      b += (i ? 'L' : 'M') + `${f(60 + (38 - w) * Math.cos(t))} ${f(50 + (17 - w * 0.5) * Math.sin(t))}`;
    }
    for (let i = 0; i < 18; i++) {
      const t = (i / 18) * 2 * Math.PI + 0.2, x = 60 + 38 * Math.cos(t), y = 50 + 17 * Math.sin(t);
      const L = 8 + (i % 3) * 2;
      sp += `M${f(x)} ${f(y)}L${f(x + Math.cos(t) * L)} ${f(y + Math.sin(t) * L * 0.6 - 3)}`;
    }
    return (
      `<path d="${a}"/><path d="${b}"/><path d="${sp}"/>` +
      `<path class="af" d="M54 74q-3 6 0 9q3 -3 0 -9z"/><path class="af" d="M68 78q-2.5 5 0 8q2.5 -3 0 -8z"/>`
    );
  },

  // ---- Vae victis
  'sword-scales': () =>
    `<circle class="af" cx="60" cy="24" r="3"/><path d="M60 27V88M42 92H78M46 92L60 88L74 92"/>` +
    `<path d="M20 40Q60 26 100 20"/>` +
    `<path d="M20 40L6 70M20 40L34 70M100 20L86 48M100 20L114 48"/>` +
    `<path d="M4 70H36Q30 82 20 82Q10 82 4 70ZM84 48H116Q110 60 100 60Q90 60 84 48Z"/>` +
    `<path class="a" d="M8 66H30M30 61V71M30 66H38"/>` +
    `<path d="M92 44H108M94 41H106"/>`,

  // ---- Deus ex machina
  crane: () =>
    `<path d="M4 94H116"/><path d="M8 94H30M19 94V14"/>` +
    `<path d="M19 20L88 9M19 58L56 16"/><circle cx="88" cy="9" r="2.6"/>` +
    `<path d="M88 12L70 52M88 12L106 52"/>` +
    `<path d="M62 62Q56 55 65 52Q66 46 75 48Q81 42 90 48Q98 46 100 52Q110 54 105 62Z"/>` +
    `<circle cx="86" cy="32" r="4.6"/><ellipse class="a" cx="86" cy="24" rx="7" ry="2.2"/>` +
    `<path d="M86 37V50M86 41L76 33M86 41L96 33M86 50L81 58M86 50L91 58"/>` +
    `<path d="M40 94V74H60V94M36 74H64" stroke-width="1.4"/>`,

  // ---- Verba volant, scripta manent
  bird: () =>
    `<path d="M14 36Q34 14 54 38Q74 14 94 36"/><path d="M54 38L52 44Q56 50 60 44L54 38"/>` +
        `<path d="M26 62H94Q98 62 98 68V84H30Q26 84 26 78Z"/><path d="M26 62Q20 62 20 68Q20 74 26 74"/>` +
    `<path d="M38 70H84M38 76H76M38 82H82"/>` +
    `<circle class="af" cx="90" cy="86" r="4.5"/>`,

  // ---- Fiat lux
  lamp: () =>
    `<path d="M40 66Q60 90 92 68Q80 62 62 62Q48 62 40 66Z"/>` +
    `<path d="M40 66Q28 62 20 56Q26 68 38 72"/>` +
    `<path d="M92 68Q106 62 102 80Q98 88 86 80"/>` +
    `<path d="M50 84H76M56 88H70"/>` +
    `<path class="af" d="M20 38Q26 47 20 54Q14 47 20 38Z"/>` +
    `<path d="M20 28V19M8 33L3 27M32 33L37 27M6 44H1M34 44H39"/>`,

  // ---- Cave canem
  dog: () =>
    `<path d="M60 22C44 22 36 32 36 46C36 58 40 68 46 76C50 82 54 84 60 84C66 84 70 82 74 76C80 68 84 58 84 46C84 32 76 22 60 22Z"/>` +
    `<path d="M40 30C28 28 18 40 20 60C22 66 30 66 34 58C38 50 38 40 42 34"/>` +
    `<path d="M80 30C92 28 102 40 100 60C98 66 90 66 86 58C82 50 82 40 78 34"/>` +
    `<circle class="k" cx="49" cy="46" r="2.5"/><circle class="k" cx="71" cy="46" r="2.5"/>` +
    `<path d="M43 40L54 44M77 40L66 44"/>` +
    `<ellipse cx="60" cy="66" rx="13" ry="10"/>` +
    `<path class="k" d="M53 60Q60 55 67 60Q64 68 60 69Q56 68 53 60Z"/>` +
    `<path d="M60 69V75M51 75Q60 82 69 75"/>` +
    `<path class="a" d="M42 84Q60 94 78 84" stroke-width="3"/><circle class="a" cx="60" cy="93" r="3"/>` +
    `<path class="a" d="M60 96q-5 3 0 5q5 -2 0 -5"/>`,

  // ---- Primus inter pares
  crowns: () => {
    let g = '';
    for (const x of [16, 38, 60, 82, 104]) {
      g += `<circle cx="${x}" cy="58" r="6"/><path d="M${x - 12} 90Q${x} 64 ${x + 12} 90"/>`;
    }
    g += `<path class="a" d="M54 51L54 41L57.5 46L60 39L62.5 46L66 41L66 51Z"/>`;
    return g;
  },

  // ---- Ad infinitum
  mirrors: () => {
    let g = `<path d="M6 10V90M12 10V90M108 10V90M114 10V90"/>`;
    for (let k = 0; k < 7; k++) {
      const s = Math.pow(0.72, k), w = 88 * s, h = 62 * s;
      g += `<rect x="${f(60 - w / 2)}" y="${f(50 - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(3 * s)}"/>`;
    }
    return g + `<circle class="af" cx="60" cy="50" r="2.2"/>`;
  },

  // ---- Non plus ultra
  columns: () => {
    const col = (x) =>
      `<path d="M${x + 4} 30V84M${x + 16} 30V84M${x + 10} 30V84"/><path d="M${x - 2} 22H${x + 22}V30H${x - 2}Z"/><path d="M${x} 84H${x + 20}V91H${x}Z"/>`;
    return (
      col(18) + col(82) +
      `<path d="M42 56q6 -5 12 0t12 0t12 0t12 0" /><path d="M42 68q6 -5 12 0t12 0t12 0t12 0"/><path d="M44 80q6 -5 12 0t12 0t12 0"/>` +
      `<path class="a" d="M40 34Q60 24 80 34"/><path class="a" d="M42 38Q60 30 78 38"/>`
    );
  },

  // ---- Ab ovo
  egg: () =>
    `<path d="M60 12C42 12 30 42 30 62C30 80 44 90 60 90C76 90 90 80 90 62C90 42 78 12 60 12Z"/>` +
    `<path d="M42 38Q38 52 40 66M46 30Q43 34 42 38" stroke-width="1.2"/>` +
    `<path class="a" d="M34 56L45 64L52 54L60 66L68 54L76 64L86 56"/>`,

  // ---- Pecunia non olet
  coin: () =>
    `<circle cx="42" cy="54" r="30"/><circle cx="42" cy="54" r="23"/>` +
    star(42, 54, 12, 5, 'a') +
    `<path d="M96 26Q90 46 102 58Q98 66 88 64"/><path d="M92 58Q95 61 99 60"/>` +
    `<path d="M80 52H72M82 60H74M78 44H72" stroke-dasharray="2 3"/>`,

  // ---- Nemo me impune lacessit
  thistle: () => {
    let petals = '';
    for (let a = -170; a <= -10; a += 12) {
      const r = rad(a), x = 60 + 15 * Math.cos(r), y = 46 + 11 * Math.sin(r);
      petals += `M${f(x)} ${f(y)}L${f(60 + 27 * Math.cos(r))} ${f(46 + 22 * Math.sin(r))}`;
    }
    return (
      `<path d="M40 48Q60 30 80 48Q60 68 40 48Z"/><path d="M46 45L66 62M54 40L74 58M50 54L64 40M62 34L76 48M44 51L58 66" stroke-width="1"/>` +
      `<path class="a" d="${petals}"/>` +
      `<path d="M60 66V98"/>` +
      `<path d="M60 84Q42 80 32 62Q46 62 54 76M60 84Q78 80 88 62Q74 62 66 76"/>` +
      `<path d="M38 66l-5 2M44 72l-5 3M82 66l5 2M76 72l5 3" stroke-width="1.3"/>`
    );
  },

  // ---- Requiescat in pace
  gravestone: () =>
    `<path d="M32 92V42Q32 18 60 18Q88 18 88 42V92"/>` +
    `<path class="a" d="M60 30V60M49 42H71"/>` +
    `<path d="M45 74H75M49 80H71"/>` +
    `<path d="M14 92H106M24 92l2 -7M30 92l-1 -5M92 92l2 -7M98 92l-1 -5"/>`,

  // ---- Timeo Danaos
  horse: () =>
    `<path d="M32 44H78V62H32Z"/><path d="M42 44V62M54 44V62M66 44V62" stroke-width="1"/>` +
    `<path d="M76 46L88 26L100 30L92 56L78 58"/><path d="M88 26L102 20L112 32L104 37L98 30"/>` +
    `<path d="M89 24L88 15L95 21"/><circle class="k" cx="102" cy="27" r="1.6"/>` +
    `<path d="M86 30l-6 2l5 3l-6 3l5 3" stroke-width="1.2"/>` +
    `<path d="M32 46L20 50L26 64"/>` +
    `<path d="M38 62V84M48 62V84M66 62V84M76 62V84"/>` +
    `<path d="M26 84H84"/><circle cx="40" cy="91" r="6"/><circle cx="72" cy="91" r="6"/>` +
    `<path class="a" d="M52 49H60V62H52Z"/>`,

  // ---- Sapere aude
  lantern: () =>
    `<path d="M50 24Q60 4 70 24"/><path d="M42 32H78L72 24H48Z"/>` +
    `<path d="M46 32L42 82H78L74 32"/><path d="M60 32V82"/><path d="M38 82H82V89H38Z"/>` +
    `<path class="af" d="M60 48Q69 60 60 74Q51 60 60 48Z"/>` +
    `<path d="M26 52H16M30 36L23 29M30 70L23 77M94 52H104M90 36L97 29M90 70L97 77"/>`,

  // ---- Ave, Caesar
  helmet: () => {
    let grille = '';
    for (const y of [68, 76, 84]) grille += `M36 ${y}H84`;
    for (const x of [48, 60, 72]) grille += `M${x} 58V92`;
    return (
      `<path d="M32 58Q32 24 60 24Q88 24 88 58"/><path d="M28 58H92"/>` +
      `<path d="M36 58V86Q60 98 84 86V58"/><path d="${grille}"/>` +
      `<path class="a" d="M40 30Q56 4 88 22Q70 22 64 30"/>`
    );
  },

  // ---- Habemus Papam
  smoke: () =>
    `<path d="M20 90H100"/><path d="M46 90V62H74V90M46 74H74M46 82H74M60 62V74"/><path d="M42 62H78"/>` +
    `<path d="M54 62Q46 52 54 44Q48 34 58 30Q62 20 74 26Q86 22 88 34Q96 40 88 48Q92 58 80 58Q74 66 66 60Q62 62 54 62Z"/>` +
    `<circle cx="44" cy="22" r="4"/><circle cx="34" cy="12" r="2.5"/><circle cx="94" cy="16" r="3"/>` +
    `<path class="a" d="M26 90V78M21 83H31"/>`,

  // ---- Damnatio memoriae
  erased: () =>
    `<path d="M26 10H94V90H26Z"/><path d="M33 17H87V83H33Z"/>` +
    `<circle cx="60" cy="44" r="14" stroke-dasharray="2 3.5"/><path d="M34 83Q60 52 86 83"/>` +
    `<path class="a" d="M46 32L72 58M44 40L64 62M52 30L74 50M48 46L58 60M60 30L76 44"/>`,

  // ---- Ex libris
  bookplate: () =>
    `<path d="M60 26Q38 16 12 24V80Q38 72 60 82Q82 72 108 80V24Q82 16 60 26Z"/><path d="M60 26V82"/>` +
    `<path d="M24 40H50V66H24Z"/><path class="a" d="M37 62V50M31 54Q37 44 43 54"/>` +
    `<path d="M70 38H98M70 46H98M70 54H92M70 62H98"/>`,

  // ---- Hannibal ante portas
  elephant: () =>
    `<path d="M60 12Q40 12 40 34V52Q44 62 52 66"/><path d="M60 12Q80 12 80 34V52Q76 62 68 66"/>` +
    `<path d="M42 28Q6 18 8 56Q10 78 42 66"/><path d="M78 28Q114 18 112 56Q110 78 78 66"/>` +
    `<path d="M52 44V86Q52 98 60 98Q68 98 68 86V44"/><path d="M52 56H68M52 66H68M52 76H68" stroke-width="1.2"/>` +
    `<circle class="k" cx="48" cy="40" r="2.4"/><circle class="k" cx="72" cy="40" r="2.4"/>` +
    `<path class="a" d="M48 64Q38 74 36 90M72 64Q82 74 84 90"/>`,

  // ---- Ex ungue leonem
  claw: () =>
    `<path d="M60 62Q46 62 44 74Q44 86 60 86Q76 86 76 74Q74 62 60 62Z"/>` +
    `<ellipse cx="38" cy="54" rx="6" ry="8" transform="rotate(-20 38 54)"/><ellipse cx="51" cy="44" rx="6" ry="8" transform="rotate(-6 51 44)"/>` +
    `<ellipse cx="69" cy="44" rx="6" ry="8" transform="rotate(6 69 44)"/><ellipse cx="82" cy="54" rx="6" ry="8" transform="rotate(20 82 54)"/>` +
    `<path class="a" d="M34 46Q30 32 36 24M47 36Q46 22 52 14M73 36Q74 22 68 14M86 46Q90 32 84 24"/>`,

  // ---- Audentes fortuna iuvat: колесо Фортуны
  wheel: () => {
    let g = `<circle cx="56" cy="50" r="34"/><circle cx="56" cy="50" r="27"/><circle cx="56" cy="50" r="5"/>`;
    for (let i = 0; i < 8; i++) {
      const a = rad(i * 45);
      g += `<path d="M${f(56 + 5 * Math.cos(a))} ${f(50 + 5 * Math.sin(a))}L${f(56 + 27 * Math.cos(a))} ${f(50 + 27 * Math.sin(a))}"/>`;
      g += `<circle cx="${f(56 + 34 * Math.cos(a))}" cy="${f(50 + 34 * Math.sin(a))}" r="1.8"/>`;
    }
    return g +
      `<path class="a" d="M46 12L46 3L50 8L56 1L62 8L66 3L66 12Z"/>` +
      `<path d="M96 40Q108 46 100 64M98 66l6 6M92 68l6 6"/>` +
      `<path d="M92 88H8" stroke-dasharray="2 3"/>`;
  },

  // ---- Gutta cavat lapidem
  drop: () =>
    `<path d="M10 92Q12 66 38 60Q48 58 54 64Q60 72 66 64Q72 58 82 60Q108 66 110 92Z"/>` +
    `<path class="af" d="M60 8Q72 28 60 40Q48 28 60 8Z"/><path d="M60 44V56" stroke-dasharray="2 3"/>` +
    `<path d="M50 66Q60 72 70 66M28 76L36 84M92 78L86 86" stroke-width="1.2"/>`,

  // ---- In hoc signo vinces
  chirho: () => {
    let rays = '';
    for (let i = 0; i < 20; i++) {
      const a = rad(i * 18);
      rays += `M${f(60 + 46 * Math.cos(a))} ${f(50 + 46 * Math.sin(a))}L${f(60 + 55 * Math.cos(a))} ${f(50 + 55 * Math.sin(a))}`;
    }
    return (
      `<circle cx="60" cy="50" r="40"/>` +
      `<path d="M60 14V88M38 30L82 70M82 30L38 70"/>` +
      `<path d="M60 14H70Q82 14 82 26Q82 38 70 38H60"/>` +
      `<path class="a" d="${rays}"/>`
    );
  },

  // ---- Anguis in herba
  snake: () => {
    const N = 40, C = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      C.push([12 + 80 * t, 62 - 14 * Math.sin(t * 4.2 * Math.PI) * (0.5 + 0.5 * t) - 12 * t]);
    }
    const Lp = [], Rp = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = C[i], q = C[Math.min(i + 1, N)], o = C[Math.max(i - 1, 0)];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = 1.6 + 6.4 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (t > 0.88 ? 1.35 : 1);
      Lp.push([p[0] - dy * w, p[1] + dx * w]);
      Rp.push([p[0] + dy * w, p[1] - dx * w]);
    }
    const head = C[N];
    let grass = '';
    for (const x of [8, 20, 34, 50, 66, 80, 94, 106]) grass += `M${x} 92Q${x - 3} 78 ${x - 8} 68M${x + 3} 92Q${x + 5} 80 ${x + 10} 72`;
    return (
      `<path d="${poly([...Lp, ...Rp.slice().reverse()], true)}"/>` +
      `<circle class="k" cx="${f(head[0] - 1)}" cy="${f(head[1] - 3)}" r="1.5"/>` +
      `<path class="a" d="M${f(head[0] + 6)} ${f(head[1])}l6 -1M${f(head[0] + 12)} ${f(head[1] - 1)}l3 -3M${f(head[0] + 12)} ${f(head[1] - 1)}l3 2"/>` +
      `<path d="${grass}"/>`
    );
  },

  // ---- Manus manum lavat
  hands: () =>
    `<path d="M4 62L38 46L48 64L14 82Z"/><path d="M116 62L82 46L72 64L106 82Z"/>` +
    `<ellipse cx="60" cy="56" rx="21" ry="12"/>` +
    `<path d="M48 50V63M55 47V64M62 47V64M69 50V63" stroke-width="1.3"/>` +
    `<path class="af" d="M60 18q-4 7 0 10q4 -3 0 -10zM44 26q-3 6 0 8q3 -2 0 -8zM76 26q-3 6 0 8q3 -2 0 -8z"/>`,

  // ---- Cum grano salis
  salt: () =>
    `<path d="M46 40Q46 20 60 20Q74 20 74 40V80Q74 90 60 90Q46 90 46 80Z"/>` +
    `<path d="M44 40H76V46H44Z"/><path d="M50 26H70"/>` +
    `<circle class="k" cx="55" cy="30" r="1.4"/><circle class="k" cx="60" cy="30" r="1.4"/><circle class="k" cx="65" cy="30" r="1.4"/>` +
    `<path d="M52 62H68M52 70H68"/>` +
    `<path class="a" d="M92 60l2 -3l3 2l-1 3zM100 68l2 -3l3 2l-1 3zM88 74l2 -3l3 2l-1 3z"/>` +
    `<circle class="af" cx="18" cy="84" r="1.6"/><circle class="af" cx="26" cy="90" r="1.6"/><circle class="af" cx="34" cy="86" r="1.6"/>`,

  // ---- Et in Arcadia ego
  tomb: () =>
    `<path d="M24 90V58H96V90Z"/><path d="M20 58H100V50H20Z"/>` +
    `<circle cx="60" cy="34" r="10"/><path d="M52 44H68V48H52Z"/><path class="k" d="M55 32a2.4 2.6 0 1 0 0.1 0zM65 32a2.4 2.6 0 1 0 0.1 0z"/><path d="M58 40h4"/>` +
    `<path class="a" d="M38 68H82M44 76H76"/>` +
    `<path d="M104 92L100 28Q100 16 110 20"/>` +
    `<path d="M6 92H114M12 92l2 -7M18 92l-1 -6"/>`,

  // ---- Hic Rhodus, hic salta
  leap: () =>
    `<path d="M4 90H116"/><path d="M22 84Q56 -16 90 84" stroke-dasharray="2 3.5"/>` +
    `<circle cx="56" cy="28" r="5"/><path d="M56 33V54M56 38L46 28M56 38L66 28M56 54L48 66L42 62M56 54L64 66L70 62"/>` +
    `<path class="a" d="M22 90V76M92 90V70L104 74L92 78"/>`,

  // ---- Hic sunt leones
  'lion-map': () => {
    let mane = '';
    for (let i = 0; i < 16; i++) {
      const a = rad(i * 22.5), r1 = i % 2 ? 11 : 17;
      mane += `${i ? 'L' : 'M'}${f(84 + r1 * Math.cos(a))} ${f(34 + r1 * Math.sin(a))}`;
    }
    return (
      `<path d="M8 12H112V88H8Z"/>` +
      `<path d="M8 62Q28 48 44 60Q58 72 74 54Q90 44 112 52"/>` +
      `<path d="M16 76q6 -4 12 0t12 0 12 0M60 80q6 -4 12 0t12 0 12 0" stroke-width="1.2"/>` +
      star(26, 30, 11, 4, 'a') +
      `<path d="${mane}Z"/><circle cx="84" cy="34" r="8"/>` +
      `<circle class="k" cx="81" cy="32" r="1.2"/><circle class="k" cx="87" cy="32" r="1.2"/>` +
      `<path class="k" d="M82 36H86L84 39Z"/>`
    );
  },

  // ---- Margaritas ante porcos
  'pig-pearl': () =>
    `<circle cx="60" cy="42" r="24"/>` +
    `<path d="M40 28L34 12L52 22ZM80 28L86 12L68 22Z"/>` +
    `<ellipse cx="60" cy="52" rx="12" ry="8"/>` +
    `<circle class="k" cx="55" cy="52" r="1.5"/><circle class="k" cx="65" cy="52" r="1.5"/>` +
    `<circle class="k" cx="51" cy="38" r="2"/><circle class="k" cx="69" cy="38" r="2"/>` +
    [[20, 88], [38, 92], [56, 88], [74, 92], [92, 88]].map(([x, y]) => `<circle class="a" cx="${x}" cy="${y}" r="4.5"/><path class="a" d="M${x - 2} ${y - 1}q1 -2 3 -2" stroke-width="1"/>`).join(''),

  // ---- Navigare necesse est
  ship: () =>
    `<path d="M14 66H106Q100 82 84 84H36Q20 82 14 66Z"/>` +
    `<path d="M60 66V10"/><path d="M60 14Q94 28 92 62H60Z"/><path d="M60 22Q30 34 30 58H60"/>` +
    `<path d="M60 26Q72 34 74 58M60 26Q78 44 80 60" stroke-width="1"/>` +
    `<path class="af" d="M60 10L76 15L60 20Z"/>` +
    `<path d="M4 94q8 -6 16 0t16 0 16 0 16 0 16 0 16 0 16 0"/>`,

  // ---- Omnia mea mecum porto
  snail: () => {
    let sp = '';
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * 5 * Math.PI;
      const r = 1 + 2.1 * t;
      sp += (i ? 'L' : 'M') + `${f(50 + r * Math.cos(t))} ${f(50 + r * Math.sin(t))}`;
    }
    return (
      `<circle cx="50" cy="50" r="30"/>` +
      `<path class="a" d="${sp}"/>` +
      `<path d="M12 84Q40 88 72 84Q96 82 102 70Q106 60 98 56Q92 54 90 62"/>` +
      `<path d="M98 56L104 42M92 58L92 44"/><circle cx="104" cy="41" r="2.2"/><circle cx="92" cy="43" r="2.2"/>` +
      `<path d="M8 90H112"/>`
    );
  },

  // ---- Quod licet Iovi
  bull: () =>
    `<path d="M42 30Q60 24 78 30Q88 44 82 60Q76 78 60 82Q44 78 38 60Q32 44 42 30Z"/>` +
    `<path d="M40 30Q20 30 14 12Q26 18 38 24M80 30Q100 30 106 12Q94 18 82 24"/>` +
    `<path d="M39 42Q24 46 22 36Q30 34 39 38M81 42Q96 46 98 36Q90 34 81 38"/>` +
    `<circle class="k" cx="50" cy="44" r="2.4"/><circle class="k" cx="70" cy="44" r="2.4"/>` +
    `<ellipse cx="60" cy="68" rx="14" ry="10"/><circle class="k" cx="55" cy="68" r="1.7"/><circle class="k" cx="65" cy="68" r="1.7"/>` +
    `<circle class="a" cx="60" cy="86" r="5"/>` +
    `<path class="af" d="M56 2L47 18H57L51 32L70 12H60L66 2Z"/>`,

  // ---- Cornu copiae
  horn: () =>
    `<g transform="translate(0 8)">` +
    `<path d="M16 22Q6 62 40 82Q78 98 108 70"/><path d="M42 16Q32 48 58 64Q82 74 108 70"/><path d="M16 22Q28 12 42 16"/>` +
    `<circle class="af" cx="26" cy="10" r="6"/>` +
    [[38, 6], [44, 12], [50, 6], [41, 0], [47, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4"/>`).join('') +
    `<path d="M52 20Q60 8 68 12Q62 20 52 20M60 26Q70 16 78 22"/>` +
    `<path d="M30 20L24 34M34 20L30 34" stroke-width="1.2"/>` +
    `</g>`,

  // ---- Rex regnat, sed non gubernat
  throne: () => {
    let helm = `<circle cx="92" cy="54" r="17"/><circle cx="92" cy="54" r="4"/>`;
    for (let i = 0; i < 8; i++) {
      const a = rad(i * 45);
      helm += `<path d="M${f(92 + 4 * Math.cos(a))} ${f(54 + 4 * Math.sin(a))}L${f(92 + 24 * Math.cos(a))} ${f(54 + 24 * Math.sin(a))}"/>`;
    }
    return (
      `<path d="M22 88V26Q22 12 36 12Q50 12 50 26V88"/><path d="M14 68H66V88H14Z"/><path d="M14 56V68M66 56V68"/>` +
      `<path class="a" d="M28 68L28 58L33 63L38 55L43 63L48 58L48 68Z"/>` +
      helm + `<path d="M92 71V94"/>`
    );
  },

  // ---- Sator arepo
  sator: () => {
    const rows = ['SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS'];
    let g = `<path d="M18 8H98V88H18Z"/>`;
    for (let i = 1; i < 5; i++) g += `<path d="M${18 + i * 16} 8V88M18 ${8 + i * 16}H98" stroke-width="0.9"/>`;
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      const cls = x === 2 && y === 2 ? ' class="r"' : '';
      g += `<text${cls} x="${26 + x * 16}" y="${21.5 + y * 16}" text-anchor="middle" font-size="12.5" font-weight="700">${ch}</text>`;
    }));
    return g;
  },

  // ---- Damoclis gladius
  'sword-hair': () =>
    `<path d="M14 6H106"/><path d="M60 6V25" stroke-dasharray="1.5 2.2" stroke-width="1.1"/>` +
    `<circle cx="60" cy="28" r="3"/><path d="M60 31V39"/><path d="M50 40H70" stroke-width="3"/>` +
    `<path d="M54 42L66 42L60 68Z"/><path d="M60 44V62" stroke-width="1"/>` +
    `<circle cx="60" cy="86" r="8"/><path class="a" d="M52 80L52 72L56 76L60 70L64 76L68 72L68 80Z"/>`,

  // ---- Duobus certantibus
  'dogs-bone': () => {
    const dogHead = (tx, ty, sc, flip) =>
      `<g transform="translate(${tx} ${ty}) scale(${flip ? -sc : sc} ${sc}) translate(-60 -50)" stroke-width="${f(1.7 / sc)}">` +
      `<path d="M60 22C44 22 36 32 36 46C36 58 40 68 46 76C50 82 54 84 60 84C66 84 70 82 74 76C80 68 84 58 84 46C84 32 76 22 60 22Z"/>` +
      `<path d="M40 30C28 28 18 40 20 60C22 66 30 66 34 58C38 50 38 40 42 34"/>` +
      `<path d="M80 30C92 28 102 40 100 60C98 66 90 66 86 58C82 50 82 40 78 34"/>` +
      `<circle class="k" cx="49" cy="46" r="2.5"/><circle class="k" cx="71" cy="46" r="2.5"/>` +
      `<path d="M43 40L54 44M77 40L66 44"/>` +
      `<ellipse cx="60" cy="66" rx="13" ry="10"/><path class="k" d="M53 60Q60 55 67 60Q64 68 60 69Q56 68 53 60Z"/>` +
      `<path d="M52 75L54 82L58 76M68 75L66 82L62 76"/></g>`;
    return (
      dogHead(28, 34, 0.5, false) + dogHead(92, 34, 0.5, true) +
      `<path class="a" d="M48 66H72M45 62a3.6 3.6 0 1 0 0.1 0M45 70a3.6 3.6 0 1 0 0.1 0M75 62a3.6 3.6 0 1 0 0.1 0M75 70a3.6 3.6 0 1 0 0.1 0"/>` +
      dogHead(60, 86, 0.3, false) +
      `<path d="M44 12l6 6M76 12l-6 6M60 6V14" stroke-width="1.2"/>`
    );
  },

  // ---- Ducunt volentem fata
  'dog-cart': () =>
    `<path d="M4 90H116"/>` +
    `<ellipse cx="36" cy="60" rx="15" ry="8"/><circle cx="17" cy="52" r="6"/><path d="M12 54L6 57M17 46L14 40L20 44"/>` +
    `<path d="M26 66L24 88M32 68L32 88M42 68L42 88M48 66L52 88M51 58L60 52"/>` +
    `<path class="a" d="M22 60Q46 74 66 62"/>` +
    `<path d="M66 50H102V72H66Z"/><path d="M66 60H102" stroke-width="1"/>` +
    `<circle cx="74" cy="80" r="9"/><circle cx="96" cy="80" r="9"/><circle cx="74" cy="80" r="2"/><circle cx="96" cy="80" r="2"/>` +
    `<path d="M74 71V89M65 80H83M96 71V89M87 80H105" stroke-width="0.9"/>`,

  // ---- Nec sutor ultra crepidam
  sandal: () =>
    `<path d="M14 88H104"/>` +
    `<path d="M18 88V50Q18 42 28 42H40Q44 56 60 60Q80 62 96 72Q106 78 102 88Z"/>` +
    `<path d="M18 80H34V88M20 68H98" stroke-width="1"/>` +
    `<path class="a" d="M46 54L52 48M54 60L60 54M62 64L68 58"/>` +
    `<path d="M104 26L90 56"/><path d="M104 26l4 -6" stroke-width="3"/>` +
    `<path d="M10 96q4 -3 8 0t8 0" stroke-width="1"/>`,

  // ---- Otia dant vitia
  hammock: () =>
    `<path d="M16 94Q20 62 26 24M26 24Q14 22 6 30M26 24Q34 14 44 18M26 24Q20 12 10 10M26 24Q40 24 46 32"/>` +
    `<path d="M104 94Q100 62 94 24M94 24Q106 22 114 30M94 24Q86 14 76 18M94 24Q100 12 110 10M94 24Q80 24 74 32"/>` +
    `<path d="M26 48Q60 88 94 48M26 54Q60 94 94 54"/>` +
    `<path d="M34 55L34 62M44 61L44 70M54 65L54 74M66 65L66 74M76 61L76 70M86 55L86 62" stroke-width="1"/>` +
    `<path class="a" d="M52 64Q60 58 68 64"/>` +
    `<path d="M40 44l3 -6M80 42l-3 -6" stroke-width="1.2"/>`,

  // ---- Sub specie aeternitatis
  eye: () => {
    let rays = '';
    for (let i = 0; i < 16; i++) {
      const a = rad(i * 22.5 - 90);
      rays += `M${f(60 + 40 * Math.cos(a))} ${f(54 + 40 * Math.sin(a))}L${f(60 + 48 * Math.cos(a))} ${f(54 + 48 * Math.sin(a))}`;
    }
    return (
      `<path d="M60 10L102 82H18Z"/>` +
      `<path d="M40 58Q60 40 80 58Q60 76 40 58Z"/><circle cx="60" cy="58" r="6.5"/><circle class="k" cx="60" cy="58" r="3"/>` +
      `<path class="a" d="${rays}"/>`
    );
  },

  // ---- Tempus edax rerum
  scythe: () =>
    `<path d="M46 96L90 16"/><path class="a" d="M90 16Q116 6 118 32Q102 24 82 32Z"/>` +
    `<path d="M10 24H34M10 78H34"/><path d="M13 24C13 40 31 48 31 51C31 54 13 62 13 78M31 24C31 40 13 48 13 51C13 54 31 62 31 78"/>` +
    `<path d="M17 68Q22 62 27 68M19 32H25" stroke-width="1"/>`,

  // ---- Vanitas
  bubble: () =>
    `<circle cx="60" cy="38" r="30"/><path d="M40 26Q46 18 56 16" /><path d="M44 30Q47 26 51 25" stroke-width="1"/>` +
    `<path class="a" d="M88 20l3 -5M91 26l7 -1M86 14l5 -1"/>` +
    `<path d="M60 68V74" stroke-dasharray="1.5 2.5"/>` +
    `<path d="M60 76C50 76 44 84 46 92C47 96 50 96 51 99H69C70 96 73 96 74 92C76 84 70 76 60 76Z"/>` +
    `<path class="k" d="M54 88a2 2.4 0 1 0 0.1 0M66 88a2 2.4 0 1 0 0.1 0"/>`,

  // ---- Auribus teneo lupum
  'wolf-hold': () =>
    ILL.wolf() +
    `<circle class="a" cx="28" cy="12" r="5.5"/><circle class="a" cx="92" cy="12" r="5.5"/>` +
    `<path class="a" d="M23 14L10 6M97 14L110 6"/>`,

  // ---- Tabula rasa
  tablet: () =>
    `<path d="M20 22H100V86H20Z"/><path d="M29 31H91V77H29Z"/>` +
    `<circle cx="24.5" cy="26.5" r="1.4"/><circle cx="95.5" cy="26.5" r="1.4"/><circle cx="24.5" cy="81.5" r="1.4"/><circle cx="95.5" cy="81.5" r="1.4"/>` +
    `<path d="M36 40H62M36 47H76M36 54H54" stroke-width="1.1"/>` +
    `<path class="a" d="M58 60Q72 52 88 62M54 70Q72 62 86 72" stroke-width="1.4"/>` +
    `<path d="M64 96L104 58"/><path d="M104 58L110 52L116 58L110 64Z"/>`,
};

export function illustrationSVG(key) {
  const fn = ILL[key];
  if (!fn) throw new Error('Нет иллюстрации: ' + key);
  return `<svg class="ill-svg" viewBox="0 0 120 100" aria-hidden="true" focusable="false">${fn()}</svg>`;
}
