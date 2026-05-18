using Pim.Application.Dtos;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Services;

public interface IVisualAssetService
{
    Task<IReadOnlyList<VisualAssetResponse>> GetByProductAsync(string productId, CancellationToken ct = default);
    Task<IReadOnlyList<VisualAssetResponse>> GetByTypeAsync(string productId, AssetType assetType, CancellationToken ct = default);
    Task<VisualAssetResponse?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<VisualAssetResponse> CreateAsync(CreateVisualAssetRequest request, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UpdateVisualAssetRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}
