import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SP = '/tmp/claude-0/-home-user-latincites/15c28b38-db54-52b3-b1ca-95a528088c6c/scratchpad';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 900, height: 820 } });
await p.goto('file://' + path.join(ROOT, 'dist/index.html'));
const times = [900, 2200, 3600, 5000, 7600];
let prev = 0;
const files = [];
for (const t of times) {
  await p.waitForTimeout(t - prev); prev = t;
  const f = `${SP}/a-${t}.png`;
  await p.screenshot({ path: f, clip: { x: 0, y: 0, width: 900, height: 820 } });
  files.push(f);
}
await b.close();
console.log(files.join('\n'));
