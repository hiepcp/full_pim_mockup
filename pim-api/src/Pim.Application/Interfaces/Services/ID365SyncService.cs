namespace Pim.Application.Interfaces.Services;

public interface ID365SyncService
{
    Task<SyncResult> SyncProductsAsync(CancellationToken ct = default);
    Task<SyncResult> SyncVariantsAsync(CancellationToken ct = default);
}

public sealed class SyncResult
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public int Errors { get; set; }
    public List<string> ErrorMessages { get; set; } = new();
    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
}
