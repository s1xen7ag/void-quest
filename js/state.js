// Стан гри: один об'єкт, що зберігається в localStorage під ключем void-quest-v1.
window.VQ = window.VQ || {};

(function () {
  const KEY = 'void-quest-v1';
  let storage = null;
  let state = null;
  const subs = [];

  function defaults() {
    return {
      v: 1,
      accepted: false,
      level: 0,
      questDone: false,
      balance: 0,
      dropIndex: 0,
      inventory: [],
      nextUid: 1,
      losses: 0,
      lossesAtGift: 0,     // скільки програшів було на момент останнього Дару Древніх
      giftGranted: false,
      won: false,          // фінал відбувся: таємну нагороду відкрито
      goalFails: 0,        // невдалі спроби в Кузні на ціль від 5 000 ₴ (для страховки)
      fails: {},
      earned: {}
    };
  }

  function browserStorage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function load(st) {
    storage = st === undefined ? browserStorage() : st;
    let saved = null;
    try {
      const raw = storage ? storage.getItem(KEY) : null;
      saved = raw ? JSON.parse(raw) : null;
    } catch (e) { saved = null; }
    state = sanitize(Object.assign(defaults(), saved && saved.v === 1 ? saved : {}));
    return state;
  }

  // Старе або пошкоджене збереження не повинно ламати сторінку:
  // поля з неправильним типом скидаються, а предмети, яких уже немає в config.skins, прибираються.
  function sanitize(s) {
    const d = defaults();
    Object.keys(d).forEach(k => {
      const bad = s[k] === null || typeof s[k] !== typeof d[k] || Array.isArray(s[k]) !== Array.isArray(d[k]);
      if (bad) s[k] = d[k];
    });
    const skins = window.VQ && VQ.config && VQ.config.skins;
    s.inventory = s.inventory.filter(it => it && typeof it.uid === 'string' && (!skins || skins[it.skinId]));
    return s;
  }

  function save() {
    try { if (storage) storage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* без збереження */ }
  }

  function get() { return state || load(); }

  function notify() { subs.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }

  function update(fn) {
    fn(get());
    save();
    notify();
    return state;
  }

  function subscribe(fn) {
    subs.push(fn);
    return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); };
  }

  function reset() {
    try { if (storage) storage.removeItem(KEY); } catch (e) { /* ignore */ }
    state = defaults();
    notify();
    return state;
  }

  VQ.state = { KEY, defaults, load, get, update, subscribe, reset };
})();
