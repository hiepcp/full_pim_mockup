using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductAttributeValueRepository : IProductAttributeValueRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductAttributeValueRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "id, product_id, attribute_id, d365_product_number, text_value, integer_value, decimal_value, " +
        "datetime_value, boolean_value, currency_value, currency_code, unit_of_measure, created_at, updated_at";

    public Task<ProductAttributeValue?> GetAsync(Guid productId, Guid attributeId, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductAttributeValue?>(
            $"SELECT {SelectColumns} FROM product_attribute_values WHERE product_id = @productId AND attribute_id = @attributeId",
            new { productId, attributeId });

    public async Task<List<ProductAttributeValue>> GetByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductAttributeValue>(
            $"SELECT {SelectColumns} FROM product_attribute_values WHERE product_id = @productId",
            new { productId });
        return rows.ToList();
    }

    public async Task CreateAsync(ProductAttributeValue entity, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_attribute_values
                (id, product_id, attribute_id, d365_product_number, text_value, integer_value, decimal_value,
                 datetime_value, boolean_value, currency_value, currency_code, unit_of_measure, created_at, updated_at)
            VALUES
                (@Id, @ProductId, @AttributeId, @D365ProductNumber, @TextValue, @IntegerValue, @DecimalValue,
                 @DatetimeValue, @BooleanValue, @CurrencyValue, @CurrencyCode, @UnitOfMeasure, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, entity);
    }

    public async Task UpdateAsync(ProductAttributeValue entity, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_attribute_values SET
                d365_product_number = @D365ProductNumber,
                text_value = @TextValue,
                integer_value = @IntegerValue,
                decimal_value = @DecimalValue,
                datetime_value = @DatetimeValue,
                boolean_value = @BooleanValue,
                currency_value = @CurrencyValue,
                currency_code = @CurrencyCode,
                unit_of_measure = @UnitOfMeasure,
                updated_at = @UpdatedAt
            WHERE product_id = @ProductId AND attribute_id = @AttributeId;";
        await Connection.ExecuteAsync(sql, entity);
    }

    public void Dispose() => _connection?.Dispose();
}
