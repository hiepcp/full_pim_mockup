# PIM - Hướng Xử Lý Hình Ảnh TIFF / Large Image Files

## 1. Mục tiêu

Tài liệu này mô tả hướng xử lý cho module quản lý và xử lý hình ảnh trong PIM, đặc biệt với các định dạng ảnh có dung lượng lớn như:

- `.TIFF` / `.TIF`
- Multi-page TIFF
- Ảnh scan độ phân giải cao
- Ảnh dung lượng lớn: JPG, PNG, WEBP, BMP
- Ảnh có kích thước lớn theo pixel hoặc DPI cao

Mục tiêu chính:

- Không làm chậm UI khi user upload hoặc xem ảnh lớn
- Giữ nguyên file gốc để phục vụ audit / download / xử lý lại
- Tạo bản preview tối ưu để hiển thị nhanh trên web
- Hỗ trợ TIFF nhiều trang
- Cho phép xử lý background và retry khi lỗi
- Quản lý trạng thái xử lý rõ ràng

---

## 2. Nguyên tắc xử lý

### 2.1 Không xử lý trực tiếp file gốc ở UI

Trình duyệt thường không hỗ trợ tốt định dạng `.TIFF`, đặc biệt là TIFF nhiều trang hoặc TIFF dung lượng lớn.

Vì vậy UI không nên load trực tiếp file gốc, mà chỉ hiển thị các bản đã tối ưu:

```text
Original File  -> lưu trữ
Preview Image  -> dùng để xem trên UI
Thumbnail      -> dùng cho danh sách / grid / gallery
```

---

### 2.2 File gốc được lưu riêng

File gốc nên lưu ở object storage hoặc file storage, ví dụ:

```text
Azure Blob Storage
Amazon S3
Google Cloud Storage
On-premise File Storage
```

Database chỉ lưu metadata và đường dẫn file, không lưu binary image trực tiếp trong database.

---

### 2.3 Xử lý bằng background job

Ảnh lớn không nên được convert, resize, OCR hoặc nén ngay trong request upload.

Thay vào đó, sau khi upload xong hệ thống tạo processing job để xử lý bất đồng bộ.

```text
Upload -> Save Original -> Create Job -> Background Worker xử lý -> Update Status
```

---

## 3. Flow tổng quan

```text
[User Upload Image]
        |
        v
[Validate File Type / Size]
        |
        v
[Save Original File]
        |
        v
[Create Image Metadata]
        |
        v
[Create Processing Job]
        |
        v
[Background Worker]
        |
        +--> Generate Preview
        |
        +--> Generate Thumbnail
        |
        +--> Extract Pages if TIFF Multi-page
        |
        +--> Compress / Resize
        |
        +--> Optional OCR
        |
        v
[Update Status = Completed / Failed]
        |
        v
[User View Optimized Image in PIM]
```

---

## 4. Upload Handling

### 4.1 Validate khi upload

Khi user upload ảnh, hệ thống cần kiểm tra:

- File extension
- MIME type
- File size
- Image width / height
- DPI
- Số trang nếu là TIFF nhiều trang
- Có bị corrupt file hay không

Ví dụ rule:

```text
Allowed extensions:
- .jpg
- .jpeg
- .png
- .webp
- .tif
- .tiff
- .bmp

Max file size:
- Configurable theo environment
- Ví dụ: 100MB / 300MB / 500MB

Max dimensions:
- Configurable
- Ví dụ: 20000 x 20000 pixels
```

---

### 4.2 Sau khi upload thành công

Sau khi user upload, hệ thống nên trả kết quả nhanh:

```text
Status = Uploaded
ProcessingStatus = Pending
```

Không bắt user chờ quá trình convert/resize hoàn tất.

---

## 5. Image Processing Pipeline

### 5.1 Các bước xử lý chính

Background worker sẽ xử lý các bước sau:

```text
1. Read original file
2. Detect file format
3. Extract metadata
4. Generate thumbnail
5. Generate preview
6. Convert TIFF pages if needed
7. Compress optimized version
8. Save generated files
9. Update database status
```

---

### 5.2 Generate Thumbnail

Thumbnail dùng cho màn hình danh sách, card, grid hoặc gallery.

Đề xuất:

```text
Format: WEBP hoặc JPG
Max width: 300px
Max height: 300px
Quality: 70 - 80
```

Ví dụ output:

```text
/images/{ImageId}/thumbnail.webp
```

---

### 5.3 Generate Preview

