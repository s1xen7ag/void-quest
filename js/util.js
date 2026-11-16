// Дрібні допоміжні функції без стану.
window.VQ = window.VQ || {};

(function () {
  const CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2';

  function normalizeAnswer(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[\s'’ʼ`\-.]/g, '');
  }

  function matchesAnswer(input, variants) {
    const n = normalizeAnswer(input);
    if (!n) return false;
    return variants.some(v => normalizeAnswer(v) === n);
  }

  function formatUAH(n) {
    const v = String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return v + ' ₴';
  }

  function shuffle(arr, rng) {
    const r = rng || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // el('div', {class: 'x', text: 'hi', onclick: fn, dataset: {id: 1}, style: {...}}, child1, child2)
  // «Продати · 68 ₴» → текст + <span class="num">68 ₴</span> (ціна шрифтом чисел)
  function priced(before, amount, after) {
    return el('span', {}, before || '', el('span', { class: 'num', text: formatUAH(amount) }), after || '');
  }

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    const a = attrs || {};
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return node;
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  VQ.util = {
    normalizeAnswer, matchesAnswer, formatUAH, shuffle, el, wait, priced,
    cdn: {
      item: key => `${CDN}/images/dota_react/items/${key}.png`,
      hero: key => `${CDN}/images/dota_react/heroes/${key}.png`,
      ability: key => `${CDN}/images/dota_react/abilities/${key}.png`,
      render: (key, ext) => `${CDN}/videos/dota_react/heroes/renders/${key}.${ext || 'png'}`
    },
    heroName: key => (VQ.config && VQ.config.heroNames[key]) || key
  };
})();
