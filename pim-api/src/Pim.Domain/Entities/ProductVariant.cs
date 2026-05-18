namespace Pim.Domain.Entities;

public class ProductVariant
{
    public Guid Id { get; set; }
    public string ProductMasterNumber { get; set; } = string.Empty;
    public string VariantNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string ColorId { get; set; } = string.Empty;
    public string SizeId { get; set; } = string.Empty;
    public string StyleId { get; set; } = string.Empty;
    public string ConfigurationId { get; set; } = string.Empty;
    public string RangeName { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
