namespace Pim.Infrastructure.D365;

public sealed class D365Options
{
    public const string SectionName = "D365";

    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string DataAreaId { get; set; } = "dat";
}
