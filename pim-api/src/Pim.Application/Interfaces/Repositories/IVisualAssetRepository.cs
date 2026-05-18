using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Repositories;

public interface IVisualAssetRepository
{
    Task<IReadOnlyList<VisualAsset>> GetByProductAsync(string productId, CancellationToken ct = default);
    Task<IReadOnlyList<VisualAsset>> GetByTypeAsync(string productId, AssetType assetType, CancellationToken ct = default);
    Task<VisualAsset?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<VisualAsset> CreateAsync(VisualAsset asset, CancellationToken ct = default);
    Task<bool> UpdateAsync(VisualAsset asset, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}
