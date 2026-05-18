using Pim.Application.Dtos;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Services;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(CancellationToken ct = default)
        => (await _repository.GetAllAsync(ct)).Select(Map).ToList();

    public async Task<IReadOnlyList<ProductResponse>> SearchAsync(string? rangeName, string? masterNumber, ProductLevel? level, CancellationToken ct = default)
        => (await _repository.SearchAsync(rangeName, masterNumber, level, ct)).Select(Map).ToList();

    public async Task<ProductResponse?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var product = await _repository.GetByIdAsync(id, ct);
        return product is null ? null : Map(product);
    }

    public async Task<ProductResponse?> GetByD365ItemAsync(string d365ItemNumber, CancellationToken ct = default)
    {
        var product = await _repository.GetByD365ItemAsync(d365ItemNumber, ct);
        return product is null ? null : Map(product);
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Product name is required.");

        var now = DateTime.UtcNow;
        var product = new Product
        {
            Id = $"prd-{Guid.NewGuid():N}",
            Level = Enum.TryParse<ProductLevel>(request.Level, true, out var level) ? level : ProductLevel.Variant,
            RangeName = request.RangeName?.Trim() ?? string.Empty,
            MasterNumber = request.MasterNumber?.Trim() ?? string.Empty,
            VariantNumber = request.VariantNumber?.Trim() ?? string.Empty,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Designer = request.Designer?.Trim() ?? string.Empty,
            D365EntityName = request.D365EntityName?.Trim() ?? string.Empty,
            D365ItemNumber = request.D365ItemNumber?.Trim() ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        };
        return Map(await _repository.CreateAsync(product, ct));
    }

    public async Task<bool> UpdateAsync(string id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing is null) return false;

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Product name is required.");

        existing.Level = Enum.TryParse<ProductLevel>(request.Level, true, out var level) ? level : existing.Level;
        existing.RangeName = request.RangeName?.Trim() ?? existing.RangeName;
        existing.MasterNumber = request.MasterNumber?.Trim() ?? existing.MasterNumber;
        existing.VariantNumber = request.VariantNumber?.Trim() ?? existing.VariantNumber;
        existing.Name = request.Name.Trim();
        existing.Description = request.Description?.Trim() ?? existing.Description;
        existing.Designer = request.Designer?.Trim() ?? existing.Designer;
        existing.D365EntityName = request.D365EntityName?.Trim() ?? existing.D365EntityName;
        existing.D365ItemNumber = request.D365ItemNumber?.Trim() ?? existing.D365ItemNumber;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, ct);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        => _repository.DeleteAsync(id, ct);

    private static ProductResponse Map(Product p) => new()
    {
        Id = p.Id,
        Level = p.Level.ToString(),
        RangeName = p.RangeName,
        MasterNumber = p.MasterNumber,
        VariantNumber = p.VariantNumber,
        Name = p.Name,
        Description = p.Description,
        Designer = p.Designer,
        D365EntityName = p.D365EntityName,
        D365ItemNumber = p.D365ItemNumber,
        LastSyncedAt = p.LastSyncedAt,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
