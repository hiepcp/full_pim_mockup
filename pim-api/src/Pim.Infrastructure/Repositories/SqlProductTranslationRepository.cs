using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductTranslationRepository : IProductTranslationRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductTranslationRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "id, product_id, d365_product_number, language_id, product_name, description, created_at, updated_at";

    public Task<ProductTranslation?> GetAsync(Guid productId, string languageId, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductTranslation?>(
            $"SELECT {SelectColumns} FROM product_translations WHERE product_id = @productId AND language_id = @languageId",
            new { productId, languageId });

    public async Task<List<ProductTranslation>> GetByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductTranslation>(
            $"SELECT {SelectColumns} FROM product_translations WHERE product_id = @productId ORDER BY language_id",
            new { productId });
        return rows.ToList();
    }

    public async Task CreateAsync(ProductTranslation entity, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_translations
                (id, product_id, d365_product_number, language_id, product_name, description, created_at, updated_at)
            VALUES
                (@Id, @ProductId, @D365ProductNumber, @LanguageId, @ProductName, @Description, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, entity);
    }

    public async Task UpdateAsync(ProductTranslation entity, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_translations SET
                d365_product_number = @D365ProductNumber,
                product_name = @ProductName,
                description = @Description,
                updated_at = @UpdatedAt
            WHERE product_id = @ProductId AND language_id = @LanguageId;";
        await Connection.ExecuteAsync(sql, entity);
    }

    public void Dispose() => _connection?.Dispose();
}
