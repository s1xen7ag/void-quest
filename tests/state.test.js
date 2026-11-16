(function () {
  function fakeStorage(init) {
    const m = Object.assign({}, init);
    return {
      getItem: k => (k in m ? m[k] : null),
      setItem: (k, v) => { m[k] = String(v); },
      removeItem: k => { delete m[k]; }
    };
  }
  const throwing = {
    getItem() { throw new Error('denied'); },
    setItem() { throw new Error('denied'); },
    removeItem() { throw new Error('denied'); }
  };

  VQT.test('load with corrupted JSON returns defaults', () =>
    VQT.eq(VQ.state.load(fakeStorage({ 'void-quest-v1': '{битий json' })), VQ.state.defaults()));

  VQT.test('load with a throwing storage returns defaults without an exception', () =>
    VQT.eq(VQ.state.load(throwing), VQ.state.defaults()));

  VQT.test('update persists and a fresh load restores the balance', () => {
    const s = fakeStorage({});
    VQ.state.load(s);
    VQ.state.update(st => { st.balance = 350; });
    VQT.eq(VQ.state.load(s).balance, 350);
  });

  VQT.test('update on a throwing storage still changes in-memory state', () => {
    VQ.state.load(throwing);
    VQ.state.update(st => { st.balance = 5; });
    VQT.eq(VQ.state.get().balance, 5);
  });

  VQT.test('load drops inventory items whose skin is no longer in the config', () => {
    const saved = Object.assign(VQ.state.defaults(), {
      inventory: [{ uid: 'i1', skinId: 'jewel-of-aeons' }, { uid: 'i2', skinId: 'old-removed-skin' }]
    });
    const s = VQ.state.load(fakeStorage({ 'void-quest-v1': JSON.stringify(saved) }));
    VQT.eq(s.inventory, [{ uid: 'i1', skinId: 'jewel-of-aeons' }]);
  });

  VQT.test('load repairs null or wrongly typed fields from an old save', () => {
    const s = VQ.state.load(fakeStorage({ 'void-quest-v1': JSON.stringify({ v: 1, inventory: null, fails: null, balance: 'x', level: 3 }) }));
    VQT.eq(s.inventory, []);
    VQT.eq(s.fails, {});
    VQT.eq(s.balance, 0);
    VQT.eq(s.level, 3);
  });

  VQT.test('subscribers are called after update', () => {
    VQ.state.load(fakeStorage({}));
    let seen = null;
    VQ.state.subscribe(st => { seen = st.level; });
    VQ.state.update(st => { st.level = 3; });
    VQT.eq(seen, 3);
  });

  VQT.test('defaults have goalFails 0 and no recommendation flags', () => {
    const d = VQ.state.defaults();
    VQT.eq(d.goalFails, 0);
    VQT.ok(!('recommended' in d) && !('recommendSeen' in d));
  });
})();
