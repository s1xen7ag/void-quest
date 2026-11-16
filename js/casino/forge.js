// Кузня (апгрейдер): ставка → ціль → колесо. Шанс чесний; до фіналу діє прихована страховка на ціль від 5 000 ₴.
window.VQ = window.VQ || {};

(function () {
  const forge = {};
  const skinOf = id => VQ.config.skins[id];

  // ================= Чиста логіка (покрита тестами) =================
  forge.calcChance = (stake, target, cfg) =>
    Math.min(cfg.maxChance, (stake / target) * 100 * cfg.houseFactor);

  // Дар Древніх: коли все злито, грошей немає і з останнього дару минуло cfg.ancientsAfterLosses невдалих спроб.
  // До того брат заробляє на Підробітку.
  forge.needsAncientsGift = (state, cfg) =>
    !state.won && state.inventory.length === 0 && state.balance < cfg.casePrice &&
    state.losses - state.lossesAtGift >= cfg.ancientsAfterLosses;

  // найдешевший скін каталогу від порогу кейсів (без подарунка): скін за 1 ₴ був би глузуванням
  forge.ancientsSkin = cfg => Object.keys(VQ.config.skins)
    .filter(id => id !== cfg.giftId && skinOf(id).price >= (cfg.caseMinPrice || 0))
    .sort((a, b) => skinOf(a).price - skinOf(b).price || (a < b ? -1 : 1))[0];

  // Чесний кидок. Страховка (лише до фіналу): після goal.pityAfter невдач на ціль від goal.value
  // наступна така спроба виграє, якщо шанс на колесі не менший за goal.pityMinChance.
  forge.decideOutcome = (state, targetId, cfg, chance, rng) => {
    const g = cfg.goal;
    if (!state.won && VQ.goal.isGoalTarget(targetId, cfg) && state.goalFails >= g.pityAfter && chance >= g.pityMinChance) return 'win';
    return (rng || Math.random)() * 100 < chance ? 'win' : 'lose';
  };

  // Чи цей виграш відкриває фінал. Рахується в момент кидка, а не після анімації:
  // якщо брат за 5 секунд обертання встигне продати скін в Арсеналі, фінал усе одно покажеться.
  forge.isFinalWin = (state, targetId, outcome, cfg) =>
    outcome === 'win' && !state.won && VQ.goal.isGoalTarget(targetId, cfg);

  // подарунок уже в Steam: його не можна ставити чи продавати
  forge.isLocked = (skinId, cfg) => skinId === cfg.giftId;

  forge.finalAngle = function (zoneStart, zoneSize, outcome, rng) {
    const r = rng || Math.random;
    const m = Math.min(3, zoneSize / 3);
    let a;
    if (outcome === 'win') a = zoneStart + zoneSize - (m * 0.3 + r() * m * 0.7);
    else if (r() < 0.5) a = zoneStart + zoneSize + 4 + r() * 11;   // щойно проскочила
    else a = zoneStart - 4 - r() * 11;                              // не дотягнула
    return ((a % 360) + 360) % 360;
  };

  forge.applyUpgrade = function (state, stakeUids, targetId, outcome, cfg) {
    state.inventory = state.inventory.filter(it => !stakeUids.includes(it.uid));
    if (outcome === 'win') {
      state.inventory.push({ uid: 'i' + state.nextUid, skinId: targetId });
      state.nextUid += 1;
    } else {
      state.losses += 1;
      if (!state.won && VQ.goal.isGoalTarget(targetId, cfg)) state.goalFails += 1;
    }
  };

  forge.grantAncientsGift = function (state, cfg) {
    state.inventory.push({ uid: 'i' + state.nextUid, skinId: forge.ancientsSkin(cfg) });
    state.nextUid += 1;
    state.lossesAtGift = state.losses;
    state.giftGranted = true;
  };

  // Які попапи брат ще має побачити. Рахується зі стану, а не з події програшу,
  // тож перезавантаження в будь-який момент нічого не губить.
  forge.pendingPopups = function (state, cfg) {
    if (state.won) return [];
    if (VQ.goal.reached(state, cfg)) return ['final'];
    return forge.needsAncientsGift(state, cfg) ? ['ancients'] : [];
  };

  // ціль — будь-який скін каталогу (крім подарунка), дорожчий за ставку
  forge.availableTargets = function (state, stake, cfg) {
    const list = Object.keys(VQ.config.skins)
      .filter(id => id !== cfg.giftId && skinOf(id).price > stake * 1.2)
      .sort((a, b) => skinOf(a).price - skinOf(b).price);
    return list;
  };

  // Магазин: скіни дешевші за мету (5 000 ₴), без подарунка, від найдешевшого.
  // Скін від 5 000 ₴ не купується — його треба вибити з кейса або прокачати.
  forge.shopItems = function (cfg, filter) {
    const f = filter || {};
    const q = (f.query || '').trim().toLowerCase();
    return Object.keys(VQ.config.skins)
      .filter(id => id !== cfg.giftId)
      .filter(id => {
        const s = skinOf(id);
        return s.price < cfg.goal.value &&
          (f.min == null || s.price >= f.min) && (f.max == null || s.price < f.max) &&
          (!q || s.name.toLowerCase().includes(q));
      })
      .sort((a, b) => (f.desc ? -1 : 1) * (skinOf(a).price - skinOf(b).price) || skinOf(a).name.localeCompare(skinOf(b).name));
  };

  forge.buy = function (state, skinId, cfg) {
    const skin = skinOf(skinId);
    if (!skin || skinId === cfg.giftId || skin.price >= cfg.goal.value || state.balance < skin.price) return null;
    state.balance -= skin.price;
    const item = { uid: 'i' + state.nextUid, skinId };
    state.nextUid += 1;
    state.inventory.push(item);
    return item;
  };

  // ================= Інтерфейс =================
  let root = null;
  let ui = null;                 // посилання на вузли поточного рендеру
  let busy = false;
  let rotation = 0;              // накопичений кут голки
  let zoneStart = 0;
  const sel = { stake: new Set(), target: null };

  const polar = (r, deg) => {
    const a = (deg - 90) * Math.PI / 180;
    return [200 + r * Math.cos(a), 200 + r * Math.sin(a)];
  };
  function arcPath(r1, r2, from, to) {
    const large = to - from > 180 ? 1 : 0;
    const [x1, y1] = polar(r2, from), [x2, y2] = polar(r2, to);
    const [x3, y3] = polar(r1, to), [x4, y4] = polar(r1, from);
    return `M${x1} ${y1} A${r2} ${r2} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  function wheelSVG() {
    let runes = '';
    for (let i = 0; i < 24; i++) {
      const [x, y] = polar(170, i * 15);
      runes += `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" transform="rotate(45 ${x} ${y})" fill="${i % 6 === 0 ? '#c8a45c' : '#6a4ab0'}" opacity="${i % 6 === 0 ? 0.9 : 0.6}"/>`;
    }
    let spikes = '';
    [0, 90, 180, 270].forEach(d => {
      const [x1, y1] = polar(206, d), [xl, yl] = polar(186, d - 5), [xr, yr] = polar(186, d + 5);
      spikes += `<path d="M${x1} ${y1} L${xl} ${yl} L${xr} ${yr} Z" fill="url(#wg-gold)"/>`;
    });
    return `<svg viewBox="-12 -12 424 424" class="wheel__svg">
      <defs>
        <radialGradient id="wg-stone" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#2a2238"/><stop offset="1" stop-color="#0d0a13"/></radialGradient>
        <radialGradient id="wg-core" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#3b1d70"/><stop offset=".6" stop-color="#170d2a"/><stop offset="1" stop-color="#0b0712"/></radialGradient>
        <linearGradient id="wg-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc9a"/><stop offset="1" stop-color="#8f6a2c"/></linearGradient>
        <linearGradient id="wg-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6ff8a"/><stop offset=".5" stop-color="#46d64e"/><stop offset="1" stop-color="#1f8f2c"/></linearGradient>
        <filter id="wg-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${spikes}
      <circle cx="200" cy="200" r="196" fill="url(#wg-stone)" stroke="url(#wg-gold)" stroke-width="3"/>
      <circle cx="200" cy="200" r="188" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
      <circle class="wheel__band" cx="200" cy="200" r="168" fill="none" stroke="#1a1424" stroke-width="36"/>
      <circle cx="200" cy="200" r="186" fill="none" stroke="#3a3048" stroke-width="1"/>
      <circle cx="200" cy="200" r="150" fill="none" stroke="#3a3048" stroke-width="1"/>
      <path class="wheel__zone" d="" fill="url(#wg-green)" filter="url(#wg-glow)"/>
      <g class="wheel__runes">${runes}</g>
      <circle cx="200" cy="200" r="148" fill="url(#wg-core)" stroke="url(#wg-gold)" stroke-width="2.5"/>
      <circle cx="200" cy="200" r="138" fill="none" stroke="#8a4dff" stroke-opacity=".25" stroke-width="1" stroke-dasharray="2 6"/>
    </svg>`;
  }

  const NEEDLE = `<svg viewBox="0 0 400 400"><defs><linearGradient id="ng" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8803f"/><stop offset=".5" stop-color="#fbe7b4"/><stop offset="1" stop-color="#a8803f"/></linearGradient>
    <radialGradient id="ngem" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#efe0ff"/><stop offset=".5" stop-color="#9a5cff"/><stop offset="1" stop-color="#3a1c73"/></radialGradient></defs>
    <path d="M200 30 L211 196 L200 214 L189 196 Z" fill="url(#ng)" stroke="#5a3e12" stroke-width="1.5" filter="drop-shadow(0 0 6px rgba(241,209,142,.8))"/>
    <circle cx="200" cy="200" r="22" fill="#14101c" stroke="url(#ng)" stroke-width="4"/>
    <circle cx="200" cy="200" r="12" fill="url(#ngem)"/></svg>`;

  forge.render = function (r) {
    root = r || root;
    if (!root) return;
    const { el, formatUAH } = VQ.util;
    const st = VQ.state.get();
    const cfg = VQ.config.casino;
    root.innerHTML = '';

    // прибрати зі ставки предмети, яких уже немає
    [...sel.stake].forEach(uid => { if (!st.inventory.some(i => i.uid === uid)) sel.stake.delete(uid); });
    const stake = stakeValue();
    const targets = forge.availableTargets(st, stake, cfg);
    if (sel.target && !targets.includes(sel.target)) sel.target = null;

    // ---- ліва колонка
    const left = el('div', { class: 'forge__list' });
    if (!st.inventory.length) left.appendChild(el('p', { class: 'forge__empty', text: 'Предметів немає. Відкрий кейс у Скарбниці або підзароби на Підробітку.' }));
    st.inventory.forEach(it => {
      if (forge.isLocked(it.skinId, cfg)) {   // подарунок: видно, але ставити не можна
        const row = VQ.casino.skinCard(skinOf(it.skinId), { variant: 'row', badge: 'Уже у Steam', hidePrice: true });
        row.classList.add('is-locked');
        row.title = 'Це твій подарунок — він уже чекає у Steam';
        left.appendChild(row);
        return;
      }
      left.appendChild(VQ.casino.skinCard(skinOf(it.skinId), {
        variant: 'row', checkbox: true, selected: sel.stake.has(it.uid),
        onClick: () => { if (busy) return; sel.stake.has(it.uid) ? sel.stake.delete(it.uid) : sel.stake.add(it.uid); VQ.audio.play('tick'); forge.render(); }
      }));
    });
    const leftCol = el('div', { class: 'panel forge__col' },
      el('div', { class: 'forge__col-head' }, el('h2', { class: 'h-title', text: 'Твої предмети' }), el('p', { class: 'h-sub', text: 'Обери ставку' }),
        el('button', { class: 'forge__buy', onclick: () => { if (!busy) openShop(); } }, '+ Купити')),
      left,
      el('div', { class: 'forge__total' }, el('span', { text: 'Загальна ставка' }), el('b', { text: formatUAH(stake) })));

    // ---- права колонка
    const mults = el('div', { class: 'forge__mults' });
    [1.5, 2, 5, 10].forEach(k => mults.appendChild(el('button', { class: 'forge__mult', onclick: () => pickMultiplier(k) }, '×' + k)));
    const right = el('div', { class: 'forge__list' });
    targets.forEach(id => {
      right.appendChild(VQ.casino.skinCard(skinOf(id), {
        variant: 'row', selected: sel.target === id,
        badge: !st.won && VQ.goal.isGoalTarget(id, cfg) ? '★ Мета' : null,
        onClick: () => { if (busy) return; sel.target = id; VQ.audio.play('tick'); forge.render(); }
      }));
    });
    const rightCol = el('div', { class: 'panel forge__col' },
      el('div', { class: 'forge__col-head' }, el('h2', { class: 'h-title', text: 'Ціль' }), el('p', { class: 'h-sub', text: 'Обери результат' })),
      mults, right);

    // ---- центр
    const target = sel.target ? skinOf(sel.target) : null;
    const chance = stake && target ? forge.calcChance(stake, target.price, cfg) : 0;
    const wheel = el('div', { class: 'wheel' });
    wheel.innerHTML = wheelSVG();
    const needle = el('div', { class: 'wheel__needle', html: NEEDLE });
    needle.style.transform = `rotate(${rotation}deg)`;
    const pct = el('div', { class: 'wheel__pct', text: chance ? chance.toFixed(1) + '%' : '' });
    wheel.appendChild(needle);
    wheel.appendChild(pct);
    const zone = wheel.querySelector('.wheel__zone');
    if (chance) zone.setAttribute('d', arcPath(150, 186, zoneStart, zoneStart + chance * 3.6));

    const go = el('button', { class: 'btn btn--gold btn--lg forge__go' }, el('span', { text: 'Покращити' }));
    go.addEventListener('click', upgrade);
    const center = el('div', { class: 'forge__center' },
      el('h1', { class: 'h-title forge__title', text: 'Покращення предмета' }),
      st.won
        ? el('div', { class: 'forge__won' },
            el('span', { text: '✔ ' + skinOf(cfg.giftId).name + ' уже у твоєму Steam' }),
            el('button', { class: 'forge__won-btn', onclick: showFinal }, 'Привітання'))
        : VQ.goal.banner(st, { compact: true }),
      wheel,
      el('div', { class: 'forge__pair' },
        el('span', { text: formatUAH(stake) }), el('span', { class: 'forge__arrow', text: '→' }), el('span', { text: target ? formatUAH(target.price) : '—' })),
      el('div', { class: 'forge__hint', text: !stake ? 'Обери предмети ліворуч' : !target ? 'Обери ціль праворуч' : '' }),
      go);

    root.appendChild(el('div', { class: 'forge' }, leftCol, center, rightCol));
    ui = { wheel, needle, zone, pct, go, left };
  };

  // ---------- Магазин ----------
  const BANDS = [[null, null, 'Усі'], [0, 100, 'до 100'], [100, 200, '100–200'], [200, 500, '200–500'], [500, 1000, '500–1 000'], [1000, 2500, '1 000–2 500'], [2500, 5000, '2 500–5 000']];
  const PAGE = 60;
  function openShop() {
    const { el, formatUAH } = VQ.util;
    const cfg = VQ.config.casino;
    const f = { band: 0, query: '', shown: PAGE, desc: false };
    const balance = el('b');
    const search = el('input', { class: 'field shop__search', type: 'text', placeholder: 'Пошук за назвою…', autocomplete: 'off', spellcheck: 'false' });
    const chips = el('div', { class: 'shop__bands' });
    const list = el('div', { class: 'shop__list' });
    const more = el('button', { class: 'btn btn--dark shop__more' }, el('span', { text: 'Показати ще' }));
    const sort = el('button', { class: 'shop__sort', onclick: () => { f.desc = !f.desc; f.shown = PAGE; draw(); } });

    function draw() {
      balance.textContent = formatUAH(VQ.state.get().balance);
      chips.innerHTML = '';
      BANDS.forEach((b, i) => chips.appendChild(el('button', { class: 'shop__band' + (i === f.band ? ' is-active' : ''), onclick: () => { f.band = i; f.shown = PAGE; draw(); } }, b[2])));
      const [min, max] = BANDS[f.band];
      sort.textContent = f.desc ? '↓ Спершу дорожчі' : '↑ Спершу дешевші';
      const ids = forge.shopItems(cfg, { min, max, query: f.query, desc: f.desc });
      list.innerHTML = '';
      if (!ids.length) list.appendChild(el('p', { class: 'shop__empty', text: 'Нічого не знайдено' }));
      const money = VQ.state.get().balance;
      ids.slice(0, f.shown).forEach(id => {
        const skin = skinOf(id);
        const row = VQ.casino.skinCard(skin, { variant: 'row' });
        row.appendChild(el('button', {
          class: 'btn ' + (money >= skin.price ? 'btn--gold' : 'btn--dark') + ' shop__buy',
          disabled: money < skin.price,
          onclick: () => buyOne(id)
        }, el('span', { text: 'Купити' })));
        list.appendChild(row);
      });
      more.style.display = ids.length > f.shown ? '' : 'none';
    }

    function buyOne(id) {
      let item = null;
      VQ.state.update(st => { item = forge.buy(st, id, cfg); });
      if (!item) { VQ.ui.toast('Не вистачає грошей'); return; }
      sel.stake.add(item.uid);                 // куплене одразу йде в ставку
      VQ.audio.play('coin');
      VQ.ui.toast('Куплено: ' + skinOf(id).name);
      draw();
    }

    let t = null;
    search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { f.query = search.value; f.shown = PAGE; draw(); }, 150); });
    more.addEventListener('click', () => { f.shown += PAGE; draw(); });
    VQ.ui.modal({
      title: 'Магазин скінів',
      className: 'modal--shop',
      body: el('div', { class: 'shop' },
        el('div', { class: 'shop__top' },
          el('div', { class: 'shop__balance' }, el('span', { text: 'Баланс' }), balance),
          search),
        el('div', { class: 'shop__filters' }, chips, sort),
        el('p', { class: 'shop__note', text: 'Скіни від 5 000 ₴ тут не продаються — їх можна лише вибити з кейса або прокачати.' }),
        list, more),
      actions: [{ label: 'Готово', kind: 'gold', onClick: () => forge.render() }]
    });
    draw();
    setTimeout(() => search.focus(), 50);
  }

  function stakeValue() {
    const st = VQ.state.get();
    return st.inventory.filter(i => sel.stake.has(i.uid)).reduce((s, i) => s + skinOf(i.skinId).price, 0);
  }

  function pickMultiplier(k) {
    if (busy) return;
    const stake = stakeValue();
    if (!stake) { VQ.ui.toast('Спершу обери предмети для ставки'); return; }
    const cfg = VQ.config.casino;
    const list = forge.availableTargets(VQ.state.get(), stake, cfg).filter(id => id !== cfg.giftId);
    const found = list.find(id => skinOf(id).price >= stake * k) || list[list.length - 1];
    if (!found) { VQ.ui.toast('Немає підходящої цілі'); return; }
    sel.target = found;
    zoneStart = Math.random() * 360;
    forge.render();
  }

  // ---------- Апгрейд ----------
  function upgrade() {
    if (busy) return;
    const cfg = VQ.config.casino;
    const stake = stakeValue();
    if (!stake) { VQ.ui.toast('Обери предмети для ставки'); return; }
    if (!sel.target) { VQ.ui.toast('Обери ціль'); return; }
    busy = true;
    ui.go.classList.add('is-busy');

    const targetId = sel.target;
    const target = skinOf(targetId);
    const chance = forge.calcChance(stake, target.price, cfg);
    const stakeUids = [...sel.stake];
    const wasWon = VQ.state.get().won;
    const outcome = forge.decideOutcome(VQ.state.get(), targetId, cfg, chance);
    const finalWin = forge.isFinalWin(VQ.state.get(), targetId, outcome, cfg);
    // стан фіксуємо ДО анімації
    VQ.state.update(st => forge.applyUpgrade(st, stakeUids, targetId, outcome, cfg));

    const angle = forge.finalAngle(zoneStart, chance * 3.6, outcome);
    const base = rotation - (rotation % 360);
    rotation = base + 360 * 6 + angle;
    const DUR = 5200;
    ui.needle.style.transition = `transform ${DUR}ms cubic-bezier(.15,.7,.1,1)`;
    ui.needle.style.transform = `rotate(${rotation}deg)`;
    ui.wheel.classList.add('is-spinning');

    let lastStep = -1;
    const tickIv = setInterval(() => {
      const m = new DOMMatrixReadOnly(getComputedStyle(ui.needle).transform);
      const deg = (Math.atan2(m.b, m.a) * 180 / Math.PI + 360) % 360;
      const stepNo = Math.floor(deg / 15);
      if (stepNo !== lastStep) { lastStep = stepNo; VQ.audio.play('tick'); }
    }, 25);

    setTimeout(() => {
      clearInterval(tickIv);
      ui.wheel.classList.remove('is-spinning');
      if (outcome === 'win') {
        ui.wheel.classList.add('is-win');
        VQ.audio.play('win');
        // перший скін від 5 000 ₴ відкриває таємну нагороду, інакше — звичайний виграш
        setTimeout(() => {
          busy = false; sel.stake.clear(); sel.target = null; zoneStart = Math.random() * 360; forge.render();
          if (finalWin) VQ.goal.showReveal(); else showUpgraded(target);
        }, 700);
        return;
      }
      ui.wheel.classList.add('is-lose');
      VQ.audio.play('burn');
      ui.left.querySelectorAll('.skin--row.is-selected').forEach(n => n.classList.add('is-burning'));
      const lossTexts = wasWon ? ['Не пощастило…', 'Майже!..', 'Наступного разу!'] : ['Майже!..', 'Зовсім поруч…', 'Час ще не настав…'];
      VQ.ui.toast(lossTexts[Math.min(2, Math.max(0, VQ.state.get().losses - 1))]);
      setTimeout(() => {
        busy = false;
        sel.stake.clear();
        sel.target = null;
        zoneStart = Math.random() * 360;
        forge.render();
        checkPending();
      }, 1100);
    }, DUR + 150);
  }

  // Показати наступний попап, якщо такий є (по одному за раз).
  let popupOpen = false;
  function checkPending() {
    if (busy || popupOpen) return;
    const next = forge.pendingPopups(VQ.state.get(), VQ.config.casino)[0];
    if (next === 'final') { if (VQ.goal.showReveal) VQ.goal.showReveal(); }
    else if (next === 'ancients') showAncientsGift();
  }
  forge.checkPending = checkPending;

  function showAncientsGift() {
    const { el } = VQ.util;
    const cfg = VQ.config.casino;
    const skin = skinOf(forge.ancientsSkin(cfg));
    popupOpen = true;
    VQ.ui.modal({
      title: 'Дар Древніх',
      body: el('div', { class: 'rec' },
        el('div', { class: 'rec__card' }, VQ.casino.skinCard(skin, { variant: 'tile' })),
        el('p', { class: 'rec__text', text: 'Древні не залишають своїх обраних без зброї. Тримай — і спробуй ще раз.' })),
      actions: [{ label: 'Забрати', kind: 'gold', onClick: () => {
        popupOpen = false;
        VQ.state.update(st => forge.grantAncientsGift(st, cfg));
        forge.render();
        checkPending();
      } }]
    });
  }

  // ---------- Привітання ----------
  function showFinal() {
    const { el } = VQ.util;
    const cfg = VQ.config;
    const gift = skinOf(cfg.casino.giftId);
    const fireworks = el('div', { class: 'final__fw' });
    for (let i = 0; i < 6; i++) fireworks.appendChild(el('span', { style: { left: (10 + Math.random() * 80) + '%', top: (8 + Math.random() * 40) + '%', animationDelay: (i * 0.7) + 's' } }));
    const overlay = el('div', { class: 'final' },
      fireworks,
      el('img', { class: 'final__void', src: VQ.util.cdn.render('faceless_void', 'png'), alt: '' }),
      el('div', { class: 'panel final__panel' },
        el('h1', { class: 'h-title final__title', text: cfg.greeting.title }),
        el('div', { class: 'divider', text: '◆' }),
        el('p', { class: 'final__text' }, ...cfg.greeting.text.split('\n').map(line => el('span', { class: 'final__line', text: line }))),
        el('div', { class: 'final__gift' },
          el('div', { class: 'final__gift-img' }, el('img', { src: gift.img, alt: gift.name })),
          el('div', {},
            el('div', { class: 'final__gift-name', text: gift.name }),
            el('div', { class: 'final__gift-note', text: 'Подарунок уже чекає у твоєму Steam' }))),
        el('button', { class: 'btn btn--gold', onclick: () => overlay.remove() }, el('span', { text: 'Дякую!' }))));
    document.body.appendChild(overlay);
    VQ.audio.play('win');
  }
  forge.showFinal = showFinal;

  // звичайний виграш у Кузні
  function showUpgraded(skin) {
    const { el, formatUAH } = VQ.util;
    VQ.ui.modal({
      title: 'Покращено!',
      className: 'modal--upgraded rarity-' + skin.rarity,
      body: el('div', { class: 'rec' },
        el('div', { class: 'rec__card' }, VQ.casino.skinCard(skin, { variant: 'tile' })),
        el('p', { class: 'rec__text', text: skin.name + ' — ' + formatUAH(skin.price) + ' тепер у твоєму Арсеналі.' })),
      actions: [{ label: 'Далі', kind: 'gold' }]
    });
  }

  // оновлювати Кузню при вході на вкладку (але не посеред обертання)
  document.addEventListener('vq:tab', e => { if (e.detail === 'forge' && !busy) { zoneStart = Math.random() * 360; forge.render(); checkPending(); } });

  VQ.forge = forge;
})();
