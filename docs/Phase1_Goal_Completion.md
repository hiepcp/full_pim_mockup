# Phase 1 — Foundation: Goal Completion Tracker

> Single source of truth cho tiến độ Phase 1. Cập nhật khi hoàn thành từng deliverable.

## Tổng Quan

| Item | Value |
|------|-------|
| **Phase** | Phase 1 — Foundation |
| **Timeline** | 3–4 tháng |
| **Team** | 3–4 developers (1 senior, 2 mid, 1 junior) |
| **Goal** | Core PIM infrastructure — sync, store, transform, publish |
| **Start** | — |
| **Target End** | — |

---

## Deliverables

| # | Deliverable | Capability | Status | Completion | Notes |
|---|-------------|-----------|--------|------------|-------|
| D1 | D365 product sync (every 15 min) | C5 | 🟡 In Progress | 60% | Hourly sync products đã chạy; cần chuyển 15 min, thêm variants/categories/attributes/pricing |
| D2 | DAM — upload & manage all assets | C1, C3 | 🟡 In Progress | 30% | Entity exists, chưa có upload endpoint, chưa wire Blob |
| D3 | Image Engine — auto-resize all formats | C7 | 🔴 Not Started | 0% | Chưa implement |
| D4 | AI text drafts (descriptions, USPs) | C8 | 🟡 In Progress | 20% | Stub endpoints, chưa wire Claude/RabbitMQ |
| D5 | Publish — Webshop + iPaper | — | 🔴 Not Started | 0% | Chưa implement |
| D6 | Admin UI + role-based access | Cross-cutting | 🟡 In Progress | 40% | Refine UI 5 resources done; Auth chưa làm |
| D7 | Completeness score per channel | Cross-cutting | 🔴 Not Started | 5% | Field exists, chưa có logic |
| D8 | D365 price/spec change notifications | C5, C6 | 🔴 Not Started | 10% | Event publishing chưa wire |
| D9 | Audit trail + version history | C2 | 🟡 In Progress | 50% | Text content versioning done; audit log chưa đầy đủ |

**Overall Phase 1 Progress: ~25%**

---

## Acceptance Criteria

Phase 1 chỉ kết thúc khi tất cả criteria pass:

| # | Criterion | Status |
|---|-----------|--------|
| AC1 | Upload ảnh ≤50 MB qua direct SAS thành công, sinh 3 size pre-generated, hiển thị trong UI gallery | ⬜ |
| AC2 | CRUD text content đa ngôn ngữ với version + status, audit log đầy đủ | ⬜ |
| AC3 | Sync D365 product chạy ổn định 7 ngày liên tục, tỷ lệ lỗi <1%, có dashboard sync log | ⬜ |
| AC4 | Document upload + extract metadata + thumbnail trang đầu cho PDF | ⬜ |
| AC5 | Tạo/sửa/xóa attribute definition; gán giá trị; filter list product theo 2 attribute | ⬜ |
| AC6 | Event `product.updated` publish thành công, ai-service consume và log | ⬜ |
| AC7 | Image engine: gọi `/api/assets/{id}?w=400` trả ảnh đúng size, hit cache lần 2 | ⬜ |
| AC8 | AI text gen: `POST /api/ai/generate-text` với `productId` + `contentType` trả JSON structured trong <30s, marketing chấp nhận ≥60% draft không sửa lớn | ⬜ |

---

## Spike Backlog

> Mô tả + Output đầy đủ tại [Phase1_RnD_Plan.md §Spike Backlog Tổng](rnd/Phase1_RnD_Plan.md). Bảng này chỉ theo dõi trạng thái.

| Spike | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 |
|-------|----|----|----|----|----|----|----|----|
| Status | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Mỗi spike timeboxed 1–2 ngày; output là 1 ADR trong `docs/adr/`.

---

## Architecture Decisions

> Bối cảnh + alternatives đầy đủ tại [Phase1_RnD_Plan.md §Decision Log](rnd/Phase1_RnD_Plan.md). Bảng này theo dõi resolution + trạng thái.

| # | Quyết định | Resolution | Status |
|---|------------|-----------|--------|
| D01 | Container layout Blob | B (per type) + domain-path | ⬜ Pending |
| D02 | Versioning schema | Bảng riêng revisions | ⬜ Pending |
| D03 | Image lib | NetVips (sau S2) | ⬜ Pending |
| D04 | Default AI model | Sonnet (sau S5) | ⬜ Pending |
| D05 | Event schema | CloudEvents 1.0 | ⬜ Pending |
| D06 | Dynamic attributes | EAV (sau S6) | ⬜ Pending |
| D07 | D365 paging strategy | nextLink (sau S3) | ⬜ Pending |
| D08 | Outbox pattern | Hoãn Phase 2 | ✅ Decided |

---

## Business Impact Targets

| Target | Metric | Status |
|--------|--------|--------|
| Zero shared drive uploads | 100% assets qua PIM DAM | ⬜ |
| Save 8+ hours/week per content manager | Measured via time tracking | ⬜ |
| Correct content on webshop, always | Completeness gate = 100% before publish | ⬜ |

---

## Tech Stack (Confirmed)

Xem chi tiết tại [Recommended_Stack_Summary.md](tech-stack/Recommended_Stack_Summary.md) và [00_System_Overview.md §6](overview/00_System_Overview.md).

---

## Remaining Work (Priority Order)

### P0 — Critical Path

1. **D365 sync upgrade** — 15 min interval + variants/categories/attributes/pricing sync + change notifications
2. **DAM upload pipeline** — SAS direct upload + Blob wiring + UI gallery
3. **Image Engine** — resize/format pipeline, async job, cache layer
4. **AI Service wiring** — Connect Claude SDK + RabbitMQ consumer + generate-text endpoint

### P1 — Required for Completion

5. **Authentication & Authorization** — Role-based access (Admin, Content Manager, Reviewer, Viewer)
6. **Event publishing** — `product.updated` → RabbitMQ → ai-service consumer
7. **Completeness score** — Logic per product per channel, dashboard view
8. **Audit trail** — Full audit log per user action, version history UI

### P2 — Publish & Polish

9. **Publish channels** — Webshop sync + iPaper export
10. **Document management** — Upload + metadata extraction + PDF thumbnail
11. **Dynamic attributes** — EAV CRUD + filter by attribute
12. **Sync dashboard** — Log viewer, error rate monitoring

---

## Risks

| Risk | Level | Mitigation |
|------|-------|-----------|
| D365 UAT không sẵn sàng / data nghèo | Cao | Mock OData server (Prism + sample data) |
| Auth chưa làm → API public | Cao | IP allow-list nội bộ + chốt sớm |
| Anthropic API rate limit | Trung bình | Cache + queue + Haiku fallback |
| Image processing tốn CPU | Trung bình | Tách worker Hangfire ra container riêng |
| Storage cost Azure Blob (CAD lớn) | Trung bình | Lifecycle policy: cool tier sau 30 ngày |

---

*Updated: 2026-05-21*
