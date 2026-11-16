// Випробування «Пам'ять Древніх»: 12 карток, знайти 6 пар.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials.memory = {
  mount(container, data, api) {
    const { el, cdn, shuffle } = VQ.util;
    const total = data.items.length;
    let open = [];
    let lock = false;
    let pairs = 0;
    let timer = null;

    const grid = el('div', { class: 'memory' });
    shuffle(data.items.concat(data.items)).forEach(key => {
      const card = el('button', { class: 'mcard', dataset: { key } },
        el('span', { class: 'mcard__inner' },
          el('span', { class: 'mcard__back' }),
          el('span', { class: 'mcard__face' }, VQ.quest.img(cdn.item(key), key))));
      card.addEventListener('click', () => flip(card));
      grid.appendChild(card);
    });
    container.appendChild(grid);
    api.counter('Пари 0 / ' + total);

    function flip(card) {
      if (lock || card.classList.contains('is-open') || card.classList.contains('is-matched')) return;
      card.classList.add('is-open');
      VQ.audio.play('tick');
      open.push(card);
      if (open.length < 2) return;
      lock = true;
      const [a, b] = open;
      if (a.dataset.key === b.dataset.key) {
        a.classList.add('is-matched'); b.classList.add('is-matched');
        open = []; lock = false;
        pairs += 1;
        api.counter('Пари ' + pairs + ' / ' + total);
        VQ.audio.play('coin');
        if (pairs === total) timer = setTimeout(() => api.success(), 600);
      } else {
        timer = setTimeout(() => {
          VQ.audio.play('wrong');
          a.classList.remove('is-open'); b.classList.remove('is-open');
          open = []; lock = false;
        }, 800);
      }
    }

    return () => clearTimeout(timer);
  }
};
