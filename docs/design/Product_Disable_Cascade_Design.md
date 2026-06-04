# Product & Variant Disable Cascade — Design Document

## 1. Current State Summary

### 1.1 Product Entity

`Product.Status` is a free-form `string` ("Active" | "Discontinued" | "Draft"). No `IsDeleted`, `IsDisabled`, or `IsBlocked` boolean flag exists. Mapped from D365 lifecycle states via `D365ProductMapper.MapLifecycleToStatus()`.

File: `[pim-api/src/Pim.Domain/Entities/Product.cs](pim-api/src/Pim.Domain/Entities/Product.cs)`

```csharp
public sealed class Product
{
    public Guid Id { get; set; }
    public string Status { get; set; } = "Draft";   // free-form string, not enum
    // ... no IsDeleted / IsDisabled field
}
```

### 1.2 ProductVariant Entity

`ProductVariant.Status` is an `int`. **No FK to `products` table** — linked via string matching `ProductMasterNumber` = `Product.D365ItemNumber`. No `IsDeleted` flag.

File: `[pim-api/src/Pim.Domain/Entities/ProductVariant.cs](pim-api/src/Pim.Domain/Entities/ProductVariant.cs)`

```csharp
public class ProductVariant
{
    public Guid Id { get; set; }
    public string ProductMasterNumber { get; set; } = string.Empty;  // string link, not FK
    public int Status { get; set; }                                   // int, not enum
    // ... no IsDeleted / ProductId field
}
```

### 1.3 Related Entity Status Enums (Already Support "Archived")

Both `AssetStatus` and `ContentStatus` enums already include `Archived = 4`:

File: `[pim-api/src/Pim.Domain/Enums/AssetStatus.cs](pim-api/src/Pim.Domain/Enums/AssetStatus.cs)`

```csharp
public enum AssetStatus { Draft = 0, PendingReview = 1, Approved = 2, Published = 3, Archived = 4 }
```

File: `[pim-api/src/Pim.Domain/Enums/ContentStatus.cs](pim-api/src/Pim.Domain/Enums/ContentStatus.cs)`

```csharp
public enum ContentStatus { Draft = 0, InReview = 1, Approved = 2, Published = 3, Archived = 4 }
```

### 1.4 Database Foreign Key Behaviors

**Production schema** (`[docker/init-db.sql](docker/init-db.sql)` — PostgreSQL):

| Child Table | FK Column | On Product Delete | Impact When Product Disabled |
|---|---|---|---|
| `visual_assets` | `product_id` | **SET NULL** | Asset becomes orphan — DB drops FK. Campaign still references orphan asset. |
| `text_contents` | `product_id` | **CASCADE** | All text content deleted — audit trail destroyed. |
| `product_documents` | `product_id` | **SET NULL** | Document becomes orphan — same issue as visual_assets. |
| `product_variants` | (none) | N/A | Variants remain active — inconsistency: parent disabled but child active. |
| `campaign_assets` | `asset_id` → visual_assets | CASCADE | If assets cascade-deleted, campaign assets silently drop. |

**Migration schema** (`[pim-api/migrations/db/pim_db/V001__module1_content_management.sql](pim-api/migrations/db/pim_db/V001__module1_content_management.sql)` — MySQL):

| Child Table | FK Column | On Product Delete |
|---|---|---|
| `visual_assets` | `product_id` | **CASCADE** — deletes all assets |
| `text_contents` | `product_id` | **CASCADE** — deletes all content |
| `product_documents` | `product_id` | **CASCADE** — deletes all documents |

**Key mismatch**: Production (Postgres) uses SET NULL for assets/documents; migration (MySQL) uses CASCADE. Both approaches are destructive — neither supports soft-disable.

### 1.5 Campaign & Social (Database-Only, No C# Entities)

Tables exist in `[docker/init-db.sql](docker/init-db.sql)` but have zero C# entity classes:

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    platforms TEXT[] DEFAULT '{}',
    -- ...
);

CREATE TABLE campaign_assets (
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES visual_assets(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, asset_id)
);

