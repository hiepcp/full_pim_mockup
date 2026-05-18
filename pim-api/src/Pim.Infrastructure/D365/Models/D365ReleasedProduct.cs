using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ReleasedProductsV2.
/// Fields selected per D365_PIM_Field_Mapping.md §1.1
/// </summary>
public sealed class D365ReleasedProduct
{
    [JsonPropertyName("ItemNumber")]
    public string ItemNumber { get; set; } = string.Empty;

    [JsonPropertyName("ProductNumber")]
    public string ProductNumber { get; set; } = string.Empty;

    [JsonPropertyName("ProductSearchName")]
    public string ProductSearchName { get; set; } = string.Empty;

    [JsonPropertyName("SearchName")]
    public string SearchName { get; set; } = string.Empty;

    [JsonPropertyName("ProductName")]
    public string ProductName { get; set; } = string.Empty;

    [JsonPropertyName("ProductDescription")]
    public string ProductDescription { get; set; } = string.Empty;

    [JsonPropertyName("dataAreaId")]
    public string DataAreaId { get; set; } = string.Empty;

    [JsonPropertyName("ProductType")]
    public string ProductType { get; set; } = string.Empty;

    [JsonPropertyName("ProductSubType")]
    public string ProductSubType { get; set; } = string.Empty;

    [JsonPropertyName("ProductLifecycleStateId")]
    public string ProductLifecycleStateId { get; set; } = string.Empty;

    [JsonPropertyName("SalesPrice")]
    public decimal SalesPrice { get; set; }

    [JsonPropertyName("PurchasePrice")]
    public decimal PurchasePrice { get; set; }

    [JsonPropertyName("GrossProductHeight")]
    public decimal GrossProductHeight { get; set; }

    [JsonPropertyName("GrossProductWidth")]
    public decimal GrossProductWidth { get; set; }

    [JsonPropertyName("GrossDepth")]
    public decimal GrossDepth { get; set; }

    [JsonPropertyName("NetProductWeight")]
    public decimal NetProductWeight { get; set; }

    [JsonPropertyName("ProductVolume")]
    public decimal ProductVolume { get; set; }

    [JsonPropertyName("InventoryUnitSymbol")]
    public string InventoryUnitSymbol { get; set; } = string.Empty;

    [JsonPropertyName("SalesUnitSymbol")]
    public string SalesUnitSymbol { get; set; } = string.Empty;

    [JsonPropertyName("ProductLifeCycleValidFromDate")]
    public string? ProductLifeCycleValidFromDate { get; set; }

    [JsonPropertyName("ProductLifeCycleValidToDate")]
    public string? ProductLifeCycleValidToDate { get; set; }

    [JsonPropertyName("SellStartDate")]
    public string? SellStartDate { get; set; }

    [JsonPropertyName("SellEndDate")]
    public string? SellEndDate { get; set; }
}
