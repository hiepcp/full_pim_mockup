namespace Pim.Domain.Entities;

public class VariantDimensionTranslation
{
    public Guid Id { get; set; }
    public string DimensionType { get; set; } = string.Empty; // Color, Size, Style, Configuration
    public string DimensionId { get; set; } = string.Empty;
    public string ProductMasterNumber { get; set; } = string.Empty;
    public string LanguageId { get; set; } = string.Empty;
    public string TranslatedName { get; set; } = string.Empty;
    public string? TranslatedDescription { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
