(function () {
  const cfg = () => VQ.config.casino;
  const F = () => VQ.forge;
  // стан «після чотирьох скринь»: 4 дешеві предмети, баланс 0
  function fresh() {
    const s = Object.assign(VQ.state.defaults(), { accepted: true, questDone: true, balance: 0 });
    const cheap = Object.keys(VQ.config.skins).filter(id => id !== cfg().giftId)
      .sort((a, b) => VQ.config.skins[a].price - VQ.config.skins[b].price).slice(0, 4);
    cheap.forEach(id => { s.inventory.push({ uid: 'i' + s.nextUid, skinId: id }); s.nextUid += 1; });
    return s;
  }
  function rngFrom(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
  const rel = (a, start) => (((a - start) % 360) + 360) % 360;

  VQT.test('calcChance: 240 ₴ into 3900 ₴ is about 5.54%', () =>
    VQT.near(F().calcChance(240, 3900, cfg()), 5.538, 0.01));
  VQT.test('calcChance is capped at 75%', () =>
    VQT.eq(F().calcChance(900, 1000, cfg()), 75));

  const ids = () => Object.keys(VQ.config.skins).filter(id => id !== cfg().giftId);
  const big = () => ids().find(id => VQ.config.skins[id].price >= 5000);
  const mid = () => ids().find(id => VQ.config.skins[id].price >= 1000 && VQ.config.skins[id].price < 5000);

  VQT.test('decideOutcome is honest before 3 goal fails', () => {
    const s = fresh(); s.goalFails = 2;
    VQT.eq(F().decideOutcome(s, big(), cfg(), 15, () => 0.14), 'win');
    VQT.eq(F().decideOutcome(s, big(), cfg(), 15, () => 0.16), 'lose');
  });

  VQT.test('after 3 goal fails a 5 000 ₴+ target with chance ≥ 5% wins', () => {
    const s = fresh(); s.goalFails = 3;
    VQT.eq(F().decideOutcome(s, big(), cfg(), 5, () => 0.99), 'win');
  });

  VQT.test('the safety net ignores chances below 5% and cheaper targets', () => {
    const s = fresh(); s.goalFails = 3;
    VQT.eq(F().decideOutcome(s, big(), cfg(), 4.9, () => 0.99), 'lose');
    VQT.eq(F().decideOutcome(s, mid(), cfg(), 40, () => 0.99), 'lose');
  });

  VQT.test('after the final there is no safety net', () => {
    const s = fresh(); s.goalFails = 9; s.won = true;
    VQT.eq(F().decideOutcome(s, big(), cfg(), 40, () => 0.99), 'lose');
    VQT.eq(F().decideOutcome(s, big(), cfg(), 40, () => 0.39), 'win');
  });

  VQT.test('applyUpgrade counts goal fails only for 5 000 ₴+ targets before the final', () => {
    const s = fresh();
    F().applyUpgrade(s, [s.inventory[0].uid], mid(), 'lose', cfg());
    VQT.eq(s.goalFails, 0, 'cheap target counted');
    F().applyUpgrade(s, [s.inventory[0].uid], big(), 'lose', cfg());
    VQT.eq(s.goalFails, 1);
    s.won = true;
    F().applyUpgrade(s, [s.inventory[0].uid], big(), 'lose', cfg());
    VQT.eq(s.goalFails, 1, 'counted after the final');
    VQT.eq(s.inventory.length, 1);
  });

  VQT.test('a forge win swaps the stake for the target but does not mark the final', () => {
    const s = fresh();
    const stake = s.inventory[0].uid;
    F().applyUpgrade(s, [stake], big(), 'win', cfg());
    VQT.ok(!s.inventory.some(i => i.uid === stake), 'stake still in inventory');
    VQT.ok(s.inventory.some(i => i.skinId === big()), 'target not in inventory');
    VQT.eq(s.won, false);
  });

  VQT.test('one emptying loss does not bring the Gift of the Ancients yet', () => {
    const s = fresh();
    F().applyUpgrade(s, s.inventory.map(i => i.uid), 'golden-staff-of-gun-yu', 'lose', cfg());
    VQT.eq(s.inventory.length, 0);
    VQT.eq(F().needsAncientsGift(s, cfg()), false);
    VQT.eq(F().pendingPopups(s, cfg()), []);
  });

  VQT.test('the Gift of the Ancients comes after 5 failed upgrades when broke, then only after 5 more', () => {
    const s = fresh(); s.inventory = []; s.losses = 5;
    VQT.eq(F().needsAncientsGift(s, cfg()), true);
    F().grantAncientsGift(s, cfg());
    VQT.eq(s.inventory.length, 1);
    s.inventory = []; s.losses = 9;
    VQT.eq(F().needsAncientsGift(s, cfg()), false, 'only 4 losses since the gift');
    s.losses = 10;
    VQT.eq(F().needsAncientsGift(s, cfg()), true);
  });

  VQT.test('the Gift of the Ancients is the cheapest skin from the case floor, cheaper than 159 ₴', () => {
    const id = F().ancientsSkin(cfg());
    const prices = ids().map(i => VQ.config.skins[i].price).filter(p => p >= cfg().caseMinPrice);
    VQT.eq(VQ.config.skins[id].price, Math.min(...prices));
    VQT.ok(VQ.config.skins[id].price < 159, 'price ' + VQ.config.skins[id].price);
    const s = fresh(); s.inventory = []; s.losses = 5;
    F().grantAncientsGift(s, cfg());
    VQT.eq(s.inventory[0].skinId, id);
  });

  VQT.test('pendingPopups: a fresh load while broke after 5 failed upgrades still reports the Gift of the Ancients', () => {
    const s = fresh(); s.inventory = []; s.losses = 5;
    const reloaded = VQ.state.load({ getItem: () => JSON.stringify(s), setItem() {}, removeItem() {} });
    VQT.eq(F().pendingPopups(reloaded, cfg()), ['ancients']);
  });

  VQT.test('pendingPopups reports the final once a 5 000 ₴+ skin is owned, and nothing after it', () => {
    const s = fresh();
    VQT.eq(F().pendingPopups(s, cfg()), []);
    F().applyUpgrade(s, [s.inventory[0].uid], big(), 'win', cfg());
    VQT.eq(F().pendingPopups(s, cfg()), ['final']);
    VQ.goal.grantGift(s, cfg());
    VQT.eq(F().pendingPopups(s, cfg()), []);
  });

  VQT.test('the gift is never a forge target', () => {
    const s = fresh();
    VQT.ok(!F().availableTargets(s, 50, cfg()).includes(cfg().giftId), 'before the final');
    s.won = true;
    VQT.ok(!F().availableTargets(s, 50, cfg()).includes(cfg().giftId), 'after the final');
  });

  VQT.test('isFinalWin: decided at roll time for a 5 000 ₴+ win before the final', () => {
    const s = fresh();
    VQT.eq(F().isFinalWin(s, big(), 'win', cfg()), true);
    VQT.eq(F().isFinalWin(s, big(), 'lose', cfg()), false);
    VQT.eq(F().isFinalWin(s, mid(), 'win', cfg()), false);
    s.won = true;
    VQT.eq(F().isFinalWin(s, big(), 'win', cfg()), false);
  });

  VQT.test('the gift is locked: it cannot be staked', () => {
    VQT.eq(F().isLocked(cfg().giftId, cfg()), true);
    VQT.eq(F().isLocked('reaper-s-wreath', cfg()), false);
  });

  VQT.test('finalAngle: win lands inside the zone, lose lands at least 4° outside', () => {
    for (const size of [2, 5.5, 40]) {
      for (let i = 0; i < 200; i++) {
        const start = (i * 37) % 360;
        const rng = rngFrom(i + 1);
        const w = rel(F().finalAngle(start, size, 'win', rng), start);
        VQT.ok(w > 0 && w < size, `win outside zone: size ${size}, rel ${w}`);
        const l = rel(F().finalAngle(start, size, 'lose', rng), start);
        const dist = l >= size ? Math.min(l - size, 360 - l) : -1;
        VQT.ok(dist >= 4 - 1e-9, `lose too close/inside: size ${size}, rel ${l}`);
      }
    }
  });
})();
