using System.Diagnostics;
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
    private readonly IProductCategoryHierarchyRepository _hierarchyRepository;
    private readonly IProductCategoryRepository _categoryRepository;
    private readonly IProductCategoryAssignmentRepository _categoryAssignmentRepository;
    private readonly IProductAttributeDefinitionRepository _attributeDefRepository;
    private readonly IProductAttributeValueRepository _attributeValueRepository;
    private readonly IProductTranslationRepository _translationRepository;
    private readonly IVariantDimensionTranslationRepository _dimTranslationRepository;
    private readonly IProductLifecycleStateRepository _lifecycleRepository;
    private readonly IProductPricingRepository _pricingRepository;
    private readonly IProductDimensionRepository _dimensionRepository;
    private readonly ISyncLogRepository _syncLogRepository;
    private readonly D365Options _options;
    private readonly ILogger<D365SyncService> _logger;

    public D365SyncService(
        D365HttpClient d365Client,
        IProductRepository productRepository,
        IProductVariantRepository variantRepository,
        IProductCategoryHierarchyRepository hierarchyRepository,
        IProductCategoryRepository categoryRepository,
        IProductCategoryAssignmentRepository categoryAssignmentRepository,
        IProductAttributeDefinitionRepository attributeDefRepository,
        IProductAttributeValueRepository attributeValueRepository,
        IProductTranslationRepository translationRepository,
        IVariantDimensionTranslationRepository dimTranslationRepository,
        IProductLifecycleStateRepository lifecycleRepository,
        IProductPricingRepository pricingRepository,
        IProductDimensionRepository dimensionRepository,
        ISyncLogRepository syncLogRepository,
        IOptions<D365Options> options,
        ILogger<D365SyncService> logger)
    {
        _d365Client = d365Client;
        _productRepository = productRepository;
        _variantRepository = variantRepository;
        _hierarchyRepository = hierarchyRepository;
        _categoryRepository = categoryRepository;
        _categoryAssignmentRepository = categoryAssignmentRepository;
        _attributeDefRepository = attributeDefRepository;
        _attributeValueRepository = attributeValueRepository;
        _translationRepository = translationRepository;
        _dimTranslationRepository = dimTranslationRepository;
        _lifecycleRepository = lifecycleRepository;
        _pricingRepository = pricingRepository;
        _dimensionRepository = dimensionRepository;
        _syncLogRepository = syncLogRepository;
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

    public async Task<SyncResult> SyncCategoriesAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 category sync");

        List<D365ProductCategory> d365Categories;
        try
        {
            d365Categories = await _d365Client.GetAllAsync<D365ProductCategory>("EcoResCategories", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch categories from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} categories from D365", d365Categories.Count);

        foreach (var d365Cat in d365Categories)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Cat.CategoryCode))
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;

                var hierarchy = await _hierarchyRepository.GetByNameAsync(d365Cat.ProductCategoryHierarchyName, ct);
                if (hierarchy is null)
                {
                    hierarchy = new ProductCategoryHierarchy
                    {
                        Id = Guid.NewGuid(),
                        HierarchyName = d365Cat.ProductCategoryHierarchyName,
                        D365HierarchyId = d365Cat.ProductCategoryHierarchyId,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _hierarchyRepository.CreateAsync(hierarchy, ct);
                }

                var existing = await _categoryRepository.GetByCategoryCodeAsync(d365Cat.ProductCategoryHierarchyId, d365Cat.CategoryCode, ct);
                if (existing is null)
                {
                    var newCat = new ProductCategory
                    {
                        Id = Guid.NewGuid(),
                        HierarchyId = hierarchy.Id,
                        CategoryCode = d365Cat.CategoryCode,
                        CategoryName = d365Cat.CategoryName,
                        FriendlyName = d365Cat.FriendlyCategoryName,
                        Description = d365Cat.CategoryDescription,
                        Keywords = d365Cat.CategoryKeywords,
                        ParentCategoryCode = d365Cat.ParentProductCategoryCode,
                        ExternalId = d365Cat.ExternalId,
                        IsTangible = d365Cat.IsTangibleProduct != "No",
                        D365CategoryId = d365Cat.CategoryId,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _categoryRepository.CreateAsync(newCat, ct);
                    result.Created++;
                }
                else
                {
                    existing.CategoryName = d365Cat.CategoryName;
                    existing.FriendlyName = d365Cat.FriendlyCategoryName;
                    existing.Description = d365Cat.CategoryDescription;
                    existing.Keywords = d365Cat.CategoryKeywords;
                    existing.ParentCategoryCode = d365Cat.ParentProductCategoryCode;
                    existing.ExternalId = d365Cat.ExternalId;
                    existing.IsTangible = d365Cat.IsTangibleProduct != "No";
                    existing.D365CategoryId = d365Cat.CategoryId;
                    existing.UpdatedAt = now;
                    await _categoryRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing Category={d365Cat.CategoryCode}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync category {CategoryCode}", d365Cat.CategoryCode);
            }
        }

        _logger.LogInformation("D365 category sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncCategoryAssignmentsAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 category assignment sync");

        List<D365ProductCategoryAssignment> d365Assignments;
        try
        {
            d365Assignments = await _d365Client.GetAllAsync<D365ProductCategoryAssignment>("EcoResProductCategoryAssignments", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch category assignments from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} category assignments from D365", d365Assignments.Count);

        foreach (var d365Assignment in d365Assignments)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Assignment.ProductNumber) || string.IsNullOrWhiteSpace(d365Assignment.CategoryCode))
                {
                    result.Skipped++;
                    continue;
                }

                var product = await _productRepository.GetByD365ItemAsync(d365Assignment.ProductNumber, ct);
                if (product is null)
                {
                    result.Skipped++;
                    continue;
                }

                var hierarchy = await _hierarchyRepository.GetByNameAsync(d365Assignment.ProductCategoryHierarchyName, ct);
                if (hierarchy is null)
                {
                    result.Skipped++;
                    continue;
                }

                var category = await _categoryRepository.GetByCategoryCodeAsync(hierarchy.D365HierarchyId, d365Assignment.CategoryCode, ct);
                if (category is null)
                {
                    result.Skipped++;
                    continue;
                }

                var existing = await _categoryAssignmentRepository.GetAsync(product.Id, category.Id, ct);
                if (existing is null)
                {
                    var assignment = new ProductCategoryAssignment
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        CategoryId = category.Id,
                        HierarchyId = hierarchy.Id,
                        D365ProductNumber = d365Assignment.ProductNumber,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _categoryAssignmentRepository.CreateAsync(assignment, ct);
                    result.Created++;
                }
                else
                {
                    result.Skipped++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing assignment Product={d365Assignment.ProductNumber}, Category={d365Assignment.CategoryCode}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync category assignment {ProductNumber}/{CategoryCode}", d365Assignment.ProductNumber, d365Assignment.CategoryCode);
            }
        }

        _logger.LogInformation("D365 category assignment sync completed: Created={Created}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncAttributeValuesAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 attribute value sync");

        List<D365ProductAttributeValue> d365Values;
        try
        {
            d365Values = await _d365Client.GetAllAsync<D365ProductAttributeValue>("ProductAttributeValueV3", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch attribute values from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} attribute values from D365", d365Values.Count);

        foreach (var d365Value in d365Values)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Value.ProductNumber) || string.IsNullOrWhiteSpace(d365Value.AttributeName))
                {
                    result.Skipped++;
                    continue;
                }

                var product = await _productRepository.GetByD365ItemAsync(d365Value.ProductNumber, ct);
                if (product is null)
                {
                    result.Skipped++;
                    continue;
                }

                var attrDef = await _attributeDefRepository.GetByNameAsync(d365Value.AttributeName, ct);
                if (attrDef is null)
                {
                    var now2 = DateTime.UtcNow;
                    attrDef = new ProductAttributeDefinition
                    {
                        Id = Guid.NewGuid(),
                        AttributeName = d365Value.AttributeName,
                        DataType = d365Value.DataType,
                        CreatedAt = now2,
                        UpdatedAt = now2
                    };
                    await _attributeDefRepository.CreateAsync(attrDef, ct);
                }

                var now = DateTime.UtcNow;
                var existing = await _attributeValueRepository.GetAsync(product.Id, attrDef.Id, ct);
                if (existing is null)
                {
                    var newValue = new ProductAttributeValue
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        AttributeId = attrDef.Id,
                        D365ProductNumber = d365Value.ProductNumber,
                        TextValue = d365Value.TextValue,
                        IntegerValue = d365Value.IntegerValue,
                        DecimalValue = d365Value.DecimalValue,
                        DateTimeValue = ParseDateTime(d365Value.DateTimeValue),
                        BooleanValue = d365Value.BooleanValue == "Yes",
                        CurrencyValue = d365Value.CurrencyValue,
                        CurrencyCode = d365Value.CurrencyCode,
                        UnitOfMeasure = d365Value.UnitOfMeasure,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _attributeValueRepository.CreateAsync(newValue, ct);
                    result.Created++;
                }
                else
                {
                    existing.TextValue = d365Value.TextValue;
                    existing.IntegerValue = d365Value.IntegerValue;
                    existing.DecimalValue = d365Value.DecimalValue;
                    existing.DateTimeValue = ParseDateTime(d365Value.DateTimeValue);
                    existing.BooleanValue = d365Value.BooleanValue == "Yes";
                    existing.CurrencyValue = d365Value.CurrencyValue;
                    existing.CurrencyCode = d365Value.CurrencyCode;
                    existing.UnitOfMeasure = d365Value.UnitOfMeasure;
                    existing.UpdatedAt = now;
                    await _attributeValueRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing attribute value Product={d365Value.ProductNumber}, Attr={d365Value.AttributeName}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync attribute value {ProductNumber}/{AttributeName}", d365Value.ProductNumber, d365Value.AttributeName);
            }
        }

        _logger.LogInformation("D365 attribute value sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncTranslationsAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 product translation sync");

        List<D365ProductTranslation> d365Translations;
        try
        {
            d365Translations = await _d365Client.GetAllAsync<D365ProductTranslation>("ReleasedProductTranslations", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch translations from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} translations from D365", d365Translations.Count);

        foreach (var d365Trans in d365Translations)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Trans.ProductNumber) || string.IsNullOrWhiteSpace(d365Trans.LanguageId))
                {
                    result.Skipped++;
                    continue;
                }

                var product = await _productRepository.GetByD365ItemAsync(d365Trans.ProductNumber, ct);
                if (product is null)
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;
                var existing = await _translationRepository.GetAsync(product.Id, d365Trans.LanguageId, ct);
                if (existing is null)
                {
                    var newTrans = new ProductTranslation
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        D365ProductNumber = d365Trans.ProductNumber,
                        LanguageId = d365Trans.LanguageId,
                        ProductName = d365Trans.ProductName,
                        Description = d365Trans.Description,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _translationRepository.CreateAsync(newTrans, ct);
                    result.Created++;
                }
                else
                {
                    existing.ProductName = d365Trans.ProductName;
                    existing.Description = d365Trans.Description;
                    existing.UpdatedAt = now;
                    await _translationRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing translation Product={d365Trans.ProductNumber}, Lang={d365Trans.LanguageId}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync translation {ProductNumber}/{LanguageId}", d365Trans.ProductNumber, d365Trans.LanguageId);
            }
        }

        _logger.LogInformation("D365 translation sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncDimensionTranslationsAsync(string dimensionType, CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 dimension translation sync for type={DimensionType}", dimensionType);

        var entityName = dimensionType.ToLowerInvariant() switch
        {
            "color" => "EcoResProductMasterColorTranslations",
            "size"  => "EcoResProductMasterSizeTranslations",
            "style" => "EcoResProductMasterStyleTranslations",
            "configuration" => "EcoResProductMasterConfigurationTranslations",
            _ => throw new ArgumentException($"Unknown dimension type: {dimensionType}", nameof(dimensionType))
        };

        List<D365DimensionTranslation> d365DimTrans;
        try
        {
            d365DimTrans = await _d365Client.GetAllAsync<D365DimensionTranslation>(entityName, filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch dimension translations from D365 entity {Entity}", entityName);
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} dimension translations from {Entity}", d365DimTrans.Count, entityName);

        foreach (var d365Dt in d365DimTrans)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Dt.LanguageId) || string.IsNullOrWhiteSpace(d365Dt.ProductMasterNumber))
                {
                    result.Skipped++;
                    continue;
                }

                var (dimId, translatedName, translatedDesc) = dimensionType.ToLowerInvariant() switch
                {
                    "color"         => (d365Dt.ProductColorId, d365Dt.TranslatedColorName, d365Dt.TranslatedColorDescription),
                    "size"          => (d365Dt.ProductSizeId, d365Dt.TranslatedSizeName, d365Dt.TranslatedSizeDescription),
                    "style"         => (d365Dt.ProductStyleId, d365Dt.TranslatedStyleName, d365Dt.TranslatedStyleDescription),
                    "configuration" => (d365Dt.ProductConfigurationId, d365Dt.TranslatedConfigurationName, d365Dt.TranslatedConfigurationDescription),
                    _ => (null, null, null)
                };

                if (string.IsNullOrWhiteSpace(dimId) || string.IsNullOrWhiteSpace(translatedName))
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;
                var existing = await _dimTranslationRepository.GetAsync(dimensionType, dimId!, d365Dt.ProductMasterNumber, d365Dt.LanguageId, ct);
                if (existing is null)
                {
                    var newDt = new VariantDimensionTranslation
                    {
                        Id = Guid.NewGuid(),
                        DimensionType = dimensionType,
                        DimensionId = dimId!,
                        ProductMasterNumber = d365Dt.ProductMasterNumber,
                        LanguageId = d365Dt.LanguageId,
                        TranslatedName = translatedName!,
                        TranslatedDescription = translatedDesc,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _dimTranslationRepository.CreateAsync(newDt, ct);
                    result.Created++;
                }
                else
                {
                    existing.TranslatedName = translatedName!;
                    existing.TranslatedDescription = translatedDesc;
                    existing.UpdatedAt = now;
                    await _dimTranslationRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing dim translation Master={d365Dt.ProductMasterNumber}, Lang={d365Dt.LanguageId}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync dimension translation {Master}/{Lang}", d365Dt.ProductMasterNumber, d365Dt.LanguageId);
            }
        }

        _logger.LogInformation("D365 dimension translation sync ({Type}) completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            dimensionType, result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncLifecycleStatesAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 lifecycle state sync");

        List<D365ProductLifecycleState> d365States;
        try
        {
            d365States = await _d365Client.GetAllAsync<D365ProductLifecycleState>("EcoResProductLifecycleStates", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch lifecycle states from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        _logger.LogInformation("Fetched {Count} lifecycle states from D365", d365States.Count);

        foreach (var d365State in d365States)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365State.StateId))
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;
                var existing = await _lifecycleRepository.GetByStateIdAsync(d365State.StateId, ct);
                if (existing is null)
                {
                    var newState = new ProductLifecycleState
                    {
                        Id = Guid.NewGuid(),
                        StateId = d365State.StateId,
                        StateName = d365State.StateName,
                        Description = d365State.Description,
                        IsActiveForCommerce = d365State.IsActiveForCommerce != "No",
                        IsActiveForPlanning = d365State.IsActiveForPlanning != "No",
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _lifecycleRepository.CreateAsync(newState, ct);
                    result.Created++;
                }
                else
                {
                    existing.StateName = d365State.StateName;
                    existing.Description = d365State.Description;
                    existing.IsActiveForCommerce = d365State.IsActiveForCommerce != "No";
                    existing.IsActiveForPlanning = d365State.IsActiveForPlanning != "No";
                    existing.UpdatedAt = now;
                    await _lifecycleRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing lifecycle state {d365State.StateId}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync lifecycle state {StateId}", d365State.StateId);
            }
        }

        _logger.LogInformation("D365 lifecycle state sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncPricingAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 pricing sync");

        List<D365ReleasedProduct> d365Products;
        try
        {
            d365Products = await _d365Client.GetAllAsync<D365ReleasedProduct>("ProductMasters", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch products for pricing sync from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        foreach (var d365Product in d365Products)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Product.ProductNumber))
                {
                    result.Skipped++;
                    continue;
                }

                var product = await _productRepository.GetByD365ItemAsync(d365Product.ProductNumber, ct);
                if (product is null)
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;
                var existing = await _pricingRepository.GetByProductAndAreaAsync(product.Id, d365Product.DataAreaId, ct);
                if (existing is null)
                {
                    var newPricing = new ProductPricing
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        D365ItemNumber = d365Product.ProductNumber,
                        DataAreaId = d365Product.DataAreaId,
                        SalesPrice = d365Product.SalesPrice,
                        PurchasePrice = d365Product.PurchasePrice,
                        SalesUnit = d365Product.SalesUnitSymbol,
                        PurchaseUnit = d365Product.InventoryUnitSymbol,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _pricingRepository.CreateAsync(newPricing, ct);
                    result.Created++;
                }
                else
                {
                    existing.SalesPrice = d365Product.SalesPrice;
                    existing.PurchasePrice = d365Product.PurchasePrice;
                    existing.SalesUnit = d365Product.SalesUnitSymbol;
                    existing.PurchaseUnit = d365Product.InventoryUnitSymbol;
                    existing.UpdatedAt = now;
                    await _pricingRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing pricing Product={d365Product.ProductNumber}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync pricing {ProductNumber}", d365Product.ProductNumber);
            }
        }

        _logger.LogInformation("D365 pricing sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncDimensionsAsync(CancellationToken ct = default)
    {
        var result = new SyncResult();
        _logger.LogInformation("Starting D365 product dimension sync");

        List<D365ReleasedProduct> d365Products;
        try
        {
            d365Products = await _d365Client.GetAllAsync<D365ReleasedProduct>("ProductMasters", filter: null, select: null, top: null, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch products for dimension sync from D365");
            result.Errors = 1;
            result.ErrorMessages.Add($"Failed to fetch from D365: {ex.Message}");
            return result;
        }

        foreach (var d365Product in d365Products)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(d365Product.ProductNumber))
                {
                    result.Skipped++;
                    continue;
                }

                var product = await _productRepository.GetByD365ItemAsync(d365Product.ProductNumber, ct);
                if (product is null)
                {
                    result.Skipped++;
                    continue;
                }

                var now = DateTime.UtcNow;
                var existing = await _dimensionRepository.GetByProductIdAsync(product.Id, ct);
                if (existing is null)
                {
                    var newDim = new ProductDimension
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        D365ItemNumber = d365Product.ProductNumber,
                        Height = d365Product.GrossProductHeight,
                        Width = d365Product.GrossProductWidth,
                        Depth = d365Product.GrossDepth,
                        Volume = d365Product.ProductVolume,
                        NetWeight = d365Product.NetProductWeight,
                        UnitOfMeasure = d365Product.InventoryUnitSymbol,
                        CreatedAt = now,
                        UpdatedAt = now
                    };
                    await _dimensionRepository.CreateAsync(newDim, ct);
                    result.Created++;
                }
                else
                {
                    existing.Height = d365Product.GrossProductHeight;
                    existing.Width = d365Product.GrossProductWidth;
                    existing.Depth = d365Product.GrossDepth;
                    existing.Volume = d365Product.ProductVolume;
                    existing.NetWeight = d365Product.NetProductWeight;
                    existing.UnitOfMeasure = d365Product.InventoryUnitSymbol;
                    existing.UpdatedAt = now;
                    await _dimensionRepository.UpdateAsync(existing, ct);
                    result.Updated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                result.ErrorMessages.Add($"Error syncing dimension Product={d365Product.ProductNumber}: {ex.Message}");
                _logger.LogWarning(ex, "Failed to sync dimension {ProductNumber}", d365Product.ProductNumber);
            }
        }

        _logger.LogInformation("D365 dimension sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            result.Created, result.Updated, result.Skipped, result.Errors);

        return result;
    }

    public async Task<SyncResult> SyncAllDynamicEntitiesAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Starting full D365 dynamic entity sync");

        var combined = new SyncResult { EntityName = "All" };

        var tasks = new[]
        {
            SyncCategoriesAsync(ct),
            SyncCategoryAssignmentsAsync(ct),
            SyncAttributeValuesAsync(ct),
            SyncTranslationsAsync(ct),
            SyncLifecycleStatesAsync(ct),
            SyncPricingAsync(ct),
            SyncDimensionsAsync(ct),
            SyncDimensionTranslationsAsync("Color", ct),
            SyncDimensionTranslationsAsync("Size", ct),
            SyncDimensionTranslationsAsync("Style", ct),
            SyncDimensionTranslationsAsync("Configuration", ct)
        };

        var results = await Task.WhenAll(tasks);

        foreach (var r in results)
        {
            combined.Created += r.Created;
            combined.Updated += r.Updated;
            combined.Skipped += r.Skipped;
            combined.Errors += r.Errors;
            combined.ErrorMessages.AddRange(r.ErrorMessages);
        }

        _logger.LogInformation("Full D365 sync completed: Created={Created}, Updated={Updated}, Skipped={Skipped}, Errors={Errors}",
            combined.Created, combined.Updated, combined.Skipped, combined.Errors);

        return combined;
    }

    private static DateTime? ParseDateTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return DateTime.TryParse(value, out var dt) ? dt : null;
    }
}
