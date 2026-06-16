# PIM Content And Integration Requirements

## 1. Core Concept

The platform is envisioned as a centralized Product Information Management (PIM) system that consolidates and connects all product-related content, metadata, assets, and documents.

Each item should be tied to clear identifiers such as:

- Range Name
- Master Number
- Variant Number
- Item Number from D365, where relevant

The goal is to create a single source of truth for product information, visual assets, technical files, catalogues, material data, and channel-ready content. The system should make product information structured, searchable, reusable, and consistently distributed across all relevant channels.

## 2. Content To Gather In PIM

### 2.1 Visual Assets

The PIM should manage or link all key visual assets related to products and ranges:

- Packshots
- Lifestyle images
- Line drawings
- 3D CAD files
- Lifestyle videos
- Product videos
- Variant-specific images and renderings

These assets should be connected to the relevant range, master product, variant, material, or item number.

### 2.2 Text Content

The PIM should support structured text content for both internal and external channels:

- Design descriptions for B2B and B2C
- Unique Selling Points (USPs) for B2B and B2C
- Care & Maintenance instructions per material
- Daily Care & Maintenance instructions per material
- Upholstery descriptions
- Product descriptions
- Range descriptions
- SEO metadata, where relevant

Current gaps include USPs, care instructions, and daily care instructions. These areas could be supported by AI, but AI-generated content should be treated as draft content until reviewed and approved by a responsible person.

### 2.3 Documents And Catalogues

The PIM should manage or reference documents that are directly related to ranges, products, materials, or sales usage:

- Range catalogues
- Product catalogues
- Range presentations
- Material technical sheets
- Maintenance Guide
- Technical and Compliance Directory
- Company Profile
- Product cards
- QR code-related product documents

Some documents may not need to be stored directly inside the PIM, but the PIM should at least be able to reference and track them if they use product data or product assets.

### 2.4 Material Assets

Materials should be managed as reusable entities, because the same material may be linked to many products or variants.

Material content should include:

- Material name
- Material code
- Round swatch dot
- Large material image
- Technical sheet
- Care & Maintenance instructions
- Daily Care & Maintenance instructions
- Upholstery description
- Sustainability information
- Certification or compliance data, where relevant

### 2.5 D365 Data

D365 should remain the master source for selected commercial and operational data. The PIM should consume D365 data where needed.

Potential D365 data includes:

- Item number
- Master number
- Variant number
- Dimensions
- Designer
- Prices
- Product hierarchy
- Product lifecycle status
- Sales status
- Availability or stock-related status, if relevant

The project must define exactly which system is the master for each field.

### 2.6 Brand And Corporate Assets

The business also uses assets that are not always product-specific:

- Portraits
- Factory images
- Logos
- Brand videos
- Company profile images
- Press images

Recommendation: these assets should either be managed in the PIM if it includes strong DAM functionality, or managed in a dedicated DAM that is integrated with the PIM. This is important for usage tracking, version control, approval control, and avoiding outdated assets being reused.

## 3. Proposed Data Model

### 3.1 Range Level

Range-level data should describe the overall product family or collection.

Examples:

- Range Name
- Range description
- Design story
- Designer
- Range catalogue
- Range presentation
- Lifestyle images and videos
- General USPs
- Related collections
- Brand positioning

### 3.2 Master Product Level

Master product data should describe the core product before variant-specific details.

Examples:

- Master Number
- Product name
- Product category
- Product type
- Main dimensions
- Technical specifications
- Line drawings
- CAD files
- Product videos
- B2B description
- B2C description
- Product USPs
- Compliance documents
- Maintenance guide links

### 3.3 Variant Or Item Level

Variant or item-level data should describe the specific sellable configuration.

Examples:

- Variant number
- Item number
- Color
- Material
- Upholstery
- Finish
- Size
- Price from D365
- Packshot
- Variant-specific rendering
- Variant-specific dimensions
- Variant-specific care instructions
- EAN or barcode, if relevant
- QR code or product card relation

### 3.4 Material Level

Material data should be reusable and linkable to multiple products and variants.

Examples:

- Material name
- Material code
- Swatch image
- Large material image
- Technical sheet
- Care instructions
- Daily care instructions
- Upholstery description
- Sustainability information
- Certifications

