// Список всех фраз в виде таблицы: node scripts/make-index.mjs → docs/phrases.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVELS, MN } from '../src/meta.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/cards.json'), 'utf8'));
const stress = (s) => s.replace(/([а-яё])'/gi, '$1́');
const cell = (s) => String(s).replace(/\|/g, '/');

let md = `# 200 фраз «Arbor Latina»\n\nТаблица собрана автоматически (\`node scripts/make-index.mjs\`) из файлов \`src/data/level*.js\`.\n\n`;
for (const L of LEVELS) {
  const cs = cards.filter((c) => c.level === L.n);
  md += `## ${L.roman}. ${L.la} — ${L.ru} (${cs.length})\n\n_${L.tag}_\n\n`;
  md += '| № | Фраза | Перевод | По-русски | Мнемоника | Области жизни | Рисунок |\n|---:|---|---|---|---|---|:---:|\n';
  for (const c of cs) {
    md += `| ${c.n} | **${cell(c.la)}** | ${cell(c.ru)} | ${cell(stress(c.tr))} | ${MN[c.mn.t].label} | ${cell(c.dom.join(', '))} | ${c.ill ? '●' : ''} |\n`;
  }
  md += '\n';
}
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/phrases.md'), md);
console.log(`docs/phrases.md: ${cards.length} фраз`);
