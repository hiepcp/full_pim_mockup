# R&D Plan — Phase 2

> Tài liệu nghiên cứu kỹ thuật cho Phase 2: nâng PIM từ "CRUD + sync cơ bản" lên "có duyệt, có search, có AI thực sự, đa kênh". Format giống [Phase1_RnD_Plan.md](Phase1_RnD_Plan.md).

## Phạm vi Phase 2

Hợp nhất từ [PIM_Implementation_Plan_and_Technical_Skills_Matrix.md](PIM_Implementation_Plan_and_Technical_Skills_Matrix.md) (cột Phase 2) + roadmap Phase 2 trong [00_System_Overview.md §8](00_System_Overview.md):

| # | Capability | Phase 2 deliverable |
|---|------------|---------------------|
| C1 | Authentication & Authorization | OIDC/JWT + RBAC, đóng gap critical từ Phase 1 |
| C2 | Approval Workflow Engine | Workflow trạng thái cho text/asset/document có gán approver |
| C3 | Typesense Full-Text Search | Index products + assets + text contents, UI search facet |
| C4 | ChromaDB Vector Similarity | Embedding pipeline, "tìm sản phẩm tương tự" |
| C5 | D365 Delta Sync & Full Coverage | Change tracking + schedule cho variants/categories/attributes/pricing/dimensions/translations |
| C6 | Outbox & External Subscribers | Reliable event delivery, webshop/iPaper subscriber, sharable links |
| C7 | AI Caption & Image Tagging & Quality Check | Sinh caption social, auto-tag asset, check chất lượng draft |
| C8 | Completeness Score Engine | Tính score per product, dashboard "ready-to-publish" |

**Giả định nền** (đã đóng từ Phase 1): PostgreSQL + Dapper + Hangfire + RabbitMQ (CloudEvents) + Anthropic Sonnet + EAV attributes + NetVips + few-shot prompt + content-addressable Blob. Phase 2 chỉ thêm/đổi khi có lý do.

---

## C1 — Authentication & Authorization

### Mục tiêu
Đóng gap critical: chặn API public, có RBAC, audit per-user, SSO cho nội bộ.

### Câu hỏi mở
1. IdP nào: **Azure AD / Entra ID**, **Keycloak self-host**, **Auth0**, hay tự build với ASP.NET Identity?
2. Token type: JWT bearer hay reference token (introspection)?
3. RBAC granularity: role-only, role + resource (Product:Edit), hay policy-based (ABAC)?
4. Frontend Refine flow: code+PKCE OAuth, hay session cookie BFF?
5. Lưu user/role ở đâu — chỉ ở IdP, hay sync về Postgres để JOIN audit?
6. Service-to-service (ai-service → pim-api): client_credentials token hay shared secret?

### Lựa chọn

**IdP**

| Option | Khi nào |
|--------|---------|
| **Azure AD / Entra ID** | Khách hàng dùng M365 (rất khả năng vì có D365), SSO sẵn có |
| Keycloak | Self-host, flexible, không vendor lock |
| Auth0 | Nhanh nhất, nhưng tốn phí khi >7000 active users |
| ASP.NET Identity | Build từ đầu — không khuyến nghị, tốn công bảo trì |

**Authorization model**

| Option | Đặc điểm |
|--------|----------|
| Role only | `Admin`, `ContentEditor`, `Marketing`, `Sales`, `Viewer` — đơn giản, đủ cho MVP |
| **Role + Permission** | Role gắn permission set; granular hơn (ví dụ `text:approve`, `asset:upload`) |
| ABAC / Policy | OPA, Casbin — khi cần điều kiện phức tạp (chỉ edit product thuộc range mình phụ trách) |

### Khuyến nghị
- **Entra ID** + OIDC code+PKCE từ Refine; backend validate JWT signature + scope.
- **Role + Permission** model: 5 role default + bảng `permissions` JSONB cho phép thêm runtime.
- BFF cookie (session HttpOnly) cho web client; bearer JWT cho ai-service và public API.
- Sync user về `users` table chỉ chứa `oid`, `email`, `display_name`, `roles[]` để FK sang audit log.

### POC
- Spike: setup Entra app registration UAT, config `Microsoft.Identity.Web` ở `pim-api`, thử login từ Refine với `@refinedev/auth0` hoặc custom auth provider.
- Đo overhead JWT validation per request.

