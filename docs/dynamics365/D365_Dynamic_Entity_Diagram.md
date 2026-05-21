# D365 Dynamic Entity Relationship Diagram

## Tổng quan kiến trúc Sync D365 → PIM

```mermaid
flowchart TB
    subgraph D365["Microsoft Dynamics 365 F&O"]
        D365_RPV2[ReleasedProductV2]
        D365_RPM[ReleasedProductMasterV2]
        D365_RPVar[ReleasedProductVariantV2]
        D365_PCH[ProductCategoryHierarchy]
        D365_PC[ProductCategory]
        D365_PCA[ProductCategoryAssignment]
        D365_PA[ProductAttribute]
        D365_PAV[ProductAttributeValueV3]
        D365_PT[ProductTranslation]
        D365_DT_Color[ProductMasterColorTranslation]
        D365_DT_Size[ProductMasterSizeTranslation]
        D365_DT_Style[ProductMasterStyleTranslation]
        D365_DT_Config[ProductMasterConfigurationTranslation]
        D365_PLS[ProductLifecycleState]
        D365_SPT[SalesPriceTrade]
        D365_PPT[PurchasePriceTrade]
    end

    subgraph PIM["PIM Database"]
        products
        product_variants
        product_category_hierarchies
        product_categories
        product_category_assignments
        product_attribute_definitions
        product_attribute_values
        product_translations
        variant_dimension_translations
        product_pricing
        product_dimensions
        product_lifecycle_states
        sync_logs
    end

    D365_RPM -->|sync| products
    D365_RPV2 -->|pricing + dimensions| products
    D365_RPVar -->|sync| product_variants
    D365_PCH -->|sync| product_category_hierarchies
    D365_PC -->|sync| product_categories
    D365_PCA -->|sync| product_category_assignments
    D365_PA -->|sync| product_attribute_definitions
    D365_PAV -->|sync| product_attribute_values
    D365_PT -->|sync| product_translations
    D365_DT_Color -->|sync| variant_dimension_translations
    D365_DT_Size -->|sync| variant_dimension_translations
    D365_DT_Style -->|sync| variant_dimension_translations
    D365_DT_Config -->|sync| variant_dimension_translations
    D365_PLS -->|sync| product_lifecycle_states
    D365_RPV2 -->|sync| product_pricing
    D365_RPV2 -->|sync| product_dimensions
```

## Entity Relationship Diagram (PIM Database)

```mermaid
erDiagram
    products ||--o{ product_variants : "has variants"
    products ||--o{ product_category_assignments : "assigned to"
    products ||--o{ product_attribute_values : "has attributes"
    products ||--o{ product_translations : "translated"
    products ||--|| product_pricing : "has pricing"
    products ||--|| product_dimensions : "has dimensions"
    products ||--o{ visual_assets : "has assets"
    products ||--o{ text_contents : "has content"
    products ||--o{ product_documents : "has documents"

    product_category_hierarchies ||--o{ product_categories : "contains"
    product_categories ||--o{ product_category_assignments : "linked via"
    product_attribute_definitions ||--o{ product_attribute_values : "defines"

    products {
        varchar id PK
        tinyint level
        varchar range_name
        varchar master_number
        varchar variant_number
        varchar name
        varchar d365_item_number UK
        datetime last_synced_at
    }

    product_variants {
        guid id PK
        varchar product_master_number
        varchar variant_number
        varchar color_id
        varchar size_id
        varchar style_id
        varchar configuration_id
        varchar range_name
        int status
    }

    product_category_hierarchies {
        varchar id PK
        varchar hierarchy_name
        varchar d365_hierarchy_id UK
        boolean is_active
    }

    product_categories {
        varchar id PK
        varchar hierarchy_id FK
        varchar category_code
        varchar category_name
        varchar parent_category_code
        boolean is_tangible
        int level
    }

    product_category_assignments {
        varchar id PK
        varchar product_id FK
        varchar category_id FK
        varchar hierarchy_id
    }

    product_attribute_definitions {
        varchar id PK
        varchar attribute_name UK
        varchar attribute_type_name
        varchar data_type
        boolean is_enumeration
        boolean is_required
    }

    product_attribute_values {
        varchar id PK
        varchar product_id FK
        varchar attribute_id FK
        varchar text_value
        int integer_value
        decimal decimal_value
        datetime datetime_value
        boolean boolean_value
        decimal currency_value
    }

    product_translations {
        varchar id PK
        varchar product_id FK
        varchar language_id
        varchar product_name
        text description
    }

    variant_dimension_translations {
        varchar id PK
        varchar dimension_type
        varchar dimension_id
        varchar product_master_number
        varchar language_id
        varchar translated_name
    }

    product_pricing {
        varchar id PK
        varchar product_id FK
        varchar data_area_id
        decimal sales_price
        decimal purchase_price
        decimal unit_cost
        varchar currency_code
    }

    product_dimensions {
        varchar id PK
        varchar product_id FK
        decimal height
        decimal width
        decimal depth
        decimal volume
        decimal net_weight
        decimal tare_weight
        varchar unit_of_measure
    }

    product_lifecycle_states {
        varchar id PK
        varchar state_id UK
        varchar state_name
        boolean is_active_for_commerce
        boolean is_active_for_planning
    }

    sync_logs {
        varchar id PK
        varchar entity_name
        varchar sync_type
        varchar status
        int records_created
        int records_updated
        int records_errors
        datetime started_at
        datetime completed_at
    }
```

## Sync Flow Sequence

