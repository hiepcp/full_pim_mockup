# PHASE 1 — CORE PIM + SOCIAL CAMPAIGN

## Scope chốt với Stakeholder

> **PIM (Product Information Management) + Social Campaign Module**
> ASP.NET Core · React · Python AI — Bản trình bày chốt Phase 1

---

## 1. Mục tiêu Phase 1 (định nghĩa "Done")

> **PIM trở thành Single Source of Truth cho product content, đồng thời là nơi tạo & đăng campaign social — 100% asset campaign lấy từ PIM, không còn bản copy local.**

Khi kết thúc Phase 1:

- Content team làm việc 100% trên PIM, không còn tìm file rải rác trên shared drives / SharePoint.
- Mọi asset gắn với cấu trúc `Range → Item → [Mother Variant → Daughter Variant / SO Variant]`, đồng bộ từ D365.
- iPaper kéo dữ liệu trực tiếp từ PIM — luôn lấy asset phiên bản mới nhất đã được duyệt.
- Tạo & đăng được campaign social end-to-end ngay trong PIM.
- Mỗi Item có dashboard 360° tổng hợp toàn bộ asset, document, content AI và trạng thái publish.
- PI / Assembly Instruction / Shipping Mark được quản lý tập trung, có approval tracking, không còn rải rác trên SharePoint.
- Cảnh báo ngay khi material bị discontinued, tránh dùng vật liệu lỗi thời trong thiết kế mới.
- Xem được sản phẩm đã bán cho khách nào, số lượng bao nhiêu — trực tiếp trong PIM.

---

## 2. IN-SCOPE — 9 module phải làm (Must Have)

| # | Module chức năng                                                     | Nội dung cốt lõi                                                                                                                                                                                                                          |
| - | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **Product Master Data**                                          | Cấu trúc 5 cấp: Range / Item / Mother Variant / Daughter Variant / SO Variant.<br />Mapping D365 Item Number ↔ Daughter/SO Variant. <br />**Product Set** — bộ sản phẩm marketing/sales tạo thủ công (vd: Bộ bàn ghế = 4 ghế + 1 bàn), có hình riêng, không từ D365.<br />Xem chi tiết hierarchy và Product Set bên dưới                                                            |
| 2 | **Asset & Document Hub** 🔀<br />*(DAM + Document Management)* | Một nơi duy nhất quản lý mọi file gắn với sản phẩm<br />`asset_category = "media"` → Image Engine + CDN. <br />`asset_category = "document"` → approval workflow + customer linkage. <br />Version control, metadata, search |
| 3 | **Image Engine**                                                 | Upload 1 lần → auto-generate đủ size/format cho Web, Print, Social (< 30s).<br />Chỉ xử lý `asset_category = "media"`                                                                                                               |
| 4 | **D365 Integration (one-way, read-only, 15 phút)**              | Sync: Dimensions, Designer, Price, Sales data (bao gồm customer order data).<br />PIM chỉ đọc,**không push ngược** về D365                                                                                                     |
| 5 | **Basic Publish Flow**                                           | Completeness score check → Publish sang iPaper + REST API cho website.<br />CDN URL trỏ dynamic về latest-approved asset                                                                                                                  |
| 6 | **Social Campaign Module** 🆕*(Phase 2→1)*                    | Chọn asset từ PIM → AI viết caption → lên lịch & đăng đa nền tảng trong 1 luồng                                                                                                                                                 |
| 7 | **Product 360 Dashboard** 🆕                                     | View tổng hợp per Item: tất cả assets, documents, AI content, publication status, customer sales history                                                                                                                                 |
| 8 | **Material Lifecycle Management** 🆕*(Phase 2→1)*             | Lifecycle status: Active / Phasing Out / Discontinued. Auto-flag assets/products dùng material discontinued.<br />Manual replacement pointer                                                                                                |
| 9 | **Customer Sales History (basic)** 🆕*(Phase 2→1)*            | Per Item/Variant: danh sách khách đã mua, số lượng, date range — đọc từ D365 sales data đã sync.<br />Read-only                                                                                                                 |

---

### Chi tiết Module 1 — Product Hierarchy

> **Mapping thuật ngữ D365 → PIM** (xác nhận từ data thực tế `data-sample.txt` dòng 2):
> `productVariantType: "Master"` → Mother Variant | `"Child"` → Daughter Variant | `"Variant"` → SO Variant

```
Range  (vd: Alaska, Greenwood, Calia, X-Ray)
└── Item  (productCode, vd: 30317)
    ├── Mother Variant   [D365: "Master",  configId: 987/988/997/998]
    │   "Walnut, Lacquer, Leather Gr.1, Green FSC"
    │   → BOM template / pricing standard (Gr.1)
    │
    ├── Daughter Variant [D365: "Child",   configId: 9xx (965–977)]
    │   "Walnut, Lacquer, Leather Gr.2, Green FSC"
    │   → Generic grade group cho price list / catalogue
    │
    └── SO Variant       [D365: "Variant", configId: 001, 002, … 116+]
        "Solid Oak, White Oil. Seat and Back Charcoal Wool Andorra 017"
        → Specific material combo — bán thật trong Sales Order
        → Có: attributes[], materials/BOM[], externalItemId (customer's item code)
```

