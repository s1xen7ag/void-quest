// Точка входу: завантажити стан, зібрати оболонку, показати потрібний екран.
window.VQ = window.VQ || {};

(function () {
  function boot() {
    const params = new URLSearchParams(location.search);
    if (params.has('reset')) {
      VQ.state.load();
      VQ.state.reset();
      params.delete('reset');
      const q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    }
    const state = VQ.state.load();
    const app = document.getElementById('app');
    VQ.ui.mount(app);
    VQ.ui.startParticles(document.getElementById('fx'));
    VQ.ui.setBalance(state.balance, false);
    VQ.ui.setCasinoLocked(!state.questDone, false);

    let shownBalance = state.balance;
    VQ.state.subscribe(st => {
      if (st.balance !== shownBalance) { shownBalance = st.balance; VQ.ui.setBalance(st.balance, true); }
    });

    // кожен екран окремо: помилка в одному не повинна залишити порожню сторінку
    const safe = (name, fn) => { try { fn(); } catch (e) { console.error('render ' + name, e); } };
    if (VQ.quest) safe('quest', () => VQ.quest.render(VQ.ui.screens.quest));
    if (VQ.cases) safe('treasury', () => VQ.cases.render(VQ.ui.screens.treasury));
    if (VQ.arsenal) safe('arsenal', () => VQ.arsenal.render(VQ.ui.screens.arsenal));
    if (VQ.forge) safe('forge', () => VQ.forge.render(VQ.ui.screens.forge));
    if (VQ.dev) safe('dev', () => VQ.dev.init());

    // якщо після перезавантаження чекає фінал або Дар Древніх — одразу в Кузню, вона їх покаже
    const pending = state.questDone && VQ.forge && VQ.forge.pendingPopups(state, VQ.config.casino).length;
    const start = () => VQ.ui.showTab(state.questDone ? (pending ? 'forge' : 'treasury') : 'quest', { force: true });
    if (!state.accepted) {
      VQ.ui.showReady(() => {
        VQ.state.update(st => { st.accepted = true; });
        start();
      });
    } else {
      VQ.audio.unlock(); // звук розблокується з першим кліком; тут лише готуємо файли
      start();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
