using Pim.Application.Dtos;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Services;

public interface IProductDocumentService
{
    Task<IReadOnlyList<ProductDocumentResponse>> GetByProductAsync(string productId, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDocumentResponse>> GetByTypeAsync(string productId, DocumentType documentType, CancellationToken ct = default);
    Task<ProductDocumentResponse?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<ProductDocumentResponse> CreateAsync(CreateProductDocumentRequest request, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UpdateProductDocumentRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}
