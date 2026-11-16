// Випробування «Дорожче чи дешевше?»: 10 пар з близькими цінами; одна помилка — усе спочатку з новими парами.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

(function () {
  // Чиста функція (покрита тестами): n пар з різницею цін у [minDiff, maxDiff], відповіді в обидва боки.
  function makeRounds(data, rng) {
    const r = rng || Math.random;
    const pool = data.pool;
    const rounds = [];
    let prev = [];
    for (let guard = 0; rounds.length < data.count && guard < 5000; guard++) {
      const a = pool[Math.floor(r() * pool.length)];
      if (prev.includes(a.key)) continue;
      const near = pool.filter(b => {
        const d = Math.abs(b.cost - a.cost);
        return b.key !== a.key && !prev.includes(b.key) && d >= data.minDiff && d <= data.maxDiff;
      });
      if (!near.length) continue;
      const b = near[Math.floor(r() * near.length)];
      rounds.push({ a, b });
      prev = [a.key, b.key];
    }
    // якщо всі відповіді в один бік — перевернути одну пару
    const dirs = rounds.map(x => x.b.cost > x.a.cost);
    if (!dirs.includes(true) || !dirs.includes(false)) {
      const k = Math.floor(r() * rounds.length);
      rounds[k] = { a: rounds[k].b, b: rounds[k].a };
    }
    return rounds;
  }

  // У парі b — прихований предмет (питаємо про нього), a — відомий з ціною.
  const hiddenOf = round => round.b;
  const knownOf = round => round.a;
  // «Дорожче» / «Дешевше» завжди про прихований предмет порівняно з відомим
  function isCorrect(round, choice) {
    const h = hiddenOf(round).cost, k = knownOf(round).cost;
    return choice === 'more' ? h > k : h < k;
  }

  function mount(container, data, api) {
    const { el, cdn, formatUAH } = VQ.util;
    let rounds = makeRounds(data);
    let idx = 0, busy = false, timer = null;
    const COIN = '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#e8b84e" stroke="#7a5214" stroke-width="1.5"/><circle cx="10" cy="10" r="4.5" fill="none" stroke="#a8782a" stroke-width="1.2"/></svg>';

    // ліворуч — предмет з «?» (про нього питання), праворуч — відомий з ціною
    const hiddenCard = el('div', { class: 'hl__card hl__card--hidden' });
    const knownCard = el('div', { class: 'hl__card' });
    const question = el('div', { class: 'hl__question' });
    const more = el('button', { class: 'btn btn--green btn--sm' }, el('span', { text: '↑ Дорожче' }));
    const less = el('button', { class: 'btn btn--red btn--sm' }, el('span', { text: '↓ Дешевше' }));
    const streak = el('div', { class: 'hl__streak' });
    more.addEventListener('click', () => answer('more', more));
    less.addEventListener('click', () => answer('less', less));

    container.appendChild(el('div', { class: 'hl' },
      el('div', { class: 'hl__pair' }, hiddenCard, el('div', { class: 'hl__vs', text: 'VS' }), knownCard),
      question,
      el('div', { class: 'hl__actions' }, more, less),
      streak));

    function card(node, item, showCost) {
      node.innerHTML = '';
      node.classList.remove('is-correct', 'is-wrong');
      node.appendChild(el('div', { class: 'hl__icon' }, VQ.quest.img(cdn.item(item.key), item.name)));
      node.appendChild(el('div', { class: 'hl__name', text: item.name }));
      const cost = el('div', { class: 'hl__cost' });
      cost.innerHTML = COIN + '<span>' + (showCost ? item.cost : '?') + '</span>';
      node.appendChild(cost);
    }

    function renderStreak() {
      streak.innerHTML = '';
      for (let i = 0; i < rounds.length; i++) streak.appendChild(el('span', { class: 'hl__pip' + (i < idx ? ' is-on' : i === idx ? ' is-now' : '') }));
    }

    function show() {
      const r = rounds[idx];
      api.round(idx + 1, rounds.length);
      card(hiddenCard, hiddenOf(r), false);
      card(knownCard, knownOf(r), true);
      question.innerHTML = '';
      question.append(el('b', { text: hiddenOf(r).name }), ' дорожчий чи дешевший за ', el('b', { text: knownOf(r).name }), '?');
      renderStreak();
      busy = false;
    }

    function answer(choice, btn) {
      if (busy) return;
      busy = true;
      const r = rounds[idx];
      hiddenCard.querySelector('.hl__cost span').textContent = hiddenOf(r).cost;
      if (!isCorrect(r, choice)) {
        hiddenCard.classList.add('is-wrong');
        api.fail(btn);
        VQ.ui.toast('Помилка! Час повертається на початок…');
        timer = setTimeout(() => { rounds = makeRounds(data); idx = 0; show(); }, 1600);
        return;
      }
      hiddenCard.classList.add('is-correct');
      VQ.audio.play('coin');
      timer = setTimeout(() => {
        idx += 1;
        if (idx >= rounds.length) api.success();
        else show();
      }, 900);
    }

    show();
    return () => clearTimeout(timer);
  }

  VQ.trials.higherLower = { mount, makeRounds, isCorrect, hiddenOf, knownOf };
})();
