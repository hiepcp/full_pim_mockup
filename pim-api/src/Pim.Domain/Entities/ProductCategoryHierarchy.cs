namespace Pim.Domain.Entities;

public class ProductCategoryHierarchy
{
    public Guid Id { get; set; }
    public string HierarchyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string D365HierarchyId { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
