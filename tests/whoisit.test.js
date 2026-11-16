(function () {
  const W = () => VQ.trials.whoIsIt;

  VQT.test('machine vision: starts as a coarse 8×8 mosaic at 12%', () =>
    VQT.eq(W().stage(0, false), { blocks: 8, pct: 12 }));
  VQT.test('machine vision: each mistake makes the mosaic finer (41%, then 78%)', () => {
    VQT.eq(W().stage(1, false), { blocks: 14, pct: 41 });
    VQT.eq(W().stage(2, false), { blocks: 24, pct: 78 });
  });
  VQT.test('machine vision: more mistakes stay at the finest mosaic', () =>
    VQT.eq(W().stage(6, false), { blocks: 24, pct: 78 }));
  VQT.test('machine vision: the right answer shows the clear icon at 100%', () =>
    VQT.eq(W().stage(1, true), { blocks: 0, pct: 100 }));

  VQT.test('_choice reports each wrong pick in a round to opts.onWrong', () => {
    const box = document.createElement('div');
    const seen = [];
    const api = { round() {}, fail() {}, success() {}, counter() {} };
    const stop = VQ.trials._choice(box, { rounds: [{ hero: 'a', options: ['a', 'b', 'c'] }] }, api, {
      prompt: () => document.createElement('div'),
      option: key => { const b = document.createElement('button'); b.dataset.key = key; return b; },
      onWrong: (round, misses) => seen.push(misses)
    });
    box.querySelector('[data-key="b"]').click();
    box.querySelector('[data-key="c"]').click();
    VQT.eq(seen, [1, 2]);
    if (stop) stop();
  });

  VQT.test('_choice tells opts.onCorrect when the round is solved', () => {
    const box = document.createElement('div');
    let solved = null;
    const api = { round() {}, fail() {}, success() {}, counter() {} };
    const stop = VQ.trials._choice(box, { rounds: [{ hero: 'a', options: ['a', 'b'] }] }, api, {
      prompt: () => document.createElement('div'),
      option: key => { const b = document.createElement('button'); b.dataset.key = key; return b; },
      onCorrect: round => { solved = round.hero; }
    });
    box.querySelector('[data-key="a"]').click();
    VQT.eq(solved, 'a');
    if (stop) stop();
  });

  // ---------- Складніший пул (Kez, Largo та інші) ----------
  const T = () => VQ.config.levels.find(l => l.trial.type === 'whoIsIt').trial;
  function rngFrom(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

  VQT.test('who is it: at least 35 heroes incl. Kez, Largo and Ring Master, 8 per run', () => {
    const heroes = T().pool.map(r => r.hero);
    VQT.ok(heroes.length >= 35, 'pool ' + heroes.length);
    ['kez', 'largo', 'ringmaster'].forEach(h => VQT.ok(heroes.includes(h), 'no ' + h));
    VQT.eq(new Set(heroes).size, heroes.length, 'a hero repeats');
    VQT.eq(T().count, 8);
  });
  VQT.test('who is it: every round has 3 abilities of its own hero and 4 different options with the hero', () => {
    T().pool.forEach(r => {
      VQT.eq(r.abilities.length, 3, r.hero);
      r.abilities.forEach(a => VQT.ok(a.startsWith(r.hero + '_'), r.hero + ': ' + a));
      VQT.eq(new Set(r.options).size, 4, r.hero + ' options');
      VQT.ok(r.options.includes(r.hero), r.hero + ' not among options');
    });
  });
  VQT.test('who is it: every hero and option has a display name, none from the old quest', () => {
    T().pool.forEach(r => r.options.forEach(k => {
      VQT.ok(VQ.config.heroNames[k], 'no name for ' + k);
      VQT.ok(!['juggernaut', 'pudge'].includes(k), 'old-quest hero ' + k);
    }));
  });
  VQT.test('who is it: icon order is random, the ultimate is not always third', () => {
    const r = T().pool[0];
    const spots = new Set();
    for (let s = 1; s <= 30; s++) spots.add(W().iconOrder(r.abilities, rngFrom(s * 104729 + 7)).indexOf(r.abilities[2]));
    VQT.eq(spots.size, 3);
    VQT.eq(W().iconOrder(r.abilities, rngFrom(5)).slice().sort(), r.abilities.slice().sort());
  });
  VQT.test('who is it: all ability icons and hero portraits load from Steam', async () => {
    const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(null); i.onerror = () => res(src); i.src = src; });
    const srcs = new Set();
    T().pool.forEach(r => { r.abilities.forEach(a => srcs.add(VQ.util.cdn.ability(a))); r.options.forEach(k => srcs.add(VQ.util.cdn.hero(k))); });
    const broken = (await Promise.all([...srcs].map(load))).filter(Boolean);
    VQT.eq(broken, []);
  });
})();
