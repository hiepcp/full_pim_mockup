# Dynamic Alias Strategy — Catalogue Always Uses Latest Approved Asset

## Overview

Trong các hệ thống PIM/DAM/Catalogue, không nên để catalogue tham chiếu trực tiếp tới file vật lý hoặc URL cụ thể của asset.

Thay vào đó, catalogue chỉ tham chiếu tới một  **dynamic alias** . Khi người dùng hoặc hệ thống truy cập asset, backend sẽ resolve alias này sang phiên bản đã được phê duyệt (Approved) mới nhất.

Điều này giúp:

* Không cần cập nhật catalogue khi có version mới.
* Hỗ trợ workflow Draft → Review → Approve.
* Dễ dàng rollback về version cũ.
* Hỗ trợ CDN cache và asset versioning.
* Tách biệt business logic khỏi physical file storage.

---

# Example Data Model

## Asset Versions

| AssetId | ProductId | AssetType   | Version | Status   | StoragePath                       |
| ------- | --------- | ----------- | ------- | -------- | --------------------------------- |
| IMG001  | P001      | FRONT_IMAGE | 1       | Approved | products/P001/images/front_v1.jpg |
| IMG002  | P001      | FRONT_IMAGE | 2       | Draft    | products/P001/images/front_v2.jpg |
| IMG003  | P001      | FRONT_IMAGE | 3       | Approved | products/P001/images/front_v3.jpg |

---

# Catalogue Alias

Catalogue không lưu URL vật lý:

```text
ProductId: P001

ImageAlias:
product/P001/front/latest-approved
```

Hoặc:

```text
AssetAlias:
product/P001/front
```

---

# Runtime Resolution

Khi catalogue cần hiển thị ảnh:

```http
GET /catalogue/products/P001
```

Backend thực hiện:

```sql
SELECT TOP 1 *
FROM Assets
WHERE ProductId = 'P001'
  AND AssetType = 'FRONT_IMAGE'
  AND Status = 'Approved'
ORDER BY Version DESC
```

Kết quả:

```text
Version = 3
StoragePath = products/P001/images/front_v3.jpg
```

API trả về:

```json
{
  "productId": "P001",
  "frontImageUrl": "https://cdn.company.com/products/P001/images/front_v3.jpg"
}
```

---

# Upload New Version

Người dùng upload version mới:

```text
Version = 4
Status = Draft

StoragePath:
products/P001/images/front_v4.jpg
```

Catalogue vẫn trả về:

```text
front_v3.jpg
```

vì version 4 chưa được phê duyệt.

---

# Approval Process

Sau khi QA hoặc Content Manager approve:

```text
Version = 4
Status = Approved
```

Alias:

```text
product/P001/front/latest-approved
```

sẽ tự động resolve sang:

```text
products/P001/images/front_v4.jpg
```

Catalogue không cần thay đổi dữ liệu.

---

# Alias Resolution Flow

```text
Catalogue
    │
    ▼
product/P001/front/latest-approved
    │
    ▼
Asset Resolver Service
    │
    ▼
Find Latest Approved Version
    │
    ▼
Version 4
    │
    ▼
products/P001/images/front_v4.jpg
    │
    ▼
CDN URL
```

---

# Optional Alias Table

Có thể cache alias trong database để tăng tốc độ truy vấn.

## AssetAlias

| Alias                              | AssetId |
| ---------------------------------- | ------- |
| product/P001/front/latest-approved | IMG004  |

Khi approve version mới:

```text
product/P001/front/latest-approved
```

được cập nhật sang AssetId mới.

Nhờ đó catalogue chỉ lookup alias thay vì query toàn bộ version history.

---

# Benefits

## Business Benefits

* Catalogue luôn hiển thị phiên bản đã được phê duyệt mới nhất.
* Không cần sửa dữ liệu catalogue khi có asset mới.
* Hỗ trợ approval workflow.
* Hỗ trợ rollback.

## Technical Benefits

* Giảm coupling giữa catalogue và file storage.
* Dễ migrate CDN hoặc cloud storage.
* Hỗ trợ multi-CDN.
* Hỗ trợ signed URL.
* Hỗ trợ cache invalidation theo version.
* Tối ưu cho hệ thống PIM/DAM quy mô lớn.

---

# Recommendation

Đối với hệ thống EUTR/PIM:

Không lưu:

```text
https://cdn.company.com/products/P001/images/front_v3.jpg
```

Chỉ lưu:

```text
product/P001/front/latest-approved
```

Hoặc:

```text
AssetAlias
```

URL thực tế luôn được generate động thông qua Asset Resolver Service và CDN configuration.
