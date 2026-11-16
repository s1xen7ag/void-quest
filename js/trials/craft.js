// Випробування «Збери предмет»: кілька випадкових предметів з пулу, для кожного обрати рівно потрібні компоненти.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials.craft = {
  mount(container, data, api) {
    const { el, cdn, shuffle } = VQ.util;
    const rounds = data.pool ? VQ.trials._choice.pick(data) : [data];
    const name = k => (data.names && data.names[k]) || k;
    const wrap = el('div', { class: 'craft' });
    container.appendChild(wrap);
    let idx = 0;
    let timer = null;

    function show() {
      const round = rounds[idx];
      const need = round.correct.length;
      let selected = [];
      let busy = false;

      const slots = Array.from({ length: need }, () => el('div', { class: 'craft__slot' }));
      const icons = {};
      const grid = el('div', { class: 'craft__grid' });
      shuffle(round.correct.concat(round.wrong)).forEach(key => {
        const b = el('button', { class: 'craft__item', title: name(key) }, VQ.quest.img(cdn.item(key), name(key)));
        b.addEventListener('click', () => toggle(key, b));
        icons[key] = b;
        grid.appendChild(b);
      });
      const check = el('button', { class: 'btn btn--gold' }, el('span', { text: 'Перевірити' }));
      check.addEventListener('click', submit);

      wrap.innerHTML = '';
      wrap.classList.remove('is-in'); void wrap.offsetWidth; wrap.classList.add('is-in');
      wrap.append(
        el('div', { class: 'craft__recipe' },
          el('div', { class: 'craft__target', title: name(round.target) }, VQ.quest.img(cdn.item(round.target), name(round.target))),
          el('span', { class: 'craft__eq', text: '=' }),
          ...slots.flatMap((s, i) => (i ? [el('span', { class: 'craft__plus', text: '+' }), s] : [s]))),
        el('div', { class: 'craft__target-name', text: name(round.target) }),
        grid, check);

      // передзавантаження іконок наступного предмета
      const next = rounds[idx + 1];
      if (next) [next.target, ...next.correct, ...next.wrong].forEach(k => { new Image().src = cdn.item(k); });

      function renderSlots() {
        slots.forEach((s, i) => {
          s.innerHTML = '';
          const key = selected[i];
          s.classList.toggle('is-filled', !!key);
          if (key) s.appendChild(VQ.quest.img(cdn.item(key), name(key)));
        });
        api.round(idx + 1, rounds.length);
      }

      function toggle(key, b) {
        if (busy) return;
        const at = selected.indexOf(key);
        if (at >= 0) selected.splice(at, 1);
        else if (selected.length >= need) { VQ.ui.toast('Рецепт має лише ' + need + ' компоненти'); return; }
        else selected.push(key);
        b.classList.toggle('is-selected', at < 0);
        VQ.audio.play('tick');
        renderSlots();
      }

      function submit() {
        if (busy) return;
        if (selected.length < need) { VQ.ui.toast('Обери ' + need + ' компоненти'); return; }
        busy = true;
        const ok = round.correct.every(k => selected.includes(k));
        selected.forEach(k => icons[k].classList.add(round.correct.includes(k) ? 'is-correct' : 'is-wrong'));
        if (ok) {
          idx += 1;
          if (idx >= rounds.length) { api.success(); return; }
          VQ.audio.play('coin');
          timer = setTimeout(show, 1200);
          return;
        }
        api.fail(grid);
        timer = setTimeout(() => {
          Object.values(icons).forEach(b => b.classList.remove('is-selected', 'is-correct', 'is-wrong'));
          selected = [];
          renderSlots();
          busy = false;
        }, 1200);
      }

      renderSlots();
    }

    show();
    return () => clearTimeout(timer);
  }
};
