using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductVariantRepository : IProductVariantRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductVariantRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "id, product_master_number, variant_number, product_name, color_id, size_id, style_id, " +
        "configuration_id, range_name, status, product_id, is_deleted, deleted_at, created_at, updated_at";

    public async Task<(IReadOnlyList<ProductVariant> Items, int Total)> GetPagedAsync(int start, int end, CancellationToken ct = default)
    {
        var limit = end - start;
        var offset = start;
        var total = await Connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM product_variants WHERE is_deleted = false");
        var rows = await Connection.QueryAsync<ProductVariant>(
            $"SELECT {SelectColumns} FROM product_variants WHERE is_deleted = false ORDER BY product_master_number, variant_number LIMIT @limit OFFSET @offset",
            new { limit, offset });
        return (rows.ToList(), total);
    }

    public async Task<IReadOnlyList<ProductVariant>> GetByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductVariant>(
            $"SELECT {SelectColumns} FROM product_variants WHERE product_master_number = @masterNumber AND is_deleted = false ORDER BY variant_number",
            new { masterNumber });
        return rows.ToList();
    }

    public Task<ProductVariant?> GetByVariantNumberAsync(string variantNumber, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductVariant>(
            $"SELECT {SelectColumns} FROM product_variants WHERE variant_number = @variantNumber",
            new { variantNumber });

    public async Task<ProductVariant> CreateAsync(ProductVariant variant, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_variants
                (id, product_master_number, variant_number, product_name, color_id, size_id, style_id,
                 configuration_id, range_name, status, product_id, is_deleted, deleted_at, created_at, updated_at)
            VALUES
                (@Id, @ProductMasterNumber, @VariantNumber, @ProductName, @ColorId, @SizeId, @StyleId,
                 @ConfigurationId, @RangeName, @Status, @ProductId, @IsDeleted, @DeletedAt, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, variant);
        return variant;
    }

    public async Task<bool> UpdateAsync(ProductVariant variant, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_variants SET
                product_master_number = @ProductMasterNumber,
                product_name = @ProductName,
                color_id = @ColorId,
                size_id = @SizeId,
                style_id = @StyleId,
                configuration_id = @ConfigurationId,
                range_name = @RangeName,
                status = @Status,
                product_id = @ProductId,
                is_deleted = @IsDeleted,
                deleted_at = @DeletedAt,
                updated_at = @UpdatedAt
            WHERE variant_number = @VariantNumber;";
        var rows = await Connection.ExecuteAsync(sql, variant);
        return rows > 0;
    }

    public Task<int> GetCountByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
        => Connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM product_variants WHERE product_master_number = @masterNumber AND is_deleted = false",
            new { masterNumber });

    public async Task BulkDisableByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE product_variants SET status = 1, updated_at = NOW() WHERE product_master_number = @masterNumber",
            new { masterNumber });
    }

    public async Task BulkSoftDeleteByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE product_variants SET is_deleted = true, deleted_at = NOW() WHERE product_master_number = @masterNumber",
            new { masterNumber });
    }

    public async Task BulkReEnableByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE product_variants SET status = 0, updated_at = NOW() WHERE product_master_number = @masterNumber AND is_deleted = false",
            new { masterNumber });
    }

    public void Dispose() => _connection?.Dispose();
}