CREATE TABLE asset_usage (
    asset_id UUID REFERENCES visual_assets(id) ON DELETE CASCADE,
    channel VARCHAR(100) NOT NULL,       -- e.g. 'SocialMedia', 'Webshop'
    -- ...
);
```

Relationship chain: **Campaign** → campaign_assets → VisualAsset → products(product_id)

### 1.6 What Does NOT Exist

1. No soft-delete mechanism for any entity
2. No disable-cascade business logic — changing Product.Status = "Discontinued" does nothing to variants, assets, text, documents, or campaigns
3. No status/deleted filters in repository queries — even "Discontinued" products show in all lists
4. No `ProductVariant` FK to `Product` — variants float independently
5. No C# entities for Campaign, campaign_assets, or asset_usage
6. No validation when a campaign references assets from disabled/deleted products

### 1.7 Current Delete Endpoint (Hard-Delete Only)

`DELETE /api/products/{id}` in `[pim-api/src/Pim.Api/Controllers/ProductsController.cs](pim-api/src/Pim.Api/Controllers/ProductsController.cs)`:

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(string id, CancellationToken ct)
{
    var deleted = await _service.DeleteAsync(id, ct);
    // ... single-row DELETE FROM products WHERE id = @id::uuid
}
```

No cascade logic in `ProductService.DeleteAsync` (`[pim-api/src/Pim.Application/Services/ProductService.cs](pim-api/src/Pim.Application/Services/ProductService.cs)`). Relies entirely on DB-level FK constraints.

---

## 2. Requirements & Recommendations from Existing Docs

### 2.1 Phase 2 RnD Plan (Soft-Delete Strategy)

From `[docs/rnd/Phase2_RnD_Plan.md](docs/rnd/Phase2_RnD_Plan.md)` (Section C5):

> | Soft-delete D365 (`IsDeleted=true`) phản ánh thế nào? |
> | Soft delete | Mark `is_deleted=true`, giữ row, ẩn khỏi UI; cron 90 ngày purge |

**Recommendation**: When D365 signals product deleted/disabled, PIM should soft-delete (mark `is_deleted=true`), hide from UI, purge after 90 days via cron.

### 2.2 Entity Gap Analysis (Product Lifecycle)

From `[docs/requirements/PIM_Entity_Gap_Analysis.md](docs/requirements/PIM_Entity_Gap_Analysis.md)` (Section 2.6):

Proposes dedicated `ProductLifecycle` entity with `IsBlocked`, `SellStartDate`, `SellEndDate`, lifecycle state ID/name synced from D365. Priority: **P1** ("Quan trọng").

### 2.3 D365 Field Mapping (IsPOSRegistrationBlocked)

From `[docs/dynamics365/D365_PIM_Field_Mapping.md](docs/dynamics365/D365_PIM_Field_Mapping.md)`:

| PIM Field | D365 Entity | D365 Field |
|---|---|---|
| `Pim.Product.IsBlocked` | `ReleasedProductV2` | `IsPOSRegistrationBlocked` |

---

## 3. Design: Three-Tier Entity Disable Model

### 3.1 Conceptual Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Three-Tier Disable Model                         │
│                                                                     │
│  Tier 1: DISABLE ──── Product is no longer commerce-active          │
│  (Status = "Discontinued")   Keep data, hide from active views      │
│           │                                                         │
│  Tier 2: SOFT-DELETE ─ Product is gone, hidden everywhere           │
│  (IsDeleted = true)          Purge after 90 days                    │
│           │                                                         │
│  Tier 3: HARD-DELETE ── Row physically removed from DB              │
│  (actual DELETE)              Only via purging cron                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Tier 1 (Disable)** = Product lifecycle ended (discontinued, end-of-life). Product data preserved for audit/history, but excluded from active commerce views and distribution channels.

**Tier 2 (Soft-Delete)** = Product intentionally removed from system. Hidden everywhere. Retained 90 days for undo/recovery.

**Tier 3 (Hard-Delete)** = Permanent removal. Only via automated cron after 90 days in soft-deleted state.

### 3.2 Tier Comparison

| Property | Disable (Status="Discontinued") | Soft-Delete (IsDeleted=true) | Hard-Delete |
|---|---|---|---|
| Visible in UI (default) | No | No | N/A |
| Visible in Admin view | Yes | Yes (with filter) | No |
| Variant status | Disabled (cascade) | Soft-deleted (cascade) | Marked for purge |
| Asset status | Archived | Archived | Cascade-clean |
| Text content | Archived | Archived | Cascade-delete |
| Campaign impact | Warning + needs_review | Warning + needs_review | Campaign orphaned |
| Recoverable | Yes (re-enable) | Yes (undo within 90d) | No |
| Purge timeline | Never auto-purge | 90 days | Immediate |

