# PIM Social Media Publishing & Tracking

## Executive Summary

```text
           PRODUCT IN PIM
                  │
                  ▼
        CREATE SOCIAL POST
                  │
                  ▼
      ┌─────────────────────┐
      │ Draft / Schedule /  │
      │ Publish Now         │
      └──────────┬──────────┘
                 │
                 ▼
      FACEBOOK / INSTAGRAM
         LINKEDIN / PINTEREST
                 │
                 ▼
          ANALYTICS SYNC
                 │
                 ▼
        SALES & MARKETING
             DASHBOARD
```

### Mục tiêu

Xây dựng một module Social Media trong PIM cho phép Marketing đăng bài trực tiếp lên Facebook, Instagram, LinkedIn và Pinterest; đồng thời giúp Sales tra cứu lịch sử bài đăng, nội dung đã sử dụng và hiệu quả của từng sản phẩm.

---

# 1. Business Problem

### Hiện tại

Marketing đang:

* Đăng bài thủ công trên từng nền tảng
* Quản lý nội dung phân tán
* Khó kiểm soát lịch đăng

Sales đang:

* Không biết sản phẩm nào đã được quảng bá
* Không biết nội dung nào đã dùng
* Không xem được hiệu quả từng bài đăng

### Mục tiêu sau khi triển khai

Marketing:

* Soạn bài từ PIM
* Lên lịch đăng tự động
* Quản lý nhiều Page cùng lúc

Sales:

* Xem lịch sử social theo từng sản phẩm
* Xem analytics và hiệu quả bài đăng

---

# 2. Platform Scope

## Phase 1

### Supported

* Facebook Page
* Instagram Business
* LinkedIn Company Page
* Pinterest

### Not Supported

* TikTok
* YouTube
* X (Twitter)
* Snapchat

---

# 3. Core Capabilities

## A. Social Account Management

Admin có thể:

* Connect Facebook Business
* Connect Instagram Business
* Connect LinkedIn
* Connect Pinterest

Hệ thống tự động:

* Load Pages
* Load Instagram Accounts
* Load Pinterest Boards
* Quản lý token
* Refresh token tự động

---

## B. Content Publishing

Marketing có thể:

### New Post

* Chọn sản phẩm
* Chọn nền tảng
* Chọn Page
* Chọn hình ảnh/video
* Nhập caption
* Publish ngay

### Schedule Post

* Chọn ngày giờ
* Publish tự động qua Hangfire

### Multi-Page Publishing

Một nội dung có thể đăng:

* Facebook VN
* Facebook TH
* Facebook Global

trong cùng một thao tác.

---

## C. Content Operations

### Draft Management

* Save Draft
* Edit Draft
* Delete Draft

### Duplicate Post

Copy bài cũ thành Draft mới.

Ví dụ:

Facebook VN
↓
Duplicate
↓
Facebook Thailand
↓
Translate Caption
↓
Schedule

### Bulk Post

Tạo hàng loạt Draft:

# 50 sản phẩm

×
3 Pages

150 Drafts

---

## D. Content Governance

### Template Library

Marketing tạo template:

{{ProductName}}
{{RangeName}}
{{VariantNumber}}

Hệ thống tự động merge dữ liệu sản phẩm.

### Hashtag Library

Lưu nhóm hashtag:

* Furniture
* Vietnam Market
* Export Market

### Asset Validation

Kiểm tra trước khi đăng:

* Kích thước ảnh
* Kích thước video
* Duration
* Format

---

## E. Analytics & Reporting

### Analytics Sync

Tự động đồng bộ:

* Impressions
* Reach
* Likes
* Comments
* Shares
* Saves

### Sales View

Sales xem:

* Nội dung đã đăng
* Platform
* Page
* Analytics

theo từng sản phẩm.

### Export

Xuất:

* Excel
* CSV

---

## F. Administration & Security

### Page Permission

Marketing VN:

* Chỉ thấy Page VN

Marketing TH:

* Chỉ thấy Page TH

Admin:

* Thấy tất cả

### Notification Center

Thông báo:

* Publish Success
* Publish Fail
* Token Expiry
* Analytics Sync Fail
* Bulk Job Result

### Audit Log

Lưu:

