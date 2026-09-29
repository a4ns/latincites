// Сборка: данные → проверка → единый HTML (dist/index.html).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderDocument } from './src/render.mjs';
import { ILL } from './src/illustrations.mjs';
import { DOMAINS, MN } from './src/meta.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const strict = process.argv.includes('--strict');

// ---------- данные ----------
const cards = [];
for (let lv = 1; lv <= 4; lv++) {
  const file = path.join(ROOT, `src/data/level${lv}.js`);
  if (!fs.existsSync(file)) continue;
  const mod = await import(pathToFileURL(file).href);
  for (const c of mod.default) cards.push({ ...c, level: lv });
}
cards.forEach((c, i) => (c.n = i + 1));

// ---------- проверка ----------
const errors = [];
const warn = [];
const ids = new Set();
const byId = Object.fromEntries(cards.map((c) => [c.id, c]));
const CYR = /^[а-яё ,.\-!?'—]+$/i;
const EN = /^[A-Za-z ,.\-!?'—]+$/;
for (const c of cards) {
  const at = `[${c.n}] ${c.la}`;
  if (ids.has(c.id)) errors.push(`${at}: повтор id`);
  ids.add(c.id);
  for (const k of ['id', 'la', 'ru', 'tr', 'en', 'hist', 'now', 'gram']) if (!c[k]) errors.push(`${at}: нет поля ${k}`);
  if (!c.mn || !MN[c.mn.t] || !c.mn.x) errors.push(`${at}: неверная мнемоника`);
  if (!Array.isArray(c.dom) || c.dom.length < 1 || c.dom.length > 3) errors.push(`${at}: dom должен быть из 1–3 значений`);
  for (const d of c.dom || []) if (!DOMAINS.includes(d)) errors.push(`${at}: неизвестная область «${d}»`);
  if (!Array.isArray(c.words) || c.words.length < 1) errors.push(`${at}: нет разбора слов`);
  for (const w of c.words || []) if (w.length !== 3 || w.some((x) => !x)) errors.push(`${at}: слово должно быть [лат, значение, потомки]`);
  if (c.tr && !CYR.test(c.tr)) errors.push(`${at}: в транскрипции посторонние символы «${c.tr}»`);
  if (c.tr && !/[а-яё]'/i.test(c.tr)) warn.push(`${at}: в транскрипции нет ударения`);
  if (c.en && !EN.test(c.en)) errors.push(`${at}: в английской записи посторонние символы «${c.en}»`);
  if (c.en && !/[A-Z]{2,}/.test(c.en)) warn.push(`${at}: в английской записи нет ударного слога заглавными`);
  if (c.ill && !ILL[c.ill]) errors.push(`${at}: нет иллюстрации ${c.ill}`);
  if (c.tr && c.la && c.tr.split(/\s+/).length !== c.la.replace(/[,.?!—–-]/g, ' ').split(/\s+/).filter(Boolean).length) {
    warn.push(`${at}: число слов в транскрипции не совпадает с латынью`);
  }
}
for (const c of cards) {
  for (const r of c.rel || []) {
    if (!byId[r]) (strict ? errors : warn).push(`[${c.n}] ${c.la}: связанная фраза «${r}» не найдена`);
  }
}
if (strict) {
  for (const lv of [1, 2, 3, 4]) {
    const n = cards.filter((c) => c.level === lv).length;
    if (n !== 50) errors.push(`уровень ${lv}: ${n} фраз вместо 50`);
  }
  const ills = cards.filter((c) => c.ill).length;
  if (ills < 55 || ills > 70) warn.push(`иллюстраций ${ills} (план ~60)`);
}
warn.forEach((w) => console.warn('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  process.exit(1);
}

// ---------- шрифты ----------
const fontsDir = path.join(ROOT, 'src/fonts');
const fonts = JSON.parse(fs.readFileSync(path.join(fontsDir, 'fonts.json'), 'utf8'));
const fontCss = fonts
  .map(([fam, style, , fn, range]) => {
    const b64 = fs.readFileSync(path.join(fontsDir, fn)).toString('base64');
    const w = fam === 'EB Garamond' ? '400 800' : '300 700';
    return `@font-face{font-family:'${fam}';font-style:${style};font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${range}}`;
  })
  .join('\n');

const css =
  fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8') +
  '\n' +
  fs.readFileSync(path.join(ROOT, 'src/print.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8');

const html = renderDocument({ cards, css, js, fontCss });
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
fs.writeFileSync(path.join(ROOT, 'dist/cards.json'), JSON.stringify(cards, null, 1));
console.log(`OK: ${cards.length} карточек, ${(html.length / 1024).toFixed(0)} КБ → dist/index.html`);
