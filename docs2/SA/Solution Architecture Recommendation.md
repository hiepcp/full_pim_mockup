# Solution Architecture Recommendation

## Architecture Decision

Sau khi phân tích yêu cầu nghiệp vụ, phạm vi hệ thống và quy mô người dùng hiện tại (~100 users), đề xuất kiến trúc cho giai đoạn Phase 1 là:

**Modular Monolith + Vertical Slice Architecture + Clean Architecture + Wolverine**

Thay vì triển khai toàn bộ hệ thống theo Microservices ngay từ đầu.

---

# Why Not Full Microservices?

Mặc dù Microservices mang lại khả năng mở rộng và triển khai độc lập, nhưng đối với giai đoạn hiện tại của dự án, việc áp dụng toàn bộ Microservices sẽ tạo ra chi phí kỹ thuật và vận hành không cần thiết.

Các yếu tố hiện tại:

* Khoảng 100 người dùng nội bộ.
* Một tổ chức duy nhất.
* Một nguồn dữ liệu ERP (D365).
* Một Website chính.
* Một đội Content vận hành.
* Chưa có yêu cầu scale lớn theo hàng chục nghìn người dùng.

Độ phức tạp của dự án nằm ở:

* Product Information Management
* Asset Management
* Content Management
* Integration
* Workflow

Đây là Business Complexity, không phải Scale Complexity.

---

# Recommended Architecture

## Core Platform

PIM Core được triển khai dưới dạng Modular Monolith.

Mỗi module là một bounded context độc lập về nghiệp vụ.

Modules:

* Product Module
* Asset / DAM Module
* Content Module
* Material Module
* Document Module
* Workflow Module
* Usage Tracking Module
* Integration Module
* Social Campaign Module

---

# Architecture Principles

## Vertical Slice Architecture

Mỗi use case được đóng gói hoàn chỉnh:

* Endpoint
* Command / Query
* Validator
* Handler
* Response Model

Ví dụ:

Create Product

* CreateProductEndpoint
* CreateProductCommand
* CreateProductValidator
* CreateProductHandler
* CreateProductResponse

---

## Clean Architecture

Mỗi module được tổ chức theo:

* API Layer
* Application Layer
* Domain Layer
* Infrastructure Layer

Business logic nằm trong Domain và Application Layer.

Infrastructure chỉ đóng vai trò implementation.

---

## Module Ownership

Mỗi module sở hữu:

* Domain Model riêng
* Database Schema riêng
* DbContext riêng
* Business Rules riêng

Ví dụ:

Product Schema

* Products
* Ranges
* Variants

Asset Schema

* Assets
* AssetVersions
* Renditions

Content Schema

* Descriptions
* USPs
* CareInstructions

Điều này giúp hệ thống dễ dàng tách thành Microservices trong tương lai nếu cần.

---

# Event-Driven Internal Communication

Sử dụng Wolverine để xử lý:

Commands

* CreateProduct
* UploadAsset
* PublishProduct
* SyncFromD365

Events

* ProductCreated
* ProductUpdated
* AssetUploaded
* ContentApproved
* ProductPublished

Background Jobs

* D365 Synchronization
* Image Processing
* AI Content Generation
* Social Publishing
* Catalogue Export

---

# Service Separation Strategy

Mặc dù không triển khai Full Microservices, một số thành phần nên được tách riêng ngay từ đầu:

## AI Service

Technology:

* Python FastAPI
* Claude API
* Embedding & Tagging

Responsibilities:

* Description Generation
* USP Generation
* Caption Generation
* Quality Check

## Image Processing Service

Responsibilities:

* Resize
* Format Conversion
* Thumbnail Generation
* Social Media Formats
* Catalogue Formats

Lý do:

* Workload nặng
* Có nhu cầu scale riêng
* Không phụ thuộc business transaction

---

# Infrastructure

Backend

* ASP.NET Core 8/9
* Wolverine
* Entity Framework Core

Frontend

* React
* TypeScript

Storage

* Azure Blob Storage hoặc MinIO

Database

* PostgreSQL hoặc SQL Server

Caching

* Redis

Messaging

* Wolverine Local Queue
* RabbitMQ (Phase 2 nếu cần)

CI/CD

* GitHub Actions

Containerization

* Docker

---

# Future Microservice Path

Kiến trúc được thiết kế theo hướng Microservice-Ready.

Khi cần scale trong tương lai:

Phase 2

* Tách Asset Module thành Asset Service
* Tách Image Engine thành Image Service

Phase 3

* Tách Integration Module
* Tách Social Campaign Module

Phase 4

* Tách Product Module nếu cần

Do các module đã có:

* Database Schema riêng
* DbContext riêng
* Event Contract riêng

Nên việc chuyển đổi sẽ được thực hiện theo từng bước, không cần rewrite toàn bộ hệ thống.

---

# Final Recommendation

Recommended Architecture:

Modular Monolith

* Vertical Slice Architecture
* Clean Architecture
* Wolverine
* AI Service (Python)
* Image Processing Service

Benefits:

* Faster delivery
* Lower operational complexity
* Easier debugging
* Lower infrastructure cost
* Easier onboarding
* Future Microservice-ready

=> Phù hợp nhất với quy mô và mục tiêu của PIM Phase 1.
