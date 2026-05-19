namespace Pim.Domain.Entities;

public class ProductAttributeDefinition
{
    public Guid Id { get; set; }
    public string AttributeName { get; set; } = string.Empty;
    public string AttributeTypeName { get; set; } = string.Empty;
    public string DataType { get; set; } = "Text";
    public string? Description { get; set; }
    public bool IsEnumeration { get; set; }
    public bool IsRequired { get; set; }
    public string DefaultValue { get; set; } = string.Empty;
    public string D365AttributeId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
