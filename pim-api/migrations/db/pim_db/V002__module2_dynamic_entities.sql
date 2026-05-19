-- ===========================================================================
-- PIM v002 - Module 2: Dynamic D365 Entities
-- Tables: product_categories, product_category_assignments, product_attributes,
--         product_attribute_values, product_translations, product_pricing,
--         product_dimensions, product_lifecycle_states, sync_logs
-- ===========================================================================

USE pim_db;

-- ---------------------------------------------------------------------------
-- product_category_hierarchies: Category tree definitions (Range hierarchy)
-- Source: D365 ProductCategoryHierarchy
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_category_hierarchies (
    id                   VARCHAR(40)   NOT NULL,
    hierarchy_name       VARCHAR(255)  NOT NULL,
    description          TEXT          NULL,
    d365_hierarchy_id    VARCHAR(60)   NOT NULL DEFAULT '',
    is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY ux_hierarchy_d365_id (d365_hierarchy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_categories: Individual category nodes
-- Source: D365 ProductCategory
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
    id                   VARCHAR(40)   NOT NULL,
    hierarchy_id         VARCHAR(40)   NOT NULL,
    category_code        VARCHAR(60)   NOT NULL,
    category_name        VARCHAR(255)  NOT NULL,
    friendly_name        VARCHAR(255)  NOT NULL DEFAULT '',
    description          TEXT          NULL,
    keywords             VARCHAR(500)  NOT NULL DEFAULT '',
    parent_category_code VARCHAR(60)   NOT NULL DEFAULT '',
    external_id          VARCHAR(60)   NOT NULL DEFAULT '',
    is_tangible          BOOLEAN       NOT NULL DEFAULT TRUE,
    level                INT           NOT NULL DEFAULT 0,
    sort_order           INT           NOT NULL DEFAULT 0,
    d365_category_id     BIGINT        NOT NULL DEFAULT 0,
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_categories_hierarchy (hierarchy_id),
    KEY ix_categories_parent (parent_category_code),
    UNIQUE KEY ux_categories_code (hierarchy_id, category_code),
    CONSTRAINT fk_categories_hierarchy FOREIGN KEY (hierarchy_id)
        REFERENCES product_category_hierarchies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_category_assignments: Links products to categories
-- Source: D365 ProductCategoryAssignment / ReleasedProductCategory
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_category_assignments (
    id                   VARCHAR(40)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    category_id          VARCHAR(40)   NOT NULL,
    hierarchy_id         VARCHAR(40)   NOT NULL,
    d365_product_number  VARCHAR(60)   NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_cat_assign_product (product_id),
    KEY ix_cat_assign_category (category_id),
    UNIQUE KEY ux_cat_assign (product_id, category_id),
    CONSTRAINT fk_cat_assign_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_cat_assign_category FOREIGN KEY (category_id)
        REFERENCES product_categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_attribute_definitions: Attribute metadata (Designer, Material, etc.)
-- Source: D365 ProductAttribute
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_attribute_definitions (
    id                   VARCHAR(40)   NOT NULL,
    attribute_name       VARCHAR(120)  NOT NULL,
    attribute_type_name  VARCHAR(120)  NOT NULL DEFAULT '',
    data_type            VARCHAR(30)   NOT NULL DEFAULT 'Text',
    description          TEXT          NULL,
    is_enumeration       BOOLEAN       NOT NULL DEFAULT FALSE,
    is_required          BOOLEAN       NOT NULL DEFAULT FALSE,
    default_value        VARCHAR(500)  NOT NULL DEFAULT '',
    d365_attribute_id    VARCHAR(60)   NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY ux_attr_def_name (attribute_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_attribute_values: EAV pattern - attribute values per product
-- Source: D365 ProductAttributeValueV3
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id                   VARCHAR(40)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    attribute_id         VARCHAR(40)   NOT NULL,
    d365_product_number  VARCHAR(60)   NOT NULL DEFAULT '',
    text_value           VARCHAR(2000) NULL,
    integer_value        INT           NULL,
    decimal_value        DECIMAL(18,6) NULL,
    datetime_value       DATETIME(3)   NULL,
    boolean_value        BOOLEAN       NULL,
    currency_value       DECIMAL(18,4) NULL,
    currency_code        VARCHAR(10)   NOT NULL DEFAULT '',
    unit_of_measure      VARCHAR(30)   NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_attr_val_product (product_id),
    KEY ix_attr_val_attribute (attribute_id),
    UNIQUE KEY ux_attr_val (product_id, attribute_id),
    CONSTRAINT fk_attr_val_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_attr_val_attribute FOREIGN KEY (attribute_id)
        REFERENCES product_attribute_definitions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_translations: Multi-language product names/descriptions
-- Source: D365 ProductTranslation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_translations (
    id                   VARCHAR(40)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    d365_product_number  VARCHAR(60)   NOT NULL DEFAULT '',
    language_id          VARCHAR(10)   NOT NULL,
    product_name         VARCHAR(255)  NOT NULL DEFAULT '',
    description          TEXT          NULL,
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_translations_product (product_id),
    UNIQUE KEY ux_translations (product_id, language_id),
    CONSTRAINT fk_translations_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- variant_dimension_translations: Translated color/size/style/config names
-- Source: D365 ProductMaster{Color|Size|Style|Configuration}Translation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS variant_dimension_translations (
    id                   VARCHAR(40)   NOT NULL,
    dimension_type       VARCHAR(20)   NOT NULL,
    dimension_id         VARCHAR(60)   NOT NULL,
    product_master_number VARCHAR(60)  NOT NULL DEFAULT '',
    language_id          VARCHAR(10)   NOT NULL,
    translated_name      VARCHAR(255)  NOT NULL DEFAULT '',
    translated_description TEXT        NULL,
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_dim_trans_type (dimension_type, dimension_id),
    UNIQUE KEY ux_dim_trans (dimension_type, dimension_id, product_master_number, language_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_pricing: Sales/purchase prices, unit cost
-- Source: D365 ReleasedProductV2 (inline) + SalesPriceTrade/PurchasePriceTrade
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_pricing (
    id                   VARCHAR(40)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    d365_item_number     VARCHAR(60)   NOT NULL DEFAULT '',
    data_area_id         VARCHAR(10)   NOT NULL DEFAULT '',
    sales_price          DECIMAL(18,4) NOT NULL DEFAULT 0,
    sales_price_date     DATE          NULL,
    purchase_price       DECIMAL(18,4) NOT NULL DEFAULT 0,
    purchase_price_date  DATE          NULL,
    unit_cost            DECIMAL(18,4) NOT NULL DEFAULT 0,
    unit_cost_date       DATE          NULL,
    sales_unit           VARCHAR(20)   NOT NULL DEFAULT '',
    purchase_unit        VARCHAR(20)   NOT NULL DEFAULT '',
    currency_code        VARCHAR(10)   NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_pricing_product (product_id),
    UNIQUE KEY ux_pricing (product_id, data_area_id),
    CONSTRAINT fk_pricing_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_dimensions: Physical dimensions (height, width, depth, weight, volume)
-- Source: D365 ReleasedProductV2 + PhysicalProductDimensionDetails
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_dimensions (
    id                   VARCHAR(40)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    d365_item_number     VARCHAR(60)   NOT NULL DEFAULT '',
    height               DECIMAL(18,6) NOT NULL DEFAULT 0,
    width                DECIMAL(18,6) NOT NULL DEFAULT 0,
    depth                DECIMAL(18,6) NOT NULL DEFAULT 0,
    volume               DECIMAL(18,6) NOT NULL DEFAULT 0,
    net_weight           DECIMAL(18,6) NOT NULL DEFAULT 0,
    tare_weight          DECIMAL(18,6) NOT NULL DEFAULT 0,
    unit_of_measure      VARCHAR(20)   NOT NULL DEFAULT '',
    weight_unit          VARCHAR(20)   NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY ux_dimensions_product (product_id),
    CONSTRAINT fk_dimensions_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_lifecycle_states: Lifecycle state definitions
-- Source: D365 ProductLifecycleState
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_lifecycle_states (
    id                   VARCHAR(40)   NOT NULL,
    state_id             VARCHAR(60)   NOT NULL,
    state_name           VARCHAR(120)  NOT NULL,
    description          TEXT          NULL,
    is_active_for_commerce BOOLEAN     NOT NULL DEFAULT TRUE,
    is_active_for_planning BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY ux_lifecycle_state_id (state_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- sync_logs: Audit trail for sync operations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_logs (
    id                   VARCHAR(40)   NOT NULL,
    entity_name          VARCHAR(120)  NOT NULL,
    sync_type            VARCHAR(30)   NOT NULL DEFAULT 'Full',
    status               VARCHAR(20)   NOT NULL DEFAULT 'Running',
    records_created      INT           NOT NULL DEFAULT 0,
    records_updated      INT           NOT NULL DEFAULT 0,
    records_skipped      INT           NOT NULL DEFAULT 0,
    records_errors       INT           NOT NULL DEFAULT 0,
    error_messages       TEXT          NULL,
    started_at           DATETIME(3)   NOT NULL,
    completed_at         DATETIME(3)   NULL,
    duration_ms          BIGINT        NOT NULL DEFAULT 0,
    triggered_by         VARCHAR(120)  NOT NULL DEFAULT 'System',
    PRIMARY KEY (id),
    KEY ix_sync_logs_entity (entity_name),
    KEY ix_sync_logs_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