---

## 4. Database Schema Changes

### 4.1 Add Soft-Delete Columns to products

```sql
ALTER TABLE products
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN deleted_at TIMESTAMPTZ,
    ADD COLUMN disabled_at TIMESTAMPTZ,
    ADD COLUMN disabled_reason VARCHAR(500);

-- Partial index for active-query performance
CREATE INDEX idx_products_active
    ON products (id) WHERE is_deleted = FALSE AND status != 'Discontinued';
```

### 4.2 Add Soft-Delete Columns + FK to product_variants

```sql
ALTER TABLE product_variants
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN deleted_at TIMESTAMPTZ,
    ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Index for active-query performance
CREATE INDEX idx_variants_active
    ON product_variants (product_master_number) WHERE is_deleted = FALSE;
```

**Rationale for `product_id` FK**: Currently `ProductVariant` links to Product via string matching (`ProductMasterNumber` = `Product.D365ItemNumber`). Adding a proper FK enables:
- Cascade lookups without string matching
- Referential integrity when product is soft-deleted
- Efficient bulk updates on disable/deletion

### 4.3 Add needs_review Column to campaigns

```sql
ALTER TABLE campaigns
    ADD COLUMN needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN review_reason VARCHAR(1000);

UPDATE campaigns SET needs_review = FALSE;
```

### 4.4 Migration Script Location

New migration: `pim-api/migrations/db/pim_db/V003__module1_soft_delete.sql`

Alternatively, update `[docker/init-db.sql](docker/init-db.sql)` directly since we are using PostgreSQL (no Flyway migration runner for Postgres yet).

---

## 5. C# Entity Changes

### 5.1 Product Entity

File: `[pim-api/src/Pim.Domain/Entities/Product.cs](pim-api/src/Pim.Domain/Entities/Product.cs)`

Add fields:

```csharp
public bool IsDeleted { get; set; }
public DateTime? DeletedAt { get; set; }
public DateTime? DisabledAt { get; set; }
public string DisabledReason { get; set; } = string.Empty;
```

### 5.2 ProductVariant Entity

File: `[pim-api/src/Pim.Domain/Entities/ProductVariant.cs](pim-api/src/Pim.Domain/Entities/ProductVariant.cs)`

Add fields:

```csharp
public Guid? ProductId { get; set; }          // new FK
public bool IsDeleted { get; set; }
public DateTime? DeletedAt { get; set; }
```

**Also add a `VariantStatus` enum** to replace the raw `int Status`:

```csharp
public enum VariantStatus
{
    Active = 0,
    Disabled = 1,
    Discontinued = 2
}
```

(Optional — can keep as int with constants for now.)

### 5.3 DTO Changes

File: `[pim-api/src/Pim.Application/Dtos/ProductDtos.cs](pim-api/src/Pim.Application/Dtos/ProductDtos.cs)` (or wherever DTOs are defined)

Add to response DTOs:

```csharp
public bool IsDeleted { get; set; }
public DateTime? DisabledAt { get; set; }
public string? DisabledReason { get; set; }
```

---

## 6. Cascade Rules — Detailed

### 6.1 Rule Set: Product.Disable()

Trigger: `Product.Status` set to `"Discontinued"` + `Product.DisabledAt = DateTime.UtcNow`

```
Task<Product>.Disable
  │
  ├─ Step 1: Product.DisabledAt = now()
  │          Product.Status = "Discontinued"
  │
  ├─ Step 2: ProductVariant.BulkDisableByMasterNumber(masterNumber)
  │          SET status = 1 (Disabled), updated_at = now()
  │          WHERE product_master_number = @masterNumber
  │
  ├─ Step 3: VisualAsset.BulkArchiveByProductId(productId)
  │          SET status = 4 (Archived), updated_at = now()
  │          WHERE product_id = @productId
  │
  ├─ Step 4: TextContent.BulkArchiveByProductId(productId)
  │          SET status = 4 (Archived), updated_at = now()
  │          WHERE product_id = @productId
  │
  ├─ Step 5: ProductDocument.BulkArchiveByProductId(productId)
  │          SET status = 4 (Archived), updated_at = now()
  │          WHERE product_id = @productId
  │
  ├─ Step 6: Campaign.MarkNeedsReviewForProduct(productId)
  │          Find campaigns linked to this product's assets
  │          SET needs_review = TRUE, review_reason = msg
  │          (Async, non-blocking — fire-and-forget or background job)
  │
  └─ Step 7 (No-op): asset_usage — keep history
           Category/Attribute/Pricing/Translation — no change
```

