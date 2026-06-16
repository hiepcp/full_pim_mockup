# Software Requirements Specification (SRS)
## Module: Social Media Publishing & Tracking
### Hệ thống: PIM (Product Information Management)

---

**Phiên bản:** 1.1  
**Ngày:** 04/06/2026  
**Trạng thái:** Draft  
**Tech stack:** .NET 8 · PostgreSQL · React.js · Hangfire · Redis  
**Team:** 1 Backend Developer  

> **Changelog v1.1:** Cập nhật team 1 developer · Tách bảng `social_pages` (multi-page per platform) · Bổ sung Data Access Strategy: EF Core (write) + Dapper + Stored Procedure (read/report)

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Phạm vi hệ thống](#2-phạm-vi-hệ-thống)
3. [Stakeholder & Người dùng](#3-stakeholder--người-dùng)
4. [Yêu cầu chức năng](#4-yêu-cầu-chức-năng)
5. [Yêu cầu phi chức năng](#5-yêu-cầu-phi-chức-năng)
6. [Kiến trúc hệ thống](#6-kiến-trúc-hệ-thống)
7. [Data Access Strategy](#7-data-access-strategy)
8. [Database Schema](#8-database-schema)
9. [Stored Procedures](#9-stored-procedures)
10. [Tích hợp API từng nền tảng](#10-tích-hợp-api-từng-nền-tảng)
11. [Data Model chi tiết](#11-data-model-chi-tiết)
12. [Luồng nghiệp vụ](#12-luồng-nghiệp-vụ)
13. [Xử lý lỗi & Resilience](#13-xử-lý-lỗi--resilience)
14. [Bảo mật](#14-bảo-mật)
15. [Roadmap triển khai](#15-roadmap-triển-khai)
16. [Rủi ro & Quyết định kỹ thuật](#16-rủi-ro--quyết-định-kỹ-thuật)
17. [Open Questions](#17-open-questions)

---

## 1. Giới thiệu

### 1.1 Mục đích tài liệu

Tài liệu này mô tả đầy đủ yêu cầu phần mềm cho module **Social Media Publishing & Tracking** trong hệ thống PIM. Module cho phép team Marketing đăng bài sản phẩm lên các mạng xã hội trực tiếp từ PIM, đồng thời cung cấp cho Sales khả năng tra cứu lịch sử đăng bài, nội dung, hình ảnh đã dùng và hiệu quả (performance metrics) của từng sản phẩm trên từng nền tảng.

### 1.2 Bối cảnh

Hiện tại, team Marketing đăng bài thủ công lên từng nền tảng mạng xã hội. Sales không có cách truy vết bài đăng nào đang live, nội dung và hình ảnh đã dùng là gì, hay hiệu quả ra sao. Đây là **khoảng trống nghiệp vụ** cần được lấp đầy bằng module này.

### 1.3 Định nghĩa & Viết tắt

| Thuật ngữ | Giải thích |
|-----------|-----------|
| PIM | Product Information Management — hệ thống quản lý thông tin sản phẩm trung tâm |
| Master Number | Mã sản phẩm cấp Master trong PIM |
| Variant Number | Mã biến thể sản phẩm (màu sắc, kích thước...) |
| Range Name | Tên dòng sản phẩm |
| Platform Account | Tài khoản Business/Creator cấp cao nhất trên nền tảng (1 account có thể có nhiều Page) |
| Social Page | Fan Page, Instagram Business Account, TikTok Account, LinkedIn Company Page — đơn vị đăng bài |
| Platform Post ID | ID bài đăng do nền tảng (Meta/TikTok/LinkedIn) trả về |
| Page Access Token | Token đặc biệt của Meta dùng để đăng bài lên Facebook Page cụ thể |
| ISocialGateway | Interface abstraction layer dùng để chuẩn hóa giao tiếp với mọi nền tảng |
| MDP | Marketing Developer Platform — gói API trả phí của LinkedIn |
| PKCE | Proof Key for Code Exchange — phương thức OAuth 2.0 an toàn cho public client |
| EF Core | Entity Framework Core — ORM dùng cho các thao tác ghi (Insert/Update/Delete) |
| Dapper | Micro-ORM dùng cho các query phức tạp và báo cáo (Read/Report) |
| SP | Stored Procedure — logic query đặt tại PostgreSQL, gọi qua Dapper |

---

## 2. Phạm vi hệ thống

### 2.1 Trong phạm vi (In Scope)

- Quản lý nhiều **Fan Page / Account** trên cùng một nền tảng (multi-page per platform)
- Đăng bài lên **Facebook Page** (ảnh, video, text, carousel)
- Đăng bài lên **Instagram Business** (ảnh, carousel, Reels)
- Đăng bài lên **TikTok Business** (video MP4/MOV)
- Đăng bài lên **LinkedIn Company Page** (qua third-party API: Zernio/Ayrshare)
- Lên lịch đăng bài (scheduled publishing)
- Đồng bộ analytics tự động (impressions, reach, likes, comments, shares)
- Sales View: tra cứu lịch sử đăng bài theo sản phẩm, theo page, theo nền tảng
- Quản lý OAuth token (refresh tự động, alert khi hết hạn)
- Ghi log toàn bộ request/response với platform API
- Webhook receiver xử lý callback từ Meta và TikTok

### 2.2 Ngoài phạm vi (Out of Scope)

- Pinterest, YouTube, X (Twitter), Snapchat — xem xét giai đoạn 2
- Paid advertising / Boost post qua API
- Social listening / Brand monitoring
- Comment management / Reply to comments
- A/B testing nội dung bài đăng
- AI auto-generate caption (tích hợp sau)
- TikTok LIVE streaming

---

## 3. Stakeholder & Người dùng

### 3.1 Stakeholder

| Stakeholder | Vai trò | Quan tâm chính |
|-------------|---------|----------------|
| Marketing Manager | Approver nội dung | Bài đăng đúng brand, đúng schedule, đúng Page |
| Marketing Executive | Người dùng chính | Soạn và đăng bài nhanh từ PIM, chọn đúng Page |
| Sales Manager | Viewer | Biết sản phẩm đang live ở đâu, Page nào |
| Sales Executive | Viewer | Tra cứu content đã dùng để tư vấn khách |
| IT/Dev Team | Builder & Maintainer | Kiến trúc, tích hợp API, bảo mật |

### 3.2 User Roles & Permissions

| Role | Quyền |
|------|-------|
| `social.publisher` | Soạn, đăng, lên lịch, xóa bài trên các Page được phân quyền |
| `social.scheduler` | Chỉ lên lịch, không đăng ngay |
| `social.viewer` | Xem lịch sử và analytics (Sales) |
| `social.admin` | Toàn quyền + quản lý OAuth token + quản lý Page |

---

## 4. Yêu cầu chức năng

### 4.1 FR-001: Kết nối tài khoản & quản lý Fan Page

**Mô tả:** Admin kết nối tài khoản Business trên từng nền tảng vào PIM. Mỗi nền tảng có thể có 1 hoặc nhiều Fan Page/Account được quản lý riêng biệt.

**Acceptance Criteria:**
- Admin vào Settings → Social Accounts → Connect
- Sau khi OAuth authorize, hệ thống tự động lấy danh sách Pages thuộc account đó (Meta API: `/me/accounts`)
- Mỗi Page được lưu thành 1 record trong `social_pages` với token riêng
- Admin có thể enable/disable từng Page độc lập
- Hiển thị danh sách Pages với trạng thái: Active / Token Expired / Disabled
- Hỗ trợ kết nối nhiều account cùng nền tảng (ví dụ: 2 Facebook Business Manager khác nhau)
- Ví dụ thực tế: Facebook có thể có "Brand Vietnam Page" + "Brand Thailand Page" + "Brand Global Page" — tất cả từ 1 lần connect

### 4.2 FR-002: Soạn và đăng bài

**Mô tả:** Marketing soạn bài đăng từ trang sản phẩm trong PIM, chọn Page cụ thể muốn đăng, và publish.

**Acceptance Criteria:**
- Chọn sản phẩm → tab "Social Posts" → nút "New Post"
- Chọn nền tảng → chọn **Page cụ thể** (dropdown danh sách Pages đang active của nền tảng đó)
- Nhập caption (có character counter theo từng nền tảng)
- Chọn asset từ PIM DAM (hình ảnh / video đã có trong hệ thống)
- Preview bài đăng theo từng nền tảng trước khi submit
- Đăng ngay hoặc chọn ngày giờ schedule
- Sau khi publish thành công: lưu `platform_post_id` và `post_url` gắn với `social_page_id`
- Cho phép đăng cùng 1 bài lên nhiều Pages cùng lúc (tạo nhiều `social_post` record)

**Ràng buộc:**
- Instagram: chỉ hỗ trợ ảnh và video, không hỗ trợ text-only
- TikTok: chỉ hỗ trợ video MP4/MOV, tối thiểu 3 giây, tối đa 1 GB
- Facebook: hỗ trợ text, ảnh, video, carousel, link post
- Caption limit: Facebook 63,206 ký tự · Instagram 2,200 · TikTok 2,200 · LinkedIn 3,000

### 4.3 FR-003: Lên lịch đăng bài (Scheduled Publishing)

**Mô tả:** Marketing chọn ngày giờ đăng bài trong tương lai. Hệ thống tự động đăng đúng giờ lên đúng Page.

**Acceptance Criteria:**
- Chọn datetime (timezone-aware, lưu UTC trong DB)
- Bài scheduled hiển thị status = `Scheduled` với countdown
- Có thể edit hoặc hủy bài scheduled trước khi publish
- Hangfire job thực hiện publish đúng `scheduled_at ± 1 phút`
- Nếu publish fail: retry tối đa 3 lần, rồi chuyển `Dead_Letter`, gửi alert

### 4.4 FR-004: Xem lịch sử bài đăng (Sales View)

**Mô tả:** Sales tra cứu toàn bộ bài đăng của một sản phẩm trên mọi nền tảng, mọi Page.

**Acceptance Criteria:**
- Vào trang sản phẩm → tab "Social Posts"
- Hiển thị danh sách bài đăng với: thumbnail asset đã dùng, nền tảng, **tên Page**, caption (truncated), ngày đăng, trạng thái, link bài đăng
- Filter theo: nền tảng, **Page cụ thể**, trạng thái (Live / Scheduled / Deleted / Failed), khoảng thời gian
- Click vào bài → xem đầy đủ caption, ảnh/video đã dùng, metrics, Page đã đăng
- Metrics hiển thị: Impressions, Reach, Likes, Comments, Shares, Engagement Rate
- Bài đã xóa vẫn hiển thị với status `Deleted` (không mất lịch sử)

### 4.5 FR-005: Đồng bộ Analytics

**Mô tả:** Hệ thống tự động pull metrics từ platform API về PIM theo chu kỳ, theo từng bài đăng trên từng Page.

**Acceptance Criteria:**
- Hangfire recurring job chạy mỗi **6 giờ** cho bài đăng trong 30 ngày gần nhất
- Chạy mỗi **24 giờ** cho bài đăng cũ hơn 30 ngày
- Metrics được upsert vào `social_analytics` với `synced_at`
- Sales thấy thời điểm "Cập nhật lúc: ..."
- Nếu platform API trả lỗi: log lại, bỏ qua bài đó, không dừng toàn bộ job

### 4.6 FR-006: Quản lý Token theo Page

**Mô tả:** Mỗi Page có token riêng. Hệ thống tự động refresh token trước khi hết hạn và alert khi có vấn đề.

**Acceptance Criteria:**
- Background service chạy **mỗi 24 giờ**
- Refresh token của **từng Page** khi còn **≤ 10 ngày** trước khi hết hạn
- Gửi email/Slack alert nếu refresh thất bại, kèm tên Page và nền tảng cụ thể
- Admin xem danh sách Pages và trạng thái token tại Settings → Social Pages
- Không lưu plain-text token trong DB (bắt buộc encrypt)

### 4.7 FR-007: Webhook Receiver

**Mô tả:** Nhận callback từ Meta và TikTok để cập nhật trạng thái bài đăng realtime.

**Acceptance Criteria:**
- Endpoint `POST /webhooks/meta` xử lý: bài bị xóa, video processed
- Endpoint `POST /webhooks/tiktok` xử lý: video đã xử lý xong (PUBLISH_COMPLETE)
- Verify HMAC-SHA256 signature trước khi xử lý
- Trả về HTTP 200 trong < 5 giây (xử lý async)
- Log toàn bộ webhook payload vào `social_publish_logs`

---

## 5. Yêu cầu phi chức năng

### 5.1 Hiệu năng (Performance)

| Chỉ số | Yêu cầu |
|--------|---------|
| Sales View API (query có filter + join) | < 500ms (P95) — đảm bảo nhờ SP + index |
| Publish API response | < 3 giây (trả về job ID, publish async) |
| Analytics sync job | Hoàn thành trong < 30 phút cho 10,000 bài |
| Scheduler accuracy | ± 1 phút so với scheduled_at |
| Report phức tạp (cross-platform, nhiều Page) | < 2 giây — dùng SP tối ưu |

### 5.2 Độ tin cậy (Reliability)

- Uptime module: ≥ 99.5%
- Retry logic: tối đa 3 lần, exponential backoff (1s, 4s, 16s)
- Circuit breaker: mở sau 5 lỗi liên tiếp, thử lại sau 30 giây
- Dead Letter Queue: bài fail quá 3 lần → alert + manual review

### 5.3 Bảo mật (Security)

- OAuth token mã hóa AES-256-GCM trước khi lưu DB
- Webhook signature verification bắt buộc (HMAC-SHA256)
- Role-based access control cho mọi endpoint
- Không log plain-text token trong bất kỳ log nào
- Rate limit API: 100 request/phút/user

### 5.4 Khả năng mở rộng (Scalability)

- Kiến trúc `ISocialGateway` cho phép thêm nền tảng mới mà không sửa business logic
- Multi-page: thêm Page mới không cần code, chỉ cần connect qua UI
- Hangfire hỗ trợ horizontal scaling (nhiều worker)
- Stored Procedures dễ optimize index độc lập với application code

### 5.5 Khả năng bảo trì (Maintainability)

- **EF Core** chỉ dùng cho write operations → migration rõ ràng, audit trail đầy đủ
- **Dapper + SP** cho read/report → DBA có thể optimize SP độc lập, không cần deploy lại app
- Mỗi Platform Adapter độc lập, có thể test riêng
- Feature flag để enable/disable từng nền tảng / từng Page mà không cần deploy

---

## 6. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — PIM API (ASP.NET Core 8)                        │
│  POST /social/posts · GET /social/posts/{productId}        │
│  GET /social/analytics/{postId} · POST /webhooks/*         │
│  GET /social/pages · POST /social/auth/{platform}/connect  │
└─────────────────────────┬───────────────────────────────────┘
                          │ MediatR Commands/Queries
┌─────────────────────────▼───────────────────────────────────┐
│  Layer 2 — Application Services (CQRS)                     │
│  Commands (EF Core):  PublishPostCommand                   │
│                       SchedulePostCommand                  │
│                       ConnectPageCommand                   │
│  Queries  (Dapper+SP): GetPostsByProductQuery              │
│                        GetAnalyticsDashboardQuery          │
│                        GetPageListQuery                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│  Layer 3 — ISocialGateway (Abstraction Interface)          │
│  PublishAsync · GetAnalyticsAsync · DeletePostAsync        │
└──────┬─────────────────┬──────────────────────┬────────────┘
       │                 │                       │
┌──────▼──────┐  ┌───────▼──────┐  ┌────────────▼──────────┐
│MetaAdapter  │  │TikTokAdapter │  │LinkedInAdapter        │
│FB + IG      │  │Video only    │  │via Zernio (3rd party) │
│Graph API v21│  │Content API v2│  │API Key auth           │
└──────┬──────┘  └───────┬──────┘  └────────────┬──────────┘
       │                 │                       │
┌──────▼─────────────────▼───────────────────────▼──────────┐
│  Layer 4 — Data Access (Dual Strategy)                     │
│  ┌─────────────────────┐  ┌──────────────────────────────┐│
│  │ EF Core (Write)     │  │ Dapper + Stored Procedure    ││
│  │ Insert / Update /   │  │ (Read / Report / Dashboard)  ││
│  │ Delete / Migration  │  │ GetPostsByProduct_SP         ││
│  │ Entity tracking     │  │ GetAnalyticsDashboard_SP     ││
│  │ Transaction support │  │ GetPagePerformance_SP        ││
│  └─────────────────────┘  └──────────────────────────────┘│
│  PostgreSQL + Hangfire + Redis + Webhook Receiver          │
└─────────────────────────┬───────────────────────────────────┘
                          │ IHostedService
┌─────────────────────────▼───────────────────────────────────┐
│  Layer 5 — Background Services                             │
│  TokenManager · AnalyticsSyncJob · ScheduledPublishJob     │
└─────────────────────────────────────────────────────────────┘
```

### 6.1 Dependency Injection — Keyed Services (.NET 8)

```csharp
services.AddKeyedScoped<ISocialGateway, MetaAdapter>("facebook");
services.AddKeyedScoped<ISocialGateway, MetaAdapter>("instagram");
services.AddKeyedScoped<ISocialGateway, TikTokAdapter>("tiktok");
services.AddKeyedScoped<ISocialGateway, LinkedInAdapter>("linkedin");

// Resolve tại runtime theo platform của page
var adapter = serviceProvider.GetRequiredKeyedService<ISocialGateway>(page.Platform);
await adapter.PublishAsync(request, cancellationToken);
```

---

## 7. Data Access Strategy

### 7.1 Nguyên tắc phân tách

| Loại thao tác | Công cụ | Lý do |
|---------------|---------|-------|
| Insert bài đăng mới | EF Core | Entity tracking, transaction, migration rõ ràng |
| Update status bài đăng | EF Core | Optimistic concurrency, audit trail |
| Insert analytics snapshot | EF Core | Upsert đơn giản, không cần join phức tạp |
| Lưu token / refresh token | EF Core | Transaction quan trọng, cần rollback khi lỗi |
| Sales View — danh sách bài theo sản phẩm | Dapper + SP | Join nhiều bảng, filter đa chiều, cần tối ưu index |
| Analytics dashboard — metrics tổng hợp | Dapper + SP | Aggregation, GROUP BY, window function |
| Báo cáo performance theo Page | Dapper + SP | Cross-platform report, DBA tối ưu độc lập |
| Danh sách Pages và trạng thái token | Dapper + SP | Join token + page + thống kê bài đăng |

### 7.2 Cấu trúc Repository

```csharp
// Write Repository — dùng EF Core
public interface ISocialPostWriteRepository
{
    Task<SocialPost> CreateAsync(SocialPost post, CancellationToken ct);
    Task UpdateStatusAsync(Guid postId, SocialPostStatus status,
                           string? platformPostId, string? errorMessage, CancellationToken ct);
    Task IncrementRetryCountAsync(Guid postId, CancellationToken ct);
    Task SoftDeleteAsync(Guid postId, CancellationToken ct);
}

// Read Repository — dùng Dapper + Stored Procedure
public interface ISocialPostReadRepository
{
    Task<PagedResult<PostSummaryDto>> GetByProductAsync(
        Guid productItemId, PostFilterDto filter, CancellationToken ct);

    Task<PostDetailDto?> GetDetailAsync(Guid postId, CancellationToken ct);

    Task<AnalyticsDashboardDto> GetDashboardAsync(
        Guid? pageId, string? platform, DateRange range, CancellationToken ct);

    Task<IReadOnlyList<PagePerformanceDto>> GetPagePerformanceAsync(
        DateRange range, CancellationToken ct);
}
```

### 7.3 Dapper + SP — Pattern chuẩn

```csharp
public class SocialPostReadRepository : ISocialPostReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public async Task<PagedResult<PostSummaryDto>> GetByProductAsync(
        Guid productItemId, PostFilterDto filter, CancellationToken ct)
    {
        await using var conn = await _connectionFactory.CreateAsync(ct);

        var parameters = new DynamicParameters();
        parameters.Add("@ProductItemId", productItemId);
        parameters.Add("@Platform",      filter.Platform);
        parameters.Add("@PageId",        filter.PageId);
        parameters.Add("@Status",        filter.Status);
        parameters.Add("@DateFrom",      filter.DateFrom);
        parameters.Add("@DateTo",        filter.DateTo);
        parameters.Add("@PageNumber",    filter.PageNumber);
        parameters.Add("@PageSize",      filter.PageSize);

        var result = await conn.QueryAsync<PostSummaryDto>(
            "sp_GetPostsByProduct",
            parameters,
            commandType: CommandType.StoredProcedure);

        return new PagedResult<PostSummaryDto>(result.ToList(), filter.PageNumber, filter.PageSize);
    }
}
```

### 7.4 EF Core — Chỉ dùng cho Write

```csharp
public class SocialPostWriteRepository : ISocialPostWriteRepository
{
    private readonly PimDbContext _db;

    public async Task<SocialPost> CreateAsync(SocialPost post, CancellationToken ct)
    {
        _db.SocialPosts.Add(post);
        await _db.SaveChangesAsync(ct);
        return post;
    }

    public async Task UpdateStatusAsync(Guid postId, SocialPostStatus status,
        string? platformPostId, string? errorMessage, CancellationToken ct)
    {
        await _db.SocialPosts
            .Where(p => p.Id == postId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.Status,         status)
                .SetProperty(p => p.PlatformPostId, platformPostId)
                .SetProperty(p => p.ErrorMessage,   errorMessage)
                .SetProperty(p => p.PublishedAt,    status == SocialPostStatus.Published ? DateTime.UtcNow : null)
                .SetProperty(p => p.UpdatedAt,      DateTime.UtcNow), ct);
    }
}
```

---

## 8. Database Schema

### 8.1 Bảng `social_platform_accounts` *(mới — tách khỏi token)*

Lưu thông tin tài khoản Business cấp cao (1 account có thể có nhiều Pages).

```sql
CREATE TABLE social_platform_accounts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform       VARCHAR(20)  NOT NULL,   -- 'facebook' | 'instagram' | 'tiktok' | 'linkedin'
    account_id     VARCHAR(100) NOT NULL,   -- Business Manager ID / TikTok Business ID
    account_name   VARCHAR(200),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    connected_by   VARCHAR(100) NOT NULL,
    connected_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (platform, account_id)
);
```

### 8.2 Bảng `social_pages` *(mới — đơn vị đăng bài)*

Mỗi Fan Page / IG Account / TikTok Account / LinkedIn Page là 1 record.

```sql
CREATE TABLE social_pages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id          UUID         NOT NULL REFERENCES social_platform_accounts(id),
    platform            VARCHAR(20)  NOT NULL,
    page_id             VARCHAR(100) NOT NULL,  -- Facebook Page ID / IG User ID / TikTok User ID
    page_name           VARCHAR(200) NOT NULL,  -- Tên hiển thị: "Brand Vietnam Page"
    page_picture_url    TEXT,                   -- Avatar của Page (lấy từ API)
    access_token_enc    TEXT         NOT NULL,  -- AES-256-GCM encrypted Page Access Token
    refresh_token_enc   TEXT,
    token_expires_at    TIMESTAMPTZ  NOT NULL,
    token_refreshed_at  TIMESTAMPTZ,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (platform, page_id)
);

CREATE INDEX idx_social_pages_platform ON social_pages(platform, is_active);
CREATE INDEX idx_social_pages_expires  ON social_pages(token_expires_at) WHERE is_active = TRUE;
```

### 8.3 Bảng `social_posts`

```sql
CREATE TABLE social_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_item_id     UUID         NOT NULL REFERENCES product_items(id),
    social_page_id      UUID         NOT NULL REFERENCES social_pages(id),  -- FK tới Page cụ thể
    platform            VARCHAR(20)  NOT NULL,
    caption             TEXT,
    hashtags            TEXT,
    platform_post_id    VARCHAR(200),
    post_url            TEXT,
    status              VARCHAR(20)  NOT NULL DEFAULT 'Draft',
                        -- Draft | Scheduled | Publishing | Published | Failed | Dead_Letter | Deleted
    scheduled_at        TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ,
    error_message       TEXT,
    retry_count         INT          NOT NULL DEFAULT 0,
    created_by          VARCHAR(100) NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_posts_product  ON social_posts(product_item_id);
CREATE INDEX idx_social_posts_page     ON social_posts(social_page_id, status);
CREATE INDEX idx_social_posts_platform ON social_posts(platform, status);
CREATE INDEX idx_social_posts_sched    ON social_posts(scheduled_at) WHERE status = 'Scheduled';
```

### 8.4 Bảng `social_post_assets`

```sql
CREATE TABLE social_post_assets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_post_id      UUID         NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    pim_asset_id        UUID         NOT NULL REFERENCES pim_assets(id),
    asset_type          VARCHAR(20)  NOT NULL,  -- 'image' | 'video' | 'carousel_item'
    cdn_url             TEXT         NOT NULL,
    platform_media_id   VARCHAR(200),
    sort_order          INT          NOT NULL DEFAULT 0
);
```

### 8.5 Bảng `social_analytics`

```sql
CREATE TABLE social_analytics (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_post_id   UUID        NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    synced_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    impressions      INT         NOT NULL DEFAULT 0,
    reach            INT         NOT NULL DEFAULT 0,
    likes            INT         NOT NULL DEFAULT 0,
    comments         INT         NOT NULL DEFAULT 0,
    shares           INT         NOT NULL DEFAULT 0,
    saves            INT         NOT NULL DEFAULT 0,
    video_views      INT         NOT NULL DEFAULT 0,
    engagement_rate  FLOAT,
    raw_payload      JSONB,
    UNIQUE (social_post_id, synced_at)
);

CREATE INDEX idx_analytics_post    ON social_analytics(social_post_id);
CREATE INDEX idx_analytics_synced  ON social_analytics(synced_at DESC);
```

### 8.6 Bảng `social_publish_logs`

```sql
CREATE TABLE social_publish_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_post_id UUID        NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    action         VARCHAR(50) NOT NULL,
    http_status    INT,
    request_body   TEXT,
    response_body  TEXT,
    logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publish_logs_post ON social_publish_logs(social_post_id, logged_at DESC);
```

---

## 9. Stored Procedures

### 9.1 `sp_GetPostsByProduct` — Sales View chính

Dùng cho FR-004: hiển thị toàn bộ bài đăng của 1 sản phẩm, có filter và phân trang.

```sql
CREATE OR REPLACE PROCEDURE sp_GetPostsByProduct(
    p_product_item_id  UUID,
    p_platform         VARCHAR(20)  DEFAULT NULL,
    p_page_id          UUID         DEFAULT NULL,
    p_status           VARCHAR(20)  DEFAULT NULL,
    p_date_from        TIMESTAMPTZ  DEFAULT NULL,
    p_date_to          TIMESTAMPTZ  DEFAULT NULL,
    p_page_number      INT          DEFAULT 1,
    p_page_size        INT          DEFAULT 20
)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT
        sp.id,
        sp.platform,
        pg.page_name,
        pg.page_picture_url,
        sp.caption,
        sp.hashtags,
        sp.post_url,
        sp.status,
        sp.scheduled_at,
        sp.published_at,
        sp.created_by,
        sp.created_at,
        -- Asset chính (ảnh đầu tiên hoặc video)
        (SELECT spa.cdn_url FROM social_post_assets spa
         WHERE spa.social_post_id = sp.id
         ORDER BY spa.sort_order LIMIT 1) AS thumbnail_url,
        -- Analytics mới nhất
        sa.impressions,
        sa.reach,
        sa.likes,
        sa.comments,
        sa.shares,
        sa.engagement_rate,
        sa.synced_at AS analytics_synced_at,
        -- Tổng số bản ghi (cho phân trang)
        COUNT(*) OVER() AS total_count
    FROM social_posts sp
    INNER JOIN social_pages pg ON pg.id = sp.social_page_id
    LEFT JOIN LATERAL (
        SELECT * FROM social_analytics
        WHERE social_post_id = sp.id
        ORDER BY synced_at DESC
        LIMIT 1
    ) sa ON TRUE
    WHERE
        sp.product_item_id = p_product_item_id
        AND (p_platform IS NULL OR sp.platform = p_platform)
        AND (p_page_id  IS NULL OR sp.social_page_id = p_page_id)
        AND (p_status   IS NULL OR sp.status = p_status)
        AND (p_date_from IS NULL OR sp.created_at >= p_date_from)
        AND (p_date_to   IS NULL OR sp.created_at <= p_date_to)
    ORDER BY sp.created_at DESC
    LIMIT p_page_size OFFSET (p_page_number - 1) * p_page_size;
END;
$$;
```

### 9.2 `sp_GetAnalyticsDashboard` — Dashboard tổng hợp

Dùng cho report tổng quan: tất cả bài đăng theo khoảng thời gian, tổng hợp metrics theo nền tảng và Page.

```sql
CREATE OR REPLACE PROCEDURE sp_GetAnalyticsDashboard(
    p_page_id    UUID         DEFAULT NULL,
    p_platform   VARCHAR(20)  DEFAULT NULL,
    p_date_from  TIMESTAMPTZ  DEFAULT NULL,
    p_date_to    TIMESTAMPTZ  DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT
        sp.platform,
        pg.page_name,
        COUNT(sp.id)              AS total_posts,
        COUNT(sp.id) FILTER (WHERE sp.status = 'Published') AS published_count,
        COUNT(sp.id) FILTER (WHERE sp.status = 'Scheduled') AS scheduled_count,
        SUM(sa_latest.impressions)    AS total_impressions,
        SUM(sa_latest.reach)          AS total_reach,
        SUM(sa_latest.likes)          AS total_likes,
        SUM(sa_latest.comments)       AS total_comments,
        SUM(sa_latest.shares)         AS total_shares,
        ROUND(AVG(sa_latest.engagement_rate)::NUMERIC, 2) AS avg_engagement_rate
    FROM social_posts sp
    INNER JOIN social_pages pg ON pg.id = sp.social_page_id
    LEFT JOIN LATERAL (
        SELECT impressions, reach, likes, comments, shares, engagement_rate
        FROM social_analytics
        WHERE social_post_id = sp.id
        ORDER BY synced_at DESC
        LIMIT 1
    ) sa_latest ON TRUE
    WHERE
        (p_page_id   IS NULL OR sp.social_page_id = p_page_id)
        AND (p_platform IS NULL OR sp.platform     = p_platform)
        AND (p_date_from IS NULL OR sp.published_at >= p_date_from)
        AND (p_date_to   IS NULL OR sp.published_at <= p_date_to)
        AND sp.status = 'Published'
    GROUP BY sp.platform, pg.page_name
    ORDER BY total_impressions DESC NULLS LAST;
END;
$$;
```

### 9.3 `sp_GetPagePerformance` — So sánh hiệu quả từng Page

```sql
CREATE OR REPLACE PROCEDURE sp_GetPagePerformance(
    p_date_from  TIMESTAMPTZ,
    p_date_to    TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT
        pg.id            AS page_id,
        pg.page_name,
        pg.platform,
        pg.page_picture_url,
        COUNT(sp.id)     AS post_count,
        SUM(sa.reach)    AS total_reach,
        SUM(sa.likes + sa.comments + sa.shares) AS total_engagements,
        ROUND(
            CASE WHEN SUM(sa.reach) > 0
            THEN SUM(sa.likes + sa.comments + sa.shares)::NUMERIC / SUM(sa.reach) * 100
            ELSE 0 END, 2
        ) AS avg_engagement_rate,
        MAX(sp.published_at) AS last_post_at
    FROM social_pages pg
    LEFT JOIN social_posts sp
        ON sp.social_page_id = pg.id
        AND sp.status = 'Published'
        AND sp.published_at BETWEEN p_date_from AND p_date_to
    LEFT JOIN LATERAL (
        SELECT reach, likes, comments, shares
        FROM social_analytics
        WHERE social_post_id = sp.id
        ORDER BY synced_at DESC LIMIT 1
    ) sa ON TRUE
    WHERE pg.is_active = TRUE
    GROUP BY pg.id, pg.page_name, pg.platform, pg.page_picture_url
    ORDER BY total_reach DESC NULLS LAST;
END;
$$;
```

---

## 10. Tích hợp API từng nền tảng

### 10.1 Meta Graph API (Facebook + Instagram)

| Thuộc tính | Giá trị |
|-----------|---------|
| API Version | Graph API v21+ |
| Chi phí | Miễn phí |
| Authentication | OAuth 2.0 → User Token → exchange sang **Page Access Token** (riêng cho mỗi Page) |
| Token expiry | 60 ngày (long-lived), cần refresh |
| Facebook post limit | Không giới hạn |
| Instagram post limit | 25 bài/ngày |
| App Review | Bắt buộc — cần quyền `pages_manage_posts`, `instagram_basic`, `instagram_content_publish` |

**Lấy danh sách Pages sau khi connect:**
```
GET /me/accounts?fields=id,name,picture,access_token
→ Trả về mảng Pages thuộc Business Manager
→ Lưu từng Page vào social_pages với access_token riêng
```

**Facebook publish flow:**
```
POST /{page-id}/photos    → ảnh đơn
POST /{page-id}/videos    → video
POST /{page-id}/feed      → text + link / carousel
```

**Instagram publish flow (2 bước bắt buộc):**
```
1. POST /{ig-user-id}/media
   Body: { image_url, caption }   → trả về creation_id

2. POST /{ig-user-id}/media_publish
   Body: { creation_id }          → trả về post_id
```

> **Lưu ý quan trọng:** Instagram KHÔNG nhận file upload trực tiếp. Phải dùng `image_url` là URL công khai (CDN/S3 pre-signed). Đây là **blocker** — cần CDN trước Sprint 2.

**Polly configuration:**
```csharp
services.AddHttpClient<MetaHttpClient>()
    .AddPolicyHandler(HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, i => TimeSpan.FromSeconds(Math.Pow(4, i))))
    .AddPolicyHandler(HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```

### 10.2 TikTok Content Posting API v2

| Thuộc tính | Giá trị |
|-----------|---------|
| API Version | Content Posting API v2 |
| Chi phí | Miễn phí (sau khi pass audit) |
| Authentication | OAuth 2.0 PKCE |
| Video limit | 25 videos/ngày/account |
| Format | MP4/MOV, tối thiểu 3 giây, tối đa 1 GB |
| App Audit | **Bắt buộc** — trước audit bài chỉ private |

**TikTok video upload flow (async):**
```
1. POST /v2/post/publish/video/init
   → trả về: upload_url, publish_id

2. PUT {upload_url}  (chunked upload, Content-Range header)

3. POST /v2/post/publish/video/complete

4. Poll GET /v2/post/publish/status/fetch?publish_id={id}
   hoặc nhận webhook PUBLISH_COMPLETE
   → update status = Published
```

> TikTok publish là **async** — KHÔNG update Published ngay sau upload. Phải đợi webhook hoặc poll.

### 10.3 LinkedIn (via Zernio/Ayrshare)

| Thuộc tính | Giá trị |
|-----------|---------|
| Cách tích hợp | Third-party API (Zernio hoặc Ayrshare) |
| Chi phí | Zernio: ~$6/account/tháng |
| Authentication | API Key (không cần OAuth tự xử lý) |
| Analytics | Included trong gói |
| Lý do chọn | LinkedIn MDP trực tiếp ~$699+/tháng |

```http
POST https://zernio.com/api/v1/posts
Authorization: Bearer {ZERNIO_API_KEY}

{
  "platforms": ["linkedin"],
  "text": "Caption...",
  "mediaUrls": ["https://cdn.pim.company.com/image.jpg"],
  "scheduleDate": "2026-06-05T09:00:00Z"
}
```

---

## 11. Data Model chi tiết

### 11.1 Enum: Platform

```csharp
public enum SocialPlatform
{
    Facebook  = 1,
    Instagram = 2,
    TikTok    = 3,
    LinkedIn  = 4
}
```

### 11.2 Enum: Post Status

```csharp
public enum SocialPostStatus
{
    Draft       = 0,  // Mới tạo, chưa submit
    Scheduled   = 1,  // Đã lên lịch
    Publishing  = 2,  // Đang gọi platform API
    Published   = 3,  // Thành công, có platform_post_id
    Failed      = 4,  // Lỗi, đang retry
    Dead_Letter = 5,  // Quá 3 lần retry
    Deleted     = 6   // Đã xóa (soft delete)
}
```

### 11.3 Interface ISocialGateway

```csharp
public interface ISocialGateway
{
    string Platform { get; }

    Task<PublishResult> PublishAsync(
        PublishRequest request,
        CancellationToken cancellationToken);

    Task<AnalyticsResult> GetAnalyticsAsync(
        string platformPostId,
        string pageAccessToken,
        CancellationToken cancellationToken);

    Task<bool> DeletePostAsync(
        string platformPostId,
        string pageAccessToken,
        CancellationToken cancellationToken);

    // Dùng khi connect account — lấy danh sách Pages
    Task<IReadOnlyList<PageInfo>> GetPagesAsync(
        string userAccessToken,
        CancellationToken cancellationToken);
}

public record PublishRequest(
    string Caption,
    IReadOnlyList<string> MediaUrls,
    string PageId,
    string PageAccessToken,
    Dictionary<string, object>? PlatformOptions = null);

public record PageInfo(
    string PageId,
    string PageName,
    string? PagePictureUrl,
    string PageAccessToken);

public record PublishResult(
    bool IsSuccess,
    string? PlatformPostId,
    string? PostUrl,
    string? ErrorMessage);
```

---

## 12. Luồng nghiệp vụ

### 12.1 Luồng Connect Account & Load Pages

```
Admin → Settings → Connect Facebook
    → Redirect OAuth → User authorize
    → Callback với user_access_token
    → Lưu social_platform_accounts (EF Core Insert)
    → Gọi Meta API: GET /me/accounts
    → Foreach Page:
        → Exchange Page Access Token
        → EF Core Insert social_pages (page_id, page_name, token_enc)
    → Hiển thị danh sách Pages để Admin enable/disable
```

### 12.2 Luồng đăng bài ngay (Publish Now)

```
Marketing → Chọn sản phẩm → New Post
    → Chọn nền tảng → Dropdown chọn Page (từ social_pages)
    → Nhập caption + chọn asset
    → PublishPostCommand (MediatR)
    → EF Core Insert social_posts (status = Publishing)
    → ISocialGateway.PublishAsync(pageId, pageAccessToken, ...)
    → Gọi Platform API
    → EF Core UpdateStatus (status = Published, platform_post_id, post_url)
    → EF Core Insert social_publish_logs
```

### 12.3 Luồng Analytics Sync

```
[Mỗi 6 giờ] Hangfire Recurring Job
    → Dapper: SELECT post_id, platform_post_id, page_access_token
               FROM social_posts sp JOIN social_pages pg
               WHERE sp.status = 'Published' AND sp.published_at > NOW() - 30 days
    → Foreach bài → ISocialGateway.GetAnalyticsAsync()
    → EF Core Upsert social_analytics
    → Nếu lỗi: log + skip, không dừng job
```

### 12.4 Luồng Token Refresh

```
[Mỗi 24 giờ] TokenManager IHostedService
    → Dapper: SELECT * FROM social_pages
               WHERE token_expires_at < NOW() + 10 days AND is_active = TRUE
    → Foreach page:
        → Decrypt token → gọi Platform refresh API
        → EF Core Update: token_enc, token_expires_at, token_refreshed_at
        → Nếu fail: gửi alert kèm page_name + platform
```

---

## 13. Xử lý lỗi & Resilience

### 13.1 Retry Policy (Polly)

```
Lần 1: ngay lập tức
Lần 2: sau 4 giây
Lần 3: sau 16 giây
→ Quá 3 lần: status = Dead_Letter + Alert
```

### 13.2 Circuit Breaker

- Mở sau 5 lỗi liên tiếp trong 1 phút
- Half-open sau 30 giây
- Close nếu request tiếp theo thành công

### 13.3 Rate Limit Handling

- **Meta:** Đọc header `X-App-Usage`, nếu > 80% → pause 60 giây
- **TikTok:** Đọc header `X-RateLimit-Remaining`, queue lại nếu gần limit
- **LinkedIn (Zernio):** Zernio xử lý internally

### 13.4 Webhook Failure

- Trả HTTP 200 ngay lập tức, xử lý async
- Nếu processing fail: log payload đầy đủ để replay thủ công
- Reject nếu HMAC signature sai (HTTP 401)

---

## 14. Bảo mật

### 14.1 Token Encryption (per Page)

```csharp
// Mỗi Page có access token riêng — encrypt trước khi lưu
var encryptedToken = _aesEncryptor.Encrypt(plainPageToken, _config["Encryption:Key"]);

// Decrypt khi cần publish lên Page đó
var plainToken = _aesEncryptor.Decrypt(page.AccessTokenEnc, _config["Encryption:Key"]);
```

### 14.2 Webhook Signature Verification

```csharp
// Meta
var signature = request.Headers["X-Hub-Signature-256"];
var expected  = ComputeHmacSha256(requestBody, _config["Meta:AppSecret"]);
if (!CryptographicOperations.FixedTimeEquals(signature, expected))
    return Unauthorized();

// TikTok
var timestamp    = request.Headers["X-Tiktok-Timestamp"];
var nonce        = request.Headers["X-Tiktok-Nonce"];
var rawSignature = $"{_config["TikTok:ClientKey"]}{timestamp}{nonce}{requestBody}";
```

### 14.3 Nguyên tắc bảo mật

- **Không log token** trong bất kỳ log nào (dù debug)
- **Rotation:** Encryption key rotate định kỳ 3 tháng/lần
- **Least privilege:** Mỗi Platform App chỉ request quyền tối thiểu
- **Audit log:** Mọi publish/delete ghi vào `social_publish_logs`

---

## 15. Roadmap triển khai

> **Team: 1 Developer · Timeline: 10 tuần**

### Sprint 1 — Tuần 1–2: Foundation + Multi-Page

| Task | Mô tả |
|------|-------|
| Schema & Migration | EF Core migration tạo 6 bảng PostgreSQL (bao gồm `social_platform_accounts` + `social_pages`) |
| ISocialGateway interface | Domain entities, Enum Platform/Status, Records |
| Meta OAuth flow | FB Login → callback → exchange User Token → lấy danh sách Pages → lưu từng Page |
| TokenManager | IHostedService: daily check token per Page, refresh nếu sắp hết hạn, alert nếu fail |
| MetaHttpClient + Polly | Retry 3 lần, circuit breaker, đọc X-App-Usage header |
| Settings UI (cơ bản) | Trang quản lý Pages: danh sách, trạng thái token, enable/disable |

**DoD:** Admin connect được Facebook, hệ thống tự lưu danh sách Pages với token riêng.

### Sprint 2 — Tuần 3–4: Meta Publish

| Task | Mô tả |
|------|-------|
| Facebook publisher | POST /{page-id}/photos, /videos, /feed. EF Core Insert + Update status |
| Instagram publisher | 2-step flow: /media → creation_id → /media_publish |
| Hangfire scheduler | SchedulePostCommand enqueue job, job publish đúng giờ |
| Error handling | Retry + Dead Letter + alert. EF Core IncrementRetryCount |
| Social Posts UI | New Post form: chọn Page từ dropdown, preview, submit |

**DoD:** Đăng được bài thực lên Facebook Page và Instagram Business. Scheduled post đúng giờ.

### Sprint 3 — Tuần 5–6: Read Layer + Dapper + SP

| Task | Mô tả |
|------|-------|
| Dapper setup | IDbConnectionFactory, SocialPostReadRepository |
| sp_GetPostsByProduct | SP đầy đủ: join pages + analytics mới nhất, filter, phân trang |
| sp_GetAnalyticsDashboard | Aggregation theo platform, Page, khoảng thời gian |
| sp_GetPagePerformance | So sánh hiệu quả từng Page |
| Sales View API | GET /social/posts/{productId} — gọi Dapper + SP |
| React Sales View UI | Tab "Social Posts": danh sách, filter theo Page/platform/status, metrics |

**DoD:** Sales xem được lịch sử bài đăng theo sản phẩm với đầy đủ filter và metrics.

### Sprint 4 — Tuần 7–8: Analytics Sync

| Task | Mô tả |
|------|-------|
| Meta Analytics sync job | Hangfire 6h: GET /{post-id}/insights → EF Core Upsert analytics |
| Webhook receiver | POST /webhooks/meta + /tiktok, HMAC verify, async xử lý |
| Analytics Dashboard UI | Charts tổng hợp metrics theo Page và platform |
| Webhook xử lý post deleted | Khi bài bị xóa ngoài PIM → auto update status = Deleted |

**DoD:** Metrics tự động cập nhật. Webhook hoạt động ổn định.

### Sprint 5 — Tuần 9–10: TikTok + LinkedIn + Polish

| Task | Mô tả |
|------|-------|
| TikTok OAuth PKCE | Connect flow, lưu TikTok Account vào social_pages |
| TikTok video upload | Chunked upload 3 bước + async status polling |
| LinkedInAdapter via Zernio | HttpClient đơn giản, cùng ISocialGateway interface |
| Feature flags | Enable/disable từng nền tảng qua config |
| Integration tests | Test toàn bộ flow publish + analytics per platform |
| UAT | Kiểm thử với Marketing và Sales |

**DoD:** 3 nền tảng hoạt động hoàn chỉnh. UAT pass. Sẵn sàng production.

---

## 16. Rủi ro & Quyết định kỹ thuật

### 16.1 Quyết định đã chốt

| # | Quyết định | Lý do |
|---|-----------|-------|
| ADR-001 | `ISocialGateway` abstraction layer | Tránh vendor lock-in, dễ thêm nền tảng mới, testable |
| ADR-002 | LinkedIn qua Zernio (third-party) | Tránh chi phí LinkedIn MDP $699+/tháng |
| ADR-003 | Meta + TikTok tích hợp trực tiếp | Miễn phí, toàn quyền kiểm soát |
| ADR-004 | Hangfire cho scheduler | Native .NET, PostgreSQL storage, UI dashboard có sẵn |
| ADR-005 | Token mã hóa AES-256-GCM per Page | Mỗi Page có token riêng, bảo mật độc lập |
| ADR-006 | Analytics sync mỗi 6h | Cân bằng data freshness và rate limit |
| ADR-007 | **EF Core cho Write, Dapper + SP cho Read** | EF Core: migration + audit trail + transaction. Dapper + SP: hiệu năng cao cho query phức tạp, DBA optimize độc lập với app |
| ADR-008 | **Tách `social_pages` khỏi token** | Hỗ trợ multi-page per platform rõ ràng, mỗi Page quản lý token độc lập |

### 16.2 Rủi ro kỹ thuật

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Instagram cần CDN URL (không upload trực tiếp) | **Cao** | Chuẩn bị CDN/S3 trước Sprint 2. Blocker nếu thiếu. |
| TikTok audit kéo dài 1–2 tháng | **Cao** | Submit audit ngay tuần 1. Dev với sandbox trước. |
| Meta App Review cần vài tuần | **Trung bình** | Submit review ngay Sprint 1. |
| Zernio tăng giá hoặc shutdown | **Thấp** | LinkedInAdapter implement ISocialGateway → switch provider 1 ngày. |
| Token refresh fail cho nhiều Pages | **Trung bình** | Alert kèm tên Page cụ thể, manual override ở admin panel. |
| SP phức tạp khó debug | **Thấp** | Log parameters đầy vào, có migration script, version SP rõ ràng. |
| 1 dev → bottleneck | **Trung bình** | Sprint đã tách thành deliverable độc lập. Ưu tiên Meta trước, TikTok/LinkedIn Sprint 5. |

---

## 17. Open Questions

| # | Câu hỏi | Owner | Deadline |
|---|---------|-------|---------|
| OQ-001 | CDN/S3 cho PIM assets đã có chưa? (Blocker Instagram) | IT Infra | Trước Sprint 2 |
| OQ-002 | Facebook Business Manager đã setup chưa? Có bao nhiêu Pages cần connect? | Marketing | Tuần 1 |
| OQ-003 | TikTok Business Account đã có chưa? Ai là người submit audit? | Marketing + Dev | Tuần 1 |
| OQ-004 | Zernio hay Ayrshare? Tạo account và test thử ngay | Dev | Tuần 1 |
| OQ-005 | Kênh alert: Email hay Slack? Ai nhận alert token fail? | PM | Tuần 1 |
| OQ-006 | Timezone mặc định cho scheduler? (UTC khuyến nghị) | PM | Sprint 1 |
| OQ-007 | Sales cần export báo cáo ra Excel không? (Dùng SP có sẵn, thêm endpoint) | PO | Sprint 3 |
| OQ-008 | Permission: Publisher có thể đăng lên tất cả Pages hay chỉ Pages được phân quyền? | PM | Sprint 1 |
| OQ-009 | Stored Procedures được deploy qua EF Core migration hay script riêng? | Dev | Sprint 1 |

---

## Phụ lục A — Bảng so sánh API nền tảng

| | Meta Graph API | TikTok Content API | LinkedIn (Zernio) |
|--|---------------|-------------------|-------------------|
| **Chi phí** | Miễn phí | Miễn phí | ~$18/tháng |
| **Auth** | OAuth 2.0 → Page Token (per Page) | OAuth 2.0 PKCE | API Key |
| **Token expiry** | 60 ngày / Page | Cần refresh | N/A (Zernio lo) |
| **Multi-page** | Có — /me/accounts | N/A (1 account = 1 TikTok) | Có (qua Zernio) |
| **Content type** | Ảnh, video, text, carousel | Video only | Ảnh, video, text |
| **Post limit/ngày** | 25 (IG) / unlimited (FB) | 25 videos | Unlimited |
| **Analytics API** | Đầy đủ | Giới hạn | Included (Zernio) |
| **App Review** | Bắt buộc (vài tuần) | Audit 1–2 tháng | Không cần |
| **Webhook** | Có | Có | Zernio lo |
| **Độ phức tạp** | Trung bình | Cao (async, chunked) | Thấp |

---

## Phụ lục B — API Endpoints tóm tắt

```
# Platform Accounts & Pages
GET    /api/social/accounts                         Danh sách accounts đã connect
POST   /api/social/auth/{platform}/connect          Bắt đầu OAuth flow
GET    /api/social/auth/{platform}/callback         OAuth callback
GET    /api/social/pages                            Danh sách tất cả Pages
GET    /api/social/pages/{platform}                 Pages theo nền tảng
PATCH  /api/social/pages/{id}/toggle               Enable / Disable Page

# Social Posts
POST   /api/social/posts                            Tạo và đăng bài (hoặc schedule)
GET    /api/social/posts/product/{productId}        Lịch sử bài đăng theo sản phẩm (Dapper + SP)
GET    /api/social/posts/{id}                       Chi tiết 1 bài
DELETE /api/social/posts/{id}                       Xóa bài (platform + soft delete DB)

# Analytics
GET    /api/social/analytics/dashboard              Tổng hợp metrics (Dapper + SP)
GET    /api/social/analytics/pages/performance      So sánh hiệu quả từng Page (Dapper + SP)
POST   /api/social/analytics/sync                   Trigger sync thủ công

# Webhooks
POST   /webhooks/meta                               Meta webhook
POST   /webhooks/tiktok                             TikTok webhook
```

---

## Phụ lục C — Data Access Mapping (EF Core vs Dapper)

| Endpoint / Use case | Strategy | SP / Method |
|--------------------|----------|-------------|
| POST /social/posts | **EF Core Insert** | `SocialPosts.Add()` |
| Hangfire publish job | **EF Core Update** | `ExecuteUpdateAsync()` |
| Token refresh | **EF Core Update** | `ExecuteUpdateAsync()` |
| Analytics upsert | **EF Core Insert** | `AddOrUpdate()` |
| GET posts by product | **Dapper + SP** | `sp_GetPostsByProduct` |
| Analytics dashboard | **Dapper + SP** | `sp_GetAnalyticsDashboard` |
| Page performance | **Dapper + SP** | `sp_GetPagePerformance` |
| Token check (background) | **Dapper** | Raw query (SELECT only) |

---

*Tài liệu SRS — PIM Social Media Module*  
*Phiên bản: 1.1 · Cập nhật: 04/06/2026*  
*Phiên bản tiếp theo sẽ bổ sung: Sequence diagrams, Test plan, Deployment guide*
