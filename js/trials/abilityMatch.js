// Випробування «Здібності героїв»: Войд + 2 випадкові герої, у кожного зіставити 4 іконки з назвами.
window.VQ = window.VQ || {};
VQ.trials = VQ.trials || {};

(function () {
  // Чиста функція (покрита тестами): перший — data.first, далі випадкові інші, усього data.heroes
  function pickHeroes(data, rng) {
    const others = VQ.util.shuffle(Object.keys(data.pool).filter(h => h !== data.first), rng || Math.random);
    return [data.first].concat(others.slice(0, data.heroes - 1));
  }

  function mount(container, data, api) {
    const { el, cdn, shuffle, heroName } = VQ.util;
    const heroes = pickHeroes(data);
    let heroIdx = 0;
    let timer = null;
    const wrapBox = el('div', { class: 'am-run' });
    container.appendChild(wrapBox);

    function showHero() {
      const hero = heroes[heroIdx];
      const pairs = data.pool[hero];
      let pick = null;
      let matched = 0;
      wrapBox.innerHTML = '';
      const head = el('div', { class: 'am__hero' },
        el('span', { class: 'am__hero-img' }, VQ.quest.img(cdn.hero(hero), heroName(hero))),
        el('span', { class: 'am__hero-name', text: heroName(hero) }));
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'am__lines');
      const icons = el('div', { class: 'am__col am__col--icons' });
      const names = el('div', { class: 'am__col am__col--names' });
      const wrap = el('div', { class: 'am' }, icons, names);
      wrap.appendChild(svg);
      wrapBox.append(head, wrap);
      const nodes = { icon: {}, name: {} };
      shuffle(pairs).forEach(p => {
        const b = el('button', { class: 'am__icon' }, VQ.quest.img(cdn.ability(p.key), p.name));
        b.addEventListener('click', () => choose('icon', p.key, b));
        nodes.icon[p.key] = b;
        icons.appendChild(b);
      });
      shuffle(pairs).forEach(p => {
        const b = el('button', { class: 'am__name opt', text: p.name });
        b.addEventListener('click', () => choose('name', p.key, b));
        nodes.name[p.key] = b;
        names.appendChild(b);
      });
      const updateCounter = () => api.counter('Герой ' + (heroIdx + 1) + '/' + heroes.length + ' · ' + matched + '/' + pairs.length);
      updateCounter();

      function choose(side, key, node) {
        if (node.classList.contains('is-matched')) return;
        if (!pick || pick.side === side) {
          if (pick) pick.node.classList.remove('is-selected');
          pick = { side, key, node };
          node.classList.add('is-selected');
          VQ.audio.play('tick');
          return;
        }
        const other = pick;
        pick = null;
        other.node.classList.remove('is-selected');
        if (other.key === key) {
          other.node.classList.add('is-matched');
          node.classList.add('is-matched');
          drawLine(nodes.icon[key], nodes.name[key]);
          matched += 1;
          updateCounter();
          VQ.audio.play('coin');
          if (matched === pairs.length) {
            timer = setTimeout(() => {
              heroIdx += 1;
              if (heroIdx >= heroes.length) api.success();
              else showHero();
            }, 700);
          }
        } else {
          api.fail(node);
        }
      }

      function drawLine(a, b) {
        const w = wrap.getBoundingClientRect();
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', ra.right - w.left);
        line.setAttribute('y1', ra.top + ra.height / 2 - w.top);
        line.setAttribute('x2', rb.left - w.left);
        line.setAttribute('y2', rb.top + rb.height / 2 - w.top);
        svg.appendChild(line);
      }
    }

    showHero();
    return () => clearTimeout(timer);
  }

  VQ.trials.abilityMatch = { mount, pickHeroes };
})();