### 6.2 Rule Set: Product.SoftDelete()

Trigger: `Product.IsDeleted = true` + `Product.DeletedAt = DateTime.UtcNow`

```
Task<Product>.SoftDelete
  │
  ├─ Step 1: Product.IsDeleted = true, Product.DeletedAt = now()
  │
  ├─ Step 2: ProductVariant.BulkSoftDeleteByMasterNumber(masterNumber)
  │          SET is_deleted = TRUE, deleted_at = now()
  │          WHERE product_master_number = @masterNumber
  │
  ├─ Step 3: VisualAsset.BulkArchiveByProductId(productId)
  │          (Same as disable)
  │
  ├─ Step 4: TextContent.BulkArchiveByProductId(productId)
  │
  ├─ Step 5: ProductDocument.BulkArchiveByProductId(productId)
  │
  ├─ Step 6: Campaign.MarkNeedsReviewForProduct(productId)
  │
  └─ Step 7: Schedule cron job for hard-purge after 90 days
             INSERT INTO purge_queue (entity_type, entity_id, purge_at)
```

### 6.3 Rule Set: Product.ReEnable() (Undo Disable)

Trigger: `Product.Status` restored to `"Active"` + `Product.DisabledAt = null`

```
Task<Product>.ReEnable
  │
  ├─ Step 1: Product.DisabledAt = null
  │          Product.Status = "Active"
  │
  ├─ Step 2: ProductVariant.BulkReEnableByMasterNumber(masterNumber)
  │          SET status = 0 (Active), updated_at = now()
  │          WHERE product_master_number = @masterNumber
  │
  ├─ Step 3: VisualAsset.BulkRestoreByProductId(productId)
  │          SET status = status_before_archive (stored or set to 'Draft')
  │          WHERE product_id = @productId AND status = 4
  │
  ├─ Step 4: TextContent.BulkRestoreByProductId(productId)
  │
  ├─ Step 5: ProductDocument.BulkRestoreByProductId(productId)
  │
  └─ Step 6: Campaign.ClearNeedsReviewForProduct(productId)
             (Optional — leave for user to manually approve)
```

### 6.4 Rule Set: Product.UndoDelete() (Undo Soft-Delete, within 90 days)

Trigger: `Product.IsDeleted = false` + `Product.DeletedAt = null`

Same as ReEnable, plus:
- Cancel purge_queue entry
- Variant: SET is_deleted = FALSE, deleted_at = NULL

### 6.5 What Should NOT Change on Disable/Delete

| Entity | Reason |
|---|---|
| `ProductCategoryAssignment` | Category membership is structural, not lifecycle |
| `ProductAttributeValue` | Attribute data is factual, not status-dependent |
| `ProductTranslation` | Translations remain valid unless explicitly retired |
| `ProductPricing` | Historical pricing data preserved |
| `ProductDimension` | Physical dimensions unchanged |
| `asset_usage` | Distribution history preserved for analytics |
| `performance_metrics` | Analytics data preserved |
| `SyncLog` | Audit trail preserved |

### 6.6 Variant-Only Disable

Allows disabling a single variant without affecting the parent product:

```
Task<ProductVariant>.Disable(variantId)
  │
  ├─ Variant.status = 1 (Disabled), updated_at = now()
  │
  └─ (No parent cascade — product remains active)
```

---

## 7. Query Filtering — Auto-Exclude Disabled/Deleted

### 7.1 Repository Pattern: FilterByDefault()

All repository read methods should auto-filter out disabled/deleted rows:

```csharp
// SqlProductRepository
public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken ct)
{
    const string sql = @"
        SELECT ...
        FROM products
        WHERE is_deleted = FALSE
        ORDER BY updated_at DESC";
    return (await Connection.QueryAsync<Product>(sql)).ToList();
}
```

**Exception**: Admin endpoints should accept `?includeDeleted=true` or `?includeDisabled=true` query params to override the filter.

### 7.2 Filter Table

