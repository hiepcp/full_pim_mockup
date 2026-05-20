# PIM — Recommended Tech Stack (3 Phases)

> Tổng hợp lựa chọn ổn định nhất cho từng capability. Giá cả không phải ưu tiên — ưu tiên **stability, quality, production-readiness**.

---

## Phase 1 — Nền Tảng

| Capability | Recommend | Lý do |
|-----------|-----------|-------|
| **Storage** | Azure Blob (container per type) + tus.io resumable upload | Chịu file lớn (3D CAD >500MB), resume khi mạng yếu |
| **Image Processing** | NetVips (libvips) | Nhanh nhất, RAM thấp, MIT license, xử lý ảnh lớn tốt |
| **Text Versioning** | Bảng `text_content_revisions` (immutable) + row-per-language | Query nhanh, rollback rõ ràng, index tốt |
| **Dynamic Attributes** | EAV (`definitions` + `values`) | Schema rõ, admin UI tạo attribute runtime |
| **D365 Sync** | OData `nextLink` paging + Polly retry (exponential + circuit breaker) | Ổn định với throttling D365, không miss record |
| **Event Bus** | RabbitMQ + MassTransit + CloudEvents 1.0 | Chuẩn CNCF, .NET native, ecosystem mạnh |
| **AI Text Gen** | Anthropic Claude Sonnet (default) + few-shot 3 examples | Cân bằng chất lượng/latency, output JSON structured |
| **Document Extract** | PdfPig + OpenXml + MuPDF (thumbnail) | License sạch, đủ tính năng |
| **Background Jobs** | Hangfire | Dashboard, retry built-in, đơn giản |

---

## Phase 2 — Scale & Intelligence

| Capability | Recommend | Lý do |
|-----------|-----------|-------|
| **Auth** | Azure Entra ID (OIDC + code+PKCE) | SSO sẵn với M365/D365, enterprise-grade |
| **Authorization** | Role + Permission model (5 role + permission JSONB) | Granular, mở rộng runtime |
| **Approval Workflow** | Stateless library (.NET) | Đơn giản, dễ review, đủ cho 4 workflow chuẩn |
| **Full-Text Search** | Typesense (thêm khi PostgreSQL tsvector không đủ) | Typo-tolerant, tiếng Việt tốt, faceted — chỉ thêm container khi cần |
| **Vector Search** | PostgreSQL pgvector + BGE-M3 (text) + OpenCLIP ViT-L/14 (image) | Không thêm service, dùng chung DB, đủ cho <100k vectors |
| **Hybrid Search** | RRF (tsvector/Typesense + pgvector → top-10) | Kết hợp keyword + semantic, ít service |
| **D365 Delta Sync** | Change Tracking + delta token + state table | Near real-time, tiết kiệm bandwidth |
| **Event Delivery** | MassTransit Transactional Outbox + Webhook push | At-least-once guarantee, không mất event |
| **Image Tagging** | Florence-2 (chạy trong ai-service container) | Không thêm container riêng, gộp vào ai-service |
| **Quality Check** | pgvector similarity (brand voice) + LLM judge (factual) | Tận dụng DB có sẵn, tự động flag draft kém |
| **Completeness Score** | Rule engine config DB (`completeness_rules` table) | Admin sửa rule không cần deploy |

---

## Phase 3 — AI Image Rendering (gọn)

Gộp về **2 vendor chính** + 1 self-host cho 3D:

| Capability | Recommend | Lý do |
|-----------|-----------|-------|
| **Image Gen + Edit + Variant + Upscale + Lifestyle** | OpenAI gpt-image-2 | 1 API cho tất cả: generate, edit/mask, inpaint, lên 4K. Đủ cho variant đổi màu, lifestyle scene, upscale |
| **Background Removal** | OpenAI gpt-image-2 (edit + mask transparent) | Không cần vendor riêng, gpt-image-2 hỗ trợ transparent background |
| **3D → Packshot** | Blender headless (Python script, Docker) | Deterministic, không cần AI, kết quả ổn định |
| **Video từ ảnh** | OpenAI Sora 2 (khi cần) | Cùng ecosystem OpenAI, chỉ dùng khi thực sự cần video |

> **Tổng Phase 3: chỉ thêm 1 container** (`blender`) + gọi API OpenAI. Không thêm Photoroom, Magnific, Runway, fal.ai, ComfyUI, RunPod.

---

## Infra Xuyên Suốt (tối giản)

| Component | Choice | Ghi chú |
|-----------|--------|--------|
| Database | PostgreSQL + pgvector + TimescaleDB | 1 DB cho data + vector + time-series |
| Cache | Redis | Cache + distributed lock |
| Message Broker | RabbitMQ | Event bus + job queue |
| Search | PostgreSQL tsvector → Typesense (khi cần) | Chỉ thêm Typesense nếu volume >50k hoặc cần facet phức tạp |
| Object Storage | Azure Blob Storage | Ảnh, video, 3D, document |
| Container Orchestration | Docker Compose (dev) → Kubernetes (prod) | — |
| CI/CD | GitHub Actions | — |
| Monitoring | Seq (structured log) + Grafana + Prometheus | — |

**Containers Phase 1 (chỉ 6):** `pim-api` · `pim-client` · `ai-service` · `postgres` · `redis` · `rabbitmq`

**Thêm dần khi cần:** `typesense` (Phase 2 nếu search chậm) · `blender` (Phase 3 cho 3D render)

---

## Tóm Tắt Nguyên Tắc Chọn

1. **Managed API > self-host** khi cần ổn định production (Photoroom, Magnific, fal.ai, Tripo3D)
2. **Self-host** khi volume lớn hoặc cần custom (Florence-2, BGE-M3, Blender, ComfyUI)
3. **Proven .NET ecosystem** cho core (MassTransit, Polly, Hangfire, Stateless)
4. **Chuẩn mở** cho integration (CloudEvents, OIDC, OData)
5. **Giá không phải vấn đề** → chọn vendor tốt nhất cho mỗi task, không compromise chất lượng

---

*Cập nhật: 2026-05-19*
