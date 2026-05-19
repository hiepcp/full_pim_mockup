namespace Pim.Domain.Entities;

public class SyncLog
{
    public Guid Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string SyncType { get; set; } = "Full";
    public string Status { get; set; } = "Running";
    public int RecordsCreated { get; set; }
    public int RecordsUpdated { get; set; }
    public int RecordsSkipped { get; set; }
    public int RecordsErrors { get; set; }
    public string? ErrorMessages { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public long DurationMs { get; set; }
    public string TriggeredBy { get; set; } = "System";
}
