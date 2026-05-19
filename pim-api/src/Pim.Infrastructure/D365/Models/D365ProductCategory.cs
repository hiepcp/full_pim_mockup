using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ProductCategory
/// </summary>
public sealed class D365ProductCategory
{
    [JsonPropertyName("CategoryId")]
    public long CategoryId { get; set; }

    [JsonPropertyName("ProductCategoryHierarchyId")]
    public string ProductCategoryHierarchyId { get; set; } = string.Empty;

    [JsonPropertyName("ProductCategoryHierarchyName")]
    public string ProductCategoryHierarchyName { get; set; } = string.Empty;

    [JsonPropertyName("CategoryCode")]
    public string CategoryCode { get; set; } = string.Empty;

    [JsonPropertyName("CategoryName")]
    public string CategoryName { get; set; } = string.Empty;

    [JsonPropertyName("FriendlyCategoryName")]
    public string FriendlyCategoryName { get; set; } = string.Empty;

    [JsonPropertyName("CategoryDescription")]
    public string CategoryDescription { get; set; } = string.Empty;

    [JsonPropertyName("CategoryKeywords")]
    public string CategoryKeywords { get; set; } = string.Empty;

    [JsonPropertyName("ParentProductCategoryCode")]
    public string ParentProductCategoryCode { get; set; } = string.Empty;

    [JsonPropertyName("ExternalId")]
    public string ExternalId { get; set; } = string.Empty;

    [JsonPropertyName("IsTangibleProduct")]
    public string IsTangibleProduct { get; set; } = string.Empty;
}
