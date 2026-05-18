namespace Pim.Application.Dtos;

public sealed class VisualAssetResponse
{
    public string Id { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public string AssetType { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public string FileName { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public string StorageContainer { get; init; } = string.Empty;
    public string StorageBlobPath { get; init; } = string.Empty;
    public string CdnUrl { get; init; } = string.Empty;
    public int? Width { get; init; }
    public int? Height { get; init; }
    public int? DurationSeconds { get; init; }
    public string AltText { get; init; } = string.Empty;
    public string Caption { get; init; } = string.Empty;
    public string UploadedByEmail { get; init; } = string.Empty;
    public string UploadedByName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CreateVisualAssetRequest
{
    public string ProductId { get; init; } = string.Empty;
    public string AssetType { get; init; } = "Packshot";
    public string Status { get; init; } = "Draft";
    public string FileName { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public string StorageContainer { get; init; } = string.Empty;
    public string StorageBlobPath { get; init; } = string.Empty;
    public string CdnUrl { get; init; } = string.Empty;
    public int? Width { get; init; }
    public int? Height { get; init; }
    public int? DurationSeconds { get; init; }
    public string AltText { get; init; } = string.Empty;
    public string Caption { get; init; } = string.Empty;
    public string UploadedByEmail { get; init; } = string.Empty;
    public string UploadedByName { get; init; } = string.Empty;
}

public sealed class UpdateVisualAssetRequest
{
    public string AssetType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string AltText { get; init; } = string.Empty;
    public string Caption { get; init; } = string.Empty;
}
