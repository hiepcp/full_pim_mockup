using Pim.Domain.Entities;

namespace Pim.Application.Interfaces.Repositories;

public interface IProductCategoryRepository
{
    Task<ProductCategory?> GetByCategoryCodeAsync(string hierarchyId, string categoryCode, CancellationToken ct = default);
    Task<List<ProductCategory>> GetByHierarchyIdAsync(Guid hierarchyId, CancellationToken ct = default);
    Task CreateAsync(ProductCategory entity, CancellationToken ct = default);
    Task UpdateAsync(ProductCategory entity, CancellationToken ct = default);
}

public interface IProductCategoryHierarchyRepository
{
    Task<ProductCategoryHierarchy?> GetByD365IdAsync(string d365HierarchyId, CancellationToken ct = default);
    Task<ProductCategoryHierarchy?> GetByNameAsync(string hierarchyName, CancellationToken ct = default);
    Task CreateAsync(ProductCategoryHierarchy entity, CancellationToken ct = default);
    Task UpdateAsync(ProductCategoryHierarchy entity, CancellationToken ct = default);
}

public interface IProductCategoryAssignmentRepository
{
    Task<ProductCategoryAssignment?> GetAsync(Guid productId, Guid categoryId, CancellationToken ct = default);
    Task<List<ProductCategoryAssignment>> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task CreateAsync(ProductCategoryAssignment entity, CancellationToken ct = default);
    Task DeleteByProductIdAsync(Guid productId, CancellationToken ct = default);
}
