(function () {
  const HL = () => VQ.trials.higherLower;
  const T = () => VQ.config.levels.find(l => l.trial.type === 'higherLower').trial;
  function rngFrom(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

  VQT.test('higher/lower asks for 10 rounds', () => VQT.eq(T().count, 10));

  VQT.test('makeRounds builds 10 pairs with close prices (50..700 gold apart)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const rounds = HL().makeRounds(T(), rngFrom(seed));
      VQT.eq(rounds.length, 10, 'seed ' + seed);
      rounds.forEach(r => {
        const d = Math.abs(r.a.cost - r.b.cost);
        VQT.ok(r.a.key !== r.b.key, 'same item in a pair');
        VQT.ok(d >= T().minDiff && d <= T().maxDiff, `seed ${seed}: ${r.a.name} ${r.a.cost} vs ${r.b.name} ${r.b.cost}`);
      });
    }
  });

  VQT.test('makeRounds mixes the answers (some "more expensive", some "cheaper")', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const dirs = HL().makeRounds(T(), rngFrom(seed)).map(r => r.b.cost > r.a.cost);
      VQT.ok(dirs.includes(true) && dirs.includes(false), 'seed ' + seed + ' is one-sided');
    }
  });

  VQT.test('the answer is about the hidden item: Spirit Vessel (2725, hidden) vs Skull Basher (2875)', () => {
    const round = { a: { key: 'basher', name: 'Skull Basher', cost: 2875 }, b: { key: 'spirit_vessel', name: 'Spirit Vessel', cost: 2725 } };
    VQT.eq(HL().hiddenOf(round).name, 'Spirit Vessel');
    VQT.eq(HL().knownOf(round).name, 'Skull Basher');
    VQT.eq(HL().isCorrect(round, 'more'), false, 'Spirit Vessel is NOT more expensive');
    VQT.eq(HL().isCorrect(round, 'less'), true, 'Spirit Vessel IS cheaper');
  });

  VQT.test('a restart gives a different set of pairs', () => {
    const a = HL().makeRounds(T(), rngFrom(4)).map(r => r.a.key + r.b.key).join();
    const b = HL().makeRounds(T(), rngFrom(99)).map(r => r.a.key + r.b.key).join();
    VQT.ok(a !== b);
  });

  // ---------- Більше предметів і складніший підробіток «Ціна могутності» ----------
  const JOB = () => VQ.jobs.build(VQ.config.jobs.find(j => j.from === 'higherLower'));

  VQT.test('price pool: at least 75 different items with sane gold costs, no Blink variants', () => {
    const pool = T().pool;
    VQT.ok(pool.length >= 75, 'pool ' + pool.length);
    VQT.eq(new Set(pool.map(p => p.key)).size, pool.length, 'a repeated item');
    pool.forEach(p => {
      VQT.ok(p.name && p.cost >= 300 && p.cost <= 7500, p.key + ' cost ' + p.cost);
      VQT.ok(!/blink/.test(p.key), 'blink variant ' + p.key);
    });
  });
  VQT.test('price job: 7 pairs in a row, prices only 25–250 gold apart', () => {
    const d = JOB();
    VQT.eq([d.count, d.minDiff, d.maxDiff], [7, 25, 250]);
    for (let seed = 1; seed <= 25; seed++) {
      const rounds = HL().makeRounds(d, rngFrom(seed * 7919 + 3));
      VQT.eq(rounds.length, 7, 'seed ' + seed);
      rounds.forEach(r => {
        const diff = Math.abs(r.a.cost - r.b.cost);
        VQT.ok(diff >= 25 && diff <= 250, 'diff ' + diff);
      });
    }
  });
  VQT.test('price job: two runs rarely share items (many different items)', () => {
    const d = JOB();
    const a = new Set(HL().makeRounds(d, rngFrom(101)).flatMap(r => [r.a.key, r.b.key]));
    const b = HL().makeRounds(d, rngFrom(9001)).flatMap(r => [r.a.key, r.b.key]);
    VQT.ok(b.filter(k => a.has(k)).length <= 4, 'shared ' + b.filter(k => a.has(k)).length);
  });
  VQT.test('price pool: every item icon loads from Steam', async () => {
    const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(null); i.onerror = () => res(src); i.src = src; });
    const broken = (await Promise.all(T().pool.map(p => load(VQ.util.cdn.item(p.key))))).filter(Boolean);
    VQT.eq(broken, []);
  });
})();
