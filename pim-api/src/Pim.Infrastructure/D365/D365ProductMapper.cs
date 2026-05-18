using Pim.Domain.Entities;
using Pim.Infrastructure.D365.Models;

namespace Pim.Infrastructure.D365;

public static class D365ProductMapper
{
    public static Product MapToProduct(D365ReleasedProduct source)
    {
        var now = DateTime.UtcNow;
        var name = !string.IsNullOrWhiteSpace(source.ProductName) ? source.ProductName
            : !string.IsNullOrWhiteSpace(source.SearchName) ? source.SearchName
            : source.ProductSearchName;

        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            RangeName = string.Empty,
            MasterNumber = source.ProductNumber,
            VariantNumber = string.Empty,
            Description = source.ProductDescription,
            Usp = string.Empty,
            Status = MapLifecycleToStatus(source.ProductLifecycleStateId),
            CompletenessScore = 0,
            D365ItemNumber = source.ProductNumber,
            LastSyncedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public static void UpdateProduct(Product existing, D365ReleasedProduct source)
    {
        var name = !string.IsNullOrWhiteSpace(source.ProductName) ? source.ProductName
            : !string.IsNullOrWhiteSpace(source.SearchName) ? source.SearchName
            : source.ProductSearchName;

        existing.Name = name;
        existing.MasterNumber = source.ProductNumber;
        existing.Description = source.ProductDescription;
        existing.Status = MapLifecycleToStatus(source.ProductLifecycleStateId);
        existing.LastSyncedAt = DateTime.UtcNow;
        existing.UpdatedAt = DateTime.UtcNow;
    }

    private static string MapLifecycleToStatus(string lifecycleState)
    {
        return lifecycleState?.ToLowerInvariant() switch
        {
            "active" => "Active",
            "discontinued" => "Discontinued",
            "engineering" => "Draft",
            "obsolete" => "Discontinued",
            _ => "Draft"
        };
    }
}
