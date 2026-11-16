// Підробіток: міні-випробування в Скарбниці, щоб заробити ₴, коли баланс злито. Можна грати скільки завгодно.
window.VQ = window.VQ || {};

(function () {
  const jobs = {};

  // ---------- Чиста логіка (покрита тестами) ----------
  // дані випробування беруться з рівня того самого типу, плюс зміни з job.set
  jobs.build = function (job) {
    const level = VQ.config.levels.find(l => l.trial.type === job.from);
    return Object.assign({}, level ? level.trial : { type: job.from }, job.set || {});
  };
  jobs.payout = (job, fails) => VQ.quest.rewardFor(job.reward, fails);

  // ---------- Інтерфейс ----------
  jobs.section = function () {
    const { el, formatUAH } = VQ.util;
    const grid = el('div', { class: 'jobs__grid' });
    VQ.config.jobs.forEach(job => {
      grid.appendChild(el('button', { class: 'job', onclick: () => play(job) },
        el('div', { class: 'job__title', text: job.title }),
        el('div', { class: 'job__desc', text: job.desc }),
        el('div', { class: 'job__reward' }, el('span', { class: 'tr__coin' }), '+' + formatUAH(job.reward))));
    });
    return el('div', { class: 'jobs' },
      el('div', { class: 'divider tr__drops-title', text: 'Підробіток — заробити ₴' }),
      el('p', { class: 'jobs__note', text: 'Злив баланс? Виконай завдання й поповни його. Кожна помилка забирає частину плати.' }),
      grid);
  };

  let open = false;
  function play(job) {
    if (open) return;
    open = true;
    const { el, formatUAH } = VQ.util;
    const data = jobs.build(job);
    let fails = 0;
    let done = false;
    let cleanup = null;
    const counter = el('span', { class: 'trial__counter' });
    const prize = el('span', { class: 'trial__prize' });
    const body = el('div', { class: 'trial__body trial--' + data.type });
    const closeBtn = el('button', { class: 'job-close', title: 'Закрити' }, '✕');
    const card = el('div', { class: 'panel trial job-card' },
      el('div', { class: 'trial__head' },
        el('h2', { class: 'h-title trial__title', text: 'Підробіток: ' + job.title }),
        el('div', { class: 'trial__meta' }, prize, counter, closeBtn)),
      body);
    const overlay = el('div', { class: 'job-overlay' }, card);
    document.body.appendChild(overlay);

    const renderPrize = flash => {
      prize.textContent = 'Плата: ' + formatUAH(jobs.payout(job, fails));
      prize.classList.toggle('is-cut', fails > 0);
      if (flash) { prize.classList.remove('is-flash'); void prize.offsetWidth; prize.classList.add('is-flash'); }
    };
    renderPrize(false);

    const close = () => {
      if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } }
      overlay.remove();
      open = false;
      if (VQ.cases) VQ.cases.render();
    };
    closeBtn.addEventListener('click', close);

    const api = {
      success() {
        if (done) return;
        done = true;
        const paid = jobs.payout(job, fails);
        VQ.state.update(st => { st.balance += paid; });
        VQ.audio.play('correct');
        VQ.ui.flyCoins(card, Math.max(4, Math.round(paid / 20)));
        VQ.ui.toast('+' + formatUAH(paid) + ' на баланс', 2200);
        setTimeout(close, 900);
      },
      fail(target) {
        if (done) return;
        fails += 1;
        VQ.audio.play('wrong');
        VQ.ui.shake(target || card);
        renderPrize(true);
      },
      round(cur, total) { counter.textContent = cur + ' / ' + total; },
      counter(text) { counter.textContent = text; }
    };
    cleanup = VQ.trials[data.type].mount(body, data, api) || null;
  }
  jobs.play = play;

  VQ.jobs = jobs;
})();
