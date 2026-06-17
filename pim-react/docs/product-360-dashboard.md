# Product 360° Dashboard — Design & Implementation Plan

> **Scope**: Redesign the existing `Overview` tab in `pim-react/src/pages/Products.jsx` (currently lines 604-1119, hardcoded literals) into a comprehensive per-product 360° dashboard, following Microsoft Dynamics 365 / Fluent Design conventions. The breadcrumb label "360° Dashboard" already exists; this work deepens the tab from 4 KPI tiles into a 13-section comprehensive view.
>
> **Audience**: PIM Team — product managers, content editors, supply chain.
>
> **Stack note**: Repo currently uses **JavaScript (.jsx)** with Tailwind CSS, no chart library, in-memory `DataContext` + JSON seed. Plan below defines the design at TypeScript level for clarity (interfaces, API contracts) and notes the JSX implementation path that matches the existing codebase. A migration to TS can be deferred.

---

## 1. UI/UX Analysis

### 1.1 Design principles (Fluent / D365 inspired)

| Principle | Application |
|---|---|
| **Hierarchy through whitespace** | 12-column grid, 16px gutters, 24px section spacing, 8px card padding scale (2/3/4/6) |
| **Subtle elevation** | Two-tier shadow: `card` (resting) and `hover` (interactive). Never use shadow for non-interactive surfaces |
| **Color as semantic carrier** | Blue=primary/info, Green=success, Orange=warning, Red=error, Stone=neutral. Never use color decoratively |
| **Data-density first** | Table-first for sales history; card-tile first for KPIs. Mobile collapses to single column but desktop is the canonical view |
| **Progressive disclosure** | KPI tile → click → detail drawer (D365 pattern). Avoid modals except for destructive actions |
| **Consistent iconography** | Tabler Icons (`ti ti-…`), filled for state (✓ active, ⚠ warning), outlined for navigation |

### 1.2 Existing Overview pain points (from current code)

- 4 KPI values are **hardcoded** (`24`, `11`, `7`, `3`) — no derivation from `state.currentProduct` or `state.stats`
- No **3-column hero** (image gallery, product info, quality score) — users must scroll the long page to understand the product
- **Sales table** is HTML `<table>` with no sort, no pagination, no search; data is `sales[]` from `products.json` which has only 3 fields (customer, qty, period) — missing order date range, last order, order count, item number
- No **D365 sync status** widget even though `state.d365Config` exists in DataContext
- No **product sets** widget even though `state.productSets` and `/product-sets` page exist
- No **circular completeness gauge** (only a tiny 64px ring at line 550)
- No **app-level header** (hamburger, user profile, notification bell) — the project uses a fixed left sidebar; this design adds a **page-level** topbar that supplements the existing sidebar
- No **loading / empty / error states** for any of the dashboard widgets

### 1.3 UX flows being enabled

1. **Daily PIM review** — supply chain checks Material Alerts and D365 Changes tiles first
2. **Content readiness** — content editor checks AI Content + Publish Status + Content Completeness
3. **Sales performance** — product manager scans Customer Sales History table, drills into a customer row
4. **Quality gate** — completeness score visible at all times in the right column of the hero

---

## 2. Information Architecture

### 2.1 Sitemap (within the Overview tab)

```
Product 360° Dashboard
├── App-level header (sticky)
│   ├── Hamburger → toggle sidebar collapse
│   ├── "Product 360 Dashboard" brand mark
│   └── User cluster → avatar, name, role, notification bell with badge
├── Page-level topbar (sticky, below app header)
│   ├── Breadcrumb: Catalogue › Item 30317 › 360° Dashboard
│   └── Actions: status pill, Edit, Publish
├── Hero (3-col grid)
│   ├── Left: Product image gallery (main + thumbnails)
│   ├── Center: Product info (status, name, item no, category breadcrumb, brand, base item, dates, updated-by)
│   └── Right: Data quality (completeness gauge, ready-to-sell badge, D365 sync status, last sync time)
├── Alert strip (2-col, only renders if issues > 0)
│   ├── Materials Discontinued
│   └── D365 Change Notifications
├── Section: Media Assets (5 metric tiles + drill-down)
├── Section: Documents (8-row checklist)
├── Section: AI Content (6-row status list)
├── Section: Publish Status (4 channel rows + completeness bar)
├── Section: Product Sets (collection list + "X more sets" link)
├── Section: Material Alerts (count + drill link)
├── Section: D365 Changes (count + drill link)
├── Section: Customer Sales History (sortable / paginated / searchable table)
└── KPI Summary Panel (Total Customers, Total Units Sold)
```

