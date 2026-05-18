using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

public sealed class D365ProductVariant
{
    [JsonPropertyName("ProductMasterNumber")]
    public string ProductMasterNumber { get; set; } = string.Empty;

    [JsonPropertyName("ProductVariantNumber")]
    public string ProductVariantNumber { get; set; } = string.Empty;

    [JsonPropertyName("ProductName")]
    public string ProductName { get; set; } = string.Empty;

    [JsonPropertyName("ProductColorId")]
    public string ProductColorId { get; set; } = string.Empty;

    [JsonPropertyName("ProductSizeId")]
    public string ProductSizeId { get; set; } = string.Empty;

    [JsonPropertyName("ProductStyleId")]
    public string ProductStyleId { get; set; } = string.Empty;

    [JsonPropertyName("ProductConfigurationId")]
    public string ProductConfigurationId { get; set; } = string.Empty;

    [JsonPropertyName("RSVNRange")]
    public string RSVNRange { get; set; } = string.Empty;

    [JsonPropertyName("StatusId")]
    public int StatusId { get; set; }
}
