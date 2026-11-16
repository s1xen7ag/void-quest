// Звуки: файли + короткі синтезовані ефекти (WebAudio). Відсутній звук ніколи не ламає гру.
window.VQ = window.VQ || {};

(function () {
  const files = {
    correct: { src: 'assets/sounds/correct.mp3', vol: 0.35 },
    wrong: { src: 'assets/sounds/wrong.mp3', vol: 0.3 },
    open: { src: 'assets/sounds/case_open.mp3', vol: 0.4 },
    spin: { src: 'assets/sounds/roulette.mp3', vol: 0.35, loop: true }
  };
  const cache = {};
  let ctx = null;
  let unlocked = false;

  function audioEl(name) {
    if (!files[name]) return null;
    if (!cache[name]) {
      const a = new Audio(files[name].src);
      a.volume = files[name].vol;
      a.loop = !!files[name].loop;
      a.preload = 'auto';
      cache[name] = a;
    }
    return cache[name];
  }

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    return ctx;
  }

  // Простий синтез: список нот [частота, початок, тривалість, гучність, тип]
  function synth(notes) {
    const c = ac();
    if (!c || !unlocked) return;
    const t0 = c.currentTime;
    notes.forEach(([f, start, dur, vol, type]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t0 + start);
      g.gain.setValueAtTime(0, t0 + start);
      g.gain.linearRampToValueAtTime(vol, t0 + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      o.connect(g).connect(c.destination);
      o.start(t0 + start);
      o.stop(t0 + start + dur + 0.05);
    });
  }

  const synths = {
    // «пік-пек» — короткий подвійний сигнал помилки, як у Доті (замість wrong.mp3)
    wrong: () => synth([[1320, 0, 0.055, 0.07, 'square'], [760, 0.075, 0.09, 0.07, 'square']]),
    tick: () => synth([[1900, 0, 0.035, 0.05, 'square']]),
    coin: () => synth([[1320, 0, 0.12, 0.08, 'triangle'], [1980, 0.06, 0.16, 0.06, 'triangle']]),
    accept: () => synth([[392, 0, 0.5, 0.08, 'triangle'], [587, 0.08, 0.5, 0.07, 'triangle'], [784, 0.16, 0.7, 0.07, 'triangle']]),
    unlock: () => synth([[523, 0, 0.4, 0.07, 'triangle'], [659, 0.12, 0.4, 0.07, 'triangle'], [1047, 0.24, 0.8, 0.07, 'sine']]),
    burn: () => synth([[180, 0, 0.5, 0.08, 'sawtooth'], [120, 0.1, 0.6, 0.06, 'sawtooth']]),
    win: () => synth([
      [262, 0, 1.6, 0.06, 'triangle'], [330, 0.05, 1.6, 0.05, 'triangle'], [392, 0.1, 1.6, 0.05, 'triangle'],
      [523, 0.35, 1.8, 0.06, 'sine'], [659, 0.45, 1.8, 0.05, 'sine'], [784, 0.55, 2.2, 0.05, 'sine'], [1047, 0.7, 2.4, 0.04, 'sine']
    ])
  };

  function unlock() {
    unlocked = true;
    const c = ac();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    Object.keys(files).forEach(audioEl);
  }

  function play(name) {
    try {
      if (synths[name]) { synths[name](); return; }
      const a = audioEl(name);
      if (!a || !unlocked) return;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* без звуку */ }
  }

  function loop(name, on) {
    try {
      const a = audioEl(name);
      if (!a) return;
      if (on && unlocked) { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); }
      else { a.pause(); a.currentTime = 0; }
    } catch (e) { /* без звуку */ }
  }

  VQ.audio = { unlock, play, loop };
})();