### 2.2 Reading order rationale (Z-pattern, F-pattern hybrid)

Top-left = identity (gallery + name), top-right = quality state (gauge + sync), middle = actionable widgets (alerts, assets, docs, content, publish), bottom = reference data (sales, KPI summary). Alerts are placed *after* the hero so they interrupt scanning without dominating the first paint.

---

## 3. Component Breakdown

### 3.1 Shared / atomic (extract to `src/components/ui/`)

| Component | Purpose | Key props |
|---|---|---|
| `Card` | Container with optional header, footer, hover-elevate | `title, icon, footer, onClick, elevated` |
| `StatusBadge` | Pill with semantic color + optional icon | `status, size, icon` |
| `ProgressBar` | Horizontal track, percent label, color from percent range | `value, max, color, size` |
| `ProgressRing` | SVG circular gauge | `value, size, strokeWidth, label` |
| `MetricTile` | Icon + value + label + sublabel | `icon, value, label, sub, iconBg, iconColor, href` |
| `ChecklistRow` | Icon + label + status | `label, status, icon` |
| `EmptyState` | Icon + title + description + optional CTA | `icon, title, description, action` |
| `LoadingState` | Skeleton variant of any card | `lines, height` |
| `ErrorState` | Icon + message + retry | `message, onRetry` |
| `NotificationBell` | Bell + badge count + popover | `count, items` |
| `UserAvatar` | Initials fallback or photo | `name, src, role` |
| `DataTable` | Generic sortable / paginated / searchable table | `columns, rows, sortable, pageSize` |
| `ChannelPill` | Channel icon + status + percent | `icon, name, status, percent` |

### 3.2 Section / composite

| Component | Composes |
|---|---|
| `DashboardHeader` | `Hamburger`, `Brand`, `UserAvatar`, `NotificationBell` |
| `PageTopbar` | breadcrumb + status pill + actions |
| `ProductHero` | `ImageGallery` + `ProductInfo` + `DataQualityPanel` |
| `ImageGallery` | main image + thumbnail strip + counter |
| `ProductInfo` | status badge, name, item no, category breadcrumb, brand, base item, dates |
| `DataQualityPanel` | `ProgressRing` (completeness) + `ReadyToSell` badge + `D365SyncStatus` + `LastSync` |
| `AlertStrip` | 2× `AlertCard` |
| `AlertCard` | icon + count + description + CTA |
| `MediaAssetsSection` | 5× `MetricTile` (Total, Images, Lifestyle, Packaging, Videos, Variants) |
| `DocumentsSection` | 8× `ChecklistRow` |
| `AIContentSection` | 6× `ChecklistRow` |
| `PublishStatusSection` | 4× `ChannelPill` + `ProgressBar` |
| `ProductSetsSection` | list of collections + "X more sets" link |
| `MaterialAlertsSection` | count card + drill link |
| `D365ChangesSection` | count card + drill link |
| `SalesHistorySection` | `DataTable` (Customer, Total Qty Sold, Order Date Range, Last Order Date, No. of Orders, Item Number) |
| `KPISummaryPanel` | 2× `MetricTile` (Total Customers, Total Units Sold) |

---

## 4. Database / Data Model

### 4.1 Current state in repo

- `state.currentProduct` (single product, embedded `variants[]`, `sales[]`)
- `state.products[]` (list-table shape, 12 items)
- `state.stats` from `dashboard.json` (global counts)
- `state.productSets[]` (from `product-sets.json`, 5 collections)
- `state.materials[]` (from `materials.json`, 11 items with `status`)
- `state.syncLog[]` (from `settings.json`)
- `state.notificationEvents[]` (from `settings.json`)

### 4.2 Gaps to close (proposed shape — backend `Pim.Api` would persist this)

