// Cờ Caro Online — máy chủ ghép trận (Node.js thuần, không cần cài thư viện)
// Chạy:  node server.js     (hoặc: npm start)
// Mặc định mở ở cổng 3000, đổi bằng biến môi trường PORT.

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const INDEX = path.join(__dirname, 'index.html');

const clients = new Map(); // id -> { id, res, partner }
let waitingId = null;      // người đang chờ ghép trận

function push(c, obj) {
  try { c.res.write('data: ' + JSON.stringify(obj) + '\n\n'); } catch (e) { /* bỏ qua */ }
}

function drop(id) {
  const c = clients.get(id);
  if (!c) return;
  clients.delete(id);
  if (waitingId === id) waitingId = null;
  if (c.partner) {
    const p = clients.get(c.partner);
    if (p) { p.partner = null; push(p, { type: 'left' }); }
  }
  try { c.res.end(); } catch (e) { /* bỏ qua */ }
}

function readBody(req, cb) {
  let body = '';
  req.on('data', ch => { body += ch; if (body.length > 8192) req.destroy(); });
  req.on('end', () => cb(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (p.endsWith('/api/ping')) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ caro: true, online: clients.size }));
  }

  // Kênh sự kiện (Server-Sent Events): vào hàng chờ, nhận tin từ đối thủ
  if (p.endsWith('/api/events') && req.method === 'GET') {
    const id = url.searchParams.get('id') || '';
    if (!/^[a-z0-9]{6,40}$/i.test(id)) { res.writeHead(400); return res.end(); }
    if (clients.has(id)) drop(id);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write('retry: 600000\n\n');

    const me = { id, res, partner: null };
    clients.set(id, me);
    req.on('close', () => { if (clients.get(id) === me) drop(id); });

    const w = waitingId && clients.get(waitingId);
    if (w && !w.partner) {
      waitingId = null;
      w.partner = id;
      me.partner = w.id;
      push(w, { type: 'matched', role: 'host' });
      push(me, { type: 'matched', role: 'guest' });
      console.log('Ghép trận:', w.id, '↔', id);
    } else {
      waitingId = id;
      push(me, { type: 'waiting' });
    }
    return;
  }

  // Gửi tin cho đối thủ
  if (p.endsWith('/api/send') && req.method === 'POST') {
    return readBody(req, body => {
      try {
        const { id, msg } = JSON.parse(body);
        const c = clients.get(id);
        const partner = c && c.partner && clients.get(c.partner);
        if (partner) push(partner, { type: 'msg', msg });
      } catch (e) { /* bỏ qua */ }
      res.writeHead(204); res.end();
    });
  }

  if (p.endsWith('/api/leave') && req.method === 'POST') {
    drop(url.searchParams.get('id') || '');
    res.writeHead(204); return res.end();
  }

  if (p === '/' || p.endsWith('/') || p.endsWith('/index.html')) {
    return fs.readFile(INDEX, (err, data) => {
      if (err) { res.writeHead(500); return res.end('Không đọc được index.html'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Không tìm thấy');
});

// Giữ kết nối sống qua proxy
setInterval(() => {
  clients.forEach(c => { try { c.res.write(': hb\n\n'); } catch (e) { /* bỏ qua */ } });
}, 20000);

server.listen(PORT, () => {
  console.log('\n  Cờ Caro Online đang chạy:');
  console.log('  • Máy này:      http://localhost:' + PORT);
  Object.values(os.networkInterfaces()).flat().forEach(n => {
    if (n && n.family === 'IPv4' && !n.internal) console.log('  • Mạng nội bộ:  http://' + n.address + ':' + PORT);
  });
  console.log('\n  Mở link trên ở 2 máy (cùng mạng) để ghép trận.\n');
});
