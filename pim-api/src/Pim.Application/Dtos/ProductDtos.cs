namespace Pim.Application.Dtos;

public sealed class ProductResponse
{
    public string Id { get; init; } = string.Empty;
    public string Level { get; init; } = "Variant";
    public string RangeName { get; init; } = string.Empty;
    public string MasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Designer { get; init; } = string.Empty;
    public string D365EntityName { get; init; } = string.Empty;
    public string D365ItemNumber { get; init; } = string.Empty;
    public DateTime? LastSyncedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CreateProductRequest
{
    public string Level { get; init; } = "Variant";
    public string RangeName { get; init; } = string.Empty;
    public string MasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Designer { get; init; } = string.Empty;
    public string D365EntityName { get; init; } = string.Empty;
    public string D365ItemNumber { get; init; } = string.Empty;
}

public sealed class UpdateProductRequest
{
    public string Level { get; init; } = "Variant";
    public string RangeName { get; init; } = string.Empty;
    public string MasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Designer { get; init; } = string.Empty;
    public string D365EntityName { get; init; } = string.Empty;
    public string D365ItemNumber { get; init; } = string.Empty;
}
