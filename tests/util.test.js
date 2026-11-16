(function () {
  const RIDDLE = () => VQ.config.levels[0].trial.pool.find(r => r.answers.includes('cheese')).answers;

  VQT.test('matchesAnswer trims and ignores case', () =>
    VQT.eq(VQ.util.matchesAnswer('  CHEESE ', RIDDLE()), true));
  VQT.test('matchesAnswer ignores spaces and apostrophes inside the answer', () =>
    VQT.eq(VQ.util.matchesAnswer("Ch'ee se", ['cheese']), true));
  VQT.test('matchesAnswer accepts cyrillic spelling', () =>
    VQT.eq(VQ.util.matchesAnswer('Сир', RIDDLE()), true));
  VQT.test('matchesAnswer rejects text that only contains the answer', () =>
    VQT.eq(VQ.util.matchesAnswer('cheeseblabla', RIDDLE()), false));
  VQT.test('matchesAnswer rejects empty input', () =>
    VQT.eq(VQ.util.matchesAnswer('', RIDDLE()), false));

  VQT.test('formatUAH groups thousands with a no-break space', () =>
    VQT.eq(VQ.util.formatUAH(1000), '1 000 ₴'));
  VQT.test('formatUAH keeps small numbers plain', () =>
    VQT.eq(VQ.util.formatUAH(250), '250 ₴'));

  VQT.test('config has 10 levels whose rewards sum to 1000', () => {
    VQT.eq(VQ.config.levels.length, 10);
    VQT.eq(VQ.config.levels.reduce((s, l) => s + l.reward, 0), 1000);
  });
})();
