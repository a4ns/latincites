// Контактный лист всех иллюстраций: node scripts/illpreview.mjs [ключи...] → scratchpad/ill.png
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { ILL, illustrationSVG } from '../src/illustrations.mjs';

const SP = '/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad';
const only = process.argv.slice(2);
const keys = only.length ? only : Object.keys(ILL);
const cols = Math.min(6, keys.length);
const cells = keys
  .map((k) => `<div class="c"><div class="l">${k}</div>${illustrationSVG(k)}</div>`)
  .join('');
const html = `<html><head><style>
body{background:#f3e9d2;margin:0;padding:12px;font:11px sans-serif;color:#1e1812}
.g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px}
.c{border:1px solid #d8c9a6;padding:4px;text-align:center}
svg{width:100%;height:auto;display:block;color:#1e1812}
.ill-svg{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.ill-svg .a{stroke:#8f2a1d}.ill-svg .af{fill:#8f2a1d;stroke:#8f2a1d}.ill-svg .k{fill:#1e1812;stroke:none}.ill-svg .bg{fill:#ebdfc3}.ill-svg text{fill:#1e1812;stroke:none;font-family:Georgia,serif}.ill-svg text.r{fill:#8f2a1d}
</style></head><body><div class="g">${cells}</div></body></html>`;
fs.writeFileSync(`${SP}/ill.html`, html);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: cols * 230, height: 400 } });
await p.goto(`file://${SP}/ill.html`);
await p.screenshot({ path: `${SP}/ill.png`, fullPage: true });
await b.close();
console.log('ok', keys.length);
