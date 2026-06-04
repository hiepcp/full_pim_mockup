using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Repositories;

public interface ITextContentRepository
{
    Task<(IReadOnlyList<TextContent> Items, int Total)> GetPagedAsync(int start, int end, string? sort, string? order, string? productId, string? contentType, string? status, string? languageCode, CancellationToken ct = default);
    Task<IReadOnlyList<TextContent>> GetByProductAsync(string productId, CancellationToken ct = default);
    Task<IReadOnlyList<TextContent>> GetByTypeAsync(string productId, TextContentType contentType, string? languageCode, CancellationToken ct = default);
    Task<TextContent?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<TextContent> CreateAsync(TextContent content, CancellationToken ct = default);
    Task<bool> UpdateAsync(TextContent content, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    Task BulkArchiveByProductIdAsync(Guid productId, CancellationToken ct = default);
}
