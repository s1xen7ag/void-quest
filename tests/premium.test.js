(function () {
  const cfg = () => VQ.config.casino;
  const C = () => VQ.cases;
  const premiumId = () => cfg().cases.find(d => d.premium).id;
  const state = won => Object.assign(VQ.state.defaults(), { accepted: true, questDone: true, balance: 100000, won });

  VQT.test('there is a premium case with a Baby Roshan courier on top', () => {
    const c = C().get(premiumId());
    VQT.ok(/Baby Roshan/.test(c.items[0].name), 'top item: ' + c.items[0].name);
    VQT.ok(c.price >= 1000, 'premium price ' + c.price);
  });

  VQT.test('the premium case opens before the final when there is enough money', () => {
    const s = state(false);
    VQT.eq(C().canOpen(s, premiumId()), true);
    VQT.ok(C().openCase(s, premiumId(), () => 0.5), 'nothing dropped');
  });

  VQT.test('a premium jackpot is possible at any time', () => {
    const c = C().get(premiumId());
    VQT.eq(C().rollDrop(c, () => 1e-9), c.items[0].id);
  });

  // ---------- Підробіток ----------
  VQT.test('there are at least 4 side jobs, each a known trial type with a reward', () => {
    VQT.ok(VQ.config.jobs.length >= 4, 'jobs ' + VQ.config.jobs.length);
    VQ.config.jobs.forEach(j => {
      const data = VQ.jobs.build(j);
      VQT.ok(VQ.trials[data.type], j.id + ': unknown type ' + data.type);
      VQT.ok(j.reward > 0, j.id + ' reward');
    });
  });

  VQT.test('a side job pays its reward minus 30% per mistake (min 10%)', () => {
    const j = VQ.config.jobs[0];
    VQT.eq(VQ.jobs.payout(j, 0), j.reward);
    VQT.eq(VQ.jobs.payout(j, 1), Math.round(j.reward * 0.7));
    VQT.eq(VQ.jobs.payout(j, 5), Math.round(j.reward * 0.1));
  });
})();
