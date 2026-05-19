namespace Pim.Application.Interfaces.Services;

public interface ID365SyncService
{
    Task<SyncResult> SyncProductsAsync(CancellationToken ct = default);
    Task<SyncResult> SyncVariantsAsync(CancellationToken ct = default);
    Task<SyncResult> SyncCategoriesAsync(CancellationToken ct = default);
    Task<SyncResult> SyncCategoryAssignmentsAsync(CancellationToken ct = default);
    Task<SyncResult> SyncAttributeValuesAsync(CancellationToken ct = default);
    Task<SyncResult> SyncTranslationsAsync(CancellationToken ct = default);
    Task<SyncResult> SyncDimensionTranslationsAsync(string dimensionType, CancellationToken ct = default);
    Task<SyncResult> SyncLifecycleStatesAsync(CancellationToken ct = default);
    Task<SyncResult> SyncPricingAsync(CancellationToken ct = default);
    Task<SyncResult> SyncDimensionsAsync(CancellationToken ct = default);
    Task<SyncResult> SyncAllDynamicEntitiesAsync(CancellationToken ct = default);
}

public sealed class SyncResult
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public int Errors { get; set; }
    public List<string> ErrorMessages { get; set; } = new();
    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
    public string EntityName { get; set; } = string.Empty;
    public long DurationMs { get; set; }
}
