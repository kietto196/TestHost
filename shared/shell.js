/* Khung chung cho game 2 người: màn bắt đầu, chờ ghép trận, HUD, kết quả, chơi lại, đối thủ thoát.
 *
 * Shell.init({
 *   id: 'pong',                       // trùng với GAMES trong shared/games.js
 *   colors: ['#2cff4a', '#ff2a2a'],   // màu người chủ phòng (host) và người vào sau (guest)
 *   sides: ['Trái', 'Phải'],          // nhãn phụ cho host / guest (tuỳ chọn)
 *   howto: ['...', '...'],            // các bước cách chơi
 *   keys: [['W','S'], 'Di chuyển'], ...]  // phím: [[phím...], mô tả]
 *   onStart(),                        // vừa ghép trận xong (Shell.isHost cho biết vai trò)
 *   onMessage(msg),                   // tin từ đối thủ
 *   onRematch(),                      // cả hai đồng ý chơi lại
 *   onStop()                          // trận kết thúc vì thoát / đổi đối thủ → dừng vòng lặp game
 * });
 * Shell.send(msg, fast) · Shell.result({kind:'win'|'lose'|'draw', title, reason}) · Shell.setScore(me, opp)
 * Shell.hud({center, centerSub, meSub, oppSub}) · Shell.banner(text, sub, ms) · Shell.countdown(cb) · Shell.toast(text)
 * Shell.sfx.hit() ... · Shell.lat() (độ trễ 1 chiều ước tính, ms) · Shell.myColor / Shell.oppColor
 */
