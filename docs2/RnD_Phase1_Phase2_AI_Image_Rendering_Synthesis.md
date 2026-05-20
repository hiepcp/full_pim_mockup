# Tổng Hợp R&D Plan Phase 1, Phase 2 và AI Image Rendering

> Tổng hợp từ `docs/Phase1_RnD_Plan.md`, `docs/Phase2_RnD_Plan.md` và `docs/AI_Image_Rendering_Overview.md`.
> Mục tiêu: gom các hướng nghiên cứu thành một bản nhìn xuyên suốt để chốt thứ tự spike, quyết định kiến trúc và rủi ro trước khi build.

## 1. Executive Summary

Hệ PIM nên được triển khai theo 3 lớp năng lực:

1. **Phase 1 - Foundation PIM**: xây nền CRUD/sync/storage/AI text cơ bản, đủ để quản lý product, asset, text content, document, dynamic attributes và publish event nội bộ.
2. **Phase 2 - Production Workflow & Intelligence**: đóng các gap vận hành quan trọng: auth/RBAC, approval workflow, search, vector similarity, D365 delta sync, outbox, AI quality/tagging và completeness score.
3. **AI Image Rendering Track - chuẩn bị Phase 3**: nghiên cứu pipeline tạo ảnh/render sản phẩm: variant đổi màu, lifestyle scene, CAD-to-packshot, upscale catalogue, image-to-3D và video social.

Trục quyết định chính:

| Area | Phase 1 quyết định nền | Phase 2 mở rộng | AI Rendering track |
|------|-------------------------|-----------------|--------------------|
| Storage | Azure Blob container per type, direct SAS, quarantine scan | Share link bằng signed JWT, revoke được | Lưu provenance, C2PA, output variant/render |
| Data model | Text revision table, EAV dynamic attributes | Workflow transition, permission, completeness rule | Metadata workflow cho generated assets |
| Integration | D365 OData full sync hourly, nextLink, Polly retry | Change tracking delta sync, multi-entity schedule | CAD/GLB/FBX import cho render |
| Events | CloudEvents + RabbitMQ, publish-after-commit | MassTransit transactional outbox + webhook/pull cursor | Event trigger render/image-generation job |
| AI | Anthropic text generation, few-shot, JSON output | Caption, image tag, quality check, vector search | Diffusion, ControlNet, ComfyUI, Blender, BG removal |
| Search | Postgres search đủ dùng ban đầu | Typesense + ChromaDB + RRF hybrid search | Visual similarity/image embedding |

## 2. Roadmap Hợp Nhất

### Phase 1 - Foundation PIM

| Capability | Deliverable chính | Khuyến nghị |
|------------|------------------|-------------|
| Visual asset storage | Blob layout, secure upload, upload pipeline | Container per type, domain-path, direct SAS cho ảnh nhỏ, tus cho video/CAD lớn |
| Text content model | Versioning, localization, approval state ban đầu | `text_content_revisions` immutable, row-per-language, status enum + history |
| Document/catalogue | PDF/Office storage, metadata extraction, thumbnail | PdfPig + OpenXml; thumbnail qua MuPDF/PyMuPDF sidecar |
| Dynamic metadata | Product attributes không cần migration | EAV với definition/value tables, partial indexes cho filter phổ biến |
| D365 connection | OAuth2, OData paging, retry | Client credentials, `@odata.nextLink`, Polly retry/backoff |
| Event publishing | Domain event nội bộ | CloudEvents, RabbitMQ topic exchange `pim.events` |
| Image engine | Resize/format từ packshot | NetVips, Hangfire job, hybrid pre-gen + on-demand |
| AI text generation | Draft description/USP/care | Claude Sonnet default, Haiku preview, file-based prompt, JSON structured |

### Phase 2 - Workflow, Search, Reliability

| Capability | Deliverable chính | Khuyến nghị |
|------------|------------------|-------------|
| Auth/RBAC | API không public, SSO, audit user | Entra ID + OIDC/PKCE, backend validate JWT, role + permission |
| Approval workflow | Duyệt text/asset/document/product | Stateless library, transition log, comments, email/in-app notification |
| Full-text search | Global search + facets | Typesense hybrid indexing: event upsert + nightly full reindex |
| Vector similarity | Sản phẩm tương tự, few-shot context | BGE-M3 text embedding, OpenCLIP image embedding, ChromaDB |
| D365 delta sync | Change tracking + full entity coverage | `d365_sync_state`, per-entity schedule, D365 wins master fields |
| Reliable subscribers | Không mất event, webhook external | MassTransit Outbox, webhook push + pull cursor fallback |
| AI caption/tag/QC | Caption social, auto-tag ảnh, check draft | Florence-2 self-host nếu có GPU; Claude fallback; async queue |
| Completeness score | Dashboard ready-to-publish | Rule config DB, cached score + JSON breakdown, block publish dưới threshold |

### AI Image Rendering Track - Chuẩn Bị Phase 3