### Rủi ro
- Khách hàng chưa có tenant Entra → fallback Keycloak Docker với realm export ready.
- Migration dữ liệu hiện tại không có `created_by` → backfill `system` cho legacy row.

---

## C2 — Approval Workflow Engine

### Mục tiêu
Workflow `Draft → InReview → Approved → Published → Archived` chạy được trên text/asset/document, có notification, audit, rollback.

### Câu hỏi mở
1. Build từ đầu (state machine code) hay dùng workflow engine (**Elsa**, **WorkflowCore**, Camunda)?
2. Workflow gắn cứng vào entity (`status` enum) hay generic (workflow definition + workflow_instance)?
3. Notification: in-app toast, email (SMTP/SendGrid), Teams webhook?
4. SLA / escalation (review quá 48h → escalate manager)?
5. Bulk approve (10 product một lần) hỗ trợ thế nào?
6. Comment/feedback chu kỳ duyệt lưu ở đâu?

### Lựa chọn

| Option | Đặc điểm |
|--------|----------|
| State machine code (Stateless lib) | Đơn giản, dễ kiểm soát, ít overhead |
| **Elsa Workflows 3.x** | Open-source, designer trực quan, support .NET native |
| WorkflowCore | Lightweight, ít tính năng |
| Camunda 8 | Mạnh nhất nhưng nặng, Java sidecar |

### Khuyến nghị
- Phase 2: **Stateless** library cho 4 workflow chuẩn (text/asset/doc/product). Code dễ review, không cần designer.
- Lên Elsa khi business muốn tự sửa workflow runtime (Phase 3+).
- Bảng `workflow_transitions` log mọi chuyển trạng thái (`from`, `to`, `actor`, `comment`, `timestamp`).
- Notification: in-app + email (qua SMTP queue Hangfire). Teams hook làm tùy chọn.
- Comment: bảng `review_comments(entity_type, entity_id, user_id, body, created_at)`.

### POC
- State machine cho `TextContent`: 5 trạng thái + 7 transition + guard (`OnlyApproverCanApprove`).
- Bulk approve UI Refine với DataGrid checkbox + action menu.

### Rủi ro
- Race condition khi 2 approver duyệt song song → optimistic concurrency với cột `version`.
- Quên thông báo → bắt buộc job Hangfire nightly check pending >SLA.

---

## C3 — Typesense Full-Text Search

### Mục tiêu
Search nhanh, typo-tolerant, faceted cho 3 collection: `products`, `visual_assets`, `text_contents`. Hỗ trợ tiếng Việt có dấu/không dấu.

### Câu hỏi mở
1. Indexing strategy: real-time (subscribe RabbitMQ event) hay batch nightly?
2. Tokenization tiếng Việt: Typesense built-in `vi` locale có đủ, hay cần ICU + custom analyzer?
3. Schema: 1 collection per entity hay 1 collection unified với field `entity_type`?
4. Permission filtering: filter ở Typesense (`scoped_search_key`) hay re-filter ở API?
5. Suggest / autocomplete dùng Typesense built-in hay Algolia-style?
6. Synonyms (sofa = ghế dài) quản lý ở đâu?

### Lựa chọn

**Indexing**

| Option | Đặc điểm |
|--------|----------|
| Subscribe event RabbitMQ → upsert Typesense | Near real-time (<5s lag), code thêm consumer |
| Batch nightly | Đơn giản, lag 24h — không phù hợp PIM |
| Hybrid: real-time + reindex full weekly | An toàn nhất |

**Schema**

| Option | Đặc điểm |
|--------|----------|
| 1 collection per entity | Dễ tune từng cái, query rõ |
| **Unified `pim_documents` với `entity_type`** | Search "1 ô tìm tất cả" dễ; phù hợp UI global search |

### Khuyến nghị
- **Hybrid indexing**: subscribe event → upsert; cron nightly full reindex chống drift.
- **2 collection**: `pim_search` (unified, cho global search) + `products_facets` (collection riêng cho list page có facet phức tạp).
- Tiếng Việt: tách 2 field — `name_vi` (locale `vi`) + `name_normalized` (đã bỏ dấu, lowercase, dùng `latinize:true`); query `query_by: name_vi,name_normalized`.
- Permission: dùng `scoped_search_key` với filter cứng theo role (ví dụ Sales chỉ thấy `status:Published`).
- Synonyms: bảng `search_synonyms` ở Postgres → sync vào Typesense API khi đổi.

