# Phân Tích Yêu Cầu Hệ Thống PIM

**Tài liệu này phân
tích và diễn giải yêu cầu dự án PIM (Product Information Management) dựa trên nội
dung khách hàng cung cấp.**

## 1. Tổng Quan Dự Án

Dự án hướng đến xây dựng một nền tảng PIM – Product
Information Management, đóng vai trò là nguồn dữ liệu trung tâm (single source
of truth) cho toàn bộ thông tin và tài sản liên quan đến sản phẩm.

## 2. Mục Tiêu Chính

- Tập trung hóa dữ liệu sản phẩm.
- Đồng bộ dữ liệu giữa nhiều kênh.
- Giảm việc lưu trữ dữ liệu phân tán.
- Hỗ trợ AI và rendering trong tương lai.
- Tạo nền tảng mở rộng cho website, catalogue, quotation và sales system.

## 3. Cấu Trúc Dữ Liệu Sản Phẩm

Mỗi sản phẩm sẽ được quản lý theo:

- Range Name
- Master Number
- Variant Number (nếu có)
- Item/Product Number từ D365

## 4. Các Nhóm Chức Năng Chính

4.1 Asset Management

- Packshot
- Lifestyle image
- Line drawing
- 3D CAD file
- Lifestyle video
- Product video
- Material swatch
- Technical sheet

4.2 Content Management

- Design description B2B/B2C
- USP B2B/B2C
- Care & Maintenance
- Daily Care & Maintenance
- Upholstery description

4.3 Document Management

- Product catalogue
- Range catalogue
- Presentation
- Technical & Compliance Directory
- Company Profile

4.4 Integration Management

- Đồng bộ dữ liệu với D365
- Đồng bộ website
- Đồng bộ iPaper/catalogue
- Đồng bộ quotation & pricelist system

## 5. Image Engine

Hệ thống cần có khả năng:

- Tự generate nhiều kích thước ảnh.
- Export nhiều format.
- Tối ưu ảnh cho web/social/catalogue.
- Chuẩn hóa asset.

## 6. Chức Năng Đồng Bộ

Khi dữ liệu thay đổi trong PIM:

- Website tự cập nhật.
- Catalogue/iPaper cập nhật.
- Có tracking/log vị trí dữ liệu đang được sử dụng.

## 7. Tích Hợp D365

Dữ liệu lấy từ D365 gồm:

- Dimension
- Designer
- Price
- Item number
- Sales data

PIM đóng vai trò trung tâm phân phối dữ liệu và asset.

## 8. AI & Rendering

Định hướng dài hạn:

- AI tạo description.
- AI tạo USP.
- AI hỗ trợ care instruction.
- Rendering tạo packshot/lifestyle image.

## 9. Product Card & QR Code

Product card và QR code nên liên kết trực tiếp với dữ liệu
PIM để đảm bảo đồng bộ.

## 10. Đề Xuất Kiến Trúc Module

1. Product Master Data
2. Asset Management
3. Content Management
4. Document Management
5. Image Processing Engine
6. Integration Hub
7. Usage Tracking
8. AI Assistant
9. Product Card & QR Code

## 11. Đề Xuất MVP

MVP nên tập trung:

- Quản lý product structure.
- Upload asset.
- Sync D365.
- Quản lý description.
- API cho website.
- Version & usage tracking cơ bản.

## 12. Các Điểm Cần Làm Rõ

- D365 field nào là nguồn chính?
- PIM có được sửa dữ liệu hay read-only?
- Có approval workflow không?
- Website dùng realtime API hay batch export?
- CAD file có cần viewer?
- AI content có cần approval?
