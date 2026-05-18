using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Entities;
using Pim.Infrastructure.D365.Models;

namespace Pim.Infrastructure.D365;

public sealed class D365SyncService : ID365SyncService
{
    private readonly D365HttpClient _d365Client;
    private readonly IProductRepository _productRepository;
    private readonly IProductVariantRepository _variantRepository;
    private readonly D365Options _options;
    private readonly ILogger<D365SyncService> _logger;

    public D365SyncService(
        D365HttpClient d365Client,
        IProductRepository productRepository,
        IProductVariantRepository variantRepository,
        IOptions<D365Options> options,
        ILogger<D365SyncService> logger)
    {
        _d365Client = d365Client;
        _productRepository = productRepository;
        _variantRepository = variantRepository;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<SyncResult> SyncProductsAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();

        _logger.LogInformation("Starting D365 product sync for dataAreaId={DataAreaId}", _options.DataAreaId);

        List<D365ReleasedProduct> d365Products;
        try
        {
            d365Products = await _d365Client.GetAllAsync<D365ReleasedProduct>("ProductMasters", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch products from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} products from D365", d365Products.Count);

        foreach (var d365Product in d365Products)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Product.ProductNumber))
                {
                    result.Skipped++;
                    continue;
                }

                var existing = await _productRepository.GetByD365ItemAsync(d365Product.ProductNumber, ct);

                if (existing is null)
                {
                    var newProduct = D365ProductMapper.MapToProduct(d365Product);
                    await _productRepository.CreateAsync(newProduct, ct);
                    result.Created++;
                }
                else
                {
                    D365ProductMapper.UpdateProduct(existing, d365Product);
                    await _productRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing ProductNumber={d365Product.ProductNumber}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync product {ProductNumber}", d365Product.ProductNumber);
            }
        }

        _logger.LogInformation("D365 sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncVariantsAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();

        _logger.LogInformation("Starting D365 variant sync from ProductVariantsV2");

        List<D365ProductVariant> d365Variants;
        try
        {
            d365Variants = await _d365Client.GetAllAsync<D365ProductVariant>("ProductVariantsV2", filter: null, select: null, top: 10000, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch variants from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} variants from D365", d365Variants.Count);

        foreach (var d365Variant in d365Variants)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Variant.ProductVariantNumber))
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;
                var existing = await _variantRepository.GetByVariantNumberAsync(d365Variant.ProductVariantNumber, ct);

                if (existing is null)
                {
                    var newVariant = new ProductVariant
                    {
                        Id = Guid.NewGuid(),
                        ProductMasterNumber = d365Variant.ProductMasterNumber,
                        VariantNumber = d365Variant.ProductVariantNumber,
                        ProductName = d365Variant.ProductName,
                        ColorId = d365Variant.ProductColorId,
                        SizeId = d365Variant.ProductSizeId,
                        StyleId = d365Variant.ProductStyleId,
                        ConfigurationId = d365Variant.ProductConfigurationId,
                        RangeName = d365Variant.RSVNRange,
                        Status = d365Variant.StatusId,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _variantRepository.CreateAsync(newVariant, ct);
                    result.Created++;
                }
                else
                {
                    existing.ProductMasterNumber = d365Variant.ProductMasterNumber;
                    existing.ProductName = d365Variant.ProductName;
                    existing.ColorId = d365Variant.ProductColorId;
                    existing.SizeId = d365Variant.ProductSizeId;
                    existing.StyleId = d365Variant.ProductStyleId;
                    existing.ConfigurationId = d365Variant.ProductConfigurationId;
                    existing.RangeName = d365Variant.RSVNRange;
                    existing.Status = d365Variant.StatusId;
                    existing.UpdatedAt = now;
                    await _variantRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing Variant={d365Variant.ProductVariantNumber}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync variant {VariantNumber}", d365Variant.ProductVariantNumber);
            }
        }

        _logger.LogInformation("D365 variant sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }
}
