// Випробування «Хто це?»: три іконки здібностей у випадковому порядку «очима машини» (пікселі), 4 портрети.
// Кожна помилка робить картинку чіткішою, правильна відповідь — показує її повністю.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

(function () {
  const STAGES = [{ blocks: 8, pct: 12 }, { blocks: 14, pct: 41 }, { blocks: 24, pct: 78 }];
  const CLEAR = { blocks: 0, pct: 100 };   // blocks 0 = чітка іконка

  // малює картинку мозаїкою blocks×blocks (0 — без мозаїки)
  function paint(canvas, img, blocks) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!blocks) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, 0, 0, w, h); return; }
    const tmp = paint.tmp || (paint.tmp = document.createElement('canvas'));
    tmp.width = blocks; tmp.height = blocks;
    const t = tmp.getContext('2d');
    t.imageSmoothingEnabled = true;
    t.clearRect(0, 0, blocks, blocks);
    t.drawImage(img, 0, 0, blocks, blocks);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, blocks, blocks, 0, 0, w, h);
  }

  VQ.trials.whoIsIt = {
    // Чиста функція: іконки у випадковому порядку (ультімейт не завжди третій).
    iconOrder: (abilities, rng) => VQ.util.shuffle(abilities, rng),

    // Чиста функція (покрита тестами): наскільки «машина» вже розпізнала іконки.
    stage(misses, solved) {
      if (solved) return Object.assign({}, CLEAR);
      return Object.assign({}, STAGES[Math.min(misses, STAGES.length - 1)]);
    },

    mount(container, data, api) {
      const { el, cdn } = VQ.util;
      const self = VQ.trials.whoIsIt;
      let view = null;   // поточний раунд: полотна, картинки, підпис

      function show(st) {
        if (!view) return;
        view.stage = st;
        view.items.forEach(it => { if (it.ready) paint(it.canvas, it.img, st.blocks); });
        view.label.textContent = st.pct === 100 ? 'Розпізнано · 100%' : 'Розпізнавання… ' + st.pct + '%';
        view.root.classList.toggle('is-clear', st.pct === 100);
        view.root.classList.remove('is-shift'); void view.root.offsetWidth; view.root.classList.add('is-shift');
      }

      return VQ.trials._choice(container, data, api, {
        layout: 'row',
        prompt: round => {
          const items = self.iconOrder(round.abilities).map(a => {
            const canvas = el('canvas', { class: 'who__canvas', width: 192, height: 192 });
            const box = el('div', { class: 'frame-square who__ab' }, canvas, el('span', { class: 'who__scan' }));
            const it = { canvas, box, img: new Image(), ready: false };
            it.img.onload = () => { it.ready = true; if (view && view.items.includes(it)) paint(canvas, it.img, view.stage.blocks); };
            it.img.onerror = () => box.classList.add('is-missing');
            it.img.src = cdn.ability(a);
            return it;
          });
          const label = el('div', { class: 'who__label' });
          const root = el('div', { class: 'who-vision' }, el('div', { class: 'who' }, ...items.map(it => it.box)), label);
          view = { root, items, label, stage: self.stage(0, false) };
          show(view.stage);
          return root;
        },
        option: key => VQ.trials._heroOption(key),
        preload: round => round.abilities.forEach(a => { new Image().src = cdn.ability(a); }),
        onWrong: (round, misses) => show(self.stage(misses, false)),
        onCorrect: () => show(self.stage(0, true))
      });
    }
  };
})();
