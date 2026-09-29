// Функциональная проверка веб-версии: поиск, фильтры, переход по связанным фразам.
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = 'file://' + path.join(ROOT, 'dist/index.html');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(url);

let fails = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails++;
};
const visible = () => p.evaluate(() => document.querySelectorAll('.card:not([hidden])').length);
const countText = () => p.evaluate(() => document.querySelector('#count').textContent);

check('всего 200 карточек', (await p.evaluate(() => document.querySelectorAll('.card').length)) === 200);
check('4 уровня', (await p.evaluate(() => document.querySelectorAll('.level').length)) === 4);
check('иллюстраций ≥ 55', (await p.evaluate(() => document.querySelectorAll('.card .ill-svg').length)) >= 55);

// поиск по русскому переводу
await p.fill('#q', 'жребий');
check('поиск «жребий»', (await visible()) >= 1 && (await p.evaluate(() => !document.querySelector('#alea-iacta-est').hidden)), await countText());
// поиск по латыни без учёта регистра и диакритики
await p.fill('#q', 'CARPE');
check('поиск «CARPE»', (await visible()) >= 1 && (await p.evaluate(() => !document.querySelector('#carpe-diem').hidden)));
// поиск по транскрипции
await p.fill('#q', 'вени види');
check('поиск по транскрипции', await p.evaluate(() => !document.querySelector('#veni-vidi-vici').hidden));
// поиск по английской записи
await p.fill('#q', 'WAY-nee');
check('поиск по английской записи', await p.evaluate(() => !document.querySelector('#veni-vidi-vici').hidden));
// пустой результат
await p.fill('#q', 'ъъъъъъ');
check('пустой результат', (await visible()) === 0 && (await p.evaluate(() => !document.querySelector('#empty').hidden)));
await p.fill('#q', '');

// уровни
for (const lv of [1, 2, 3, 4]) {
  await p.click(`[data-level-btn="${lv}"]`);
  check(`уровень ${lv}: 50 карточек`, (await visible()) === 50, await countText());
}
await p.click('[data-level-btn="all"]');
check('сброс уровня → 200', (await visible()) === 200);

// области жизни
await p.click('#domBtn');
await p.click('[data-dom-btn="медицина"]');
const med = await visible();
check('фильтр «медицина» даёт результаты', med > 0 && med < 200, `${med} карточек`);
await p.click('[data-dom-btn="право"]');
const both = await visible();
check('два домена — объединение (OR)', both > med, `${both} карточек`);
await p.click('#reset');
check('«сбросить всё» → 200', (await visible()) === 200);

// связанные фразы
await p.evaluate(() => { location.hash = '#alea-iacta-est'; });
await p.waitForTimeout(400);
await p.click('#alea-iacta-est details.more summary').catch(() => {});
const relHref = await p.evaluate(() => document.querySelector('#alea-iacta-est .rel a')?.getAttribute('href'));
check('у карточки есть ссылки на связанные', !!relHref, relHref || '');
// переход к скрытой карточке сбрасывает фильтры
await p.fill('#q', 'ъъъъъъ');
await p.evaluate(() => { location.hash = '#veni-vidi-vici'; });
await p.waitForTimeout(500);
check('переход по ссылке показывает скрытую карточку', await p.evaluate(() => !document.querySelector('#veni-vidi-vici').hidden));

// раскрыть все
await p.click('#expandBtn');
check('«раскрыть все» открывает details', await p.evaluate(() => [...document.querySelectorAll('details.more')].every((d) => d.open)));

// доступность/структура
check('нет горизонтальной прокрутки', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
check('нет ошибок консоли', errors.length === 0, errors.join(' | '));

await b.close();
console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nВсе проверки пройдены');
process.exit(fails ? 1 : 0);
