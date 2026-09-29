// Поиск, фильтры и навигация. Без зависимостей.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var cards = $$('.card');
  var levels = $$('.level');
  var input = $('#q');
  var counter = $('#count');
  var empty = $('#empty');
  var domPanel = $('#doms');
  var domBtn = $('#domBtn');
  var expandBtn = $('#expandBtn');
  var state = { q: '', level: 'all', doms: {} };

  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, 'е')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
  }
  cards.forEach(function (c) { c._q = norm(c.getAttribute('data-q') || ''); });

  function apply() {
    var words = norm(state.q).split(' ').filter(Boolean);
    var activeDoms = Object.keys(state.doms).filter(function (k) { return state.doms[k]; });
    var shown = 0;
    cards.forEach(function (c) {
      var ok = true;
      if (state.level !== 'all' && c.getAttribute('data-level') !== state.level) ok = false;
      if (ok && activeDoms.length) {
        var cd = (c.getAttribute('data-dom') || '').split('|');
        ok = activeDoms.some(function (d) { return cd.indexOf(d) > -1; });
      }
      if (ok && words.length) ok = words.every(function (w) { return c._q.indexOf(w) > -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });
    levels.forEach(function (l) {
      l.hidden = !l.querySelector('.card:not([hidden])');
    });
    counter.textContent = shown === cards.length
      ? 'Все ' + cards.length
      : 'Найдено ' + shown + ' из ' + cards.length;
    empty.hidden = shown !== 0;
    $$('[data-level-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-level-btn') === state.level));
    });
    $$('[data-dom-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(!!state.doms[b.getAttribute('data-dom-btn')]));
    });
    var n = activeDoms.length;
    domBtn.querySelector('.n').textContent = n ? ' · ' + n : '';
    var bar = $('#bar');
    if (words.length || n || state.level !== 'all') bar.setAttribute('data-active', ''); else bar.removeAttribute('data-active');
  }

  input.addEventListener('input', function () { state.q = input.value; apply(); });
  $$('[data-level-btn]').forEach(function (b) {
    b.addEventListener('click', function () { state.level = b.getAttribute('data-level-btn'); apply(); });
  });
  $$('[data-dom-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = b.getAttribute('data-dom-btn');
      state.doms[d] = !state.doms[d];
      apply();
    });
  });
  domBtn.addEventListener('click', function () {
    var open = domPanel.hidden;
    domPanel.hidden = !open;
    domBtn.setAttribute('aria-expanded', String(open));
  });
  $('#reset').addEventListener('click', function () {
    state = { q: '', level: 'all', doms: {} };
    input.value = '';
    apply();
  });

  var allOpen = false;
  expandBtn.addEventListener('click', function () {
    allOpen = !allOpen;
    $$('details.more').forEach(function (d) { d.open = allOpen; });
    expandBtn.setAttribute('aria-pressed', String(allOpen));
    expandBtn.textContent = allOpen ? 'Свернуть все' : 'Раскрыть все';
  });

  // переход по ссылке на связанную фразу
  function goHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var t = document.getElementById(id);
    if (!t || !t.classList.contains('card')) return;
    if (t.hidden) {
      state = { q: '', level: 'all', doms: {} };
      input.value = '';
      apply();
    }
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    t.classList.remove('flash');
    void t.offsetWidth;
    t.classList.add('flash');
    var d = $('details.more', t);
    if (d) d.open = true;
  }
  window.addEventListener('hashchange', goHash);

  // печать из браузера: раскрываем все карточки
  window.addEventListener('beforeprint', function () {
    $$('details.more').forEach(function (d) { d.open = true; });
  });

  // повтор анимации дерева по клику
  var tree = $('#tree');
  if (tree) {
    tree.addEventListener('click', function () {
      tree.classList.remove('animated');
      void tree.getBoundingClientRect();
      tree.classList.add('animated');
      var h = $('.hero');
      h.classList.remove('replay');
      void h.offsetWidth;
      h.classList.add('replay');
    });
  }

  apply();
  if (location.hash) setTimeout(goHash, 60);
})();
