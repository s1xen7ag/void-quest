(function () {
  const AM = () => VQ.trials.abilityMatch;
  const T = () => VQ.config.levels.find(l => l.trial.type === 'abilityMatch').trial;
  function rngFrom(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

  VQT.test('ability match: pool has at least 5 heroes with 4 abilities each', () => {
    const heroes = Object.keys(T().pool);
    VQT.ok(heroes.length >= 5, 'heroes ' + heroes.length);
    heroes.forEach(h => VQT.eq(T().pool[h].length, 4, h));
  });

  VQT.test('ability match: a run is 3 different heroes, Faceless Void first', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const run = AM().pickHeroes(T(), rngFrom(seed));
      VQT.eq(run.length, 3, 'seed ' + seed);
      VQT.eq(run[0], 'faceless_void');
      VQT.eq(new Set(run).size, 3, 'repeated hero');
    }
  });

  VQT.test('ability match: the other two heroes vary between runs', () => {
    const a = AM().pickHeroes(T(), rngFrom(2)).join(), b = AM().pickHeroes(T(), rngFrom(50)).join();
    VQT.ok(a !== b);
  });
})();
