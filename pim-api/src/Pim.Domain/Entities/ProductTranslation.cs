namespace Pim.Domain.Entities;

public class ProductTranslation
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string D365ProductNumber { get; set; } = string.Empty;
    public string LanguageId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
