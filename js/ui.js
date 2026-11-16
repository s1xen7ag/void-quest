// Оболонка: верхня панель, вкладки, баланс, модалки, тости, монети, «ГРУ ЗНАЙДЕНО», частинки.
window.VQ = window.VQ || {};

(function () {
  const { el, formatUAH } = VQ.util;
  const TABS = [
    { id: 'quest', label: 'Шлях Войда' },
    { id: 'treasury', label: 'Скарбниця' },
    { id: 'arsenal', label: 'Арсенал' },
    { id: 'forge', label: 'Кузня' }
  ];

  const ICON = {
    lock: '<svg class="tab__lock" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2h.5A1 1 0 0 1 13 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h.5Zm1.5 0h4V5a2 2 0 0 0-4 0v2Z"/></svg>',
    coins: '<svg viewBox="0 0 32 32"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#e6b54a"/><stop offset="1" stop-color="#8a5a14"/></linearGradient></defs>' +
      '<g stroke="#5a3a0c" stroke-width="1"><ellipse cx="13" cy="22" rx="10" ry="4" fill="url(#cg)"/><rect x="3" y="17" width="20" height="5" fill="url(#cg)"/><ellipse cx="13" cy="17" rx="10" ry="4" fill="url(#cg)"/>' +
      '<ellipse cx="19" cy="13" rx="10" ry="4" fill="url(#cg)"/><rect x="9" y="8" width="20" height="5" fill="url(#cg)"/><ellipse cx="19" cy="8" rx="10" ry="4" fill="url(#cg)"/></g></svg>',
    chev: '<svg class="profile__chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 6 5 5 5-5"/></svg>',
    logo: '<svg viewBox="0 0 48 48"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc9a"/><stop offset="1" stop-color="#9c7434"/></linearGradient>' +
      '<radialGradient id="lv" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e3cfff"/><stop offset=".5" stop-color="#9a5cff"/><stop offset="1" stop-color="#3a1c73"/></radialGradient></defs>' +
      '<path d="M24 2 44 24 24 46 4 24Z" fill="#120d1c" stroke="url(#lg)" stroke-width="2.5"/>' +
      '<path d="M24 9 37 24 24 39 11 24Z" fill="url(#lv)" opacity=".9"/>' +
      '<path d="M18 16h12l-6 8 6 8H18l6-8Z" fill="#120d1c" stroke="url(#lg)" stroke-width="1.6"/></svg>'
  };

  const ui = { screens: {}, locked: true, active: null, _balanceShown: 0 };

  // ---------- Каркас ----------
  ui.mount = function (app) {
    const tabs = el('nav', { class: 'tabs' });
    ui.tabEls = {};
    TABS.forEach(t => {
      const b = el('button', { class: 'tab', dataset: { tab: t.id }, onclick: () => ui.showTab(t.id) });
      b.innerHTML = (t.id === 'quest' ? '' : ICON.lock) + '<span>' + t.label + '</span>';
      ui.tabEls[t.id] = b;
      tabs.appendChild(b);
    });

    ui.balanceEl = el('div', { class: 'balance', title: 'Твій баланс' });
    ui.balanceEl.innerHTML = ICON.coins + '<span class="balance__v">0 ₴</span>';
    const avatar = el('div', { class: 'profile__avatar void-face' });
    const profile = el('div', { class: 'profile' }, avatar, el('span', { text: VQ.config.player.nick }));
    profile.insertAdjacentHTML('beforeend', ICON.chev);

    const logo = el('div', { class: 'topbar__logo', html: ICON.logo });
    const right = el('div', { class: 'topbar__right' }, ui.balanceEl, el('div', { class: 'topbar__sep' }), profile);
    app.appendChild(el('header', { class: 'topbar' }, logo, tabs, right));

    TABS.forEach(t => {
      const s = el('section', { class: 'screen screen--' + t.id, id: 'screen-' + t.id });
      ui.screens[t.id] = s;
      app.appendChild(s);
    });
    app.appendChild(ui.toastWrap = el('div', { class: 'toast-wrap' }));
  };

  ui.showTab = function (id, opts) {
    if (ui.locked && id !== 'quest' && !(opts && opts.force)) {
      ui.toast('Пройди Шлях Войда, щоб відкрити');
      ui.shake(ui.tabEls[id]);
      return false;
    }
    ui.active = id;
    Object.keys(ui.screens).forEach(k => {
      ui.screens[k].classList.toggle('is-active', k === id);
      ui.tabEls[k].classList.toggle('is-active', k === id);
    });
    document.dispatchEvent(new CustomEvent('vq:tab', { detail: id }));
    return true;
  };

  ui.setCasinoLocked = function (locked, animate) {
    ui.locked = locked;
    ['treasury', 'arsenal', 'forge'].forEach((id, i) => {
      const t = ui.tabEls[id];
      t.classList.toggle('is-locked', locked);
      const lock = t.querySelector('.tab__lock');
      if (lock) lock.style.display = locked ? '' : 'none';
      if (!locked && animate) setTimeout(() => {
        t.classList.remove('is-unlocking'); void t.offsetWidth; t.classList.add('is-unlocking');
      }, i * 180);
    });
  };

  // ---------- Баланс ----------
  ui.setBalance = function (n, animate) {
    const v = ui.balanceEl.querySelector('.balance__v');
    const from = ui._balanceShown;
    ui._balanceShown = n;
    if (!animate || from === n) { v.textContent = formatUAH(n); return; }
    const t0 = performance.now(), dur = 700;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      v.textContent = formatUAH(from + (n - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    ui.balanceEl.classList.remove('is-bump'); void ui.balanceEl.offsetWidth; ui.balanceEl.classList.add('is-bump');
  };

  // ---------- Монети, що летять у баланс ----------
  ui.flyCoins = function (fromEl, count) {
    const n = Math.max(6, Math.min(14, count || 10));
    const a = fromEl.getBoundingClientRect();
    const b = ui.balanceEl.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    const tx = b.left + 18, ty = b.top + b.height / 2;
    const jobs = [];
    for (let i = 0; i < n; i++) {
      const c = el('div', { class: 'coin-fly' });
      document.body.appendChild(c);
      const spreadX = (Math.random() - 0.5) * 160, spreadY = (Math.random() - 0.5) * 90 - 40;
      const anim = c.animate([
        { transform: `translate(${sx - 11}px, ${sy - 11}px) scale(0.4)`, opacity: 0 },
        { transform: `translate(${sx - 11 + spreadX}px, ${sy - 11 + spreadY}px) scale(1.1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${tx - 11}px, ${ty - 11}px) scale(0.6)`, opacity: 0.9 }
      ], { duration: 900 + i * 45, delay: i * 40, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
      jobs.push(anim.finished.then(() => { c.remove(); if (i % 3 === 0) VQ.audio.play('coin'); }));
    }
    return Promise.all(jobs);
  };

  // ---------- Модалка і тост ----------
  ui.modal = function ({ title, body, actions, className }) {
    const box = el('div', { class: 'panel modal ' + (className || '') });
    if (title) box.appendChild(el('h2', { class: 'h-title', text: title }));
    if (body) box.appendChild(el('div', { class: 'modal__body' }, body));
    const back = el('div', { class: 'modal-backdrop' }, box);
    const close = () => back.remove();
    if (actions && actions.length) {
      const row = el('div', { class: 'modal__actions' });
      actions.forEach(a => row.appendChild(el('button', {
        class: 'btn btn--' + (a.kind || 'gold'),
        onclick: () => { if (a.keepOpen !== true) close(); if (a.onClick) a.onClick(); }
      }, el('span', { text: a.label }))));
      box.appendChild(row);
    }
    document.body.appendChild(back);
    return close;
  };

  ui.toast = function (text, ms) {
    const t = el('div', { class: 'toast', text });
    ui.toastWrap.appendChild(t);
    while (ui.toastWrap.children.length > 3) ui.toastWrap.firstChild.remove();
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 320); }, ms || 2200);
  };

  ui.shake = function (node) {
    if (!node) return;
    node.classList.remove('shake'); void node.offsetWidth; node.classList.add('shake');
    setTimeout(() => node.classList.remove('shake'), 500);
  };

  // ---------- ГРУ ЗНАЙДЕНО ----------
  ui.showReady = function (onAccept) {
    const C = 2 * Math.PI * 64;
    const timer = el('div', { class: 'ready__timer' });
    timer.innerHTML =
      '<svg viewBox="0 0 150 150"><defs><linearGradient id="ready-grad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#e2ccff"/><stop offset="1" stop-color="#7a3cff"/></linearGradient></defs>' +
      '<circle class="track" cx="75" cy="75" r="64" fill="none" stroke-width="8"/>' +
      `<circle class="arc" cx="75" cy="75" r="64" fill="none" stroke-width="8" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg>` +
      '<div class="ready__num">10</div>';
    const arc = timer.querySelector('.arc');
    const num = timer.querySelector('.ready__num');
    let left = 10;
    const tick = () => {
      left = left <= 1 ? 10 : left - 1;
      num.textContent = left;
      arc.style.transition = left === 10 ? 'none' : '';
      arc.style.strokeDashoffset = String(C * (1 - left / 10));
      if (left <= 3 && left > 0) VQ.audio.play('tick');
    };
    const iv = setInterval(tick, 1000);

    const accept = el('button', { class: 'btn btn--green btn--lg' }, el('span', { text: 'Прийняти' }));
    const decline = el('button', { class: 'btn btn--dark btn--sm', onclick: () => ui.toast('Древні не приймають відмов') }, el('span', { text: 'Відхилити' }));
    const panel = el('div', { class: 'panel ready__panel' },
      el('h1', { class: 'h-title', text: 'Гру знайдено' }),
      el('div', { class: 'ready__sub', text: 'Режим: Шлях Войда · 1 гравець' }),
      timer, accept, decline);
    const wrap = el('div', { class: 'ready' }, panel);
    document.body.appendChild(wrap);

    accept.addEventListener('click', () => {
      clearInterval(iv);
      VQ.audio.unlock();
      VQ.audio.play('accept');
      accept.classList.add('is-busy');
      wrap.classList.add('is-leaving');
      setTimeout(() => { wrap.remove(); onAccept(); }, 550);
    }, { once: true });
  };

  // ---------- Частинки ----------
  ui.startParticles = function (canvas) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = canvas.getContext('2d');
    let w, h;
    const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    const parts = Array.from({ length: 38 }, () => spawn(true));
    function spawn(any) {
      return {
        x: Math.random() * innerWidth, y: any ? Math.random() * innerHeight : innerHeight + 10,
        r: 0.6 + Math.random() * 1.8, vy: 0.15 + Math.random() * 0.45, vx: (Math.random() - 0.5) * 0.2,
        a: 0.2 + Math.random() * 0.6, gold: Math.random() < 0.25, ph: Math.random() * 6.28
      };
    }
    (function frame() {
      c.clearRect(0, 0, w, h);
      parts.forEach((p, i) => {
        p.y -= p.vy; p.x += p.vx + Math.sin((p.ph += 0.01)) * 0.15;
        if (p.y < -10) parts[i] = spawn(false);
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, p.gold ? `rgba(255,220,150,${p.a})` : `rgba(190,140,255,${p.a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 4, 0, 6.283); c.fill();
      });
      requestAnimationFrame(frame);
    })();
  };

  VQ.ui = ui;
})();