### POC
- Index 5000 product từ DB → đo thời gian + dung lượng.
- Test query "ghê" tìm được "ghế" + "ghé" (typo + diacritic).
- Benchmark p95 latency với 100 concurrent search.

### Rủi ro
- Typesense single-node → mất search nếu container crash. Có replica + snapshot vào Blob nightly.
- Collection schema breaking change → rebuild index → cần job idempotent + alias swap.

---

## C4 — ChromaDB Vector Similarity

### Mục tiêu
"Tìm sản phẩm tương tự" theo nội dung (description + image). Cung cấp few-shot context cho AI generation.

### Câu hỏi mở
1. Embedding model: OpenAI `text-embedding-3-small`, Cohere, Voyage, hay open-source (`BGE-M3`, `multilingual-e5`)?
2. Image embedding: CLIP, SigLIP, hay multimodal `nomic-embed-vision`?
3. Chunk strategy: per text content, per product (concat all fields), hay per paragraph?
4. Reindex khi text/image thay đổi: full hay delta?
5. Hybrid search (vector + keyword) qua RRF (Reciprocal Rank Fusion)?
6. Metadata filter trong Chroma đủ, hay cần re-rank ở API?

### Lựa chọn

**Embedding model**

| Model | Chiều | Đa ngôn ngữ | Note |
|-------|-------|-------------|------|
| OpenAI `text-embedding-3-small` | 1536 | Tốt | Cheap ($0.02/1M token), API ổn định |
| **`BGE-M3`** (BAAI, open) | 1024 | Tuyệt — gốc Trung Quốc + tiếng Anh | Self-host, dùng `sentence-transformers` |
| Cohere `embed-multilingual-v3` | 1024 | Tuyệt | Commercial, IP-safe |
| `multilingual-e5-large` | 1024 | Tốt cho VN | Open, nhẹ |

**Image embedding**

| Model | Đặc điểm |
|-------|----------|
| **OpenCLIP ViT-L/14** | Phổ biến, đủ tốt |
| SigLIP | Mới, chất lượng cao hơn CLIP |
| `nomic-embed-vision-v1.5` | Open, multimodal cùng `nomic-embed-text` (cùng không gian → cross-modal search) |

### Khuyến nghị
- Text: **BGE-M3** self-host trong ai-service container (FastAPI worker, tải model 1 lần). Fallback OpenAI khi cần latency thấp tức thời.
- Image: **OpenCLIP ViT-L/14** trong ai-service, batch embedding 32 ảnh/lần.
- Chunk: per product, concat `name + range + description_vi + usp + attributes` thành 1 doc; thêm doc per language.
- Hybrid: lấy top-50 từ Chroma + top-50 từ Typesense → RRF → top-10 trả về.
- Reindex: trigger từ event `product.text_updated` hoặc `asset.uploaded` sau khi `Approved`.

### POC
- Embed 1000 product với BGE-M3, đo thời gian + memory.
- Cross-modal: query bằng ảnh → tìm product có description liên quan (cần `nomic-embed-vision`+`nomic-embed-text` cùng không gian).
- A/B: BGE-M3 vs OpenAI embedding trên 50 query thực tế.

### Rủi ro
- BGE-M3 cần ~2 GB RAM + GPU khuyến nghị → ai-service container phải cấp resource.
- Drift khi đổi model → versioning collection (`products_v1`, `products_v2`), migration song song.

---

## C5 — D365 Delta Sync & Full Coverage

### Mục tiêu
Phase 1 chỉ sync products full hourly. Phase 2: bật **change tracking** để delta sync, schedule **đầy đủ 7 entity** (`variants`, `categories`, `category_assignments`, `attributes`, `pricing`, `dimensions`, `translations`, `lifecycle`).

### Câu hỏi mở
1. D365 Change Tracking (`?cross-company=true&$deltatoken=...`) ổn định không?
2. Conflict resolution khi PIM edit local + D365 update đồng thời?
3. Mỗi entity sync schedule khác nhau (pricing 15 phút, translations daily) — quản lý ở đâu?
4. Backfill khi entity mới được thêm vào sync — full lần đầu rồi mới delta?
5. Soft-delete D365 (`IsDeleted=true`) phản ánh thế nào?

### Lựa chọn

