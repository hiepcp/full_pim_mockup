using Pim.Domain.Entities;

namespace Pim.Application.Interfaces.Repositories;

public interface IProductPricingRepository
{
    Task<ProductPricing?> GetByProductAndAreaAsync(Guid productId, string dataAreaId, CancellationToken ct = default);
    Task CreateAsync(ProductPricing entity, CancellationToken ct = default);
    Task UpdateAsync(ProductPricing entity, CancellationToken ct = default);
}

public interface IProductDimensionRepository
{
    Task<ProductDimension?> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task CreateAsync(ProductDimension entity, CancellationToken ct = default);
    Task UpdateAsync(ProductDimension entity, CancellationToken ct = default);
}

public interface IProductLifecycleStateRepository
{
    Task<ProductLifecycleState?> GetByStateIdAsync(string stateId, CancellationToken ct = default);
    Task<List<ProductLifecycleState>> GetAllAsync(CancellationToken ct = default);
    Task CreateAsync(ProductLifecycleState entity, CancellationToken ct = default);
    Task UpdateAsync(ProductLifecycleState entity, CancellationToken ct = default);
}

public interface ISyncLogRepository
{
    Task CreateAsync(SyncLog entity, CancellationToken ct = default);
    Task UpdateAsync(SyncLog entity, CancellationToken ct = default);
    Task<List<SyncLog>> GetRecentAsync(int count = 20, CancellationToken ct = default);
}
