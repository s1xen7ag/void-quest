// Випробування «Загадки Рошана»: кілька випадкових загадок з пулу, відповідь вписати.
// Після 2 помилок на одній загадці з'являється її власна підказка.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials.riddle = {
  mount(container, data, api) {
    const { el, matchesAnswer } = VQ.util;
    const rounds = data.pool ? VQ.trials._choice.pick(data) : [data];
    let idx = 0;
    let misses = 0;
    let busy = false;
    let timer = null;

    const text = el('p', { class: 'riddle__text' });
    const tip = el('p', { class: 'riddle__tip' });
    const input = el('input', { class: 'field', type: 'text', placeholder: data.placeholder || 'Твоя відповідь…', autocomplete: 'off', spellcheck: 'false' });
    const btn = el('button', { class: 'btn btn--gold' }, el('span', { text: 'Відповісти' }));
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

    container.appendChild(el('div', { class: 'riddle' },
      el('div', { class: 'riddle__art' }, VQ.quest.img(data.art, 'Roshan')),
      el('div', { class: 'riddle__main' }, text, input, btn, tip)));

    function show() {
      const round = rounds[idx];
      misses = 0;
      busy = false;
      btn.classList.remove('is-busy');
      api.round(idx + 1, rounds.length);
      text.textContent = round.text;
      text.classList.remove('is-in'); void text.offsetWidth; text.classList.add('is-in');
      tip.textContent = '';
      tip.classList.remove('is-shown');
      input.value = '';
      input.classList.remove('is-correct');
      setTimeout(() => input.focus(), 50);
    }

    function submit() {
      if (busy) return;
      if (!input.value.trim()) { VQ.ui.toast('Спершу впиши відповідь'); input.focus(); return; }
      busy = true;
      btn.classList.add('is-busy');
      const round = rounds[idx];
      if (matchesAnswer(input.value, round.answers)) {
        input.classList.add('is-correct');
        idx += 1;
        if (idx >= rounds.length) { api.success(); return; }
        VQ.audio.play('coin');
        timer = setTimeout(show, 1100);
        return;
      }
      misses += 1;
      api.fail(input);
      if (misses >= 2 && round.hint) { tip.textContent = 'Підказка: ' + round.hint; tip.classList.add('is-shown'); }
      input.select();
      timer = setTimeout(() => { busy = false; btn.classList.remove('is-busy'); }, 500);
    }

    show();
    return () => clearTimeout(timer);
  }
};
