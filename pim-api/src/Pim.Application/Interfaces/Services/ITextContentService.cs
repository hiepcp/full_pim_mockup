using Pim.Application.Dtos;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Services;

public interface ITextContentService
{
    Task<(IReadOnlyList<TextContentResponse> Items, int Total)> GetPagedAsync(int start, int end, string? sort, string? order, string? productId, string? contentType, string? status, string? languageCode, CancellationToken ct = default);
    Task<IReadOnlyList<TextContentResponse>> GetByProductAsync(string productId, CancellationToken ct = default);
    Task<IReadOnlyList<TextContentResponse>> GetByTypeAsync(string productId, TextContentType contentType, string? languageCode, CancellationToken ct = default);
    Task<TextContentResponse?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<TextContentResponse> CreateAsync(CreateTextContentRequest request, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UpdateTextContentRequest request, CancellationToken ct = default);
    Task<bool> ApproveAsync(string id, ApproveTextContentRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}
