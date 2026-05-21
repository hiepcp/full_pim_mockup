# D365 ↔ PIM Data Model Mapping

This document maps fields from Microsoft Dynamics 365 (source of truth) to the PIM data model. Use this as the authoritative reference when implementing the D365 integration layer (BRD §5, Implementation Plan §2.2.1).

## 1. Core Product Mapping

### 1.1 Product Master

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Product.MasterNumber` | `ReleasedProductMasterV2` | `ItemNumber` | Primary key. Same value as `ProductNumber` for masters. |
| `Pim.Product.ProductNumber` | `ReleasedProductMasterV2` | `ProductNumber` | Cross-company unique identifier. |
| `Pim.Product.Name` | `ProductTranslation` | `ProductName` (per `LanguageId`) | Use translation table for multi-language. |
| `Pim.Product.SearchName` | `ReleasedProductMasterV2` | `ProductSearchName` / `SearchName` | For full-text search indexing. |
| `Pim.Product.LegalEntity` | `ReleasedProductMasterV2` | `dataAreaId` | Company code. |
| `Pim.Product.Type` | `ReleasedProductMasterV2` | `ProductType` | Enum: Item / Service. |
| `Pim.Product.Subtype` | `ReleasedProductV2` | `ProductSubType` | Enum: Product / ProductMaster / ProductVariant. |
| `Pim.Product.LifecycleState` | `ReleasedProductV2` | `ProductLifecycleStateId` | e.g., Active, Discontinued. |
| `Pim.Product.LifecycleValidFrom` | `ReleasedProductV2` | `ProductLifeCycleValidFromDate` | |
| `Pim.Product.LifecycleValidTo` | `ReleasedProductV2` | `ProductLifeCycleValidToDate` | |
| `Pim.Product.SellStartDate` | `ReleasedProductV2` | `SellStartDate` | |
| `Pim.Product.SellEndDate` | `ReleasedProductV2` | `SellEndDate` | |
| `Pim.Product.IsBlocked` | `ReleasedProductV2` | `IsPOSRegistrationBlocked` | |

### 1.2 Product Variant

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Variant.VariantNumber` | `ReleasedProductVariantV2` | `ProductVariantNumber` | Unique variant identifier. |
| `Pim.Variant.ItemNumber` | `ReleasedProductVariantV2` | `ItemNumber` | Inherits from master. |
| `Pim.Variant.MasterNumber` | `ReleasedProductVariantV2` | `ProductMasterNumber` | Foreign key to master. |
| `Pim.Variant.SizeId` | `ReleasedProductVariantV2` | `ProductSizeId` | Translate via `ProductMasterSizeTranslation`. |
| `Pim.Variant.ColorId` | `ReleasedProductVariantV2` | `ProductColorId` | Translate via `ProductMasterColorTranslation`. |
| `Pim.Variant.StyleId` | `ReleasedProductVariantV2` | `ProductStyleId` | Translate via `ProductMasterStyleTranslation`. |
| `Pim.Variant.ConfigurationId` | `ReleasedProductVariantV2` | `ProductConfigurationId` | |
| `Pim.Variant.VersionId` | `ReleasedProductVariantV2` | `ProductVersionId` | |
| `Pim.Variant.Description` | `ReleasedProductVariantV2` | `ProductDescription` | Single-language fallback. |

## 2. Pricing Mapping

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Pricing.SalesPrice` | `ReleasedProductV2` | `SalesPrice` | Default sales price. |
| `Pim.Pricing.SalesPriceDate` | `ReleasedProductV2` | `SalesPriceDate` | |
| `Pim.Pricing.PurchasePrice` | `ReleasedProductV2` | `PurchasePrice` | |
| `Pim.Pricing.UnitCost` | `ReleasedProductV2` | `UnitCost` | |
| `Pim.Pricing.SalesUnit` | `ReleasedProductV2` | `SalesUnitSymbol` | |
| `Pim.Pricing.PurchaseUnit` | `ReleasedProductV2` | `PurchaseUnitSymbol` | |

For trade agreements, query `SalesPriceTrade` / `PurchasePriceTrade` separately.

## 3. Physical Dimensions Mapping

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Dimensions.Height` | `ReleasedProductV2` | `GrossProductHeight` | |
| `Pim.Dimensions.Width` | `ReleasedProductV2` | `GrossProductWidth` | |
| `Pim.Dimensions.Depth` | `ReleasedProductV2` | `GrossDepth` | |
| `Pim.Dimensions.Volume` | `ReleasedProductV2` | `ProductVolume` | |
| `Pim.Dimensions.NetWeight` | `ReleasedProductV2` | `NetProductWeight` | |
| `Pim.Dimensions.TareWeight` | `ReleasedProductV2` | `TareProductWeight` | |
| `Pim.Dimensions.UnitOfMeasure` | `ReleasedProductV2` | `InventoryUnitSymbol` | |