#### Mô tả từng cấp

| Cấp | Tên (PIM) | D365 type | configId pattern | Mô tả | Assets / Docs |
|-----|----------|-----------|-----------------|-------|--------------|
| 1 | **Range** | `productRange` field trên SO | — | Nhóm sản phẩm: Alaska, Greenwood, Calia… | Range catalog images, branding |
| 2 | **Item** | `productCode` | — | Sản phẩm, vd: `30317`. Đơn vị quản lý chính trong PIM | Line Drawing · OBJ/3D · Swatch · Rendering · Test Reports · Certifications · Compliance |
| 3 | **Mother Variant** | `"Master"` | 987, 988, 997, 998 | BOM template — định nghĩa grade chuẩn (Gr.1). BOM team owns | BOM · Material specs |
| 4 | **Daughter Variant** | `"Child"` | 9xx (965–977) | Generic grade group cho price list (Gr.2). Không specific material | PI (per Variant + Packing attribute) |
| 5 | **SO Variant** | `"Variant"` | 001, 002, … 116+ | Specific finish/material combo — item bán thật trong SO | Packshot (nếu riêng) · Assembly Instruction (Variant × Customer) · Shipping Mark (Customer × Variant) |

> **✅ Quyết định #13 — ĐÃ GIẢI QUYẾT từ data thực tế:** Daughter Variant (`"Child"`) và SO Variant (`"Variant"`) là **2 entity riêng biệt về business rule** trong D365, nhưng **DB schema dùng 1 bảng `product_variants` với cột `type ENUM('mother', 'daughter', 'so_variant')`** — tránh 3-way JOIN không cần thiết vì core fields overlap cao. Field đặc thù SO Variant (`external_item_id`, `customer_id`) để nullable.

#### Mapping D365 fields ↔ PIM

