# D365 Entity Whitelist for PIM Integration

This document lists D365 OData entities that should be used by the PIM system, mapped to BRD requirements. Use this list to filter `dynamic-metadata.xml` (4,796 entities) down to a focused set for code generation and integration.

## 1. Core Product Entities (Required)

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `ReleasedProductV2` | Main product table - one row per item per company (dataAreaId). Contains prices, dimensions, weight, volume, lifecycle dates. | §2.1 Metadata, §2.2 D365 Integration |
| `ReleasedProductMasterV2` | Master product (parent) - shared template for variants. | §2.1 Master Number |
| `ReleasedProductVariantV2` | Product variants with size, color, style, configuration, version. | §2.1 Variant Number |
| `ProductMaster` | Product master definition (cross-company). | §2.1 Master Number |
| `ProductVariant` | Variant base entity. | §2.1 Variant Number |
| `ProductMasterDimensionValue` | Dimension values (size, color, style, config) for masters. | §2.1 Variant Number |

## 2. Categorization (Range Name)

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `ProductCategoryHierarchy` | Category tree definition (e.g., Range hierarchy). | §2.1 Range Name |
| `ProductCategory` | Individual category nodes with name, code, description, keywords. | §2.1 Range Name |
| `ProductCategoryAssignment` | Links products to categories. | §2.1 Range Name |
| `ReleasedProductCategory` | Released product to category mapping. | §2.1 Range Name |

## 3. Attributes (Custom Metadata)

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `ProductAttribute` | Attribute definitions (designer, material, finish, etc.). | §2.1.4 Custom Metadata |
| `ProductAttributeValueV3` | Attribute values per product (Text/Integer/Decimal/DateTime/Boolean/Currency). | §2.1.4 Custom Metadata |
| `ProductAttributeValueType` | Attribute type definitions. | §2.1.4 |
| `ProductAttributeEnumerationTextTypeV3` | Enum-like attribute options. | §2.1.4 |
| `ProductAttributeTranslation` | Localized attribute names. | §2.1.2 Localization |
| `InternalOrganizationProductAttributeMetadata` | Org-specific attribute metadata. | §2.1.4 |

## 4. Localization & Translation

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `ProductTranslation` | Localized product name and description. | §2.1.2 |
| `ProductMasterStyleTranslation` | Localized style names. | §2.1.2 |
| `ProductMasterColorTranslation` | Localized color names. | §2.1.2 |
| `ProductMasterSizeTranslation` | Localized size names. | §2.1.2 |
| `ProductMasterConfigurationTranslation` | Localized configuration names. | §2.1.2 |
| `ProductMasterVersionTranslation` | Localized version names. | §2.1.2 |

## 5. Dimensions & Physical Properties

Already included in `ReleasedProductV2`:
- `GrossProductHeight`, `GrossProductWidth`, `GrossDepth`
- `NetProductWeight`, `TareProductWeight`
- `ProductVolume`
- `InventoryUnitSymbol`, `SalesUnitSymbol`, `PurchaseUnitSymbol`, `BOMUnitSymbol`

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `PhysicalProductDimensionDetails` | Detailed physical dimensions. | §2.2 Dimensions |
| `UnitOfMeasure` | Unit definitions. | §2.2 |
| `UnitOfMeasureConversion` | Conversion between units. | §2.2 |

## 6. Documents & Attachments

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `ReleasedProductDocumentAttachment` | Files attached to released products (images, PDFs, etc.). Has `IsProductImage`, `IsDefaultProductImage`, `ProductImageUsage`, `FileType`, `Attachment` (Binary). | §2.1.1, §2.1.3 |
| `ProductDocumentAttachment` | Attachments at product master level. | §2.1.1, §2.1.3 |
| `BusinessDocumentDocuRef` | Generic document references. | §2.1.3 |