| Repository Method | Default Filter | Override |
|---|---|---|
| `GetAllAsync` | `is_deleted = false` | `?includeDeleted=true` |
| `GetPagedAsync` | `is_deleted = false AND status != 'Discontinued'` | `?includeDisabled=true&includeDeleted=true` |
| `SearchAsync` | `is_deleted = false AND status != 'Discontinued'` | `?includeDisabled=true` |
| `GetByIdAsync` | (none — return even if deleted, for admin detail view) | N/A |
| `GetByMasterNumberAsync` (variants) | `is_deleted = false` | `?includeDeleted=true` |

### 7.3 Index Support

```sql
-- Product active-only index (used by default queries)
CREATE INDEX idx_products_active ON products (updated_at DESC)
    WHERE is_deleted = FALSE AND status != 'Discontinued';

-- Variant active-only index
CREATE INDEX idx_variants_active ON product_variants (product_master_number, variant_number)
    WHERE is_deleted = FALSE;
```

---

## 8. Campaign Validation (Future, When C# Entity Exists)

### 8.1 Campaign Publish Validation

Before a campaign transitions to `Published`:

```csharp
public async Task<ValidationResult> ValidateCampaignForPublish(Guid campaignId)
{
    // Get all assets in campaign
    var assetIds = await GetCampaignAssetIds(campaignId);

    // Check: are any assets orphaned (product_id IS NULL)?
    // Check: are any assets linked to disabled/deleted products?
    var invalidAssets = await _db.QueryAsync(@"
        SELECT va.id, va.file_name, p.name as product_name, p.status, p.is_deleted
        FROM visual_assets va
        LEFT JOIN products p ON va.product_id = p.id
        WHERE va.id = ANY(@assetIds)
          AND (p.is_deleted = TRUE OR p.status = 'Discontinued' OR p.id IS NULL)
    ", new { assetIds });

    if (invalidAssets.Any())
    {
        return ValidationResult.Fail(
            "Campaign contains assets from disabled products",
            invalidAssets
        );
    }

    return ValidationResult.Ok();
}
```

### 8.2 Auto-Mark Campaign as Needs Review

When a product is disabled/deleted, find all campaigns referencing its assets:

```sql
UPDATE campaigns
SET needs_review = TRUE,
    review_reason = 'One or more campaign assets belong to disabled product(s)',
    status = CASE WHEN status = 'Published' THEN 'NeedsReview' ELSE status END,
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT ca.campaign_id
    FROM campaign_assets ca
    JOIN visual_assets va ON ca.asset_id = va.id
    WHERE va.product_id = @productId
);
```

### 8.3 UI Warning Message

When viewing a campaign with `needs_review = TRUE`:

> **Review Required**: This campaign contains assets from the following disabled or deleted products: *[Product A, Product B]*. These assets should be replaced before publishing.

---

## 9. Social Media Post Implications (Future)

When a product is disabled after its assets have already been published to social media:

### 9.1 Already-Published Posts

Do NOT auto-delete social media posts. The post already exists on the platform with its own engagement data. Instead:

1. Mark `asset_usage` status as `product_disabled` (new column or tag)
2. In PIM admin, show warning on the asset: "This asset was published to [Facebook/LinkedIn] but its product is now disabled."
3. Provide an optional "Archive social post" action (requires social platform API integration)

### 9.2 Scheduled But Not Yet Published

If a campaign is scheduled (`scheduled_at` in the future) and its product gets disabled:

1. Block campaign publishing — set `needs_review = TRUE`
2. Notify campaign owner: "[Product X] was disabled. Campaign [Campaign Y] scheduled for [date] needs review."
3. Campaign stays in "Needs Review" until owner resolves

---

## 10. Purge Cron Job (90-Day Cleanup)

### 10.1 Purpose

Products soft-deleted more than 90 days ago are permanently removed.

### 10.2 Implementation Options

**Option A**: Hangfire recurring job (preferred — existing infrastructure)

```csharp
// Register in Hangfire
RecurringJob.AddOrUpdate<PurgeService>(
    "purge-soft-deleted-products",
    svc => svc.PurgeExpiredAsync(CancellationToken.None),
    Cron.Daily(3, 0)  // 3 AM daily
);
```

**Option B**: PostgreSQL cron (pg_cron) if Hangfire not available

**Option C**: Simple console app in Windows Task Scheduler

### 10.3 Purge Logic

