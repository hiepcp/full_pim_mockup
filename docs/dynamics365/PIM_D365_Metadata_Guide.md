# Hướng dẫn sử dụng D365 Metadata cho dự án PIM

Tài liệu này hướng dẫn cách phân tích, lọc và tận dụng file `dynamic-metadata.xml` (OData metadata của Microsoft Dynamics 365 Finance & Operations) để xây dựng tích hợp cho hệ thống PIM.

## 1. Tổng quan

### 1.1 File `dynamic-metadata.xml` là gì?

- Là **OData v4 EDMX schema** của D365 Finance & Operations.
- Chứa định nghĩa của toàn bộ data entities mà D365 expose qua OData REST API.
- Lấy từ endpoint: `https://<your-d365>.dynamics.com/data/$metadata`.
- Quy mô: ~52 MB, **4,796 EntityTypes**, 4,796 EntitySets, 2,332 EnumTypes.

### 1.2 Tại sao quan trọng cho PIM?

BRD §5 yêu cầu PIM tích hợp với D365 (system of record). File metadata này:

- **Là hợp đồng API**: liệt kê chính xác entity, field, kiểu dữ liệu, primary key, foreign key.
- **Cho phép code generation**: tạo C# proxy classes tự động, type-safe.
- **Là tài liệu schema**: thay vì đoán field name, đọc thẳng từ đây.

### 1.3 Vấn đề: file quá lớn

- 52 MB không thể load trực tiếp vào tools sinh code (timeout, OOM).
- 99% entities không liên quan đến PIM (HR, Finance, Manufacturing, Retail POS, Asset Maintenance...).
- Sinh proxy từ toàn bộ schema sẽ tạo ra hàng nghìn class không dùng đến, làm chậm build và làm khó navigation.

→ **Giải pháp**: lọc whitelist các entity cần thiết, generate metadata mới chỉ ~30 entities.

## 2. Quy trình tổng quan

```
┌────────────────────────┐
│ dynamic-metadata.xml   │  52 MB, 4796 entities
│ (full D365 schema)     │
└───────────┬────────────┘
            │
            │ extract-pim-metadata.ps1
            │ (lọc theo whitelist)
            ▼
┌────────────────────────┐
│ pim-metadata.xml       │  ~600 KB, 30 entities
│ (PIM-relevant subset)  │
└───────────┬────────────┘
            │
            │ Microsoft.OData.Cli
            │ hoặc OData Connected Service
            ▼
┌────────────────────────┐
│ Pim.D365Client (C#)    │  Type-safe proxy
│ - ReleasedProductV2    │
│ - ProductCategory      │
│ - ProductAttributeV3   │
│ ...                    │
└────────────────────────┘
```

## 3. Cấu trúc thư mục

```
e:\project\full_pim\
├── dynamic-metadata.xml                              # Source (gitignored - 52 MB)
├── pim-metadata.xml                                  # Generated subset (~600 KB)
├── extract-pim-metadata.ps1                          # Extraction script
├── Business_Requirements_Document_PIM.md             # BRD
├── PIM_Implementation_Plan_and_Technical_Skills_Matrix.md
├── D365_Entity_Whitelist_for_PIM.md                  # Danh sách entity cần dùng
├── D365_PIM_Field_Mapping.md                         # Mapping D365 → PIM
└── PIM_D365_Metadata_Guide.md                        # File này
```

> **Lưu ý**: `dynamic-metadata.xml` (52 MB) nên đặt trong `.gitignore` hoặc Git LFS để tránh bloat repo.

## 4. Phân tích metadata thủ công

### 4.1 Kiểm tra kích thước và thống kê tổng quan

```powershell
$file = '.\dynamic-metadata.xml'
$size = (Get-Item $file).Length
Write-Host "Size: $([math]::Round($size/1MB, 2)) MB"

$content = [System.IO.File]::ReadAllText($file)
Write-Host "EntityTypes: $(([regex]::Matches($content, '<EntityType Name="')).Count)"
Write-Host "EntitySets:  $(([regex]::Matches($content, '<EntitySet Name="')).Count)"
Write-Host "EnumTypes:   $(([regex]::Matches($content, '<EnumType Name="')).Count)"
```

### 4.2 Tìm entities theo từ khóa

