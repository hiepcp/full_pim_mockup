namespace Pim.Domain.Entities;

public class ProductCategoryAssignment
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid HierarchyId { get; set; }
    public string D365ProductNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
