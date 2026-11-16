// Випробування «Добий крипа» — тест на реакцію: на арені спалахує золоте поле, треба встигнути по ньому клікнути.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

(function () {
  // Чисті функції (покриті тестами)
  function judgeReaction(t, start, ms) {
    if (t < start) return 'early';
    if (t <= start + ms) return 'hit';
    return 'late';
  }
  function inTarget(x, y, f) { return Math.hypot(x - f.x, y - f.y) <= f.r; }
  const at = (arr, i) => arr[Math.min(i, arr.length - 1)];
  function windowFor(hits, data) { return at(data.windows, hits); }
  function sizeFor(hits, data) { return at(data.sizes, hits); }

  function mount(container, data, api) {
    const { el } = VQ.util;
    const rnd = (a, b) => a + Math.random() * (b - a);
    let hits = 0;
    let phase = 'wait';           // wait → field → pause
    let fieldAt = 0, fieldMs = 0, field = null;
    let timer = null;

    const fill = el('div', { class: 'lh__fill' });
    const segs = el('div', { class: 'lh__segs' });
    for (let k = 1; k < data.need; k++) segs.appendChild(el('span', { style: { left: (k / data.need * 100) + '%' } }));
    const bar = el('div', { class: 'lh__bar' }, el('span', { class: 'lh__hp-label', text: 'HP' }), el('div', { class: 'lh__track' }, fill, segs));
    const status = el('div', { class: 'lh__status', text: 'Чекай на поле…' });
    const ring = el('div', { class: 'lh__field-ring' });
    const fieldEl = el('div', { class: 'lh__field' }, ring, el('span', { class: 'lh__field-core' }));
    const arena = el('div', { class: 'lh__arena lh__arena--field' },
      el('div', { class: 'lh__creep' }, VQ.quest.img(data.art, 'Крип')),
      fieldEl);
    const count = el('span', { class: 'lh__count', text: '0 / ' + data.need });
    container.appendChild(el('div', { class: 'lh' },
      bar, status, arena,
      el('div', { class: 'lh__foot lh__foot--field' },
        el('div', { class: 'lh__score' }, el('span', { class: 'lh__score-label', text: 'Удари' }), count))));

    function renderHp() { fill.style.width = (100 * (1 - hits / data.need)) + '%'; }

    function schedule() {
      phase = 'wait';
      fieldEl.classList.remove('is-on', 'is-hit', 'is-miss');
      status.textContent = 'Чекай на поле…';
      status.className = 'lh__status';
      timer = setTimeout(spawn, rnd(data.delayMin, data.delayMax));
    }

    function spawn() {
      const size = sizeFor(hits, data);
      const w = arena.clientWidth, h = arena.clientHeight;
      const r = size / 2;
      field = { x: rnd(r + 6, Math.max(r + 7, w - r - 6)), y: rnd(r + 6, Math.max(r + 7, h - r - 6)), r };
      fieldMs = windowFor(hits, data);
      Object.assign(fieldEl.style, { width: size + 'px', height: size + 'px', left: (field.x - r) + 'px', top: (field.y - r) + 'px' });
      ring.style.animationDuration = fieldMs + 'ms';
      fieldEl.classList.remove('is-on'); void fieldEl.offsetWidth; fieldEl.classList.add('is-on');
      phase = 'field';
      fieldAt = performance.now();
      status.textContent = 'Клікай!';
      status.className = 'lh__status is-now';
      timer = setTimeout(() => { if (phase === 'field') miss('Запізно — поле згасло'); }, fieldMs + 30);
    }

    function miss(text) {
      clearTimeout(timer);
      phase = 'pause';
      fieldEl.classList.add('is-miss');
      status.textContent = text;
      status.className = 'lh__status is-bad';
      api.fail(arena);
      timer = setTimeout(schedule, 900);
    }

    function hit() {
      clearTimeout(timer);
      phase = 'pause';
      hits += 1;
      renderHp();
      fieldEl.classList.add('is-hit');
      count.textContent = hits + ' / ' + data.need;
      VQ.audio.play('coin');
      if (hits >= data.need) {
        status.textContent = 'Добив! Крип твій';
        status.className = 'lh__status is-good';
        arena.querySelector('.lh__creep').classList.add('is-dead', 'is-lasthit');
        timer = setTimeout(() => api.success(), 800);
        return;
      }
      status.textContent = 'Влучно! Наступне — швидше й менше';
      status.className = 'lh__status is-good';
      timer = setTimeout(schedule, 650);
    }

    arena.addEventListener('pointerdown', e => {
      if (phase !== 'field') return;               // поки поля немає — кліки нічого не роблять
      const box = arena.getBoundingClientRect();
      const x = e.clientX - box.left, y = e.clientY - box.top;
      if (judgeReaction(performance.now(), fieldAt, fieldMs) !== 'hit') { miss('Запізно — поле згасло'); return; }
      if (inTarget(x, y, field)) hit();
      else miss('Мимо!');
    });

    renderHp();
    schedule();

    // хук лише для режиму перевірки (?dev)
    if (/[?&]dev\b/.test(location.search)) {
      window.__VQ_LASTHIT = {
        get phase() { return phase; },
        get field() { return field; },
        forceField() { if (phase === 'wait') { clearTimeout(timer); spawn(); } },
        clickAt(x, y) { const b = arena.getBoundingClientRect(); arena.dispatchEvent(new PointerEvent('pointerdown', { clientX: b.left + x, clientY: b.top + y, bubbles: true })); }
      };
    }

    return () => clearTimeout(timer);
  }

  VQ.trials.lastHit = { mount, judgeReaction, inTarget, windowFor, sizeFor };
})();
