## Tổng quan màn hình

Chia 3 cột:

* **Trái** — danh sách Campaign + Posts
* **Giữa** — Post Composer (nơi tạo/chỉnh post)
* **Phải** — Live preview như đang xem trên điện thoại

---

## Flow end-to-end

### Bước 1 — Tạo Campaign (tuỳ chọn)

Nhấn **"+ New Campaign"** trên topbar. Điền tên, date range, loại campaign (Product Launch / Seasonal / Brand). Campaign chỉ là cái "thư mục" gom posts lại —  **không bắt buộc** , có thể tạo post standalone.

Cột trái hiện 4 campaign ví dụ:

* 🚀 **Alaska Range Launch Q3** — đang active, đang mở
* ❄️ Christmas 2025 — draft
* ✨ Behind the Brand — active
* ☀️ Summer Collection — draft chưa có post nào

---

### Bước 2 — Tạo Post mới

Nhấn **"+ New Post"** hoặc nhấn **"+ Post"** ngay trong campaign đang mở → Post Composer ở giữa load lên với 4 bước rõ ràng trên thanh steps.

---

### Bước 3 — Composer: 4 steps

**① Chọn asset** *(step đã done trong mockup)*

* Grid 6 ô hiện asset lấy thẳng từ PIM — packshot, lifestyle, swatch, rendering, portrait
* Click để chọn, ô được chọn có tick xanh + border đậm
* Ô cuối là **Browse PIM** — mở Asset Hub để tìm thêm
* Có thể chọn nhiều asset → tạo carousel post

**② AI Caption** *(step đang active)*

* Sau khi chọn asset, AI tự generate caption dựa trên thông tin product + ảnh
* Có 2 tab: **Instagram** và **Facebook** — caption khác nhau theo nền tảng
* Marketing đọc, chỉnh tay nếu cần, nhấn **Submit for review** để đẩy lên approve
* Nút **Regenerate** nếu muốn AI viết lại
* Hiển thị đếm ký tự (247/2200)

**③ Platforms**

* Toggle bật/tắt từng nền tảng: **Facebook** và **Instagram** (Phase 1)
* LinkedIn và TikTok hiển thị disabled + label "P2"
* Bên dưới ghi rõ format sẽ dùng: FB → 1200×630, IG → 1080×1080

**④ Schedule**

* Chọn ngày giờ đăng — field input date/time
* Nút **Now** để publish ngay lập tức
* Sau khi approve, hệ thống tự đăng đúng giờ đã chọn

---

### Bước 4 — Approval flow *(dưới cùng của Composer)*

```
Draft → Pending Review → Approved → Scheduled → Published
```

Thanh 5 bước hiển thị đang ở đâu. Trong mockup đang ở **Pending Review** — nghĩa là caption đã submit, đang chờ người có quyền approve.  **AI không tự publish** , bắt buộc có người approve trước.

Sau khi approve → chuyển sang **Scheduled** → hệ thống tự đăng đúng giờ → **Published** và lưu `post_id` từ Meta API để tracking Phase 2.

---

### Cột trái — theo dõi Posts trong campaign

Post list của "Alaska Q3" hiện 4 posts với trạng thái khác nhau:

| Post                        | Nền tảng  | Trạng thái                                         |
| --------------------------- | ----------- | ---------------------------------------------------- |
| Alaska Chair — hero shot   | FB + IG     | **Pending** (đang ở bước này)             |
| Alaska — lifestyle scene   | IG only     | **Scheduled** (đã approve, chờ giờ đăng) |
| Alaska — detail swatch oak | FB          | **Published** (đã lên)                      |
| Alaska — colour carousel   | IG carousel | **Draft** (chưa làm xong)                    |

Click vào post nào → Composer load nội dung của post đó lên giữa.

---

### Cột phải — Live Preview

Cập nhật real-time theo những gì đang soạn ở Composer:

* **Instagram** — hiện frame post dạng square (1080×1080), có avatar account `@response_furniture`, caption + hashtag, action bar Like/Comment/Share
* **Facebook** — hiện frame post dạng landscape (1200×630), có Page name `Response Furniture`, timestamp, caption

Đây chính là fanpage đã kết nối trong Settings → Connected Accounts. Preview cho thấy đúng bài sẽ trông như thế nào trước khi đăng.

---

### Warning bar trên cùng

Nhắc nhở Meta App Review đang pending — posts tạo được bình thường nhưng chưa thực sự publish được cho đến khi Meta approve app. Tất cả posts Scheduled sẽ tự đăng ngay khi approval granted.
