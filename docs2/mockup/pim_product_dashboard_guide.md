# Hướng dẫn màn hình: Product 360° Dashboard

> **File mockup:** `pim_product_dashboard.html`  
> **Màn hình này là gì:** View tổng hợp toàn bộ thông tin của một Item — assets, documents, hierarchy, AI content, publish status và customer sales history — tất cả trong một trang duy nhất.

---

## 1. Cấu trúc tổng quan

```
┌─────────────┬──────────────────────────────────────────────┐
│   Sidebar   │  Topbar (breadcrumb + action buttons)        │
│  (nav)      ├──────────────────────────────────────────────┤
│             │  Warning bar (nếu có vấn đề)                 │
│             ├──────────────────────────────────────────────┤
│             │  Item Header (tên, badges, completeness)     │
│             ├──────────────────────────────────────────────┤
│             │  Stat cards (4 chỉ số nhanh)                 │
│             ├──────────────────────────────────────────────┤
│             │  Row 1: Media │ Documents │ Hierarchy        │
│             ├──────────────────────────────────────────────┤
│             │  Row 2: AI content │ Publish │ Customer      │
└─────────────┴──────────────────────────────────────────────┘
```

---

## 2. Sidebar — điều hướng chính

| Mục | Đi đến |
|-----|--------|
| **Products** | Danh sách Item (đang active) |
| Ranges | Danh sách Range (Alaska, Greenwood…) |
| Materials | Quản lý vật liệu + lifecycle |
| Asset Hub | Image Engine — upload & xử lý media |
| Documents | PI / Assembly Instruction / Shipping Mark |
| Social Campaign | Tạo và đăng campaign social |
| Publish Flow | Completeness check → publish iPaper / Web |
| D365 Sync | Trạng thái đồng bộ với D365 |
| Settings | Cài đặt hệ thống |

---

## 3. Topbar

### Breadcrumb
```
Greenwood  ›  Item 30317  /  360° Dashboard
```
Nhấn **Greenwood** → quay về danh sách Items trong Range Greenwood.

### Action buttons

| Button | Tác dụng |
|--------|----------|
| **New Campaign** | Tạo campaign social mới lấy asset từ Item này |
| **Publish** | Mở Publish Flow — completeness check trước khi đẩy ra iPaper / Web |
| **Upload Asset** | Upload file media hoặc document gắn trực tiếp vào Item này |

---

## 4. Warning bar

Hiển thị **khi có vấn đề cần chú ý**, ví dụ:

> ⚠️ Material **WOODWO-00003** (American White Oak) — status: **Phasing Out.** Kiểm tra variants liên quan trước khi thiết kế mới.

**Khi nào xuất hiện:**
- Material đang dùng trong BOM của Item chuyển sang `Phasing Out` hoặc `Discontinued`
- Document sắp hết hạn (`expiry_date`)
- Completeness score dưới ngưỡng tối thiểu để publish

**Không có vấn đề** → warning bar ẩn đi, content tự đẩy lên.

---

## 5. Item Header

```
┌──────┬────────────────────────────────────┬──────────┐
│ Icon │ 30317 — Greenwood Lounge Chair     │   72%    │
│      │ Range · Designer · D365 sync       │Completeness│
│      │ [badges]                           │          │
└──────┴────────────────────────────────────┴──────────┘
```

### Thông tin hiển thị

| Trường | Nguồn | Ý nghĩa |
|--------|-------|---------|
| Item code + tên | D365 sync | Mã sản phẩm và tên đầy đủ |
| Range | D365 `productRange` | Nhóm sản phẩm |
| Designer | D365 field | Nhà thiết kế |
| D365 sync | Timestamp | Lần cuối đồng bộ dữ liệu từ D365 |

### Badges

| Badge | Màu | Ý nghĩa |
|-------|-----|---------|
| 3 Mother Variants | Xanh | Số Mother Variant (configId 987/997/998…) |
| 12 Daughter Variants | Xám | Số Daughter Variant |
| 116 SO Variants | Xám | Số SO Variant (combo vật liệu bán thật) |
| iPaper: Published | Xanh lá | Item đã được publish lên iPaper catalogue |
| Web: Published | Xanh lá | Item đang live trên Website REST API |

