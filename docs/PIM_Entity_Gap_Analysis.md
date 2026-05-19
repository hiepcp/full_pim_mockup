# PIM Entity Gap Analysis — Những Entity Còn Thiếu

## 1. Tổng Quan Hiện Trạng

### Đã Triển Khai (Module 1: Content Management)

| Entity | Mô tả | Bảng DB |
|--------|--------|---------|
| `Product` | Sản phẩm master (range/master/variant gộp chung) | `products` |
| `ProductVariant` | Biến thể sản phẩm (color, size, style, config) | *(domain entity, chưa có bảng riêng trong migration)* |
| `VisualAsset` | Hình ảnh, video, 3D CAD, swatches | `visual_assets` |
| `TextContent` | Mô tả B2B/B2C, USP, care instructions | `text_contents` |
| `ProductDocument` | Catalogue, technical sheet, maintenance guide | `product_documents` |

### Enums Đã Có

`AssetType`, `AssetStatus`, `ContentStatus`, `DocumentType`, `ProductLevel`, `TextContentType`

---

## 2. Entities Cần Bổ Sung

### 2.1 Pricing (Giá) — BRD §2.2, Field Mapping §2

> D365 cung cấp giá qua `ReleasedProductV2` và `SalesPriceTrade` / `PurchasePriceTrade`. PIM cần lưu cache để hiển thị cho Sales Rep.

| Entity Đề Xuất | Fields Chính | Nguồn D365 |
|-----------------|--------------|-------------|
| `ProductPricing` | ProductId, SalesPrice, PurchasePrice, UnitCost, SalesUnit, PurchaseUnit, Currency, PriceDate, SyncedAt | `ReleasedProductV2`, `SalesPriceTrade` |

---

### 2.2 Physical Dimensions (Kích thước vật lý) — BRD §2.2, Field Mapping §3

> Dimensions (height, width, depth, weight, volume) hiện chưa có entity riêng.

| Entity Đề Xuất | Fields Chính | Nguồn D365 |
|-----------------|--------------|-------------|
| `ProductDimension` | ProductId, Height, Width, Depth, Volume, NetWeight, TareWeight, UnitOfMeasure, SyncedAt | `ReleasedProductV2`, `PhysicalProductDimensionDetails` |

---

### 2.3 Product Category / Range Hierarchy — BRD §2.1 Range Name, Field Mapping §4

> Hiện tại `range_name` chỉ là string trên bảng `products`. Cần entity riêng để quản lý cây phân cấp (hierarchy).

| Entity Đề Xuất | Fields Chính | Nguồn D365 |
|-----------------|--------------|-------------|
| `CategoryHierarchy` | Id, HierarchyName, Description | `ProductCategoryHierarchy` |
| `Category` | Id, HierarchyId, ParentId, Code, Name, FriendlyName, Description, Keywords, ExternalId, IsTangible | `ProductCategory` |
| `ProductCategoryAssignment` | ProductId, CategoryId | `ProductCategoryAssignment`, `ReleasedProductCategory` |

---

### 2.4 Product Attributes (Custom Metadata) — BRD §2.1.4, Field Mapping §5

> Designer, Material, Finish, Sustainability Rating... hiện chỉ có `designer` là field cứng trên `products`. Cần hệ thống attribute linh hoạt (EAV pattern).

| Entity Đề Xuất | Fields Chính | Nguồn D365 |
|-----------------|--------------|-------------|
| `AttributeDefinition` | Id, Name, DataType (Text/Integer/Decimal/DateTime/Boolean/Currency), GroupName, IsRequired | `ProductAttribute`, `ProductAttributeValueType` |
| `ProductAttributeValue` | Id, ProductId, AttributeDefinitionId, TextValue, IntegerValue, DecimalValue, DateTimeValue, BooleanValue, CurrencyValue, CurrencyCode, UnitOfMeasure | `ProductAttributeValueV3` |

---

### 2.5 Translations / Localization — BRD §2.1.2, Field Mapping §6

> Hiện `text_contents` có `language_code` nhưng thiếu entity cho product name/description translations từ D365.

| Entity Đề Xuất | Fields Chính | Nguồn D365 |
|-----------------|--------------|-------------|
| `ProductTranslation` | ProductId, LanguageCode, Name, Description, SyncedAt | `ProductTranslation` |
| `VariantDimensionTranslation` | VariantId, DimensionType (Color/Size/Style/Config), LanguageCode, TranslatedName | `ProductMasterColorTranslation`, `ProductMasterSizeTranslation`, etc. |
| `AttributeTranslation` | AttributeDefinitionId, LanguageCode, TranslatedName | `ProductAttributeTranslation` |

---

### 2.6 Product Lifecycle State — BRD §2.2, Field Mapping §8

> Lifecycle (Active, Discontinued, End-of-Life) hiện chỉ có `Status` string trên Product. Cần entity riêng để map D365 lifecycle states.

| Entity Đề Xuất | Fields Chính | Nguồn D365 |
|-----------------|--------------|-------------|
| `ProductLifecycle` | ProductId, LifecycleStateId, StateName, ValidFrom, ValidTo, SellStartDate, SellEndDate, IsBlocked, SyncedAt | `ReleasedProductV2`, `ProductLifecycleState` |

---

### 2.7 Sync Log / Integration Audit — BRD §2.2.2

> Cần tracking mỗi lần sync D365 → PIM để debug và audit.

