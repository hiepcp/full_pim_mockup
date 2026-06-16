using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductCategoryAssignmentRepository : IProductCategoryAssignmentRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductCategoryAssignmentRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "id, product_id, category_id, hierarchy_id, d365_product_number, created_at";

    public Task<ProductCategoryAssignment?> GetAsync(Guid productId, Guid categoryId, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductCategoryAssignment?>(
            $"SELECT {SelectColumns} FROM product_category_assignments WHERE product_id = @productId AND category_id = @categoryId",
            new { productId, categoryId });

    public async Task<List<ProductCategoryAssignment>> GetByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductCategoryAssignment>(
            $"SELECT {SelectColumns} FROM product_category_assignments WHERE product_id = @productId",
            new { productId });
        return rows.ToList();
    }

    public async Task CreateAsync(ProductCategoryAssignment entity, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_category_assignments
                (id, product_id, category_id, hierarchy_id, d365_product_number, created_at)
            VALUES
                (@Id, @ProductId, @CategoryId, @HierarchyId, @D365ProductNumber, @CreatedAt);";
        await Connection.ExecuteAsync(sql, entity);
    }

    public async Task DeleteByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "DELETE FROM product_category_assignments WHERE product_id = @productId",
            new { productId });
    }

    public void Dispose() => _connection?.Dispose();
}