### Completeness score
- Số phần trăm (vd: **72%**) — tính dựa trên danh sách trường bắt buộc do admin định nghĩa
- Thanh progress bar trực quan
- Cần đạt ngưỡng tối thiểu (vd: 80%) mới có thể nhấn **Publish**
- Nhấn vào score → xem chi tiết trường nào còn thiếu

---

## 6. Stat cards — 4 chỉ số nhanh

Hiển thị ngay dưới Item Header, đọc một lần nắm được tình trạng tổng thể:

| Card | Số | Sub-text | Ý nghĩa |
|------|----|----------|---------|
| **Media assets** | 24 | 18 ready · 6 processing | Tổng file media (ảnh, 3D, video). Processing = đang qua Image Engine |
| **Documents** | 11 | 8 approved · 3 pending | PI / Assembly Instruction / Shipping Mark / Test Report… |
| **Customers** | 7 | Đã bán cho 7 khách | Số khách hàng đã có order chứa Item này — đọc từ D365 |
| **Campaigns** | 3 | 1 scheduled · 2 posted | Social campaigns đang dùng asset của Item này |

Nhấn vào bất kỳ card → scroll/jump xuống panel tương ứng bên dưới.

---

## 7. Row 1 — Ba panel hàng trên

### Panel trái: Media assets

Hiển thị **grid 3×2** thumbnail các asset media gắn với Item.

| Ô thumbnail | Trạng thái | Màu viền |
|-------------|-----------|----------|
| Packshot | Ready | Xanh nhạt |
| Lifestyle | Ready | Xanh nhạt |
| Line Drawing | Ready | Xanh nhạt |
| OBJ/3D | Ready | Xanh nhạt |
| Processing… | Đang xử lý | Icon spinner cam |
| Upload (ô cuối) | — | Nhấn để upload thêm |

**Thao tác:**
- Nhấn vào thumbnail → xem chi tiết asset (preview, download, CDN URL, tất cả variants đã generate)
- Nhấn **"Xem tất cả →"** → mở Asset Hub lọc theo Item 30317
- Nhấn ô **Upload** → mở upload panel với entity đã pre-fill là Item 30317

---

### Panel giữa: Documents

Danh sách document gắn với Item, hiển thị tên và trạng thái approval:

| Document | Trạng thái | Màu |
|----------|-----------|-----|
| PI — Green FSC | Approved | Xanh lá |
| Assembly — JL | Pending customer | Cam |
| Shipping Mark — JL | Approved | Xanh lá |
| Test Report EU | Approved | Xanh lá |
| Compliance US | Draft | Xám |

**Đọc trạng thái:**
- `Approved` → document đã qua đủ bước duyệt, có thể dùng
- `Pending customer` → đã duyệt nội bộ, đang chờ khách hàng (John Lewis) confirm
- `Draft` → chưa hoàn thiện, chưa submit duyệt

**Thao tác:**
- Nhấn vào từng dòng → xem chi tiết document (download, approval history, version)
- Nhấn **"Xem tất cả →"** → mở Document Hub lọc theo Item 30317

---

### Panel phải: Hierarchy

Hiển thị cây cấu trúc 5 cấp của Item đang xem:

```
📁 Greenwood                    [Range]
  📦 30317  ◀ đang ở đây       [Item]
    ⊙ 30317-997                 [Mother Variant]
    ⊙ 30317-975                 [Daughter Variant]
      · 30317-001               [SO Variant]
      · 30317-002               [SO Variant]
        + 114 SO Variants...
```

**Màu sắc:**
- **Xanh dương** = cấp đang xem (30317)
- **Xám** = các cấp khác, click để navigate

**Thao tác:**
- Nhấn **Range** → về trang Range Greenwood
- Nhấn **Mother/Daughter Variant** → mở trang detail của Variant đó
- Nhấn **SO Variant** → xem thông tin combo vật liệu cụ thể (externalItemId, attributes, BOM)
- Nhấn **"Mở đầy đủ →"** → mở Hierarchy view toàn màn hình, expand được tất cả 116 SO Variants

---

## 8. Row 2 — Ba panel hàng dưới

### Panel trái: AI content

Hiển thị nội dung do AI (Claude API) generate cho Item:

