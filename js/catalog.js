// Каталог скінів: перетворює дані DMarket (VQ.skinData) на VQ.config.skins = { id: {name, hero, rarity, price, img} }.
window.VQ = window.VQ || {};

(function () {
  const titleCase = s => s.replace(/\b[a-z]/g, c => c.toUpperCase());
  const skins = {};
  const data = VQ.skinData || {};
  Object.keys(data).forEach(hero => {
    data[hero].forEach(it => {
      if (skins[it.id]) return;            // той самий предмет у двох героїв — лишаємо перший
      skins[it.id] = { name: it.name, hero: titleCase(hero), heroKey: hero, rarity: it.rarity, price: it.price, img: it.img };
    });
  });
  // дорогий кейс: кур'єри Рошани й топові речі (js/skins-premium.js)
  (VQ.skinDataPremium || []).forEach(it => {
    if (!skins[it.id]) skins[it.id] = { name: it.name, hero: it.hero, heroKey: 'premium', rarity: it.rarity, price: it.price, img: it.img };
  });
  // додаткові скіни лише для Кузні й магазину (js/skins-forge.js) — у кейси не потрапляють
  const extra = VQ.skinDataForge || {};
  Object.keys(extra).forEach(hero => {
    extra[hero].forEach(it => {
      if (!skins[it.id]) skins[it.id] = { name: it.name, hero: titleCase(hero), heroKey: hero, rarity: it.rarity, price: it.price, img: it.img, forgeOnly: true };
    });
  });
  // справжні ціни з торговельного майданчика Steam (js/steam-prices.js, tools/steam-prices.py):
  // DMarket інколи показує завищену пропозицію для рідкісних дешевих предметів
  const steam = VQ.steamPrices || {};
  Object.keys(steam).forEach(id => { if (skins[id]) skins[id].price = steam[id]; });
  const over = (VQ.config && VQ.config.skinOverrides) || {};
  Object.keys(over).forEach(id => { if (skins[id]) Object.assign(skins[id], over[id]); });
  VQ.config.skins = skins;
})();
