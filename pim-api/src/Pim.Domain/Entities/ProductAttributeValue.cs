namespace Pim.Domain.Entities;

public class ProductAttributeValue
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid AttributeId { get; set; }
    public string D365ProductNumber { get; set; } = string.Empty;
    public string? TextValue { get; set; }
    public int? IntegerValue { get; set; }
    public decimal? DecimalValue { get; set; }
    public DateTime? DateTimeValue { get; set; }
    public bool? BooleanValue { get; set; }
    public decimal? CurrencyValue { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
