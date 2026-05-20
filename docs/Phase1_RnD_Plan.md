# R&D Plan — Phase 1

> Tài liệu nghiên cứu kỹ thuật phải hoàn thành **trước khi build** Phase 1. Mỗi capability liệt kê: mục tiêu, câu hỏi mở, các lựa chọn + so sánh, khuyến nghị, POC cần làm và rủi ro.

## Phạm vi Phase 1

Hợp nhất từ [PIM_Implementation_Plan_and_Technical_Skills_Matrix.md](PIM_Implementation_Plan_and_Technical_Skills_Matrix.md) (cột "Phase 1" của mỗi feature) và roadmap trong [00_System_Overview.md §8](00_System_Overview.md):

| # | Capability | Phase 1 deliverable |
|---|------------|---------------------|
| C1 | Visual Assets — Storage | Container layout Blob, secure access, upload pipeline cơ bản |
| C2 | Text Content — Data model | Schema versioning + localization + approval state |
| C3 | Document Mgmt — Storage & indexing | Lưu trữ + metadata extraction cho PDF/Office |
| C4 | Metadata — Schema | EAV/JSON cho dynamic attributes |
| C5 | D365 — API connection & auth | OAuth2 client_credentials + OData paging + retry |
| C6 | Auto updates — Event publishing | Domain event lên broker + schema |
| C7 | Image engine — Pipeline | Resize/format từ packshot, async job |
| C8 | AI text generation — Service integration | Tạo draft description/USP/care từ prompt |

**Giả định nền (đã quyết)**: PostgreSQL/TimescaleDB · Dapper · Hangfire · RabbitMQ + MassTransit · Azurite (local) → Azure Blob (prod) · Anthropic Claude · Refine UI. R&D chỉ đào các quyết định **bên trong** mỗi capability.

---

## C1 — Visual Assets Storage

### Mục tiêu
Định nghĩa container layout, naming convention, security model và cơ chế upload chịu được file ≥500 MB (3D CAD).

### Câu hỏi mở
1. Một container chia theo asset type, hay một container theo `productId`?
2. Naming key: hash nội dung (content-addressable) hay deterministic theo `productId/assetType/uuid`?
3. Upload trực tiếp client → Blob (SAS) hay proxy qua API?
4. Cần resumable upload không (file 3D CAD có thể >500 MB, mạng VN không ổn định)?
5. Virus scan đồng bộ (block upload) hay async sau khi đã commit?

### Lựa chọn

**Container layout**

| Option | Ưu | Nhược |
|--------|-----|-------|
| A. Một container `pim-assets`, prefix theo type | Đơn giản, dễ phân quyền | Khó quota theo type |
| B. Mỗi type một container (`packshots`, `videos`, `cad`) | Quota/lifecycle tách biệt, lifecycle policy khác nhau | Nhiều SAS, code rườm |
| C. Theo môi trường + type (`prod-packshots`, `uat-videos`) | Tách rạch ròi env | Nhân số container ×3 |

**Naming key**

| Option | Đặc điểm |
|--------|----------|
| Content-addressable (`sha256/{first2}/{rest}`) | Dedup tự nhiên, immutable |
| Domain-path (`{productId}/{assetType}/{uuid}.{ext}`) | Dễ debug khi xem trên Storage Explorer |
| UUID phẳng | Đơn giản, không leak metadata qua URL |

**Upload mode**

