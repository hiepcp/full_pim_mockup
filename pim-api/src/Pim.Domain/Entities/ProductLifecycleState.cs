namespace Pim.Domain.Entities;

public class ProductLifecycleState
{
    public Guid Id { get; set; }
    public string StateId { get; set; } = string.Empty;
    public string StateName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActiveForCommerce { get; set; } = true;
    public bool IsActiveForPlanning { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
