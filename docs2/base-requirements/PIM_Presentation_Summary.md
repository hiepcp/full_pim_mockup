# Tóm tắt: Product Information Management (PIM)

> **PIM + Social Campaign Module** — ASP.NET Core · React · Python AI  
> *Trình bày bởi: Product Manager · Business Analyst · Technical Manager | Tháng 5/2026*

---

## 1. Vấn đề hiện tại

Hiện tại, mỗi sản phẩm có **6+ loại tài liệu** được lưu trữ **rải rác ở 6+ nơi khác nhau**:

| Tài liệu | Loại |
|----------|------|
| 📄 PI Sheet | Thông tin sản phẩm |
| 📐 Line Drawing | Bản vẽ kỹ thuật |
| 📦 OBJ / 3D File | File 3D |
| 🧪 Product Test | Kết quả kiểm thử |
| 📸 Product Image | Hình ảnh sản phẩm |
| 🎨 Swatch / Material | Mẫu vật liệu |

**Hậu quả:** Không có version control · Không có người chịu trách nhiệm · Tốn hàng giờ tìm kiếm · Tài liệu bị phân tán trên 3+ hệ thống và không liên kết với D365.

---

## 2. Giải pháp — PIM

**PIM = một nơi duy nhất cho tất cả nội dung**, tự động đẩy sang mọi kênh phân phối.

### Nội dung được quản lý trong PIM

Mọi asset được liên kết theo cấu trúc **Range / Master Number / Variant** (giống D365):

| Loại Asset | Mô tả |
|-----------|-------|
| Packshots | Hero, pack, lifestyle, tất cả góc nhìn |
| Videos | Sản phẩm, lifestyle, Reels, tutorials |
| Swatches | Mẫu vật liệu, màu sắc, vải |
| CAD / 3D Files | STEP, OBJ, FBX — nguồn để AI render |
| Line Drawings | Bản vẽ kỹ thuật cho catalogue |
| PI Documents | PI sheet, spec sheet, PDF |
| AI Renders | Tự động tạo từ CAD theo từng biến thể vật liệu |
| SM Assets | Định dạng cho mạng xã hội: FB, IG, LinkedIn, TikTok |
| Text Content | Mô tả sản phẩm, USP, hướng dẫn bảo quản (AI soạn thảo) |
| Price Data | Đồng bộ tự động từ D365 |
| Lifestyle Scenes | Room shots, mood boards |
| 360° Spin Sets | Xem tương tác cho webshop (Phase 3) |

---

## 3. Tính năng nổi bật

### 🖼️ Image Engine — Upload một lần, dùng mọi kích thước
- Không cần resize thủ công
- Tự động tạo tất cả định dạng cho web, print và social
- Xử lý trong vòng **< 30 giây**

### 📱 Social Campaign Builder
- Chọn asset từ PIM → AI viết caption → Lên lịch và đăng lên tất cả nền tảng trong một luồng

### 🗺️ Asset Link Map
- Biết chính xác mỗi asset đang được dùng ở đâu
- Xem campaign, platform, channel nào đang sử dụng asset đó
- Kèm dữ liệu hiệu suất trực tiếp (live performance data)

### 🤖 AI thực hiện công việc nặng
- Content team chỉ cần **review + approve** — không cần gõ từ đầu
- AI Rendering: đang trong giai đoạn nghiên cứu khả thi (Phase 3)

---

## 4. Quy trình hoạt động — 7 bước

```
D365 Syncs → Upload Assets → Image Engine → AI Writes Text → Review & Approve → Completeness Check → Publish
```

| Bước | Tên | Chi tiết |
|------|-----|----------|
| 1 | D365 Syncs | Đồng bộ dữ liệu sản phẩm mỗi 15 phút |
| 2 | Upload Assets | Hình ảnh, video, CAD lên DAM |
| 3 | Image Engine | Tự động resize cho tất cả kênh |
| 4 | AI Writes Text | Mô tả, USP, hướng dẫn bảo quản |
| 5 | Review & Approve | Con người luôn review trước |
| 6 | Completeness | Kiểm tra điểm đầy đủ trước khi publish |
| 7 | Publish | iPaper · Social · Pricelist |

---

## 5. Tech Stack

### Ba dịch vụ độc lập, triển khai và scale riêng biệt

| Service | Công nghệ | Chức năng |
|---------|-----------|-----------|
| **Backend API** | ASP.NET Core 8 | REST endpoints, Hangfire jobs, D365 sync, publish iPaper/Pricelist. DB: PostgreSQL + Redis + Typesense |
| **Frontend** | React 18 + TypeScript | Admin UI, Media Hub, Campaign Builder (drag-drop), Asset Link Map dashboard, Analytics (Recharts) |
| **AI Service** | Python FastAPI | Claude API (Anthropic), text/caption/quality check, image tagging, embeddings, ML + Render pipeline (Phase 3) |

**Hạ tầng dùng chung:** Azure Blob + CDN · RabbitMQ · TimescaleDB · Redis · Docker / Kubernetes · GitHub Actions CI/CD

---

## 6. Lộ trình 3 Giai đoạn

> *Bắt đầu nhỏ, tạo giá trị nhanh, phát triển theo thời gian*

- **Phase 1:** Core PIM, Image Engine, luồng publish cơ bản
- **Phase 2:** Social Campaign Builder, Asset Link Map, AI nâng cao
- **Phase 3:** AI Rendering, 360° Spin Sets, tính năng mở rộng

---

## 7. Tại sao xây dựng ngay bây giờ?

| Lý do | Chi tiết |
|-------|----------|
| ⏱️ **Tiết kiệm thời gian** | Content team đang mất 8+ giờ/tuần chỉ để tìm đúng phiên bản file. Mỗi giờ tiết kiệm = giảm chi phí trực tiếp |
| ❌ **Nội dung sai đang live** | PI sheet cũ, bản vẽ sai phiên bản, hình ảnh không đúng đang được đăng tải. PIM enforce completeness score trước khi publish |
| 🤖 **AI đã sẵn sàng** | Claude API tạo ra mô tả sản phẩm và caption chất lượng production ngay hôm nay. Bắt đầu sớm = lợi thế cạnh tranh |
| 📈 **Social = tăng trưởng** | 100% campaign asset từ PIM, không còn bản copy local. Asset Link Map cho thấy nội dung nào đang hoạt động tốt theo thời gian thực |

---

## 8. Các bước tiếp theo

| Bước | Mốc thời gian | Nội dung |
|------|---------------|----------|
| 1 | Ngay | Stakeholder sign-off: review deck, xác nhận scope, phê duyệt ngân sách Phase 1 |
| 2 | Tuần 1–2 | Technical spikes: xác thực D365 API access, xác thực Meta API sandbox |
| 3 | Tuần 2 | Environment setup: Docker Compose với đầy đủ stack |
| 4 | Tuần 3 | Sprint 1 kick-off: Repo, CI/CD, DB schema, API scaffold |
| 5 | Tháng 3–4 | Phase 1 launch: Content team live, không còn shared drives, iPaper kéo từ PIM |
