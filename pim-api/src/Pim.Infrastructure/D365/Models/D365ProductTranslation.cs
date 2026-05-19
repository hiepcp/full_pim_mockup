using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ProductTranslation
/// </summary>
public sealed class D365ProductTranslation
{
    [JsonPropertyName("ProductNumber")]
    public string ProductNumber { get; set; } = string.Empty;

    [JsonPropertyName("LanguageId")]
    public string LanguageId { get; set; } = string.Empty;

    [JsonPropertyName("ProductName")]
    public string ProductName { get; set; } = string.Empty;

    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;
}