## 4. Categorization (Range) Mapping

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Range.HierarchyName` | `ProductCategory` | `ProductCategoryHierarchyName` | Top-level hierarchy (e.g., "Sales Hierarchy"). |
| `Pim.Range.CategoryCode` | `ProductCategory` | `CategoryCode` | |
| `Pim.Range.CategoryName` | `ProductCategory` | `CategoryName` | |
| `Pim.Range.FriendlyName` | `ProductCategory` | `FriendlyCategoryName` | Display name. |
| `Pim.Range.Description` | `ProductCategory` | `CategoryDescription` | |
| `Pim.Range.Keywords` | `ProductCategory` | `CategoryKeywords` | Useful for search indexing. |
| `Pim.Range.ParentCode` | `ProductCategory` | `ParentProductCategoryCode` | For tree traversal. |
| `Pim.Range.ExternalId` | `ProductCategory` | `ExternalId` | GUID for external systems. |
| `Pim.Range.IsTangible` | `ProductCategory` | `IsTangibleProduct` | Filter out service categories. |

Product → Category linkage: `ReleasedProductCategory` or `ProductCategoryAssignment`.

## 5. Custom Attributes Mapping (Designer, Material, Finish, etc.)

`ProductAttributeValueV3` is a generic key-value table with typed columns:

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Attribute.ProductNumber` | `ProductAttributeValueV3` | `ProductNumber` | FK to product. |
| `Pim.Attribute.AttributeName` | `ProductAttributeValueV3` | `AttributeName` | e.g., "Designer", "Material". |
| `Pim.Attribute.AttributeType` | `ProductAttributeValueV3` | `AttributeTypeName` | Group of attributes. |
| `Pim.Attribute.DataType` | `ProductAttributeValueV3` | `DataType` | Enum: Text/Integer/Decimal/DateTime/Boolean/Currency/Reference. |
| `Pim.Attribute.TextValue` | `ProductAttributeValueV3` | `TextValue` | Used when DataType=Text. |
| `Pim.Attribute.IntegerValue` | `ProductAttributeValueV3` | `IntegerValue` | Used when DataType=Integer. |
| `Pim.Attribute.DecimalValue` | `ProductAttributeValueV3` | `DecimalValue` | Used when DataType=Decimal. |
| `Pim.Attribute.DateTimeValue` | `ProductAttributeValueV3` | `DateTimeValue` | Used when DataType=DateTime. |
| `Pim.Attribute.BooleanValue` | `ProductAttributeValueV3` | `BooleanValue` | Used when DataType=Boolean. |
| `Pim.Attribute.CurrencyValue` | `ProductAttributeValueV3` | `CurrencyValue` | Used when DataType=Currency. |
| `Pim.Attribute.CurrencyCode` | `ProductAttributeValueV3` | `CurrencyCode` | |
| `Pim.Attribute.UnitOfMeasure` | `ProductAttributeValueV3` | `UnitOfMeasure` | |

### Typical PIM-relevant attributes (configured in D365)

| Logical Attribute | D365 AttributeName | DataType |
|-------------------|--------------------|----|
| Designer | `Designer` (or custom) | Text |
| Material (primary) | `MainMaterial` | Text |
| Material (secondary) | `SecondaryMaterial` | Text |
| Country of Origin | `OriginCountryRegionId` (also on `ReleasedProductV2`) | Text |
| Sustainability Rating | custom | Text/Integer |
| Warranty Period | `WarrantyDurationTime` (on `ReleasedProductV2`) | Integer |

## 6. Localization Mapping

| PIM Field | D365 Source | Key | Notes |
|-----------|-------------|-----|-------|
| `Pim.Translation.ProductName[lang]` | `ProductTranslation` | (`ProductNumber`, `LanguageId`) | |
| `Pim.Translation.ProductDescription[lang]` | `ProductTranslation` | `Description` | Plain text only. |
| `Pim.Translation.AttributeName[lang]` | `ProductAttributeTranslation` | (`AttributeName`, `LanguageId`) | |
| `Pim.Translation.StyleName[lang]` | `ProductMasterStyleTranslation` | | |
| `Pim.Translation.ColorName[lang]` | `ProductMasterColorTranslation` | | |
| `Pim.Translation.SizeName[lang]` | `ProductMasterSizeTranslation` | | |

> **Limitation**: D365 stores plain text only. Rich text descriptions (B2B/B2C, USPs, care instructions per material) required by BRD §2.1.2 are PIM-native and **must be stored in PIM** with their own versioning and approval workflow.

## 7. Documents & Images Mapping

