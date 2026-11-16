(function () {
  const cfg = () => VQ.config.casino;
  const skins = () => VQ.config.skins;
  const G = () => VQ.goal;
  const ids = () => Object.keys(skins()).filter(id => id !== cfg().giftId);
  const big = () => ids().find(id => skins()[id].price >= 5000);
  const small = () => ids().sort((a, b) => skins()[a].price - skins()[b].price)[0];
  const fresh = (...skinIds) => {
    const s = Object.assign(VQ.state.defaults(), { accepted: true, questDone: true });
    skinIds.forEach(id => { s.inventory.push({ uid: 'i' + s.nextUid, skinId: id }); s.nextUid += 1; });
    return s;
  };

  VQT.test('bestValue ignores the gift', () =>
    VQT.eq(G().bestValue(fresh(cfg().giftId, small()), cfg()), skins()[small()].price));
  VQT.test('bestValue is 0 for an empty inventory', () =>
    VQT.eq(G().bestValue(fresh(), cfg()), 0));
  VQT.test('reached: false below 5 000 ₴, true with a 5 000 ₴+ skin', () => {
    VQT.eq(G().reached(fresh(small()), cfg()), false);
    VQT.eq(G().reached(fresh(small(), big()), cfg()), true);
  });
  VQT.test('progress is a share of 5 000 ₴, capped at 1', () => {
    VQT.near(G().progress(fresh(small()), cfg()), skins()[small()].price / 5000, 1e-9);
    VQT.eq(G().progress(fresh(big()), cfg()), 1);
  });
  VQT.test('isGoalTarget marks only 5 000 ₴+ skins', () => {
    VQT.eq(G().isGoalTarget(big(), cfg()), true);
    VQT.eq(G().isGoalTarget(small(), cfg()), false);
  });
  VQT.test('grantGift marks won and adds the gift once', () => {
    const s = fresh(big());
    G().grantGift(s, cfg());
    G().grantGift(s, cfg());
    VQT.eq(s.won, true);
    VQT.eq(s.inventory.filter(i => i.skinId === cfg().giftId).length, 1);
  });

  VQT.test('banner before the final: goal text and progress, no gift name', () => {
    const b = G().banner(fresh(small()));
    VQT.ok(/5 000 ₴/.test(b.textContent), 'no 5 000 ₴: ' + b.textContent);
    VQT.ok(/Таємна нагорода/.test(b.textContent), 'no title');
    VQT.ok(!/voidhammer|молот/i.test(b.textContent), 'gift named: ' + b.textContent);
    VQT.ok(b.querySelector('.goal-banner__fill'), 'no progress bar');
  });
  VQT.test('banner after the final says the reward is received', () => {
    const s = fresh(big()); G().grantGift(s, cfg());
    VQT.ok(/Нагороду отримано/.test(G().banner(s).textContent));
  });

  VQT.test('resultActions: a 5 000 ₴+ drop before the final leads to the reveal', () => {
    VQT.eq(VQ.cases.resultActions(fresh(small(), big())), 'reveal');
    VQT.eq(VQ.cases.resultActions(fresh(small())), 'normal');
    const done = fresh(big()); G().grantGift(done, cfg());
    VQT.eq(VQ.cases.resultActions(done), 'normal');
  });

  VQT.test('the reveal shows no price, has one button, and it grants the gift and opens the greeting', () => {
    const KEY = 'void-quest-v1';
    const saved = localStorage.getItem(KEY);   // тести на тому самому сайті: справжній прогрес не чіпаємо
    try {
      VQ.state.update(st => Object.assign(st, VQ.state.defaults(), { questDone: true, inventory: [{ uid: 'i1', skinId: big() }], nextUid: 2 }));
      G().showReveal();
      const ov = document.querySelector('.win');
      VQT.ok(ov, 'no reveal overlay');
      VQT.ok(!/₴/.test(ov.textContent), 'price shown: ' + ov.textContent);
      const btns = ov.querySelectorAll('.btn');
      VQT.eq(btns.length, 1);
      btns[0].click();
      VQT.eq(VQ.state.get().won, true);
      VQT.eq(VQ.state.get().inventory.filter(i => i.skinId === cfg().giftId).length, 1);
      VQT.ok(document.querySelector('.final'), 'greeting not shown');
    } finally {
      document.querySelectorAll('.win, .final').forEach(n => n.remove());
      if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);
      VQ.state.load();
    }
  });

  VQT.test('showReveal does nothing after the final (no second reveal)', () => {
    const KEY = 'void-quest-v1';
    const saved = localStorage.getItem(KEY);
    try {
      VQ.state.update(st => { Object.assign(st, VQ.state.defaults(), { questDone: true, inventory: [{ uid: 'i1', skinId: big() }], nextUid: 2 }); G().grantGift(st, cfg()); });
      G().showReveal();
      VQT.eq(document.querySelectorAll('.win').length, 0);
    } finally {
      document.querySelectorAll('.win, .final').forEach(n => n.remove());
      if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved);
      VQ.state.load();
    }
  });

  // ---------- Привітання для Михайла ----------
  VQT.test('the greeting is personal: it names Mykhailo and has no placeholders left', () => {
    const g = VQ.config.greeting;
    VQT.ok(/Михайл/.test(g.title + g.text), 'no name in the greeting');
    VQT.ok(!/TODO|легендо/i.test(JSON.stringify(g)), 'placeholder text left');
  });
  VQT.test('the final screen shows the greeting poem line by line', () => {
    VQ.forge.showFinal();
    const lines = [...document.querySelectorAll('.final .final__line')].map(n => n.textContent);
    document.querySelectorAll('.final').forEach(n => n.remove());
    VQT.eq(lines, VQ.config.greeting.text.split('\n'));
    VQT.ok(lines.length >= 4, 'lines ' + lines.length);
  });
})();
