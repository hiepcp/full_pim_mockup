using Pim.Domain.Enums;

namespace Pim.Domain.Entities;

public sealed class TextContent
{
    public string Id { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;

    public TextContentType ContentType { get; set; } = TextContentType.DesignDescriptionB2B;
    public ContentStatus Status { get; set; } = ContentStatus.Draft;

    public string LanguageCode { get; set; } = "en";
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;

    public int Version { get; set; } = 1;
    public string ApprovedByEmail { get; set; } = string.Empty;
    public DateTime? ApprovedAt { get; set; }

    public string AuthorEmail { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
