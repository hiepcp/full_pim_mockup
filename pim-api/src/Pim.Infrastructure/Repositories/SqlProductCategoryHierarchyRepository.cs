using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductCategoryHierarchyRepository : IProductCategoryHierarchyRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductCategoryHierarchyRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "id, hierarchy_name, description, d365_hierarchy_id, is_active, created_at, updated_at";

    public Task<ProductCategoryHierarchy?> GetByD365IdAsync(string d365HierarchyId, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductCategoryHierarchy?>(
            $"SELECT {SelectColumns} FROM product_category_hierarchies WHERE d365_hierarchy_id = @d365HierarchyId",
            new { d365HierarchyId });

    public Task<ProductCategoryHierarchy?> GetByNameAsync(string hierarchyName, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductCategoryHierarchy?>(
            $"SELECT {SelectColumns} FROM product_category_hierarchies WHERE hierarchy_name = @hierarchyName",
            new { hierarchyName });

    public async Task CreateAsync(ProductCategoryHierarchy entity, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_category_hierarchies
                (id, hierarchy_name, description, d365_hierarchy_id, is_active, created_at, updated_at)
            VALUES
                (@Id, @HierarchyName, @Description, @D365HierarchyId, @IsActive, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, entity);
    }

    public async Task UpdateAsync(ProductCategoryHierarchy entity, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_category_hierarchies SET
                hierarchy_name = @HierarchyName,
                description = @Description,
                d365_hierarchy_id = @D365HierarchyId,
                is_active = @IsActive,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        await Connection.ExecuteAsync(sql, entity);
    }

    public void Dispose() => _connection?.Dispose();
}