### 3.5 Brand Or Corporate Asset Level

Brand and corporate assets should be separated from product-specific assets.

Examples:

- Logos
- Designer portraits
- Factory images
- Campaign images
- Brand videos
- Press assets

## 4. Ownership And Governance

Clear ownership is required to keep the PIM reliable.

Suggested ownership:

- Product team: product structure, range/master/variant logic, dimensions, material mapping
- Marketing: product descriptions, USPs, lifestyle images, catalogues, website content
- Technical and compliance team: technical sheets, compliance documents, maintenance guides
- Sales and pricing team: price-related requirements and sales material needs
- IT and data team: integrations, APIs, data sync, permissions
- Brand owner or management: final approval for brand-critical assets and content

Governance rules should define:

- Who can create data
- Who can edit data
- Who can approve data
- Who can publish data
- Which content requires approval
- Whether previous versions are retained
- How AI-generated content is reviewed
- Which systems are notified when content changes

AI should support content creation, but customer-facing and compliance-related content should not be published without human approval.

## 5. Workflow

A typical new product workflow could be:

1. Product team creates the range, master product, and variant structure.
2. D365 provides item numbers, dimensions, pricing, designer data, and commercial data.
3. Marketing uploads packshots, lifestyle images, videos, descriptions, and campaign material.
4. Technical team uploads CAD files, line drawings, technical sheets, and compliance documents.
5. Material data is linked to the relevant variants.
6. AI generates draft descriptions, USPs, and care instructions where useful.
7. Responsible users review and approve content.
8. The product is marked as ready for publication once all required data and assets are complete.
9. PIM distributes or exposes the data to website, webshop, iPaper, catalogue workflows, quotation systems, pricelist systems, and sales tools.
10. The system logs where product data and assets are being used.

Recommended product statuses:

- Draft
- Missing assets
- Pending review
- Approved
- Ready for publication
- Published
- Archived

## 6. Channel Mapping

### 6.1 Website And Webshop

Required data may include:

- Product name
- B2C description
- Packshots
- Lifestyle images
- Videos
- Dimensions
- Materials
- Care instructions
- Variants
- Downloads
- Related products

### 6.2 B2B And Sales Portal

Required data may include:

- B2B description
- USPs
- Price data
- Technical sheets
- CAD files
- Product presentations
- High-resolution images
- Compliance documents
- Customer-ready asset packages

### 6.3 iPaper And Digital Catalogues

Required data may include:

- Approved product text
- Catalogue-ready images
- Product numbers
- Material names
- Dimensions
- Prices, if used in the catalogue
- Product page links

### 6.4 Quotation And Pricelist System

Required data may include:

- Product image
- Variant image
- Item number
- Price
- Dimensions
- Material or upholstery
- Short description

### 6.5 Internal Use

Required data may include:

- Sales data from D365
- Asset completeness status
- Product launch readiness
- Downloadable customer packages
- Usage tracking

## 7. Asset Management Rules

Assets should be classified into clear groups.

### 7.1 Product-Specific Assets

- Packshots
- Line drawings
- CAD files
- Product videos
- Variant renderings

### 7.2 Marketing Assets

- Lifestyle images
- Campaign images
- Lifestyle videos
- Catalogue spreads

### 7.3 Material Assets

- Swatches
- Large material images
- Technical sheets
- Care instructions

### 7.4 Corporate Assets

- Logos
- Portraits
- Factory images
- Company profile images

Asset metadata should include:

- Asset type
- Linked range, master product, variant, item, or material
- Usage rights
- Expiry date, if relevant
- Photographer or source
- Approval status
- Allowed channels
- File format
- Resolution
- Last updated date
- Usage location across channels and documents

## 8. Integration Requirements

### 8.1 D365 Integration

The PIM should integrate with D365 for commercial and operational data.

Key decisions:

- Which fields are mastered in D365
- Which fields are mastered in PIM
- Whether sync is one-way or two-way
- Whether sync is real-time, scheduled, or manual
- How conflicts are handled
- How deleted, archived, or inactive products are handled

### 8.2 Website Integration

Key decisions:

- Whether the website pulls data from PIM through APIs
- Whether PIM pushes data to the website
- Whether the website consumes image renditions directly from PIM
- How archived products are handled
- How language versions are managed

### 8.3 Catalogue And iPaper Integration

Key decisions:

- Whether catalogue data is exported manually, semi-automatically, or automatically
- Whether catalogue templates are standardized
- Whether data updates should update existing catalogue content
- Whether PIM tracks which catalogue version used which product data

### 8.4 Quotation And Pricelist Integration

The quotation and pricelist system should source images and product data from PIM to avoid maintaining the same asset in multiple places.

## 9. Image Engine Requirements

The PIM image engine should support automated image generation and transformation.

Recommended capabilities:

- Resize images for different channels
- Convert formats such as JPG, PNG, WebP, and TIFF
- Generate thumbnails
- Generate print-ready versions
- Crop based on presets
- Support focal points
- Support background removal where needed
- Apply naming conventions
- Create channel-specific exports
- Track which rendition was generated from which original file

Example output presets:

- Web product image
- Web thumbnail
- Catalogue print image
- Social media square image
- Social media vertical image
- Pricelist thumbnail
- Sales presentation image

## 10. AI Use Cases

AI can support the PIM in several areas:

- Draft B2B descriptions from product and technical data
- Draft B2C descriptions in the correct brand tone
- Generate USPs by range, product, or material
- Generate care instructions based on material data
- Suggest missing content
- Translate content into multiple languages
- Standardize text between catalogue, website, and sales material
- Draft product comparisons
- Suggest SEO metadata
- Generate packshot or rendering variants in the long term

Controls required:

- Brand tone guidelines
- Approved terminology
- Grounding in verified PIM and D365 facts
- Human approval
- Version history
- Audit log for AI-generated content

## 11. Product Readiness And Completeness Score

The PIM should help teams understand whether a product is ready for publication.

Example publication requirements:

- Item number exists
- Product name exists
- Approved description exists
- At least one packshot exists
- Dimensions are available
- Material is linked
- Care instructions are linked
- Price from D365 is available, where required
- Approval status is complete
- Channel assignment is defined

Example completeness score:

- 40%: basic product data complete
- 60%: visual assets complete
- 80%: text and material data complete
- 100%: approved and ready for publication

## 12. Long-Term Vision

Long-term opportunities include:

- AI-generated packshot variants
- AI-assisted lifestyle renderings
- Automated creation of product text
- Automated generation of USPs
- Automated care and maintenance recommendations
- Automated customer-ready sales packages
- Product material distribution once all required assets are complete
- Usage tracking across website, catalogues, sales tools, and external documents

## 13. Additional Considerations

### 13.1 Product Cards And QR Codes

Product cards and QR codes should be connected to the PIM so they use approved and up-to-date product data.

Key considerations:

- QR codes should resolve to stable product pages or asset packages
- Product card content should be generated from approved PIM fields
- Product cards should reflect the latest approved product data
- Ownership of product card templates should be defined

### 13.2 Website Alignment

The future website structure will influence how PIM content should be organized and exposed.

PIM structure should support:

- Product pages
- Range pages
- Material pages
- Variant selection
- Downloads
- Sales contact flows
- B2B and B2C content differences

## 14. Key Questions Before Selecting A PIM

- Should the PIM include DAM capabilities, or should it integrate with a separate DAM?
- Which D365 fields are authoritative?
- Which PIM fields are authoritative?
- Should PIM publish directly to website and catalogues, or only expose data through APIs and exports?
- How many languages must be supported?
- Is multi-step approval required?
- Is usage tracking required for each image, file, and document?
- Is a built-in image engine required?
- Should AI be built into PIM or integrated externally?
- How automated should catalogue production be?
- How should product cards and QR codes use PIM data?
- Who owns the material database?
- Are permissions required by department, market, or channel?

## 15. Summary

The PIM should act as the single source of truth for product-related information, assets, documents, and channel-ready content. It should connect product data from D365 with marketing content, technical files, material information, catalogue content, and digital channel requirements.

The current analysis is sufficient as a high-level concept, but successful implementation requires clear decisions on data model, ownership, workflow, integrations, approval process, channel mapping, asset governance, AI control, and product readiness rules.