(function () {
  'use strict';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- theme ---------- */
  const th = store.get('g-theme');
  if (th) document.documentElement.dataset.theme = th;
  if (!document.querySelector('link[href*="Baloo"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }

  /* ---------- âm thanh ---------- */
  let ac = null, muted = store.get('g-muted') === '1';
  const ctx = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  function tone(f, d = .09, type = 'sine', v = .07, delay = 0, slide = 0) {
    if (muted) return;
    try {
      const a = ctx(), t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
    } catch (e) {}
  }
  function noise(d = .35, v = .18, freq = 900) {
    if (muted) return;
    try {
      const a = ctx(), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = v;
      s.buffer = b; s.connect(f).connect(g).connect(a.destination); s.start();
    } catch (e) {}
  }
  const sfx = {
    hit() { tone(520, .05, 'square', .05); },
    hit2() { tone(780, .05, 'square', .05); },
    wall() { tone(300, .04, 'square', .035); },
    score() { tone(660, .1, 'triangle', .07); tone(880, .14, 'triangle', .06, .08); },
    miss() { tone(220, .25, 'sawtooth', .05, 0, -120); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .18, 'sine', .08, i * .11)); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, .22, 'sine', .07, i * .14)); },
    tick() { tone(880, .06, 'sine', .06); },
    go() { tone(1046, .22, 'sine', .08); },
    boom() { noise(.45, .32, 700); tone(90, .3, 'sine', .12, 0, -50); },
    pick() { tone(880, .07, 'triangle', .07); tone(1320, .09, 'triangle', .06, .06); },
    jump() { tone(420, .1, 'square', .03, 0, 260); },
    drop() { tone(260, .12, 'triangle', .07, 0, -90); },
    click() { tone(700, .03, 'square', .03); },
    match() { tone(523, .12, 'sine', .07); tone(784, .16, 'sine', .07, .12); }
  };

  const Shell = window.Shell = {
    sfx, myName: '', oppName: 'Đối thủ', isHost: false, role: null, phase: 'lobby',
    myColor: '#2f6bff', oppColor: '#ff4b5c', score: [0, 0]
  };
  let O = null, net = null, meta = {}, rematchMe = false, rematchOpp = false, waitStart = 0, cdTimers = [];

  const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m23 9-6 6M17 9l6 6"/></svg>';
  const keysHTML = keys => (keys || []).map(([ks, d]) =>
    `<span>${(Array.isArray(ks) ? ks : [ks]).map(k => `<kbd>${esc(k)}</kbd>`).join(' ')} ${esc(d)}</span>`).join('');

  Shell.init = function (opts) {
    O = opts;
    meta = (window.GAMES || []).find(g => g.id === O.id) || { title: O.title || 'Game', tagline: '' };
    document.documentElement.style.setProperty('--accent', O.accent || meta.accent || '#5b5bf0');
    document.title = (meta.title || 'Game') + ' — 2 người online';
    const colors = O.colors || ['#2f6bff', '#ff4b5c'];
    const stage = document.getElementById('stage');

    const app = el(`<div class="sh-app">
      <header class="sh-top">
        <a class="sh-back" href="./${location.search}" id="shBack"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Trang chủ</a>
        <div class="sh-title">${esc(meta.title)}</div>
        <div class="sh-tools">
          <span class="sh-badge"><i></i>Online</span>
          <button class="sh-icon" id="shSound" aria-label="Bật/tắt âm thanh"></button>
          <button class="sh-icon" id="shTheme" aria-label="Đổi nền sáng/tối"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
        </div>
      </header>
      <main class="sh-card" id="shLobby">
        <div class="sh-hero"><div class="sh-thumb">${meta.thumb || ''}</div>
          <div><h1 class="sh-h1">${esc(meta.title)}</h1><p class="sh-tag">${esc(meta.tagline)}</p></div></div>
        <div class="sh-stack">
          <div><label class="sh-field" for="shName">Tên của bạn</label>
            <input class="sh-input" id="shName" maxlength="18" autocomplete="nickname" placeholder="Nhập tên…"></div>
          <button class="sh-btn sh-primary sh-block" id="shFind">Tìm đối thủ
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
        <div class="sh-howto"><h3>Cách chơi</h3><ol>${(O.howto || []).map(s => `<li>${s}</li>`).join('')}</ol>
          <div class="sh-keys">${keysHTML(O.keys)}</div></div>
      </main>
      <main class="sh-card hidden" id="shWait">
        <div class="sh-spin"></div>
        <h2 class="sh-wait-title">Đang chờ đối thủ<span class="dots"></span></h2>
        <p class="sh-meta">Bạn đang ở hàng chờ của <b>${esc(meta.title)}</b> · <span id="shWaitTime">0:00</span></p>
        <div class="sh-stack" style="margin-top:20px">
          <div class="sh-invite"><code id="shInvite"></code><button id="shCopy">Chép link</button></div>
          <p class="sh-meta" style="margin:0">Gửi link cho bạn bè (khác mạng cũng được). Có người thứ hai vào là trận đấu bắt đầu ngay.</p>
          <button class="sh-btn sh-ghost sh-block" id="shCancel">Huỷ</button>
        </div>
      </main>
      <section class="sh-game hidden" id="shGame">
        <div class="sh-hud">
          <div class="sh-pl" id="shMe"><span class="sh-dot"></span><div class="sh-pinfo"><div class="sh-pname" id="shMeName">Bạn</div><div class="sh-psub" id="shMeSub">Bạn</div></div><div class="sh-pscore" id="shMeScore">0</div></div>
          <div class="sh-center" id="shCenter"><b id="shCenterB"></b><span id="shCenterS"></span></div>
          <div class="sh-pl r" id="shOpp"><span class="sh-dot"></span><div class="sh-pinfo"><div class="sh-pname" id="shOppName">Đối thủ</div><div class="sh-psub" id="shOppSub">Đối thủ</div></div><div class="sh-pscore" id="shOppScore">0</div></div>
        </div>
        <div class="sh-stage" id="shStage"></div>
        <div class="sh-bar"><div class="sh-keys">${keysHTML(O.keys)}</div><button class="sh-small" id="shQuit">Rời trận</button></div>
      </section>
    </div>`);
    document.body.prepend(app);
    if (stage) $('#shStage').appendChild(stage);

    document.body.appendChild(el(`<div class="sh-ov hidden" id="shResult"><div class="sh-card">
      <h2 class="sh-rt" id="shRT"></h2><p class="sh-rr" id="shRR"></p>
      <div class="sh-tally"><div><b id="shTMe">0</b><div id="shTMeN">Bạn</div></div><b style="color:var(--muted);font-size:30px">–</b><div><b id="shTOpp">0</b><div id="shTOppN">Đối thủ</div></div></div>
      <div class="sh-row"><button class="sh-btn sh-primary" id="shRematch" style="flex:1">Chơi lại</button><button class="sh-btn sh-ghost" id="shNewOpp">Đối thủ khác</button></div>
      <div class="sh-hint" id="shHint"></div></div></div>`));
    document.body.appendChild(el(`<div class="sh-ov hidden" id="shLeft"><div class="sh-card">
      <h2 class="sh-rt" style="font-size:36px">Đối thủ đã rời trận</h2><p class="sh-rr" id="shLeftR">Người chơi kia đã thoát hoặc mất kết nối.</p>
      <div class="sh-row"><button class="sh-btn sh-primary" id="shLeftFind" style="flex:1">Tìm trận mới</button><a class="sh-btn sh-ghost" href="./${location.search}">Trang chủ</a></div></div></div>`));

    // tools
    const renderSound = () => { $('#shSound').innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON; };
    renderSound();
    $('#shSound').onclick = () => { muted = !muted; store.set('g-muted', muted ? '1' : '0'); renderSound(); };
    $('#shTheme').onclick = () => {
      const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next; store.set('g-theme', next);
      O.onTheme && O.onTheme(next);
    };

    $('#shName').value = store.get('g-name') || store.get('caro-name') || '';
    $('#shFind').onclick = find;
    $('#shName').addEventListener('keydown', e => { if (e.key === 'Enter') find(); });
    $('#shCancel').onclick = () => { net.stop(); view('lobby'); };
    $('#shCopy').onclick = async () => {
      try { await navigator.clipboard.writeText($('#shInvite').textContent); toast('Đã chép link mời'); } catch (e) { toast('Hãy chép link thủ công'); }
    };
    $('#shRematch').onclick = () => {
      if (Shell.phase !== 'over') return;
      rematchMe = true; net.send({ t: '_rematch' });
      if (rematchOpp) return doRematch();
      $('#shRematch').disabled = true; $('#shRematch').textContent = 'Đang chờ ' + Shell.oppName + '…';
    };
    $('#shNewOpp').onclick = () => { net.send({ t: '_leave' }); stopGame(); net.stop(); find(); };
    $('#shLeftFind').onclick = () => find();
    $('#shQuit').onclick = () => { net.send({ t: '_leave' }); stopGame(); net.stop(); view('lobby'); };
    window.addEventListener('pagehide', () => {
      if (Shell.phase === 'playing' || Shell.phase === 'over') net.send({ t: '_leave' });
      if (Shell.phase !== 'lobby') net.stop();
    });

    Shell.colors = colors;
    net = Net.create(O.id, {
      onWaiting() {},
      onMatched(role) { matched(role); },
      onMessage(m) { handle(m); },
      onLeft() { left('Người chơi kia đã thoát hoặc mất kết nối.'); },
      onError(t) {
        if (Shell.phase === 'waiting') { view('lobby'); toast(t); }
        else if (Shell.phase === 'playing' || Shell.phase === 'over') left(t);
      }
    });
    Net.loadMqtt().catch(() => {});
    setInterval(() => {
      if (Shell.phase === 'waiting') {
        const s = Math.floor((Date.now() - waitStart) / 1000);
        $('#shWaitTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      }
    }, 500);
  };

  function view(v) {
    Shell.phase = v === 'game' ? Shell.phase : v;
    $('#shLobby').classList.toggle('hidden', v !== 'lobby');
    $('#shWait').classList.toggle('hidden', v !== 'waiting');
    $('#shGame').classList.toggle('hidden', v !== 'game');
    if (v !== 'game') { $('#shResult').classList.add('hidden'); $('#shLeft').classList.add('hidden'); }
  }
  function find() {
    const name = ($('#shName').value || '').trim().slice(0, 18) || 'Người chơi';
    Shell.myName = name; store.set('g-name', name);
    Shell.phase = 'waiting'; waitStart = Date.now();
    view('waiting');
    $('#shInvite').textContent = location.protocol === 'file:' ? 'Gửi các file của trang cho bạn bè' : location.href.split('#')[0];
    net.start(name);
  }
  function matched(role) {
    Shell.role = role; Shell.isHost = role === 'host';
    Shell.myColor = Shell.colors[Shell.isHost ? 0 : 1];
    Shell.oppColor = Shell.colors[Shell.isHost ? 1 : 0];
    Shell.oppName = 'Đối thủ'; Shell.score = [0, 0]; rematchMe = rematchOpp = false;
    net.send({ t: '_hello', name: Shell.myName });
    $('#shMe .sh-dot').style.background = $('#shMe .sh-dot').style.color = Shell.myColor;
    $('#shOpp .sh-dot').style.background = $('#shOpp .sh-dot').style.color = Shell.oppColor;
    $('#shMeName').textContent = Shell.myName; $('#shOppName').textContent = Shell.oppName;
    const sides = O.sides || ['', ''];
    $('#shMeSub').textContent = 'Bạn' + (sides[Shell.isHost ? 0 : 1] ? ' · ' + sides[Shell.isHost ? 0 : 1] : '');
    $('#shOppSub').textContent = sides[Shell.isHost ? 1 : 0] || 'Đối thủ';
    Shell.setScore(0, 0);
    Shell.phase = 'playing'; view('game');
    sfx.match(); toast('Đã ghép trận với đối thủ!');
    O.onStart && O.onStart();
  }
  function handle(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === '_hello') { Shell.oppName = String(m.name || 'Đối thủ').slice(0, 18); $('#shOppName').textContent = Shell.oppName; O.onOppName && O.onOppName(Shell.oppName); return; }
    if (m.t === '_rematch') {
      rematchOpp = true;
      if (rematchMe && Shell.phase === 'over') doRematch();
      else $('#shHint').textContent = Shell.oppName + ' muốn chơi tiếp!';
      return;
    }
    if (m.t === '_leave') return left('Người chơi kia đã thoát.');
    if (Shell.phase === 'playing' || Shell.phase === 'over') O.onMessage && O.onMessage(m);
  }
  function doRematch() {
    rematchMe = rematchOpp = false;
    $('#shResult').classList.add('hidden');
    Shell.phase = 'playing';
    O.onRematch && O.onRematch();
  }
  function stopGame() { cdTimers.forEach(clearTimeout); cdTimers = []; try { O.onStop && O.onStop(); } catch (e) {} }
  function left(reason) {
    if (Shell.phase !== 'playing' && Shell.phase !== 'over') return;
    Shell.phase = 'left'; stopGame();
    try { net.stop(); } catch (e) {}
    $('#shResult').classList.add('hidden');
    $('#shLeftR').textContent = reason;
    $('#shLeft').classList.remove('hidden');
  }
  function toast(t) {
    document.querySelectorAll('.sh-toast').forEach(n => n.remove());
    const n = el(`<div class="sh-toast">${esc(t)}</div>`); document.body.appendChild(n); setTimeout(() => n.remove(), 2700);
  }

  Shell.toast = toast;
  Shell.send = (m, fast) => net && net.send(m, fast);
  Shell.lat = () => Math.min(600, (net ? net.rtt : 120) / 2);
  Shell.playing = () => Shell.phase === 'playing';
  Shell.setScore = (a, b) => {
    Shell.score = [a, b];
    $('#shMeScore').textContent = a; $('#shOppScore').textContent = b;
  };
  Shell.hud = o => {
    if (o.center != null) $('#shCenterB').textContent = o.center;
    if (o.centerSub != null) $('#shCenterS').textContent = o.centerSub;
    if (o.meSub != null) $('#shMeSub').textContent = o.meSub;
    if (o.oppSub != null) $('#shOppSub').textContent = o.oppSub;
  };
  Shell.result = o => {
    if (Shell.phase !== 'playing') return;
    Shell.phase = 'over';
    const k = o.kind || 'draw';
    const rt = $('#shRT'); rt.className = 'sh-rt ' + k;
    rt.textContent = o.title || (k === 'win' ? 'Bạn thắng!' : k === 'lose' ? 'Bạn thua rồi…' : 'Hoà!');
    $('#shRR').textContent = o.reason || '';
    $('#shTMe').textContent = Shell.score[0]; $('#shTOpp').textContent = Shell.score[1];
    $('#shTMe').style.color = Shell.myColor; $('#shTOpp').style.color = Shell.oppColor;
    $('#shTMeN').textContent = Shell.myName; $('#shTOppN').textContent = Shell.oppName;
    $('#shRematch').disabled = false; $('#shRematch').textContent = o.rematchLabel || 'Chơi lại';
    $('#shHint').textContent = rematchOpp ? Shell.oppName + ' muốn chơi tiếp!' : '';
    if (k === 'win') sfx.win(); else if (k === 'lose') sfx.lose();
    setTimeout(() => { if (Shell.phase === 'over') $('#shResult').classList.remove('hidden'); }, o.delay == null ? 900 : o.delay);
  };
  Shell.banner = (text, sub, ms = 1200) => {
    const st = $('#shStage');
    st.querySelectorAll('.sh-banner').forEach(n => n.remove());
    const n = el(`<div class="sh-banner">${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`);
    st.appendChild(n); setTimeout(() => n.remove(), ms);
  };
  Shell.countdown = (cb, sub) => {
    cdTimers.forEach(clearTimeout); cdTimers = [];
    [3, 2, 1].forEach((n, i) => cdTimers.push(setTimeout(() => { Shell.banner(String(n), i === 0 ? sub : '', 800); sfx.tick(); }, i * 750)));
    cdTimers.push(setTimeout(() => { Shell.banner('Bắt đầu!', '', 700); sfx.go(); cb && cb(); }, 2250));
  };
})();
