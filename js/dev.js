// Панель для перевірки (тільки з ?dev у посиланні). Брат її не побачить.
window.VQ = window.VQ || {};

VQ.dev = {
  init() {
    if (!/[?&]dev\b/.test(location.search)) return;
    const { el } = VQ.util;
    const levels = VQ.config.levels;
    const jump = i => {
      VQ.state.update(st => {
        Object.assign(st, VQ.state.defaults(), {
          accepted: true, level: i, balance: levels.slice(0, i).reduce((s, l) => s + l.reward, 0)
        });
      });
      location.reload();
    };
    const row = el('div', { class: 'dev__row' });
    levels.forEach((_, i) => row.appendChild(el('button', { onclick: () => jump(i) }, String(i + 1))));
    const panel = el('div', { class: 'dev' },
      el('div', { class: 'dev__title', text: 'DEV · рівень' }), row,
      el('button', { onclick: () => { VQ.state.update(st => { Object.assign(st, VQ.state.defaults(), { accepted: true, level: levels.length, questDone: true, balance: 1000 }); }); location.reload(); } }, 'Завершити квест (+1000)'),
      el('button', { onclick: () => VQ.state.update(st => { st.balance += 1000; }) }, 'Видати 1000 ₴'),
      el('button', { class: 'dev__danger', onclick: () => { VQ.state.reset(); location.reload(); } }, 'Скинути все'));
    document.body.appendChild(panel);
    const style = el('style', { text:
      '.dev{position:fixed;left:10px;bottom:10px;z-index:200;padding:8px;background:rgba(10,8,14,.92);border:1px solid #c8a45c55;font:12px/1.3 monospace;color:#ccc;display:flex;flex-direction:column;gap:5px;width:190px}' +
      '.dev button{background:#221c2e;border:1px solid #c8a45c44;color:#eee;padding:4px 6px;cursor:pointer;font:12px monospace}' +
      '.dev button:hover{border-color:#c8a45c}.dev__row{display:grid;grid-template-columns:repeat(10,1fr);gap:2px}.dev__row button{padding:3px 0}' +
      '.dev__danger{color:#ff9a9a!important}.dev__title{color:#c8a45c}' });
    document.head.appendChild(style);
  }
};
