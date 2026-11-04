# Cờ Caro Online

Cờ caro 2 người, mỗi người một máy. Người vào trang đầu tiên sẽ chờ; khi có người thứ hai vào, hai người được ghép trận và bắt đầu chơi ngay.

- Bàn 15×15, 5 quân liên tiếp là thắng, mỗi lượt 30 giây
- Tính điểm qua nhiều ván, chơi lại (người đi trước đổi lượt), xin thua, thả emoji
- Báo khi đối thủ thoát; giao diện sáng/tối, chạy tốt trên điện thoại

## Cách chạy

### Cách 1 — Dùng máy chủ Node.js (ổn định nhất)
Cần cài Node.js 16 trở lên, không cần `npm install`.

```bash
node server.js        # hoặc: npm start
```

Mở `http://localhost:3000` trên máy này, máy kia (cùng mạng Wi‑Fi) mở địa chỉ `http://<IP-máy-bạn>:3000` được in ra trong terminal.
Muốn chơi qua Internet: deploy thư mục này lên một dịch vụ chạy Node (Render, Railway, Fly.io, VPS…), lệnh chạy là `npm start`, cổng lấy từ biến `PORT`.

### Cách 2 — Hosting tĩnh (GitHub Pages, Netlify…), không cần server
Chỉ cần đưa `index.html` lên. Khi không thấy `server.js`, trang tự chuyển sang chế độ **Online P2P**: hai trình duyệt tìm nhau qua dịch vụ miễn phí PeerJS rồi kết nối trực tiếp với nhau. Góc trên bên phải trang cho biết đang ở chế độ nào ("Máy chủ" hay "Online P2P").

Lưu ý chế độ P2P: phụ thuộc dịch vụ PeerJS công cộng, và một số mạng (Wi‑Fi công ty, 4G) có thể chặn kết nối trực tiếp. Nếu gặp lỗi, dùng Cách 1.

## Các file
- `index.html` — giao diện và luật chơi
- `server.js` — máy chủ ghép trận (Node.js thuần)
- `package.json` — để `npm start` và deploy