```
1. SELECT products WHERE is_deleted = TRUE AND deleted_at < NOW() - INTERVAL '90 days'
2. For each product:
   a. Hard-delete product_variants WHERE product_master_number = product.D365ItemNumber
   b. Hard-delete visual_assets WHERE product_id = product.Id    (SET NULL first to break campaign_assets FK)
   c. Hard-delete text_contents WHERE product_id = product.Id    (CASCADE may handle)
   d. Hard-delete product_documents WHERE product_id = product.Id
   e. Hard-delete product
3. Log purge_count for audit
```

### 10.4 Safety Checks

- Never purge products with `is_deleted = FALSE`
- Never purge products with `deleted_at > NOW() - INTERVAL '90 days'`
- Log every purge action to `purge_log` table

---

## 11. API Endpoints

### 11.1 Product Disable

```
POST /api/products/{id}/disable
Body (optional): { "reason": "End of life Q4 2025" }

Response: 200 { "success": true, "message": "Product disabled. Variants, assets, and content archived." }
```

### 11.2 Product Enable (Undo Disable)

```
POST /api/products/{id}/enable

Response: 200 { "success": true, "message": "Product re-enabled." }
```

### 11.3 Product Soft-Delete

```
DELETE /api/products/{id}  (behavior changed: now soft-delete, not hard-delete)

Response: 200 { "success": true, "message": "Product soft-deleted. Purge scheduled in 90 days." }
```

### 11.4 Product Hard-Delete (Admin Only, Immediate)

```
DELETE /api/products/{id}/permanent

Response: 200 { "success": true, "message": "Product permanently deleted." }
```

### 11.5 Undo Soft-Delete

```
POST /api/products/{id}/restore

Response: 200 { "success": true, "message": "Product restored." }
```

### 11.6 Variant Disable

```
POST /api/variants/{variantNumber}/disable

Response: 200 { "success": true, "message": "Variant disabled." }
```

### 11.7 Query All Products (with filters)

```
GET /api/products
  ?includeDisabled=true          // show disabled products too
  ?includeDeleted=true           // show soft-deleted products too
  ?status=Discontinued           // filter by specific status
```

---

## 12. Implementation Phases

### Phase A: Database Schema (V003 Migration)

| Task | File(s) |
|---|---|
| A1 | Add `is_deleted`, `deleted_at`, `disabled_at`, `disabled_reason` to `products` | `[docker/init-db.sql](docker/init-db.sql)` or new migration |
| A2 | Add `is_deleted`, `deleted_at`, `product_id` (FK) to `product_variants` | Same file |
| A3 | Add `needs_review`, `review_reason` to `campaigns` | Same file |
| A4 | Add partial indexes for active-only queries | Same file |
| A5 | Create `purge_log` audit table | Same file |

### Phase B: Domain Entities + DTOs

| Task | File(s) |
|---|---|
| B1 | Add fields to `Product` entity | `[pim-api/src/Pim.Domain/Entities/Product.cs](pim-api/src/Pim.Domain/Entities/Product.cs)` |
| B2 | Add fields to `ProductVariant` entity | `[pim-api/src/Pim.Domain/Entities/ProductVariant.cs](pim-api/src/Pim.Domain/Entities/ProductVariant.cs)` |
| B3 | Create `VariantStatus` enum | New file in `Enums/` |
| B4 | Add fields to response DTOs | `[pim-api/src/Pim.Application/Dtos/](pim-api/src/Pim.Application/Dtos/)` |
| B5 | Add `DisableProductRequest` / `SoftDeleteRequest` DTOs | Same path |

### Phase C: Repository — Bulk Operations + Filters

| Task | File(s) |
|---|---|
| C1 | Add filter to `GetAllAsync`, `GetPagedAsync`, `SearchAsync` | `[pim-api/src/Pim.Infrastructure/Repositories/SqlProductRepository.cs](pim-api/src/Pim.Infrastructure/Repositories/SqlProductRepository.cs)` |
| C2 | Add `BulkArchiveByProductId` for visual_assets, text_contents, product_documents | New repository methods or direct SQL in service |
| C3 | Add `BulkDisableByMasterNumber` for product_variants | `[pim-api/src/Pim.Infrastructure/Repositories/SqlProductVariantRepository.cs](pim-api/src/Pim.Infrastructure/Repositories/SqlProductVariantRepository.cs)` |
| C4 | Add `BulkSoftDeleteByMasterNumber` for product_variants | Same file |
| C5 | Add filter to variant queries | Same file |