| Vấn đề | Khuyến nghị |
|--------|-------------|
| Delta token storage | Bảng `d365_sync_state(entity, delta_token, last_run_at, last_count)` |
| Schedule | Hangfire recurring riêng cho mỗi entity, cron config trong `appsettings`, override qua admin UI |
| Conflict | "D365 wins" cho field master data (`name`, `master_number`); "PIM wins" cho field nội dung (`description_vi`, `usp`) — quy ước rõ trong field map |
| Soft delete | Mark `is_deleted=true`, giữ row, ẩn khỏi UI; cron 90 ngày purge |
| Backfill | Job `D365FullResyncCommand` chạy trước khi bật delta cho entity mới |

### POC
- Bật change tracking trên `ReleasedProductsV2` ở D365 UAT, lấy delta token, gen 5 record mới và verify chỉ pull về 5 record.
- Test conflict: edit description ở PIM, đồng thời D365 update name → kiểm chứng cả hai field đều giữ đúng.

### Rủi ro
- D365 throttling khi nhiều entity sync song song → stagger schedule + global rate limiter.
- Delta token expire (30 ngày không dùng) → fallback full resync tự động.

---

## C6 — Outbox & External Subscribers

### Mục tiêu
Đảm bảo event đến webshop/iPaper/social không mất; hỗ trợ retry; cấp shareable link.

