using System.Data;
using Dapper;
using Npgsql;
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

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<Product>(
            "SELECT id, name, range_name, master_number, variant_number, description, usp, status, completeness_score, d365_item_number, last_synced_at, created_at, updated_at FROM products ORDER BY updated_at DESC");
        return rows.ToList();
    }

    public async Task<(IReadOnlyList<Product> Items, int Total)> GetPagedAsync(int start, int end, CancellationToken ct = default)
    {
        var limit = end - start;
        var offset = start;

        var total = await Connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM products");

        var rows = (await Connection.QueryAsync<Product>(
            "SELECT id, name, range_name, master_number, variant_number, description, usp, status, completeness_score, d365_item_number, last_synced_at, created_at, updated_at FROM products ORDER BY updated_at DESC LIMIT @limit OFFSET @offset",
            new { limit, offset })).ToList();

        if (rows.Count > 0)
        {
            var itemNumbers = rows.Select(r => r.D365ItemNumber).Where(x => !string.IsNullOrEmpty(x)).ToList();
            var counts = await Connection.QueryAsync(
                "SELECT product_master_number, COUNT(*)::int as count FROM product_variants WHERE product_master_number = ANY(@itemNumbers) GROUP BY product_master_number",
                new { itemNumbers });
            var countDict = counts.ToDictionary(c => (string)c.product_master_number, c => (int)c.count);
            foreach (var row in rows)
            {
                if (!string.IsNullOrEmpty(row.D365ItemNumber) && countDict.TryGetValue(row.D365ItemNumber, out var count))
                    row.VariantCount = count;
            }
        }

        return (rows, total);
    }

    public async Task<IReadOnlyList<Product>> SearchAsync(string? rangeName, string? masterNumber, ProductLevel? level, CancellationToken ct = default)
    {
        var sql = "SELECT id, name, range_name, master_number, variant_number, description, usp, status, completeness_score, d365_item_number, last_synced_at, created_at, updated_at FROM products WHERE 1=1";
        if (!string.IsNullOrWhiteSpace(rangeName))
            sql += " AND range_name ILIKE @rangeName";
        if (!string.IsNullOrWhiteSpace(masterNumber))
            sql += " AND master_number = @masterNumber";
        sql += " ORDER BY updated_at DESC";

        var rows = await Connection.QueryAsync<Product>(sql, new
        {
            rangeName = $"%{rangeName}%",
            masterNumber
        });
        return rows.ToList();
    }

    public Task<Product?> GetByIdAsync(string id, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<Product>(
            "SELECT id, name, range_name, master_number, variant_number, description, usp, status, completeness_score, d365_item_number, last_synced_at, created_at, updated_at FROM products WHERE id = @id::uuid", new { id });

    public Task<Product?> GetByD365ItemAsync(string d365ItemNumber, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<Product>(
            "SELECT id, name, range_name, master_number, variant_number, description, usp, status, completeness_score, d365_item_number, last_synced_at, created_at, updated_at FROM products WHERE d365_item_number = @d365ItemNumber", new { d365ItemNumber });

    public async Task<Product> CreateAsync(Product product, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO products
                (id, name, range_name, master_number, variant_number, description, usp, status, completeness_score, d365_item_number, last_synced_at, created_at, updated_at)
            VALUES
                (@Id, @Name, @RangeName, @MasterNumber, @VariantNumber, @Description, @Usp, @Status, @CompletenessScore, @D365ItemNumber, @LastSyncedAt, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, product);
        return product;
    }

    public async Task<bool> UpdateAsync(Product product, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE products SET
                name = @Name,
                range_name = @RangeName,
                master_number = @MasterNumber,
                variant_number = @VariantNumber,
                description = @Description,
                usp = @Usp,
                status = @Status,
                completeness_score = @CompletenessScore,
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
            "DELETE FROM products WHERE id = @id::uuid", new { id });
        return rows > 0;
    }

    public void Dispose() => _connection?.Dispose();
}