* Request
* Response
* Publish History
* Delete History

---

# 4. Technical Architecture

Frontend

* ReactJS

Backend

* ASP.NET Core 8

Database

* PostgreSQL

Background Jobs

* Hangfire

Cache

* Redis

Data Access

* EF Core (Write)
* Dapper + Stored Procedure (Read)

Pattern

* CQRS
* Repository
* Gateway Pattern

---

# 5. Sprint Roadmap

### Sprint 0

Platform Registration

* Meta Business Setup
* Meta Developer App
* Pinterest Business
* Pinterest App
* Business Verification

### Sprint 1

Foundation

* Database
* Multi-Page
* Permissions

### Sprint 2

Facebook Publishing

### Sprint 3

Instagram Publishing

### Sprint 4

Scheduling + Analytics

### Sprint 5

LinkedIn + Pinterest

### Sprint 6+

Reporting / Notification / Hardening

---

# 6. Current Risks

## High Risk

### External Dependency

Chưa có:

* Meta Business Portfolio
* Meta Developer App
* Pinterest App
* Business Verification

### App Review

Meta yêu cầu:

* pages_manage_posts
* instagram_content_publish

cần App Review trước Production.

### Single Developer Team

Scope khá lớn:

* 4 nền tảng
* 19 Functional Requirements
* Multi-page
* Analytics
* Permission
* Scheduler

=> Cần kiểm soát chặt phạm vi Sprint.


```text
┌─────────────────────────────────────────────────────────────────────┐
│                          PIM SOCIAL MODULE                          │
└─────────────────────────────────────────────────────────────────────┘

                           ┌─────────────┐
                           │ Product PIM │
                           └──────┬──────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Social Post Composer    │
                    │ - Caption               │
                    │ - Assets                │
                    │ - Template              │
                    │ - Hashtag Library       │
                    └──────────┬──────────────┘
                               │
                               ▼
                  ┌─────────────────────────────┐
                  │ Validation Layer            │
                  │ - Asset Validation          │
                  │ - Permission Check          │
                  │			        │
                  └──────────┬──────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼

   Save Draft        Schedule Post        Publish Now
          │                  │                  │
          │                  ▼                  │
          │        ┌──────────────────┐         │
          │        │ Hangfire Queue   │         │
          │        └────────┬─────────┘         │
          │                 │                   │
          └─────────────────┴───────────────────┘
                            │
                            ▼

               ┌───────────────────────────┐
               │ ISocialGateway            │
               │ (Platform Abstraction)    │
               └───────┬───────┬────────┬──┘
                       │       │        │
                       │       │        │
         ┌─────────────┘       │        └───────────────┐
         ▼                     ▼			▼

 ┌─────────────────┐   ┌─────────────────┐	┌─────────────────┐
 │ Meta Adapter    │   │ LinkedIn Adapter│	│ Pinterest       │
 │ Facebook        │   │ Zernio/Ayrshare │	│ 		  │
 │ Instagram       │   └─────────────────┘	└─────────────────┘
 └─────────────────┘
  
  



          ┌───────────────────────────────────┐
          │ Publish Result                    │
          │ platform_post_id                  │
          │ post_url                          │
          │ status                            │
          └───────────────┬───────────────────┘
                          │
                          ▼

              ┌─────────────────────────┐
              │ PostgreSQL              │
              │ social_posts            │
              │ social_pages            │
              │ social_analytics        │
              │ social_notifications    │
              └───────────┬─────────────┘
                          │
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼

┌──────────────────┐             ┌──────────────────┐
│ Analytics Sync   │             │ Notification     │
│ Every 6h / 24h   │             │ Center           │
└────────┬─────────┘             └────────┬─────────┘
         │                                │
         ▼                                ▼

┌──────────────────┐             ┌──────────────────┐
│ Social Analytics │             │ Email / Slack    │
│ Reach            │             │ In-App Alert     │
│ Likes            │             └──────────────────┘
│ Comments         │
│ Shares           │
└────────┬─────────┘
         │
         ▼

┌────────────────────────────────────┐
│ Sales View                         │
│ - Post History                     │
│ - Analytics                        │
│ - Export Excel / CSV               │
└────────────────────────────────────┘
```
