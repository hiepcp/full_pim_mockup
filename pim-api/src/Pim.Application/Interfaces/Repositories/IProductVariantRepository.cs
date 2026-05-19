using Pim.Domain.Entities;

namespace Pim.Application.Interfaces.Repositories;

public interface IProductVariantRepository
{
    Task<(IReadOnlyList<ProductVariant> Items, int Total)> GetPagedAsync(int start, int end, CancellationToken ct = default);
    Task<IReadOnlyList<ProductVariant>> GetByMasterNumberAsync(string masterNumber, CancellationToken ct = default);
    Task<ProductVariant?> GetByVariantNumberAsync(string variantNumber, CancellationToken ct = default);
    Task<ProductVariant> CreateAsync(ProductVariant variant, CancellationToken ct = default);
    Task<bool> UpdateAsync(ProductVariant variant, CancellationToken ct = default);
    Task<int> GetCountByMasterNumberAsync(string masterNumber, CancellationToken ct = default);
}
