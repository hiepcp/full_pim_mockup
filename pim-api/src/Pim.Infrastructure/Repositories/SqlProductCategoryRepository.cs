using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductCategoryRepository : IProductCategoryRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductCategoryRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "pc.id, pc.hierarchy_id, pc.category_code, pc.category_name, pc.friendly_name, pc.description, " +
        "pc.keywords, pc.parent_category_code, pc.external_id, pc.is_tangible, pc.level, pc.sort_order, " +
        "pc.d365_category_id, pc.created_at, pc.updated_at";

    public Task<ProductCategory?> GetByCategoryCodeAsync(string hierarchyId, string categoryCode, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductCategory?>(
            $@"SELECT {SelectColumns}
               FROM product_categories pc
               JOIN product_category_hierarchies pch ON pch.id = pc.hierarchy_id
               WHERE pch.d365_hierarchy_id = @hierarchyId AND pc.category_code = @categoryCode",
            new { hierarchyId, categoryCode });

    public async Task<List<ProductCategory>> GetByHierarchyIdAsync(Guid hierarchyId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductCategory>(
            $@"SELECT {SelectColumns}
               FROM product_categories pc
               WHERE pc.hierarchy_id = @hierarchyId
               ORDER BY pc.level, pc.sort_order",
            new { hierarchyId });
        return rows.ToList();
    }

    public async Task CreateAsync(ProductCategory entity, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_categories
                (id, hierarchy_id, category_code, category_name, friendly_name, description, keywords,
                 parent_category_code, external_id, is_tangible, level, sort_order, d365_category_id,
                 created_at, updated_at)
            VALUES
                (@Id, @HierarchyId, @CategoryCode, @CategoryName, @FriendlyName, @Description, @Keywords,
                 @ParentCategoryCode, @ExternalId, @IsTangible, @Level, @SortOrder, @D365CategoryId,
                 @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, entity);
    }

    public async Task UpdateAsync(ProductCategory entity, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_categories SET
                hierarchy_id = @HierarchyId,
                category_name = @CategoryName,
                friendly_name = @FriendlyName,
                description = @Description,
                keywords = @Keywords,
                parent_category_code = @ParentCategoryCode,
                external_id = @ExternalId,
                is_tangible = @IsTangible,
                level = @Level,
                sort_order = @SortOrder,
                d365_category_id = @D365CategoryId,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        await Connection.ExecuteAsync(sql, entity);
    }

    public void Dispose() => _connection?.Dispose();
}
