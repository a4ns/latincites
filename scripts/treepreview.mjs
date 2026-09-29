import { chromium } from 'playwright-core';
import { treeSVG } from '../src/tree.mjs';
import fs from 'node:fs';
const seeds = process.argv.slice(2).map(Number);
const list = seeds.length ? seeds : [7, 11, 23, 42];
const svgs = list.map((s) => `<div style="display:inline-block;width:24%;text-align:center"><div style="font:12px sans-serif">seed ${s}</div>${treeSVG({ seed: s, animated: false, id: 't' + s })}</div>`).join('');
const html = `<html><head><style>
body{background:#f2e8d0;margin:0}
svg{width:100%}
path.s{fill:none;stroke:#1b1510;stroke-linecap:round;stroke-linejoin:round}
</style></head><body>${svgs}</body></html>`;
fs.writeFileSync('/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad/tree.html', html);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1600, height: 660 } });
await p.goto('file:///tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad/tree.html');
await p.screenshot({ path: '/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad/tree.png' });
await b.close();
