// PDF: node scripts/pdf.mjs → dist/arbor-latina.pdf
// Два прохода: сначала считаем, на какой странице начинается каждая карточка,
// затем подставляем номера в оглавление и указатель и печатаем окончательно.
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SP = '/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad';
const out = path.join(ROOT, 'dist/arbor-latina.pdf');
const tmp = path.join(SP, 'pass1.pdf');
const cardsJson = path.join(ROOT, 'dist/cards.json');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
await page.goto('file://' + path.join(ROOT, 'dist/index.html'));
await page.emulateMedia({ media: 'print' });
await page.evaluate(async () => {
  document.querySelectorAll('details.more').forEach((d) => (d.open = true));
  await document.fonts.ready;
});

const opts = { width: '148mm', height: '210mm', printBackground: true, preferCSSPageSize: true };
fs.writeFileSync(tmp, await page.pdf(opts));
const run = (file) => JSON.parse(execFileSync('python3', [path.join(ROOT, 'scripts/pdfmap.py'), file, cardsJson], { maxBuffer: 1 << 26 }).toString());
const first = run(tmp);

await page.evaluate((map) => {
  document.querySelectorAll('[data-page-of]').forEach((el) => {
    const v = map[el.getAttribute('data-page-of')];
    if (v) el.textContent = v;
  });
}, first.map);
fs.writeFileSync(out, await page.pdf(opts));
await browser.close();

const final = run(out);
console.log(`PDF: ${final.pages} стр. → dist/arbor-latina.pdf`);
if (final.missing.length) console.log('Не найдены на страницах:', final.missing.join(', '));
if (final.overflow.length) console.log('ПЕРЕПОЛНЕНИЕ (карточка длиннее страницы):', final.overflow.join(', '));
else console.log('Переполнений нет: каждая карточка = одна страница.');
const drift = Object.keys(first.map).filter((k) => first.map[k] !== final.map[k]);
if (drift.length) console.log('Номера страниц сдвинулись после подстановки:', drift.length);
