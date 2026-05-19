using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ProductMaster{Color|Size|Style|Configuration}Translation
/// </summary>
public sealed class D365DimensionTranslation
{
    [JsonPropertyName("ProductMasterNumber")]
    public string ProductMasterNumber { get; set; } = string.Empty;

    [JsonPropertyName("LanguageId")]
    public string LanguageId { get; set; } = string.Empty;

    // Color
    [JsonPropertyName("ProductColorId")]
    public string? ProductColorId { get; set; }

    [JsonPropertyName("TranslatedColorName")]
    public string? TranslatedColorName { get; set; }

    [JsonPropertyName("TranslatedColorDescription")]
    public string? TranslatedColorDescription { get; set; }

    // Size
    [JsonPropertyName("ProductSizeId")]
    public string? ProductSizeId { get; set; }

    [JsonPropertyName("TranslatedSizeName")]
    public string? TranslatedSizeName { get; set; }

    [JsonPropertyName("TranslatedSizeDescription")]
    public string? TranslatedSizeDescription { get; set; }

    // Style
    [JsonPropertyName("ProductStyleId")]
    public string? ProductStyleId { get; set; }

    [JsonPropertyName("TranslatedStyleName")]
    public string? TranslatedStyleName { get; set; }

    [JsonPropertyName("TranslatedStyleDescription")]
    public string? TranslatedStyleDescription { get; set; }

    // Configuration
    [JsonPropertyName("ProductConfigurationId")]
    public string? ProductConfigurationId { get; set; }

    [JsonPropertyName("TranslatedConfigurationName")]
    public string? TranslatedConfigurationName { get; set; }

    [JsonPropertyName("TranslatedConfigurationDescription")]
    public string? TranslatedConfigurationDescription { get; set; }
}