### Phase D: Service Layer — Cascade Logic

| Task | File(s) |
|---|---|
| D1 | `DisableAsync`, `EnableAsync`, `SoftDeleteAsync`, `RestoreAsync` methods | `[pim-api/src/Pim.Application/Services/ProductService.cs](pim-api/src/Pim.Application/Services/ProductService.cs)` |
| D2 | Campaign needs_review marking (async fire-and-forget) | Same file or new `CampaignService` |
| D3 | Update `DeleteAsync` → soft-delete by default | Same file |

### Phase E: API Endpoints

| Task | File(s) |
|---|---|
| E1 | `POST /api/products/{id}/disable` | `[pim-api/src/Pim.Api/Controllers/ProductsController.cs](pim-api/src/Pim.Api/Controllers/ProductsController.cs)` |
| E2 | `POST /api/products/{id}/enable` | Same file |
| E3 | `DELETE /api/products/{id}/permanent` | Same file |
| E4 | `POST /api/products/{id}/restore` | Same file |
| E5 | `POST /api/variants/{variantNumber}/disable` | `[pim-api/src/Pim.Api/Controllers/VariantsController.cs](pim-api/src/Pim.Api/Controllers/VariantsController.cs)` |

### Phase F: Purge Job (Future)

| Task | File(s) |
|---|---|
| F1 | `PurgeService` with Hangfire recurring job | New file in `Pim.Infrastructure/Jobs/` |
| F2 | `purge_log` table + audit logging | Migration |
| F3 | Hangfire dashboard configuration for monitoring | DI registration in `Program.cs` |

### Phase G: Campaign & Social (Future, after C# entities exist)

| Task | Description |
|---|---|
| G1 | Create `Campaign` C# entity, repository, service |
| G2 | Implement campaign publish validation (check assets) |
| G3 | Auto-mark `needs_review` on product disable |
| G4 | Social post archiving (requires platform API integration) |

---

## 13. Edge Cases & Open Decisions

| # | Scenario | Decision Needed | Current Recommendation |
|---|---|---|---|
| 1 | Product disabled → some variants already manually enabled later → re-enable product, what happens to those variants? | Should re-enable cascade overwrite manual variant states? | **No** — only re-enable variants that were disabled by the cascade. Track "cascade_disabled" vs "manually_disabled" with a boolean. |
| 2 | Product has published social posts → product gets disabled → what happens? | Auto-unpublish? Manual archive? | **No auto action** — mark asset_usage as "product_disabled", show warning in PIM. Manual action to unpublish on social platform. |
| 3 | Campaign in-progress (status=Active) when product disabled | Pause campaign? Block further use? | **Auto-mark needs_review** — campaign stays active but flagged. User must review before next publish. |
| 4 | Product disabled → derived from D365 sync (not manual) | Same cascade rules apply? | **Yes** — D365 is the source of truth. If D365 says discontinued, PIM cascades. |
| 5 | Restore soft-deleted product → variants were individually deleted after | Only restore product-level? | **Product only** — individually deleted variants should not auto-restore. |
| 6 | Hard-delete product that is still referenced by campaigns | Fail or cascade? | **Fail with error** — require user to remove from campaigns first. Don't silently break campaign data. |

---

## 14. Entity State Diagram (Product Lifecycle)

```
                ┌──────────┐
                │  Draft   │
                └────┬─────┘
                     │ activate
                     ▼
                ┌──────────┐
        ┌──────►│  Active  │◄──────────┐
        │       └────┬─────┘           │
        │            │                 │
        │            │ disable         │ enable
        │            ▼                 │ (undo disable)
        │       ┌──────────────┐       │
        │       │ Discontinued │───────┘
        │       └──────┬───────┘
        │              │
        │              │ soft-delete          ┌──────────────┐
        │              ▼                      │              │
        │       ┌──────────────┐    90 days   │  Purged      │
        │       │ Soft-Deleted │──────────────►  (gone)      │
        │       └──────┬───────┘              │              │
        │              │                      └──────────────┘
        │              │ restore
        │              │ (undo soft-delete)
        │              ▼
        │       ┌──────────────┐
        └───────│   Active     │
                └──────────────┘
```
