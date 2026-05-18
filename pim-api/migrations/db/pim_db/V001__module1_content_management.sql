-- ===========================================================================
-- PIM v001 - Module 1: Content Management
-- Schema: products, visual_assets, text_contents, product_documents
-- Engine: InnoDB, charset utf8mb4 (supports emoji + Vietnamese)
-- ===========================================================================

CREATE DATABASE IF NOT EXISTS pim_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pim_db;

-- ---------------------------------------------------------------------------
-- products: range / master / variant metadata, optionally linked to D365
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                  VARCHAR(40)   NOT NULL,
    level               TINYINT       NOT NULL DEFAULT 2,
    range_name          VARCHAR(120)  NOT NULL DEFAULT '',
    master_number       VARCHAR(60)   NOT NULL DEFAULT '',
    variant_number      VARCHAR(60)   NOT NULL DEFAULT '',
    name                VARCHAR(255)  NOT NULL,
    description         TEXT          NULL,
    designer            VARCHAR(120)  NOT NULL DEFAULT '',
    d365_entity_name    VARCHAR(80)   NOT NULL DEFAULT '',
    d365_item_number    VARCHAR(60)   NOT NULL DEFAULT '',
    last_synced_at      DATETIME(3)   NULL,
    created_at          DATETIME(3)   NOT NULL,
    updated_at          DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_products_range (range_name),
    KEY ix_products_master (master_number),
    KEY ix_products_variant (variant_number),
    UNIQUE KEY ux_products_d365_item (d365_item_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- visual_assets: packshots, lifestyle images, videos, 3D CAD, swatches
-- Files stored in Azure Blob; this table holds metadata + CDN url
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visual_assets (
    id                   VARCHAR(50)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    asset_type           TINYINT       NOT NULL DEFAULT 0,
    status               TINYINT       NOT NULL DEFAULT 0,
    file_name            VARCHAR(255)  NOT NULL,
    mime_type            VARCHAR(100)  NOT NULL DEFAULT '',
    file_size_bytes      BIGINT        NOT NULL DEFAULT 0,
    storage_container    VARCHAR(100)  NOT NULL DEFAULT '',
    storage_blob_path    VARCHAR(500)  NOT NULL DEFAULT '',
    cdn_url              VARCHAR(500)  NOT NULL DEFAULT '',
    width                INT           NULL,
    height               INT           NULL,
    duration_seconds     INT           NULL,
    alt_text             VARCHAR(255)  NOT NULL DEFAULT '',
    caption              VARCHAR(500)  NOT NULL DEFAULT '',
    uploaded_by_email    VARCHAR(255)  NOT NULL DEFAULT '',
    uploaded_by_name     VARCHAR(120)  NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_visual_assets_product (product_id),
    KEY ix_visual_assets_product_type (product_id, asset_type),
    CONSTRAINT fk_visual_assets_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- text_contents: descriptions, USPs, care instructions per language + version
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS text_contents (
    id                   VARCHAR(50)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    content_type         TINYINT       NOT NULL DEFAULT 0,
    status               TINYINT       NOT NULL DEFAULT 0,
    language_code        VARCHAR(10)   NOT NULL DEFAULT 'en',
    title                VARCHAR(255)  NOT NULL DEFAULT '',
    body                 LONGTEXT      NOT NULL,
    version              INT           NOT NULL DEFAULT 1,
    approved_by_email    VARCHAR(255)  NOT NULL DEFAULT '',
    approved_at          DATETIME(3)   NULL,
    author_email         VARCHAR(255)  NOT NULL DEFAULT '',
    author_name          VARCHAR(120)  NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_text_contents_product (product_id),
    KEY ix_text_contents_lookup (product_id, content_type, language_code, version),
    CONSTRAINT fk_text_contents_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- product_documents: catalogues, technical sheets, maintenance guides
-- Files stored in Azure Blob; this table holds metadata + CDN url
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_documents (
    id                   VARCHAR(50)   NOT NULL,
    product_id           VARCHAR(40)   NOT NULL,
    document_type        TINYINT       NOT NULL DEFAULT 3,
    status               TINYINT       NOT NULL DEFAULT 0,
    title                VARCHAR(255)  NOT NULL DEFAULT '',
    file_name            VARCHAR(255)  NOT NULL,
    mime_type            VARCHAR(100)  NOT NULL DEFAULT '',
    file_size_bytes      BIGINT        NOT NULL DEFAULT 0,
    storage_container    VARCHAR(100)  NOT NULL DEFAULT '',
    storage_blob_path    VARCHAR(500)  NOT NULL DEFAULT '',
    cdn_url              VARCHAR(500)  NOT NULL DEFAULT '',
    language_code        VARCHAR(10)   NOT NULL DEFAULT 'en',
    version              INT           NOT NULL DEFAULT 1,
    uploaded_by_email    VARCHAR(255)  NOT NULL DEFAULT '',
    uploaded_by_name     VARCHAR(120)  NOT NULL DEFAULT '',
    created_at           DATETIME(3)   NOT NULL,
    updated_at           DATETIME(3)   NOT NULL,
    PRIMARY KEY (id),
    KEY ix_product_documents_product (product_id),
    KEY ix_product_documents_product_type (product_id, document_type),
    CONSTRAINT fk_product_documents_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
