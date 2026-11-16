// Арсенал: інвентар скінів брата. Тут же — спільна картка скіна для Скарбниці й Кузні.
window.VQ = window.VQ || {};

(function () {
  const { el, formatUAH } = VQ.util;
  const RARITY = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', mythical: 'Mythical', legendary: 'Legendary', immortal: 'Immortal', arcana: 'Arcana' };

  // variant: 'tile' (сітка) | 'row' (список у Кузні) | 'strip' (рулетка)
  function skinCard(skin, opts) {
    const o = opts || {};
    const variant = o.variant || 'tile';
    const art = el('div', { class: 'skin__art' }, VQ.quest.img(skin.img, skin.name));
    const rarity = el('span', { class: 'rarity-label', text: RARITY[skin.rarity] || skin.rarity });
    const price = o.hidePrice ? null : el('span', { class: 'skin__price', text: formatUAH(skin.price) });
    let node;
    if (variant === 'row') {
      node = el('div', { class: 'skin skin--row rarity-' + skin.rarity },
        o.checkbox ? el('span', { class: 'skin__check' }) : null,
        art,
        el('div', { class: 'skin__meta' }, el('div', { class: 'skin__name', text: skin.name }), rarity),
        price);
    } else if (variant === 'strip') {
      node = el('div', { class: 'skin skin--strip rarity-' + skin.rarity }, art, el('div', { class: 'skin__name', text: skin.name }));
    } else {
      node = el('div', { class: 'skin skin--tile rarity-' + skin.rarity }, art,
        el('div', { class: 'skin__info' },
          el('div', { class: 'skin__hero', text: skin.hero }),
          el('div', { class: 'skin__name', text: skin.name }),
          el('div', { class: 'skin__row' }, rarity, price)));
    }
    if (o.badge) node.appendChild(el('span', { class: 'skin__badge', text: o.badge }));
    if (o.selected) node.classList.add('is-selected');
    if (o.onClick) { node.classList.add('is-clickable'); node.addEventListener('click', o.onClick); }
    return node;
  }

  const arsenal = {};
  let root = null;

  arsenal.render = function (r) {
    root = r || root;
    if (!root) return;
    const st = VQ.state.get();
    const skins = VQ.config.skins;
    const giftId = VQ.config.casino.giftId;   // подарунок у Steam — у суму Арсеналу не входить
    const total = st.inventory.reduce((s, it) => s + (it.skinId !== giftId && skins[it.skinId] ? skins[it.skinId].price : 0), 0);
    const grid = el('div', { class: 'arsenal__grid' });
    st.inventory.forEach(it => {
      const skin = skins[it.skinId];
      if (!skin) return;
      if (it.skinId === VQ.config.casino.giftId) {   // подарунок: не продається
        const gift = skinCard(skin, { variant: 'tile', badge: 'Подарунок', hidePrice: true });
        gift.appendChild(el('div', { class: 'skin__steam', text: '✔ Уже у твоєму Steam' }));
        grid.appendChild(gift);
        return;
      }
      const card = skinCard(skin, { variant: 'tile' });
      card.appendChild(el('button', {
        class: 'skin__sell',
        onclick: () => {
          let paid = 0;
          VQ.state.update(s => { paid = VQ.cases.sell(s, it.uid); });
          if (paid) { VQ.audio.play('coin'); VQ.ui.toast('Продано за ' + formatUAH(paid)); }
          arsenal.render();
        }
      }, VQ.util.priced('Продати · ', skin.price)));
      grid.appendChild(card);
    });
    for (let i = st.inventory.length; i < 12; i++) grid.appendChild(el('div', { class: 'skin skin--empty' }));
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'arsenal' },
      el('div', { class: 'casino-head' },
        el('div', {}, el('h1', { class: 'h-title', text: 'Арсенал' }), el('p', { class: 'h-sub', text: 'Твої предмети' })),
        el('div', { class: 'arsenal__total' }, el('span', { text: 'Загальна вартість' }), el('b', { text: formatUAH(total) }))),
      st.inventory.length ? null : el('p', { class: 'casino-empty', text: 'Тут поки порожньо. Відкрий скриню у Скарбниці, щоб отримати перші предмети.' }),
      grid));
  };

  document.addEventListener('vq:tab', e => { if (e.detail === 'arsenal') arsenal.render(); });

  VQ.arsenal = arsenal;
  VQ.casino = { skinCard, RARITY };
})();
