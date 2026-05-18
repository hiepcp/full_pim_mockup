namespace Pim.Application.Dtos;

public sealed class ProductDocumentResponse
{
    public string Id { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public string DocumentType { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public string Title { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public string StorageContainer { get; init; } = string.Empty;
    public string StorageBlobPath { get; init; } = string.Empty;
    public string CdnUrl { get; init; } = string.Empty;
    public string LanguageCode { get; init; } = "en";
    public int Version { get; init; }
    public string UploadedByEmail { get; init; } = string.Empty;
    public string UploadedByName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CreateProductDocumentRequest
{
    public string ProductId { get; init; } = string.Empty;
    public string DocumentType { get; init; } = "TechnicalSheet";
    public string Status { get; init; } = "Draft";
    public string Title { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public string StorageContainer { get; init; } = string.Empty;
    public string StorageBlobPath { get; init; } = string.Empty;
    public string CdnUrl { get; init; } = string.Empty;
    public string LanguageCode { get; init; } = "en";
    public string UploadedByEmail { get; init; } = string.Empty;
    public string UploadedByName { get; init; } = string.Empty;
}

public sealed class UpdateProductDocumentRequest
{
    public string DocumentType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string LanguageCode { get; init; } = "en";
}
