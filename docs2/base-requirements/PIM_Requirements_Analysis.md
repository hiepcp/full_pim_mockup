# Phân tích Yêu cầu Dự án PIM
## Product Information Management System

---

## 1. Tổng quan

Hệ thống PIM được hình dung là **một nền tảng quản lý thông tin sản phẩm tập trung**, kết nối và tổ chức toàn bộ nội dung và metadata liên quan đến sản phẩm. Mỗi item được liên kết theo cấu trúc:

```
Range Name  →  Master Number  →  (Variant Number)
```

Mục tiêu: **Single Source of Truth** — mọi nội dung sản phẩm đều được lưu trữ, tìm kiếm, và phân phối nhất quán trên tất cả các kênh.

---

## 2. Yêu cầu Nội dung (Content Requirements)

### 2.1 Visual Assets

| Asset | Ghi chú |
|-------|---------|
| Packshots | Ảnh sản phẩm chính thức |
| Lifestyle images | Ảnh bối cảnh sử dụng |
| Lifestyle videos | Video trong môi trường thực |
| Product videos | Video giới thiệu sản phẩm |
| Line drawings | Bản vẽ kỹ thuật |
| 3D CAD files | File thiết kế 3D |

### 2.2 Text Content

| Nội dung | Trạng thái hiện tại | Vai trò AI |
|----------|---------------------|------------|
| Design descriptions (B2B & B2C) | ✅ Có — hiện chỉ 1 mô tả/range | 🤖 AI hỗ trợ mở rộng |
| USPs (B2B & B2C) | ❌ Chưa có | 🤖 AI tạo và duy trì |
| Care & Maintenance (theo vật liệu, theo variant) | ❌ Chưa có | 🤖 AI hỗ trợ |
| Daily Care & Maintenance (theo vật liệu, theo variant) | ❌ Chưa có | 🤖 AI hỗ trợ |
| Upholstery descriptions | Cần thu thập | — |

> **Nhận xét:** Phần lớn nội dung text hiện chưa tồn tại hoặc chưa đủ chi tiết. AI là giải pháp trọng tâm để tạo và duy trì phần nội dung này ở quy mô lớn.

### 2.3 Documents & Catalogues

**Trong phạm vi PIM (cần quản lý):**
- Range & product catalogues
- Range presentations
- Materials: round swatch dots, large images, technical sheets

**Cần cân nhắc thêm (có thể đưa vào PIM):**
- Maintenance Guide
- Technical & Compliance Directory
- Company Profile

### 2.4 Data từ D365

- Dimensions (kích thước sản phẩm)
- Designer information
- Prices (giá bán)
- Sales data theo item number

### 2.5 Assets khác — Câu hỏi mở

> *"Chúng ta có portraits, factory images, logos, v.v. được dùng trong catalogue, trên website... Những thứ này có nên được đưa vào PIM không để có thể track được chúng đang được dùng ở đâu?"*

**→ Đề xuất phân tích:** Nên đưa vào PIM ít nhất ở mức **metadata tracking** (biết asset đang được dùng ở đâu), dù không cần quản lý nội dung sâu như product asset.

---

## 3. Yêu cầu Kỹ thuật (Technical Requirements)

### 3.1 Image Engine ⭐ Ưu tiên cao

**Mục tiêu:** Upload một lần, tự động tạo ra mọi định dạng cần thiết.

- Auto-generate images với nhiều kích thước và resolution cho từng kênh:
  - Web / Webshop
  - Catalogue / Print
  - Social Media (SoMe)
- Cung cấp bộ format chuẩn để tái sử dụng

### 3.2 Automatic Updates & Channel Sync

- Khi dữ liệu sản phẩm thay đổi trong PIM → tự động cập nhật trên các kênh đã kết nối:
  - Webshop
  - Digital catalogues (iPaper)
- **Fallback:** Nếu không sync tự động được → cung cấp **update log** ghi nhận nơi dữ liệu đang được sử dụng

### 3.3 D365 Integration ⭐ Ưu tiên cao

- Mỗi item trong PIM được liên kết với sales data từ D365
- Toàn bộ material liên quan đến một item number phải:
  - Tự động khả dụng cho internal use
  - Dễ dàng gửi cho khách hàng
