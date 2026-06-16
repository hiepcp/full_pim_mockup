# Hướng dẫn màn hình: Image Engine

> **File mockup:** `pim_image_engine.html`  
> **Màn hình này là gì:** Nơi upload và theo dõi xử lý tất cả media asset — upload 1 lần, hệ thống tự generate đủ size/format cho Web, Print, Social trong vòng < 30 giây.

---

## 1. Cấu trúc tổng quan

```
┌─────────────┬──────────────────────────────────────────────┐
│   Sidebar   │  Topbar (breadcrumb + Filter + Upload)       │
│             ├──────────────────────────────────────────────┤
│             │  Stat strip (4 chỉ số toàn hệ thống)        │
│             ├──────────────────────────────────────────────┤
│             │  Upload panel                                │
│             │    ① Entity type selector                   │
│             │    ② Entity path picker (breadcrumb)        │
│             │    ③ Drop zone                              │
│             ├──────────┬───────────────────────────────────┤
│             │  Queue   │  Asset detail                     │
│             │  list    │    - Hero (tên, badges)           │
│             │          │    - Linked entity breadcrumb     │
│             │  Pipeline│    - Metadata grid                │
│             │  legend  │    - CDN alias URL                │
│             │          │    - Generated variants grid      │
│             │          │    - Social variants              │
│             │          │    - Processing log               │
└─────────────┴──────────┴───────────────────────────────────┘
```

---

## 2. Topbar

### Breadcrumb
```
Asset Hub  ›  Image Engine
```
Nhấn **Asset Hub** → quay về danh sách toàn bộ asset.

### Action buttons

| Button | Tác dụng |
|--------|----------|
| **Filter** | Lọc queue theo trạng thái (Ready / Processing / Failed), entity type, asset type |
| **Upload Assets** | Scroll lên Upload panel — hoặc shortcut mở thẳng file picker |

---

## 3. Stat strip — 4 chỉ số toàn hệ thống

Hiển thị tình trạng tổng thể của toàn bộ asset trong PIM, cập nhật real-time:

| Card | Số | Màu | Ý nghĩa |
|------|----|-----|---------|
| **Total assets** | 1,284 | Đen | Tổng tất cả media asset đã upload |
| **Ready** | 1,261 | Xanh lá | Đã generate xong tất cả variants, sẵn sàng dùng |
| **Processing** | 18 | Cam | Đang qua Image Engine, hiện avg. 12s còn lại |
| **Failed** | 5 | Đỏ | Lỗi sau max retry — cần xem xét thủ công |

Nhấn vào card **Failed** → queue list tự filter chỉ hiện asset bị lỗi.

---

## 4. Upload panel — quy trình 3 bước

Đây là điểm khác biệt so với upload thông thường: **phải xác định asset thuộc về entity nào trước khi drop file**.

---

### Bước ① — Chọn entity type

Dãy pill button xác định asset sẽ gắn vào cấp nào trong hierarchy:

| Button | Màu khi active | Dùng khi |
|--------|---------------|---------|
| **Item** | Xanh dương | Packshot, Lifestyle, Line Drawing, Rendering, OBJ/3D — dùng chung cho toàn Item |
| **Range** | Tím | Ảnh branding của Range (Alaska, Greenwood…) |
| **Mother Variant** | Xanh lá | BOM, Material spec — gắn với configId 987/997/998 |
| **Daughter Variant** | Cam | Asset riêng theo grade group |
| **SO Variant** | Đỏ | Packshot riêng theo combo vật liệu cụ thể |
| **Material** | Xám | Swatch, mẫu vật liệu gắn với material code (WOODWO-00003) |
| **Non-product** | Xám nhạt | Portrait, campaign image, lifestyle scene không gắn sản phẩm nào |

---

### Bước ② — Chọn entity path

Sau khi chọn entity type, hiện breadcrumb picker để chọn đúng entity:

```
[Greenwood ▾]  ›  [30317 — Lounge Chair ▾]  ›  [Chọn variant… ▾]
```