```text
Product
  Id, Sku, Name, Category, Collection, Status, Year, Dimensions, Weight
  ImageGallery[ImageRef]
  Completeness (computed)
  IsReadyToSell (computed)
  BrandId, BaseItemId
  CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
  D365Sync { Status, LastSyncAt, LastSyncBy, ErrorCount }

ProductImage
  Id, ProductId, Url, ThumbnailUrl, Kind (Packshot|Lifestyle|LineDrawing|3D)
  Status (Ready|Processing|Failed), UploadedAt, UploadedBy, Width, Height, Bytes

Document
  Id, ProductId, Kind (PI|Assembly|BOM|TestReport|ShippingMark|Certification|Compliance|Other)
  Name, Locale, Status (Approved|Pending|Draft|Missing)
  Url, UploadedAt, ExpiryAt

AiContent
  Id, ProductId, Locale
  Description, SocialCaption, MarketingText, SeoText, KeyFeatures[], BulletPoints[]
  Status (Approved|Pending|Draft|Missing), GeneratedAt, ApprovedBy

ChannelPublish
  Id, ProductId, Channel (Website|iPaper|Facebook|Instagram)
  Status (Live|Scheduled|Draft|Failed), CompletionPct, UpdatedAt, ScheduledFor

ProductSetMembership
  ProductSetId, ProductId, Role

MaterialAlert
  Id, ProductId, MaterialId, MaterialName, IssueType (Discontinued|PhasingOut)
  DetectedAt, AffectedVariantCount

D365Change
  Id, ProductId, Field, OldValue, NewValue, ChangedAt, ChangedBy, Direction (In|Out)

SalesRecord
  Id, ProductId, ItemNumber, Customer, TotalQty, OrderCount
  FirstOrderDate, LastOrderDate
```

### 4.3 Mock data files (frontend, no backend)

Add `src/data/dashboard-detail.json` (or extend `products.json`) keyed by product id:

```text
{
  "30317": {
    "imageGallery": [...],
    "completeness": 72,
    "isReadyToSell": false,
    "brand": "Fritz Hansen",
    "baseItem": "30317",
    "createdAt": "2022-01-14T00:00:00Z",
    "createdBy": "Erik Olsen",
    "updatedAt": "2026-06-14T09:32:00Z",
    "updatedBy": "Lars Supply Chain",
    "d365Sync": { "status": "OK", "lastSyncAt": "2026-06-17T08:11:00Z", "lastSyncBy": "system", "errorCount": 0 },
    "documents": [...],
    "aiContent": [...],
    "channelPublish": [...],
    "productSetIds": ["summer-2026", "garden-furniture", "outdoor-living"],
    "materialAlerts": [...],
    "d365Changes": [...],
    "salesRecords": [...],
    "kpi": { "totalCustomers": 7, "totalUnitsSold": 971 }
  }
}
```

Extend `DataContext` reducer to expose `state.dashboard[productId]`.

---

## 5. TypeScript Interfaces (canonical — implement in TS or as JSDoc typedefs)

