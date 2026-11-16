// Вимога замовника: новий квест не повторює старий (index.html/javascript.js у корені папки).
(function () {
  const OLD = {
    items: ['aegis', 'bloodthorn', 'orchid', 'hyperstone', 'javelin', 'recipe', 'quarterstaff', 'mask_of_madness',
            'lifesteal', 'broadsword', 'blades_of_attack', 'blink', 'black_king_bar', 'ultimate_scepter', 'rapier', 'refresher'],
    heroes: ['juggernaut', 'pudge'],
    skinFiles: ['pa_skin', 'void_skin', 'jugg_skin', 'ursa_skin']
  };
  const trial = type => VQ.config.levels.find(l => l.trial.type === type).trial;

  VQT.test('no trial uses an item from the old quest', () => {
    const craft = trial('craft'), mem = trial('memory'), hl = trial('higherLower');
    const crafts = craft.pool.flatMap(r => [r.target, ...r.correct, ...r.wrong]);
    const used = [...crafts, ...mem.items,
                  ...hl.pool.map(p => p.key)];
    const repeated = used.filter(k => OLD.items.includes(k));
    VQT.eq(repeated, []);
  });

  VQT.test('the riddle answer is not Aegis', () =>
    VQT.ok(!trial('riddle').pool.some(r => r.answers.includes('aegis')), 'riddle still answers Aegis'));

  VQT.test('no silhouette or quote is about Juggernaut or Pudge', () => {
    const heroes = [...trial('silhouette').pool, ...trial('quote').pool].map(r => r.hero);
    VQT.eq(heroes.filter(h => OLD.heroes.includes(h)), []);
  });

  VQT.test('no quote repeats "Fresh meat!"', () =>
    VQT.ok(!trial('quote').pool.some(r => /fresh meat/i.test(r.text || ''))));

  VQT.test('no skin is one of the old quest skins (Manifold Paradox, Bladeform Legacy, Alpine Stalker, Claszian)', () => {
    const names = Object.values(VQ.config.skins).map(s => s.name);
    VQT.eq(names.filter(n => /Manifold Paradox|Bladeform Legacy|Alpine Stalker|Claszian/i.test(n)), []);
  });

  VQT.test('no skin uses an image from the old quest folder', () => {
    const imgs = Object.values(VQ.config.skins).map(s => s.img);
    VQT.eq(imgs.filter(src => OLD.skinFiles.some(f => src.includes(f))), []);
  });

  VQT.test('quest and casino texts never name the gift before the final', () => {
    const texts = JSON.stringify([VQ.config.levels, VQ.config.outro, VQ.config.jobs, VQ.config.casino.cases]);
    VQT.ok(!/voidhammer|молот/i.test(texts));
  });
})();