- Mỗi ô là một dropdown — nhấn để search/chọn
- Cấp nào không cần (vd: chọn type = Item thì cột Variant bị dim/disabled)
- Ô cuối dim = không bắt buộc hoặc chưa áp dụng với type đang chọn

**Resolved context preview** xuất hiện bên dưới xác nhận sẽ gắn vào đâu:

> ✅ Asset sẽ được gắn vào  **[Greenwood]**  ›  **[Item 30317]**  Packshot / Lifestyle / Line Drawing / Swatch…

---

### Bước ③ — Drop zone

Khi đã xác nhận entity xong, drop file vào vùng này:

- Hỗ trợ kéo thả nhiều file cùng lúc — tất cả gắn vào entity đã chọn ở bước ①②
- Hoặc nhấn vào vùng → mở file picker hệ thống

**Validation ngay khi nhận file (trước khi lưu):**

| Rule | Giá trị |
|------|---------|
| Format hỗ trợ | JPG · PNG · WEBP · TIFF (single & multi-page) · PDF · BMP |
| Max file size | 500 MB / file |
| Min dimension | 500 × 500 px |
| Max dimension | 20 000 × 20 000 px |
| MIME validation | Bắt buộc |
| Corrupted file check | Bắt buộc |

Nếu file không hợp lệ → báo lỗi ngay, không tạo job, không tốn storage.

---

## 5. Queue list (cột trái)

Danh sách asset đang được xử lý hoặc vừa xử lý xong — mới nhất ở trên.

### Đọc mỗi dòng

```
[Icon trạng thái]  Tên file          [Entity chip]  [Status badge]
                   4.2 MB · Packshot
                   [progress bar]    (chỉ khi processing)
```

### Màu icon trạng thái

| Icon | Nền | Trạng thái |
|------|-----|-----------|
| 🔄 Loader | Cam nhạt | Processing — đang generate variants |
| ⚠️ Alert | Đỏ nhạt | Failed — cần xem xét |
| 📷 Photo | Xanh nhạt | Ready — tất cả variants đã xong |
| 🕐 Clock | Xám | Pending — đang xếp hàng chờ worker |

### Entity chip màu — biết ngay asset thuộc về đâu

| Chip | Ví dụ | Cấp |
|------|-------|-----|
| 🔵 Xanh dương | `Item 30317` | Item |
| 🟣 Tím | `Calia` | Range |
| 🟢 Xanh lá | `Mother 30317-997` | Mother Variant |
| 🟡 Cam | `Daughter 30317-975` | Daughter Variant |
| 🔴 Đỏ | `SO 30317-042` | SO Variant |
| ⚫ Xám | `WOODWO-00003` | Material |
| ◻️ Xám nhạt | `Non-product` | Standalone / Campaign |

### Thao tác

- **Nhấn vào dòng** → load chi tiết asset sang panel phải
- Dòng đang xem được highlight (selected)

---

## 6. Pipeline legend (dưới queue list)

Hiển thị 6 bước xử lý của asset **đang được chọn** ở queue, cho biết đang ở bước nào:

| Bước | Mô tả | Trạng thái có thể |
|------|-------|------------------|
| 1 | Validate (format · size · MIME · corrupt) | Done / Failed |
| 2 | Store original → Azure Blob `/original` | Done / Failed |
| 3 | Extract metadata (dimensions · DPI · color space) | Done / Running |
| 4 | Generate web + thumbnail + preview + print | Done / Running / Waiting |
| 5 | Generate social variants (FB · IG square · IG portrait) | Done / Running / Waiting |
| 6 | CDN invalidate + update Asset status = ready | Done / Waiting |

**Màu badge từng bước:**
- `Done` (xanh lá) — bước hoàn thành
- `Running` (cam) — đang chạy
- `Waiting` (xám) — chưa đến lượt
- `Failed` (đỏ) — bước bị lỗi, hiện nút Retry

---

## 7. Asset detail panel (cột phải)

Khi nhấn vào một asset trong queue, panel này load toàn bộ thông tin chi tiết.

---

### 7a. Hero section

