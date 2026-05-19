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

    public async Task<(IReadOnlyList<ProductVariant> Items, int Total)> GetPagedAsync(int start, int end, CancellationToken ct = default)
    {
        var limit = end - start;
        var offset = start;
        var total = await Connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM product_variants");
        var rows = await Connection.QueryAsync<ProductVariant>(
            "SELECT id, product_master_number, variant_number, product_name, color_id, size_id, style_id, configuration_id, range_name, status, created_at, updated_at FROM product_variants ORDER BY product_master_number, variant_number LIMIT @limit OFFSET @offset",
            new { limit, offset });
        return (rows.ToList(), total);
    }

    public async Task<IReadOnlyList<ProductVariant>> GetByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductVariant>(
            "SELECT id, product_master_number, variant_number, product_name, color_id, size_id, style_id, configuration_id, range_name, status, created_at, updated_at FROM product_variants WHERE product_master_number = @masterNumber ORDER BY variant_number",
            new { masterNumber });
        return rows.ToList();
    }

    public Task<ProductVariant?> GetByVariantNumberAsync(string variantNumber, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductVariant>(
            "SELECT id, product_master_number, variant_number, product_name, color_id, size_id, style_id, configuration_id, range_name, status, created_at, updated_at FROM product_variants WHERE variant_number = @variantNumber",
            new { variantNumber });

    public async Task<ProductVariant> CreateAsync(ProductVariant variant, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_variants
                (id, product_master_number, variant_number, product_name, color_id, size_id, style_id, configuration_id, range_name, status, created_at, updated_at)
            VALUES
                (@Id, @ProductMasterNumber, @VariantNumber, @ProductName, @ColorId, @SizeId, @StyleId, @ConfigurationId, @RangeName, @Status, @CreatedAt, @UpdatedAt);";
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
                updated_at = @UpdatedAt
            WHERE variant_number = @VariantNumber;";
        var rows = await Connection.ExecuteAsync(sql, variant);
        return rows > 0;
    }

    public Task<int> GetCountByMasterNumberAsync(string masterNumber, CancellationToken ct = default)
        => Connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM product_variants WHERE product_master_number = @masterNumber",
            new { masterNumber });

    public void Dispose() => _connection?.Dispose();
}