| Section | Nội dung |
|---------|---------|
| **Product description** | Mô tả sản phẩm tiếng Anh dùng cho Website + iPaper |
| **Social caption (IG)** | Caption Instagram đã generate, kèm hashtag |
| Badge trạng thái | `Pending approval` — chưa được duyệt |

**Thao tác:**
- Nhấn **"Regenerate"** → AI viết lại toàn bộ content cho Item này
- Nhấn vào từng block text → mở editor để chỉnh tay
- Caption chỉ được dùng trong Social Campaign sau khi badge chuyển sang `Approved`

---

### Panel giữa: Publish status

Hiển thị trạng thái của Item trên từng kênh phân phối:

| Kênh | Icon | Trạng thái |
|------|------|-----------|
| iPaper catalogue | Sách | **Live** — đang hiển thị trong catalogue |
| Website REST API | Globe | **Live** — website đang lấy data từ PIM |
| Facebook | FB icon | **Scheduled** — post đã đặt lịch |
| Instagram | IG icon | **Draft** — chưa submit |

**Ghi chú CDN:**
> CDN dynamic alias — luôn trỏ về latest-approved asset

Nghĩa là khi upload asset mới và approve, iPaper/Website tự lấy bản mới mà không cần publish lại thủ công.

**Thao tác:**
- Nhấn **"Publish"** trên topbar → chạy completeness check → nếu đạt ngưỡng thì push lên các kênh đang Live
- Nhấn vào từng kênh → xem lịch sử publish, version nào đang live

---

### Panel phải: Customer sales history

Danh sách khách hàng đã mua Item này, đọc từ D365 sales data:

| Khách | Số lượng | Thời gian |
|-------|---------|----------|
| John Lewis | 340 pcs | 2024–2025 |
| HAY | 120 pcs | 2024 |
| Muuto | 85 pcs | 2025 |
| Normann Copenhagen | 48 pcs | 2025 |
| Ferm Living | 32 pcs | 2025 |

**Lưu ý:** Read-only, nguồn từ D365, không hiển thị giá.

**Thao tác:**
- Nhấn **"Xem thêm →"** → mở tab Sales đầy đủ (Phase 1 chỉ có basic list)
- Nhấn vào tên khách → tương lai Phase 2 sẽ link sang CRM history của khách đó

---

## 9. Luồng làm việc điển hình

### Scenario A — Content team upload asset mới

```
1. Vào Products → tìm Item 30317
2. Mở 360° Dashboard
3. Nhấn [Upload Asset] trên topbar
4. Chọn entity type = Item, confirm Item 30317
5. Drop file ảnh
6. Image Engine tự xử lý — thumbnail xuất hiện trong panel Media assets
7. Khi processing xong → Completeness score tăng
8. Nhấn [Publish] khi đã đạt ngưỡng
```

### Scenario B — Review document đang chờ duyệt

```
1. Vào 360° Dashboard của Item
2. Nhìn panel Documents → thấy "Assembly — JL" đang Pending customer
3. Nhấn vào dòng đó → xem nội dung, approve hoặc request chỉnh sửa
4. Sau khi approve → badge chuyển sang Approved (xanh lá)
```

### Scenario C — Phát hiện material discontinued

```
1. Warning bar xuất hiện ngay đầu trang:
   "WOODWO-00003 — Phasing Out"
2. Nhấn vào warning → xem danh sách variants đang dùng material này
3. Vào Materials → tìm replacement (replaced_by pointer)
4. Thông báo cho BOM team update
```

### Scenario D — Tạo social campaign từ dashboard

```
1. Nhấn [New Campaign] trên topbar
2. Hệ thống pre-load asset của Item 30317 vào Campaign Builder
3. Chọn ảnh → AI generate caption → submit review → schedule
4. Stat card "Campaigns" tăng thêm 1
```

---

## 10. Quy tắc màu trạng thái

| Màu | Trạng thái | Dùng ở |
|-----|-----------|--------|
| 🟢 Xanh lá | Approved / Live / Ready | Documents, Publish status, Media |
| 🔵 Xanh dương | Scheduled / Info | Publish status, badges |
| 🟡 Cam | Pending / Processing / Warning | Documents, Media, Warning bar |
| ⚪ Xám | Draft / Inactive | Documents, badges |
| 🔴 Đỏ | Failed / Discontinued | Image Engine, Material warning |
