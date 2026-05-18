using Pim.Domain.Enums;

namespace Pim.Domain.Entities;

public sealed class VisualAsset
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }

    public AssetType AssetType { get; set; } = AssetType.Packshot;
    public AssetStatus Status { get; set; } = AssetStatus.Draft;

    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }

    public string StorageContainer { get; set; } = string.Empty;
    public string StorageBlobPath { get; set; } = string.Empty;
    public string CdnUrl { get; set; } = string.Empty;

    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? DurationSeconds { get; set; }

    public string AltText { get; set; } = string.Empty;
    public string Caption { get; set; } = string.Empty;

    public string UploadedByEmail { get; set; } = string.Empty;
    public string UploadedByName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
