(function () {
  const T = type => VQ.config.levels.find(l => l.trial.type === type).trial;
  const pick = (data, seed) => { let x = seed; const rng = () => (x = (x * 16807) % 2147483647) / 2147483647; return VQ.trials._choice.pick(data, rng); };

  VQT.test('riddles: pool of at least 10, 3 per run', () => {
    VQT.ok(T('riddle').pool.length >= 10, 'pool ' + T('riddle').pool.length);
    VQT.eq(T('riddle').count, 3);
  });
  VQT.test('riddles: every riddle has text, answers and its own hint', () =>
    T('riddle').pool.forEach(r => VQT.ok(r.text && r.answers.length && r.hint, JSON.stringify(r).slice(0, 60))));
  VQT.test('riddles: no riddle is answered with Aegis (old quest)', () =>
    VQT.ok(!T('riddle').pool.some(r => r.answers.includes('aegis'))));
  VQT.test('riddles: a run is 3 different riddles in random order', () => {
    const a = pick(T('riddle'), 5), b = pick(T('riddle'), 91);
    VQT.eq(new Set(a.map(r => r.text)).size, 3);
    VQT.ok(a.map(r => r.text).join() !== b.map(r => r.text).join());
  });
  VQT.test('riddles: answers are matched in Ukrainian and English', () => {
    const tango = T('riddle').pool.find(r => r.answers.includes('tango'));
    VQT.ok(VQ.util.matchesAnswer('Танго', tango.answers) && VQ.util.matchesAnswer('TANGO', tango.answers));
  });

  VQT.test('craft: pool of at least 10 items, 3 per run', () => {
    VQT.ok(T('craft').pool.length >= 10, 'pool ' + T('craft').pool.length);
    VQT.eq(T('craft').count, 3);
  });
  VQT.test('craft: correct and wrong components never overlap, every key has a name', () => {
    const names = T('craft').names;
    T('craft').pool.forEach(r => {
      VQT.eq(r.correct.filter(k => r.wrong.includes(k)), [], r.target);
      [r.target, ...r.correct, ...r.wrong].forEach(k => VQT.ok(names[k], 'no name for ' + k));
      VQT.ok(r.correct.length >= 2 && r.correct.length <= 3, r.target + ' recipe size');
    });
  });
  VQT.test('craft: a run is 3 different items', () =>
    VQT.eq(new Set(pick(T('craft'), 8).map(r => r.target)).size, 3));
})();