- **Tiềm năng:** Tự động gửi material khi toàn bộ assets đã hoàn chỉnh

### 3.4 Website Alignment

- Cấu trúc website tương lai cần được xem xét khi thiết kế PIM
- PIM phải hỗ trợ các integration với website thông qua API hoặc cơ chế phù hợp
- **→ Action:** Cần alignment sớm giữa team PIM và team Website

### 3.5 Quotation & Pricelist System

- Hệ thống báo giá và pricelist phải lấy hình ảnh/rendering **trực tiếp từ PIM**
- Mục tiêu: Chỉ duy trì một bản ảnh duy nhất — không có bản sao phân tán

### 3.6 Product Cards & QR Codes *(ngoài phạm vi trực tiếp)*

- Do Christian phụ trách
- Các product card cho từng item (kèm QR code) **phải được tích hợp vào PIM** để đảm bảo nhất quán
- **→ Action:** Phối hợp với Christian để xác định interface/API

---

## 4. Tầm nhìn Dài hạn (Long-term Vision)

### 4.1 AI & Renderings

- Tự động tạo **nhiều biến thể packshot** cho một item thông qua AI và rendering
- Tự động sinh lifestyle renderings

### 4.2 Content Automation

- AI tự động lấp đầy các khoảng trống trong:
  - Design descriptions
  - USPs
  - Care & Maintenance instructions
- Con người chỉ cần review và approve — không cần viết từ đầu

---

## 5. Phân tích Gap — Hiện tại vs. Tương lai

| Lĩnh vực | Hiện tại | Với PIM |
|----------|----------|---------|
| Lưu trữ asset | Rải rác trên nhiều hệ thống | Tập trung, cấu trúc theo Range/Master/Variant |
| Version control | Không có | Có — tracking đầy đủ |
| Text content | Thiếu (USPs, Care chưa có) | AI tạo và duy trì |
| Phân phối kênh | Thủ công | Tự động sync (webshop, iPaper, pricelist) |
| Image sizing | Resize thủ công | Image Engine tự động |
| Liên kết D365 | Rời rạc | Tích hợp trực tiếp, real-time |
| Tracking usage | Không có | Asset Link Map — biết asset dùng ở đâu |

---

## 6. Các Câu hỏi Mở cần Quyết định

| # | Câu hỏi | Mức độ ưu tiên |
|---|---------|----------------|
| 1 | Portraits, factory images, logos có được quản lý trong PIM không, hay chỉ tracking metadata? | Cao |
| 2 | Catalogues phụ (Maintenance Guide, Technical Directory, Company Profile) có nằm trong PIM không? | Trung bình |
| 3 | Website tương lai sẽ ảnh hưởng thế nào đến cách PIM tổ chức và expose dữ liệu? | Cao |
| 4 | Scope của Product Cards & QR Codes (Christian's initiative) kết nối với PIM như thế nào? | Trung bình |
| 5 | Quy trình governance: Ai là owner của từng loại content trong PIM? | Cao |

---

## 7. Tóm tắt Ưu tiên Triển khai

### Phase 1 — Core Foundation
- [ ] Cấu trúc dữ liệu theo Range / Master Number / Variant
- [ ] Upload và quản lý Visual Assets (packshots, images, CAD)
- [ ] Tích hợp D365 (sync dữ liệu sản phẩm cơ bản)
- [ ] Image Engine (auto-resize cho web, print, social)

### Phase 2 — Content & Distribution
- [ ] AI tạo text content (USPs, Care & Maintenance, Descriptions)
- [ ] Auto-sync với webshop và iPaper
- [ ] Update log / Asset Link Map
- [ ] Quotation & Pricelist integration

### Phase 3 — Advanced & Long-term
- [ ] AI Rendering — tự động tạo packshot variants
- [ ] Product Cards & QR Code integration (phối hợp với Christian)
- [ ] Website integration
- [ ] Full automation pipeline

---

> **Ghi chú tổng quát:** Tài liệu yêu cầu này phản ánh giai đoạn khám phá ban đầu — nhiều mục vẫn đang ở dạng câu hỏi mở hoặc "good to have". Bước tiếp theo nên là một buổi workshop để phân loại rõ **Must Have / Should Have / Nice to Have** và xác định MVP (Minimum Viable Product) cho Phase 1.
