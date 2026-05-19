using Pim.Domain.Entities;

namespace Pim.Application.Interfaces.Repositories;

public interface IProductAttributeDefinitionRepository
{
    Task<ProductAttributeDefinition?> GetByNameAsync(string attributeName, CancellationToken ct = default);
    Task<List<ProductAttributeDefinition>> GetAllAsync(CancellationToken ct = default);
    Task CreateAsync(ProductAttributeDefinition entity, CancellationToken ct = default);
    Task UpdateAsync(ProductAttributeDefinition entity, CancellationToken ct = default);
}

public interface IProductAttributeValueRepository
{
    Task<ProductAttributeValue?> GetAsync(Guid productId, Guid attributeId, CancellationToken ct = default);
    Task<List<ProductAttributeValue>> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task CreateAsync(ProductAttributeValue entity, CancellationToken ct = default);
    Task UpdateAsync(ProductAttributeValue entity, CancellationToken ct = default);
}
