// Випробування «Голоси й імена»: репліка або справжнє ім'я героя, 4 портрети, випадкові раунди з пулу.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

VQ.trials.quote = {
  mount(container, data, api) {
    const { el } = VQ.util;
    return VQ.trials._choice(container, data, api, {
      layout: 'row',
      prompt: round => round.name
        ? el('div', { class: 'truename' },
            el('div', { class: 'truename__label', text: 'Справжнє ім\'я героя' }),
            el('div', { class: 'truename__name', text: round.name }))
        : el('blockquote', { class: 'quote' },
            el('span', { class: 'quote__mark', text: '“' }),
            el('span', { class: 'quote__text', text: round.text }),
            el('span', { class: 'quote__mark', text: '”' })),
      option: key => VQ.trials._heroOption(key)
    });
  }
};
