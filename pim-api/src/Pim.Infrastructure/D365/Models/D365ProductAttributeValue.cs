using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ProductAttributeValueV3
/// </summary>
public sealed class D365ProductAttributeValue
{
    [JsonPropertyName("ProductNumber")]
    public string ProductNumber { get; set; } = string.Empty;

    [JsonPropertyName("AttributeName")]
    public string AttributeName { get; set; } = string.Empty;

    [JsonPropertyName("AttributeTypeName")]
    public string AttributeTypeName { get; set; } = string.Empty;

    [JsonPropertyName("DataType")]
    public string DataType { get; set; } = string.Empty;

    [JsonPropertyName("TextValue")]
    public string? TextValue { get; set; }

    [JsonPropertyName("IntegerValue")]
    public int? IntegerValue { get; set; }

    [JsonPropertyName("DecimalValue")]
    public decimal? DecimalValue { get; set; }

    [JsonPropertyName("DateTimeValue")]
    public string? DateTimeValue { get; set; }

    [JsonPropertyName("BooleanValue")]
    public string? BooleanValue { get; set; }

    [JsonPropertyName("CurrencyValue")]
    public decimal? CurrencyValue { get; set; }

    [JsonPropertyName("CurrencyCode")]
    public string CurrencyCode { get; set; } = string.Empty;

    [JsonPropertyName("UnitOfMeasure")]
    public string UnitOfMeasure { get; set; } = string.Empty;
}
