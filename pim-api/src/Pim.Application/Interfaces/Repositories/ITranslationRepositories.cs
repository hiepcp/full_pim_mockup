using Pim.Domain.Entities;

namespace Pim.Application.Interfaces.Repositories;

public interface IProductTranslationRepository
{
    Task<ProductTranslation?> GetAsync(Guid productId, string languageId, CancellationToken ct = default);
    Task<List<ProductTranslation>> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task CreateAsync(ProductTranslation entity, CancellationToken ct = default);
    Task UpdateAsync(ProductTranslation entity, CancellationToken ct = default);
}

public interface IVariantDimensionTranslationRepository
{
    Task<VariantDimensionTranslation?> GetAsync(string dimensionType, string dimensionId, string masterNumber, string languageId, CancellationToken ct = default);
    Task CreateAsync(VariantDimensionTranslation entity, CancellationToken ct = default);
    Task UpdateAsync(VariantDimensionTranslation entity, CancellationToken ct = default);
}