| Option | Ưu | Nhược |
|--------|-----|-------|
| Direct + SAS user delegation | API không gánh băng thông, scale tốt | Cần CORS, validation lùi về sau (qua Event Grid trigger) |
| Proxy qua API (multipart) | Validate sớm (size, mime, virus) | API là bottleneck, timeout với file lớn |
| Resumable [tus.io](https://tus.io) | Chịu mạng yếu, pause/resume | Cần server tus (`tusdotnet`) hoặc [Uppy + Companion](https://uppy.io) |

### Khuyến nghị
- Option **B** (container per type) + **domain-path** + **direct SAS** cho ảnh ≤50 MB; **tus** + Companion cho video/CAD.
- Virus scan **async** qua Event Grid → Azure Functions (hoặc job Hangfire bằng [ClamAV.Client](https://github.com/tinodidriksen/clamav.net)). Asset đứng `quarantine` cho tới khi scan pass.

### POC
- Spike 1: upload ảnh 5 MB qua SAS direct + CORS + verify.
- Spike 2: upload file 1 GB qua tus với 3 lần ngắt mạng giả lập, kiểm chứng resume.
- Spike 3: virus scan ClamAV trong job Hangfire, đo throughput.

### Rủi ro
- SAS rò ra ngoài → giới hạn TTL ≤15 phút, IP whitelist khi prod.
- File quá lớn vượt request size limit (Kestrel default 30 MB) → cần config + kiến trúc tus.

---

## C2 — Text Content Data Model

### Mục tiêu
Schema chịu được **đa ngôn ngữ + version + duyệt** mà query nhanh và viết nhẹ.

### Câu hỏi mở
1. Versioning kiểu nào? (a) bảng `text_contents` đơn + cột `version`, (b) hai bảng `text_contents` + `text_content_revisions`?
2. Trạng thái `Draft → InReview → Approved → Published → Archived` lưu ở đâu? Cột `status` đơn giản hay event-sourced?
3. Localization: row-per-language (`(product_id, type, language_code)` unique) hay JSON `{ "vi": "...", "en": "..." }`?
4. Soft delete + audit: lưu `deleted_at`, `created_by`, `updated_by` thế nào (chưa có auth)?

### Lựa chọn

| Vấn đề | Khuyến nghị | Lý do |
|--------|-------------|-------|
| Versioning | Bảng riêng `text_content_revisions` (immutable history) + bảng `text_contents` giữ "current published" | Truy vấn current nhanh, rollback rõ ràng |
| Status | Cột enum + bảng `text_content_status_history` | Thực dụng; nếu sau này cần workflow phức tạp đã có audit trail |
| Localization | Row-per-language | Index tốt, tránh JSONB query trên hot path; dịch độc lập trạng thái duyệt |
| Audit | Trigger Postgres ghi vào `audit_log` riêng | Decouple khỏi business code |

### Cân nhắc khác
- Full-text search ở Postgres (`tsvector`) cho Phase 1, đủ dùng. Typesense để Phase 2.
- Rich text lưu HTML sanitized (server) — chọn [HtmlSanitizer (mganss)](https://github.com/mganss/HtmlSanitizer) cho .NET.

### POC
- Migration mẫu cho 1 `Product` × 3 ngôn ngữ × 2 version, kiểm tra query "lấy bản published mới nhất" có index hợp lý.
- Trigger audit + restore từ revision.

### Rủi ro
- Bùng nổ row khi nhiều ngôn ngữ × nhiều version → có cron archive bản >12 tháng.

---

## C3 — Document & Catalogue

### Mục tiêu
Lưu PDF / Word / Excel; metadata extract để search và preview.

### Câu hỏi mở
1. Trích metadata từ PDF/Office bằng gì (PdfPig, iText, OpenXML, Apache Tika qua sidecar)?
2. Sinh thumbnail PDF cho preview UI bằng gì?
3. OCR cho PDF scan (tech sheet cũ): phase 1 hay để sau?

### Lựa chọn

| Library | Phạm vi | License |
|---------|---------|---------|
| **PdfPig** | Đọc text + metadata PDF | Apache 2.0 |
| **QuestPDF** | Generate PDF (có thể dùng để render preview) | Community / Pro |
| **DocumentFormat.OpenXml** (Microsoft) | Đọc Word/Excel/PowerPoint | MIT |
| **Apache Tika** (Java sidecar) | Trích text từ ~1000 định dạng | Apache 2.0 |
| **pdf2image / Ghostscript** | PDF → PNG thumbnail | AGPL (GS) — cẩn trọng |
| **Tesseract.NET** | OCR | Apache 2.0 |
| **Azure AI Document Intelligence** | OCR + form parsing managed | Commercial |

### Khuyến nghị
- Phase 1: `PdfPig` + `OpenXml` cho metadata text; `pdf2image` (qua sidecar Python với MuPDF tránh AGPL của Ghostscript) cho thumbnail.
- OCR đẩy sang Phase 2.

### POC
- Trích metadata 20 catalogue mẫu; đo thời gian + lỗi.
- Sinh thumbnail trang đầu PDF, target <2s/file.

### Rủi ro
- License Ghostscript AGPL — không dùng trực tiếp cho closed-source. Dùng MuPDF/PyMuPDF (AGPL nhưng chỉ trong sidecar Python độc lập) hoặc thư viện thương mại.

---

## C4 — Metadata Schema (Dynamic Attributes)

### Mục tiêu
Lưu thuộc tính tự định nghĩa (Designer, Material, FabricCode...) mà không phải migration mỗi lần thêm field.

### Câu hỏi mở
1. EAV (3 bảng) hay JSONB column trên `products`?
2. Validation: ở DB (CHECK constraints) hay application (FluentValidation)?
3. Index cho filter theo attribute thường dùng (Material = "Velvet")?

### Lựa chọn

| Option | Ưu | Nhược |
|--------|-----|-------|
| **EAV** (`product_attribute_definitions` + `product_attribute_values`) | Schema rõ, query JOIN tường minh, đã có entity | Query phức tạp, phải pivot khi cần "dạng cột" |
| **JSONB** trên `products.attributes` | Đơn giản, fast write | Validation runtime, index GIN cồng kềnh khi nhiều key |
| **Hybrid**: EAV cho searchable + JSONB cho free-form | Tận dụng cả 2 | Phức tạp khi quyết định attribute đi đâu |

### Khuyến nghị
- **EAV** — phù hợp với entity hiện có (`ProductAttributeDefinition`, `ProductAttributeValue`) và yêu cầu định nghĩa thuộc tính từ admin UI.
- Dùng `data_type` trên definition (`string`, `number`, `enum`, `date`, `boolean`) + bảng giá trị có cột tương ứng (`value_text`, `value_number`, `value_date`).
- Index partial trên `(definition_id, value_text)` cho top 10 attribute filter nhiều.

### POC
- Tạo 50 definition × 1000 product × 3 attribute mỗi product (~150k row); benchmark filter "Material = X AND Designer = Y".
- Build dynamic form ở Refine cho admin tạo definition.

### Rủi ro
- Pivot UI hiển thị bảng nhiều attribute có thể chậm — cache aggregate hoặc materialized view.

---

## C5 — D365 API Connection & Auth

### Mục tiêu
Kết nối D365 F&O OData ổn định, xử lý paging + throttling + lỗi tạm thời.

### Câu hỏi mở
1. Token cache ở đâu (memory, Redis, distributed)?
2. Retry/backoff: tự code hay dùng [Polly](https://github.com/App-vNext/Polly)?
3. Paging: `$top`/`$skip` (rủi ro miss khi data thay đổi) hay `cross-company` cursor + `Prefer: odata.maxpagesize`?
4. Delta sync: D365 Change Tracking hay full + diff trong PIM?
5. Map giữa `dataAreaId` (legal entity) và records như thế nào — multi-company hay single?

### Lựa chọn

| Vấn đề | Khuyến nghị |
|--------|-------------|
| Token cache | `IMemoryCache` per-process; Redis chỉ khi scale-out (Phase 2) |
| Retry | Polly: 3 retry, exponential backoff 1s/2s/4s + jitter; circuit breaker 1 phút sau 5 lỗi liên tiếp |
| Paging | `Prefer: odata.maxpagesize=500` + `@odata.nextLink` (D365 hỗ trợ) — an toàn hơn skip/top |
| Delta | Phase 1: full sync hourly + so sánh `ModifiedDateTime` để upsert. Change tracking để Phase 2 |
| Multi-company | Lọc theo `dataAreaId` cấu hình `D365Options.DataAreaId` |

### POC
- Spike 1: pull 10k product từ UAT bằng `nextLink`, đo thời gian + memory.
- Spike 2: simulate 429/503 từ D365 (mock) → kiểm chứng Polly retry.
- Spike 3: đo throughput sync + thời gian round-trip 1 cycle hourly.

### Rủi ro
- D365 throttle (priority-based throttling) — chính sách 1 minute cooldown.
- ClientSecret lộ → bắt buộc Azure Key Vault prod, `dotnet user-secrets` dev.
- D365 entity rename giữa version → version OData URL `/data/ReleasedProductsV2`.

---

## C6 — Event Publishing (Auto Updates)

### Mục tiêu
Khi product/asset/text thay đổi, publish event lên broker để: (a) AI service phản ứng, (b) future webshop subscriber, (c) audit.

### Câu hỏi mở
1. Schema event: JSON tự do, JSON Schema, CloudEvents, AsyncAPI?
2. Topology RabbitMQ: topic exchange với routing key, hay fanout per event type?
3. Outbox pattern (đảm bảo at-least-once) hay publish-after-commit đơn giản?
4. Event versioning (v1 → v2)?
5. Đặt logic publish ở repository, service, hay domain event?

### Lựa chọn

**Schema**

| Option | Đặc điểm |
|--------|----------|
| JSON tự do | Nhanh, dễ thay đổi, không có hợp đồng |
| **CloudEvents 1.0** | Chuẩn CNCF, có lib `CloudNative.CloudEvents` cho .NET, Refine/web subscribe dễ |
| AsyncAPI doc | Documentation tốt, tooling còn yếu .NET |

**Reliability**

| Option | Đặc điểm |
|--------|----------|
| Publish-after-commit (try/catch + log) | Đơn giản, có thể mất event nếu broker down |
| **Transactional Outbox** | Bảng `outbox_messages` + worker đẩy ra broker; at-least-once đảm bảo |

### Khuyến nghị
- **CloudEvents** + envelope `{ specversion, type, source, id, time, data }`.
- Phase 1: publish-after-commit (chấp nhận 0.x% loss event), log đầy đủ. Outbox lên Phase 2 khi có subscriber bên ngoài.
- Topology: topic exchange `pim.events`, routing key `product.created`, `asset.uploaded`, `text.published`...
- Versioning: `type=pim.product.v1.created`.

### POC
- Spike: publish event khi tạo product → consumer test in ai-service nhận và log.
- Đo latency end-to-end và overhead RabbitMQ.

### Rủi ro
- Consumer chậm → queue tăng vô hạn. Cần `x-max-length` + DLQ.
- Schema breaking change → giữ v1 chạy song song khi ra v2.

---

## C7 — Image Engine Pipeline

### Mục tiêu
Khi upload packshot, tự động sinh các phiên bản: thumbnail (200/400), web (1024/2048), print (4000+). Format: JPEG (quality 85), WebP, AVIF.

### Câu hỏi mở
1. Library xử lý ảnh nào? Trade-off hiệu năng vs license?
2. Pipeline orchestration: Hangfire job hay MassTransit consumer?
3. On-demand (resize khi GET) hay pre-generate?
4. Lưu CDN thumbnail trong cùng container hay container riêng?
5. EXIF: giữ, strip, hay strip có chọn lọc (giữ ICC profile, bỏ GPS)?

### Lựa chọn

**Library**

| Lib | License | Speed | Note |
|-----|---------|-------|------|
| **ImageSharp** (Six Labors) | Six Labors Split License (commercial > $1M revenue) | Trung bình | Pure managed, dễ deploy |
| **SkiaSharp** | MIT | Nhanh | Native binding, sẵn trên Linux Docker |
| **Magick.NET** (ImageMagick) | Apache 2.0 | Chậm hơn | Tính năng phong phú, format nhiều |
| **NetVips** (libvips) | MIT | **Nhanh nhất** | Native, dùng RAM thấp với ảnh lớn |

**Orchestration**

| Option | Khi nào dùng |
|--------|--------------|
| **Hangfire** | Đơn giản, dashboard, retry built-in — phù hợp |
| MassTransit consumer | Khi cần scale-out worker khác process API |

**Generation timing**

| Option | Ưu | Nhược |
|--------|-----|-------|
| Pre-generate (eager) | Latency GET ổn định | Tốn storage, phải tái sinh nếu đổi rule |
| **On-demand + cache CDN** | Linh hoạt, ít storage | Cold cache miss chậm |
| Hybrid: pre-gen 3 size phổ biến + on-demand cho lạ | Cân bằng tốt nhất | Code phức tạp hơn |

### Khuyến nghị
- **NetVips** (libvips binding) cho hiệu năng + license MIT; ImageSharp dự phòng khi muốn pure managed.
- **Hangfire job** sau upload (event `asset.uploaded` trigger).
- **Hybrid**: pre-gen `thumb_400`, `web_1024`, `web_2048`. On-demand cho size khác qua endpoint `/api/assets/{id}?w=&fmt=&q=` + cache CDN.
- Strip EXIF GPS, giữ ICC profile.
- AVIF generation **không** chạy đồng bộ (tốn CPU); job riêng priority thấp.

### POC
- Benchmark ImageSharp vs NetVips vs Magick.NET trên ảnh 6000×4000 → 4 size + WebP + AVIF.
- Đo memory peak khi xử lý ảnh 100 MB.

### Rủi ro
- ImageSharp license trap nếu công ty doanh thu lớn → tránh từ đầu.
- libvips cần native lib trong Docker image → thêm vào `Dockerfile` (apt-get install libvips).
- AVIF encode chậm gấp 5-10 lần JPEG.

---

## C8 — AI Text Generation Service

### Mục tiêu
Sinh draft 4 loại nội dung từ prompt + thông tin sản phẩm: B2B description, B2C description, USP (3-5 bullet), Care instruction.

### Câu hỏi mở
1. Model nào (`claude-sonnet-4`, `claude-opus-4`, `claude-haiku-4`)? Trade-off chất lượng / chi phí / latency.
2. Prompt template: hard-code, file template (Jinja2), hay DB-managed prompt?
3. Context: chỉ field sản phẩm hay RAG (kéo các sản phẩm tương tự đã duyệt)?
4. Streaming response về UI hay đợi full text?
5. Cost control: max tokens, rate limit per user, cache giống prompt?
6. Output format: plain text, Markdown, JSON có structure?
7. Đa ngôn ngữ: gen tiếng Việt → dịch, hay gen trực tiếp từng ngôn ngữ?

### Lựa chọn

**Model selection**

| Model | Khi nào |
|-------|---------|
| **Claude Haiku** (rẻ, nhanh) | Bulk gen draft đầu tiên, gợi ý real-time |
| **Claude Sonnet** (cân bằng) | Production default cho draft cuối |
| **Claude Opus** (chất lượng cao) | Final polish hoặc trường hợp đặc biệt (catalogue print) |

**Prompt management**

| Option | Đặc điểm |
|--------|----------|
| Hard-code | Đơn giản, khó cải tiến |
| File templates (Jinja2 / Handlebars) | Edit không cần deploy, vẫn cần redeploy nếu trong assembly |
| **DB-managed + admin UI** | Marketing tự sửa, A/B test, có version | 

**Context strategy**

| Option | Đặc điểm |
|--------|----------|
| Field-only | Đơn giản, kết quả khá generic |
| **Few-shot** với 3-5 ví dụ approved | Cải thiện rõ rệt, chi phí token vừa phải |
| RAG qua ChromaDB embedding | Phong phú nhất; cần build vector store |

**Output**

| Format | Ưu |
|--------|-----|
| **JSON structured** (`{ "description": "...", "usps": ["...", "..."] }`) | Parse an toàn, validate dễ |
| Markdown | Đẹp, nhưng phải sanitize trước khi render |

### Khuyến nghị
- Default **Sonnet**; Haiku cho preview/typeahead.
- Phase 1: prompt **file-based** trong `ai-service`, mỗi loại 1 file `.j2`. DB-managed lên Phase 2.
- **Few-shot 3 ví dụ** lấy từ DB (text_content `Approved` cùng range/category).
- Output **JSON structured** với JSON Schema validation (`anthropic` tools API hoặc system prompt + parser fallback).
- Streaming qua Server-Sent Events ở UI Phase 2 (chưa cần ngay).
- Gen riêng từng ngôn ngữ (chất lượng tốt hơn dịch lại).
- Cost guard: `max_tokens=2000`, hard limit 100 request/user/ngày, cache LRU theo hash(prompt + product_id) TTL 24h.

### POC
- Spike 1: gen 50 description B2C cho 50 product có sẵn → marketing chấm 1-5 → so sánh Haiku vs Sonnet.
- Spike 2: few-shot với 3 ví dụ approved → đo cải thiện chất lượng (subjective rubric).
- Spike 3: cost projection 1000 product × 4 content × 3 ngôn ngữ.

### Rủi ro
- Hallucination: gắn dimensions sai sản phẩm khác → prompt phải lock fact, validator chống số liệu lạ.
- IP / license output: Anthropic Commercial Terms cho phép thương mại; vẫn cần human-in-the-loop review.
- Cost: 3000 product × 12 content × 0.01 USD ≈ 360 USD/đợt — cần ngân sách rõ.
- Latency: 10-30s/request → UI phải có skeleton + cancellation.

---

## Spike Backlog Tổng

Các POC nhỏ cần xếp lịch trước khi vào sprint chính:

| ID | Spike | Output |
|----|-------|--------|
| S1 | tus.io upload 1 GB qua API | Quyết upload mode |
| S2 | NetVips vs ImageSharp benchmark | Quyết image lib |
| S3 | D365 OData paging 10k record | Strategy paging chính thức |
| S4 | RabbitMQ + CloudEvents end-to-end | Quyết event topology |
| S5 | Claude Sonnet vs Haiku quality test | Quyết default model |
| S6 | EAV vs JSONB filter performance | Quyết schema attribute |
| S7 | PDF metadata + thumbnail (PdfPig + MuPDF sidecar) | Quyết toolchain document |
| S8 | Polly retry với D365 mock 429 | Pattern retry chuẩn |

Mỗi spike timeboxed **1-2 ngày**; output là **1 ADR** (Architecture Decision Record) ngắn trong `docs/adr/`.

---

## Acceptance Criteria Phase 1

Phase 1 chỉ kết thúc khi:

1. Upload ảnh ≤50 MB qua direct SAS thành công, sinh 3 size pre-generated, hiển thị trong UI gallery.
2. CRUD text content đa ngôn ngữ với version + status, audit log đầy đủ.
3. Sync D365 product hourly chạy ổn định 7 ngày liên tục, tỷ lệ lỗi <1%, có dashboard sync log.
4. Document upload + extract metadata + thumbnail trang đầu cho PDF.
5. Tạo / sửa / xóa attribute definition; gán giá trị; filter list product theo 2 attribute.
6. Event `product.updated` publish thành công, ai-service consume và log.
7. Image engine: gọi `/api/assets/{id}?w=400` trả ảnh đúng size, hit cache lần 2.
8. AI text gen: API `POST /api/ai/generate-text` với `productId` + `contentType` trả JSON structured trong <30s, marketing chấp nhận ≥60% draft mà không phải sửa lớn.

---

## Quyết định cần đóng trước khi build (Decision Log)

| # | Quyết định | Owner đề xuất | Deadline |
|---|------------|---------------|----------|
| D01 | Container layout Blob (B + domain-path) | Backend lead | Sprint 0 ngày 2 |
| D02 | Versioning schema (bảng riêng revisions) | DBA + BE | Sprint 0 ngày 3 |
| D03 | Image lib: NetVips | BE + DevOps | Sau S2 |
| D04 | Default Anthropic model: Sonnet | AI lead + Marketing | Sau S5 |
| D05 | Event schema: CloudEvents 1.0 | Architect | Sprint 0 ngày 5 |
| D06 | EAV cho dynamic attributes | Architect | Sau S6 |
| D07 | Strategy paging D365: nextLink | BE | Sau S3 |
| D08 | Outbox pattern: hoãn Phase 2 | Architect | Sprint 0 ngày 5 |

ADR file mẫu: `docs/adr/0001-container-layout.md` — title, context, decision, consequences, alternatives considered.

---

## Rủi ro tổng thể Phase 1

| Rủi ro | Mức | Giảm thiểu |
|--------|-----|------------|
| D365 UAT không sẵn sàng / data nghèo | Cao | Mock OData server (Prism + sample data) song song |
| Auth chưa làm trong Phase 1 → API public | Cao | Bật `RequireAuthorization` placeholder + IP allow-list nội bộ + chốt Phase 2 sớm |
| Anthropic API rate limit prod | Trung bình | Cache + queue + Haiku fallback |
| Image processing tốn CPU API container | Trung bình | Tách worker Hangfire ra container riêng nếu CPU >70% |
| License ImageSharp / Ghostscript | Trung bình | Đã chọn NetVips + MuPDF |
| Storage cost Azure Blob (CAD lớn) | Trung bình | Lifecycle policy: cool tier sau 30 ngày |
| Schema migration đau khi thay đổi EAV | Thấp | Migration test nightly + dry-run prod |

---

## Tham khảo

- [00_System_Overview.md](00_System_Overview.md) — kiến trúc tổng quan
- [PIM_Implementation_Plan_and_Technical_Skills_Matrix.md](PIM_Implementation_Plan_and_Technical_Skills_Matrix.md) — nguồn gốc Phase 1 từng feature
- [Tech_Stack_Overview.md](Tech_Stack_Overview.md) — quyết định stack
- [PIM_Entity_Gap_Analysis.md](PIM_Entity_Gap_Analysis.md) — gap entity cần Phase 1 lấp
- [AI_Image_Rendering_Overview.md](AI_Image_Rendering_Overview.md) — landscape AI rendering (chuẩn bị Phase 3)
- [D365_PIM_Field_Mapping.md](D365_PIM_Field_Mapping.md) — chi tiết mapping cho C5
- Polly: <https://github.com/App-vNext/Polly>
- CloudEvents 1.0: <https://github.com/cloudevents/spec>
- libvips: <https://www.libvips.org/>
- tus.io: <https://tus.io>

---

*Cập nhật: 2026-05-19. Tài liệu sống — bổ sung sau mỗi spike và ADR mới.*