| D365 field | Giá trị ví dụ | PIM entity / field |
|-----------|--------------|-------------------|
| `productCode` | `30317` | Item |
| `productVariant` | `30317-001` | SO Variant (productCode + "-" + configId) |
| `productVariantType = "Master"` | `30317-997` | Mother Variant |
| `productVariantType = "Child"` | `30317-975` | Daughter Variant |
| `productVariantType = "Variant"` | `30317-001` | SO Variant |
| `attributes[].attributeTypeName` | `Wood Surface`, `Packing`, `Upholstery type`, `Primary Metal Surface` | Variant attributes — sync từ D365 |
| `materials[].materialCode` | `WOODWO-00003`, `FABWFR-00043`, `BOXSJL31256/006` | Material entity (BOM component) |
| `materials[].costGroupId` | `PAINTING`, `PACK`, `HARDWARE`, `WOOD-OAK`, `FAB-LEA`, `METAL-RAW` | Material category |
| `externalItemId` | `836 00201` (John Lewis's code) | Customer-specific item ref trên SO Variant |
| `productRange` | `Greenwood` | Range |
| `areaId` | `cog` (item list) / `rvn` (SO) | Area / region |

#### Asset & Document ownership per cấp

| Asset / Document | `asset_category` | Cấp gắn | Ghi chú |
|-----------------|-----------------|---------|---------|
| Line Drawing | `media` | Item | Chung toàn item |
| OBJ/3D File | `media` | Item | Chung toàn item |
| Swatch / Material sample | `media` | Item | Có thể có thêm per SO Variant |
| Rendering | `media` | Item | Chung; per SO Variant nếu finish khác nhau rõ rệt |
| Packshot / Lifestyle image | `media` | Item (default) hoặc SO Variant | Tùy biến thể có ảnh riêng |
| BOM | `document` | Mother Variant | Sync từ D365 `materials[]`; `costGroupId` phân loại nhóm vật tư |
| PI Sheet | `document` | SO Variant + Packing attribute | `Packing` attribute từ D365: `Green FSC`, `Supreme Green JL FSC`… Shared giữa SO Variants cùng Packing |
| Assembly Instruction | `document` | SO Variant × Customer | `externalItemId` là customer's item code để reference |
| Shipping Mark | `document` | SO Variant × Customer | Per đơn hàng |
| Test Report | `document` | Item | Áp dụng toàn Item |
| Certification | `document` | Item | Áp dụng toàn Item |
| Compliance record (EU/US) | `document` | Item | Áp dụng toàn Item |

#### Material entity (standalone)

Từ D365 `materials[]` trong SO data, Material có cấu trúc:

| D365 field | Ví dụ | PIM field |
|-----------|-------|-----------|
| `materialCode` | `WOODWO-00003`, `FABWFR-00043` | `material_code` (unique key) |
| `materialName` | `Wood, American White Oak, 4/4 3C` | `material_name` |
| `materialType` | `CARTON`, `HARDWARE`, `HONEYCOMB`, `EPE FOAM`, `METAL` | `material_type` |
| `costGroupId` | `WOOD-OAK`, `FAB-LEA`, `PACK`, `PAINTING`, `HARDWARE` | `cost_group` |

Material là entity **standalone** trong PIM — không gắn với Item, được reference bởi BOM của Mother Variant. Đây là đơn vị quản lý lifecycle ở Module 8 (Active / Phasing Out / Discontinued).

---

### Chi tiết Product Set (sub-feature của Module 1 — Product Master Data)

> **Product Set** là bộ sản phẩm do marketing/sales tạo thủ công trong PIM, **không đến từ D365** và **không nằm trong hierarchy 5 cấp**. Ví dụ: "Bộ bàn ghế Alaska" = 4 × ghế 30317 + 1 × bàn 30445.

#### Lý do đặt trong Module 1, không tạo module riêng

- Product Set vẫn là "product" về bản chất — cần publish flow, cần assets, cần SEO fields → tái dùng toàn bộ infrastructure Module 1 và Module 5.
- Không liên quan D365 sync, không làm rối hierarchy 5 cấp.
- UI đặt dưới tab "Product Sets" trong Product Master Data — không phình số module.

#### Schema

```
product_sets
  id, set_code, set_name
  description, marketing_notes
  status          : "draft" | "published"
  cover_image_asset_id  (FK → assets)
  created_by      (FK → users)
  created_at, updated_at

product_set_items
  id
  set_id          (FK → product_sets)
  item_id         (FK → products, cấp Item)
  quantity
  sort_order
```

> **Gắn ảnh:** cover image của Set là asset thông thường trong Asset & Document Hub (`asset_category = "media"`), đi qua Image Engine như mọi ảnh sản phẩm khác.

#### Luồng làm việc

```
1. Marketing/Sales tạo Product Set (tên, mô tả)
      ↓
2. Thêm Item thành phần + số lượng (search theo Item code / tên)
      ↓
3. Upload ảnh bộ sản phẩm → Image Engine xử lý auto-generate variants
      ↓
4. Save Draft → Publish (qua Basic Publish Flow)
```

#### Scope P1 vs Phase 2

| Feature | P1 | P2 |
|---------|----|----|
| Tạo / sửa / xoá Product Set | ✅ | — |
| Thêm Item thành phần + số lượng | ✅ | — |
| Upload ảnh Set → Image Engine | ✅ | — |
| Publish Set qua Basic Publish Flow | ✅ | — |
| Hiển thị Set trong Product 360 Dashboard của Item thành phần | ✅ | — |
| Giá tổng tự động tính từ giá các Item | ❌ | ✅ |
| Set chứa Variant cụ thể (thay vì Item level) | ❌ | ✅ |
| AI generate mô tả bộ sản phẩm | ❌ | ✅ |

---

### Chi tiết Module 2 — Asset & Document Hub

Một upload flow duy nhất, phân nhánh hành vi theo `asset_category`:

```
Upload file
    ├── asset_category = "media"
    │     └── → Image Engine (resize/format) → Azure Blob → CDN → Publish Flow
    └── asset_category = "document"
          └── → Azure Blob → Approval Workflow → Download only
```

#### Schema chung

```
Asset {
  -- shared --
  id, name, file_url, version, owner, created_at
  asset_category : "media" | "document"
  linked_to      : [{ entity_type: "range"|"item"|"mother_variant"|"daughter_variant", entity_id }]
  tags[]

  -- media only --
  resolution?, color_space?, format_outputs[]

  -- document only --
  doc_type?        : "bom" | "pi" | "assembly_instruction" | "shipping_mark"
                   | "test_report" | "certification" | "compliance_test" | "other"
  customer_id?     (AI, SM)
  packing_type?    (PI)
  approval_status? : "draft" | "pending_internal" | "pending_customer" | "approved"
  effective_date?, expiry_date?
}
```

#### Media assets — danh sách loại

| Loại                     | Xử lý Image Engine | Publish ra ngoài               |
| ------------------------- | -------------------- | ------------------------------- |
| Packshot                  | ✅                   | Website, iPaper, Social         |
| Lifestyle image           | ✅                   | Website, iPaper, Social         |
| Line Drawing              | ✅ (PDF → image)    | iPaper, catalogue               |
| Rendering                 | ✅                   | Website, iPaper                 |
| Swatch / Material sample  | ✅ (thumbnail)       | Website, iPaper                 |
| CAD / OBJ / 3D File       | ❌ (lưu gốc)       | Download only (P1)              |
| Video                     | ❌ (lưu gốc)       | CDN direct (P1)                 |
| Portrait / Campaign image | ✅                   | Social (Social Campaign Module) |

#### Document assets — approval workflow

| doc_type                 | Gắn theo                       | Approval flow                                                         | Ghi chú                                           |
| ------------------------ | ------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| `pi`                   | Daughter Variant + Packing Type | Không cần approve                                                   | PI thay đổi → cảnh báo BOM cần update        |
| `assembly_instruction` | Daughter Variant × Customer    | Draft → Pending Internal (Christian) → Pending Customer → Approved | Bắt buộc nếu design mới                        |
| `shipping_mark`        | Daughter Variant × Customer    | Draft → Pending Customer → Approved                                 | Một số customer flag "no approval required"      |
| `bom`                  | Mother Variant                  | Không cần approve trong PIM (D365 owns)                             | Upload để tham chiếu                            |
| `test_report`          | Item                            | Không cần approve                                                   | Upload + version                                   |
| `certification`        | Item                            | Không cần approve                                                   | Có expiry_date (hiển thị, chưa auto-notify P1) |
| `compliance_test`      | Item                            | Không cần approve                                                   | Tag standard: EU / US                              |

#### Non-product assets (standalone)

Material entity và non-product assets (portrait, campaign image, cover, marketing material) tồn tại độc lập không gắn với Item. Chúng vẫn dùng chung upload flow và schema, chỉ `linked_to = []`.

---

### Chi tiết Module 3 — Image Engine

> **Chỉ xử lý `asset_category = "media"`** — document không đi qua Image Engine.
> Nguyên tắc cốt lõi: upload 1 lần → lưu file gốc bất biến → background worker sinh đủ variant → CDN phân phối.

#### Input — định dạng hỗ trợ

| Format | Ghi chú |
| ------ | ------- |
| JPG / JPEG | Chuẩn chính |
| PNG | Hỗ trợ transparency |
| WEBP | Upload thẳng định dạng web |
| TIFF / TIF | Single-page & multi-page (Line Drawing, scan độ phân giải cao) |
| PDF | Chỉ dùng cho Line Drawing — convert trang đầu → image |
| BMP | Hỗ trợ, tự convert |

**Validation rules:**

| Rule | Giá trị |
| ---- | ------- |
| Max file size | 500 MB (configurable) |
| Min dimension | 500 × 500 px |
| Max dimension | 20 000 × 20 000 px |
| MIME validation | Bắt buộc |
| Corrupted file check | Bắt buộc |

#### Output Variants — sinh tự động sau upload

| Variant | Resolution | Format | Dùng cho |
| ------- | ---------- | ------ | -------- |
| `original` | Gốc, không sửa | như upload | Lưu trữ · download · re-process |
| `thumbnail` | 300 × 300 px | WEBP | Danh sách / grid / gallery trong PIM |
| `preview` | Max 2 000 px (chiều dài) | JPG / WEBP | Xem chi tiết asset trong PIM |
| `web` | Max width 1 200 px | JPG / WEBP | Website REST API |
| `facebook_feed` | 1 200 × 630 px | JPG | Social Campaign → Facebook |
| `instagram_square` | 1 080 × 1 080 px | JPG | Social Campaign → Instagram (post) |
| `instagram_portrait` | 1 080 × 1 350 px | JPG | Social Campaign → Instagram (portrait) |
| `print` | 300 DPI, giữ ratio | TIFF / JPG | iPaper / catalogue print |

> **Crop behavior:** Thumbnail và social variants dùng center-crop thông minh (không méo tỉ lệ). Không tự động thay đổi vùng crop ở P1 — manual crop là Phase 2.

#### Processing Pipeline — async background worker

```
Upload file
    ↓
Validate (format · size · dimension · MIME · corrupt)
    ↓
Store original → Azure Blob /original
    ↓
Tạo ImageProcessingJob (status = Pending)
    ↓
API trả về ngay: { assetId, processingStatus: "pending" }
    ↓
[Background Worker — Hangfire]
    ├── Extract metadata (width, height, DPI, color_space, page_count)
    ├── Generate thumbnail  → /thumbnail
    ├── Generate preview    → /preview
    ├── Generate web        → /web
    ├── Generate print      → /print
    ├── Generate social variants → /social/fb · /social/ig_sq · /social/ig_pt
    ├── [TIFF multi-page] → convert từng page → /pages/page_N_preview · page_N_thumb
    └── Apply watermark (optional, không sửa original)
    ↓
Update Asset status = "ready" | "failed"
    ↓
CDN invalidate cache nếu update asset đã có
```

**UI behavior trong lúc chờ:**

- Status `pending` / `processing` → hiển thị placeholder + spinner
- User vẫn có thể download original nếu được phân quyền
- Status `failed` → nút "Retry" + xem error detail

#### Processing Status

```
Uploaded → Pending → Processing → Ready
                                → Failed → Retrying → Ready | Failed (max retry)
```

| Status | Mô tả |
| ------ | ----- |
| `pending` | Job đã tạo, chưa có worker nhận |
| `processing` | Worker đang xử lý |
| `ready` | Tất cả variants đã sinh xong |
| `failed` | Lỗi sau max retry |
| `unsupported` | Format không hỗ trợ tạo preview |

**Retry policy:** Max 3 lần · delay 1 min → 5 min → 15 min.

#### Xử lý TIFF multi-page (Line Drawing)

| Loại | Xử lý |
| ---- | ----- |
| Single-page TIFF | Như ảnh thường — sinh preview + thumbnail |
| Multi-page TIFF | Mỗi page → `page_N_preview.jpg` + `page_N_thumb.webp` · lazy-load trong UI |

> **Không render file TIFF gốc trực tiếp trên UI** — browser hỗ trợ kém. UI chỉ hiển thị các bản đã convert.

#### Azure Blob Storage — cấu trúc thư mục

```
product-assets-public/
└── assets/{assetId}/
    ├── original/      ← file gốc, không bao giờ sửa
    ├── thumbnail/
    ├── preview/
    ├── web/
    ├── print/
    ├── social/
    │   ├── facebook_feed.jpg
    │   ├── instagram_square.jpg
    │   └── instagram_portrait.jpg
    └── pages/         ← chỉ có với TIFF multi-page
        ├── page_1_preview.jpg
        └── page_1_thumb.webp

product-assets-private/
└── assets/{assetId}/  ← draft images, internal assets
```

> **CDN Dynamic Alias** (liên kết với Module 5 — Publish Flow): Catalogue và iPaper không lưu URL vật lý. Mọi tham chiếu đi qua alias `asset/{assetId}/{variantType}/latest-approved` → Asset Resolver Service tự resolve sang version mới nhất đã approve → CDN URL. Upload version mới không làm vỡ catalogue.

#### Public vs Private asset

| Visibility | Dùng cho | Truy cập |
| ---------- | -------- | -------- |
| `public` | Product images đã publish · website · social | CDN URL trực tiếp |
| `private` | Draft · internal marketing · supplier images | Signed URL (TTL configurable) hoặc proxy API |

#### Watermark (optional P1)

- Chỉ áp dụng lên generated variants, **không bao giờ sửa original**.
- Config per-use-case: position (TopLeft/TopRight/BottomLeft/BottomRight/Center) · opacity · scale · padding.
- Social variants: tắt watermark mặc định (Marketing tự kiểm soát khi tạo post).

#### Non-functional requirements

| NFR | Giá trị |
| --- | ------- |
| Upload response time | < 3 giây (không kể background processing) |
| Tổng thời gian xử lý (standard image) | < 30 giây |
| Xử lý bất đồng bộ | Bắt buộc — không block UI |
| Original không bao giờ bị sửa | Bắt buộc |
| Idempotent processing | Bắt buộc — retry an toàn |
| Scale Image Processing Worker độc lập | Bắt buộc |
| Capacity | ≥ 1 triệu assets |

#### P1 vs Phase 2

| Feature | P1 | P2 |
|---------|----|----|
| Upload + validate + store original | ✅ | — |
| Auto-generate tất cả variants (thumbnail → social) | ✅ | — |
| TIFF multi-page conversion | ✅ | — |
| Watermark (optional) | ✅ | — |
| Public / Private asset + signed URL | ✅ | — |
| CDN dynamic alias | ✅ | — |
| Retry failed jobs | ✅ | — |
| Processing status tracking | ✅ | — |
| Manual crop / focal point | ❌ | ✅ |
| AI Background Removal | ❌ | ✅ |
| AI Smart Crop | ❌ | ✅ |
| AI Auto Tagging | ❌ | ✅ |
| Marketplace-specific variants | ❌ | ✅ |
| OCR metadata extraction | ❌ | ✅ |
| Image version comparison UI | ❌ | ✅ |
| Video transcoding | ❌ | ✅ |

---

### Chi tiết Module 8 — Material Lifecycle Management

| Feature                                                   | P1                                                | P2 |
| --------------------------------------------------------- | ------------------------------------------------- | -- |
| Lifecycle status field trên Material entity              | ✅`Active` / `Phasing Out` / `Discontinued` | — |
| Auto-flag tất cả assets dùng material discontinued     | ✅                                                | — |
| Warning trên Product 360 Dashboard                       | ✅ "X materials đang Discontinued"               | — |
| Manual replacement pointer (`replaced_by: material_id`) | ✅                                                | — |
| Auto-replacement workflow (notify, reassign, approve)     | ❌                                                | ✅ |
| Expiry date + advance warning (30/60/90 ngày)            | ❌                                                | ✅ |

---

### Chi tiết Module 9 — Customer Sales History (basic)

- **Nguồn dữ liệu:** D365 Sales data — đã có trong sync pipeline (Module 4), không cần integration mới
- **View:** Tab "Sales" trong Product 360 Dashboard
- **Hiển thị:** Customer name · Order quantity · Order date range · Item Number
- **Scope giới hạn P1:** Read-only, không show giá, không CRM notes, không contact history
- **Phase 2:** Full CRM history, open opportunities, customer-specific pricing, contact integration

---

### Social Campaign Module

Marketing tạo và đăng campaign social **hoàn toàn trong PIM** — không cần xuất file, không dùng tool riêng.

#### Khái niệm cốt lõi

| Khái niệm | Là gì | Ví dụ |
|-----------|-------|-------|
| **Campaign** | Một đợt truyền thông có chủ đề, gồm nhiều posts lên lịch sẵn | "Alaska Launch Q3", "Christmas 2025" |
| **Post** | Một lần đăng cụ thể lên 1 hoặc nhiều platform | 1 ảnh + caption → FB + IG lúc 9:00 thứ Hai |
| **Asset nguồn** | Ảnh lấy thẳng từ PIM — product hoặc non-product (portrait, lifestyle, cover) | Ảnh ghế Alaska 30317 đã qua Image Engine |

> Campaign **không bắt buộc** — Marketing có thể tạo standalone post nhanh mà không cần tạo Campaign trước.

#### Luồng làm việc end-to-end

```
1. Tạo Campaign (tên, date range, mục tiêu)
      ↓
2. Thêm Post: chọn asset từ PIM (drag-drop)
      ↓
3. AI tự generate caption dựa trên thông tin product + image
      ↓
4. Marketing review & chỉnh caption nếu cần
      ↓
5. Submit → Pending Review → Approved
      ↓
6. Schedule (chọn ngày giờ) hoặc Publish ngay
      ↓
7. PIM đăng lên FB / IG — lưu post_id để tracking Phase 2
```

#### 3 loại Campaign thường dùng

| Loại | Ví dụ | Asset nguồn |
|------|-------|-------------|
| **Product Launch** | "Alaska Range Launch Q3" | Product images (Item / SO Variant) |
| **Seasonal / Promo** | "Christmas 2025", "Summer Sale" | Mix product + lifestyle |
| **Brand / Lifestyle** | "Behind the Brand", lookbook | Non-product: portrait, campaign cover |

#### Caption approval flow

```
Draft → Pending Review → Approved → Scheduled → Published
                                              ↓ nếu lỗi API
                                            Failed (retry thủ công)
```

> Caption **bắt buộc human-approve** trước khi đăng — AI generate là bước hỗ trợ, không tự động publish.

#### Platform Phase 1

| Platform | Phase 1 | Ghi chú |
|----------|---------|---------|
| Facebook | ✅ | Meta Business API |
| Instagram | ✅ | Cùng Meta App — review 3–6 tuần |
| LinkedIn | ❌ Phase 2 | |
| TikTok | ❌ Phase 2 | |

**Format hỗ trợ P1:** Single image + Carousel. Video / Reels / Story → Phase 2.

#### Rủi ro cần stakeholder biết

> ⚠️ Meta App Review mất **3–6 tuần** ngoài tầm kiểm soát của team. **Plan B:** launch toàn bộ PIM core trước, bật Social Module sau khi Meta approve. Cần nộp review ngay từ Tuần 1.

---

### Nền tảng kỹ thuật đi kèm (bắt buộc Phase 1)

Repo + CI/CD · DB schema (PostgreSQL + Redis + Typesense) · Auth/phân quyền cơ bản · Azure Blob + CDN storage · Python FastAPI + Claude API (AI Service).

---

## 3. OUT-OF-SCOPE — dời sang Phase 2/3

| Tính năng                                              | Giai đoạn | Ghi chú                                                               |
| -------------------------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| Asset Link Map đầy đủ (live performance tracking)    | Phase 2     | P1 chỉ cần publish log cơ bản                                      |
| AI text nâng cao (USP, Care, Daily Care đa biến thể) | Phase 2     | P1: AI chỉ làm Description + Caption                                 |
| Analytics dashboard (performance, Recharts)              | Phase 2     | Gắn liền Asset Link Map                                              |
| AI Rendering từ CAD                                     | Phase 3     | Còn ở giai đoạn feasibility study                                  |
| 360° Spin Sets                                          | Phase 3     | —                                                                     |
| Quotation & Pricelist tự động                         | Phase 2     | P1 chỉ expose ảnh qua API                                            |
| Product Card & QR (Christian)                            | Phase 2+    | Cần align interface                                                   |
| Website 2-chiều / realtime đầy đủ                   | Phase 2     | P1 chỉ cung cấp read API                                             |
| B2B/VIP Customer Portal                                  | Phase 3     | Portal riêng: giá riêng, catalogue, invoice, order confirmation     |
| Product lifecycle auto-propagation                       | Phase 2     | Discontinued → tự động remove khỏi website/catalogue/price list   |
| Change propagation tự động                            | Phase 2     | Range rename → auto-cập nhật tất cả docs/channels                 |
| Full CRM integration                                     | Phase 2     | P1 chỉ có basic sales quantity từ D365                              |
| Impact analysis ("where used")                           | Phase 2     | Tracking graph asset/material được dùng ở đâu                   |
| Document approval routing nâng cao                      | Phase 2     | Parallel approvers, SLA, auto-escalate, email notification engine      |
| Material expiry auto-notification                        | Phase 2     | P1 chỉ hiển thị expiry_date; auto-alert dời P2                     |
| BOM auto-update khi PI thay đổi                        | Phase 2     | P1 cảnh báo thủ công; D365 BOM update do người dùng thực hiện |
| Video transcoding / streaming                            | Phase 2     | P1 lưu gốc + CDN direct                                              |
| CAD viewer trong browser                                 | Phase 2     | P1 lưu + download                                                     |

> **Ranh giới Asset & Document Hub:** `media` → Image Engine + CDN publish. `document` → approval tracking + download. Không xử lý nội dung file (OCR, parse BOM structure) ở P1.

---

## 4. Tác động mở rộng scope

### Gộp DAM + Document Management → Asset & Document Hub

| Yếu tố                    | Tách riêng (cũ)            | Gộp (mới)                                  |
| --------------------------- | ----------------------------- | -------------------------------------------- |
| Số module                  | 10                            | **9**                                  |
| Backend CRUD                | 2 bộ duplicate               | 1 bộ dùng chung                            |
| Upload flow                 | 2 flow riêng                 | 1 flow, phân nhánh theo `asset_category` |
| Search index (Typesense)    | 2 schema riêng               | 1 schema, filter theo `asset_category`     |
| Azure Blob storage          | Dùng chung nhưng code tách | Dùng chung và code tập trung              |
| Estimate effort tiết kiệm | —                            | **~1.5–2 sprints**                    |

### Các module mới thêm từ stakeholder review

| Module                        | Estimate effort (với Claude AI)         | Rủi ro                                  | Phụ thuộc           | Khuyến nghị                                    |
| ----------------------------- | ---------------------------------------- | ---------------------------------------- | --------------------- | ------------------------------------------------ |
| Asset & Document Hub (merged) | +2–3 sprints (so với +3–4 nếu tách) | Approval workflow UI cần thiết kế kỹ | Azure Blob (đã có) | Sprint 2–4 — backbone của nhiều module khác |
| Product 360 Dashboard         | +1–2 sprints                            | Phụ thuộc module khác xong            | DAM + AI Service      | Sprint cuối                                     |
| Material Lifecycle Management | +1–1.5 sprints                          | Thấp                                    | Material entity       | Sprint 3–4                                      |
| Customer Sales History        | +0.5 sprint                              | Thấp — data có sẵn từ D365          | D365 Integration      | Sprint 5                                         |

### Tác động Social Module (giữ nguyên)

| Yếu tố    | Tác động                                    | Khuyến nghị                                    |
| ----------- | ---------------------------------------------- | ------------------------------------------------ |
| Timeline    | +3–6 tuần (Meta API review)                  | Nộp Meta App Review ngay từ tuần 1            |
| Rủi ro     | Meta approval ngoài tầm kiểm soát          | Plan B: launch PIM core trước, social bật sau |
| AI Service  | Phải sẵn sàng cho cả Description + Caption | OK — đã có trong stack                       |
| Ngân sách | Tăng do thêm Campaign Builder                | Cần stakeholder duyệt                          |

---

## 5. Các quyết định phải chốt TRƯỚC khi khóa scope

### ✅ Đã chốt — Nguyên tắc đồng bộ D365 ↔ PIM

1. **Một chiều, read-only:** PIM chỉ đọc từ D365, **không bao giờ push ngược** về D365.
2. **D365 ⊆ PIM:** Mọi trường product info trong D365 bắt buộc mirror sang PIM. PIM có thêm trường riêng.
3. **Source of Truth:** Trường từ D365 → D365 làm chủ. Trường riêng PIM → PIM làm chủ.

### Còn cần chốt (12 điểm)

| #  | Quyết định                                                                                                         | Đề xuất                                                                                |
| -- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 2  | Field mapping D365 → PIM chi tiết; xử lý trường "tranh chấp"                                                   | Lập bảng mapping                                                                        |
| 3  | Approval workflow áp dụng cho Document (PI/AI/SM) — đã rõ. Content publish có cần approve không?             | Content publish thủ công (không require approve P1)                                    |
| 4  | CAD/3D: viewer trong browser hay chỉ lưu/download?                                                                  | Lưu + download ở P1                                                                     |
| 5  | AI text P1 chỉ làm Description + Caption?                                                                           | Có (USP/Care dời P2)                                                                    |
| 6  | Ai định nghĩa "completeness score" — trường nào bắt buộc trước khi publish?                                | Cần chốt danh sách trường                                                            |
| 7  | Social P1 hỗ trợ nền tảng nào?                                                                                   | Tối thiểu FB + IG; LinkedIn/TikTok dời P2                                              |
| 8  | Caption AI bắt buộc human-approve trước khi đăng?                                                               | Bắt buộc                                                                                |
| 9  | Material entity độc lập (`item_id` nullable)?                                                                    | Có — Material link 0..n items. Chốt trước khi viết DB schema                        |
| 10 | CDN URL strategy: static hay dynamic alias?                                                                           | Dynamic alias — catalogue luôn lấy latest-approved                                     |
| 11 | Ownership & governance: ai là PIM Platform Owner? Ai approve content?                                                | Phải chốt trước khi thiết kế permission model                                       |
| 12 | Shipping Mark: danh sách customer "no approval required" lưu ở đâu?                                              | PIM flag per customer (P1); sync từ CRM (P2)                                             |
| 13 | **Daughter Variant và SO Variant là cùng 1 entity hay 2 entity riêng?** D365 Item Number map về cấp nào? | Cần BOM team + Sales confirm. Ảnh hưởng trực tiếp DB schema và cách link PI/AI/SM |

---

## 6. Tiêu chí nghiệm thu Phase 1 (Success Criteria)

- ✅ Content team ngừng dùng shared drive / SharePoint cho asset và documents
- ✅ Tìm đúng phiên bản asset hoặc document < 1 phút từ 1 giao diện duy nhất
- ✅ D365 sync chạy ổn định mỗi 15 phút
- ✅ iPaper pull asset trực tiếp từ PIM — catalogue luôn hiển thị phiên bản mới nhất đã duyệt
- ✅ Image Engine xử lý media asset < 30s
- ✅ Tạo & đăng 1 campaign social end-to-end từ PIM lên FB + IG
- ✅ Mỗi Item có Product 360 Dashboard đầy đủ: assets, documents, AI content, publish status, customer sales
- ✅ Tạo Product Set (bộ sản phẩm), gắn Item thành phần + số lượng, upload ảnh Set và publish được qua Basic Publish Flow
- ✅ Upload PI gắn Daughter Variant + Packing Type; cảnh báo khi PI thay đổi ảnh hưởng BOM
- ✅ Assembly Instruction có approval flow: Draft → Pending Internal → Pending Customer → Approved
- ✅ Shipping Mark có approval tracking, flag "no approval required" per customer
- ✅ Material discontinued → tất cả assets/products liên quan hiển thị warning flag ngay lập tức
- ✅ Xem được customer đã mua + số lượng per product từ D365 data

---

## 7. Timeline & Next Steps

*Deadline linh hoạt — chưa chốt ngày cụ thể mới.*

| Mốc                     | Thời gian    | Việc                                                                                         |
| ------------------------ | ------------- | --------------------------------------------------------------------------------------------- |
| Sign-off                 | Ngay          | Chốt 9 module + duyệt ngân sách;**chốt Quyết định #9, #10, #11, #13**           |
| Technical spikes         | Tuần 1–2    | D365 API access + nộp Meta App Review + spike CDN dynamic alias                              |
| Sprint 1                 | Tuần 3–4    | Infra, CI/CD, DB schema (hierarchy 5 cấp + Asset unified schema + Material lifecycle status) |
| Sprint 2–3              | Tuần 5–8    | Product Master Data + D365 Integration + Asset & Document Hub (media flow)                    |
| Sprint 3–4              | Tuần 7–10   | Asset & Document Hub (document flow: PI/AI/SM approval) + Image Engine                        |
| Sprint 4–5              | Tuần 9–12   | Material Lifecycle + Customer Sales History + Publish Flow                                    |
| Sprint 5–6              | Tuần 11–14  | Social Campaign Module (chờ Meta approval) + AI Service                                      |
| Sprint cuối             | Tuần 13–16  | Product 360 Dashboard + Integration test + Bug fix + UAT                                      |
| **Phase 1 Launch** | **TBD** | Tất cả 9 module live                                                                        |

---

## 8. Tech Stack (tham chiếu)

| Service     | Công nghệ           | Chức năng P1                                                                                                             |
| ----------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Backend API | ASP.NET Core 8        | REST, Hangfire jobs, D365 sync, publish iPaper, social publish, unified asset/document storage API, approval status engine |
| Frontend    | React 18 + TypeScript | Admin UI, Asset & Document Hub UI, Campaign Builder, Product 360 Dashboard, Document approval tracking                     |
| AI Service  | Python FastAPI        | Claude API: Description + Caption, image tagging                                                                           |

**Hạ tầng dùng chung:** Azure Blob + CDN (dynamic alias cho latest-approved asset) · RabbitMQ · Redis · Docker / Kubernetes · GitHub Actions CI/CD

---

## 9. Yêu cầu từ Stakeholder Review — Trạng thái xử lý

*13 yêu cầu gốc từ Leen + quyết định phase.*

| #  | Yêu cầu                                        | Quyết định      | Module                                                                        |
| -- | ------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------- |
| 1  | Customer-facing B2B/VIP portal                   | ❌ Phase 3         | Portal riêng — scope quá lớn                                              |
| 2  | Document management (BOMs, certs, PI, AI, SM…)  | ✅ Phase 1         | **Asset & Document Hub** (Module #2) — `asset_category = "document"` |
| 3  | Material lifecycle management                    | ✅ Phase 1         | **Material Lifecycle Management** (Module #8)                           |
| 4  | Product lifecycle auto-propagation               | ❌ Phase 2         | Sau khi publish flow ổn định                                               |
| 5  | Auto-propagate changes (range rename…)          | ❌ Phase 2         | Cần event-driven architecture                                                |
| 6  | Dashboard per Master                             | ✅ Phase 1         | **Product 360 Dashboard** (Module #7)                                   |
| 7  | Compliance testing records (EU/US)               | ✅ Phase 1         | Asset & Document Hub —`doc_type = compliance_test`                         |
| 8  | Customer-history (bán cho ai, bao nhiêu)       | ✅ Phase 1 (basic) | **Customer Sales History** (Module #9)                                  |
| 9  | Ownership & governance                           | ✅ Phase 1         | Quyết định #11                                                             |
| 10 | Materials as standalone entities                 | ✅ Phase 1         | Asset & Document Hub + DB schema — Quyết định #9                          |
| 11 | Non-product assets (portraits, campaign, covers) | ✅ Phase 1         | Asset & Document Hub —`linked_to = []`                                     |
| 12 | Dynamic image/document references                | ✅ Phase 1         | Publish Flow + CDN — Quyết định #10                                       |
| 13 | Impact analysis ("where used")                   | ❌ Phase 2         | Cần đủ data từ publish channels                                           |