```ts
// ─── Shared ───────────────────────────────────────────────
export type SemanticColor = 'success' | 'warning' | 'error' | 'info' | 'neutral'
export type SyncStatus = 'OK' | 'Failed' | 'Pending' | 'Disabled'
export type LifecycleStatus = 'Active' | 'Phasing Out' | 'Discontinued' | 'Obsolete' | 'Draft'
export type PublishStatus = 'Live' | 'Scheduled' | 'Draft' | 'Failed'
export type DocumentStatus = 'Approved' | 'Pending' | 'Draft' | 'Missing'
export type ContentStatus = 'Approved' | 'Pending' | 'Draft' | 'Missing'

// ─── Product ──────────────────────────────────────────────
export interface ProductDimensions { width: string; depth: string; height: string; seat_height?: string }
export interface ProductImage { id: string; url: string; thumbUrl: string; kind: 'Packshot' | 'Lifestyle' | 'LineDrawing' | '3D'; status: 'Ready' | 'Processing' | 'Failed'; width: number; height: number; bytes: number; uploadedAt: string }
export interface D365Sync { status: SyncStatus; lastSyncAt: string; lastSyncBy: string; errorCount: number }
export interface Product {
  id: string; sku: string; name: string
  category: string; collection: string
  status: LifecycleStatus
  year: number
  dimensions: ProductDimensions
  weight: string
  brand: string
  baseItem: string
  createdAt: string; createdBy: string
  updatedAt: string; updatedBy: string
  imageGallery: ProductImage[]
  completeness: number          // 0..100
  isReadyToSell: boolean
  d365Sync: D365Sync
}

// ─── Documents ────────────────────────────────────────────
export type DocumentKind =
  | 'ProductInformation' | 'AssemblyInstruction' | 'BOM'
  | 'TestReport' | 'ShippingMark' | 'Certification' | 'Compliance' | 'Other'

export interface ProductDocument {
  id: string; productId: string
  kind: DocumentKind
  name: string
  locale: string
  status: DocumentStatus
  url?: string
  uploadedAt?: string
  expiryAt?: string
}

// ─── AI Content ───────────────────────────────────────────
export type ContentFieldKey =
  | 'ProductDescription' | 'SocialCaption' | 'MarketingText'
  | 'SeoText' | 'KeyFeatures' | 'BulletPoints'

export interface AiContentItem { key: ContentFieldKey; status: ContentStatus; locale: string; preview?: string; generatedAt?: string; approvedBy?: string }
export interface AiContent { productId: string; locale: string; items: AiContentItem[] }

// ─── Publish ──────────────────────────────────────────────
export type Channel = 'Website' | 'iPaper' | 'Facebook' | 'Instagram'
export interface ChannelPublish { productId: string; channel: Channel; status: PublishStatus; completionPct: number; updatedAt: string; scheduledFor?: string }

// ─── Product Sets ─────────────────────────────────────────
export interface ProductSet { id: string; name: string; productCount: number }
export interface ProductSetMembership { productSetId: string; productId: string; role?: string }

// ─── Alerts ───────────────────────────────────────────────
export type MaterialIssue = 'Discontinued' | 'PhasingOut'
export interface MaterialAlert { id: string; productId: string; materialId: string; materialName: string; issue: MaterialIssue; detectedAt: string; affectedVariantCount: number }

export interface D365Change { id: string; productId: string; field: string; oldValue: string; newValue: string; changedAt: string; changedBy: string; direction: 'In' | 'Out' }

// ─── Sales ────────────────────────────────────────────────
export interface SalesRecord { id: string; productId: string; itemNumber: string; customer: string; totalQty: number; orderCount: number; firstOrderDate: string; lastOrderDate: string }

// ─── KPI ──────────────────────────────────────────────────
export interface DashboardKpi { totalCustomers: number; totalUnitsSold: number }

// ─── Aggregate ────────────────────────────────────────────
export interface Product360 {
  product: Product
  documents: ProductDocument[]
  aiContent: AiContent
  channelPublish: ChannelPublish[]
  productSets: ProductSet[]
  materialAlerts: MaterialAlert[]
  d365Changes: D365Change[]
  sales: SalesRecord[]
  kpi: DashboardKpi
}
```

---

## 6. API Contract (REST, future backend)

Base: `/api/v1`

| Method | Path | Purpose | Response |
|---|---|---|---|
| GET | `/products/{sku}/360` | Full 360 payload (everything below in one call) | `Product360` |
| GET | `/products/{sku}` | Product core + image gallery + d365Sync | `Product` |
| GET | `/products/{sku}/documents` | List documents for a product | `ProductDocument[]` |
| GET | `/products/{sku}/ai-content?locale=en` | AI content block | `AiContent` |
| GET | `/products/{sku}/publish` | Channel publish statuses | `ChannelPublish[]` |
| GET | `/products/{sku}/product-sets` | Sets the product belongs to | `ProductSet[]` |
| GET | `/products/{sku}/alerts/materials` | Material alerts | `MaterialAlert[]` |
| GET | `/products/{sku}/alerts/d365` | D365 changes (last 30 days) | `D365Change[]` |
| GET | `/products/{sku}/sales?page=1&size=20&sort=totalQty:desc` | Sales records | `{ rows: SalesRecord[], total, page, size }` |

### 6.1 Mock service module (frontend, replaces real fetch)

`src/services/dashboardService.js`:

```js
const KEYS = ['product', 'documents', 'aiContent', 'channelPublish', 'productSets', 'materialAlerts', 'd365Changes', 'sales', 'kpi']

export async function getProduct360(sku) {
  await new Promise(r => setTimeout(r, 250))   // simulate latency
  const data = dashboardDetail[sku]            // imported from data/dashboard-detail.json
  if (!data) throw new Error('Product not found')
  return data
}

export async function getSales(sku, { page = 1, size = 10, sort = 'totalQty:desc', q = '' } = {}) {
  // synchronous filter + sort + paginate, returns { rows, total, page, size }
}
```

Wrap calls in a `useProduct360(sku)` hook that returns `{ data, loading, error, refetch }` — the canonical loading / empty / error boundary.

---

## 7. React Component Tree