```mermaid
sequenceDiagram
    participant API as PIM API
    participant Sync as D365SyncService
    participant D365 as D365 OData API
    participant DB as PIM Database

    API->>Sync: POST /api/sync/all-dynamic
    
    Note over Sync: Phase 1 - Reference Data
    Sync->>D365: GET /data/ProductLifecycleState
    D365-->>Sync: Lifecycle states
    Sync->>DB: Upsert product_lifecycle_states

    Sync->>D365: GET /data/ProductCategoryHierarchy
    D365-->>Sync: Hierarchies
    Sync->>DB: Upsert product_category_hierarchies

    Sync->>D365: GET /data/ProductCategory
    D365-->>Sync: Categories
    Sync->>DB: Upsert product_categories

    Note over Sync: Phase 2 - Product Data
    Sync->>D365: GET /data/ReleasedProductsV2
    D365-->>Sync: Products (with pricing + dimensions)
    Sync->>DB: Upsert product_pricing
    Sync->>DB: Upsert product_dimensions

    Sync->>D365: GET /data/ProductCategoryAssignment
    D365-->>Sync: Assignments
    Sync->>DB: Upsert product_category_assignments

    Note over Sync: Phase 3 - Attributes (EAV)
    Sync->>D365: GET /data/ProductAttributeValueV3
    D365-->>Sync: Attribute values
    Sync->>DB: Upsert product_attribute_definitions
    Sync->>DB: Upsert product_attribute_values

    Note over Sync: Phase 4 - Translations
    Sync->>D365: GET /data/ProductTranslation
    D365-->>Sync: Translations
    Sync->>DB: Upsert product_translations

    Sync->>D365: GET /data/ProductMasterColorTranslation
    Sync->>D365: GET /data/ProductMasterSizeTranslation
    Sync->>D365: GET /data/ProductMasterStyleTranslation
    Sync->>D365: GET /data/ProductMasterConfigurationTranslation
    D365-->>Sync: Dimension translations
    Sync->>DB: Upsert variant_dimension_translations

    Note over Sync: Audit
    Sync->>DB: Insert sync_logs
    Sync-->>API: SyncResult (created/updated/errors)
```

## D365 Entity Dependency Graph

```mermaid
graph TD
    subgraph "Core (Phase 1)"
        PLS[ProductLifecycleState]
        PCH[ProductCategoryHierarchy]
        PC[ProductCategory]
    end

    subgraph "Products (Phase 2)"
        RPM[ReleasedProductMasterV2]
        RPV[ReleasedProductVariantV2]
        RPV2[ReleasedProductV2<br/>Pricing + Dimensions]
        PCA[ProductCategoryAssignment]
    end

    subgraph "Attributes (Phase 3)"
        PA[ProductAttribute]
        PAV[ProductAttributeValueV3]
    end

    subgraph "Translations (Phase 4)"
        PT[ProductTranslation]
        MCT[ProductMasterColorTranslation]
        MST[ProductMasterSizeTranslation]
        MStT[ProductMasterStyleTranslation]
        MCfT[ProductMasterConfigurationTranslation]
    end

    PCH --> PC
    PC --> PCA
    RPM --> PCA
    RPM --> RPV
    RPM --> RPV2
    RPV2 --> PLS
    PA --> PAV
    RPM --> PAV
    RPM --> PT
    RPV --> MCT
    RPV --> MST
    RPV --> MStT
    RPV --> MCfT
```

## Bảng tóm tắt D365 Entities

| # | D365 Entity | OData Endpoint | PIM Table | Sync Direction | Priority | API Status |
|---|-------------|----------------|-----------|----------------|----------|------------|
| 1 | `ProductLifecycleState` | `ProductLifecycleStates` | `product_lifecycle_states` | D365 → PIM | P0 | ⚠️ EMPTY (no data in UAT) |
| 2 | `ProductCategoryHierarchy` | `ProductCategoryHierarchies` | `product_category_hierarchies` | D365 → PIM | P0 | ✅ OK |
| 3 | `ProductCategory` | `ProductCategories` | `product_categories` | D365 → PIM | P0 | ✅ OK |
| 4 | `ProductCategoryAssignment` | `ProductCategoryAssignments` | `product_category_assignments` | D365 → PIM | P0 | ✅ OK |
| 5 | `ReleasedProductV2` (pricing) | `ReleasedProductsV2` | `product_pricing` | D365 → PIM | P0 | ✅ OK |
| 6 | `ReleasedProductV2` (dimensions) | `ReleasedProductsV2` | `product_dimensions` | D365 → PIM | P0 | ✅ OK |
| 7 | `ProductAttribute` | `ProductAttributes` | `product_attribute_definitions` | D365 → PIM | P0 | ✅ OK |
| 8 | `ProductAttributeValueV3` | `ProductAttributeValues` | `product_attribute_values` | D365 → PIM | P0 | ✅ OK |
| 9 | `ProductTranslation` | `ProductTranslations` | `product_translations` | D365 → PIM | P1 | ✅ OK |
| 10 | `ProductMasterColorTranslation` | `ProductMasterColorTranslations` | `variant_dimension_translations` | D365 → PIM | P1 | ⚠️ EMPTY (no data in UAT) |
| 11 | `ProductMasterSizeTranslation` | `ProductMasterSizeTranslations` | `variant_dimension_translations` | D365 → PIM | P1 | ⚠️ EMPTY (no data in UAT) |
| 12 | `ProductMasterStyleTranslation` | `ProductMasterStyleTranslations` | `variant_dimension_translations` | D365 → PIM | P1 | ⚠️ EMPTY (no data in UAT) |
| 13 | `ProductMasterConfigurationTranslation` | `ProductMasterConfigurationTranslations` | `variant_dimension_translations` | D365 → PIM | P1 | ✅ OK |

> **API Test Result (2026-05-19):** 10/14 entities trả về data, 4 entities accessible nhưng chưa có data trong môi trường UAT. Tất cả endpoints đều hoạt động, không có lỗi authentication hay permission.