| Workflow | Use case | Hướng POC |
|----------|----------|-----------|
| Variant đổi màu vải | Đổi màu sofa/ghế giữ form | SAM 2/BRIA mask + FLUX/SDXL inpaint + ControlNet/IP-Adapter |
| CAD-to-packshot | Render nhiều góc từ GLB/FBX | Blender headless trong Docker, HDRI lighting, camera rig |
| Lifestyle scene | Ghép packshot vào phòng mẫu | Remove BG + FLUX Kontext/AnyDoor + IC-Light relighting |
| Catalogue upscale | Ảnh đủ in 300dpi | Real-ESRGAN self-host; Magnific khi cần chất lượng cao |
| Image-to-3D | Prototype mesh từ ảnh | TripoSR self-host hoặc Meshy/Tripo3D API |
| Image-to-video | Social reel từ ảnh tĩnh | Runway/Luma/Pika/Kling hoặc open-source video diffusion khi cần kiểm soát |

## 3. Kiến Trúc Mục Tiêu Theo Lớp

### Core PIM

- PostgreSQL/TimescaleDB là nguồn dữ liệu chính.
- Dapper giữ data access mỏng, ưu tiên query rõ và migration kiểm soát được.
- EAV dùng cho attributes có định nghĩa và filter; JSONB chỉ nên dùng cho breakdown/cache/flexible metadata phụ.
- Audit nên tách khỏi business tables, gắn user sau khi Phase 2 có auth.

### Asset & Image Pipeline

- Azure Blob/Azurite lưu binary.
- Asset mới vào trạng thái `quarantine`, scan async rồi mới usable.
- Packshot upload kích hoạt Hangfire job xử lý NetVips.
- Generated/rendered asset cần metadata riêng: source asset, prompt/workflow version, model/vendor, seed, license/provenance, reviewer, approval status.

### Integration & Eventing

- Phase 1 dùng publish-after-commit để đơn giản hóa.
- Phase 2 chuyển sang MassTransit Outbox trước khi mở external subscriber.
- Chuẩn event nên giữ CloudEvents từ đầu để tránh đổi contract.
- RabbitMQ topology: topic exchange `pim.events`, routing key versioned như `pim.product.v1.updated`.

### AI Services

- AI text generation Phase 1 nên trả JSON structured và có validator.
- Phase 2 AI nên chạy async qua queue để cô lập latency/cost.
- Vector/search stack nên tách rõ:
  - Typesense cho keyword/facet/typo.
  - ChromaDB cho similarity.
  - RRF để merge kết quả.
- AI rendering nên bắt đầu dưới dạng R&D pipeline riêng, chưa gắn chặt vào core PIM cho tới khi workflow/quality/legal đủ rõ.

## 4. Spike Backlog Hợp Nhất

| ID | Priority | Spike | Kết quả cần có |
|----|----------|-------|----------------|
| S1 | P0 | Upload 1 GB qua tus + resume | Quyết upload mode cho video/CAD |
| S2 | P0 | NetVips vs ImageSharp vs Magick.NET | Quyết image processing lib |
| S3 | P0 | D365 OData `nextLink` pull 10k record | Strategy paging Phase 1 |
| S4 | P0 | RabbitMQ + CloudEvents E2E | Event contract và topology |
| S5 | P0 | Claude Sonnet vs Haiku trên 50 product | Default model text generation |
| S6 | P0 | EAV filter benchmark | Attribute schema/index strategy |
| S7 | P0 | PDF metadata + thumbnail | Document toolchain |
| S8 | P0 | Polly retry mock 429/503 | Retry pattern D365 |
| S9 | P1 | Entra ID + Refine login | ADR auth strategy |
| S10 | P1 | Stateless workflow POC | ADR workflow library |
| S11 | P1 | Typesense Vietnamese tokenization | Analyzer/schema decision |
| S12 | P1 | BGE-M3 vs OpenAI embedding | Embedding model decision |
| S13 | P1 | D365 change tracking delta token | Delta sync strategy |
| S14 | P1 | MassTransit Outbox + webhook mock | Reliable event delivery |
| S15 | P1 | Florence-2 image tagging benchmark | Vision tagging strategy |
| S16 | P1 | Completeness rules schema | Rule storage/enforcement strategy |
| S17 | P1 | RRF hybrid search utility | Merge strategy Typesense + Chroma |
| S18 | P2 | Variant đổi màu vải | AI render feasibility và quality rubric |
| S19 | P2 | Blender headless CAD-to-packshot | Stable non-AI render pipeline |
| S20 | P2 | Lifestyle scene từ packshot | Vendor/self-host comparison |
| S21 | P2 | Catalogue upscale | Cost/quality decision for print |

## 5. Decision Log Cần Đóng

| Decision | Khuyến nghị hiện tại | Chốt sau spike |
|----------|----------------------|----------------|
| Blob layout | Container per type + domain-path | S1 |
| Text versioning | Revision table immutable | Migration review |
| Dynamic attributes | EAV | S6 |
| Image processing | NetVips | S2 |
| D365 paging | `@odata.nextLink` | S3 |
| Event schema | CloudEvents 1.0 | S4 |
| Event reliability | Phase 1 publish-after-commit, Phase 2 Outbox | S14 |
| AI text model | Claude Sonnet default, Haiku preview | S5 |
| Auth provider | Entra ID, fallback Keycloak | S9 |
| Workflow engine | Stateless | S10 |
| Search engine | Typesense + nightly reindex | S11 |
| Embedding | BGE-M3 self-host, API fallback | S12 |
| Vision tagging | Florence-2 if GPU, Claude fallback | S15 |
| Completeness engine | DB-configured rule engine | S16 |
| AI render POC stack | fal.ai/FLUX for fast POC; Blender for CAD render | S18-S20 |

