using Pim.Application.Dtos;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Services;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly IProductVariantRepository _variantRepository;
    private readonly IVisualAssetRepository _visualAssetRepository;
    private readonly ITextContentRepository _textContentRepository;
    private readonly IProductDocumentRepository _productDocumentRepository;

    public ProductService(
        IProductRepository repository,
        IProductVariantRepository variantRepository,
        IVisualAssetRepository visualAssetRepository,
        ITextContentRepository textContentRepository,
        IProductDocumentRepository productDocumentRepository)
    {
        _repository = repository;
        _variantRepository = variantRepository;
        _visualAssetRepository = visualAssetRepository;
        _textContentRepository = textContentRepository;
        _productDocumentRepository = productDocumentRepository;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(CancellationToken ct = default)
        => (await _repository.GetAllAsync(ct)).Select(Map).ToList();

    public async Task<(IReadOnlyList<ProductResponse> Items, int Total)> GetPagedAsync(int start, int end, CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetPagedAsync(start, end, ct);
        return (items.Select(Map).ToList(), total);
    }

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
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            RangeName = request.RangeName?.Trim() ?? string.Empty,
            MasterNumber = request.MasterNumber?.Trim() ?? string.Empty,
            VariantNumber = request.VariantNumber?.Trim() ?? string.Empty,
            Description = request.Description?.Trim() ?? string.Empty,
            Usp = request.Usp?.Trim() ?? string.Empty,
            Status = request.Status?.Trim() ?? "Draft",
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

        existing.Name = request.Name.Trim();
        existing.RangeName = request.RangeName?.Trim() ?? existing.RangeName;
        existing.MasterNumber = request.MasterNumber?.Trim() ?? existing.MasterNumber;
        existing.VariantNumber = request.VariantNumber?.Trim() ?? existing.VariantNumber;
        existing.Description = request.Description?.Trim() ?? existing.Description;
        existing.Usp = request.Usp?.Trim() ?? existing.Usp;
        existing.Status = request.Status?.Trim() ?? existing.Status;
        existing.D365ItemNumber = request.D365ItemNumber?.Trim() ?? existing.D365ItemNumber;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, ct);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        => _repository.DeleteAsync(id, ct);

    public async Task<ProductResponse> DisableAsync(string id, string? reason, CancellationToken ct = default)
    {
        var product = await _repository.GetByIdAsync(id, ct);
        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        if (string.Equals(product.Status, "Discontinued", StringComparison.OrdinalIgnoreCase))
            return Map(product);

        var now = DateTime.UtcNow;
        product.Status = "Discontinued";
        product.DisabledAt = now;
        product.DisabledReason = reason;
        product.UpdatedAt = now;

        await _repository.UpdateAsync(product, ct);

        var productId = product.Id;

        await _repository.BulkArchiveVisualAssetsAsync(productId, ct);
        await _repository.BulkArchiveTextContentsAsync(productId, ct);
        await _repository.BulkArchiveProductDocumentsAsync(productId, ct);

        if (!string.IsNullOrWhiteSpace(product.D365ItemNumber))
        {
            await _variantRepository.BulkDisableByMasterNumberAsync(product.D365ItemNumber, ct);
        }

        return Map(product);
    }

    public async Task<ProductResponse> EnableAsync(string id, CancellationToken ct = default)
    {
        var product = await _repository.GetByIdAsync(id, ct);
        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        if (product.IsDeleted)
            throw new InvalidOperationException("Cannot enable a deleted product.");

        product.Status = "Active";
        product.DisabledAt = null;
        product.DisabledReason = null;
        product.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(product, ct);

        if (!string.IsNullOrWhiteSpace(product.D365ItemNumber))
        {
            await _variantRepository.BulkReEnableByMasterNumberAsync(product.D365ItemNumber, ct);
        }

        return Map(product);
    }

    public async Task<bool> SoftDeleteAsync(string id, CancellationToken ct = default)
    {
        var product = await _repository.GetByIdAsync(id, ct);
        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        if (product.IsDeleted)
            throw new InvalidOperationException("Product is already deleted.");

        var now = DateTime.UtcNow;
        product.IsDeleted = true;
        product.DeletedAt = now;
        product.UpdatedAt = now;

        await _repository.UpdateAsync(product, ct);

        var productId = product.Id;

        await _repository.BulkArchiveVisualAssetsAsync(productId, ct);
        await _repository.BulkArchiveTextContentsAsync(productId, ct);
        await _repository.BulkArchiveProductDocumentsAsync(productId, ct);

        if (!string.IsNullOrWhiteSpace(product.D365ItemNumber))
        {
            await _variantRepository.BulkSoftDeleteByMasterNumberAsync(product.D365ItemNumber, ct);
        }

        return true;
    }

    public async Task<ProductResponse> RestoreAsync(string id, CancellationToken ct = default)
    {
        // GetByIdAsync excludes deleted, but we need to find it even if soft-deleted.
        // Use the repo's raw query via GetByIdAsync which doesn't filter is_deleted.
        var product = await _repository.GetByIdAsync(id, ct);
        if (product is null)
            throw new KeyNotFoundException("Product not found.");

        product.IsDeleted = false;
        product.DeletedAt = null;
        product.Status = "Draft";
        product.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(product, ct);

        return Map(product);
    }

    private static ProductResponse Map(Product p) => new()
    {
        Id = p.Id.ToString(),
        Name = p.Name,
        RangeName = p.RangeName,
        MasterNumber = p.MasterNumber,
        VariantNumber = p.VariantNumber,
        Description = p.Description,
        Usp = p.Usp,
        Status = p.Status,
        CompletenessScore = p.CompletenessScore,
        D365ItemNumber = p.D365ItemNumber,
        VariantCount = p.VariantCount,
        IsDeleted = p.IsDeleted,
        DeletedAt = p.DeletedAt,
        DisabledAt = p.DisabledAt,
        DisabledReason = p.DisabledReason,
        LastSyncedAt = p.LastSyncedAt,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
