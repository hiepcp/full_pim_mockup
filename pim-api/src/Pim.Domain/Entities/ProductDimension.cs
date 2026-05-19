namespace Pim.Domain.Entities;

public class ProductDimension
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string D365ItemNumber { get; set; } = string.Empty;
    public decimal Height { get; set; }
    public decimal Width { get; set; }
    public decimal Depth { get; set; }
    public decimal Volume { get; set; }
    public decimal NetWeight { get; set; }
    public decimal TareWeight { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public string WeightUnit { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
