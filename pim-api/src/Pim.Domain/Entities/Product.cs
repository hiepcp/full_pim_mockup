using Pim.Domain.Enums;

namespace Pim.Domain.Entities;

public sealed class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RangeName { get; set; } = string.Empty;
    public string MasterNumber { get; set; } = string.Empty;
    public string VariantNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Usp { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public int CompletenessScore { get; set; }
    public string D365ItemNumber { get; set; } = string.Empty;
    public int VariantCount { get; set; }
    public DateTime? LastSyncedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