```powershell
$content = [System.IO.File]::ReadAllText('.\dynamic-metadata.xml')
$keyword = 'Product'
$pattern = '<EntityType Name="([^"]*' + $keyword + '[^"]*)"'
[regex]::Matches($content, $pattern) |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object |
    Select-Object -First 30
```

### 4.3 Inspect tất cả properties của 1 entity

```powershell
$content = [System.IO.File]::ReadAllText('.\dynamic-metadata.xml')
$entity = 'ReleasedProductV2'
$pattern = '<EntityType Name="' + $entity + '">[\s\S]*?</EntityType>'
$block = [regex]::Match($content, $pattern).Value
[regex]::Matches($block, '<Property Name="([^"]+)" Type="([^"]+)"') |
    ForEach-Object { '{0,-50} {1}' -f $_.Groups[1].Value, $_.Groups[2].Value }
```

### 4.4 Tìm primary key của entity

```powershell
$pattern = '<EntityType Name="' + $entity + '">([\s\S]*?)</EntityType>'
$block = [regex]::Match($content, $pattern).Groups[1].Value
$keyBlock = [regex]::Match($block, '<Key>([\s\S]*?)</Key>').Groups[1].Value
[regex]::Matches($keyBlock, '<PropertyRef Name="([^"]+)"') |
    ForEach-Object { $_.Groups[1].Value }
```

## 5. Sử dụng script extraction

### 5.1 Cài đặt

Script chỉ cần PowerShell 5.1 trở lên (có sẵn trên Windows). Không cần cài thêm package.

### 5.2 Chạy với whitelist mặc định

```powershell
.\extract-pim-metadata.ps1 `
    -InputPath .\dynamic-metadata.xml `
    -OutputPath .\pim-metadata.xml
```

Output mong đợi:

```
Using default PIM whitelist: 30 entities
Input size: 52.82 MB

Pass 1: scanning EntityTypes and EntitySets...
  EntityTypes captured: 30 / 30
  EntitySets captured:  30

Pass 2: resolving referenced types...
  Unique referenced type names: 210

Pass 3: scanning EnumTypes and ComplexTypes...
  EnumTypes captured:    44
  ComplexTypes captured: 0

Done.
  Output: .\pim-metadata.xml
  Size:   601.38 KB (98.89% reduction)
```

### 5.3 Chạy với whitelist tùy chỉnh

Tạo file `pim-entities.txt`:

```text
# PIM entities (lines starting with # are ignored)
ReleasedProductV2
ReleasedProductMasterV2
ProductCategory
# Thêm hoặc bớt theo nhu cầu
```

Chạy:

```powershell
.\extract-pim-metadata.ps1 `
    -InputPath .\dynamic-metadata.xml `
    -OutputPath .\pim-metadata.xml `
    -WhitelistPath .\pim-entities.txt
```

### 5.4 Cách script hoạt động

Script dùng **streaming `XmlReader`** (không phải DOM hay regex toàn file) để xử lý file lớn nhanh:

1. **Pass 1**: Stream qua XML, capture các `<EntityType>` và `<EntitySet>` thuộc whitelist.
2. **Pass 2**: Quét các block đã capture, tìm tất cả type references dạng `Microsoft.Dynamics.DataEntities.<TypeName>` để xác định Enum/Complex types liên quan.
3. **Pass 3**: Stream lại lần nữa, capture các `<EnumType>` và `<ComplexType>` được reference.
4. **Build output**: Ghép vào template EDMX hợp lệ.

> Cách tiếp cận regex toàn file ban đầu bị treo do regex backtracking trên 52 MB. Streaming XmlReader xử lý xong trong vài giây.

## 6. Generate C# OData Proxy

### 6.1 Cách 1: OData CLI (cross-platform)

```bash
# Cài đặt 1 lần
dotnet tool install -g Microsoft.OData.Cli

# Generate proxy
odata-cli generate `
    --metadata-uri ".\pim-metadata.xml" `
    --output-dir ".\src\Pim.D365Client" `
    --namespace "Pim.D365Client"
```

### 6.2 Cách 2: OData Connected Service (Visual Studio)

1. Right-click project → **Add** → **Connected Service**
2. Chọn **OData Connected Service**
3. Endpoint: chọn **File** → trỏ đến `pim-metadata.xml`
4. Namespace: `Pim.D365Client`
5. Bỏ chọn các options không cần (tracking, etc. — tùy use case)

