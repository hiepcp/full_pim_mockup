# UI Mockup & Data Flow Design Spec

> Mục tiêu: Tạo folder mockup giao diện tĩnh (React + MUI) với hardcoded data để visualize toàn bộ luồng dữ liệu hệ thống PIM trước khi build thật.

## 1. Tổng Quan

### Yêu cầu
- Static mockup pages dùng React + MUI (reusable, có thể chuyển thành code thật)
- Scope: Full system theo 5 role (PM, Marketing, Content Editor, Sales, Admin)
- Data flow: Overview diagram tổng thể + annotation trên từng page
- Không gọi API — tất cả data là hardcoded JSON

### Phương án đã chọn
**Hybrid: Feature modules + Role index** — structure theo feature module (map gần code thật), có thêm `_roles/` index để navigate theo user journey.

---

## 2. Folder Structure

```
mockups/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx                    ← Router + sidebar navigation
│   ├── _shared/
│   │   ├── Layout.jsx             ← Shell: sidebar + header + content + DataFlowPanel
│   │   ├── DataFlowPanel.jsx      ← Toggle panel hiển thị annotation (source, API, output)
│   │   ├── FlowAnnotation.jsx     ← Component render annotation per section
│   │   └── mockData/
│   │       ├── products.json
│   │       ├── variants.json
│   │       ├── assets.json
│   │       ├── textContents.json
│   │       ├── documents.json
│   │       ├── users.json
│   │       ├── approvals.json
│   │       └── syncLogs.json
│   ├── _overview/
│   │   ├── SystemDataFlow.jsx     ← Interactive diagram: D365 → PIM → Channels
│   │   └── RoleJourneyMap.jsx     ← Swimlane diagram per role
│   ├── _roles/
│   │   ├── PMJourney.jsx
│   │   ├── MarketingJourney.jsx
│   │   ├── ContentEditorJourney.jsx
│   │   ├── SalesJourney.jsx
│   │   └── AdminJourney.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── products/
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx      ← Tabs: info, variants, assets, texts, documents
│   │   ├── ProductEdit.jsx
│   │   └── ProductCreate.jsx
│   ├── variants/
│   │   └── VariantList.jsx
│   ├── assets/
│   │   ├── AssetGallery.jsx
│   │   ├── AssetDetail.jsx
│   │   └── AssetUpload.jsx
│   ├── text-contents/
│   │   ├── TextContentList.jsx
│   │   ├── TextContentEditor.jsx  ← Rich text + AI generate button
│   │   └── TextContentReview.jsx
│   ├── documents/
│   │   ├── DocumentList.jsx
│   │   └── DocumentDetail.jsx
│   ├── search/
│   │   └── GlobalSearch.jsx
│   ├── workflow/
│   │   ├── ApprovalQueue.jsx
│   │   ├── ApprovalDetail.jsx
│   │   └── WorkflowHistory.jsx
│   ├── admin/
│   │   ├── UserManagement.jsx
│   │   ├── RolePermissions.jsx
│   │   ├── D365SyncConfig.jsx
│   │   ├── CompletenessRules.jsx
│   │   └── WebhookConfig.jsx
│   └── auth/
│       ├── LoginPage.jsx
│       └── UnauthorizedPage.jsx
```

---

## 3. DataFlowPanel — Annotation Mechanism

Mỗi page export một `dataFlow` config object:

```jsx
const dataFlow = {
  title: "Product Detail",
  sources: [
    { label: "D365 Sync", entity: "ReleasedProductsV2", frequency: "Hourly" },
    { label: "PIM DB", table: "products, product_variants" }
  ],
  apiEndpoints: [
    { method: "GET", path: "/api/products/:id", description: "Load product + relations" },
    { method: "PUT", path: "/api/products/:id", description: "Update product metadata" }
  ],
  outputs: [
    { target: "RabbitMQ", event: "pim.product.v1.updated" },
    { target: "Typesense", action: "Upsert index" }
  ],
  relatedPages: ["VariantList", "AssetGallery", "TextContentEditor"]
};
```

`DataFlowPanel` component:
- Nằm bên phải màn hình, toggle show/hide
- Render sources (icon + label), endpoints (method badge + path), outputs (arrow + target)
- Click relatedPages → navigate tới page đó
- Color-code: inbound (blue), internal (gray), outbound (green)

---

## 4. Overview Pages

### 4.1 SystemDataFlow.jsx

