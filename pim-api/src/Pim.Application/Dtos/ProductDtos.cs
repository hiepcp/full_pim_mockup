namespace Pim.Application.Dtos;

public sealed class ProductResponse
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string RangeName { get; init; } = string.Empty;
    public string MasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Usp { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public int CompletenessScore { get; init; }
    public string D365ItemNumber { get; init; } = string.Empty;
    public int VariantCount { get; set; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
    public DateTime? DisabledAt { get; init; }
    public string? DisabledReason { get; init; }
    public DateTime? LastSyncedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class ProductVariantResponse
{
    public string Id { get; init; } = string.Empty;
    public string ProductMasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string ColorId { get; init; } = string.Empty;
    public string SizeId { get; init; } = string.Empty;
    public string StyleId { get; init; } = string.Empty;
    public string ConfigurationId { get; init; } = string.Empty;
    public string RangeName { get; init; } = string.Empty;
    public int Status { get; init; }
}

public sealed class CreateProductRequest
{
    public string Name { get; init; } = string.Empty;
    public string RangeName { get; init; } = string.Empty;
    public string MasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Usp { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public string D365ItemNumber { get; init; } = string.Empty;
}

public sealed class UpdateProductRequest
{
    public string Name { get; init; } = string.Empty;
    public string RangeName { get; init; } = string.Empty;
    public string MasterNumber { get; init; } = string.Empty;
    public string VariantNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Usp { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public string D365ItemNumber { get; init; } = string.Empty;
}

public sealed class DisableProductRequest
{
    public string? Reason { get; init; }
}
