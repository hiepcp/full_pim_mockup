# 6. Image Engine Module

## 6.1 Overview

Image Engine là thành phần chịu trách nhiệm quản lý và xử lý toàn bộ hình ảnh trong hệ thống PIM.

Module này cung cấp khả năng:

* Upload và lưu trữ hình ảnh sản phẩm
* Quản lý metadata hình ảnh
* Tạo các phiên bản (variants) phục vụ hiển thị và xuất bản
* Tự động resize, crop, optimize ảnh
* Sinh các định dạng ảnh phù hợp cho Social Media
* Hỗ trợ watermark
* Quản lý public/private asset
* Tích hợp Azure Blob Storage và CDN

Image Engine hoạt động như một dịch vụ nền (Background Processing Service) thông qua Image Processing Worker để đảm bảo trải nghiệm người dùng không bị ảnh hưởng bởi các tác vụ xử lý ảnh.

---

# 6.2 Business Objectives

### BO-01

Chuẩn hóa quy trình quản lý hình ảnh sản phẩm trên toàn hệ thống.

### BO-02

Giảm thời gian chuẩn bị hình ảnh cho Ecommerce và Social Media.

### BO-03

Đảm bảo hình ảnh được tối ưu hiệu năng khi hiển thị trên Website, Mobile App và Social Platform.

### BO-04

Hỗ trợ mở rộng trong tương lai cho Ecommerce Platform, Marketplace Integration và Digital Asset Management.

---

# 6.3 Scope

## In Scope

### Asset Management

* Upload single image
* Upload multiple images
* Delete image
* Archive image
* Attach image to Product
* Attach image to SKU
* Set Primary Image
* Reorder images

### Image Processing

* Metadata extraction
* Resize image
* Generate thumbnail
* Generate preview image
* Generate web optimized image
* Generate social media image variants
* Watermark generation
* Compression and optimization

### Storage

* Azure Blob Storage integration
* Public asset support
* Private asset support
* CDN integration

### Monitoring

* Processing status tracking
* Retry failed processing jobs
* Audit logging

---

## Out of Scope (Phase 1)

* AI Background Removal
* AI Image Generation
* AI Auto Tagging
* OCR Extraction
* Advanced DAM Workflow
* Multi-level Approval Workflow
* Image Version Comparison

---

# 6.4 User Roles

| Role            | Description                          |
| --------------- | ------------------------------------ |
| Product Manager | Upload and manage product images     |
| Marketing User  | Use images for social publishing     |
| Administrator   | Configure image settings and storage |
| System Worker   | Execute image processing jobs        |

---

# 6.5 Functional Requirements

## FR-IMG-001 Upload Image

### Description

User can upload one or multiple images.

### Acceptance Criteria

* Support drag and drop upload
* Support batch upload
* Store original image
* Create Asset record
* Generate processing job

---

## FR-IMG-002 Validate Image

### Description

System validates uploaded files before storing.

### Validation Rules

| Rule                 | Value                |
| -------------------- | -------------------- |
| Supported Format     | JPG, JPEG, PNG, WEBP |
| Maximum File Size    | 20 MB                |
| Minimum Dimension    | 500 x 500 px         |
| Corrupted File Check | Required             |
| MIME Validation      | Required             |

### Acceptance Criteria

Invalid files shall be rejected with meaningful error messages.

---

## FR-IMG-003 Extract Metadata

### Description

System extracts metadata after upload.

### Metadata

* Width
* Height
* Format
* File Size
* Color Profile
* Upload Timestamp

---

## FR-IMG-004 Generate Image Variants

### Description

System automatically generates predefined image variants.

### Variants

| Variant           | Purpose                 |
| ----------------- | ----------------------- |
| Original          | Original uploaded image |
| Thumbnail         | Listing page            |
| Preview           | Product detail page     |
| Web               | Website and Ecommerce   |
| FacebookFeed      | Facebook publishing     |
| InstagramSquare   | Instagram post          |
| InstagramPortrait | Instagram portrait post |
| PinterestPin      | Pinterest publishing    |

### Variant Specifications

| Variant           | Resolution       |
| ----------------- | ---------------- |
| Thumbnail         | 200 x 200        |
| Preview           | 800 x 800        |
| Web               | Max Width 1200px |
| FacebookFeed      | 1200 x 630       |
| InstagramSquare   | 1080 x 1080      |
| InstagramPortrait | 1080 x 1350      |
| PinterestPin      | 1000 x 1500      |

---

## FR-IMG-005 Social Media Crop

### Description

System automatically generates platform-specific image crops.

### Supported Platforms

* Facebook
* Instagram
* Pinterest