Interactive diagram dùng React Flow (`@xyflow/react`):

```
EXTERNAL SYSTEMS
├── D365 F&O (OData) ──[hourly/delta]──▶ D365 Sync Service
├── Anthropic Claude ──[on-demand]──▶ ai-service
└── Azure AD (Entra) ──[login]──▶ pim-api

PIM CORE
├── D365 Sync (Hangfire) → PostgreSQL
├── pim-api (REST) ↔ PostgreSQL, Redis, Azurite, RabbitMQ, Typesense
├── pim-client (React) ↔ pim-api
├── ai-service (FastAPI) ← RabbitMQ, → ChromaDB, → Claude API
└── RabbitMQ → ai-service, → Webhook subscribers

OUTPUT CHANNELS
├── Webshop (webhook)
├── iPaper Catalogue (webhook)
├── Social Media (FB/LinkedIn/TikTok)
├── Sales Tools (shareable links)
└── Custom Webhook Subscribers
```

Interactions:
- Hover node → highlight connected edges
- Click node → popup with tables/endpoints/events
- Legend: color by data direction

### 4.2 RoleJourneyMap.jsx

Swimlane per role, mỗi node là clickable link:

| Role | Journey |
|------|---------|
| PM | Login → Dashboard → Product List → Product Detail → Assign Task |
| Marketing | Login → Notifications → Text Content Editor → AI Generate → Submit Review |
| Content Editor | Login → Notifications → Asset Gallery → Upload → Auto-process → Tag/Review → Submit |
| Sales | Login → Global Search → Product Detail → Download/Share |
| Admin | Login → Admin Panel → D365 Config / Users / Completeness / Webhooks |

---

## 5. Màn Hình Chi Tiết Per Feature

### 5.1 Dashboard
- **Stats cards**: Total products, assets, pending approvals, sync status
- **Completeness scoreboard**: Top 10 products thiếu thông tin nhất
- **Recent activity**: Timeline actions gần nhất
- **Sync health**: Last sync time, error count, next scheduled

**Data flow**: PostgreSQL (aggregates) → GET /api/dashboard/stats → render cards

### 5.2 Products
- **List**: DataGrid với columns (name, item number, range, status, completeness %, last synced)
- **Detail**: Tabbed view — Info | Variants | Assets | Texts | Documents
- **Edit**: Form fields + dynamic attributes (EAV)
- **Create**: Minimal form (manual product, không qua D365)

**Data flow**: D365 → sync → products table → GET /api/products → UI. Edit → PUT /api/products/:id → DB + event publish

### 5.3 Variants
- **List**: DataGrid grouped by product, columns (color, size, style, configuration, status)

**Data flow**: D365 ReleasedProductVariants → sync → product_variants → GET /api/variants

### 5.4 Assets
- **Gallery**: Grid view với thumbnails, filter by type (packshot, lifestyle, etc.)
- **Upload**: Drag & drop zone, progress bar, processing status indicators
- **Detail**: Full preview + metadata panel (type, tags, dimensions, linked product/variant)

**Data flow**: Upload → POST /api/visual-assets → Azurite blob → Hangfire job (resize, tag) → DB update. Gallery → GET /api/visual-assets

### 5.5 Text Contents
- **List**: DataGrid (product, type, language, status, last modified)
- **Editor**: Rich text (Quill-like) + "AI Generate" button + language selector
- **Review**: Side-by-side (current vs draft) + approve/reject + comments

**Data flow**: GET /api/text-contents → editor. AI Generate → RabbitMQ → ai-service → Claude → result back. Submit → status InReview → approval flow

### 5.6 Documents
- **List**: DataGrid (name, type, product, pages, size, uploaded date)
- **Detail**: PDF preview + extracted metadata + linked products

**Data flow**: Upload → POST /api/product-documents → Blob + metadata extraction (PdfPig) → DB

### 5.7 Search
- **Global Search**: Search bar (header) + faceted results page
- **Facets**: Range, Category, Status, Asset Type, Language
- **Results**: Mixed results (products, assets, texts, documents) with relevance score

**Data flow**: Query → GET /api/search?q= → Typesense (keyword) + ChromaDB (vector) → RRF merge → results

### 5.8 Workflow
- **Approval Queue**: List pending items (text/asset/document) with requester, date, type
- **Approval Detail**: Content preview + history + comment box + approve/reject buttons
- **History**: Timeline of all workflow transitions for an item

