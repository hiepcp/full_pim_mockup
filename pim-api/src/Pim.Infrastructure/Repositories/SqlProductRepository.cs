using System.Data;
using Dapper;
using MySqlConnector;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductRepository : IProductRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new MySqlConnection(_connectionString);

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<Product>(
            "SELECT * FROM products ORDER BY updated_at DESC");
        return rows.ToList();
    }

    public async Task<IReadOnlyList<Product>> SearchAsync(string? rangeName, string? masterNumber, ProductLevel? level, CancellationToken ct = default)
    {
        var sql = "SELECT * FROM products WHERE 1=1";
        if (!string.IsNullOrWhiteSpace(rangeName))
            sql += " AND range_name = @rangeName";
        if (!string.IsNullOrWhiteSpace(masterNumber))
            sql += " AND master_number = @masterNumber";
        if (level.HasValue)
            sql += " AND level = @level";
        sql += " ORDER BY updated_at DESC";

        var rows = await Connection.QueryAsync<Product>(sql, new
        {
            rangeName,
            masterNumber,
            level = level.HasValue ? (int)level.Value : (int?)null
        });
        return rows.ToList();
    }

    public Task<Product?> GetByIdAsync(string id, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<Product>(
            "SELECT * FROM products WHERE id = @id", new { id });

    public Task<Product?> GetByD365ItemAsync(string d365ItemNumber, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<Product>(
            "SELECT * FROM products WHERE d365_item_number = @d365ItemNumber", new { d365ItemNumber });

    public async Task<Product> CreateAsync(Product product, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO products
                (id, level, range_name, master_number, variant_number, name, description, designer,
                 d365_entity_name, d365_item_number, last_synced_at, created_at, updated_at)
            VALUES
                (@Id, @Level, @RangeName, @MasterNumber, @VariantNumber, @Name, @Description, @Designer,
                 @D365EntityName, @D365ItemNumber, @LastSyncedAt, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, product);
        return product;
    }

    public async Task<bool> UpdateAsync(Product product, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE products SET
                level = @Level,
                range_name = @RangeName,
                master_number = @MasterNumber,
                variant_number = @VariantNumber,
                name = @Name,
                description = @Description,
                designer = @Designer,
                d365_entity_name = @D365EntityName,
                d365_item_number = @D365ItemNumber,
                last_synced_at = @LastSyncedAt,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        var rows = await Connection.ExecuteAsync(sql, product);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await Connection.ExecuteAsync(
            "DELETE FROM products WHERE id = @id", new { id });
        return rows > 0;
    }

    public void Dispose() => _connection?.Dispose();
}