### Acceptance Criteria

Social Media Module must reuse generated variants without performing additional image processing.

---

## FR-IMG-006 Watermark

### Description

System supports optional watermark generation.

### Watermark Settings

| Setting  | Description                                        |
| -------- | -------------------------------------------------- |
| Enabled  | True / False                                       |
| Position | TopLeft, TopRight, BottomLeft, BottomRight, Center |
| Opacity  | 0 - 100%                                           |
| Scale    | Percentage of image size                           |
| Padding  | Pixel value                                        |

### Acceptance Criteria

* Original image must never be modified.
* Watermark shall only be applied to generated variants.

---

## FR-IMG-007 Public and Private Asset

### Description

System supports both public and private image visibility.

### Visibility Types

#### Public

Used for:

* Product Images
* Website Assets
* Social Media Assets

#### Private

Used for:

* Draft Images
* Supplier Images
* Packaging Assets
* Internal Marketing Assets

### Acceptance Criteria

Private assets shall only be accessible through authenticated requests or temporary signed URLs.

---

## FR-IMG-008 Product Image Association

### Description

User can associate images with Products and SKUs.

### Actions

* Attach image
* Remove image
* Set primary image
* Change image order

---

## FR-IMG-009 Processing Status

### Status Flow

```text
Uploaded
→ Processing
→ Ready
```

Failure Flow

```text
Uploaded
→ Processing
→ Failed
```

### Acceptance Criteria

User can view processing status in UI.

---

## FR-IMG-010 Retry Failed Processing

### Description

System shall support retrying failed image processing jobs.

### Acceptance Criteria

* Retry manually
* Retry automatically based on system configuration

---

# 6.6 Non Functional Requirements

## Performance

### NFR-IMG-001

Image upload response time shall be less than 3 seconds excluding background processing.

### NFR-IMG-002

Image processing shall be asynchronous.

### NFR-IMG-003

Thumbnail images shall be used in listing screens.

---

## Scalability

### NFR-IMG-004

System shall support independent scaling of Image Processing Worker.

### NFR-IMG-005

System shall support at least 1 million image assets.

---

## Reliability

### NFR-IMG-006

Original images shall never be modified.

### NFR-IMG-007

Failed jobs shall be recoverable through retry mechanisms.

### NFR-IMG-008

Image processing shall be idempotent.

---

## Security

### NFR-IMG-009

Private assets shall not be publicly accessible.

### NFR-IMG-010

All uploaded files shall pass MIME type validation.

### NFR-IMG-011

Temporary access URLs shall have configurable expiration periods.

---

# 6.7 Storage Architecture

## Azure Blob Storage

Storage Provider:

```text
Azure Blob Storage
```

### Container Structure

```text
product-assets-public
product-assets-private
```

### Folder Structure

```text
/original
/thumbnail
/preview
/web
/social
/watermark
```

---

# 6.8 CDN Integration

## CDN Provider

Azure Front Door

### Objectives

* Faster global delivery
* Reduced Blob Storage load
* Future Ecommerce scalability

### Public Asset Flow

```text
User
  ↓
Azure Front Door
  ↓
Azure Blob Storage
```

---

# 6.9 Image Processing Architecture

## Processing Flow

```text
Upload Image
    ↓
Store Original File
    ↓
Create Processing Job
    ↓
Image Processing Worker
    ↓
Generate Variants
    ↓
Generate Social Crops
    ↓
Apply Watermark (Optional)
    ↓
Store Variants
    ↓
Update Asset Status
```

---

# 6.10 Data Model

## Asset

```text
Asset
- Id
- FileName
- MimeType
- FileSize
- Width
- Height
- Visibility
- StorageKey
- Status
- CreatedBy
- CreatedAt
```

## AssetVariant

```text
AssetVariant
- Id
- AssetId
- VariantType
- Width
- Height
- FileSize
- StorageKey
- CreatedAt
```

## ImageProcessingJob

```text
ImageProcessingJob
- Id
- AssetId
- Status
- AttemptCount
- ErrorMessage
- CreatedAt
- StartedAt
- CompletedAt
```

## ProductImage

```text
ProductImage
- Id
- ProductId
- AssetId
- IsPrimary
- SortOrder
- UsageType
```

---

# 6.11 Future Enhancements

### Phase 2

* AI Background Removal
* AI Smart Crop
* AI Auto Tagging
* AI Image Search
* OCR Metadata Extraction
* Marketplace Specific Variants

### Phase 3

* Digital Asset Management (DAM)
* Asset Approval Workflow
* Asset Versioning
* Asset Usage Analytics
* Brand Compliance Validation

```

```
