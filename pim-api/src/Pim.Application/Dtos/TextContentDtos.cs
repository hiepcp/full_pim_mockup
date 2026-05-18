namespace Pim.Application.Dtos;

public sealed class TextContentResponse
{
    public string Id { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public string LanguageCode { get; init; } = "en";
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public int Version { get; init; }
    public string ApprovedByEmail { get; init; } = string.Empty;
    public DateTime? ApprovedAt { get; init; }
    public string AuthorEmail { get; init; } = string.Empty;
    public string AuthorName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CreateTextContentRequest
{
    public string ProductId { get; init; } = string.Empty;
    public string ContentType { get; init; } = "DesignDescriptionB2B";
    public string Status { get; init; } = "Draft";
    public string LanguageCode { get; init; } = "en";
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public string AuthorEmail { get; init; } = string.Empty;
    public string AuthorName { get; init; } = string.Empty;
}

public sealed class UpdateTextContentRequest
{
    public string ContentType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string LanguageCode { get; init; } = "en";
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
}

public sealed class ApproveTextContentRequest
{
    public string ApprovedByEmail { get; init; } = string.Empty;
}