```
<ProductsPage>
  <Layout>                              ← existing, provides Sidebar
    <DashboardHeader>                   ← NEW (hamburger / brand / user / bell)
      <Hamburger />
      <BrandMark />
      <UserCluster>
        <UserAvatar name role />
        <NotificationBell count items />
      </UserCluster>
    </DashboardHeader>

    <PageTopbar>                        ← REPLACE existing topbar
      <Breadcrumb />
      <StatusBadge />
      <ActionButton>Edit</ActionButton>
      <ActionButton primary>Publish</ActionButton>
    </PageTopbar>

    <OverviewPanel sku={selectedId}>    ← REPLACE the existing {activeTab === 'overview' && …}
      <ProductHero>
        <ImageGallery images={product.imageGallery} />
        <ProductInfo product={product} />
        <DataQualityPanel
          completeness={product.completeness}
          readyToSell={product.isReadyToSell}
          d365={product.d365Sync}
        />
      </ProductHero>

      <AlertStrip>
        <AlertCard icon="ti-alert-triangle" tone="warning"
          count={materialAlerts.length} label="Materials Discontinued"
          description="…affects 3 variants" cta="View details" />
        <AlertCard icon="ti-refresh" tone="info"
          count={d365Changes.length} label="D365 Change Notifications"
          description="…3 inbound, 1 outbound" cta="View changes" />
      </AlertStrip>

      <Section title="Media Assets" icon="ti-photo">
        <MetricTile value={totalAssets} label="Total Assets" />
        <MetricTile value={countByKind.Images} label="Images" />
        <MetricTile value={countByKind.Lifestyle} label="Lifestyle" />
        <MetricTile value={countByKind.Packaging} label="Packaging" />
        <MetricTile value={countByKind.Videos} label="Videos" />
        <MetricTile value={countByKind.Variants} label="Variants" />
      </Section>

      <Section title="Documents" icon="ti-file-stack">
        <ChecklistRow kind="ProductInformation" status={byKind.PI} />
        <ChecklistRow kind="AssemblyInstruction" status={byKind.Assembly} />
        <ChecklistRow kind="BOM" status={byKind.BOM} />
        <ChecklistRow kind="TestReport" status={byKind.Test} />
        <ChecklistRow kind="ShippingMark" status={byKind.Shipping} />
        <ChecklistRow kind="Certification" status={byKind.Cert} />
        <ChecklistRow kind="Compliance" status={byKind.Comp} />
        <ChecklistRow kind="Other" status={byKind.Other} />
      </Section>

      <Section title="AI Content" icon="ti-sparkles">
        <ChecklistRow label="Product Description" status={…} />
        <ChecklistRow label="Social Caption" status={…} />
        <ChecklistRow label="Marketing Text" status={…} />
        <ChecklistRow label="SEO Text" status={…} />
        <ChecklistRow label="Key Features" status={…} />
        <ChecklistRow label="Bullet Points" status={…} />
      </Section>

      <Section title="Publish Status" icon="ti-world-upload">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <ChannelPill channel="Website" status="Live" percent={100} />
            <ChannelPill channel="iPaper" status="Live" percent={100} />
            <ChannelPill channel="Facebook" status="Scheduled" percent={85} />
            <ChannelPill channel="Instagram" status="Draft" percent={40} />
          </div>
          <div>
            <h4>Content Completeness</h4>
            <ProgressBar value={68} />
            <p>4 of 6 content blocks approved across 5 locales</p>
          </div>
        </div>
      </Section>

      <Section title="Product Sets" icon="ti-components">
        <SetRow name="Summer Collection 2026" count={12} />
        <SetRow name="Garden Furniture" count={8} />
        <SetRow name="Outdoor Living" count={24} />
        <Link>X more sets</Link>
      </Section>

      <Section title="Material Alerts" icon="ti-alert-triangle">
        <AlertCard compact count={3} label="Materials discontinued" cta="View details" />
      </Section>

      <Section title="D365 Changes" icon="ti-refresh">
        <AlertCard compact count={4} label="New D365 changes" cta="View changes" />
      </Section>

      <Section title="Customer Sales History" icon="ti-chart-bar">
        <DataTable
          columns={[
            { key: 'customer', label: 'Customer', sortable: true },
            { key: 'totalQty', label: 'Total Qty Sold', sortable: true, align: 'right' },
            { key: 'orderDateRange', label: 'Order Date Range', sortable: true },
            { key: 'lastOrderDate', label: 'Last Order Date', sortable: true },
            { key: 'orderCount', label: 'No. of Orders', sortable: true, align: 'right' },
            { key: 'itemNumber', label: 'Item Number', sortable: true, mono: true },
          ]}
          rows={sales}
          searchable
          pageSize={10}
          sortable
        />
      </Section>

      <Section title="KPI Summary" icon="ti-chart-pie">
        <MetricTile value={kpi.totalCustomers} label="Total Customers" />
        <MetricTile value={kpi.totalUnitsSold} label="Total Units Sold" />
      </Section>
    </OverviewPanel>
  </Layout>
</ProductsPage>
```

