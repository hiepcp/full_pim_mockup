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

    private const string SelectColumns =
        "id, name, range_name, master_number, variant_number, description, usp, status, " +
        "completeness_score, d365_item_number, is_deleted, deleted_at, disabled_at, disabled_reason, " +
        "last_synced_at, created_at, updated_at";

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<Product>(
            $"SELECT {SelectColumns} FROM products WHERE is_deleted = false ORDER BY updated_at DESC");
        return rows.ToList();
    }

    public async Task<(IReadOnlyList<Product> Items, int Total)> GetPagedAsync(int start, int end, CancellationToken ct = default)
    {
        var limit = end - start;
        var offset = start;

        var total = await Connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM products WHERE is_deleted = false");

        var rows = (await Connection.QueryAsync<Product>(
            $"SELECT {SelectColumns} FROM products WHERE is_deleted = false ORDER BY updated_at DESC LIMIT @limit OFFSET @offset",
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
        var sql = $"SELECT {SelectColumns} FROM products WHERE is_deleted = false";
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
            $"SELECT {SelectColumns} FROM products WHERE id = @id::uuid", new { id });

    public Task<Product?> GetByD365ItemAsync(string d365ItemNumber, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<Product>(
            $"SELECT {SelectColumns} FROM products WHERE d365_item_number = @d365ItemNumber", new { d365ItemNumber });

    public async Task<Product> CreateAsync(Product product, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO products
                (id, name, range_name, master_number, variant_number, description, usp, status,
                 completeness_score, d365_item_number, is_deleted, deleted_at, disabled_at, disabled_reason,
                 last_synced_at, created_at, updated_at)
            VALUES
                (@Id, @Name, @RangeName, @MasterNumber, @VariantNumber, @Description, @Usp, @Status,
                 @CompletenessScore, @D365ItemNumber, @IsDeleted, @DeletedAt, @DisabledAt, @DisabledReason,
                 @LastSyncedAt, @CreatedAt, @UpdatedAt);";
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
                is_deleted = @IsDeleted,
                deleted_at = @DeletedAt,
                disabled_at = @DisabledAt,
                disabled_reason = @DisabledReason,
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

    public async Task BulkArchiveVisualAssetsAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE visual_assets SET status = @status, updated_at = NOW() WHERE product_id = @productId AND status != @status",
            new { productId, status = (int)AssetStatus.Archived });
    }

    public async Task BulkArchiveTextContentsAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE text_contents SET status = @status, updated_at = NOW() WHERE product_id = @productId AND status != @status",
            new { productId, status = (int)ContentStatus.Archived });
    }

    public async Task BulkArchiveProductDocumentsAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE product_documents SET status = @status, updated_at = NOW() WHERE product_id = @productId AND status != @status",
            new { productId, status = (int)ContentStatus.Archived });
    }

    public void Dispose() => _connection?.Dispose();
}
