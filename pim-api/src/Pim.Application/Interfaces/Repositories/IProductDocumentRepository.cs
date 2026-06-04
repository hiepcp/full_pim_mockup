using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Repositories;

public interface IProductDocumentRepository
{
    Task<IReadOnlyList<ProductDocument>> GetByProductAsync(string productId, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDocument>> GetByTypeAsync(string productId, DocumentType documentType, CancellationToken ct = default);
    Task<ProductDocument?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<ProductDocument> CreateAsync(ProductDocument document, CancellationToken ct = default);
    Task<bool> UpdateAsync(ProductDocument document, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    Task BulkArchiveByProductIdAsync(Guid productId, CancellationToken ct = default);
}
