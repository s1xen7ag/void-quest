(function () {
  VQT.test('quest.totalReward is exactly 1000', () =>
    VQT.eq(VQ.quest.totalReward(), 1000));

  VQT.test('rewardFor: no mistakes gives the full reward', () =>
    VQT.eq(VQ.quest.rewardFor(100, 0), 100));
  VQT.test('rewardFor: each mistake takes 30% of the reward', () => {
    VQT.eq(VQ.quest.rewardFor(100, 1), 70);
    VQT.eq(VQ.quest.rewardFor(100, 2), 40);
    VQT.eq(VQ.quest.rewardFor(150, 1), 105);
  });
  VQT.test('rewardFor: never below 10% (3 wrong out of 4 = almost nothing)', () => {
    VQT.eq(VQ.quest.rewardFor(100, 3), 10);
    VQT.eq(VQ.quest.rewardFor(200, 7), 20);
  });
  VQT.test('totalEarned sums what was actually earned per level', () => {
    const st = Object.assign(VQ.state.defaults(), { earned: { 0: 50, 1: 70, 2: 10 } });
    VQT.eq(VQ.quest.totalEarned(st), 130);
  });

  VQT.test('quest.img shows the label when the image fails to load', async () => {
    const node = VQ.quest.img('missing-image-for-test.png', 'Pudge');
    document.body.appendChild(node);
    await new Promise(r => setTimeout(r, 400));
    VQT.ok(node.textContent.includes('Pudge'), 'fallback text not shown: "' + node.textContent + '"');
    node.remove();
  });
})();