> Note: D365 attachments are sufficient for documents but **not optimal for high-volume visual assets** (packshots, lifestyle videos, 3D CAD). For those, PIM should use Azure Blob Storage and only store references in PIM DB.

## 7. Pricing

Already in `ReleasedProductV2`:
- `SalesPrice`, `PurchasePrice`, `UnitCost`
- `SalesPriceDate`, `PurchasePriceDate`, `UnitCostDate`

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `SalesPriceTrade` | Sales price agreements. | §2.2 Prices |
| `PurchasePriceTrade` | Purchase price agreements. | §2.2 Prices |

## 8. Lifecycle & Status

Already in `ReleasedProductV2`:
- `ProductLifecycleStateId`
- `ProductLifeCycleValidFromDate`, `ProductLifeCycleValidToDate`
- `SellStartDate`, `SellEndDate`, `ShipStartDate`
- `IsPOSRegistrationBlocked`, `POSRegistrationBlockedDate`

| Entity | Purpose | BRD Reference |
|--------|---------|---------------|
| `ProductLifecycleState` | Lifecycle state definitions. | §2.2 |

## 9. Excluded Entity Patterns

To keep the proxy lean, **exclude** these unless explicitly needed:

| Pattern | Reason to Exclude |
|---------|-------------------|
| `Engineering*` (ECO, ECM, BOM engineering) | Not relevant to PIM unless engineering change orders trigger PIM updates. |
| `AssetMaintenance*` | Asset/equipment maintenance, not product information. |
| `Retail*Catalog*`, `RetailInternalOrganization*` | Retail-specific catalog management; only include if PIM feeds retail channels directly. |
| `RSVN*` | Vendor/customer-specific extensions; include only if RSVN customizations are required. |
| `CLMIntegration*` | Contract lifecycle management. |
| `WarehouseIntegrationSourceSystem*` | Warehouse integration. |
| `PDS*`, `PMF*` | Process manufacturing - only if relevant. |
| `*BiEntity`, `*CDREntity`, `*AIEntity`, `DV*` | Internal/BI/AI/Dataverse helper entities. |
| `Tmp*` | Temporary tables. |
| `*V1` (when V2 or V3 exists) | Use latest version. |

## 10. Final Whitelist (Recommended Generation Set)

Copy this list to a config file for OData proxy generation:

```text
ReleasedProductV2
ReleasedProductMasterV2
ReleasedProductVariantV2
ProductMaster
ProductVariant
ProductMasterDimensionValue
ProductCategoryHierarchy
ProductCategory
ProductCategoryAssignment
ReleasedProductCategory
ProductAttribute
ProductAttributeValueV3
ProductAttributeValueType
ProductAttributeEnumerationTextTypeV3
ProductAttributeTranslation
InternalOrganizationProductAttributeMetadata
ProductTranslation
ProductMasterStyleTranslation
ProductMasterColorTranslation
ProductMasterSizeTranslation
ProductMasterConfigurationTranslation
ProductMasterVersionTranslation
PhysicalProductDimensionDetails
UnitOfMeasure
UnitOfMeasureConversion
ReleasedProductDocumentAttachment
ProductDocumentAttachment
BusinessDocumentDocuRef
SalesPriceTrade
PurchasePriceTrade
ProductLifecycleState
```

**Total**: ~30 entities (vs 4,796 in full metadata) — a 99.4% reduction in surface area.

## 11. Code Generation Tips

Using **OData Connected Service** (Visual Studio) or **Microsoft.OData.Cli**:

```bash
# Install
dotnet tool install -g Microsoft.OData.Cli

# Generate with whitelist
odata-cli generate \
  --metadata-uri ./dynamic-metadata.xml \
  --output-dir ./src/Pim.D365Client \
  --namespace Pim.D365Client \
  --included-entity-types "ReleasedProductV2,ReleasedProductMasterV2,..."
```

Or use the included PowerShell script `extract-pim-metadata.ps1` to first produce a slimmed XML, then generate from that.