---

## 8. Tailwind Layout Structure

### 8.1 App grid

```
"grid grid-cols-[200px_1fr] min-h-screen"   ← Layout (sidebar + content)
  ├─ Sidebar (fixed left, w-200)
  └─ Main column
      ├─ DashboardHeader (h-12, sticky top-0, z-30)
      ├─ PageTopbar (h-12, sticky top-12, z-20)
      └─ Scroll container (overflow-y-auto)
          └─ OverviewPanel (px-6 py-4 space-y-5)
```

### 8.2 Overview panel sections

```text
section gap:    space-y-5 (20px)
section padding: p-4
section radius:  rounded-xl
section border:  border border-black/10
section shadow:  shadow-card (rest) → shadow-hover (interactive)
section bg:      bg-white
```

### 8.3 Hero — 3-column responsive

```text
grid grid-cols-1 md:grid-cols-3 gap-5

[ col 1: w-full md:col-span-1 — ImageGallery ]
  aspect-square main image (rounded-xl border)
  + thumb strip grid grid-cols-4 gap-2 mt-2

[ col 2: md:col-span-1 — ProductInfo ]
  stack of: status badge, h1, sku, breadcrumb (Category › Collection),
            brand, baseItem, createdAt+by, updatedAt+by

[ col 3: md:col-span-1 — DataQualityPanel ]
  ProgressRing (size=120) + label "Data Completeness"
  StatusBadge "Ready to Sell" (success or warning)
  Sync indicator with timestamp
```

### 8.4 Alert strip — 2-column, conditional

```text
grid grid-cols-1 md:grid-cols-2 gap-3   (only renders if alerts.length > 0)
  AlertCard: rounded-xl p-4 flex items-center gap-3 border-l-4
```

### 8.5 Media Assets — 5-tile responsive

```text
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3
```

### 8.6 Publish Status — 2-column

```text
grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5
  left:  space-y-2 (4 channel rows)
  right: stacked ProgressBar + summary text
```

### 8.7 Sales table

```text
overflow-x-auto
table w-full text-[12px]
  thead: bg-stone-50 sticky top-0
  th:    px-3 py-2.5 text-[10px] uppercase tracking-wide text-stone-400 text-left
  tbody: divide-y divide-stone-100
  tr:    hover:bg-stone-50
  td:    px-3 py-2.5
pagination bar: px-4 py-2.5 border-t flex items-center gap-2
  ←  1 2 3 ...  →   |  10/page ▾   |  Search: [______]
```

### 8.8 Color tokens (extend tailwind.config.js)

```js
// brand already exists (#185FA5 family)
// add semantic aliases if not present:
colors: {
  success: { 50: '#F0FDF4', 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
  warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
  error:   { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
  info:    { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
}
```

Status → color mapping:
- `Active`, `Approved`, `Live`, `OK` → `success`
- `Phasing Out`, `Pending`, `Scheduled`, `Processing` → `warning`
- `Discontinued`, `Failed`, `Missing`, `Error` → `error`
- `Draft`, `NotStarted` → `info` (or neutral)
- `Obsolete` → `neutral`

---

## 9. User Flow

### 9.1 Primary flow — Daily PIM review (supply chain)

1. Land on `/products` (existing list view)
2. Click row "Greenwood Lounge Chair 30317" → routes to detail
3. Detail loads with **Overview** tab active
4. Eye scans: Hero (left image + name) → DataQualityPanel (right: completeness 72%, not ready to sell, D365 OK)
5. Notices `Material Alerts` strip with "3 materials discontinued" → clicks "View details"
6. Drill drawer opens showing 3 affected variants → clicks variant SKU → switches to **Variants** tab with that row highlighted
7. Returns to Overview → scrolls to **D365 Changes** → clicks "View changes" → drawer shows inbound/outbound field changes
8. Returns to Overview → scrolls to **Customer Sales History** → sorts by Total Qty Sold desc → sees John Lewis at top with 340 units
9. Clicks John Lewis row → customer drawer with order timeline (future enhancement)

