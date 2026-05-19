using System.Text.Json.Serialization;

namespace Pim.Infrastructure.D365.Models;

/// <summary>
/// DTO matching D365 OData entity ProductLifecycleState
/// </summary>
public sealed class D365ProductLifecycleState
{
    [JsonPropertyName("StateId")]
    public string StateId { get; set; } = string.Empty;

    [JsonPropertyName("StateName")]
    public string StateName { get; set; } = string.Empty;

    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("IsActiveForCommerce")]
    public string IsActiveForCommerce { get; set; } = string.Empty;

    [JsonPropertyName("IsActiveForPlanning")]
    public string IsActiveForPlanning { get; set; } = string.Empty;
}
