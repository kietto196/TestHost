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
  },
  {
    id: 'ragdoll', file: 'ragdoll.html', title: 'Người Nhũn Vượt Ải', accent: '#3d8bfd',
    tagline: 'Hai nhân vật mềm oặt lắc lư: bám, leo, khiêng đồ, kéo nhau qua ải giải đố vật lý.', kind: 'Phối hợp · Vật lý',
    thumb: `<svg viewBox="0 0 100 100"><defs><linearGradient id="rgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd7a8"/><stop offset="1" stop-color="#ffeedd"/></linearGradient></defs><rect width="100" height="100" fill="url(#rgs)"/><path d="M0 74h46v26H0z M64 60h36v40H64z" fill="#6c7a91"/><path d="M0 74h46M64 60h36" stroke="#4a566a" stroke-width="2"/><rect x="72" y="44" width="16" height="16" rx="2" fill="#c98a4b" stroke="#8c5a2b" stroke-width="2"/><g stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"><path d="M30 46q8-4 14-14"/><path d="M26 52l-6 14M32 52l4 14"/></g><ellipse cx="28" cy="44" rx="9" ry="11" fill="#fff"/><circle cx="28" cy="31" r="8" fill="#fff"/><g stroke="#ffcf3a" stroke-width="7" stroke-linecap="round" fill="none"><path d="M58 46q4-8 8-12"/><path d="M54 58l-3 12M58 58l5 10"/></g><ellipse cx="56" cy="50" rx="8" ry="10" fill="#ffcf3a"/><circle cx="57" cy="37" r="7" fill="#ffcf3a"/><circle cx="25" cy="30" r="1.4" fill="#333"/><circle cx="30" cy="30" r="1.4" fill="#333"/><circle cx="55" cy="36" r="1.3" fill="#333"/><circle cx="60" cy="36" r="1.3" fill="#333"/></svg>`
  },
  {
    id: 'fighter', file: 'fighter.html', title: 'Đại Chiến Nhẫn Kiếm', accent: '#ff3b5c',
    tagline: 'Đối kháng phong cách anime: chọn nhân vật, tung combo, chiêu đặc biệt và tuyệt chiêu. Thắng 2/3 hiệp.', kind: 'Đối kháng',
    thumb: `<svg viewBox="0 0 100 100"><defs><linearGradient id="fgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1745"/><stop offset="1" stop-color="#ff7a59"/></linearGradient></defs><rect width="100" height="100" fill="url(#fgs)"/><circle cx="50" cy="40" r="22" fill="#ffd27a" opacity=".55"/><rect y="80" width="100" height="20" fill="#2b1b2e"/><rect x="8" y="8" width="36" height="5" rx="2" fill="#3ddc84"/><rect x="56" y="8" width="36" height="5" rx="2" fill="#3ddc84"/><path d="M50 30l-6 14 7-3-4 14 11-17-7 2 5-10z" fill="#fff6a8"/><g fill="#1b1d2b"><circle cx="26" cy="46" r="7"/><path d="M20 54h12l3 18h-6l-2-9-3 9h-6z"/><path d="M32 57l14-6 1 3-13 7z"/><circle cx="74" cy="46" r="7"/><path d="M68 54h12l2 18h-6l-2-9-3 9h-6z"/><path d="M68 56l-18-14 2-2 18 13z" /></g><path d="M18 42l-8-4 9 1z M80 41l9-5-8 6z" fill="#ff3b5c"/></svg>`
  },
  {
    id: 'tank', file: 'tank.html', title: 'Xe Tăng Mê Cung', accent: '#5aa02c',
    tagline: 'Hai xe tăng trong mê cung, đạn nảy tường. Bắn trúng đối thủ (và đừng tự bắn mình!) để ghi điểm.', kind: 'Hành động',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#eeeeea"/><g stroke="#4a4a4a" stroke-width="3.5" stroke-linecap="square" fill="none"><rect x="6" y="6" width="88" height="88"/><path d="M6 36h28M50 6v30M66 36h28M34 36v28M66 64v30M6 64h44"/></g><g transform="translate(22 20) rotate(20)"><rect x="-8" y="-6" width="16" height="12" rx="2" fill="#d9413a"/><circle r="4" fill="#a8302b"/><rect x="0" y="-1.5" width="11" height="3" fill="#a8302b"/></g><g transform="translate(78 78) rotate(200)"><rect x="-8" y="-6" width="16" height="12" rx="2" fill="#4c8f2b"/><circle r="4" fill="#356a1d"/><rect x="0" y="-1.5" width="11" height="3" fill="#356a1d"/></g><path d="M36 22L48 32 40 46 58 52" stroke="#555" stroke-width="1.4" stroke-dasharray="2 3" fill="none"/><circle cx="58" cy="52" r="2.2" fill="#222"/></svg>`
  },
  {
    id: 'duel', file: 'duel.html', title: 'Đấu Súng Tay Đôi', accent: '#00b3a4',
    tagline: 'Solo bắn súng trong đấu trường nhỏ. Mỗi phát bắn phải nạp 2 giây — ngắm cho chuẩn, né cho khéo.', kind: 'Bắn súng',
    thumb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#1c2430"/><g stroke="#263142" stroke-width="1">${[10,20,30,40,50,60,70,80,90].map(v=>`<path d="M${v} 0V100M0 ${v}H100"/>`).join('')}</g><rect x="40" y="38" width="20" height="24" rx="3" fill="#4a5a70"/><rect x="12" y="70" width="22" height="10" rx="3" fill="#4a5a70"/><rect x="68" y="18" width="18" height="12" rx="3" fill="#4a5a70"/><circle cx="22" cy="30" r="8" fill="#00d9c5"/><rect x="26" y="28" width="10" height="4" rx="2" fill="#0b8f83"/><circle cx="22" cy="30" r="12" fill="none" stroke="#00d9c5" stroke-width="2" stroke-dasharray="40 100" opacity=".8"/><circle cx="78" cy="72" r="8" fill="#ff8a3d"/><rect x="64" y="70" width="10" height="4" rx="2" fill="#c75d1c"/><path d="M38 31L62 66" stroke="#fff6a8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="7 9"/></svg>`
  }
];
