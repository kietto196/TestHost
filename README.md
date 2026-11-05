# Góc Game Đôi — 6 game 2 người chơi online

Mở `index.html` (trang chủ) → chọn game → nhập tên → **Tìm đối thủ**. Người vào trước sẽ chờ; khi có người thứ hai vào cùng game, hai người được ghép trận ngay. Trang chủ hiện chấm xanh **“… đang chờ”** trên game đang có người đợi.

Ghép trận đi qua máy chủ MQTT công cộng miễn phí (broker.emqx.io, dự phòng broker.hivemq.com), nên **hai người ở hai mạng khác nhau vẫn chơi được**, không cần chạy server riêng.

| Game | File | Kiểu | Phím (máy tính) |
|---|---|---|---|
| Cờ Caro | `caro.html` | Theo lượt, 5 quân liên tiếp thắng | Chuột |
| Pong Neon | `pong.html` | Bóng bàn đối kháng, 7 điểm thắng | W/S hoặc ↑/↓, chuột |
| Đặt Bom | `bomber.html` | Phá chướng ngại, hạ đối thủ, thắng 2/3 ván | ←↑↓→ / WASD, Space đặt bom |
| Mê Cung Tốc Độ | `maze.html` | Đua tìm đường tới lá cờ, thắng 2/3 ván | ←↑↓→ / WASD |
| Zoople Xếp Thú | `zoople.html` | Theo lượt, làm rơi thú xuống nước là thua | ← → di chuyển, Q/E xoay, Space thả |
| Lửa & Nước | `fireboy.html` | Phối hợp qua 3 màn | ← → / A D, ↑ / W / Space nhảy, R chơi lại màn |

Trên điện thoại, mỗi game có nút điều khiển cảm ứng. Hướng dẫn chi tiết từng game nằm ở màn hình bắt đầu của game đó.

## Đưa lên mạng
- **GitHub Pages:** push toàn bộ thư mục (gồm cả thư mục `shared/`) → Settings → Pages → *Deploy from a branch*, nhánh `main`, thư mục `/ (root)`. Link sẽ có dạng `https://kietto196.github.io/TestHost/`.
- Netlify, Vercel hay hosting tĩnh bất kỳ đều được.
- Chạy thử trên máy: `node server.js` rồi mở `http://localhost:3000` (Node.js 16+, không cần cài thư viện).

## Cấu trúc
- `index.html` — trang chủ
- `caro.html`, `pong.html`, `bomber.html`, `maze.html`, `zoople.html`, `fireboy.html` — các game
- `shared/net.js` — ghép trận online · `shared/shell.js`, `shared/shell.css` — khung giao diện chung · `shared/games.js` — danh sách game
- `server.js` — server tĩnh để chạy thử trên máy (caro còn dùng nó làm phương án dự phòng)
