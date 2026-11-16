(function () {
  const cfg = () => VQ.config.casino;
  const skins = () => VQ.config.skins;
  const C = () => VQ.cases;
  function rngFrom(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
  const fresh = () => Object.assign(VQ.state.defaults(), { accepted: true, questDone: true, balance: 1000 });

  VQT.test('there are at least 6 cases and each has at least 6 items', () => {
    VQT.ok(cfg().cases.length >= 6, 'cases: ' + cfg().cases.length);
    cfg().cases.forEach(def => VQT.ok(C().get(def.id).items.length >= 6, def.id + ' has too few items'));
  });

  VQT.test('case contents are sorted from the most expensive down', () => {
    cfg().cases.forEach(def => {
      const p = C().get(def.id).items.map(i => i.price);
      VQT.eq(p, p.slice().sort((a, b) => b - a), def.id);
    });
  });

  VQT.test('the gift never appears inside a case', () => {
    cfg().cases.forEach(def => VQT.ok(!C().get(def.id).items.some(i => i.id === cfg().giftId), def.id));
  });

  VQT.test('odds add up to 100% and cheaper items are more likely', () => {
    cfg().cases.forEach(def => {
      const items = C().get(def.id).items;
      const sum = items.reduce((s, i) => s + i.odds, 0);
      VQT.near(sum, 1, 1e-9, def.id + ' odds sum');
      for (let k = 1; k < items.length; k++) VQT.ok(items[k].odds >= items[k - 1].odds - 1e-12, def.id + ' odds not rising');
    });
  });

  VQT.test('case price is above the realistic expected value (house edge)', () => {
    cfg().cases.forEach(def => {
      const c = C().get(def.id);
      const ev = c.items.reduce((s, i) => s + i.odds * i.price, 0);
      VQT.ok(c.price > ev * 1.05 && c.price < ev * 1.6, `${def.id}: price ${c.price}, ev ${Math.round(ev)}`);
    });
  });

  VQT.test('rollDrop is honest: the lowest roll gives the most expensive item', () => {
    const c = C().get('time');
    VQT.eq(C().rollDrop(c, () => 0), c.items[0].id);
  });

  VQT.test('casino config has the 5 000 ₴ goal and no scripted leftovers', () => {
    VQT.eq(cfg().goal, { value: 5000, pityAfter: 3, pityMinChance: 5 });
    VQT.ok(!('jackpotCapCase' in cfg()) && !('lossesBeforeRecommend' in cfg()));
  });

  VQT.test('openCase charges the case price and adds the dropped item', () => {
    const s = fresh();
    const c = C().get(cfg().cases[0].id);
    const item = C().openCase(s, c.id, rngFrom(3));
    VQT.eq(s.balance, 1000 - c.price);
    VQT.eq(s.inventory.length, 1);
    VQT.eq(s.inventory[0].skinId, item.skinId);
  });

  VQT.test('openCase returns null and charges nothing without enough money', () => {
    const s = fresh(); s.balance = 1;
    VQT.eq(C().openCase(s, cfg().cases[0].id, rngFrom(3)), null);
    VQT.eq(s.balance, 1);
    VQT.eq(s.inventory.length, 0);
  });

  VQT.test('sell removes the item and pays its full price', () => {
    const s = fresh();
    const item = C().openCase(s, cfg().cases[0].id, rngFrom(5));
    const before = s.balance;
    const paid = C().sell(s, item.uid);
    VQT.eq(paid, skins()[item.skinId].price);
    VQT.eq(s.balance, before + paid);
    VQT.eq(s.inventory.length, 0);
    VQT.eq(C().sell(s, item.uid), 0, 'selling twice pays nothing');
  });

  VQT.test('the gift cannot be sold (it is already in Steam)', () => {
    const s = fresh();
    s.inventory.push({ uid: 'g1', skinId: cfg().giftId });
    VQT.eq(C().sell(s, 'g1'), 0);
    VQT.eq(s.inventory.length, 1);
    VQT.eq(s.balance, 1000);
  });

  VQT.test('the cheapest case price is exposed as casino.casePrice', () =>
    VQT.eq(cfg().casePrice, Math.min(...cfg().cases.map(d => C().get(d.id).price))));

  VQT.test('buildStrip has 60 cards with the winner at index 52', () => {
    const c = C().get(cfg().cases[0].id);
    const win = c.items[c.items.length - 1].id;
    const strip = C().buildStrip(win, c, rngFrom(7));
    VQT.eq(strip.length, 60);
    VQT.eq(strip[52], win);
  });

  VQT.test('regular cases hold no skin under 20 ₴ and cost at least 50 ₴ (Steam prices go down to 1 ₴)', () => {
    VQ.config.casino.cases.filter(d => !d.premium).forEach(def => {
      const c = VQ.cases.get(def.id);
      VQT.ok(c.items.every(it => it.price >= VQ.config.casino.caseMinPrice), def.id + ' has a skin under the floor');
      VQT.ok(c.price >= 50, def.id + ' costs ' + c.price);
      VQT.ok(c.items.length >= 6, def.id + ' items ' + c.items.length);
    });
  });
})();
