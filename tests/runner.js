// Мінімальний тест-раннер: VQT.test / VQT.eq / VQT.ok / VQT.near.
(function () {
  const tests = [];
  function fmt(v) { try { return JSON.stringify(v); } catch (e) { return String(v); } }
  window.VQT = {
    test(name, fn) { tests.push({ name, fn }); },
    eq(actual, expected, msg) {
      const a = fmt(actual), e = fmt(expected);
      if (a !== e) throw new Error((msg ? msg + ': ' : '') + 'expected ' + e + ', got ' + a);
    },
    ok(cond, msg) { if (!cond) throw new Error(msg || 'expected truthy'); },
    near(actual, expected, eps, msg) {
      if (!(Math.abs(actual - expected) <= eps)) throw new Error((msg ? msg + ': ' : '') + 'expected ~' + expected + ', got ' + actual);
    },
    async run() {
      const out = document.getElementById('result');
      let pass = 0; const failed = [];
      for (const t of tests) {
        try { await t.fn(); pass++; }
        catch (e) { failed.push(t.name + ' — ' + e.message); }
      }
      out.textContent = 'PASS ' + pass + ' / FAIL ' + failed.length + (failed.length ? '\n\n' + failed.join('\n') : '');
      out.className = failed.length ? 'fail' : 'pass';
    }
  };
  window.addEventListener('load', () => VQT.run());
})();
