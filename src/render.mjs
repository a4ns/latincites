// Сборка HTML: один и тот же разметочный код для веба и для печати (PDF).
import { LEVELS, DOMAINS, MN, BOOK } from './meta.mjs';
import { illustrationSVG } from './illustrations.mjs';
import { treeSVG } from './tree.mjs';

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ударение: апостроф после гласной → комбинируемый акут
export const stress = (s) => s.replace(/([а-яёА-ЯЁ])'/g, '$1́');

const pad = (n) => String(n).padStart(3, '0');

// Латинские слова внутри русского текста набираем курсивом (только если есть строчная буква)
const LATIN = /([A-Za-z][A-Za-z'’-]*(?: [A-Za-z][A-Za-z'’-]*)*)/;
export const rich = (s) =>
  s.split(LATIN).map((part, i) => (i % 2 && /[a-z]/.test(part) ? `<i>${esc(part)}</i>` : esc(part))).join('');

function searchText(c) {
  return [
    c.la, c.ru, c.lit || '', stress(c.tr), c.en, c.mn.x, c.hist, c.now, c.gram, c.fake || '',
    c.dom.join(' '), c.words.map((w) => w.join(' ')).join(' '),
  ].join(' ');
}

function card(c, byId) {
  const roman = LEVELS[c.level - 1].roman;
  const words = c.words
    .map(([la, ru, desc]) => `<li><i class="wl">${esc(la)}</i><span class="wm">${rich(ru)}</span><span class="wd">${rich(desc)}</span></li>`)
    .join('');
  const rel = (c.rel || [])
    .filter((id) => byId[id])
    .map((id) => `<a class="chip" href="#${id}">${esc(byId[id].la)}</a>`)
    .join('');
  return `
<article class="card l${c.level}" id="${c.id}" data-level="${c.level}" data-dom="${esc(c.dom.join('|'))}" data-q="${esc(searchText(c))}">
  <header class="ch">
    <div class="meta"><span class="no">№&nbsp;${pad(c.n)}</span><span class="doms">${esc(c.dom.join(' · '))}</span></div>
    <h3 class="la">${esc(c.la)}</h3>
    <p class="ru">${esc(c.ru)}${c.lit ? `<span class="lit">буквально: ${esc(c.lit.charAt(0).toLowerCase() + c.lit.slice(1))}</span>` : ''}</p>
    <p class="say">
      <span><b>по-русски</b><i>${esc(stress(c.tr))}</i></span>
      <span><b>для американского уха</b><i>${esc(c.en)}</i></span>
    </p>
  </header>
  <section class="mn t-${c.mn.t}">
    ${c.ill ? `<figure class="ill">${illustrationSVG(c.ill)}</figure>` : ''}
    <div class="mn-body">
      <h4><span class="tag">${MN[c.mn.t].label}</span>Как запомнить</h4>
      <p>${rich(c.mn.x)}</p>
    </div>
  </section>
  <details class="more">
    <summary><span class="sum-open">Разобрать глубже</span><span class="sum-close">Свернуть</span></summary>
    <div class="deep">
      <section class="hist"><h4>История</h4><p>${rich(c.hist)}</p></section>
      <section class="words"><h4>Слова и потомки</h4><ul>${words}</ul></section>
      <section class="now"><h4>Сегодня</h4><p>${rich(c.now)}</p></section>
      <section class="gram"><h4>Грамматика</h4><p>${rich(c.gram)}</p></section>
      ${c.fake ? `<section class="fake"><h4>Как цитируют неверно</h4><p>${rich(c.fake)}</p></section>` : ''}
      ${rel ? `<section class="rel"><h4>Связанные фразы</h4><p>${rel}</p></section>` : ''}
    </div>
  </details>
</article>`;
}

function levelSection(lv, cards, byId) {
  const L = LEVELS[lv - 1];
  return `
<section class="level" id="level-${lv}" data-level="${lv}">
  <header class="level-head">
    <div class="roman" aria-hidden="true">${L.roman}</div>
    <div class="lh-text">
      <p class="lh-kicker">Уровень ${L.roman} · ${cards.length} фраз</p>
      <h2><span class="lh-la">${L.la}</span><span class="lh-ru">${L.ru}</span></h2>
      <p class="lh-tag">${esc(L.tag)}</p>
      <p class="lh-text-p">${esc(L.text)}</p>
    </div>
    <div class="lh-tree" aria-hidden="true">${treeSVG({ seed: 13, animated: false, id: 'ls' + lv, stage: lv })}</div>
  </header>
  ${cards.map((c) => card(c, byId)).join('\n')}
</section>`;
}

function howto(id = 'howto') {
  return `
<section class="howto" id="${id}">
  <h2>Как устроена карточка</h2>
  <div class="howto-grid">
    <div><span class="hn">1</span>
      <p><b>Фраза, перевод и звучание.</b> Латинский текст читается двумя способами: «по-русски» — как принято в отечественной школе латыни (<i>вени, види, вици</i>), и «для американского уха» — английская запись классического произношения (<i>WAY-nee, WEE-dee, WEE-kee</i>). В английской записи ударный слог набран заглавными.</p></div>
    <div><span class="hn">2</span>
      <p><b>Как запомнить.</b> В цветной полосе — приём, подобранный под эту фразу:
      <i>Образ</i> — картинка, которую легко вообразить; <i>Созвучие</i> — фраза похожа на знакомое слово; <i>Сценка</i> — мини-история; <i>Смысл</i> — запоминаем через перевод и устройство фразы.</p></div>
    <div><span class="hn">3</span>
      <p><b>Разобрать глубже.</b> История фразы, слова-потомки, пример из жизни сегодня, грамматика в одну строку, «как цитируют неверно» и связанные фразы — переходите по ним как по ветвям.</p></div>
  </div>
  <p class="howto-note">Тонкой строкой над названием — области жизни, где фразу чаще всего услышишь. По ним можно фильтровать.</p>
</section>`;
}

