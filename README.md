# Cờ Caro Online

Cờ caro 2 người, mỗi người một máy. Người vào trang đầu tiên sẽ chờ; khi có người thứ hai vào, hai người được ghép trận và bắt đầu chơi ngay.

- Bàn 15×15, 5 quân liên tiếp là thắng, mỗi lượt 30 giây
- Tính điểm qua nhiều ván, chơi lại (người đi trước đổi lượt), xin thua, thả emoji
- Báo khi đối thủ thoát; giao diện sáng/tối, chạy tốt trên điện thoại

## Cách chạy

Trang ghép trận qua Internet (dùng máy chủ MQTT công cộng miễn phí: broker.emqx.io, dự phòng broker.hivemq.com), nên **hai người ở hai mạng khác nhau vẫn chơi được với nhau**, không cần chạy server riêng. Góc trên bên phải trang hiện chữ **"Online"** khi đang ở chế độ này.

Chỉ cần mỗi người mở được `index.html`:

- **Cách khuyên dùng — GitHub Pages:** push repo lên GitHub → Settings → Pages → Source: *Deploy from a branch*, chọn nhánh `main`, thư mục `/ (root)` → Save. Sau 1–2 phút có link dạng `https://kietto196.github.io/TestHost/`, gửi link đó cho bạn bè.
- Hoặc gửi luôn file `index.html` cho bạn: mỗi người mở file trên máy mình (bấm đúp) vẫn ghép trận được với nhau.
- Netlify, Vercel hay bất kỳ hosting tĩnh nào khác cũng được.

### server.js (không bắt buộc)
`node server.js` (cổng 3000) chỉ là phương án dự phòng: trang chỉ dùng nó khi không kết nối được máy chủ online, và khi đó chỉ người vào được máy của bạn (thường là cùng mạng) mới chơi cùng.

## Các file
- `index.html` — giao diện và luật chơi
- `server.js` — máy chủ dự phòng chạy trong mạng nội bộ (không bắt buộc)
- `package.json` — để `npm start` và deploy
