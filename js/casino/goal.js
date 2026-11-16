// Мета казино: здобути скін від 5 000 ₴ (з кейса чи з Кузні). Тоді відкривається таємна нагорода.
// Що це за нагорода — видно лише у фіналі.
window.VQ = window.VQ || {};

(function () {
  const goal = {};
  const skinOf = id => VQ.config.skins[id];

  // ================= Чиста логіка (покрита тестами) =================
  // найдорожчий скін в інвентарі (подарунок не рахується)
  goal.bestValue = (state, cfg) => state.inventory.reduce((best, it) => {
    const skin = it.skinId !== cfg.giftId && skinOf(it.skinId);
    return skin && skin.price > best ? skin.price : best;
  }, 0);

  goal.reached = (state, cfg) => goal.bestValue(state, cfg) >= cfg.goal.value;

  goal.progress = (state, cfg) => Math.min(1, goal.bestValue(state, cfg) / cfg.goal.value);

  goal.isGoalTarget = (skinId, cfg) => {
    const skin = skinOf(skinId);
    return !!skin && skin.price >= cfg.goal.value;
  };

  // фінал: нагорода відкрита і лежить в Арсеналі (лише один раз)
  goal.grantGift = function (state, cfg) {
    state.won = true;
    if (state.inventory.some(it => it.skinId === cfg.giftId)) return;
    state.inventory.push({ uid: 'i' + state.nextUid, skinId: cfg.giftId });
    state.nextUid += 1;
  };

  // ================= Інтерфейс =================
  // Банер мети: до фіналу — таємна скриня і шкала прогресу; після — «Нагороду отримано».
  goal.banner = function (state, opts) {
    const { el, formatUAH } = VQ.util;
    const st = state || VQ.state.get();
    const cfg = VQ.config.casino;
    const compact = !!(opts && opts.compact);
    const cls = 'goal-banner' + (compact ? ' goal-banner--compact' : '');
    if (st.won) {
      return el('div', { class: cls + ' is-done' },
        el('div', { class: 'goal-banner__chest' }, el('span', { text: '✔' })),
        el('div', { class: 'goal-banner__body' },
          el('div', { class: 'goal-banner__title', text: 'Нагороду отримано' }),
          el('div', { class: 'goal-banner__text', text: 'Таємна нагорода Войда вже у твоєму Steam. Далі — вільна гра.' })));
    }
    const best = goal.bestValue(st, cfg);
    return el('div', { class: cls },
      el('div', { class: 'goal-banner__chest' }, el('span', { text: '?' })),
      el('div', { class: 'goal-banner__body' },
        el('div', { class: 'goal-banner__title', text: 'Таємна нагорода Войда' }),
        el('div', { class: 'goal-banner__text' }, VQ.util.priced('Здобудь скін дорожчий за ', cfg.goal.value, ' — з кейса або в Кузні')),
        el('div', { class: 'goal-banner__bar' },
          el('div', { class: 'goal-banner__fill', style: { width: (goal.progress(st, cfg) * 100).toFixed(1) + '%' } })),
        el('div', { class: 'goal-banner__count', text: 'Найдорожчий скін: ' + formatUAH(best) + ' / ' + formatUAH(cfg.goal.value) })));
  };

  // Фінал: «Час зупинився…» → таємна скриня → нагорода. Ціну подарунка не показуємо.
  // Стан змінюється лише кнопкою: перезавантаження посеред сцени покаже її знову.
  goal.showReveal = function () {
    if (VQ.state.get().won || document.querySelector('.win')) return;   // фінал лише один раз
    const { el } = VQ.util;
    const cfg = VQ.config.casino;
    const gift = skinOf(cfg.giftId);
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const rings = '<svg viewBox="0 0 600 600" class="win__rings">' +
      '<circle cx="300" cy="300" r="250" fill="none" stroke="#b98bff" stroke-width="2" stroke-dasharray="4 14" opacity=".7"/>' +
      '<circle cx="300" cy="300" r="215" fill="none" stroke="#f1d18e" stroke-width="1.5" stroke-dasharray="40 10 6 10" opacity=".55"/>' +
      '<circle cx="300" cy="300" r="280" fill="none" stroke="#8a4dff" stroke-width="1" opacity=".5"/>' +
      numerals.map((n, i) => { const a = i * 30 * Math.PI / 180; const x = 300 + 265 * Math.sin(a), y = 300 - 265 * Math.cos(a); return `<text x="${x}" y="${y}" fill="#d9c2ff" font-size="22" font-family="serif" text-anchor="middle" dominant-baseline="middle" opacity=".8">${n}</text>`; }).join('') +
      '</svg>';
    const sparks = el('div', { class: 'win__sparks' });
    for (let i = 0; i < 40; i++) {
      sparks.appendChild(el('span', { style: { left: Math.random() * 100 + '%', animationDelay: (Math.random() * 3) + 's', animationDuration: (2.5 + Math.random() * 2.5) + 's' } }));
    }
    const take = el('button', { class: 'btn btn--green btn--lg' }, el('span', { text: 'Забрати в Steam' }));
    const overlay = el('div', { class: 'win win--reveal' },
      el('div', { class: 'win__dome' }),
      el('div', { class: 'win__rings-wrap', html: rings }),
      sparks,
      el('div', { class: 'win__stop' },
        el('div', { class: 'win__stop-text', text: 'Час зупинився…' }),
        el('div', { class: 'win__mystery' }, el('span', { text: '?' })),
        el('div', { class: 'win__stop-sub', text: 'Таємна нагорода Войда відкривається' })),
      el('div', { class: 'win__content' },
        el('div', { class: 'win__label rarity-' + gift.rarity }, el('span', { class: 'rarity-label', text: VQ.casino.RARITY[gift.rarity] })),
        el('h1', { class: 'h-title win__name', text: gift.name }),
        el('div', { class: 'win__frame' }, el('img', { src: gift.img, alt: gift.name })),
        el('div', { class: 'win__steam', text: '✔ Вже у твоєму Steam' }),
        el('div', { class: 'win__actions' }, take)));
    take.addEventListener('click', () => {
      VQ.state.update(st => goal.grantGift(st, cfg));
      overlay.remove();
      VQ.forge.showFinal();
      [VQ.cases, VQ.forge, VQ.arsenal].forEach(m => { try { if (m) m.render(); } catch (e) { console.error(e); } });
    }, { once: true });
    document.body.appendChild(overlay);
    VQ.audio.play('unlock');
    setTimeout(() => { overlay.classList.add('is-revealed'); VQ.audio.play('win'); }, 1800);
  };

  VQ.goal = goal;
})();