**Data flow**: Submit → status InReview → notification. Approver → PUT /api/approvals/:id → transition log → notification back

### 5.9 Admin
- **User Management**: DataGrid users (synced from Entra ID) + role assignment
- **Role Permissions**: Matrix view (role × permission)
- **D365 Sync Config**: Entity list + schedule per entity + sync dashboard (last run, errors, lag)
- **Completeness Rules**: Rule editor per product type (field, weight, threshold)
- **Webhook Config**: Subscriber list + endpoint + secret + delivery log

**Data flow**: Admin actions → PUT /api/admin/* → DB config tables. Sync dashboard → GET /api/sync/status

### 5.10 Auth
- **Login**: Azure AD / Entra ID login button + redirect flow mockup
- **Unauthorized**: 403 page with role info

---

## 6. Mock Data Schema

```json
// products.json (sample)
[
  {
    "id": 1,
    "itemNumber": "D365-SOFA-001",
    "name": "Copenhagen Sofa 3-Seater",
    "range": "Living Room",
    "status": "Active",
    "completenessScore": 75,
    "lastSynced": "2026-05-20T05:00:00Z",
    "variantCount": 4,
    "assetCount": 8,
    "textCount": 3
  }
]

// assets.json (sample)
[
  {
    "id": 1,
    "productId": 1,
    "type": "Packshot",
    "fileName": "sofa-001-front.jpg",
    "status": "Published",
    "tags": ["sofa", "3-seater", "fabric", "gray"],
    "dimensions": { "width": 2048, "height": 1536 },
    "thumbnailUrl": "/mock-images/sofa-thumb.jpg"
  }
]

// textContents.json (sample)
[
  {
    "id": 1,
    "productId": 1,
    "type": "DesignDescriptionB2B",
    "language": "en",
    "status": "Published",
    "content": "The Copenhagen Sofa combines Scandinavian minimalism...",
    "version": 3,
    "lastModifiedBy": "marketing@company.com"
  }
]
```

---

## 7. Tech Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^6.x | Dev server + build (port 3001) |
| `react` | ^19.x | UI framework |
| `react-dom` | ^19.x | DOM rendering |
| `react-router-dom` | ^7.x | Client-side routing |
| `@mui/material` | ^6.x | Component library |
| `@mui/icons-material` | ^6.x | Icons |
| `@mui/x-data-grid` | ^8.x | DataGrid tables |
| `@emotion/react` | ^11.x | MUI styling |
| `@emotion/styled` | ^11.x | MUI styling |
| `@xyflow/react` | ^12.x | Interactive flow diagrams |

---

## 8. Navigation Structure

Sidebar menu:

```
Overview
├── System Data Flow
└── Role Journeys
    ├── Product Manager
    ├── Marketing
    ├── Content Editor
    ├── Sales
    └── Admin

Features
├── Dashboard
├── Products
├── Variants
├── Visual Assets
├── Text Contents
├── Documents
├── Search
└── Workflow

Administration
├── Users & Roles
├── D365 Sync
├── Completeness Rules
└── Webhooks
```

---

## 9. Acceptance Criteria

1. `npm run dev` khởi động mockup app tại localhost (port khác pim-client)
2. Tất cả pages render được với mock data, không lỗi console
3. DataFlowPanel hiển thị đúng annotation cho mỗi page
4. SystemDataFlow diagram interactive (hover highlight, click detail)
5. Role journey pages có clickable links tới feature pages tương ứng
6. Sidebar navigation hoạt động, active state đúng
7. Responsive layout (desktop primary, tablet acceptable)
8. Mock data phản ánh đúng domain model hiện tại (entities, enums, relationships)

---

## 10. Conventions

- **Dev server port**: 3001 (tránh conflict với pim-client ở 3000)
- **Mock images**: Dùng local SVG placeholders trong `src/_shared/mockData/images/` (colored rectangles với text label). Không phụ thuộc external service.
- **Naming**: File names dùng PascalCase cho components, camelCase cho data files

---

## 11. Không Bao Gồm (Out of Scope)

- API calls thật
- Authentication/authorization logic
- State management phức tạp (Redux, Zustand)
- Unit tests cho mockup
- Mobile responsive
- i18n (mockup chỉ dùng English + Vietnamese labels nơi cần)
- Animation/transition phức tạp

---

*Spec created: 2026-05-20*
