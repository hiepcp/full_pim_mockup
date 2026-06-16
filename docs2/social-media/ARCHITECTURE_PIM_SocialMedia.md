# Architecture Decision — PIM Social Media Module
## Vertical Slice Architecture + Clean Architecture + Wolverine

---

**Phiên bản:** 1.0  
**Ngày:** 05/06/2026  
**Trạng thái:** Đã chốt  
**Áp dụng cho:** PIM Social Media Publishing & Tracking Module  
**Liên quan:** SRS_PIM_SocialMedia_Module_v1.2.md  

---

## Mục lục

1. [Quyết định đã chốt](#1-quyết-định-đã-chốt)
2. [Tại sao Vertical Slice + Clean Architecture](#2-tại-sao-vertical-slice--clean-architecture)
3. [Tại sao Wolverine](#3-tại-sao-wolverine)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Ví dụ code thực tế — FR-002 Publish Post](#5-ví-dụ-code-thực-tế--fr-002-publish-post)
6. [Wolverine thay thế Hangfire như thế nào](#6-wolverine-thay-thế-hangfire-như-thế-nào)
7. [Pipeline Behavior với Wolverine](#7-pipeline-behavior-với-wolverine)
8. [So sánh các lựa chọn khác](#8-so-sánh-các-lựa-chọn-khác)
9. [Migration path nếu đổi ý](#9-migration-path-nếu-đổi-ý)
10. [Checklist trước khi bắt đầu code](#10-checklist-trước-khi-bắt-đầu-code)

---

## 1. Quyết định đã chốt

| # | Hạng mục | Quyết định | Thay thế gì |
|---|----------|-----------|-------------|
| ADR-101 | CQRS Dispatcher | **Wolverine** (MIT, free) | MediatR v13+ (commercial) |
| ADR-102 | Job Scheduler | **Wolverine** built-in scheduling | Hangfire (bỏ hoàn toàn) |
| ADR-103 | Architecture pattern | **Vertical Slice + Clean Architecture** | Layered Architecture truyền thống |
| ADR-104 | API style | **Minimal API** (.NET 8) | Controller-based |
| ADR-105 | Write ORM | **EF Core 8** | Giữ nguyên từ SRS |
| ADR-106 | Read layer | **Dapper + raw SQL** trong Handler | Dapper + Stored Procedure |
| ADR-107 | Message bus | **Wolverine** in-process (Phase 1) | — |

> **Lưu ý ADR-106:** Chuyển SQL từ Stored Procedure vào C# Handler — logic query giữ nguyên hoàn toàn, chỉ thay nơi đặt. Giải quyết OQ-009 (SP deploy qua migration hay script riêng) — không còn cần thiết nữa.

---

## 2. Tại sao Vertical Slice + Clean Architecture

### 2.1 Vấn đề của Layered Architecture truyền thống

```
Layered (truyền thống):
Controllers/
  SocialPostController.cs      ← tất cả endpoints ở đây
Services/
  SocialPostService.cs         ← tất cả business logic ở đây
Repositories/
  SocialPostRepository.cs      ← tất cả data access ở đây
```

Khi thêm feature **Duplicate Post (FR-008)**:
- Phải chạm vào `SocialPostController.cs` → thêm endpoint
- Phải chạm vào `SocialPostService.cs` → thêm method
- Phải chạm vào `SocialPostRepository.cs` → thêm query

**3 file trong 3 tầng khác nhau cho 1 feature** — dễ conflict khi làm song song.

---

### 2.2 Vertical Slice giải quyết thế nào

```
Features/
  SocialPosts/
    PublishPost/          ← FR-002: tất cả logic nằm đây
    SchedulePost/         ← FR-003
    DuplicatePost/        ← FR-008: thêm folder mới, không đụng gì cũ
    BulkCreateDraft/      ← FR-009
    DeletePost/           ← FR-011
    GetPostsByProduct/    ← FR-004 (Sales View)
```

Mỗi feature là một **vertical slice** — cắt xuyên suốt từ HTTP endpoint xuống database, hoàn toàn tự chứa. Thêm feature mới = thêm folder mới, không sửa code cũ.

---

### 2.3 Clean Architecture vẫn giữ — ở đâu?

Vertical Slice không loại bỏ Clean Architecture, nó **tổ chức lại theo chiều dọc** thay vì chiều ngang:

```
Mỗi Slice vẫn có các lớp bên trong:
PublishPost/
  PublishPostEndpoint.cs      ← Infrastructure (HTTP)
  PublishPostCommand.cs       ← Application (Command/DTO)
  PublishPostHandler.cs       ← Application (Business Logic)
  PublishPostValidator.cs     ← Application (Validation)

Domain/                       ← Shared Domain (entities, value objects)
  SocialPost.cs
  SocialPage.cs

Infrastructure/               ← Shared Infrastructure
  ISocialGateway.cs
  MetaAdapter.cs
  LinkedInAdapter.cs
```

**Domain và Infrastructure vẫn tách biệt** — chỉ có Application layer được tổ chức theo feature thay vì tầng.

---

### 2.4 So sánh trực quan

```
LAYERED (cũ):                    VERTICAL SLICE (mới):

  [HTTP Layer]                     [Feature: PublishPost]
      ↓                              Endpoint → Command → Handler → DB
  [Service Layer]
      ↓                            [Feature: DuplicatePost]
  [Repository Layer]                 Endpoint → Command → Handler → DB
      ↓
  [Database]                       [Feature: GetPostsByProduct]
                                     Endpoint → Query → Handler → DB

  Thêm feature = sửa 3 tầng        Thêm feature = thêm 1 folder
```

---

## 3. Tại sao Wolverine

### 3.1 Wolverine là gì

Wolverine là .NET library MIT-licensed cho CQRS, in-process messaging và background job. Được build bằng **source generators** (không dùng reflection như MediatR) — nhanh hơn và phù hợp với Native AOT.

### 3.2 Lợi thế trực tiếp với SRS này

**Thay MediatR hoàn toàn:**
```csharp
// MediatR — phải implement interface
public class PublishPostHandler : IRequestHandler<PublishPostCommand, PublishResult>
{
    public Task<PublishResult> Handle(PublishPostCommand cmd, CancellationToken ct) { }
}

// Wolverine — không cần interface, tự discover bằng convention
public class PublishPostHandler
{
    public Task<PublishResult> Handle(PublishPostCommand cmd, CancellationToken ct) { }
}
```

**Thay Hangfire — đây là lợi thế lớn nhất:**
```csharp
// Wolverine built-in scheduling — không cần Hangfire
await bus.ScheduleAsync(new PublishPostCommand(postId), scheduledAt);

// Retry tự động — không cần config thêm
public class PublishPostHandler
{
    [RetryNow(typeof(HttpRequestException), 3)]  // attribute-based retry
    public Task<PublishResult> Handle(PublishPostCommand cmd, CancellationToken ct) { }
}

// Dead letter — tự động khi quá retry
// Durable outbox — built-in với PostgreSQL
```

**Kết quả: bỏ được Hangfire** → giảm từ 2 dependency xuống 1, giảm infrastructure complexity.

### 3.3 Performance

| | MediatR v12 | Wolverine | Ghi chú |
|--|--|--|--|
| Dispatch latency | Baseline | ~4.4x nhanh hơn | Source generator vs reflection |
| Memory allocation | Baseline | ~8.3x ít hơn | Zero-alloc design |
| Startup time | Trung bình | Nhanh hơn | Compile-time registration |

### 3.4 Wolverine không thay thế được gì

- **EF Core** — Wolverine không phải ORM, vẫn cần EF Core cho write
- **Dapper** — vẫn cần cho read queries phức tạp
- **Redis** — nếu cần distributed cache vẫn phải dùng riêng

---

## 4. Cấu trúc thư mục

```
src/
├── PIM.SocialMedia.Api/                    ← ASP.NET Core 8 host
│   ├── Program.cs
│   └── appsettings.json
│
├── PIM.SocialMedia.Features/               ← Vertical Slices
│   │
│   ├── Connections/                        ← FR-001
│   │   └── ConnectAccount/
│   │       ├── ConnectAccountCommand.cs
│   │       ├── ConnectAccountHandler.cs
│   │       └── ConnectAccountEndpoint.cs
│   │
│   ├── SocialPosts/
│   │   │
│   │   ├── PublishPost/                    ← FR-002
│   │   │   ├── PublishPostCommand.cs
│   │   │   ├── PublishPostHandler.cs
│   │   │   ├── PublishPostValidator.cs
│   │   │   └── PublishPostEndpoint.cs
│   │   │
│   │   ├── SchedulePost/                   ← FR-003
│   │   │   ├── SchedulePostCommand.cs
│   │   │   ├── SchedulePostHandler.cs
│   │   │   └── SchedulePostEndpoint.cs
│   │   │
│   │   ├── GetPostsByProduct/              ← FR-004 Sales View
│   │   │   ├── GetPostsQuery.cs
│   │   │   ├── GetPostsHandler.cs          ← Dapper raw SQL ở đây
│   │   │   ├── PostFilterDto.cs
│   │   │   ├── PostSummaryDto.cs
│   │   │   └── GetPostsEndpoint.cs
│   │   │
│   │   ├── DuplicatePost/                  ← FR-008
│   │   │   ├── DuplicatePostCommand.cs
│   │   │   ├── DuplicatePostHandler.cs
│   │   │   └── DuplicatePostEndpoint.cs
│   │   │
│   │   ├── BulkCreateDraft/                ← FR-009
│   │   │   ├── BulkCreateDraftCommand.cs
│   │   │   ├── BulkCreateDraftHandler.cs   ← Enqueue Wolverine jobs
│   │   │   └── BulkCreateDraftEndpoint.cs
│   │   │
│   │   ├── ManageDraft/                    ← FR-010
│   │   │   ├── SaveDraftCommand.cs
│   │   │   ├── SaveDraftHandler.cs
│   │   │   ├── UpdateDraftCommand.cs
│   │   │   ├── UpdateDraftHandler.cs
│   │   │   ├── DeleteDraftCommand.cs
│   │   │   ├── DeleteDraftHandler.cs
│   │   │   ├── GetDraftsQuery.cs
│   │   │   ├── GetDraftsHandler.cs
│   │   │   └── DraftEndpoints.cs
│   │   │
│   │   ├── DeletePost/                     ← FR-011
│   │   │   ├── DeletePostCommand.cs
│   │   │   ├── DeletePostHandler.cs
│   │   │   └── DeletePostEndpoint.cs
│   │   │
│   │   └── ReschedulePost/                 ← FR-013 Calendar drag/drop
│   │       ├── ReschedulePostCommand.cs
│   │       ├── ReschedulePostHandler.cs
│   │       └── ReschedulePostEndpoint.cs
│   │
│   ├── Analytics/
│   │   ├── GetDashboard/                   ← FR-005
│   │   │   ├── GetDashboardQuery.cs
│   │   │   ├── GetDashboardHandler.cs      ← Dapper raw SQL
│   │   │   └── GetDashboardEndpoint.cs
│   │   │
│   │   ├── ExportAnalytics/                ← FR-016
│   │   │   ├── ExportAnalyticsCommand.cs
│   │   │   ├── ExportAnalyticsHandler.cs
│   │   │   └── ExportAnalyticsEndpoint.cs
│   │   │
│   │   └── SyncAnalytics/                  ← FR-005 background job
│   │       ├── SyncAnalyticsJob.cs         ← Wolverine scheduled message
│   │       └── SyncAnalyticsHandler.cs
│   │
│   ├── Templates/                          ← FR-012
│   │   ├── CreateTemplate/
│   │   ├── UpdateTemplate/
│   │   ├── DeleteTemplate/
│   │   └── PreviewTemplate/
│   │
│   ├── HashtagGroups/                      ← FR-017
│   │   ├── CreateHashtagGroup/
│   │   ├── UpdateHashtagGroup/
│   │   └── DeleteHashtagGroup/
│   │
│   ├── PagePermissions/                    ← FR-019
│   │   ├── GrantPermission/
│   │   ├── RevokePermission/
│   │   └── GetMyPages/
│   │
│   ├── Notifications/                      ← FR-015
│   │   ├── GetNotifications/
│   │   └── MarkAsRead/
│   │
│   └── Webhooks/                           ← FR-007
│       ├── MetaWebhookCommand.cs
│       ├── MetaWebhookHandler.cs
│       └── MetaWebhookEndpoint.cs
│
├── PIM.SocialMedia.Domain/                 ← Shared Domain
│   ├── Entities/
│   │   ├── SocialPost.cs
│   │   ├── SocialPage.cs
│   │   ├── SocialPostAsset.cs
│   │   └── SocialAnalytics.cs
│   ├── Enums/
│   │   ├── SocialPlatform.cs
│   │   └── SocialPostStatus.cs
│   └── Events/
│       ├── PostPublishedEvent.cs
│       └── PostDeletedEvent.cs
│
└── PIM.SocialMedia.Infrastructure/         ← Shared Infrastructure
    ├── Persistence/
    │   ├── PimDbContext.cs                 ← EF Core DbContext
    │   ├── Configurations/                 ← EF Core entity configs
    │   └── Migrations/
    ├── SocialGateway/
    │   ├── ISocialGateway.cs
    │   ├── MetaAdapter.cs
    │   └── LinkedInAdapter.cs
    ├── ReadDb/
    │   └── IDbConnectionFactory.cs         ← Dapper connection factory
    ├── AssetValidation/
    │   └── AssetValidationService.cs       ← FR-014
    └── Notifications/
        └── NotificationDispatcher.cs       ← Email/Slack sender
```

---

## 5. Ví dụ code thực tế — FR-002 Publish Post

### 5.1 Program.cs — Setup Wolverine + Minimal API

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseWolverine(opts =>
{
    // Tự động discover tất cả Handler trong assembly
    opts.Discovery.IncludeAssembly(typeof(PublishPostHandler).Assembly);

    // Durable inbox/outbox với PostgreSQL — thay thế hoàn toàn Hangfire
    opts.PersistMessagesWithPostgresql(
        builder.Configuration.GetConnectionString("DefaultConnection")!);

    // Scheduled jobs — thay thế Hangfire recurring jobs
    opts.SchedulePublishAt<SyncAnalyticsJob>(
        TimeSpan.FromHours(6));

    // Retry policy mặc định
    opts.Policies.Add<LogAndRetryPolicy>();
});

builder.Services.AddDbContext<PimDbContext>(...);
builder.Services.AddScoped<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddKeyedScoped<ISocialGateway, MetaAdapter>("facebook");
builder.Services.AddKeyedScoped<ISocialGateway, MetaAdapter>("instagram");
builder.Services.AddKeyedScoped<ISocialGateway, LinkedInAdapter>("linkedin");

var app = builder.Build();

// Map tất cả endpoints từ Features
app.MapSocialPostEndpoints();
app.MapAnalyticsEndpoints();
app.MapWebhookEndpoints();

app.Run();
```

---

### 5.2 Command — PublishPostCommand.cs

```csharp
// Features/SocialPosts/PublishPost/PublishPostCommand.cs
namespace PIM.SocialMedia.Features.SocialPosts.PublishPost;

public record PublishPostCommand(
    Guid ProductItemId,
    Guid SocialPageId,
    string Caption,
    IReadOnlyList<Guid> AssetIds,
    string? DestinationUrl = null,
    bool AppendUtm = true
);

public record PublishPostResult(
    Guid PostId,
    string PostUrl,
    string PlatformPostId
);
```

---

### 5.3 Handler — PublishPostHandler.cs

```csharp
// Features/SocialPosts/PublishPost/PublishPostHandler.cs
namespace PIM.SocialMedia.Features.SocialPosts.PublishPost;

public class PublishPostHandler(
    PimDbContext db,
    IDbConnectionFactory readDb,
    IServiceProvider sp,
    AssetValidationService validator,
    NotificationDispatcher notifier
)
{
    // Wolverine tự discover method Handle() — không cần implement interface
    [WolverineHandler]
    public async Task<PublishPostResult> Handle(
        PublishPostCommand cmd,
        CancellationToken ct)
    {
        // 1. Lấy page + token
        var page = await db.SocialPages
            .FirstOrDefaultAsync(p => p.Id == cmd.SocialPageId && p.IsActive, ct)
            ?? throw new NotFoundException($"Page {cmd.SocialPageId} not found");

        // 2. Validate asset
        var assets = await db.PimAssets
            .Where(a => cmd.AssetIds.Contains(a.Id))
            .ToListAsync(ct);

        var validation = await validator.ValidateAsync(assets, page.Platform, ct);
        if (!validation.IsValid)
            throw new ValidationException(validation.Errors);

        // 3. Tạo post record
        var post = new SocialPost
        {
            Id              = Guid.NewGuid(),
            ProductItemId   = cmd.ProductItemId,
            SocialPageId    = cmd.SocialPageId,
            Platform        = page.Platform,
            Caption         = cmd.Caption,
            Status          = SocialPostStatus.Publishing,
            CreatedAt       = DateTime.UtcNow
        };
        db.SocialPosts.Add(post);
        await db.SaveChangesAsync(ct);

        // 4. Publish lên platform
        var gateway = sp.GetRequiredKeyedService<ISocialGateway>(
            page.Platform.ToString().ToLower());

        var plainToken = AesEncryptor.Decrypt(page.AccessTokenEnc);

        var result = await gateway.PublishAsync(new PublishRequest(
            Caption   : cmd.Caption,
            MediaUrls : assets.Select(a => a.CdnUrl).ToList(),
            PageId    : page.PageId,
            PageToken : plainToken
        ), ct);

        // 5. Update status
        post.Status         = SocialPostStatus.Published;
        post.PlatformPostId = result.PlatformPostId;
        post.PostUrl        = result.PostUrl;
        post.PublishedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        // 6. Notify
        await notifier.SendAsync(new Notification(
            Type     : NotificationType.PublishSuccess,
            PostId   : post.Id,
            PageName : page.PageName
        ), ct);

        return new PublishPostResult(post.Id, result.PostUrl!, result.PlatformPostId!);
    }
}
```

---

### 5.4 Endpoint — PublishPostEndpoint.cs

```csharp
// Features/SocialPosts/PublishPost/PublishPostEndpoint.cs
namespace PIM.SocialMedia.Features.SocialPosts.PublishPost;

public static class PublishPostEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/social/posts", async (
            PublishPostRequest req,
            IMessageBus bus,                    // Wolverine IMessageBus
            IPagePermissionService permissions,
            HttpContext ctx,
            CancellationToken ct) =>
        {
            var userId = ctx.User.GetUserId();

            // Permission check
            if (!await permissions.HasPermissionAsync(userId, req.PageId, ct))
                return Results.Forbid();

            var command = new PublishPostCommand(
                req.ProductItemId,
                req.PageId,
                req.Caption,
                req.AssetIds,
                req.DestinationUrl,
                req.AppendUtm
            );

            var result = await bus.InvokeAsync<PublishPostResult>(command, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization("social.publisher")
        .WithTags("Social Posts")
        .WithName("PublishPost");
    }
}

public record PublishPostRequest(
    Guid ProductItemId,
    Guid PageId,
    string Caption,
    IReadOnlyList<Guid> AssetIds,
    string? DestinationUrl = null,
    bool AppendUtm = true
);
```

---

### 5.5 Extension — Đăng ký tất cả endpoints

```csharp
// Extensions/EndpointExtensions.cs
public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapSocialPostEndpoints(
        this IEndpointRouteBuilder app)
    {
        PublishPostEndpoint.Map(app);
        SchedulePostEndpoint.Map(app);
        DuplicatePostEndpoint.Map(app);
        BulkCreateDraftEndpoint.Map(app);
        DeletePostEndpoint.Map(app);
        GetPostsEndpoint.Map(app);
        // ...
        return app;
    }
}
```

---

## 6. Wolverine thay thế Hangfire như thế nào

### 6.1 Scheduled Post (FR-003) — thay Hangfire job

```csharp
// Thay vì: Hangfire.BackgroundJob.Schedule(() => Publish(postId), scheduledAt)

// Wolverine — schedule message đến thời điểm tương lai
await bus.ScheduleAsync(
    new ExecuteScheduledPostCommand(postId),
    scheduledAt,    // DateTimeOffset — timezone-aware
    ct
);

// Handler tự động chạy đúng giờ
public class ExecuteScheduledPostHandler(PimDbContext db, IMessageBus bus)
{
    public async Task Handle(ExecuteScheduledPostCommand cmd, CancellationToken ct)
    {
        var post = await db.SocialPosts.FindAsync(cmd.PostId, ct);
        if (post?.Status != SocialPostStatus.Scheduled) return;

        await bus.InvokeAsync(new PublishPostCommand(...), ct);
    }
}
```

### 6.2 Recurring Analytics Sync (FR-005) — thay Hangfire recurring

```csharp
// Program.cs — khai báo một lần
opts.SchedulePublishAt<TriggerAnalyticsSyncJob>(TimeSpan.FromHours(6));

// Message tự gửi lại mỗi 6 giờ
public record TriggerAnalyticsSyncJob;

public class SyncAnalyticsHandler(IDbConnectionFactory readDb, PimDbContext db, ...)
{
    public async Task Handle(TriggerAnalyticsSyncJob _, CancellationToken ct)
    {
        var posts = await readDb.QueryAsync<...>(@"
            SELECT sp.id, sp.platform_post_id, pg.access_token_enc
            FROM social_posts sp
            JOIN social_pages pg ON pg.id = sp.social_page_id
            WHERE sp.status = 'Published'
            AND sp.published_at > NOW() - INTERVAL '30 days'
        ");

        foreach (var post in posts)
        {
            // Enqueue từng post xử lý độc lập
            await bus.PublishAsync(new SyncSinglePostAnalyticsCommand(post.Id));
        }
    }
}
```

### 6.3 Retry + Dead Letter — Wolverine built-in

```csharp
// Wolverine xử lý retry tự động — không cần config Polly riêng cho job
public class PublishScheduledPostHandler
{
    // Retry 3 lần với delay tăng dần
    [RetryNow(typeof(HttpRequestException), 3, 1000, 4000, 16000)]
    public async Task Handle(ExecuteScheduledPostCommand cmd, CancellationToken ct)
    {
        // Nếu quá 3 lần → Wolverine tự chuyển sang Dead Letter queue
        // Trigger notification tự động qua IDeadLetterListener
    }
}

// Dead Letter listener
public class DeadLetterNotifier : IDeadLetterListener
{
    public Task PostDeadLetterAsync(DeadLetterEnvelope envelope)
    {
        // Gửi notification cho Admin
        return notifier.SendDeadLetterAlertAsync(envelope);
    }
}
```

### 6.4 Bulk Job (FR-009)

```csharp
public class BulkCreateDraftHandler(IMessageBus bus)
{
    public async Task<BulkCreateResult> Handle(
        BulkCreateDraftCommand cmd, CancellationToken ct)
    {
        // Enqueue từng item xử lý song song
        foreach (var (productId, pageId) in cmd.ProductPageCombinations)
        {
            await bus.PublishAsync(new CreateSingleDraftCommand(
                productId, pageId, cmd.TemplateId));
        }

        return new BulkCreateResult(jobId: Guid.NewGuid());
    }
}

// Từng item xử lý độc lập — 1 item fail không ảnh hưởng item khác
public class CreateSingleDraftHandler(PimDbContext db, TemplateMergeService merge)
{
    public async Task Handle(CreateSingleDraftCommand cmd, CancellationToken ct)
    {
        var resolvedCaption = await merge.MergeAsync(cmd.TemplateId, cmd.ProductItemId, ct);

        db.SocialPosts.Add(new SocialPost {
            ProductItemId = cmd.ProductItemId,
            SocialPageId  = cmd.PageId,
            Caption       = resolvedCaption,
            Status        = SocialPostStatus.Draft
        });
        await db.SaveChangesAsync(ct);
    }
}
```

---

## 7. Pipeline Behavior với Wolverine

Wolverine dùng **Middleware** thay vì IPipelineBehavior của MediatR — cú pháp khác nhưng tương đương:

```csharp
// Logging middleware — áp dụng cho tất cả handler
public class LoggingMiddleware
{
    public async Task<T> InvokeAsync<T>(
        IMessageContext context,
        Func<Task<T>> next,
        ILogger<LoggingMiddleware> logger)
    {
        var start = Stopwatch.GetTimestamp();
        logger.LogInformation("Handling {MessageType}", context.Envelope.MessageType);

        var result = await next();

        var elapsed = Stopwatch.GetElapsedTime(start);
        logger.LogInformation("Handled in {Elapsed}ms", elapsed.TotalMilliseconds);

        return result;
    }
}

// Validation middleware — chạy trước mọi Command
public class FluentValidationMiddleware
{
    public async Task<T> InvokeAsync<T>(
        IMessageContext context,
        Func<Task<T>> next,
        IValidator<object>? validator = null)
    {
        if (validator != null)
        {
            var validationResult = await validator.ValidateAsync(context.Envelope.Message!);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors);
        }
        return await next();
    }
}

// Đăng ký trong Program.cs
opts.Policies.AddMiddlewareByMessageType(typeof(LoggingMiddleware));
opts.Policies.AddMiddlewareByMessageType(typeof(FluentValidationMiddleware));
```

---

## 8. So sánh các lựa chọn khác

### 8.1 Bảng so sánh tổng hợp

| Tiêu chí | **Wolverine** ✅ | MediatR v12 | Mediator (source gen) | Tự viết | Brighter |
|----------|----------------|-------------|----------------------|---------|---------|
| **License** | MIT — free mãi mãi | Apache 2.0 (v12), commercial v13+ | MIT | N/A | MIT |
| **Thay Hangfire được không** | ✅ Có — built-in scheduling | ❌ Không | ❌ Không | ❌ Không | ⚠️ Một phần |
| **Performance** | 4.4x nhanh hơn MediatR | Baseline | Nhanh nhất (compile-time) | Tùy code | Tương đương MediatR |
| **Memory allocation** | ~8x ít hơn MediatR | Baseline | Ít nhất | Tùy code | Tương đương MediatR |
| **Cần học thêm** | Có — ~2–3 ngày | Không | Ít | Không | Có |
| **Durable outbox** | ✅ Built-in PostgreSQL | ❌ | ❌ | ❌ | ✅ |
| **Retry / Dead Letter** | ✅ Built-in | ❌ (dùng Polly riêng) | ❌ | ❌ | ✅ |
| **Distributed messaging** | ✅ Phase 2 | ❌ | ❌ | ❌ | ✅ |
| **Vertical Slice fit** | ✅ Rất tốt | ✅ Tốt | ✅ Tốt | ✅ Tốt | ⚠️ Khá tốt |
| **Tài liệu** | Tốt | Rất tốt | Trung bình | N/A | Trung bình |
| **Community** | Đang tăng nhanh | Lớn nhất | Nhỏ | N/A | Nhỏ |
| **Risk** | Thấp | Vendor lock-in license | Thấp | Cao (tự maintain) | Thấp |

---

### 8.2 Option A — MediatR v12 (ghim version)

**Khi nào nên chọn:**
- Team đã quen MediatR, không muốn học thêm
- Muốn zero risk trong timeline ngắn
- Không cần thay Hangfire

**Cách thực hiện:**
```xml
<!-- Ghim version, KHÔNG upgrade lên v13 -->
<PackageReference Include="MediatR" Version="12.5.0" />
<PackageReference Include="MediatR.Extensions.Microsoft.DependencyInjection" Version="11.1.0" />
```

**Trade-off:**
- Vẫn cần Hangfire riêng — 2 dependency thay vì 1
- Phải monitor nếu v12 có security vulnerability nhưng tác giả chỉ fix trên v13+
- Không được các tính năng mới

---

### 8.3 Option B — Mediator (martinothamar/Mediator)

**Khi nào nên chọn:**
- Chỉ cần in-process CQRS thuần
- Ưu tiên compile-time safety và Native AOT compatibility
- Team không muốn học scheduling của Wolverine

**Cài đặt:**
```xml
<PackageReference Include="Mediator.SourceGenerator" Version="3.*" />
<PackageReference Include="Mediator.Abstractions" Version="3.*" />
```

**Code gần giống MediatR nhất:**
```csharp
// Chỉ đổi interface name và namespace
public class PublishPostHandler : ICommandHandler<PublishPostCommand, PublishPostResult>
{
    public ValueTask<PublishPostResult> Handle(
        PublishPostCommand cmd, CancellationToken ct) { }
}
```

**Trade-off:**
- Vẫn cần Hangfire riêng
- Không có retry/outbox built-in
- Ít tính năng hơn Wolverine

---

### 8.4 Option C — Tự viết CQRS Dispatcher

**Khi nào nên chọn:**
- Không muốn bất kỳ dependency nào
- Team hiểu rõ .NET DI, không cần magic
- System đủ nhỏ để không cần pipeline behavior

**Implementation ~80 dòng:**
```csharp
// ICommand / IQuery interfaces
public interface ICommand<TResult> { }
public interface ICommandHandler<TCommand, TResult>
    where TCommand : ICommand<TResult>
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken ct);
}

// Dispatcher
public class CommandDispatcher(IServiceProvider sp)
{
    public Task<TResult> DispatchAsync<TResult>(
        ICommand<TResult> command, CancellationToken ct)
    {
        var handlerType = typeof(ICommandHandler<,>)
            .MakeGenericType(command.GetType(), typeof(TResult));
        dynamic handler = sp.GetRequiredService(handlerType);
        return handler.HandleAsync((dynamic)command, ct);
    }
}

// Đăng ký trong Program.cs — thủ công nhưng rõ ràng
services.AddScoped<ICommandHandler<PublishPostCommand, PublishPostResult>,
                   PublishPostHandler>();
```

**Trade-off:**
- Không có retry/outbox/scheduling
- Phải tự viết pipeline (logging, validation)
- Vẫn cần Hangfire
- Khi system lớn → tự maintain dispatcher

---

### 8.5 Khi nào KHÔNG dùng Wolverine

Wolverine có thể là overkill nếu:
- Project nhỏ, 1–2 developer, timeline cực ngắn (< 4 tuần)
- Team chưa quen CQRS, cần học từ đầu — Wolverine có learning curve cao hơn MediatR
- Chỉ cần simple CRUD API, không có background job phức tạp

---

## 9. Migration path nếu đổi ý

Nếu sau này muốn chuyển từ Wolverine sang option khác — hoặc ngược lại — nhờ Vertical Slice Architecture, migration chỉ cần thay đổi trong từng Handler, không ảnh hưởng toàn bộ codebase:

```csharp
// Bước 1: Thêm abstraction interface mỏng
public interface ICommandBus
{
    Task<TResult> SendAsync<TResult>(object command, CancellationToken ct);
}

// Bước 2: Implement cho Wolverine
public class WolverineCommandBus(IMessageBus bus) : ICommandBus
{
    public Task<TResult> SendAsync<TResult>(object command, CancellationToken ct)
        => bus.InvokeAsync<TResult>(command, ct);
}

// Bước 3: Khi muốn switch — chỉ đổi implementation, không đổi Endpoint
public class MediatRCommandBus(IMediator mediator) : ICommandBus { ... }
```

Với Vertical Slice: mỗi feature là 1 folder khép kín — migration có thể làm từng feature một, không cần big bang.

---

## 10. Checklist trước khi bắt đầu code

### Setup dependencies

```xml
<!-- PIM.SocialMedia.Features.csproj -->
<PackageReference Include="WolverineFx" Version="3.*" />
<PackageReference Include="WolverineFx.Postgresql" Version="3.*" />   <!-- Durable outbox + scheduling -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.*" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.*" />
<PackageReference Include="Dapper" Version="2.*" />
<PackageReference Include="FluentValidation" Version="11.*" />
<PackageReference Include="ClosedXML" Version="0.102.*" />              <!-- FR-016 Export -->
```

### Wolverine PostgreSQL setup

```sql
-- Wolverine cần tạo schema riêng cho durable messaging
-- Tự động tạo khi chạy lần đầu với:
-- opts.PersistMessagesWithPostgresql(connectionString)
-- Tạo ra các bảng: wolverine_incoming_envelopes, wolverine_outgoing_envelopes, wolverine_dead_letters
```

### Kiểm tra trước Sprint 1

- [ ] Wolverine v3.x compatible với .NET 8 — ✅ có
- [ ] Wolverine PostgreSQL storage hoạt động với Npgsql — ✅ có
- [ ] EF Core migration không conflict với Wolverine schema — ✅ Wolverine dùng schema riêng
- [ ] Keyed DI services (.NET 8) tương thích với Wolverine DI — ✅ có
- [ ] Minimal API tương thích Wolverine — ✅ có, Wolverine có `MapWolverineEndpoints()` helper
- [ ] Xác nhận CDN/S3 trước Sprint 2 (OQ-001 — Blocker Instagram)
- [ ] Chốt kênh alert Email/Slack (OQ-005)

---

*Tài liệu Architecture Decision — PIM Social Media Module*  
*Phiên bản: 1.0 · Ngày: 05/06/2026*  
*Xem thêm: SRS_PIM_SocialMedia_Module_v1.2.md*