```
┌──────────┬─────────────────────────────────────────┐
│  Preview │ Tên file                                 │
│  100×100 │ Item 30317 — Greenwood Lounge Chair      │
│          │ [Processing] [Packshot] [v2] [Public]    │
└──────────┴─────────────────────────────────────────┘
```

**Badges trên hero:**

| Badge | Ý nghĩa |
|-------|---------|
| `Processing` / `Ready` / `Failed` | Trạng thái hiện tại |
| `Packshot` / `Lifestyle` / `Line Drawing`… | Loại asset |
| `v2` | Số version (có thể upload version mới đè lên) |
| `Public` / `Private` | Public = CDN URL trực tiếp · Private = Signed URL có TTL |

---

### 7b. Linked entity breadcrumb

Thanh nằm ngay dưới hero — xác nhận asset này đang gắn với entity nào:

```
Gắn vào   [Greenwood]  ›  [Item 30317]   Packshot        [✏️ Thay đổi]
```

- Nhấn **"Thay đổi"** → mở lại entity picker để re-link nếu upload nhầm
- Đây là trường quan trọng nhất — sai entity thì asset không hiện đúng chỗ trên Dashboard

---

### 7c. Metadata grid

4 cặp thông tin kỹ thuật của file gốc:

| Trường | Ví dụ |
|--------|-------|
| Original size | 5 400 × 4 050 px |
| File size | 4.2 MB |
| Color space | sRGB |
| DPI | 300 DPI |
| Format | JPEG |
| Uploaded | Today, 09:14 |

---

### 7d. CDN dynamic alias

```
CDN alias   cdn.pim.io/asset/a7f9c2/web/latest-approved   [📋]
```

- URL này **không thay đổi** dù upload version mới
- iPaper và Website dùng URL này → tự động lấy bản mới nhất đã approve
- Nhấn icon copy → copy URL vào clipboard

---

### 7e. Generated variants — Standard

Grid 4 cột hiển thị từng variant đã (hoặc chưa) được generate:

| Variant | Kích thước | Format | Dùng cho |
|---------|-----------|--------|---------|
| `original` | Gốc, không sửa | Như upload | Lưu trữ, download, re-process |
| `thumbnail` | 300 × 300 px | WEBP | Grid/gallery trong PIM UI |
| `preview` | Max 2 000 px | WEBP | Xem chi tiết trong PIM |
| `web` | Max 1 200 px | WEBP | Website REST API |
| `print` | 300 DPI, giữ ratio | TIFF/JPG | iPaper / catalogue in ấn |

**Trạng thái từng variant:**
- ✅ Xanh nhạt + checkmark → Ready, có thể View / Download
- 🔄 Cam → đang generate, nút bị disabled
- ❌ Đỏ → generate thất bại, hiện nút Retry riêng cho variant đó

**Thao tác trên từng variant card:**
- **View** → mở preview trong browser tab mới
- **DL** → download file về máy
- Disabled khi variant chưa ready

---

### 7f. Social variants

3 variant riêng cho Social Campaign, nằm dưới standard variants:

| Variant | Kích thước | Nền tảng |
|---------|-----------|---------|
| `facebook_feed` | 1 200 × 630 px | Facebook feed |
| `instagram_square` | 1 080 × 1 080 px | Instagram post |
| `instagram_portrait` | 1 080 × 1 350 px | Instagram portrait |

- Watermark **tắt mặc định** cho social variants — Marketing tự thêm khi cần
- Dùng **center-crop thông minh** — không méo tỉ lệ, không sửa original
- Asset này được Social Campaign Builder lấy trực tiếp khi tạo post

---

### 7g. Processing log

Terminal log màu đen ở cuối panel — ghi lại từng bước đã xảy ra:

| Màu | Loại |
|-----|------|
| 🟢 Xanh | Thành công (✓) |
| 🟡 Vàng | Đang chạy / cảnh báo (⟳) |
| 🔴 Đỏ | Lỗi |
| 🔵 Xanh dương | Thông tin thời gian (timestamp) |

Ví dụ:
```
[09:14:02] ✓ Upload received — 4.2 MB · JPEG · 5400×4050px
[09:14:03] ✓ Stored original → azure://product-assets-public/...
[09:14:08] ⟳ web variant — processing…
```

