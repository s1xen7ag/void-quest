// Випробування «Темні силуети»: випадкові герої з пулу, 6 схожих варіантів, силует іноді віддзеркалений.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials.silhouette = {
  mount(container, data, api) {
    const { el, cdn, heroName } = VQ.util;
    return VQ.trials._choice(container, data, api, {
      layout: 'grid3',
      prompt: round => {
        const box = el('div', { class: 'sil' + (round.mirror ? ' is-mirror' : '') },
          el('div', { class: 'sil__glow' }),
          VQ.quest.img(cdn.render(round.hero, 'png'), 'Силует героя', 'sil__img'));
        box.style.setProperty('--zoom', round.zoom || 1.1);   // рендери героїв мають різні поля
        return box;
      },
      option: key => el('button', { class: 'opt' }, heroName(key)),
      preload: round => { new Image().src = cdn.render(round.hero, 'png'); }
    });
  }
};