### Câu hỏi mở
1. Implement outbox pattern thủ công hay dùng [MassTransit Outbox](https://masstransit.io/documentation/configuration/middleware/outbox)?
2. Subscriber bên ngoài: webhook HTTP push, hay subscriber kéo (REST + cursor)?
3. Shareable link: SAS Blob trực tiếp, hay endpoint API có signed URL JWT (kiểm soát revoke)?
4. Rate limit per subscriber?
5. Retention event log bao lâu?

### Lựa chọn

**Outbox**

| Option | Đặc điểm |
|--------|----------|
| Tự code (bảng `outbox_messages` + worker) | ~200 LoC, dễ debug |
| **MassTransit transactional outbox** | Built-in, tích hợp với consumer/producer sẵn |

**External delivery**

| Pattern | Khi nào |
|---------|---------|
| **Webhook push** | Subscriber có endpoint HTTPS, latency thấp |
| Pull cursor | Subscriber không expose endpoint, hoặc kiểm soát rate phía họ |
| Both | Phù hợp khi có nhiều subscriber khác nhau |

### Khuyến nghị
- **MassTransit Outbox** với Postgres storage (đã có DB sẵn).
- Webhook push primary, pull cursor (`GET /api/events?since={cursor}`) làm fallback.
- Shareable link: endpoint `/api/share/{token}` với JWT signed (revoke được qua bảng `share_tokens`), expire mặc định 7 ngày, cấu hình được.
- Rate limit: subscriber config bảng `webhook_endpoints(url, secret, rate_limit, retry_policy)`.
- Event retention: 90 ngày cho `outbox_messages` (đã delivered), 1 năm cho audit `event_log`.

### POC
- Setup webhook receiver mock (ngrok), publish 1000 event với 5% lỗi giả lập, verify retry + DLQ.
- Test shareable link với thu hồi giữa chừng.

### Rủi ro
- Subscriber endpoint chậm → blocking outbox worker. Mỗi subscriber 1 worker thread riêng.
- Webhook secret leak → forced rotate UI + audit IP origin.

---

## C7 — AI Caption, Image Tagging, Quality Check

### Mục tiêu
Mở rộng AI từ "gen text" sang: caption mạng xã hội, auto-tag ảnh, kiểm tra chất lượng draft trước khi gửi duyệt.

### Câu hỏi mở
1. Caption: 1 prompt cho mọi platform hay tùy chỉnh per platform (FB ngắn, LinkedIn dài, TikTok hashtag-heavy)?
2. Image tag: dùng vision model Anthropic (Claude với image input), GPT-4o-vision, hay open-source (`BLIP-2`, `Florence-2`)?
3. Quality check tiêu chí gì: độ dài, có brand voice, không có claim sai, không trùng product khác?
4. Gọi đồng bộ trong API hay queue qua RabbitMQ?
5. Streaming response cho UI có cần Phase 2?

### Lựa chọn

**Caption strategy**

- 1 prompt template + **platform-specific suffix**: `tone`, `max_length`, `hashtag_count`, `cta_style`.
- Output JSON: `{ "caption": "...", "hashtags": [...], "alt_text": "..." }`.

**Image tagging**

| Option | Đặc điểm |
|--------|----------|
| Claude Sonnet với image | Đồng bộ với stack hiện có, đắt hơn |
| GPT-4o vision | Chất lượng tag tốt, latency thấp |
| **Florence-2** (Microsoft, open) | Self-host, miễn phí scale, chất lượng tốt cho object detection + caption |
| `BLIP-2` | Cũ hơn, nhẹ |

**Quality check**

| Aspect | Cách check |
|--------|------------|
| Length | Code regex/word-count |
| Brand voice | Vector similarity với corpus "đã duyệt" của brand → score >0.7 |
| Factual accuracy | LLM judge: prompt "có claim nào sai so với spec sản phẩm bên dưới?" |
| Duplicate | Vector similarity với product khác → flag nếu >0.95 |
| Toxic / banned word | Wordlist + Perspective API (optional) |

### Khuyến nghị
- Caption: 1 template, output JSON, có `platform` enum trong request.
- Image tag: **Florence-2** self-host trong ai-service cho tag/caption cơ bản; gọi Claude khi cần mô tả phong phú.
- Quality check chạy **async** sau khi user save draft, hiển thị badge inline trong UI Refine.
- Tất cả AI request đi qua RabbitMQ queue `ai.requests` để cô lập latency, response qua `ai.responses` consumer ở pim-api.

### POC
- Florence-2 trên 100 ảnh packshot → đo precision/recall vs human tag.
- Quality check pipeline với 50 draft → confusion matrix lỗi gắn nhầm.

### Rủi ro
- Florence-2 cần GPU; nếu không có sẵn → fallback Claude Sonnet với image (đắt nhưng đơn giản).
- Quality check false positive → marketing không tin tool. Bắt buộc UI hiển thị reasoning + option dismiss.

---

## C8 — Completeness Score Engine

### Mục tiêu
Tính `completeness_score` (0-100) cho mỗi product để dashboard "ready-to-publish", chống publish thiếu thông tin.

### Câu hỏi mở
1. Công thức: weighted sum field, hay rule-based với điều kiện cứng (phải có ≥3 ảnh)?
2. Trọng số config ở DB (admin sửa) hay code?
3. Tính realtime mỗi lần CRUD hay batch nightly?
4. Khác nhau theo loại product (sofa cần 5 ảnh, swatch chỉ cần 1)?
5. Hiển thị breakdown ("mất 20 điểm vì thiếu USP tiếng Anh") thế nào?

### Lựa chọn

| Option | Đặc điểm |
|--------|----------|
| Hardcode | Nhanh, không linh hoạt |
| **Rule engine config DB** (`completeness_rules` table) | Admin sửa rule không deploy; có versioning rule |
| External rule engine (Drools / OPA) | Quá nặng cho use case này |

### Khuyến nghị
- Bảng `completeness_rules(product_type, field, weight, condition)`.
- Compute realtime trong service layer khi CRUD; cache result trong cột `completeness_score` + `completeness_breakdown` JSONB.
- Cron nightly recompute toàn bộ để bắt drift (thay đổi rule).
- API `GET /api/products/{id}/completeness` trả breakdown cho UI hiển thị.
- Block transition `Published` nếu score <80 (configurable).

### POC
- Định nghĩa 15 rule cho 1 product type (sofa); tính trên 100 product mẫu.
- UI Refine: progress bar + tooltip breakdown từng rule.

### Rủi ro
- Rule sai → score thấp ảo → block publish hàng loạt. Có chế độ shadow (compute nhưng không enforce) trong 2 tuần đầu.

---

## Spike Backlog Tổng

| ID | Spike | Output |
|----|-------|--------|
| S9 | Entra ID + Refine code+PKCE login | ADR auth strategy |
| S10 | Stateless workflow engine với 4 transition | ADR workflow lib |
| S11 | Typesense Vietnamese tokenization (dấu / không dấu) | ADR analyzer |
| S12 | BGE-M3 vs OpenAI embedding A/B | ADR embedding model |
| S13 | D365 change tracking + delta token | ADR sync strategy |
| S14 | MassTransit Outbox với webhook fanout | ADR delivery |
| S15 | Florence-2 image tagging benchmark | ADR vision model |
| S16 | Completeness rule engine schema | ADR rule storage |
| S17 | RRF hybrid search (Typesense + Chroma) | Code utility |
| S18 | Cross-modal search ảnh → text với nomic-embed | POC scope |

Mỗi spike timebox **2-3 ngày** (sâu hơn Phase 1) + ADR ngắn `docs/adr/`.

---

## Acceptance Criteria Phase 2

Phase 2 kết thúc khi:

1. Login qua Entra ID hoạt động ở Refine + pim-api validate JWT, RBAC chặn editor không xóa được product.
2. Approval workflow: text content đi qua 5 trạng thái, có comment chu kỳ duyệt, email notify approver, audit đầy đủ.
3. Global search ô đơn: type "ghê velvet" trả product + asset + text content liên quan, tốc độ p95 <300ms với 50k document.
4. "Sản phẩm tương tự" hiển thị 5 product gần nhất trên product detail; chính xác chấp nhận được (subjective ≥70%).
5. D365 delta sync chạy ổn định 14 ngày, đầy đủ 8 entity, dashboard báo `last_run` per entity, error rate <1%.
6. Webhook subscriber mock nhận 99.9% event với retry exponential, có UI quản lý endpoint + secret rotate.
7. AI caption: 1-click sinh caption FB/LinkedIn/TikTok cho product, marketing chấp nhận ≥70%.
8. Auto-tag ảnh khi upload: ≥80% tag chính xác (so với human label).
9. Quality check chạy trên mọi text draft, hiển thị warning inline; brand voice score ≥0.7 cho 80% draft đã review.
10. Completeness score hiển thị ở dashboard + product list + product detail; chặn publish khi <80 (sau 2 tuần shadow).

---

## Quyết định cần đóng (Decision Log)

| # | Quyết định | Owner đề xuất | Deadline |
|---|------------|---------------|----------|
| D09 | IdP: Entra ID (fallback Keycloak) | Architect | Sprint 5 ngày 2 |
| D10 | Workflow lib: Stateless | BE lead | Sau S10 |
| D11 | Typesense schema: 2 collection (unified + facets) | BE + FE | Sau S11 |
| D12 | Embedding: BGE-M3 self-host | AI lead | Sau S12 |
| D13 | D365 delta strategy: change tracking + state table | BE | Sau S13 |
| D14 | Outbox: MassTransit transactional | Architect | Sprint 6 ngày 1 |
| D15 | Image tagging: Florence-2 self-host | AI lead | Sau S15 |
| D16 | Completeness: rule engine config DB | PM + BE | Sprint 7 ngày 2 |
| D17 | Hybrid search: RRF top-50 + top-50 → top-10 | BE + AI | Sau S17 |

---

## Rủi ro tổng thể Phase 2

| Rủi ro | Mức | Giảm thiểu |
|--------|-----|------------|
| Entra ID setup phụ thuộc khách hàng IT | Cao | Bắt đầu sớm Sprint 5; có plan B Keycloak |
| GPU không sẵn cho self-host BGE-M3/Florence-2 | Cao | Booking GPU cloud (RunPod/fal); fallback API |
| Migration auth làm vỡ frontend hiện tại | Cao | Feature flag, deploy parallel 2 tuần |
| D365 delta token expire / change tracking bug | Trung bình | Job tự fallback full resync khi 410 Gone |
| Search drift khi rule thay đổi | Trung bình | Nightly full reindex + alias swap |
| AI cost vượt ngân sách | Trung bình | Hard cap per user + Haiku fallback |
| Workflow phức tạp khó dạy người dùng | Trung bình | Training video + tooltip inline |
| Webhook subscriber chậm làm queue dồn | Thấp | Worker per subscriber + alert khi queue >1000 |

---

## Tham khảo

- [Phase1_RnD_Plan.md](Phase1_RnD_Plan.md) — Phase 1 nền tảng
- [00_System_Overview.md](00_System_Overview.md) — kiến trúc tổng
- [PIM_Implementation_Plan_and_Technical_Skills_Matrix.md](PIM_Implementation_Plan_and_Technical_Skills_Matrix.md) — nguồn capability
- AI_Image_Rendering_Overview.md — landscape AI rendering *(tài liệu chưa có)*
- Microsoft.Identity.Web: <https://github.com/AzureAD/microsoft-identity-web>
- Stateless: <https://github.com/dotnet-state-machine/stateless>
- Typesense docs: <https://typesense.org/docs/>
- BGE-M3: <https://huggingface.co/BAAI/bge-m3>
- Florence-2: <https://huggingface.co/microsoft/Florence-2-large>
- MassTransit Outbox: <https://masstransit.io/documentation/configuration/middleware/outbox>
- D365 Change Tracking: OData `?$deltatoken=` documentation

---

*Cập nhật: 2026-05-19. Tài liệu sống — bổ sung sau mỗi spike + ADR.*
