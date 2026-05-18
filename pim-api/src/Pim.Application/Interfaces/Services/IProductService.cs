using Pim.Application.Dtos;
using Pim.Domain.Enums;

namespace Pim.Application.Interfaces.Services;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ProductResponse>> SearchAsync(string? rangeName, string? masterNumber, ProductLevel? level, CancellationToken ct = default);
    Task<ProductResponse?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<ProductResponse?> GetByD365ItemAsync(string d365ItemNumber, CancellationToken ct = default);
    Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UpdateProductRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}
