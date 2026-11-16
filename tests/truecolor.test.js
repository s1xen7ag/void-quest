(function () {
  const TC = () => VQ.trials.trueColor;
  const levels = () => VQ.config.levels;
  const T = () => levels().find(l => l.trial.type === 'trueColor').trial;
  function rngFrom(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

  VQT.test('true colour: it is the 9th trial, right before the last-hit finale', () => {
    VQT.eq(levels()[8].trial.type, 'trueColor');
    VQT.eq(levels()[9].trial.type, 'lastHit');
  });
  VQT.test('true colour: pool of at least 10 catalog skins worth 1 000 ₴+, 5 per run', () => {
    VQT.ok(T().pool.length >= 10, 'pool ' + T().pool.length);
    VQT.eq(T().count, 5);
    T().pool.forEach(id => VQT.ok(VQ.config.skins[id] && VQ.config.skins[id].price >= 1000, 'bad skin ' + id));
    VQT.ok(!T().pool.includes(VQ.config.casino.giftId), 'the gift is in the pool');
  });
  VQT.test('true colour: a run is 5 different skins, each with variants 0–3 in random order', () => {
    const a = TC().rounds(T(), rngFrom(3)), b = TC().rounds(T(), rngFrom(77));
    VQT.eq(a.length, 5);
    VQT.eq(new Set(a.map(r => r.id)).size, 5);
    a.forEach(r => VQT.eq(r.order.slice().sort(), [0, 1, 2, 3], r.id));
    VQT.ok(JSON.stringify(a) !== JSON.stringify(b), 'two runs are identical');
    const firstPos = new Set();
    for (let s = 1; s <= 40; s++) TC().rounds(T(), rngFrom(s)).forEach(r => firstPos.add(r.order.indexOf(0)));
    VQT.eq(firstPos.size, 4, 'the original is not spread over all 4 places');
  });
  VQT.test('true colour: every variant image of every pool skin exists', async () => {
    const missing = [];
    for (const id of T().pool) {
      for (let k = 0; k < 4; k++) {
        const url = '../' + TC().src(T(), id, k);
        const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        if (!r.ok) missing.push(url);
      }
    }
    VQT.eq(missing, []);
  });
})();
