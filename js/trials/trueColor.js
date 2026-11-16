// Випробування «Справжній колір»: чотири версії дорогого скіна, лише одна справжня.
// Перефарбовані версії готуються заздалегідь (tools/make-colors.py): <id>-0 — оригінал, -1..-3 — підробки.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials.trueColor = {
  // Чисті функції (покриті тестами)
  rounds(data, rng) {
    const r = rng || Math.random;
    const { shuffle } = VQ.util;
    return shuffle(data.pool, r).slice(0, data.count).map(id => ({ id, order: shuffle([0, 1, 2, 3], r) }));
  },
  src: (data, id, k) => data.dir + id + '-' + k + '.webp',

  mount(container, data, api) {
    const { el, formatUAH } = VQ.util;
    const self = VQ.trials.trueColor;
    const rounds = self.rounds(data);
    const head = el('div', { class: 'tcolor__head' });
    const grid = el('div', { class: 'tcolor__grid' });
    container.appendChild(el('div', { class: 'tcolor' }, head, grid));
    let idx = 0;
    let timer = null;

    function show() {
      const round = rounds[idx];
      const skin = VQ.config.skins[round.id];
      api.round(idx + 1, rounds.length);
      head.innerHTML = '';
      head.append(
        el('div', { class: 'tcolor__name', text: skin.name }),
        el('div', { class: 'tcolor__meta' },
          el('span', { class: 'rarity-label rarity-' + skin.rarity, text: VQ.casino.RARITY[skin.rarity] || skin.rarity }),
          el('span', { class: 'tcolor__price', text: formatUAH(skin.price) })),
        el('div', { class: 'tcolor__ask', text: 'Який колір справжній?' }));
      grid.innerHTML = '';
      grid.classList.remove('is-in'); void grid.offsetWidth; grid.classList.add('is-in');
      let locked = false;
      round.order.forEach((k, pos) => {
        const b = el('button', { class: 'tcolor__card' },
          el('span', { class: 'tcolor__num', text: String(pos + 1) }),
          el('img', { src: self.src(data, round.id, k), alt: 'Варіант ' + (pos + 1), draggable: 'false' }));
        b.addEventListener('click', () => {
          if (locked || b.classList.contains('is-wrong')) return;
          if (k === 0) {
            locked = true;
            b.classList.add('is-correct');
            VQ.audio.play('coin');
            timer = setTimeout(() => { idx += 1; if (idx >= rounds.length) api.success(); else show(); }, 1300);
          } else {
            b.classList.add('is-wrong');
            api.fail(b);
          }
        });
        grid.appendChild(b);
      });
      const next = rounds[idx + 1];
      if (next) [0, 1, 2, 3].forEach(k => { new Image().src = self.src(data, next.id, k); });
    }

    show();
    return () => clearTimeout(timer);
  }
};