## 6. Rủi Ro Chéo Và Giảm Thiểu

| Rủi ro | Mức | Ảnh hưởng | Giảm thiểu |
|--------|-----|-----------|------------|
| D365 UAT không sẵn hoặc data nghèo | Cao | Chậm Phase 1/2 sync | Mock OData server + sample data song song |
| Auth để sang Phase 2 làm API public lâu | Cao | Security gap | Phase 1 bật placeholder authorization/IP allow-list; ưu tiên S9 sớm |
| GPU không sẵn cho embedding/vision/render | Cao | Chậm AI Phase 2/3 | Fallback API; booking GPU cloud theo spike |
| License ImageSharp/Ghostscript/ComfyUI/A1111 | Trung bình | Rủi ro pháp lý | NetVips cho image engine; kiểm tra license riêng cho AI render tool |
| AI hallucination nội dung sản phẩm | Trung bình | Sai fact marketing/catalogue | JSON schema, fact lock, validator, human-in-the-loop |
| AI image output vi phạm IP/brand | Trung bình | Rủi ro thương mại | Ưu tiên Firefly/Bria/OpenAI khi cần IP-safe; lưu provenance |
| Search/vector drift | Trung bình | Kết quả search sai/lạc hậu | Event upsert + nightly full reindex + collection versioning |
| Webhook subscriber chậm | Thấp-Trung bình | Queue dồn, retry bão | Worker per subscriber, rate limit, DLQ, alert |
| Storage cost CAD/video/render tăng | Trung bình | Chi phí vận hành | Lifecycle policy, cool tier sau 30 ngày, quota per asset type |

## 7. Acceptance Criteria Hợp Nhất

### Phase 1 Done Khi

1. Upload ảnh nhỏ qua direct SAS, upload file lớn qua hướng đã chốt, scan async và trạng thái asset rõ ràng.
2. Text content đa ngôn ngữ có version, status, history và query current/published nhanh.
3. D365 full sync hourly chạy ổn định 7 ngày, lỗi dưới 1%, có log/dashboard.
4. Document upload trích metadata và thumbnail trang đầu PDF.
5. Dynamic attributes tạo/sửa/xóa được, filter product theo ít nhất 2 attribute.
6. Event `product.updated` publish và consumer nội bộ nhận được.
7. Image engine sinh size phổ biến và endpoint resize/cache hoạt động.
8. AI text generation trả JSON structured dưới 30s và marketing chấp nhận phần lớn draft.

### Phase 2 Done Khi

1. Login qua Entra/Keycloak hoạt động, RBAC chặn đúng permission.
2. Approval workflow có comment, notification, audit và chống race condition.
3. Global search có typo/diacritic/facet, p95 dưới 300ms với 50k document.
4. Product similarity trả kết quả hữu ích, subjective accuracy tối thiểu 70%.
5. D365 delta sync chạy ổn định 14 ngày với đủ entity cần thiết.
6. Outbox/webhook giao event với retry, DLQ, secret rotation.
7. AI caption, image tagging và quality check chạy async, có UI warning/reasoning.
8. Completeness score có breakdown và chặn publish dưới threshold sau giai đoạn shadow.

### AI Rendering Track Ready Khi

1. Có ít nhất 3 workflow POC: variant đổi màu, CAD-to-packshot, lifestyle scene.
2. Mỗi workflow có benchmark quality/cost/latency và rubric review bởi marketing/designer.
3. Output generated asset lưu được provenance, model/vendor, prompt/workflow version và license note.
4. Chốt được ranh giới self-host vs managed API cho production.
5. Có ADR riêng cho image rendering pipeline trước khi đưa vào product workflow.

## 8. Đề Xuất Thứ Tự Thực Thi

1. **Sprint 0 / R&D nền**: S1-S8, đóng toàn bộ quyết định Phase 1 trước khi build.
2. **Phase 1 build**: storage, text model, D365 full sync, document metadata, EAV, events, image engine, AI text.
3. **Phase 2 preparation sớm**: bắt đầu S9 auth và S13 D365 delta ngay khi có môi trường khách hàng.
4. **Phase 2 build**: auth, workflow, search/vector, outbox, AI tagging/QC, completeness score.
5. **AI rendering parallel R&D**: chạy S18-S21 độc lập với core PIM; chỉ tích hợp sau khi có ADR và quality gate.

## 9. Tài Liệu Nguồn

- `docs/Phase1_RnD_Plan.md`
- `docs/Phase2_RnD_Plan.md`
- `docs/AI_Image_Rendering_Overview.md`

*Cập nhật tổng hợp: 2026-05-20.*
