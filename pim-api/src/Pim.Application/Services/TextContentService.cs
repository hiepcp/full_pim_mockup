using Pim.Application.Dtos;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Services;

public sealed class TextContentService : ITextContentService
{
    private readonly ITextContentRepository _repository;

    public TextContentService(ITextContentRepository repository)
    {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<TextContentResponse> Items, int Total)> GetPagedAsync(int start, int end, string? sort, string? order, string? productId, string? contentType, string? status, string? languageCode, CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetPagedAsync(start, end, sort, order, productId, contentType, status, languageCode, ct);
        return (items.Select(Map).ToList(), total);
    }

    public async Task<IReadOnlyList<TextContentResponse>> GetByProductAsync(string productId, CancellationToken ct = default)
        => (await _repository.GetByProductAsync(productId, ct)).Select(Map).ToList();

    public async Task<IReadOnlyList<TextContentResponse>> GetByTypeAsync(string productId, TextContentType contentType, string? languageCode, CancellationToken ct = default)
        => (await _repository.GetByTypeAsync(productId, contentType, languageCode, ct)).Select(Map).ToList();

    public async Task<TextContentResponse?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var content = await _repository.GetByIdAsync(id, ct);
        return content is null ? null : Map(content);
    }

    public async Task<TextContentResponse> CreateAsync(CreateTextContentRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.ProductId))
            throw new ArgumentException("ProductId is required.");
        if (string.IsNullOrWhiteSpace(request.Body))
            throw new ArgumentException("Body is required.");

        var now = DateTime.UtcNow;
        var content = new TextContent
        {
            Id = Guid.NewGuid(),
            ProductId = Guid.Parse(request.ProductId),
            ContentType = Enum.TryParse<TextContentType>(request.ContentType, true, out var type) ? type : TextContentType.DesignDescriptionB2B,
            Status = Enum.TryParse<ContentStatus>(request.Status, true, out var status) ? status : ContentStatus.Draft,
            LanguageCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? "en" : request.LanguageCode.Trim(),
            Title = request.Title?.Trim() ?? string.Empty,
            Body = request.Body.Trim(),
            Version = 1,
            AuthorEmail = request.AuthorEmail?.Trim() ?? string.Empty,
            AuthorName = request.AuthorName?.Trim() ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        };
        return Map(await _repository.CreateAsync(content, ct));
    }

    public async Task<bool> UpdateAsync(string id, UpdateTextContentRequest request, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing is null) return false;

        existing.ContentType = Enum.TryParse<TextContentType>(request.ContentType, true, out var type) ? type : existing.ContentType;
        existing.Status = Enum.TryParse<ContentStatus>(request.Status, true, out var status) ? status : existing.Status;
        existing.LanguageCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? existing.LanguageCode : request.LanguageCode.Trim();
        existing.Title = request.Title?.Trim() ?? existing.Title;
        existing.Body = string.IsNullOrWhiteSpace(request.Body) ? existing.Body : request.Body.Trim();
        existing.Version += 1;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, ct);
    }

    public async Task<bool> ApproveAsync(string id, ApproveTextContentRequest request, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing is null) return false;

        existing.Status = ContentStatus.Approved;
        existing.ApprovedByEmail = request.ApprovedByEmail?.Trim() ?? string.Empty;
        existing.ApprovedAt = DateTime.UtcNow;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, ct);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        => _repository.DeleteAsync(id, ct);

    private static TextContentResponse Map(TextContent c) => new()
    {
        Id = c.Id.ToString(),
        ProductId = c.ProductId.ToString(),
        ContentType = c.ContentType.ToString(),
        Status = c.Status.ToString(),
        LanguageCode = c.LanguageCode,
        Title = c.Title,
        Body = c.Body,
        Version = c.Version,
        ApprovedByEmail = c.ApprovedByEmail,
        ApprovedAt = c.ApprovedAt,
        AuthorEmail = c.AuthorEmail,
        AuthorName = c.AuthorName,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