Preview dùng để xem chi tiết ảnh trong UI.

Đề xuất:

```text
Format: JPG / WEBP
Max width: 2000px - 3000px
Quality: 75 - 85
```

Ví dụ output:

```text
/images/{ImageId}/preview.jpg
```

---

### 5.4 Xử lý TIFF

Với file TIFF, hệ thống cần phân biệt:

```text
Single-page TIFF
Multi-page TIFF
```

#### Single-page TIFF

```text
Original: document.tiff
Preview: document_preview.jpg
Thumbnail: document_thumb.webp
```

#### Multi-page TIFF

Mỗi page nên được convert thành một ảnh preview riêng.

```text
Original: document.tiff

Generated pages:
- page_1_preview.jpg
- page_2_preview.jpg
- page_3_preview.jpg

Generated thumbnails:
- page_1_thumb.webp
- page_2_thumb.webp
- page_3_thumb.webp
```

---

## 6. Data Model Đề Xuất

### 6.1 Bảng `pim_images`

```sql
pim_images
(
    ImageId,
    FileName,
    OriginalFileName,
    FileExtension,
    MimeType,
    FileSize,
    StoragePath,
    PreviewPath,
    ThumbnailPath,
    Width,
    Height,
    DPI,
    PageCount,
    IsMultiPage,
    ProcessingStatus,
    ProcessingError,
    CreatedBy,
    CreatedDate,
    UpdatedDate
)
```

---

### 6.2 Bảng `pim_image_pages`

Dùng cho TIFF nhiều trang hoặc document image có nhiều page.

```sql
pim_image_pages
(
    ImagePageId,
    ImageId,
    PageNo,
    Width,
    Height,
    PreviewPath,
    ThumbnailPath,
    TextOcrPath,
    ProcessingStatus,
    ProcessingError,
    CreatedDate,
    UpdatedDate
)
```

---

### 6.3 Bảng `pim_image_processing_jobs`

Dùng để tracking background job.

```sql
pim_image_processing_jobs
(
    JobId,
    ImageId,
    JobType,
    Status,
    RetryCount,
    MaxRetry,
    ErrorMessage,
    StartedDate,
    CompletedDate,
    CreatedDate
)
```

---

## 7. Processing Status

Đề xuất trạng thái xử lý:

```text
Uploaded     : File gốc đã upload thành công
Pending      : Đang chờ background job xử lý
Processing   : Worker đang xử lý
Completed    : Đã xử lý xong preview / thumbnail
Failed       : Xử lý lỗi
Retrying     : Đang thử xử lý lại
Unsupported  : File không hỗ trợ xử lý preview
```

---

## 8. UI Behavior

### 8.1 Màn hình danh sách image/document

UI nên hiển thị:

```text
- Thumbnail
- File name
- File type
- File size
- Page count
- Processing status
- Created date
- Actions
```

Actions đề xuất:

```text
View Preview
Download Original
Retry Processing
View Pages
Delete
```

---

### 8.2 Khi ảnh đang xử lý

Nếu status là `Pending` hoặc `Processing`, UI hiển thị placeholder:

```text
Image is being processed...
```

Hoặc:

```text
Preview is not ready yet
```

User vẫn có thể download file gốc nếu được phân quyền.

---

### 8.3 Khi xử lý lỗi

Nếu status là `Failed`, UI hiển thị:

```text
Processing failed
```

Actions:

```text
Retry Processing
Download Original
View Error Detail
```

---

### 8.4 Với TIFF nhiều trang

UI nên có màn hình xem theo page:

```text
Document TIFF Viewer
--------------------------------------------------
[Page List / Thumbnail Sidebar] | [Preview Viewer]

Page 1
Page 2
Page 3
...
```

User có thể click từng page để xem preview.

---

## 9. API Đề Xuất

### 9.1 Upload image

```http
POST /api/pim/images/upload
```

Response:

```json
{
  "imageId": "IMG001",
  "fileName": "document.tiff",
  "processingStatus": "Pending"
}
```

---

### 9.2 Get image detail

```http
GET /api/pim/images/{imageId}
```

Response:

```json
{
  "imageId": "IMG001",
  "fileName": "document.tiff",
  "fileSize": 104857600,
  "fileExtension": ".tiff",
  "pageCount": 5,
  "processingStatus": "Completed",
  "previewPath": "/images/IMG001/preview.jpg",
  "thumbnailPath": "/images/IMG001/thumbnail.webp"
}
```

