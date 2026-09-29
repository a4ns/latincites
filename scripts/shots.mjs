// Скриншоты веб-версии: node scripts/shots.mjs [hero|cards|mobile|all]
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SP = '/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad';
const what = process.argv[2] || 'all';
const url = 'file://' + path.join(ROOT, 'dist/index.html');

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });

async function page(w, h, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dpr || 1, colorScheme: opts.dark ? 'dark' : 'light' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.error('PAGEERROR', e.message));
  p.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));
  await p.goto(url);
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  return p;
}

if (what === 'hero' || what === 'all') {
  const p = await page(1280, 900);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${SP}/hero-mid.png` });
  await p.waitForTimeout(6500);
  await p.screenshot({ path: `${SP}/hero.png` });
}
if (what === 'cards' || what === 'all') {
  const p = await page(1280, 1000);
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.tree path.s').forEach((e) => (e.style.animation = 'none')));
  await p.evaluate(() => document.querySelector('#level-1').scrollIntoView());
  await p.evaluate(() => { document.querySelector('#alea-iacta-est details').open = true; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${SP}/cards.png` });
  await p.evaluate(() => document.querySelector('#carpe-diem').scrollIntoView());
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${SP}/cards2.png` });
}
if (what === 'mobile' || what === 'all') {
  const p = await page(390, 844, { dpr: 2 });
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.tree path.s').forEach((e) => (e.style.animation = 'none')));
  await p.evaluate(() => document.querySelector('#veni-vidi-vici').scrollIntoView());
  await p.evaluate(() => { document.querySelector('#veni-vidi-vici details').open = true; });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${SP}/mobile.png` });
  const w = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  console.log('scrollWidth vs innerWidth', w);
}
await b.close();
console.log('shots ok');