Log hữu ích khi debug asset bị Failed — thấy chính xác bước nào gặp lỗi.

---

## 8. Trạng thái processing — vòng đời đầy đủ

```
Uploaded → Pending → Processing → Ready
                               → Failed → Retrying → Ready
                                                    → Failed (max retry)
```

| Trạng thái | Mô tả | Hành động có thể |
|-----------|-------|-----------------|
| `Pending` | Job đã tạo, worker chưa nhận | Chờ tự động |
| `Processing` | Worker đang generate variants | Xem progress ở pipeline legend |
| `Ready` | Tất cả variants xong | View · Download · Dùng trong Campaign/Publish |
| `Failed` | Lỗi sau max retry (3 lần) | Nhấn **Retry** hoặc xem log tìm nguyên nhân |
| `Unsupported` | Format không tạo được preview | Download original, không có variants |

**Retry policy:** 3 lần · delay 1 phút → 5 phút → 15 phút

---

## 9. Luồng làm việc điển hình

### Scenario A — Upload ảnh sản phẩm mới cho Item

```
1. Nhấn [Upload Assets] trên topbar
2. Upload panel mở ra
3. ① Chọn type: Item
4. ② Chọn path: Greenwood › 30317 — Lounge Chair
5. Xác nhận context preview: "Gắn vào [Greenwood] › [Item 30317]"
6. ③ Kéo thả file packshot.jpg vào drop zone
7. File xuất hiện ngay trong queue với status Pending → Processing
8. Pipeline legend hiển thị đang ở bước nào
9. ~20-30 giây sau → status chuyển Ready
10. Nhấn vào dòng trong queue → xem tất cả 8 variants đã generate
11. Copy CDN alias URL → giao cho Marketing hoặc để iPaper tự pull
```

---

### Scenario B — Upload swatch gắn vào Material

```
1. ① Chọn type: Material
2. ② Path selector chỉ còn 1 ô: [WOODWO-00003 — American White Oak ▾]
3. ③ Drop file swatch.png
4. Asset xuất hiện trong queue với chip xám: [WOODWO-00003]
5. Khi Ready → variant thumbnail dùng cho Material page và Product 360 Dashboard
```

---

### Scenario C — Xử lý File bị Failed

```
1. Stat card [Failed: 5] → nhấn vào → queue lọc chỉ hiện Failed
2. Nhấn vào asset bị lỗi → xem processing log
3. Log hiện bước nào fail: vd "❌ generate print variant — out of memory"
4. Nhấn Retry trên variant card tương ứng
      hoặc
   Nhấn Retry toàn bộ job (re-run từ đầu)
5. Nếu vẫn fail → download original → xử lý ngoài → upload lại bản đã fix
```

---

### Scenario D — Upload Line Drawing dạng TIFF multi-page

```
1. ① Chọn type: Item  ②  30317
2. ③ Drop file linedrawing.tiff (multi-page, 38 MB)
3. Image Engine detect multi-page TIFF → xử lý từng page riêng
4. Kết quả trong variants:
   - /pages/page_1_preview.jpg
   - /pages/page_1_thumb.webp
   - /pages/page_2_preview.jpg  (nếu có)
5. UI hiển thị từng page dạng lazy-load — không render TIFF gốc trực tiếp
```

---

## 10. Quy tắc quan trọng cần nhớ

| Quy tắc | Chi tiết |
|---------|---------|
| **Original không bao giờ bị sửa** | Tất cả variants generate từ bản gốc bất biến |
| **Gắn entity trước, drop file sau** | Không upload "tự do" rồi gắn sau — phải chọn entity ở bước ① ② |
| **CDN alias cố định** | URL không đổi dù upload version mới — catalogue không bị vỡ link |
| **Idempotent** | Retry an toàn, không sinh file trùng |
| **Private asset** | Dùng Signed URL có TTL — không chia sẻ CDN URL trực tiếp |
| **Social variants không có watermark** | Mặc định tắt, Marketing tự kiểm soát |