### 9.2 Secondary flow — Content readiness (content editor)

1. Same entry, but lands on Overview → checks **AI Content** section
2. Sees "Pending approval" badges on Social Caption and SEO Text → opens each, edits, approves
3. Returns to Overview → checks **Publish Status** — Instagram still shows "Draft"
4. Clicks Instagram pill → switches to **Content & Publishing** tab
5. Schedules Instagram post → returns to Overview
6. Publish Status tile now shows Instagram as "Scheduled" with completion 85%

### 9.3 Empty / error / loading

- **Loading**: each section renders its `LoadingState` (skeleton card with 3 bars)
- **Empty (no materials discontinued)**: `AlertStrip` does not render at all
- **Empty (no product sets)**: section renders `EmptyState` with "No sets contain this product" + "Add to set" CTA
- **Empty (no sales)**: `DataTable` renders `EmptyState` row "No D365 sales data for this product"
- **Error (fetch failed)**: each section renders `ErrorState` with retry button; hero stays visible

---

## 10. Implementation Backlog

### Sprint 1 — Foundation (atomic components + data shape)

- [ ] **T1.1** Add `src/data/dashboard-detail.json` with seed for SKU 30317 (and 1-2 others) covering all 9 child blocks
- [ ] **T1.2** Extend `DataContext.jsx`: add `state.dashboardByProduct` initialized from `dashboardDetail`
- [ ] **T1.3** Create `src/components/ui/Card.jsx` (header, body, footer, hover-elevate variants)
- [ ] **T1.4** Create `src/components/ui/StatusBadge.jsx` (semantic color from status string, optional icon, size variants)
- [ ] **T1.5** Create `src/components/ui/ProgressBar.jsx` (linear, color from value, label slot)
- [ ] **T1.6** Create `src/components/ui/ProgressRing.jsx` (SVG circular, size/stroke/label props, animated stroke-dashoffset)
- [ ] **T1.7** Create `src/components/ui/MetricTile.jsx` (icon, value, label, sub, optional href)
- [ ] **T1.8** Create `src/components/ui/ChecklistRow.jsx` (icon + label + status)
- [ ] **T1.9** Create `src/components/ui/DataTable.jsx` (generic columns, rows, sortable header, page-size, search)
- [ ] **T1.10** Create `src/components/ui/EmptyState.jsx`, `LoadingState.jsx`, `ErrorState.jsx`
- [ ] **T1.11** Add JSDoc typedefs for all interfaces in `src/types/dashboard.js` (so JS gets IntelliSense)

### Sprint 2 — Page-level chrome (header + topbar)

- [ ] **T2.1** Create `src/components/dashboard/DashboardHeader.jsx` (hamburger toggle, brand mark, user cluster)
- [ ] **T2.2** Create `src/components/dashboard/NotificationBell.jsx` (icon + badge + popover listing `state.notificationEvents`)
- [ ] **T2.3** Create `src/components/dashboard/UserAvatar.jsx` (initials fallback, role chip below name)
- [ ] **T2.4** Create `src/components/dashboard/PageTopbar.jsx` (breadcrumb, status pill, Edit / Publish actions)
- [ ] **T2.5** Wire `Layout.jsx` to render `<DashboardHeader />` above children (optional toggle in context to keep other pages unchanged)

### Sprint 3 — Hero

- [ ] **T3.1** `ImageGallery.jsx` (main image + thumb strip + counter, keyboard arrow nav)
- [ ] **T3.2** `ProductInfo.jsx` (status badge, name, sku, breadcrumb, brand, base item, dates)
- [ ] **T3.3** `DataQualityPanel.jsx` (completeness ring, ready-to-sell badge, sync indicator with last-sync relative time)
- [ ] **T3.4** `ProductHero.jsx` (3-col grid composition)

### Sprint 4 — Alert + content sections

- [ ] **T4.1** `AlertCard.jsx` + `AlertStrip.jsx` (conditional render when alerts > 0)
- [ ] **T4.2** `MediaAssetsSection.jsx` (5-6 MetricTiles with drill-down links to Image Engine)
- [ ] **T4.3** `DocumentsSection.jsx` (8 ChecklistRows)
- [ ] **T4.4** `AIContentSection.jsx` (6 ChecklistRows + Approve all / Regenerate actions)
- [ ] **T4.5** `PublishStatusSection.jsx` (4 ChannelPills + ProgressBar)
- [ ] **T4.6** `ChannelPill.jsx` (icon + name + status + percent)

