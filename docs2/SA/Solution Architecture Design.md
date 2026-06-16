# PIM System - Solution Architecture Design

## 1. Architecture Overview

### Objective

Xây dựng nền tảng Product Information Management (PIM) đóng vai trò là **Single Source of Truth** cho toàn bộ dữ liệu sản phẩm, tài sản số (digital assets), nội dung marketing và dữ liệu tích hợp từ các hệ thống bên ngoài.

Hệ thống phải hỗ trợ:

* Product Information Management
* Digital Asset Management (DAM)
* Content Management
* D365 Integration
* Website Integration
* iPaper / Catalogue Integration
* Social Media Publishing
* AI-assisted Content Generation
* Asset Usage Tracking

---

## 2. Architecture Decision

### Selected Architecture

```text
Modular Monolith
+ Vertical Slice Architecture
+ Clean Architecture
+ Wolverine
+ AI Service (Python)
+ Image Processing Worker
```

### Decision Rationale

Sau khi đánh giá:

* Quy mô người dùng hiện tại: 100–200 users
* Hệ thống nội bộ doanh nghiệp
* Một nguồn ERP chính (D365)
* Một website chính
* Một đội Content vận hành

Nhóm dự án quyết định không triển khai Full Microservices trong Phase 1.

Lý do:

* Giảm độ phức tạp vận hành
* Rút ngắn thời gian triển khai
* Giảm chi phí hạ tầng
* Dễ debug và bảo trì
* Dễ onboarding cho team phát triển
* Vẫn đảm bảo khả năng mở rộng trong tương lai

Kiến trúc được thiết kế theo hướng Microservice-Ready để có thể tách service khi cần.

---

## 3. High-Level Architecture

```text
+--------------------------------------------------+
|                  React Admin UI                  |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|              ASP.NET Core API Layer              |
|               API Gateway / BFF                  |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|                 PIM Core Platform                |
|                  Modular Monolith                |
+--------------------------------------------------+
|                                                  |
| Product Module                                   |
| Asset / DAM Module                               |
| Content Module                                   |
| Material Module                                  |
| Document Module                                  |
| Workflow Module                                  |
| Usage Tracking Module                            |
| Integration Module                               |
| Social Campaign Module                           |
| Analytics Module                                 |
|                                                  |
+--------------------------------------------------+
                         |
       ---------------------------------------
       |                 |                   |
       v                 v                   v

 PostgreSQL      Object Storage        Redis

                         |
                         v

                Python AI Service

                         |
                         v

              Image Processing Worker
```

---

## 4. Architectural Principles

### Domain-Oriented Design

Hệ thống được chia thành các business modules độc lập.

Mỗi module:

* Có domain model riêng
* Có business rules riêng
* Có database schema riêng
* Có application layer riêng

Ví dụ:

Product Module không truy cập trực tiếp dữ liệu nội bộ của Asset Module.

Giao tiếp thông qua contracts hoặc events.

---

### Vertical Slice Architecture

Mỗi use case được triển khai theo một Vertical Slice.

Ví dụ:

Create Product

```text
CreateProduct
├── Endpoint
├── Command
├── Validator
├── Handler
└── Response
```

Update Product

```text
UpdateProduct
├── Endpoint
├── Command
├── Validator
├── Handler
└── Response
```

Điều này giúp code dễ đọc, dễ bảo trì và giảm coupling.

---

### Clean Architecture

Mỗi module được tổ chức thành:

```text
API
Application
Domain
Infrastructure
```

Business logic không phụ thuộc vào database hoặc framework.

Infrastructure chỉ đóng vai trò implementation.

---

## 5. Core Business Modules

### Product Module

Quản lý:

* Range
* Master Product
* Variant
* D365 Item Number

Đây là module trung tâm của toàn hệ thống.

---

### Asset / DAM Module

Quản lý:

* Packshots
* Lifestyle Images
* Videos
* CAD Files
* Line Drawings
* Technical Sheets
* Marketing Assets

Asset được lưu trên Object Storage.

Database chỉ lưu metadata.

---

### Content Module

Quản lý:

* B2B Description
* B2C Description
* USP
* Care & Maintenance
* Upholstery Description

---

### Material Module

Quản lý:

* Material Master
* Swatches
* Technical Sheets
* Material Specifications

---

### Workflow Module

Quản lý:

* Draft
* Review
* Approved
* Published

Đảm bảo mọi nội dung đều được kiểm duyệt trước khi publish.

---

### Usage Tracking Module

Theo dõi:

* Asset đang được dùng ở đâu
* Catalogue nào đang sử dụng asset
* Campaign nào đang sử dụng asset
* Website nào đang sử dụng asset

Giúp tránh việc xóa hoặc thay đổi asset đang được sử dụng.

---

### Integration Module

Quản lý tích hợp:

* D365
* Website
* iPaper
* Pricelist System
* Future External Systems

---

### Social Campaign Module

Quản lý:

* Campaign Creation
* Content Scheduling
* Platform Publishing
* Campaign Performance

---

## 6. Database Design Strategy

### Shared Database - Separated Ownership

Giai đoạn đầu sử dụng một database vật lý.

Tuy nhiên mỗi module sở hữu schema riêng.

Ví dụ:

```text
product.*
asset.*
content.*
workflow.*
integration.*
```

Nguyên tắc:

* Không join trực tiếp giữa các module
* Không truy cập DbContext của module khác
* Chỉ giao tiếp qua contracts hoặc events

Mục tiêu:

Dễ dàng tách thành microservices trong tương lai.

---

## 7. Event-Driven Processing

Sử dụng Wolverine làm message bus nội bộ.

### Commands

* CreateProduct
* UpdateProduct
* UploadAsset
* PublishProduct
* SyncFromD365

### Events

* ProductCreated
* ProductUpdated
* AssetUploaded
* ContentApproved
* ProductPublished

### Background Jobs

* D365 Synchronization
* AI Generation
* Image Processing
* Social Publishing
* Catalogue Export

---

## 8. AI Service

AI Service được triển khai riêng bằng Python.

Responsibilities:

* Description Generation
* USP Generation
* Care Instruction Generation
* Caption Generation
* Asset Tagging
* Embedding Generation

Lý do tách riêng:

* Khác technology stack
* Dễ scale độc lập
* Dễ thay đổi AI provider

---

## 9. Image Processing Worker

Triển khai như worker service riêng.

Responsibilities:

* Resize Images
* Thumbnail Generation
* Format Conversion
* Social Media Renditions
* Catalogue Renditions

Worker được kích hoạt thông qua events.

---

## 10. Future Evolution Strategy

Kiến trúc được thiết kế theo hướng Microservice-Ready.

Khi workload tăng hoặc có nhiều team phát triển độc lập:

Phase 2:

* Tách Asset Module
* Tách Image Processing Service

Phase 3:

* Tách Integration Module
* Tách Social Campaign Module

Phase 4:

* Tách Product Module

Việc tách service không yêu cầu rewrite hệ thống do các module đã được thiết kế độc lập từ đầu.

---

## 11. Final Recommendation

Recommended Architecture:

* Modular Monolith
* Vertical Slice Architecture
* Clean Architecture
* Wolverine
* PostgreSQL
* Redis
* Object Storage
* React
* ASP.NET Core
* Python AI Service

Expected Benefits:

* Faster delivery
* Lower operational complexity
* Easier maintenance
* Lower infrastructure cost
* Better developer productivity
* Future Microservice-ready
* Suitable for 100–200 users and current business scope
