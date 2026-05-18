-- PIM Database Initialization
-- This runs automatically on first postgres container start

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Products ────────────────────────────────────────────────────────
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    range_name VARCHAR(200),
    master_number VARCHAR(100),
    variant_number VARCHAR(100),
    description TEXT,
    usp TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    completeness_score INTEGER DEFAULT 0,
    d365_item_number VARCHAR(100),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_range ON products(range_name);
CREATE INDEX idx_products_master ON products(master_number);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_d365 ON products(d365_item_number);

-- ─── Visual Assets ───────────────────────────────────────────────────
CREATE TABLE visual_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    file_name VARCHAR(500) NOT NULL,
    blob_path VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    asset_type VARCHAR(50) DEFAULT 'Image',
    status VARCHAR(50) DEFAULT 'Pending',
    width INTEGER,
    height INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_product ON visual_assets(product_id);
CREATE INDEX idx_assets_type ON visual_assets(asset_type);
CREATE INDEX idx_assets_status ON visual_assets(status);

-- ─── Text Content ────────────────────────────────────────────────────
CREATE TABLE text_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    content TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    ai_generated BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_text_product ON text_contents(product_id);
CREATE INDEX idx_text_type ON text_contents(content_type);

-- ─── Product Documents ───────────────────────────────────────────────
CREATE TABLE product_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    file_name VARCHAR(500) NOT NULL,
    blob_path VARCHAR(1000) NOT NULL,
    document_type VARCHAR(50),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Campaigns (Social Campaign Builder) ─────────────────────────────
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    platforms TEXT[] DEFAULT '{}',
    caption TEXT,
    ai_caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_assets (
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES visual_assets(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (campaign_id, asset_id)
);

-- ─── Asset Link Map (track usage) ───────────────────────────────────
CREATE TABLE asset_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES visual_assets(id) ON DELETE CASCADE,
    channel VARCHAR(100) NOT NULL,
    platform VARCHAR(100),
    external_url VARCHAR(1000),
    published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_asset ON asset_usage(asset_id);

-- ─── Performance Metrics (TimescaleDB hypertable) ────────────────────
CREATE TABLE performance_metrics (
    time TIMESTAMPTZ NOT NULL,
    asset_id UUID,
    campaign_id UUID,
    channel VARCHAR(100),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0
);

SELECT create_hypertable('performance_metrics', 'time');

CREATE INDEX idx_metrics_asset ON performance_metrics(asset_id, time DESC);
CREATE INDEX idx_metrics_campaign ON performance_metrics(campaign_id, time DESC);

-- ─── Hangfire Schema (auto-created but we reserve the schema) ────────
CREATE SCHEMA IF NOT EXISTS hangfire;
