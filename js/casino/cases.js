// Скарбниця: кілька кейсів зі справжніми скінами, шанси як на сайтах з кейсами, рулетка, продаж.
window.VQ = window.VQ || {};

(function () {
  const cases = {};
  const WIN_INDEX = 52, STRIP_LEN = 60;
  const cfg = () => VQ.config.casino;
  const skinOf = id => VQ.config.skins[id];

  // ================= Чиста логіка (покрита тестами) =================
  function niceCasePrice(x) {
    if (x < 100) return Math.max(5, Math.round(x / 5) * 5);
    if (x < 500) return Math.round(x / 10) * 10;
    return Math.round(x / 50) * 50;
  }

  function contentsOf(def) {
    const c = cfg();
    const all = Object.keys(VQ.config.skins).filter(id => id !== c.giftId && !skinOf(id).forgeOnly && skinOf(id).price >= (c.caseMinPrice || 0));
    let ids;
    if (def.mix) {
      // Скарбниця Часу: усе з Faceless Void + найдорожче, середнє й найдешевше з кожного іншого кейса
      ids = all.filter(id => skinOf(id).heroKey === 'faceless void');
      c.cases.filter(d => d.hero).forEach(d => {
        const list = all.filter(id => skinOf(id).heroKey === d.hero).sort((a, b) => skinOf(b).price - skinOf(a).price);
        if (!list.length) return;
        [list[0], list[Math.floor(list.length / 2)], list[list.length - 1]].forEach(id => { if (!ids.includes(id)) ids.push(id); });
      });
    } else if (def.premium) {
      // Скарбниця Рошана: усе дороге — кур'єри, топові речі й найдорожче з каталогу
      ids = all.filter(id => skinOf(id).price >= def.minPrice);
    } else {
      ids = all.filter(id => skinOf(id).heroKey === def.hero);
    }
    return ids.sort((a, b) => skinOf(b).price - skinOf(a).price);
  }

  const built = {};
  cases.get = function (id) {
    if (built[id]) return built[id];
    const def = cfg().cases.find(d => d.id === id);
    if (!def) return null;
    const ids = contentsOf(def);
    const power = def.oddsPower || cfg().oddsPower;
    const w = ids.map(i => Math.pow(skinOf(i).price, -power));
    const sum = w.reduce((s, x) => s + x, 0);
    const items = ids.map((i, k) => Object.assign({ id: i, odds: w[k] / sum }, skinOf(i)));
    const ev = items.reduce((s, it) => s + it.odds * it.price, 0);
    built[id] = Object.assign({}, def, { items, price: niceCasePrice(ev / cfg().houseEdge) });
    return built[id];
  };

  cases.canOpen = (state, caseId) => {
    const c = cases.get(caseId);
    return !!c && state.balance >= c.price;
  };

  // Завжди чесно: кожен предмет випадає зі своїм шансом, джекпот можливий будь-коли.
  cases.rollDrop = function (c, rng) {
    const r = rng || Math.random;
    let x = r();
    for (const it of c.items) { x -= it.odds; if (x <= 0) return it.id; }
    return c.items[c.items.length - 1].id;
  };

  cases.openCase = function (state, caseId, rng) {
    const c = cases.get(caseId);
    if (!c || !cases.canOpen(state, caseId)) return null;
    const skinId = cases.rollDrop(c, rng);
    state.balance -= c.price;
    state.dropIndex += 1;
    const item = { uid: 'i' + state.nextUid, skinId };
    state.nextUid += 1;
    state.inventory.push(item);
    return item;
  };

  // що показати у вікні результату: перший скін від 5 000 ₴ веде до таємної нагороди
  cases.resultActions = state => (VQ.goal.reached(state, cfg()) && !state.won ? 'reveal' : 'normal');

  cases.sell = function (state, uid) {
    const at = state.inventory.findIndex(it => it.uid === uid);
    if (at < 0 || state.inventory[at].skinId === cfg().giftId) return 0;   // подарунок уже в Steam
    const skin = skinOf(state.inventory[at].skinId);
    const paid = skin ? skin.price : 0;
    state.inventory.splice(at, 1);
    state.balance += paid;
    return paid;
  };

  cases.buildStrip = function (winId, c, rng) {
    const r = rng || Math.random;
    const pick = () => {
      let x = r();
      for (const it of c.items) { x -= it.odds; if (x <= 0) return it.id; }
      return c.items[c.items.length - 1].id;
    };
    const out = [];
    for (let i = 0; i < STRIP_LEN; i++) out.push(i === WIN_INDEX ? winId : pick());
    // «майже!» — поруч із переможцем проїжджає щось із верхівки кейса
    const top = c.items.slice(0, Math.max(1, Math.ceil(c.items.length / 4)));
    out[WIN_INDEX + 1] = top[Math.floor(r() * top.length)].id;
    return out;
  };

  cases.formatOdds = p => {
    const v = p * 100;
    return (v < 1 ? v.toFixed(3) : v < 10 ? v.toFixed(2) : v.toFixed(1)) + '%';
  };

  // найдешевший кейс — для правил «Дару Древніх» і рекомендації в Кузні
  if (VQ.config && VQ.config.skins && cfg().cases) {
    cfg().casePrice = Math.min(...cfg().cases.map(d => cases.get(d.id).price));
  }

  // ================= Інтерфейс =================
  let spinning = false;
  let root = null;
  let view = { caseId: null };

  cases.render = function (r) {
    root = r || root;
    if (!root) return;
    if (view.caseId) renderCase(view.caseId);
    else renderList();
  };

  function caseArt(c, big) {
    const { el, cdn } = VQ.util;
    if (c.art === 'chest') return el('div', { class: 'case-art case-art--chest' + (big ? ' is-big' : '') }, el('img', { src: 'assets/img/chest.png', alt: '', draggable: 'false' }));
    if (c.art === 'roshan') return el('div', { class: 'case-art case-art--roshan' + (big ? ' is-big' : '') }, el('div', { class: 'case-art__glow' }), el('img', { src: 'assets/img/roshan.png', alt: '', draggable: 'false' }));
    return el('div', { class: 'case-art' + (big ? ' is-big' : '') },
      el('div', { class: 'case-art__glow' }),
      VQ.quest.img(cdn.render(c.render, 'png'), c.name, 'case-art__hero'));
  }

  function renderList() {
    const { el, formatUAH } = VQ.util;
    const grid = el('div', { class: 'cases-grid' });
    cfg().cases.forEach(def => {
      const c = cases.get(def.id);
      const top = c.items[0];
      grid.appendChild(el('button', { class: 'case-card' + (def.art === 'chest' ? ' case-card--main' : '') + (def.premium ? ' case-card--premium' : ''), onclick: () => { view.caseId = def.id; cases.render(); VQ.audio.play('tick'); } },
        caseArt(c),
        el('div', { class: 'case-card__name', text: c.name }),
        el('div', { class: 'case-card__meta', text: c.items.length + ' предметів · до ' + formatUAH(top.price) }),
        el('div', { class: 'case-card__price' }, el('span', { class: 'tr__coin' }), formatUAH(c.price))));
    });
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'treasury' },
      el('div', { class: 'casino-head' },
        el('div', {}, el('h1', { class: 'h-title', text: 'Скарбниця' }), el('p', { class: 'h-sub', text: 'Обери кейс' })),
        el('div', { class: 'arsenal__total' }, el('span', { text: 'Твій баланс' }), el('b', { text: formatUAH(VQ.state.get().balance) }))),
      VQ.goal.banner(),
      grid,
      VQ.jobs ? VQ.jobs.section() : null));
  }

  function renderCase(caseId) {
    const { el, formatUAH } = VQ.util;
    const c = cases.get(caseId);
    const st = VQ.state.get();
    const can = cases.canOpen(st, caseId);
    const label = can ? VQ.util.priced('Відкрити · ', c.price) : VQ.util.priced('Не вистачає ', c.price - st.balance, ' — заробити');
    const openBtn = el('button', { class: 'btn btn--lg ' + (can ? 'btn--gold' : 'btn--dark') + ' tr__open' }, label);
    openBtn.addEventListener('click', () => {
      if (!can) { view.caseId = null; cases.render(); setTimeout(() => { const j = document.querySelector('.jobs'); if (j) j.scrollIntoView({ behavior: 'smooth' }); }, 50); return; }
      open(caseId, openBtn);
    });
    const contents = el('div', { class: 'contents' });
    c.items.forEach(it => contents.appendChild(contentCard(it)));
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'case-page' },
      el('div', { class: 'case-page__top' },
        el('button', { class: 'case-back', onclick: () => { view.caseId = null; cases.render(); } }, '← Усі кейси'),
        caseArt(c, true),
        el('div', { class: 'case-page__info' },
          el('h1', { class: 'h-title', text: c.name }),
          el('div', { class: 'case-page__sub', text: c.items.length + ' предметів · шанси вказані на картках' }),
          openBtn)),
      el('div', { class: 'divider tr__drops-title', text: 'Вміст кейса' }),
      contents));
  }

  function contentCard(it) {
    const { el, formatUAH } = VQ.util;
    return el('div', { class: 'ccard rarity-' + it.rarity },
      el('div', { class: 'ccard__art' }, VQ.quest.img(it.img, it.name)),
      el('div', { class: 'ccard__body' },
        el('div', { class: 'ccard__hero', text: it.hero }),
        el('div', { class: 'ccard__name', text: it.name, title: it.name }),
        el('div', { class: 'ccard__row' },
          el('span', { class: 'ccard__price' }, el('span', { class: 'tr__coin' }), formatUAH(it.price)),
          el('span', { class: 'ccard__odds', text: cases.formatOdds(it.odds) }))));
  }

  function open(caseId, btn) {
    if (spinning) return;
    if (!cases.canOpen(VQ.state.get(), caseId)) { VQ.ui.showTab('forge'); return; }
    spinning = true;
    if (btn) btn.classList.add('is-busy');
    let item = null;
    // стан змінюється ДО анімації: перезавантаження не дасть другої прокрутки
    VQ.state.update(st => { item = cases.openCase(st, caseId); });
    VQ.audio.play('open');
    runStrip(caseId, item).then(() => { spinning = false; cases.render(); });
  }

  function runStrip(caseId, item) {
    const { el, formatUAH } = VQ.util;
    const c = cases.get(caseId);
    const ids = cases.buildStrip(item.skinId, c);
    const strip = el('div', { class: 'strip' });
    ids.forEach(id => strip.appendChild(VQ.casino.skinCard(skinOf(id), { variant: 'strip' })));
    const viewEl = el('div', { class: 'strip-view' }, strip, el('div', { class: 'strip-marker' }));
    const status = el('div', { class: 'opening__status', text: 'Відкриття…' });
    const box = el('div', { class: 'opening__box' },
      el('div', { class: 'opening__head' }, el('h2', { class: 'h-title', text: c.name })),
      viewEl, status);
    const overlay = el('div', { class: 'opening' }, box);
    document.body.appendChild(overlay);

    return new Promise(resolve => {
      // setTimeout, а не rAF: rAF не спрацьовує у фоновій вкладці, і рулетка «зависла б»
      setTimeout(() => {
        const card = strip.children[0];
        const cw = card.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
        const W = viewEl.getBoundingClientRect().width;
        const jitter = (Math.random() - 0.5) * 0.7 * cw;
        const target = WIN_INDEX * (cw + gap) + cw / 2 - W / 2 + jitter;
        const DUR = 6000;
        VQ.audio.loop('spin', true);
        strip.style.transform = 'translateX(0px)';
        void strip.offsetWidth;
        strip.style.transition = `transform ${DUR}ms cubic-bezier(.08,.6,.12,1)`;
        strip.style.transform = `translateX(${-target}px)`;
        let lastIdx = -1;
        const tickIv = setInterval(() => {
          const m = new DOMMatrixReadOnly(getComputedStyle(strip).transform);
          const idx = Math.floor((-m.m41 + W / 2) / (cw + gap));
          if (idx !== lastIdx) { lastIdx = idx; VQ.audio.play('tick'); }
        }, 30);
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearInterval(tickIv);
          VQ.audio.loop('spin', false);
          showResult();
        };
        strip.addEventListener('transitionend', finish, { once: true });
        setTimeout(finish, DUR + 400);
      }, 40);

      function showResult() {
        const skin = skinOf(item.skinId);
        strip.children[WIN_INDEX].classList.add('is-winner');
        VQ.audio.play('correct');
        status.remove();
        // then() запускаємо після resolve-ланцюжка, коли spinning уже скинуто
        const close = then => { overlay.classList.add('is-leaving'); setTimeout(() => { overlay.remove(); resolve(); if (then) setTimeout(then, 0); }, 250); };
        const actions = el('div', { class: 'opening__actions' });
        if (cases.resultActions(VQ.state.get()) === 'reveal') {
          // не даємо продати скін-мету до фіналу: одна кнопка веде до таємної нагороди
          actions.appendChild(el('button', { class: 'btn btn--gold btn--lg', onclick: () => close(() => VQ.goal.showReveal()) }, el('span', { text: 'Далі…' })));
        } else {
        const sellBtn = el('button', { class: 'btn btn--green' }, VQ.util.priced('Продати · ', skin.price));
        sellBtn.addEventListener('click', () => {
          let paid = 0;
          VQ.state.update(st => { paid = cases.sell(st, item.uid); });
          if (paid) { VQ.audio.play('coin'); VQ.ui.toast('Продано за ' + formatUAH(paid)); }
          close(() => cases.render());
        }, { once: true });
        actions.appendChild(sellBtn);
        if (cases.canOpen(VQ.state.get(), caseId)) {
          actions.appendChild(el('button', { class: 'btn btn--gold', onclick: () => close(() => open(caseId)) }, VQ.util.priced('Ще раз · ', c.price)));
        }
        actions.appendChild(el('button', { class: 'btn btn--dark', onclick: () => close(() => VQ.ui.showTab('arsenal')) }, el('span', { text: 'В Арсенал' })));
        }
        box.appendChild(el('div', { class: 'opening__result rarity-' + skin.rarity },
          el('div', { class: 'opening__won' },
            VQ.casino.skinCard(skin, { variant: 'tile' }),
            el('div', { class: 'opening__won-text' },
              el('div', { class: 'opening__won-label', text: 'Ти отримав' }),
              el('div', { class: 'opening__won-name', text: skin.name }),
              el('div', { class: 'rarity-label', text: VQ.casino.RARITY[skin.rarity] }),
              el('div', { class: 'opening__won-price', text: formatUAH(skin.price) }))),
          actions));
      }
    });
  }

  // при вході у вкладку — повернутися до списку кейсів і оновити баланс
  document.addEventListener('vq:tab', e => { if (e.detail === 'treasury' && !spinning) { cases.render(); } });

  VQ.cases = cases;
})();
