// Спільна механіка «кілька раундів, обери правильного героя».
// Використовують silhouette, quote, whoIsIt. Раунди беруться випадково з data.pool (data.count штук).
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials._choice = function (container, data, api, opts) {
  const { el, shuffle } = VQ.util;
  const rounds = data.pool ? VQ.trials._choice.pick(data) : data.rounds;
  const layout = opts.layout || 'grid';
  const promptBox = el('div', { class: 'choice__prompt' });
  const options = el('div', { class: 'choice__opts choice__opts--' + layout });
  container.appendChild(el('div', { class: 'choice choice--' + layout }, promptBox, options));
  let idx = 0;
  let timer = null;

  function show() {
    const round = rounds[idx];
    api.round(idx + 1, rounds.length);
    promptBox.classList.remove('is-revealed');
    promptBox.innerHTML = '';
    promptBox.appendChild(opts.prompt(round));
    options.innerHTML = '';
    let locked = false;
    let misses = 0;   // помилки в цьому раунді (для opts.onWrong)
    shuffle(round.options).forEach(key => {
      const b = opts.option(key);
      b.addEventListener('click', () => {
        if (locked || b.classList.contains('is-wrong')) return;
        if (key === round.hero) {
          locked = true;
          b.classList.add('is-correct');
          promptBox.classList.add('is-revealed');
          if (opts.onCorrect) opts.onCorrect(round);
          VQ.audio.play('coin');
          timer = setTimeout(() => {
            idx += 1;
            if (idx >= rounds.length) api.success();
            else show();
          }, 1400);
        } else {
          b.classList.add('is-wrong');
          misses += 1;
          api.fail(b);
          if (opts.onWrong) opts.onWrong(round, misses);
        }
      });
      options.appendChild(b);
    });
    const next = rounds[idx + 1];
    if (next && opts.preload) opts.preload(next);
  }

  show();
  return () => clearTimeout(timer);
};

// Чиста функція (покрита тестами): data.count випадкових раундів з пулу, у випадковому порядку.
VQ.trials._choice.pick = function (data, rng) {
  const r = rng || Math.random;
  return VQ.util.shuffle(data.pool, r).slice(0, data.count).map(round =>
    Object.assign({}, round, { mirror: data.mirror ? r() < 0.5 : false }));
};

// Кнопка-портрет героя (для quote і whoIsIt)
VQ.trials._heroOption = function (key) {
  const { el, cdn, heroName } = VQ.util;
  return el('button', { class: 'hero-opt' },
    el('span', { class: 'hero-opt__img' }, VQ.quest.img(cdn.hero(key), heroName(key))),
    el('span', { class: 'hero-opt__name', text: heroName(key) }));
};
