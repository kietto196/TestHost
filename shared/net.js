/* Ghép trận online cho mọi game — dùng máy chủ MQTT công cộng (chơi được khác mạng).
 *
 *   const net = Net.create('pong', {
 *     onWaiting(), onMatched(role /* 'host' | 'guest' *\/), onMessage(msg), onLeft(), onError(text)
 *   });
 *   net.start('Tên');  net.send({...}, fast);  net.stop();  net.rtt  (ms)
 *
 *  fast = true → gửi nhanh, có thể mất (dùng cho vị trí liên tục); mặc định: tin cậy — đánh số, báo nhận, tự gửi lại, đúng thứ tự.
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const BROKERS = (Q.get('broker') || 'wss://broker.emqx.io:8084/mqtt,wss://broker.hivemq.com:8884/mqtt').split(',');
  const ROOT = 'kietto196-testhost/';
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  let mqttLib = null;
  function loadMqtt() {
    if (mqttLib) return mqttLib;
    mqttLib = new Promise((res, rej) => {
      if (window.mqtt) return res(window.mqtt);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
      s.onload = () => res(window.mqtt);
      s.onerror = () => { mqttLib = null; rej(new Error('load')); };
      document.head.appendChild(s);
    });
    return mqttLib;
  }

  function connectBroker(lib, clientId, will, idx = 0) {
    return new Promise((res, rej) => {
      if (idx >= BROKERS.length) return rej(new Error('no broker'));
      let c, done = false;
      const fail = () => {
        if (done) return; done = true; clearTimeout(to);
        try { c.end(true); } catch (e) {}
        connectBroker(lib, clientId, will, idx + 1).then(res, rej);
      };
      const to = setTimeout(fail, 8000);
      try {
        c = lib.connect(BROKERS[idx], {
          clientId, clean: true, keepalive: 20, reconnectPeriod: 2000, connectTimeout: 7000, will
        });
      } catch (e) { return fail(); }
      c.once('connect', () => { if (done) return; done = true; clearTimeout(to); res(c); });
      c.on('error', () => { if (!done) fail(); });
    });
  }

  function create(gameId, cb) {
    const TOPIC = ROOT + gameId + '/v1/';
    let gen = 0, c = null, me = null, opp = null, state = 'idle', lobbyVal = null, myName = '';
    let joinTarget = null, joinTimer = null, hb = null, refresh = null, seen = 0;
    // Kênh tin cậy tự làm (đánh số + báo nhận + gửi lại) — không phụ thuộc QoS của máy chủ công cộng
    let sendSeq = 0, recvNext = 1, unacked = new Map(), recvBuf = new Map(), rtx = null, ackTimer = null;
    function resetChannel() {
      sendSeq = 0; recvNext = 1; unacked = new Map(); recvBuf = new Map();
      clearInterval(rtx); rtx = null; clearTimeout(ackTimer); ackTimer = null;
    }
    function sendAck() {
      if (ackTimer) return;
      ackTimer = setTimeout(() => { ackTimer = null; if (opp) toUser(opp, { t: 'ack', a: recvNext - 1, g: recvBuf.size ? 1 : 0 }, { qos: 0 }); }, 15);
    }
    function onReliable(m) {
      const n = m.s | 0;
      if (n >= recvNext && !recvBuf.has(n)) recvBuf.set(n, m.m);
      while (recvBuf.has(recvNext)) {
        const msg = recvBuf.get(recvNext); recvBuf.delete(recvNext); recvNext++;
        try { cb.onMessage && cb.onMessage(msg); } catch (e) { console.error(e); }
      }
      sendAck();
    }
    function retransmit() {
      if (state !== 'matched' || !opp) return;
      const now = performance.now(), wait = Math.max(220, Math.min(900, api.rtt * 1.4));
      let sent = 0;
      for (const [n, e] of unacked) {
        if (now - e.at < wait) continue;
        e.at = now; toUser(opp, { t: 'r', s: n, m: e.m }, { qos: 0 });
        if (++sent >= 12) break;
      }
    }
    const tried = new Set();
    const api = { rtt: 120, role: null, get state() { return state; } };
    const dbg = (...a) => { try { (window.__netlog = window.__netlog || []).push((performance.now() / 1000).toFixed(2) + ' ' + a.join(' ')); } catch (e) {} };

    const pub = (topic, obj, opts = { qos: 1 }) => {
      try { if (c) c.publish(TOPIC + topic, obj == null ? '' : JSON.stringify(obj), opts); } catch (e) {}
    };
    const toUser = (id, obj, opts) => pub('u/' + id, Object.assign({ f: me }, obj), opts);
    const enterLobby = () => pub('lobby', { id: me, name: myName, ts: Date.now() }, { qos: 1, retain: true });

    function decide() {
      if (state === 'matched' || state === 'idle' || state === 'connecting') return;
      const v = lobbyVal;
      dbg('decide', state, 'lobby=', v && v.id, 'me=', me);
      const stale = v && v.ts && Math.abs(Date.now() - v.ts) > 45000; // người chờ cũ đã tắt máy mà không dọn
      if (v && v.id && v.id !== me && !tried.has(v.id) && !stale) {
        state = 'joining'; joinTarget = v.id;
        toUser(v.id, { t: 'join', name: myName });
        clearTimeout(joinTimer);
        joinTimer = setTimeout(() => {
          if (state === 'joining' && joinTarget === v.id) { tried.add(v.id); decide(); }
        }, 4500);
      } else {
        state = 'waiting'; joinTarget = null; enterLobby();
        clearInterval(refresh); refresh = setInterval(() => { if (state === 'waiting') enterLobby(); }, 15000);
        cb.onWaiting && cb.onWaiting();
      }
    }
    function matchWith(id, role) {
      resetChannel(); rtx = setInterval(retransmit, 120);
      state = 'matched'; opp = id; api.role = role; clearTimeout(joinTimer); clearInterval(refresh); seen = Date.now();
      try { c.subscribe(TOPIC + 'gone/' + id, { qos: 0 }); } catch (e) {}
      if (lobbyVal && lobbyVal.id === me) pub('lobby', null, { qos: 1, retain: true });
      hb = setInterval(() => {
        toUser(opp, { t: 'ping', ts: performance.now() }, { qos: 0 });
        if (Date.now() - seen > 20000) lost();
      }, 2000);
      cb.onMatched && cb.onMatched(role);
    }
    function lost() { if (state !== 'matched') return; shutdown(); cb.onLeft && cb.onLeft(); }
    function shutdown() {
      gen++; clearInterval(hb); clearInterval(refresh); clearTimeout(joinTimer); hb = refresh = null;
      if (c) {
        if (state === 'waiting' && (!lobbyVal || lobbyVal.id === me)) pub('lobby', null, { qos: 1, retain: true });
        const old = c, wasMatched = state === 'matched' && opp, o = opp, myId = me, pend = [...unacked];
        c = null;
        let delay = 60;
        if (wasMatched) {
          // gửi nốt các tin chưa được báo nhận (vd. "_leave") vài lần rồi báo "đã rời" trước khi ngắt
          const flush = () => pend.forEach(([n, e]) => {
            try { old.publish(TOPIC + 'u/' + o, JSON.stringify({ f: myId, t: 'r', s: n, m: e.m }), { qos: 0 }); } catch (er) {}
          });
          flush(); setTimeout(flush, 180); setTimeout(flush, 400);
          setTimeout(() => { try { old.publish(TOPIC + 'gone/' + myId, '1', { qos: 1 }); } catch (er) {} }, 450);
          delay = 900;
        }
        setTimeout(() => { try { old.end(false); } catch (e) {} }, delay);
      }
      resetChannel();
      state = 'idle'; opp = null;
    }

    api.start = async function (name) {
      if (c) shutdown();
      const g = ++gen;
      myName = String(name || '').slice(0, 18);
      state = 'connecting'; me = rid(); opp = null; lobbyVal = null; tried.clear(); api.role = null;
      let client;
      try {
        const lib = await loadMqtt();
        for (let tryN = 0; ; tryN++) {   // thử lại vài lần nếu mạng chập chờn
          try { client = await connectBroker(lib, gameId + '_' + me + (tryN ? '_' + tryN : ''), { topic: TOPIC + 'gone/' + me, payload: '1', qos: 0, retain: false }); break; }
          catch (er) { dbg('connect try failed', tryN); if (tryN >= 2 || g !== gen) throw er; await new Promise(r => setTimeout(r, 800 + tryN * 700)); }
        }
      } catch (e) {
        dbg('connect failed', e && e.message);
        if (g === gen) { state = 'idle'; cb.onError && cb.onError('Không kết nối được máy chủ ghép trận online. Kiểm tra Internet rồi thử lại.'); }
        return;
      }
      if (g !== gen) { try { client.end(true); } catch (e) {} return; }
      c = client; dbg('connected');
      client.on('message', (topic, buf) => {
        if (g !== gen) return;
        const t = topic.slice(TOPIC.length), s = buf.toString();
        if (t === 'lobby') {
          let v = null; try { v = s ? JSON.parse(s) : null; } catch (e) {}
          lobbyVal = v;
          if (state === 'waiting') {
            if (!v) enterLobby();
            else if (v.id !== me) decide();
          }
          return;
        }
        if (opp && t === 'gone/' + opp) return lost();
        if (t !== 'u/' + me) return;
        let m; try { m = JSON.parse(s); } catch (e) { return; }
        if (!m || !m.f) return;
        if (m.t !== 'r' && m.t !== 'g' && m.t !== 'ack' && m.t !== 'ping' && m.t !== 'pong') dbg('recv', m.t, 'from', m.f, 'state', state);
        if (m.t === 'join') {
          const mutual = state === 'joining' && m.f === joinTarget;
          if (state === 'waiting' || (mutual && me < m.f)) { toUser(m.f, { t: 'accept' }); matchWith(m.f, 'host'); }
          else if (mutual) { /* bên kia sẽ chấp nhận */ }
          else if (m.f !== opp) toUser(m.f, { t: 'busy' });
          return;
        }
        if (m.t === 'accept') {
          if (state === 'joining' && m.f === joinTarget) matchWith(m.f, 'guest');
          else if (m.f !== opp) toUser(m.f, { t: 'g', m: { t: '_leave' } });
          return;
        }
        if (m.t === 'busy') {
          if (state === 'joining' && m.f === joinTarget) {
            clearTimeout(joinTimer); state = 'deciding';
            setTimeout(() => { if (g === gen && state === 'deciding') decide(); }, 700 + Math.random() * 900);
          }
          return;
        }
        if (m.f !== opp) return;
        seen = Date.now();
        if (m.t === 'ping') { toUser(opp, { t: 'pong', ts: m.ts }, { qos: 0 }); return; }
        if (m.t === 'pong') {
          const r = performance.now() - m.ts;
          if (r >= 0 && r < 5000) api.rtt = api.rtt * 0.7 + r * 0.3;
          return;
        }
        if (m.t === 'r') return onReliable(m);
        if (m.t === 'ack') {
          const a = m.a | 0;
          for (const n of [...unacked.keys()]) if (n <= a) unacked.delete(n);
          // bên nhận báo thiếu tin → gửi lại ngay tin bị thiếu
          const miss = unacked.get(a + 1);
          if (m.g && miss && performance.now() - miss.at > 120) { miss.at = performance.now(); toUser(opp, { t: 'r', s: a + 1, m: miss.m }, { qos: 0 }); }
          return;
        }
        if (m.t === 'g') cb.onMessage && cb.onMessage(m.m);
      });
      client.on('connect', () => { if (g === gen) seen = Date.now(); });
      client.subscribe([TOPIC + 'u/' + me, TOPIC + 'lobby'], { qos: 1 }, () => {
        if (g !== gen) return;
        state = 'deciding';
        setTimeout(() => { if (g === gen && state === 'deciding') decide(); }, 900);
      });
    };
    api.send = function (msg, fast) {
      if (state !== 'matched' || !opp) return;
      if (fast) return toUser(opp, { t: 'g', m: msg }, { qos: 0 });
      const n = ++sendSeq;
      unacked.set(n, { m: msg, at: performance.now() });
      toUser(opp, { t: 'r', s: n, m: msg }, { qos: 0 });
    };
    api.stop = function () { shutdown(); };
    return api;
  }

  /* Theo dõi phòng chờ của nhiều game (dùng ở trang chủ để báo "có người đang chờ") */
  async function watchLobbies(gameIds, onChange) {
    try {
      const lib = await loadMqtt();
      const c = await connectBroker(lib, 'hub_' + rid());
      c.on('message', (topic, buf) => {
        const m = topic.match(/^kietto196-testhost\/([^/]+)\/v\d+\/lobby$/);
        if (!m) return;
        let v = null; try { v = buf.length ? JSON.parse(buf.toString()) : null; } catch (e) {}
        const fresh = v && v.id && (!v.ts || Math.abs(Date.now() - v.ts) < 70000);
        onChange(m[1], fresh ? v : null);
      });
      c.subscribe(gameIds.map(g => ROOT + g + (g === 'caro' ? '/v2/lobby' : '/v1/lobby')), { qos: 0 });
      return c;
    } catch (e) { return null; }
  }

  window.Net = { create, watchLobbies, loadMqtt };
})();