### Sprint 5 — Reference + KPI

- [ ] **T5.1** `ProductSetsSection.jsx` (collection list + "X more sets" link)
- [ ] **T5.2** `MaterialAlertsSection.jsx` + `D365ChangesSection.jsx` (compact AlertCard)
- [ ] **T5.3** `SalesHistorySection.jsx` (DataTable wired to mock service, sort + page + search)
- [ ] **T5.4** `KPISummaryPanel.jsx` (2 MetricTiles)
- [ ] **T5.5** `OverviewPanel.jsx` — orchestrate all sections, derive loading/error/empty from `useProduct360(sku)`

### Sprint 6 — Service + states

- [ ] **T6.1** `src/services/dashboardService.js` (getProduct360, getSales) with 250ms simulated latency
- [ ] **T6.2** `src/hooks/useProduct360.js` (data + loading + error + refetch)
- [ ] **T6.3** Add loading skeletons per section, error retry, empty states

### Sprint 7 — Polish

- [ ] **T7.1** Apply `hover:-translate-y-px hover:shadow-hover transition-all duration-200` consistently
- [ ] **T7.2** Add `tabnum` class to all numeric values
- [ ] **T7.3** Verify responsive at md/lg/xl breakpoints; collapse table to card list < 768px
- [ ] **T7.4** Add `prefers-reduced-motion` guard on the `spinner` and progress ring animations
- [ ] **T7.5** Add keyboard nav to ImageGallery (←/→ arrows)
- [ ] **T7.6** Replace existing 4 hardcoded KPI tiles + Media/Docs/AI/Publish/Sales panels (lines 604-1119) with `<OverviewPanel />`; remove dead literals

### Sprint 8 — Optional (deferred)

- [ ] **T8.1** Add `recharts` (~80KB gz) for line chart of units-sold-over-time
- [ ] **T8.2** Real D365 sync integration behind `dashboardService.getProduct360`
- [ ] **T8.3** Drill drawers (right-side, D365-style) for customer / material / change details
- [ ] **T8.4** TypeScript migration of `pim-react` (`tsconfig.json`, rename `.jsx` → `.tsx`, port interfaces)
- [ ] **T8.5** Backend `Product360` endpoint in `pim-api` (C#) aggregating from `Product`, `ProductDocument`, `VisualAsset`, `ProductTranslation`, `SyncLog`

---

## Appendix A — File touch list

| File | Action | Reason |
|---|---|---|
| `pim-react/src/data/dashboard-detail.json` | **CREATE** | Seed 360 payload per product |
| `pim-react/src/types/dashboard.js` | **CREATE** | JSDoc typedefs (or `.ts` if migrating) |
| `pim-react/src/services/dashboardService.js` | **CREATE** | Mock API |
| `pim-react/src/hooks/useProduct360.js` | **CREATE** | Data hook |
| `pim-react/src/components/ui/{Card,StatusBadge,ProgressBar,ProgressRing,MetricTile,ChecklistRow,DataTable,EmptyState,LoadingState,ErrorState,ChannelPill}.jsx` | **CREATE ×11** | Atomic components |
| `pim-react/src/components/dashboard/{DashboardHeader,NotificationBell,UserAvatar,PageTopbar,ProductHero,ImageGallery,ProductInfo,DataQualityPanel,AlertCard,AlertStrip,MediaAssetsSection,DocumentsSection,AIContentSection,PublishStatusSection,ProductSetsSection,MaterialAlertsSection,D365ChangesSection,SalesHistorySection,KPISummaryPanel,OverviewPanel}.jsx` | **CREATE ×21** | Composite components |
| `pim-react/src/store/DataContext.jsx` | **EDIT** | Add `state.dashboardByProduct` |
| `pim-react/src/components/layout/Layout.jsx` | **EDIT** | Optionally render `<DashboardHeader>` |
| `pim-react/src/pages/Products.jsx` | **EDIT** | Replace lines 604-1119 with `<OverviewPanel />` |
| `tailwind.config.js` | **EDIT** | Add success/warning/error/info palettes |
| `pim-react/src/index.css` | **EDIT** | Optional: spinner keyframes, ring transition |

**Net effect**: 1 page edit (Products.jsx ~500 lines shrink to ~50), 32 new files, 2 config edits, zero breaking changes to other pages.