---

### 9.3 Get image pages

```http
GET /api/pim/images/{imageId}/pages
```

Response:

```json
[
  {
    "pageNo": 1,
    "previewPath": "/images/IMG001/pages/page_1_preview.jpg",
    "thumbnailPath": "/images/IMG001/pages/page_1_thumb.webp"
  },
  {
    "pageNo": 2,
    "previewPath": "/images/IMG001/pages/page_2_preview.jpg",
    "thumbnailPath": "/images/IMG001/pages/page_2_thumb.webp"
  }
]
```

---

### 9.4 Retry processing

```http
POST /api/pim/images/{imageId}/retry-processing
```

Response:

```json
{
  "imageId": "IMG001",
  "processingStatus": "Pending"
}
```

---

### 9.5 Download original

```http
GET /api/pim/images/{imageId}/download-original
```

---

## 10. Storage Structure Đề Xuất

```text
/pim/images/{ImageId}/
    original/
        document.tiff
    preview/
        preview.jpg
    thumbnail/
        thumbnail.webp
    pages/
        page_1_preview.jpg
        page_1_thumb.webp
        page_2_preview.jpg
        page_2_thumb.webp
    ocr/
        page_1.txt
        page_2.txt
```

---

## 11. Background Worker Đề Xuất

### 11.1 Worker responsibilities

```text
- Pick pending image processing jobs
- Read original file from storage
- Convert TIFF to preview images
- Generate thumbnail
- Optimize image
- Extract page-level metadata
- Save generated files
- Update database
- Retry if failed
```

---

### 11.2 Retry policy

Đề xuất:

```text
Max retry: 3
Retry delay: 1 min, 5 min, 15 min
```

Nếu quá số lần retry:

```text
Status = Failed
```

---

## 12. Performance Considerations

### 12.1 Không load ảnh gốc trên UI

UI chỉ nên load:

```text
Thumbnail
Preview
Page Preview
```

File gốc chỉ dùng cho:

```text
Download
Re-processing
Audit
Backup
```

---

### 12.2 Lazy loading

Với TIFF nhiều trang, không nên load tất cả page cùng lúc.

Đề xuất:

```text
- Load page đầu tiên trước
- Lazy load các page khi user scroll hoặc click
- Cache thumbnail/page preview
```

---

### 12.3 CDN / Cache

Các file preview và thumbnail nên có cache header hoặc CDN nếu lượng truy cập lớn.

```text
Cache-Control: public, max-age=86400
```

---

## 13. Security & Permission

Cần kiểm soát quyền truy cập:

```text
- Ai được upload image
- Ai được view preview
- Ai được download original
- Ai được retry processing
- Ai được delete image
```

Không nên expose trực tiếp storage path public nếu file nhạy cảm.

Nên dùng:

```text
Signed URL
Temporary URL
Proxy download API
```

---

## 14. Error Handling

Các lỗi thường gặp:

```text
Unsupported file format
File too large
Corrupted image file
TIFF codec not supported
Out of memory during processing
Storage upload failed
Preview generation failed
OCR failed
```

Hệ thống cần lưu lỗi vào:

```text
ProcessingError
ErrorMessage
RetryCount
```

---

## 15. Scope Đề Xuất Cho Phase 1

### Nên làm trong Phase 1

```text
- Upload image file
- Validate file type / file size
- Store original file
- Save image metadata
- Generate thumbnail
- Generate preview
- Support single-page TIFF
- Support multi-page TIFF basic conversion
- View processing status
- Retry failed processing
- Download original file
```

---

### Có thể để Phase 2

```text
- OCR text extraction
- Advanced image annotation
- Image comparison
- AI image classification
- Auto tagging
- Batch processing dashboard
- CDN optimization
- Advanced TIFF compression settings
```

---

## 16. Kết luận

Với PIM, các file TIFF và ảnh dung lượng lớn nên được xử lý theo kiến trúc:

```text
Original File Storage + Metadata DB + Background Processing + Optimized Preview for UI
```

Điểm quan trọng là:

```text
- Giữ file gốc
- Không render file gốc trực tiếp trên UI
- Tạo preview / thumbnail để hiển thị nhanh
- Xử lý TIFF nhiều trang thành từng page
- Dùng background job để tránh timeout
- Có status và retry rõ ràng
```

Cách này giúp hệ thống ổn định hơn, UI nhanh hơn và dễ mở rộng cho OCR, AI tagging hoặc document processing ở các phase sau.