function printFront(total) {
  return `
<section class="print-only titlepage">
  <p class="tp-top">${BOOK.titleLa}</p>
  <h1>${BOOK.titleRu}</h1>
  <p class="tp-sub">${esc(BOOK.subtitle)}</p>
  <p class="tp-lead">${esc(BOOK.lead)}</p>
  <p class="tp-levels">${LEVELS.map((l) => `<span><b>${l.roman}</b> ${l.la} — ${l.ru}</span>`).join('')}</p>
</section>
<section class="print-only howto-print">${howto('howto-print')}</section>
<section class="print-only toc-page" id="toc">
  <h2>Оглавление</h2>
  <ol class="toc">
    ${LEVELS.map((l) => `<li><a href="#level-${l.n}"><span class="tl">${l.roman}</span><span class="tn"><b>${l.la}</b> · ${l.ru}</span><span class="tp" data-page-of="level-${l.n}"></span></a><small>${esc(l.tag)}</small></li>`).join('')}
    <li><a href="#index"><span class="tl">A–Z</span><span class="tn"><b>Указатель</b> · все ${total} фраз по алфавиту</span><span class="tp" data-page-of="index"></span></a></li>
  </ol>
</section>`;
}

function printIndex(cards) {
  const key = (c) => c.la.toLowerCase().replace(/[^a-z ]/g, '').trim();
  const sorted = [...cards].sort((a, b) => key(a).localeCompare(key(b), 'en'));
  return `
<section class="print-only index-page" id="index">
  <h2>Указатель</h2>
  <p class="ix-note">Все фразы по латинскому алфавиту; справа — страница.</p>
  <ul class="ix">
    ${sorted.map((c) => `<li><a href="#${c.id}"><span class="il">${esc(c.la)}</span><span class="ir">${esc(c.ru)}</span><span class="ip" data-page-of="${c.id}"></span></a></li>`).join('\n')}
  </ul>
  <p class="colophon">${esc(BOOK.source)}</p>
</section>`;
}

export function renderDocument({ cards, css, js, fontCss, tree = true }) {
  const byId = Object.fromEntries(cards.map((c) => [c.id, c]));
  const byLevel = [1, 2, 3, 4].map((lv) => cards.filter((c) => c.level === lv));
  const total = cards.length;
  const domsUsed = DOMAINS.filter((d) => cards.some((c) => c.dom.includes(d)));

  const bar = `
<nav class="bar" id="bar" aria-label="Поиск и фильтры">
  <div class="bar-in">
    <label class="search"><span class="sr">Поиск</span>
      <input id="q" type="search" placeholder="Найти фразу, слово или перевод…" autocomplete="off" spellcheck="false">
    </label>
    <div class="seg" role="group" aria-label="Уровень">
      <button type="button" data-level-btn="all" aria-pressed="true">Все</button>
      ${LEVELS.map((l) => `<button type="button" data-level-btn="${l.n}" aria-pressed="false" title="${l.la} — ${l.ru}">${l.roman}</button>`).join('')}
    </div>
    <button type="button" id="domBtn" class="btn" aria-expanded="false" aria-controls="doms">Области<span class="hide-s"> жизни</span><span class="n"></span></button>
    <button type="button" id="expandBtn" class="btn" aria-pressed="false">Раскрыть все</button>
    <span id="count" class="count" aria-live="polite"></span>
  </div>
  <div id="doms" class="doms-panel" hidden>
    ${domsUsed.map((d) => `<button type="button" class="chip" data-dom-btn="${esc(d)}" aria-pressed="false">${esc(d)}</button>`).join('')}
    <button type="button" id="reset" class="chip reset">сбросить всё</button>
  </div>
</nav>`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${BOOK.titleLa}</title>
<meta name="description" content="${esc(BOOK.subtitle)}: мнемоники, история, слова-потомки, транскрипция.">
<style>${fontCss}${css}</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs><filter id="ink" x="-3%" y="-3%" width="106%" height="106%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
  </filter></defs>
</svg>
<header class="hero" id="top">
  <div class="tree-wrap">${treeSVG({ seed: 13, animated: tree, id: 'tree' })}</div>
  <h1><span class="t-la">${BOOK.titleLa}</span><span class="t-ru">${BOOK.titleRu}</span></h1>
  <p class="sub">${esc(BOOK.subtitle)}</p>
  <p class="lead">${esc(BOOK.lead)}</p>
  <ul class="lv-row">${LEVELS.map((l) => `<li><a href="#level-${l.n}"><b>${l.roman}</b><span>${l.la}<small>${l.ru}</small></span></a></li>`).join('')}</ul>
  <p class="dl"><a class="btn" href="arbor-latina.pdf" download>Скачать PDF для печати (A5)</a></p>
</header>
${printFront(total)}
${bar}
<main id="book">
  ${howto()}
  ${byLevel.map((cs, i) => (cs.length ? levelSection(i + 1, cs, byId) : '')).join('\n')}
  <p id="empty" class="empty" hidden>Ничего не нашлось. Попробуйте другое слово — по-русски или по-латыни — или сбросьте фильтры.</p>
</main>
<footer class="foot">
  <div class="foot-tree" aria-hidden="true"></div>
  <p>${esc(BOOK.source)}</p>
  <p><a href="#top">↑ К дереву</a></p>
</footer>
${printIndex(cards)}
<script>${js}</script>
</body>
</html>`;
}
