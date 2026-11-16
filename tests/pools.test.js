(function () {
  const T = type => VQ.config.levels.find(l => l.trial.type === type).trial;
  const pick = (data, seed) => { let x = seed; const rng = () => (x = (x * 16807) % 2147483647) / 2147483647; return VQ.trials._choice.pick(data, rng); };

  [['silhouette', 12, 6, 6], ['quote', 12, 7, 4], ['whoIsIt', 35, 8, 4]].forEach(([type, minPool, count, opts]) => {
    VQT.test(`${type}: pool has at least ${minPool} entries and asks ${count} rounds`, () => {
      VQT.ok(T(type).pool.length >= minPool, 'pool ' + T(type).pool.length);
      VQT.eq(T(type).count, count);
    });

    VQT.test(`${type}: every pool entry has ${opts} distinct options including the answer`, () => {
      T(type).pool.forEach(r => {
        VQT.eq(r.options.length, opts, r.hero);
        VQT.eq(new Set(r.options).size, opts, r.hero + ' has duplicate options');
        VQT.ok(r.options.includes(r.hero), r.hero + ' missing from its options');
      });
    });

    VQT.test(`${type}: pick gives ${count} different rounds in a random order`, () => {
      const a = pick(T(type), 3), b = pick(T(type), 77);
      VQT.eq(a.length, count);
      VQT.eq(new Set(a.map(r => r.hero + (r.text || r.name || ''))).size, count, 'repeated round');
      VQT.ok(a.map(r => r.hero).join() !== b.map(r => r.hero).join(), 'order not random');
    });
  });

  VQT.test('whoIsIt: every round shows exactly 3 abilities', () =>
    T('whoIsIt').pool.forEach(r => VQT.eq(r.abilities.length, 3, r.hero)));

  VQT.test('quote: every round is either a voice line or a real name', () =>
    T('quote').pool.forEach(r => VQT.ok(!!(r.text || r.name), r.hero)));
})();