### 6.3 Cách 3: Direct HttpClient + System.Text.Json

Nếu không cần proxy, dùng `HttpClient` gọi OData trực tiếp:

```csharp
public sealed class D365ProductClient
{
    private readonly HttpClient _http;

    public D365ProductClient(HttpClient http) => _http = http;

    public async Task<ReleasedProductDto?> GetByItemNumberAsync(
        string company, string itemNumber, CancellationToken ct = default)
    {
        var url = $"data/ReleasedProductsV2(dataAreaId='{company}',ItemNumber='{itemNumber}')";
        return await _http.GetFromJsonAsync<ReleasedProductDto>(url, ct);
    }
}
```

DTO chỉ cần các field PIM dùng — tham khảo `D365_PIM_Field_Mapping.md`.

## 7. Authentication với D365

D365 OData API yêu cầu OAuth 2.0 / Azure AD. Sử dụng **Service-to-Service** flow với Application registration:

```csharp
// Program.cs
builder.Services.AddHttpClient<D365ProductClient>(c =>
{
    c.BaseAddress = new Uri(builder.Configuration["D365:BaseUrl"]!);
})
.AddHttpMessageHandler<D365AuthHandler>();

builder.Services.AddTransient<D365AuthHandler>();
```

```csharp
public sealed class D365AuthHandler : DelegatingHandler
{
    private readonly IConfidentialClientApplication _app;
    private readonly string _scope;

    public D365AuthHandler(IConfiguration config)
    {
        _app = ConfidentialClientApplicationBuilder
            .Create(config["D365:ClientId"])
            .WithClientSecret(config["D365:ClientSecret"])
            .WithAuthority($"https://login.microsoftonline.com/{config["D365:TenantId"]}")
            .Build();
        _scope = $"{config["D365:Resource"]}/.default";
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken ct)
    {
        var token = await _app.AcquireTokenForClient(new[] { _scope }).ExecuteAsync(ct);
        request.Headers.Authorization = new("Bearer", token.AccessToken);
        return await base.SendAsync(request, ct);
    }
}
```

Lưu credentials trong **Azure Key Vault** (BRD §5.1, plan §2.2.1 Phase 1).

## 8. Truy vấn OData phổ biến

### 8.1 Lấy danh sách products của 1 company

```http
GET /data/ReleasedProductsV2?$filter=dataAreaId eq 'usmf'&$top=50
```

### 8.2 Filter theo lifecycle state

```http
GET /data/ReleasedProductsV2?$filter=ProductLifecycleStateId eq 'Active' and dataAreaId eq 'usmf'
```

### 8.3 Lấy categories với hierarchy

```http
GET /data/ProductCategories?$filter=ProductCategoryHierarchyName eq 'Sales hierarchy'&$select=CategoryCode,CategoryName,ParentProductCategoryCode
```

### 8.4 Lấy attribute values của 1 sản phẩm

```http
GET /data/ProductAttributeValues?$filter=ProductNumber eq 'D0001'
```

### 8.5 Lấy translations cho ngôn ngữ

```http
GET /data/ProductTranslations?$filter=ProductNumber eq 'D0001' and LanguageId eq 'vi'
```

### 8.6 Pagination với delta links (change tracking)

```http
GET /data/ReleasedProductsV2?cross-company=true&$deltatoken=...
```

D365 hỗ trợ delta query để chỉ lấy thay đổi từ lần sync trước — quan trọng cho PIM sync job.

## 9. Sync strategy với D365 (BRD §5.2)

### 9.1 Initial load

- Chạy job 1 lần lấy toàn bộ entities cần thiết.
- Chia nhỏ theo company (dataAreaId) và batch theo `$top=500`.
- Lưu `@odata.nextLink` để pagination.

### 9.2 Incremental sync (recommended)

**Option A: Polling với delta tokens**
- Schedule Azure Function chạy mỗi N phút.
- Gọi `?$deltatoken=<saved>` để chỉ lấy thay đổi.
- Lưu deltatoken mới vào Azure Table Storage / Cosmos DB.

**Option B: Event-driven với D365 Business Events**
- Đăng ký Business Event endpoint trỏ vào Azure Service Bus / Event Grid.
- D365 push message khi product thay đổi.
- Azure Function consume message → update PIM.
- Latency thấp hơn nhiều so với polling.

