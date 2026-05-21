# Quy Trình Làm Việc Của User Với Hệ Thống PIM

> Mô tả luồng công việc thực tế của từng vai trò khi sử dụng PIM hàng ngày.

---

## Tổng Quan Vai Trò

| Vai trò | Việc chính | Tần suất |
|---------|-----------|----------|
| Product Manager | Quản lý cấu trúc sản phẩm, lifecycle | Hàng ngày |
| Marketing | Viết nội dung, tạo caption, duyệt | Hàng ngày |
| Content Editor | Upload/quản lý ảnh, video, tài liệu | Hàng ngày |
| Sales | Tra cứu, tải tài liệu, chia sẻ link | Khi cần |
| Admin | Cấu hình hệ thống, user, sync | Hàng tuần |

---

## 1. Product Manager — Quản Lý Sản Phẩm

```
┌─────────────────────────────────────────────────────────┐
│  D365 sync tự động pull master data (hourly/delta)      │
│  → Products xuất hiện trong PIM với thông tin cơ bản    │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  PM mở Dashboard → thấy sản phẩm mới (completeness 20%)│
│  → Click vào product → xem thiếu gì                    │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  PM gán metadata:                                       │
│  • Chọn Range / Category                                │
│  • Thêm dynamic attributes (Material, Designer...)      │
│  • Set lifecycle status (Development → Active)          │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  PM assign task cho Marketing + Content Editor           │
│  → Notification gửi đi                                  │
└─────────────────────────────────────────────────────────┘
```

**Hàng ngày PM kiểm tra:**
- Dashboard completeness score → sản phẩm nào chưa đủ thông tin
- Sync log → D365 có lỗi gì không
- Approval queue → có gì cần duyệt cuối

---

## 2. Marketing — Viết Nội Dung & Duyệt

```
┌─────────────────────────────────────────────────────────┐
│  Marketing nhận notification "Product X cần nội dung"   │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Mở product → tab Text Content                          │
│  → Click "AI Generate" cho từng loại:                   │
│    • B2B Description                                    │
│    • B2C Description                                    │
│    • USP (3-5 bullets)                                  │
│    • Care Instructions                                  │
│  → AI (Claude Sonnet) sinh draft JSON structured        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Marketing review + chỉnh sửa draft                     │
│  → Chọn ngôn ngữ (VI, EN, DA...)                        │
│  → AI gen riêng cho từng ngôn ngữ                       │
│  → Save → status = "Draft"                              │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Quality Check tự động chạy (async):                    │
│  • Độ dài OK? ✓                                         │
│  • Brand voice score ≥0.7? ✓                            │
│  • Trùng sản phẩm khác? ✗ (warning)                    │
│  → Hiển thị badge inline                                │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Marketing submit → status = "InReview"                 │
│  → Approver nhận notification                           │
│  → Approver duyệt/reject + comment                     │
│  → Approved → status = "Published"                      │
└─────────────────────────────────────────────────────────┘
```

**Tạo caption social media:**
1. Chọn product + platform (FB/LinkedIn/TikTok)
2. Click "Generate Caption" → AI sinh caption + hashtags
3. Copy hoặc push trực tiếp qua channel

---

## 3. Content Editor — Upload & Quản Lý Assets

```
┌─────────────────────────────────────────────────────────┐
│  Editor mở product → tab Visual Assets                  │
│  → Drag & drop upload (hoặc bulk upload)                │
│    • Ảnh ≤50MB: direct upload (SAS)                     │
│    • Video/3D >50MB: resumable upload (tus.io)          │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Hệ thống tự động xử lý (Hangfire job):                │
│  • Virus scan (async)                                   │
│  • Sinh thumbnail (400px)                               │
│  • Sinh web size (1024, 2048)                           │
│  • Auto-tag bằng Florence-2 (AI)                        │
│  • Strip EXIF GPS, giữ ICC profile                      │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Editor review auto-tags → sửa/thêm tag nếu cần        │
│  → Gán asset type (packshot, lifestyle, line drawing)   │
│  → Link với variant cụ thể                              │
│  → Submit → status "InReview" → Approver duyệt         │
└─────────────────────────────────────────────────────────┘
```

**Upload tài liệu (PDF/Word):**
1. Upload file → hệ thống extract metadata (PdfPig/OpenXml)
2. Sinh thumbnail trang đầu
3. Gán vào product/range
4. Searchable qua full-text

---

## 4. Sales — Tra Cứu & Chia Sẻ

