using Pim.Domain.Enums;

namespace Pim.Domain.Entities;

public sealed class ProductDocument
{
    public string Id { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;

    public DocumentType DocumentType { get; set; } = DocumentType.TechnicalSheet;
    public ContentStatus Status { get; set; } = ContentStatus.Draft;

    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }

    public string StorageContainer { get; set; } = string.Empty;
    public string StorageBlobPath { get; set; } = string.Empty;
    public string CdnUrl { get; set; } = string.Empty;

    public string LanguageCode { get; set; } = "en";
    public int Version { get; set; } = 1;

    public string UploadedByEmail { get; set; } = string.Empty;
    public string UploadedByName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
