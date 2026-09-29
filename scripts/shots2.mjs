import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SP = '/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad';
const url = 'file://' + path.join(ROOT, 'dist/index.html');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
async function page(w, h, o = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: o.dpr || 1, colorScheme: o.dark ? 'dark' : 'light' });
  const p = await c.newPage();
  await p.goto(url);
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important} .tree.animated path.s{animation:none!important;stroke-dashoffset:0!important} .hero h1,.hero .sub,.hero .lead,.hero .lv-row{animation:none!important}' });
  return p;
}
const shots = [
  ['lvl2', 1280, 900, '#level-2', false, null],
  ['lvl4', 1280, 900, '#level-4', false, null],
  ['long', 1280, 1000, '#eheu-fugaces-labuntur-anni', false, '#eheu-fugaces-labuntur-anni'],
  ['sator', 1280, 1000, '#sator-arepo-tenet-opera-rotas', false, '#sator-arepo-tenet-opera-rotas'],
  ['dark', 1280, 1000, '#alea-iacta-est', true, '#alea-iacta-est'],
];
for (const [name, w, h, sel, dark, open] of shots) {
  const p = await page(w, h, { dark });
  await p.evaluate((s) => document.querySelector(s).scrollIntoView(), sel);
  if (open) await p.evaluate((s) => { document.querySelector(s + ' details').open = true; }, open);
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${SP}/w-${name}.png` });
}
const m = await page(390, 844, { dpr: 2 });
await m.evaluate(() => document.querySelector('#level-3').scrollIntoView());
await m.waitForTimeout(200);
await m.screenshot({ path: `${SP}/w-m-lvl3.png` });
await m.evaluate(() => { document.querySelector('#navigare-necesse-est').scrollIntoView(); });
await m.waitForTimeout(200);
await m.screenshot({ path: `${SP}/w-m-long.png` });
await b.close();
console.log('ok');
