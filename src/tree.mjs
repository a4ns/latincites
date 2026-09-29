// Процедурное «дерево, нарисованное чёрной ручкой»: крона, ствол и корни.
// Каждый штрих — отдельный <path pathLength="1"> с собственной задержкой анимации.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

// stage: 1 — корни, 2 — + ствол, 3 — + ветви, 4 — вся крона с листьями (полное дерево)
export function treeSVG({ seed = 7, animated = true, id = 'tree', stage = 4 } = {}) {
  const R = rng(seed);
  const rand = (a, b) => a + (b - a) * R();
  const W = 640, H = 730, GX = 320, GY = 440; // основание ствола

  const strokes = []; // {d, w, delay, dur, cls}
  const leaves = [];  // {d, delay, dur}

  // ---------- ветви (dir = -1 вверх, +1 вниз) ----------
  function branch(x, y, ang, len, gen, maxGen, dir, t0, widths, kind) {
    const dur = (kind === 'root' ? 0.95 : 0.9) * Math.pow(0.82, gen) * 1.5 + 0.25;
    // конечная точка: dir = -1 вверх, +1 вниз; угол отсчитывается от вертикали
    const ex = x + Math.sin(ang) * len;
    const yy = y + dir * Math.cos(ang) * len;
    const dx = ex - x, dy = yy - y, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L; // нормаль к ветви
    const bend = rand(-0.22, 0.22) * len;
    const c1x = x + dx * 0.33 + nx * bend, c1y = y + dy * 0.33 + ny * bend;
    const c2x = x + dx * 0.7 + nx * bend * 0.6, c2y = y + dy * 0.7 + ny * bend * 0.6;
    const w = widths[Math.min(gen, widths.length - 1)];
    strokes.push({
      d: `M${f(x)} ${f(y)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(ex)} ${f(yy)}`,
      w, delay: t0, dur, gen, kind, x0: x, y0: y, x1: ex, y1: yy,
    });
    if (gen >= maxGen) {
      if (kind === 'crown') addLeaves(ex, yy, ang, t0 + dur);
      return;
    }
    const n = gen === 0 && kind === 'crown' ? 3 : R() < 0.3 ? 3 : 2;
    const spread = kind === 'crown' ? (gen === 0 ? 0.78 : gen === 1 ? 0.6 : 0.5) : 0.5;
    for (let i = 0; i < n; i++) {
      const frac = n === 1 ? 0 : i / (n - 1) - 0.5; // -0.5..0.5
      const na = ang + frac * 2 * spread * rand(0.75, 1.2) + rand(-0.09, 0.09) + (kind === 'root' ? 0.03 : 0);
      const nl = len * (kind === 'crown' ? rand(0.74, 0.88) : rand(0.66, 0.8));
      branch(ex, yy, na, nl, gen + 1, maxGen, dir, t0 + dur * rand(0.55, 0.8), widths, kind);
    }
    // иногда — боковой короткий побег из середины
    if (gen >= 1 && gen < maxGen - 1 && R() < 0.35) {
      const mx = x + (ex - x) * 0.55, my = y + (yy - y) * 0.55;
      const sa = ang + (R() < 0.5 ? -1 : 1) * rand(0.6, 0.95);
      branch(mx, my, sa, len * rand(0.35, 0.5), gen + 2, maxGen, dir, t0 + dur * 0.5, widths, kind);
    }
  }

  function addLeaves(x, y, ang, t) {
    const n = R() < 0.5 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const a = ang + rand(-1.2, 1.2) - Math.PI / 2;
      const s = rand(10, 17);
      const ca = Math.cos(a), sa = Math.sin(a);
      const p = (px, py) => `${f(x + px * ca - py * sa)} ${f(y + px * sa + py * ca)}`;
      const d =
        `M${p(0, 0)}Q${p(s * 0.5, -s * 0.5)} ${p(s, 0)}Q${p(s * 0.5, s * 0.5)} ${p(0, 0)}` +
        `M${p(s * 0.08, 0)}L${p(s * 0.78, 0)}`;
      leaves.push({ d, delay: t + rand(0.05, 0.9), dur: rand(0.35, 0.6) });
    }
  }

  // крона
  const crownW = [10, 6.2, 4, 2.7, 1.9, 1.3, 1];
  branch(GX, GY, rand(-0.03, 0.03), 108, 0, 6, -1, 0, crownW, 'crown');
  // корни — три «главных» + боковые
  const rootW = [7.5, 4.4, 2.6, 1.6, 1.1];
  const rootAngles = [-1.25, -0.7, -0.2, 0.22, 0.72, 1.28];
  for (const ra of rootAngles) {
    branch(GX + rand(-6, 6), GY, ra + rand(-0.08, 0.08), rand(62, 84), 0, 4, +1, 0.5 + R() * 0.7, rootW, 'root');
  }

  // ---------- кора: штриховка на стволе ----------
  const bark = [];
  for (let i = 0; i < 16; i++) {
    const yy = GY - 6 - i * 5.5 + rand(-1, 1);
    const side = R() < 0.5 ? -1 : 1;
    const off = side * rand(1.6, 4.2);
    const l = rand(6, 15);
    bark.push({
      d: `M${f(GX + off)} ${f(yy)}q${f(rand(-1.4, 1.4))} ${f(-l / 2)} ${f(rand(-1, 1))} ${f(-l)}`,
      delay: rand(0.5, 1.6), dur: 0.4,
    });
  }

  // ---------- земля ----------
  const ground = [
    { d: `M${GX - 150} ${GY + 1}q40 -5 82 0t70 0 60 1 62 -1t56 0`, w: 2.2, delay: 0.1, dur: 1.4 },
    { d: `M${GX - 200} ${GY + 8}q30 3 60 0`, w: 1.1, delay: 0.4, dur: 0.8 },
    { d: `M${GX + 118} ${GY + 9}q34 -3 66 1`, w: 1.1, delay: 0.5, dur: 0.8 },
    { d: `M${GX - 100} ${GY + 16}q20 2 46 0`, w: 0.9, delay: 0.7, dur: 0.6 },
    { d: `M${GX + 60} ${GY + 18}q22 -2 50 1`, w: 0.9, delay: 0.8, dur: 0.6 },
  ];

  const S = (o, cls) =>
    `<path class="s ${cls}" pathLength="1" d="${o.d}" style="stroke-width:${o.w};--d:${f(o.delay)}s;--t:${f(o.dur)}s"/>`;

  // какие штрихи входят в выбранную стадию
  const inStage = (s) =>
    s.kind === 'root' ||
    (s.kind === 'crown' && (stage >= 4 || (stage >= 3 && s.gen <= 3) || (stage >= 2 && s.gen === 0)));
  const st = strokes.filter(inStage);
  const showLeaves = stage >= 4;
  const showBark = stage >= 2;

  const parts = [];
  parts.push(`<g class="t-ground">${ground.map((g) => S(g, 'g')).join('')}</g>`);
  parts.push(`<g class="t-roots">${st.filter((s) => s.kind === 'root').map((s) => S(s, 'r')).join('')}</g>`);
  parts.push(`<g class="t-crown">${st.filter((s) => s.kind === 'crown').map((s) => S(s, 'c')).join('')}</g>`);
  if (showBark) parts.push(`<g class="t-bark">${bark.map((b) => S({ ...b, w: 0.9 }, 'b')).join('')}</g>`);
  if (showLeaves) parts.push(`<g class="t-leaves">${leaves.map((l) => S({ ...l, w: 0.8 }, 'l')).join('')}</g>`);

  // рамка: для полного дерева — фиксированная, для стадий — по нарисованному
  let vb = `0 0 ${W} ${H}`;
  if (stage < 4) {
    let x0 = GX - 200, x1 = GX + 200, y0 = GY - 12, y1 = GY + 20;
    for (const s of st) {
      x0 = Math.min(x0, s.x0, s.x1); x1 = Math.max(x1, s.x0, s.x1);
      y0 = Math.min(y0, s.y0, s.y1); y1 = Math.max(y1, s.y0, s.y1);
    }
    vb = `${f(x0 - 14)} ${f(y0 - 14)} ${f(x1 - x0 + 28)} ${f(y1 - y0 + 28)}`;
  }

  return (
    `<svg ${id ? `id="${id}" ` : ''}class="tree${animated ? ' animated' : ''}" viewBox="${vb}" role="img" ` +
    `aria-label="Дерево с корнями, нарисованное чёрной ручкой">` +
    `<defs><filter id="${id}-wob" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter></defs>` +
    `<g filter="url(#${id}-wob)">${parts.join('')}</g></svg>`
  );
}
