(function () {
  VQT.test('the favicon does not reveal the gift', async () => {
    const html = await (await fetch('../index.html', { cache: 'no-store' })).text();
    const icon = (html.match(/<link[^>]+rel="icon"[^>]*>/) || [''])[0];
    VQT.ok(icon, 'no favicon link found');
    VQT.ok(!/voidhammer/i.test(icon), 'favicon points at the gift: ' + icon);
  });

  VQT.test('prices and numbers use Montserrat (loaded last, after the other stylesheets)', async () => {
    const html = await (await fetch('../index.html', { cache: 'no-store' })).text();
    VQT.ok(/family=Montserrat/.test(html), 'Montserrat is not loaded from Google Fonts');
    const links = [...html.matchAll(/href="(css\/[^"]+)"/g)].map(m => m[1]);
    VQT.eq(links[links.length - 1], 'css/numbers.css');
    const css = await (await fetch('../css/numbers.css', { cache: 'no-store' })).text();
    VQT.ok(/Montserrat/.test(css), 'numbers.css does not use Montserrat');
    ['.skin__price', '.balance', '.case-card__price', '.wheel__pct', '.shop__balance', '.trial__prize', '.hl__cost', '.tcolor__price', '.num']
      .forEach(sel => VQT.ok(css.includes(sel), 'no rule for ' + sel));
  });
})();