| PIM Field | D365 Source | D365 Field | Notes |
|-----------|-------------|------------|-------|
| `Pim.Document.ItemNumber` | `ReleasedProductDocumentAttachment` | `ItemNumber` | |
| `Pim.Document.TypeCode` | `ReleasedProductDocumentAttachment` | `DocumentAttachmentTypeCode` | |
| `Pim.Document.Description` | `ReleasedProductDocumentAttachment` | `AttachmentDescription` | |
| `Pim.Document.FileName` | `ReleasedProductDocumentAttachment` | `OriginalFileName` | |
| `Pim.Document.FileType` | `ReleasedProductDocumentAttachment` | `FileType` | |
| `Pim.Document.FileLocation` | `ReleasedProductDocumentAttachment` | `FileLocation` | |
| `Pim.Document.IsImage` | `ReleasedProductDocumentAttachment` | `IsProductImage` | |
| `Pim.Document.IsDefaultImage` | `ReleasedProductDocumentAttachment` | `IsDefaultProductImage` | |
| `Pim.Document.ImageUsage` | `ReleasedProductDocumentAttachment` | `ProductImageUsage` | Enum (e.g., External, Internal). |
| `Pim.Document.AccessRestriction` | `ReleasedProductDocumentAttachment` | `AccessRestriction` | Enum. |
| `Pim.Document.AttachedAt` | `ReleasedProductDocumentAttachment` | `AttachedDateTime` | |
| `Pim.Document.AttachedBy` | `ReleasedProductDocumentAttachment` | `AttachingUserId` | |

> **Strategy**: Sync metadata from D365 attachments, but **store actual binary files in Azure Blob Storage** managed by PIM. Use `FileLocation` to reference Blob URI for assets uploaded via PIM. Pull `Attachment` (Binary) only for items originally attached in D365.

## 8. PIM-Native Fields (Not in D365)

These are managed entirely by PIM and **do not flow from D365**:

| PIM Field | Purpose | BRD Reference |
|-----------|---------|---------------|
| `Pim.Content.B2BDescription` (rich text, versioned) | B2B design description. | §2.1.2 |
| `Pim.Content.B2CDescription` (rich text, versioned) | B2C design description. | §2.1.2 |
| `Pim.Content.USPs` (list, multi-language, versioned) | Unique Selling Propositions. | §2.1.2 |
| `Pim.Content.CareInstructions[material]` (rich text per material) | Care & maintenance instructions. | §2.1.2 |
| `Pim.Content.UpholsteryDescription` (rich text) | Upholstery description. | §2.1.2 |
| `Pim.Content.ApprovalStatus` | Workflow state (Draft, Review, Approved, Published). | §2.1.2, §2.1.3 |
| `Pim.Content.Version` | Content version number. | §2.1.2 |
| `Pim.Asset.BlobUri` | Azure Blob Storage URI for asset. | §2.1.1 |
| `Pim.Asset.RenditionVariants` | Image renditions (web, social, print). | §2.3.1 |
| `Pim.Asset.UsageLog` | Where asset is used (channels, dates). | §2.2 Auto Updates, §2.3.2 |
| `Pim.AI.GeneratedDraft` | AI-generated content draft. | §2.4.1 |

## 9. Direction & Sync Strategy

| Field Group | Direction | Trigger |
|-------------|-----------|---------|
| Core product data, prices, dimensions, lifecycle | **D365 → PIM** | Event-driven (D365 Business Events via Service Bus) + scheduled fallback |
| Categories, hierarchies | **D365 → PIM** | Daily scheduled sync |
| Translations | **D365 → PIM** | Event-driven |
| Custom attributes | **D365 ↔ PIM** | Configurable per attribute |
| Rich text content (descriptions, USPs, care) | **PIM only** (optionally PIM → D365 if approved) | Manual approval workflow |
| Visual assets (images, videos, 3D CAD) | **PIM only** (Blob), metadata from D365 | PIM-native upload |
| AI-generated drafts | **PIM only** | AI service trigger |

## 10. Key Considerations

1. **Composite keys**: `ReleasedProduct*` entities are keyed by `(dataAreaId, ItemNumber)`. PIM must store `dataAreaId` to disambiguate items across companies.
2. **`ProductNumber` vs `ItemNumber`**: `ProductNumber` is cross-company (in `EcoResProduct`), `ItemNumber` is per-company (in `Released*`). PIM master record should use `ProductNumber` as global key, with company-specific overlays.
3. **Variant resolution**: Use `ProductVariantNumber` as variant identifier; `ItemNumber` for variants is the same as master in many configurations.
4. **Translations require fallback**: Always query with `LanguageId` filter, fall back to default language (e.g., `en-US`) if translation missing.
5. **Attribute typing**: Always read the column matching `DataType` enum value to avoid null/wrong-type errors.
6. **Soft-deletes**: D365 entities are not soft-deleted via OData by default. PIM should track deletions via change tracking or business events.
