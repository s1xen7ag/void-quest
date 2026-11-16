(function () {
  const cfg = () => VQ.config.casino;
  const S = () => VQ.config.skins;
  const F = () => VQ.forge;
  const fresh = balance => Object.assign(VQ.state.defaults(), { accepted: true, questDone: true, balance });

  // ---------- Більше скінів (лише Кузня й магазин) ----------
  VQT.test('extra forge skins are loaded and marked forge-only in the catalog', () => {
    VQT.ok(VQ.skinDataForge, 'js/skins-forge.js not loaded');
    const ids = Object.values(VQ.skinDataForge).flat().map(it => it.id).filter(id => S()[id] && S()[id].forgeOnly);
    VQT.ok(ids.length >= 100, 'forge-only skins: ' + ids.length);
  });
  VQT.test('the catalog now has at least 300 skins', () =>
    VQT.ok(Object.keys(S()).length >= 300, 'skins ' + Object.keys(S()).length));
  VQT.test('no forge-only skin appears in any case', () => {
    cfg().cases.forEach(def => {
      const bad = VQ.cases.get(def.id).items.filter(it => it.forgeOnly).map(it => it.name);
      VQT.eq(bad, [], def.id);
    });
  });

  // ---------- Магазин ----------
  VQT.test('shopItems: no gift, nothing at 5 000 ₴ or more, cheapest first', () => {
    const list = F().shopItems(cfg(), {});
    VQT.ok(list.length > 50, 'shop size ' + list.length);
    VQT.ok(!list.includes(cfg().giftId), 'gift in the shop');
    VQT.ok(list.every(id => S()[id].price < 5000), 'a 5 000 ₴+ skin is for sale');
    for (let i = 1; i < list.length; i++) VQT.ok(S()[list[i - 1]].price <= S()[list[i]].price, 'not sorted at ' + i);
  });
  VQT.test('shopItems filters by price band and by name', () => {
    const band = F().shopItems(cfg(), { min: 500, max: 1000 });
    VQT.ok(band.length > 0 && band.every(id => S()[id].price >= 500 && S()[id].price < 1000), 'band filter');
    const some = band[0];
    const word = S()[some].name.split(' ')[0].toLowerCase();
    const found = F().shopItems(cfg(), { query: word.toUpperCase() });
    VQT.ok(found.includes(some), 'search by name: ' + word);
    VQT.ok(found.every(id => S()[id].name.toLowerCase().includes(word)), 'search returns other names');
  });
  VQT.test('buy takes the price from the balance and adds the skin', () => {
    const id = F().shopItems(cfg(), { min: 200, max: 500 })[0];
    const s = fresh(1000);
    const item = F().buy(s, id, cfg());
    VQT.ok(item && item.skinId === id, 'nothing bought');
    VQT.eq(s.balance, 1000 - S()[id].price);
    VQT.ok(s.inventory.some(i => i.uid === item.uid && i.skinId === id), 'not in the inventory');
  });
  VQT.test('buy refuses without enough money, for the gift and for 5 000 ₴+ skins', () => {
    const cheap = F().shopItems(cfg(), {})[0];
    const poor = fresh(S()[cheap].price - 1);
    VQT.eq(F().buy(poor, cheap, cfg()), null);
    VQT.eq(poor.inventory.length, 0);
    const rich = fresh(1e7);
    VQT.eq(F().buy(rich, cfg().giftId, cfg()), null, 'gift sold');
    const big = Object.keys(S()).find(id => id !== cfg().giftId && S()[id].price >= 5000);
    VQT.eq(F().buy(rich, big, cfg()), null, 'goal skin sold');
    VQT.eq(rich.balance, 1e7);
  });

  VQT.test('shopItems can list the most expensive first', () => {
    const asc = F().shopItems(cfg(), { min: 100, max: 200 });
    const desc = F().shopItems(cfg(), { min: 100, max: 200, desc: true });
    VQT.ok(asc.length > 1, 'band 100–200 is empty');
    VQT.eq(desc.length, asc.length);
    VQT.ok(S()[desc[0]].price >= S()[desc[desc.length - 1]].price, 'not most expensive first');
    VQT.eq(S()[desc[0]].price, Math.max(...asc.map(id => S()[id].price)));
  });

  // ---------- Ціни зі Steam (DMarket інколи показує завищену пропозицію) ----------
  VQT.test('the catalog uses Steam market prices where Steam has them', () => {
    VQT.ok(VQ.steamPrices, 'js/steam-prices.js not loaded');
    const known = Object.keys(VQ.steamPrices).filter(id => S()[id]);
    VQT.ok(known.length >= 250, 'Steam prices for ' + known.length + ' skins');
    known.forEach(id => VQT.eq(S()[id].price, VQ.steamPrices[id], id));
  });
  VQT.test('an inflated DMarket price is gone: Whisper at the Temple Gates - Shoulder is under 50 ₴', () => {
    const id = Object.keys(S()).find(k => S()[k].name === 'Whisper at the Temple Gates - Shoulder');
    VQT.ok(id, 'skin not in the catalog');
    VQT.ok(S()[id].price < 50, 'price ' + S()[id].price);
  });
})();
