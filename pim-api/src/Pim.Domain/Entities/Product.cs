using Pim.Domain.Enums;

namespace Pim.Domain.Entities;

public sealed class Product
{
    public string Id { get; set; } = string.Empty;
    public ProductLevel Level { get; set; } = ProductLevel.Variant;

    public string RangeName { get; set; } = string.Empty;
    public string MasterNumber { get; set; } = string.Empty;
    public string VariantNumber { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Designer { get; set; } = string.Empty;

    public string D365EntityName { get; set; } = string.Empty;
    public string D365ItemNumber { get; set; } = string.Empty;
    public DateTime? LastSyncedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
