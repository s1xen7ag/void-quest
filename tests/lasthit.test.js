(function () {
  const LH = () => VQ.trials.lastHit;
  const T = () => VQ.config.levels.find(l => l.trial.type === 'lastHit').trial;

  VQT.test('judgeReaction: a click after the field is gone is late', () =>
    VQT.eq(LH().judgeReaction(1501, 1000, 500), 'late'));
  VQT.test('judgeReaction: a click while the field is visible counts', () => {
    VQT.eq(LH().judgeReaction(1000, 1000, 500), 'hit');
    VQT.eq(LH().judgeReaction(1500, 1000, 500), 'hit');
  });

  VQT.test('inTarget: a click inside the round field hits, outside misses', () => {
    const f = { x: 100, y: 100, r: 40 };
    VQT.eq(LH().inTarget(100, 100, f), true);
    VQT.eq(LH().inTarget(128, 128, f), true);    // ~39.6 px from the centre
    VQT.eq(LH().inTarget(130, 130, f), false);   // ~42.4 px
  });

  VQT.test('the field gets shorter-lived and smaller with every hit', () => {
    const w = [0, 1, 2, 3, 4].map(h => LH().windowFor(h, T()));
    const s = [0, 1, 2, 3, 4].map(h => LH().sizeFor(h, T()));
    for (let k = 1; k < 5; k++) {
      VQT.ok(w[k] < w[k - 1], 'windows: ' + w.join(', '));
      VQT.ok(s[k] < s[k - 1], 'sizes: ' + s.join(', '));
    }
    VQT.ok(w[4] >= 450, 'last window is unfair: ' + w[4]);
    VQT.ok(s[4] >= 50, 'last field is too small: ' + s[4]);
  });

  VQT.test('last hit needs 5 hits', () => VQT.eq(T().need, 5));
})();