```
┌─────────────────────────────────────────────────────────┐
│  Sales mở PIM → Search bar                              │
│  → Gõ tên/mã sản phẩm (typo-tolerant)                  │
│  → Hoặc filter theo Range, Material, Designer           │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Xem product detail:                                    │
│  • Thông tin D365 (dimensions, pricing)                 │
│  • Ảnh gallery (packshot + lifestyle)                   │
│  • Text content (description, USP)                      │
│  • Documents (tech sheet, catalogue)                    │
│  • Sản phẩm tương tự (vector search)                   │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Sales actions:                                         │
│  • Download ảnh (chọn size: web/print)                  │
│  • Download tech sheet PDF                              │
│  • Tạo shareable link (JWT signed, expire 7 ngày)       │
│  • Export product package (zip ảnh + PDF + info)         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Admin — Cấu Hình & Giám Sát

```
┌─────────────────────────────────────────────────────────┐
│  Quản lý User & Role:                                   │
│  • Sync user từ Entra ID                                │
│  • Gán role (Admin, PM, Marketing, Sales, Viewer)       │
│  • Cấu hình permission per role                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Cấu hình D365 Sync:                                   │
│  • Chọn entity nào sync (products, variants, pricing...)│
│  • Set schedule per entity (15min / hourly / daily)     │
│  • Xem sync dashboard (last run, error count, lag)      │
│  • Force full resync khi cần                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Cấu hình Completeness Rules:                           │
│  • Thêm/sửa rule per product type                       │
│  • Set weight cho từng field                            │
│  • Set threshold block publish (default 80%)            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Quản lý Webhook Subscribers:                           │
│  • Thêm endpoint (webshop, iPaper, social)              │
│  • Cấu hình secret + rate limit                         │
│  • Xem delivery log + retry status                      │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Quy Trình Xuyên Suốt — Từ D365 Đến Publish

```
D365 F&O                    PIM                           Channels
─────────                   ───                           ────────
                                                          
Product created    ──sync──▶ Product appears              
                            (completeness 20%)            
                                    │                     
                            PM gán metadata               
                            Editor upload assets          
                            Marketing viết text           
                                    │                     
                            AI auto-tag, quality check    
                                    │                     
                            Approval workflow             
                            (Draft→InReview→Approved)     
                                    │                     
                            Completeness ≥80%             
                            Status = Published            
                                    │                     
                            Event published ──webhook──▶  Webshop
                                           ──webhook──▶  iPaper
                                           ──webhook──▶  Social
                                           ──link────▶   Sales share
```

---

## 7. Quy Trình AI Image (Phase 3)

```
┌─────────────────────────────────────────────────────────┐
│  User chọn product có packshot gốc                      │
│  → Click "Generate Variant"                             │
│    • Chọn màu/vải mới (từ swatch)                       │
│    • Hệ thống gọi OpenAI gpt-image-2 edit endpoint     │
│    • Trả về variant mới giữ form gốc                   │
│  → User review + approve                                │
│  → Save as new visual asset                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  User chọn "Generate Lifestyle Scene"                   │
│  → Chọn packshot + prompt mô tả scene                  │
│  → gpt-image-2 sinh lifestyle composite                 │
│  → User review + approve                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  3D Packshot (từ CAD):                                  │
│  → Upload GLB/FBX                                       │
│  → Blender headless render 8 góc + HDRi lighting        │
│  → Output: bộ packshot đa góc tự động                   │
└─────────────────────────────────────────────────────────┘
```

---

## Tóm Tắt: Một Ngày Làm Việc Điển Hình

| Thời gian | Ai | Làm gì |
|-----------|-----|--------|
| 8:00 | Hệ thống | D365 delta sync chạy, pull sản phẩm mới |
| 8:30 | PM | Check dashboard, gán metadata cho SP mới, assign task |
| 9:00 | Content Editor | Upload packshot + video cho SP được assign |
| 9:30 | Hệ thống | Auto-tag, sinh thumbnail, quality scan |
| 10:00 | Marketing | AI generate text → review → submit duyệt |
| 10:30 | PM/Approver | Duyệt text + assets → Approved |
| 11:00 | Hệ thống | Completeness ≥80% → auto-publish → webhook fire |
| 11:05 | Webshop | Nhận event → hiển thị SP mới trên web |
| 14:00 | Sales | Tra cứu SP → tạo shareable link gửi khách |
| 15:00 | Marketing | Generate caption social → post |
| 16:00 | Admin | Check sync log, review webhook delivery |

---

*Cập nhật: 2026-05-19*
