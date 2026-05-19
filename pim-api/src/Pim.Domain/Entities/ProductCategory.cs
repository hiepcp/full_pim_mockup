namespace Pim.Domain.Entities;

public class ProductCategory
{
    public Guid Id { get; set; }
    public Guid HierarchyId { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string FriendlyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Keywords { get; set; } = string.Empty;
    public string ParentCategoryCode { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public bool IsTangible { get; set; } = true;
    public int Level { get; set; }
    public int SortOrder { get; set; }
    public long D365CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
