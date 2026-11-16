// Шлях Войда: доріжка Battle Pass, діалоги Войда, цикл «репліка → випробування → нагорода».
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

(function () {
  const { el, cdn, formatUAH } = VQ.util;
  const quest = {};
  let dom = null;
  let cleanup = null;

  quest.totalReward = () => VQ.config.levels.reduce((s, l) => s + l.reward, 0);

  // Штраф: кожна помилка забирає 30% нагороди рівня, але не менше 10% лишається.
  quest.rewardFor = function (base, fails) {
    const p = (VQ.config.penalty && VQ.config.penalty.perMistake) || 0.3;
    const min = (VQ.config.penalty && VQ.config.penalty.minShare) || 0.1;
    return Math.round(base * Math.max(min, 1 - p * (fails || 0)));
  };
  quest.totalEarned = st => Object.values(st.earned || {}).reduce((s, v) => s + v, 0);

  // Картинка, що при помилці завантаження показує підпис.
  quest.img = function (src, label, cls) {
    const box = el('span', { class: 'imgbox ' + (cls || '') });
    const img = el('img', { src, alt: label || '', draggable: 'false' });
    img.addEventListener('error', () => { box.innerHTML = ''; box.appendChild(el('span', { class: 'img-fallback', text: label || '?' })); }, { once: true });
    box.appendChild(img);
    return box;
  };

  // ---------- Каркас ----------
  quest.render = function (root) {
    root.innerHTML = '';
    const video = el('video', {
      class: 'quest__hero', autoplay: true, muted: true, loop: true, playsinline: true,
      poster: cdn.render('faceless_void', 'png'), src: cdn.render('faceless_void', 'webm')
    });
    video.muted = true;
    const head = el('div', { class: 'quest__head' },
      el('h1', { class: 'h-title quest__title', text: 'Шлях Войда' }),
      el('p', { class: 'h-sub', text: 'Battle Pass' }));
    const track = el('div', { class: 'track' });
    const stage = el('div', { class: 'stage' });
    root.appendChild(el('div', { class: 'quest' }, video, el('div', { class: 'quest__main' }, head, track, stage)));
    dom = { root, track, stage };
    renderTrack();
    const st = VQ.state.get();
    if (st.questDone) showCompleted();
    else showLevel(st.level);
  };

  function renderTrack() {
    const st = VQ.state.get();
    dom.track.innerHTML = '';
    VQ.config.levels.forEach((lvl, i) => {
      const status = st.questDone || i < st.level ? 'done' : i === st.level ? 'current' : 'locked';
      if (i > 0) dom.track.appendChild(el('div', { class: 'track__link track__link--' + (i <= st.level || st.questDone ? 'done' : 'locked') }));
      const node = el('div', { class: 'node node--' + status, title: lvl.title },
        el('div', { class: 'node__hex' },
          el('span', { class: 'node__num', text: String(i + 1) }),
          status === 'done' ? el('span', { class: 'node__mark node__mark--check' }) : null,
          status === 'locked' ? el('span', { class: 'node__mark node__mark--lock' }) : null),
        el('div', { class: 'node__reward', text: '+' + formatUAH(status === 'done' && st.earned && st.earned[i] != null ? st.earned[i] : lvl.reward) }));
      dom.track.appendChild(node);
    });
  }

  function setStage(node) {
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    dom.stage.innerHTML = '';
    dom.stage.appendChild(node);
  }

  // ---------- Діалог Войда ----------
  function showDialog(lines, buttonLabel, onDone) {
    const quote = el('div', { class: 'dialog__quote' });
    lines.forEach(l => quote.appendChild(el('p', { text: l })));
    const btn = el('button', { class: 'btn btn--gold btn--sm dialog__btn' }, el('span', { text: buttonLabel || 'Далі' }));
    btn.addEventListener('click', () => { btn.classList.add('is-busy'); onDone(); }, { once: true });
    const card = el('div', { class: 'panel dialog' },
      el('div', { class: 'dialog__portrait void-face' }),
      el('div', { class: 'dialog__body' },
        el('div', { class: 'dialog__name', text: 'Faceless Void' }), quote, btn));
    setStage(card);
  }

  // ---------- Рівень ----------
  function showLevel(i) {
    const levels = VQ.config.levels;
    if (i >= levels.length) { finishQuest(); return; }
    showDialog(levels[i].intro, 'Далі', () => showTrial(i));
  }

  function showTrial(i) {
    const level = VQ.config.levels[i];
    const trialDef = VQ.trials[level.trial.type];
    const counter = el('span', { class: 'trial__counter' });
    const prize = el('span', { class: 'trial__prize' });
    const body = el('div', { class: 'trial__body trial--' + level.trial.type });
    const hint = el('div', { class: 'trial__hint' }, el('span', { class: 'trial__hint-icon', text: '✦' }), el('span', { text: level.hint }));
    const card = el('div', { class: 'panel trial' },
      el('div', { class: 'trial__head' },
        el('h2', { class: 'h-title trial__title', text: 'Випробування ' + (i + 1) + ': ' + level.title }),
        el('div', { class: 'trial__meta' }, prize, counter)),
      body, hint);
    setStage(card);

    // поточна нагорода з урахуванням помилок
    const renderPrize = (flash) => {
      const fails = VQ.state.get().fails[i] || 0;
      const now = quest.rewardFor(level.reward, fails);
      prize.textContent = 'Нагорода: ' + formatUAH(now);
      prize.classList.toggle('is-cut', fails > 0);
      if (flash) { prize.classList.remove('is-flash'); void prize.offsetWidth; prize.classList.add('is-flash'); }
    };
    renderPrize(false);

    const showHint = () => card.classList.add('has-hint');
    if ((VQ.state.get().fails[i] || 0) >= 2) showHint();

    let done = false;
    const api = {
      success() {
        if (done) return;
        done = true;
        onSuccess(i, card);
      },
      fail(target) {
        if (done) return;
        VQ.audio.play('wrong');
        VQ.ui.shake(target || card);
        VQ.state.update(st => { st.fails[i] = (st.fails[i] || 0) + 1; });
        if (VQ.state.get().fails[i] >= 2) showHint();
        renderPrize(true);
      },
      round(cur, total) { counter.textContent = cur + ' / ' + total; },
      counter(text) { counter.textContent = text; }
    };
    if (!trialDef) { body.appendChild(el('p', { text: 'Випробування ще готується…' })); return; }
    cleanup = trialDef.mount(body, level.trial, api) || null;
  }

  function onSuccess(i, card) {
    const level = VQ.config.levels[i];
    VQ.audio.play('correct');
    const earned = quest.rewardFor(level.reward, VQ.state.get().fails[i] || 0);
    // стан змінюємо одразу — перезавантаження не загубить нагороду
    VQ.state.update(st => { st.balance += earned; st.earned[i] = earned; st.level = i + 1; delete st.fails[i]; });
    card.classList.add('is-won');
    VQ.ui.flyCoins(card, Math.max(4, Math.round(earned / 15)));
    if (earned < level.reward) VQ.ui.toast('+' + formatUAH(earned) + ' (помилки забрали ' + formatUAH(level.reward - earned) + ')', 2600);
    renderTrack();
    setTimeout(() => showLevel(i + 1), 1300);
  }

  // ---------- Завершення ----------
  function finishQuest() {
    showDialog(VQ.config.outro, 'Відкрити скарбницю', () => {
      VQ.state.update(st => { st.questDone = true; });
      renderTrack();
      VQ.ui.setCasinoLocked(false, true);
      VQ.audio.play('unlock');
      VQ.ui.modal({
        title: 'Шлях пройдено',
        body: el('div', {},
          el('p', { class: 'modal__big gold', text: '+' + formatUAH(quest.totalEarned(VQ.state.get())) }),
          el('p', { class: 'modal__small' }, VQ.util.priced('з ', quest.totalReward(), ' можливих')),
          el('p', { text: 'Скарбниця, Арсенал і Кузня відкриті. Час випробувати удачу.' })),
        actions: [{ label: 'До скарбниці', kind: 'gold', onClick: () => VQ.ui.showTab('treasury') }]
      });
      showCompleted();
    });
  }

  function showCompleted() {
    const card = el('div', { class: 'panel dialog dialog--done' },
      el('div', { class: 'dialog__portrait void-face' }),
      el('div', { class: 'dialog__body' },
        el('div', { class: 'dialog__name', text: 'Шлях пройдено' }),
        el('div', { class: 'dialog__quote' }, el('p', { text: 'Усі дев\'ять випробувань подолано. Скарби чекають у Скарбниці.' })),
        el('button', { class: 'btn btn--gold btn--sm dialog__btn', onclick: () => VQ.ui.showTab('treasury') }, el('span', { text: 'До скарбниці' }))));
    setStage(card);
  }

  quest.refresh = function () { if (dom) quest.render(dom.root); };

  VQ.quest = quest;
})();
