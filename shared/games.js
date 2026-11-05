/* Danh sách game — dùng cho trang chủ và tiêu đề từng game */
window.GAMES = [
  {
    id: 'caro', file: 'caro.html', title: 'Cờ Caro', accent: '#2550c8',
    tagline: 'Bàn 15×15, ai có 5 quân liên tiếp trước là thắng.', kind: 'Lượt',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#fffdf6"/><g stroke="#d6e0ee" stroke-width="1.5">${[20,40,60,80].map(v=>`<path d="M${v} 0V100M0 ${v}H100"/>`).join('')}</g><path d="M25 25l10 10M35 25L25 35M45 45l10 10M55 45L45 55M65 65l10 10M75 65L65 75" stroke="#2550c8" stroke-width="4.5" stroke-linecap="round"/><g fill="none" stroke="#d2382e" stroke-width="4.5"><circle cx="70" cy="30" r="6"/><circle cx="30" cy="70" r="6"/><circle cx="50" cy="30" r="6"/></g></svg>`
  },
  {
    id: 'pong', file: 'pong.html', title: 'Pong Neon', accent: '#e81cff',
    tagline: 'Bóng bàn đối kháng — để lọt bóng là mất điểm. Ai đạt 7 điểm trước thắng.', kind: 'Hành động',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#07020b"/><rect x="5" y="9" width="90" height="82" rx="3" fill="none" stroke="#ff2bf0" stroke-width="3"/><path d="M50 13V87" stroke="#ff2bf0" stroke-width="2" stroke-dasharray="5 5"/><circle cx="50" cy="50" r="8" fill="none" stroke="#ff2bf0" stroke-width="2.5"/><rect x="14" y="36" width="4" height="22" rx="2" fill="#2cff4a"/><rect x="82" y="42" width="4" height="22" rx="2" fill="#ff2a2a"/><circle cx="70" cy="44" r="3.4" fill="#fff"/></svg>`
  },
  {
    id: 'bomber', file: 'bomber.html', title: 'Đặt Bom', accent: '#ff7a1a',
    tagline: 'Đặt bom phá chướng ngại, mở đường, hạ gục đối thủ. Ai sống sót cuối cùng thắng.', kind: 'Hành động',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3d8a2"/><g fill="#e2b46b">${[0,1,2,3,4].map(i=>[0,1,2,3,4].map(j=>(i+j)%2?`<rect x="${i*20}" y="${j*20}" width="20" height="20"/>`:'').join('')).join('')}</g><g fill="#b98048" stroke="#8c5a2b" stroke-width="2"><rect x="2" y="2" width="16" height="16" rx="3"/><rect x="62" y="22" width="16" height="16" rx="3"/><rect x="22" y="62" width="16" height="16" rx="3"/><rect x="82" y="62" width="16" height="16" rx="3"/></g><g fill="#7d8a99" stroke="#5a6573" stroke-width="2"><rect x="22" y="22" width="16" height="16" rx="3"/><rect x="62" y="62" width="16" height="16" rx="3"/></g><circle cx="50" cy="54" r="13" fill="#20232b"/><circle cx="45" cy="49" r="4" fill="#5a606e"/><path d="M57 42q5-8 11-6" stroke="#8c5a2b" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="69" cy="35" r="5" fill="#ffcf3a"/><circle cx="69" cy="35" r="2.5" fill="#fff"/></svg>`
  },
  {
    id: 'maze', file: 'maze.html', title: 'Mê Cung Tốc Độ', accent: '#14a37f',
    tagline: 'Cùng xuất phát, ai tìm đường tới lá cờ nhanh hơn thắng ván. Thắng 2/3 ván.', kind: 'Đua',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#e9e9e6"/><g stroke="#30343c" stroke-width="2.5" fill="none" stroke-linecap="square"><rect x="8" y="8" width="84" height="84"/><path d="M8 29H50M71 8V50M29 29V71H50M50 50H92M29 92V80M50 71V92M71 71H92M8 50H18"/></g><circle cx="18" cy="18" r="6" fill="#ff5a4e" stroke="#c22" stroke-width="2"/><circle cx="40" cy="40" r="6" fill="#58a6ff" stroke="#1f6fe0" stroke-width="2"/><path d="M80 87V72" stroke="#30343c" stroke-width="2"/><path d="M80 72l9 4-9 4z" fill="#e3342f"/></svg>`
  },
  {
    id: 'zoople', file: 'zoople.html', title: 'Zoople Xếp Thú', accent: '#f2a40f',
    tagline: 'Thay phiên đặt thú lên tháp. Ai làm rơi con thú nào xuống nước trước là thua.', kind: 'Lượt · Vật lý',
    thumb: `<svg viewBox="0 0 100 100"><defs><linearGradient id="zs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#d9f2ff"/></linearGradient></defs><rect width="100" height="100" fill="url(#zs)"/><rect y="84" width="100" height="16" fill="#3fa3e0"/><path d="M30 84h40l-4-10H34z" fill="#8a6a4a"/><rect x="32" y="58" width="36" height="16" rx="7" fill="#9aa3b5"/><rect x="40" y="38" width="22" height="20" rx="8" fill="#b980e6"/><rect x="46" y="16" width="10" height="22" rx="5" fill="#ffc94a"/><g fill="#222"><circle cx="40" cy="64" r="1.8"/><circle cx="47" cy="64" r="1.8"/><circle cx="46" cy="45" r="1.8"/><circle cx="53" cy="45" r="1.8"/><circle cx="49" cy="22" r="1.4"/><circle cx="53.5" cy="22" r="1.4"/></g></svg>`
  },
  {
    id: 'fireboy', file: 'fireboy.html', title: 'Lửa & Nước', accent: '#ff5a1f',
    tagline: 'Phối hợp cùng nhau: Lửa tránh nước, Nước tránh lửa, cả hai tránh chất độc xanh, về đúng cửa.', kind: 'Phối hợp',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#3b3426"/><g fill="#4b4231" stroke="#2c2619" stroke-width="1.5">${[0,1,2,3,4,5].map(r=>[0,1,2,3].map(c=>`<rect x="${c*28-(r%2)*14}" y="${r*17}" width="28" height="17"/>`).join('')).join('')}</g><rect x="0" y="78" width="100" height="22" fill="#6b5d3f"/><rect x="38" y="76" width="24" height="5" fill="#2aa7ff"/><path d="M27 70c-9 0-11-8-7-14 1 4 3 4 4 2 0-6 3-10 8-12-1 5 4 7 4 13 0 6-4 11-9 11z" fill="#ff5a1f"/><circle cx="25" cy="63" r="1.8" fill="#fff"/><circle cx="31" cy="63" r="1.8" fill="#fff"/><path d="M73 48c6 8 10 13 10 18a10 10 0 0 1-20 0c0-5 4-10 10-18z" fill="#36b4ff"/><circle cx="69" cy="65" r="1.8" fill="#fff"/><circle cx="76" cy="65" r="1.8" fill="#fff"/></svg>`
  }
];