> Plan §2.2.2 yêu cầu event-driven, nên Option B là lựa chọn ưu tiên.

### 9.3 Conflict handling

- D365 là source of truth cho **core data** (item number, prices, dimensions).
- PIM là source of truth cho **rich content** (descriptions, USPs, assets).
- Khi field có thể chỉnh ở cả 2 phía (ví dụ custom attributes): dùng **last-write-wins** với timestamp, hoặc workflow approval.

## 10. Update whitelist khi cần thêm entity

Khi yêu cầu mở rộng (ví dụ thêm BOM, sales orders, customers), làm theo các bước:

1. **Tìm entity name đúng**:
   ```powershell
   $content = [System.IO.File]::ReadAllText('.\dynamic-metadata.xml')
   [regex]::Matches($content, '<EntityType Name="([^"]*Customer[^"]*)"') |
       ForEach-Object { $_.Groups[1].Value } |
       Sort-Object | Select-Object -First 20
   ```

2. **Inspect fields** để xác nhận có đủ data:
   ```powershell
   # Xem section 4.3
   ```

3. **Thêm vào whitelist**: edit `extract-pim-metadata.ps1` (block `$defaultWhitelist`) hoặc dùng `-WhitelistPath` với file riêng.

4. **Chạy lại script** để regenerate `pim-metadata.xml`.

5. **Regenerate proxy** (`odata-cli generate`).

6. **Cập nhật `D365_Entity_Whitelist_for_PIM.md` và `D365_PIM_Field_Mapping.md`** để giữ tài liệu đồng bộ.

## 11. Best practices

- **Đừng commit** `dynamic-metadata.xml` (52 MB) vào git. Dùng `.gitignore` + Git LFS hoặc lưu artifact riêng.
- **Commit** `pim-metadata.xml` vì đây là input cho code generation, cần versioning.
- **Re-extract khi nâng cấp D365**: schema thay đổi qua các version. Khi D365 nâng cấp, download lại `dynamic-metadata.xml` và chạy script.
- **Pin OData CLI version** trong CI/CD để tránh proxy thay đổi không mong muốn.
- **Đặt namespace rõ ràng**: `Pim.D365Client` thay vì namespace mặc định để tránh conflict.
- **Test integration với sandbox D365** trước khi chạy production.
- **Implement retry với Polly**: D365 có rate limit, dễ throttle khi sync bulk.
- **Log mọi sync run**: ghi delta token, số records sync, errors vào Application Insights (BRD §4.3).

## 12. Troubleshooting

| Triệu chứng | Nguyên nhân | Giải pháp |
|-------------|-------------|-----------|
| Script báo "Missing entities" | Tên entity sai (V2 vs V3, plural vs singular) | Dùng query ở section 4.2 để tìm tên đúng |
| `pim-metadata.xml` thiếu EntitySet | EntitySet name khác EntityType name | Script v2 đã handle. Verify line số 130-145 của script |
| `odata-cli generate` failed với "type not found" | Thiếu Enum/ComplexType trong subset | Mở rộng pattern reference detection trong Pass 2 |
| Generated proxy báo lỗi compile | Chuyển đổi enum giá trị "0" / "1" → reserved keyword | Thêm `--use-namespace-prefix` hoặc rename trong code |
| HTTP 401 khi gọi D365 | Token expired hoặc scope sai | Verify `Resource` config và app permissions |
| HTTP 429 (throttling) | Quá nhiều request | Implement exponential backoff với Polly |

## 13. Tài liệu tham khảo

- [OData v4 specification](https://www.odata.org/documentation/)
- [D365 F&O OData REST endpoints](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/odata)
- [D365 Business Events](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/business-events/home-page)
- [Microsoft.OData.Cli](https://learn.microsoft.com/en-us/odata/odatacli/getting-started)
- [MSAL.NET for service-to-service auth](https://learn.microsoft.com/en-us/entra/msal/dotnet/)
- [PIM BRD](Business_Requirements_Document_PIM.md) §5
- [Implementation plan](PIM_Implementation_Plan_and_Technical_Skills_Matrix.md) §2.2.1
- [Entity whitelist](D365_Entity_Whitelist_for_PIM.md)
- [Field mapping](D365_PIM_Field_Mapping.md)
