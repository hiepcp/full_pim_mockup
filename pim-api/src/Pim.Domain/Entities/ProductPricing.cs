namespace Pim.Domain.Entities;

public class ProductPricing
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string D365ItemNumber { get; set; } = string.Empty;
    public string DataAreaId { get; set; } = string.Empty;
    public decimal SalesPrice { get; set; }
    public DateTime? SalesPriceDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTime? PurchasePriceDate { get; set; }
    public decimal UnitCost { get; set; }
    public DateTime? UnitCostDate { get; set; }
    public string SalesUnit { get; set; } = string.Empty;
    public string PurchaseUnit { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
