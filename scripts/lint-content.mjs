// Линтер содержания: ищет то, что легко пропустить глазами.
// node scripts/lint-content.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/cards.json'), 'utf8'));

const problems = [];
const add = (c, msg) => problems.push(`[${c.n}] ${c.la}: ${msg}`);

const TEXT_FIELDS = ['ru', 'lit', 'hist', 'now', 'gram', 'fake'];
const RUS_VOWELS = /[аеёиоуыэюя]/gi;

for (const c of cards) {
  const texts = [
    ...TEXT_FIELDS.map((k) => [k, c[k]]),
    ['mn', c.mn.x],
    ...c.words.flatMap((w, i) => [[`words[${i}].m`, w[1]], [`words[${i}].d`, w[2]]]),
  ].filter(([, v]) => v);

  for (const [k, v] of texts) {
    // черновые пометки
    if (/[а-яa-z]\?\s+—\s*нет|\bTODO\b/.test(v)) add(c, `черновая пометка в ${k}: «${v.slice(0, 80)}»`);
    // смесь кириллицы и латиницы внутри одного слова (не через дефис/пробел)
    for (const m of v.matchAll(/[А-Яа-яЁё][A-Za-z]|[A-Za-z][А-Яа-яЁё]/g)) {
      add(c, `смесь алфавитов в ${k}: «…${v.slice(Math.max(0, m.index - 12), m.index + 14)}…»`);
    }
    if (/ {2,}/.test(v)) add(c, `двойной пробел в ${k}`);
    if (/\s[,.;:!?]/.test(v)) add(c, `пробел перед знаком препинания в ${k}`);
    if (/[«»]/.test(v) && (v.match(/«/g) || []).length !== (v.match(/»/g) || []).length) add(c, `непарные «» в ${k}`);
    if (/(^|[^.…])\.\.(?!\.)/.test(v)) add(c, `двойная точка в ${k}`);
    if (v.length > 0 && !/[.!?»)…”’]$/.test(v.trim()) && k !== 'lit' && !k.startsWith('words') && k !== 'ru') add(c, `нет точки в конце ${k}`);
  }

  // ударения в русской транскрипции: у каждого слова с ≥2 гласными должно быть ударение
  for (const tok of c.tr.split(/[\s,]+/).filter(Boolean)) {
    const v = (tok.match(RUS_VOWELS) || []).length;
    if (v >= 2 && !tok.includes("'")) add(c, `в слове «${tok}» транскрипции нет ударения`);
    if ((tok.match(/'/g) || []).length > 1) add(c, `в слове «${tok}» больше одного ударения`);
  }

  // число слов в русской транскрипции = числу слов в латинской фразе
  const laWords = c.la.replace(/[,.?!—–-]/g, ' ').split(/\s+/).filter(Boolean);
  const trWords = c.tr.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  if (laWords.length !== trWords.length) add(c, `слов в латыни ${laWords.length}, в транскрипции ${trWords.length}`);

  // английская запись: по слову на слово; в каждом слове ≥2 слогов — хотя бы один ударный (заглавные)
  const enWords = c.en.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  if (laWords.length !== enWords.length) add(c, `слов в латыни ${laWords.length}, в английской записи ${enWords.length}`);
  for (const w of enWords) {
    const syl = w.split('-').length;
    if (syl >= 2 && !/[A-Z]{2,}/.test(w)) add(c, `в английской записи «${w}» нет ударного слога`);
  }

  // мнемоника не должна быть пустой болтовнёй
  if (c.mn.x.length < 60) add(c, 'слишком короткая мнемоника');
  if (c.mn.x.length > 420) add(c, `слишком длинная мнемоника (${c.mn.x.length})`);
  if (c.hist.length > 560) add(c, `длинная история (${c.hist.length})`);
  if (c.dom.length < 1) add(c, 'нет областей жизни');
  if (c.words.length < 2 && c.level < 2) add(c, 'один разбор слова');
}

// повторы одинаковых ярких образов
const seen = new Map();
for (const c of cards) {
  const key = c.ill;
  if (!key) continue;
  if (seen.has(key)) add(c, `иллюстрация «${key}» уже использована в №${seen.get(key)}`);
  else seen.set(key, c.n);
}

const domCount = {};
for (const c of cards) for (const d of c.dom) domCount[d] = (domCount[d] || 0) + 1;
const mnCount = {};
for (const c of cards) mnCount[c.mn.t] = (mnCount[c.mn.t] || 0) + 1;
const fakeN = cards.filter((c) => c.fake).length;

console.log(problems.length ? problems.join('\n') : 'Замечаний нет');
console.log('\n— области жизни:', JSON.stringify(domCount, null, 0));
console.log('— типы мнемоник:', JSON.stringify(mnCount));
console.log(`— «как цитируют неверно» есть у ${fakeN} из ${cards.length}`);
console.log(`— иллюстраций: ${cards.filter((c) => c.ill).length}`);
console.log(`— всего замечаний: ${problems.length}`);