| Entity Đề Xuất | Fields Chính | Nguồn |
|-----------------|--------------|-------|
| `SyncLog` | Id, EntityType, EntityId, Direction (D365→PIM / PIM→D365), Status (Success/Failed/Partial), ErrorMessage, StartedAt, CompletedAt, RecordsProcessed | PIM-native |
| `SyncConfiguration` | Id, EntityType, Direction, Schedule (cron), IsEnabled, LastRunAt | PIM-native |

---

### 2.8 Content Approval Workflow — BRD §2.1.2, User Stories

> `text_contents` có `status` và `approved_by` nhưng thiếu entity cho workflow history (ai approve, ai reject, comment).

| Entity Đề Xuất | Fields Chính | Nguồn |
|-----------------|--------------|-------|
| `ContentApprovalHistory` | Id, ContentId, ContentType (TextContent/VisualAsset/Document), FromStatus, ToStatus, ActionBy, Comment, ActionAt | PIM-native |

---

### 2.9 Asset Rendition (Image Engine Output) — BRD §2.3.1

> Image Engine tạo nhiều kích thước/format từ 1 asset gốc. Cần lưu các rendition.

| Entity Đề Xuất | Fields Chính | Nguồn |
|-----------------|--------------|-------|
| `AssetRendition` | Id, OriginalAssetId, Purpose (Web/Social/Print/Thumbnail), Width, Height, Format (JPEG/PNG/WebP), FileSize, BlobPath, CdnUrl, GeneratedAt | PIM-native (Image Engine) |

---

### 2.10 Content Distribution / Usage Log — BRD §2.2.2, §2.3.2

> Tracking nơi content được sử dụng (webshop, iPaper, social media...).

| Entity Đề Xuất | Fields Chính | Nguồn |
|-----------------|--------------|-------|
| `ContentUsageLog` | Id, ContentType, ContentId, Channel (Webshop/iPaper/SocialMedia/Email), DistributedAt, DistributedBy, ExternalUrl | PIM-native |
| `DistributionChannel` | Id, Name, Type, ApiEndpoint, IsActive | PIM-native |

---

### 2.11 AI Content Draft — BRD §2.4.1

> AI-generated content cần lưu riêng trước khi được approve vào TextContent chính thức.

| Entity Đề Xuất | Fields Chính | Nguồn |
|-----------------|--------------|-------|
| `AiContentDraft` | Id, ProductId, ContentType, LanguageCode, Prompt, GeneratedBody, ModelUsed, Confidence, Status (Generated/Accepted/Rejected), ReviewedBy, CreatedAt | PIM-native (AI Service) |

---

## 3. Tóm Tắt Ưu Tiên Triển Khai

| Ưu Tiên | Entity Group | Lý Do |
|----------|--------------|--------|
| **P0 — Cần ngay** | ProductPricing, ProductDimension, Category/Hierarchy, ProductCategoryAssignment | Dữ liệu core từ D365, Sales Rep cần xem ngay |
| **P1 — Quan trọng** | AttributeDefinition, ProductAttributeValue, ProductTranslation, ProductLifecycle | Metadata linh hoạt + đa ngôn ngữ |
| **P2 — Cần cho workflow** | SyncLog, SyncConfiguration, ContentApprovalHistory | Audit, debug, governance |
| **P3 — Phase sau** | AssetRendition, ContentUsageLog, DistributionChannel | Image Engine + Distribution |
| **P4 — Future** | AiContentDraft, VariantDimensionTranslation, AttributeTranslation | AI features + full localization |

---

## 4. Entity Relationship Diagram (Tổng Quan)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CategoryHierarchy                         │
│                              │                                   │
│                         Category (tree)                          │
│                              │                                   │
│                  ProductCategoryAssignment                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                           Product                                 │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────┐              │
│  │Pricing  │  │Dimensions    │  │Lifecycle      │              │
│  └─────────┘  └──────────────┘  └───────────────┘              │
│  ┌─────────────────┐  ┌──────────────────────────┐             │
│  │ProductTranslation│  │ProductAttributeValue     │             │
│  └─────────────────┘  │  → AttributeDefinition   │             │
│                        └──────────────────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  ProductVariant (1:N)                                            │
│  ┌──────────────────────────────┐                               │
│  │VariantDimensionTranslation   │                               │
│  └──────────────────────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│  VisualAsset (1:N) ──→ AssetRendition (1:N)                     │
│  TextContent (1:N) ──→ AiContentDraft                           │
│  ProductDocument (1:N)                                           │
├─────────────────────────────────────────────────────────────────┤
│  ContentApprovalHistory                                          │
│  ContentUsageLog ──→ DistributionChannel                        │
│  SyncLog / SyncConfiguration                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Ghi Chú Kỹ Thuật

1. **EAV cho Attributes**: Dùng pattern Entity-Attribute-Value cho custom attributes thay vì thêm column cứng. Linh hoạt khi D365 thêm attribute mới.
2. **Sync Strategy**: Pricing, Dimensions, Lifecycle nên sync event-driven (Service Bus) + scheduled fallback (mỗi 15 phút).
3. **Category Tree**: Dùng `ParentId` self-referencing hoặc Materialized Path cho query hiệu quả.
4. **Renditions**: Không lưu binary trong DB — chỉ metadata + Blob URI.
5. **Translations**: Tách riêng bảng translation thay vì nhúng vào entity chính để dễ scale ngôn ngữ mới.
