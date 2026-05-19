using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ProductCategoryAssignment
/// </summary>
public sealed class D365ProductCategoryAssignment
{
    [JsonPropertyName("ProductNumber")]
    public string ProductNumber { get; set; } = string.Empty;

    [JsonPropertyName("ProductCategoryHierarchyName")]
    public string ProductCategoryHierarchyName { get; set; } = string.Empty;

    [JsonPropertyName("CategoryCode")]
    public string CategoryCode { get; set; } = string.Empty;
}
