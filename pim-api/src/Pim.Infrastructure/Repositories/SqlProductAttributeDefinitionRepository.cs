using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductAttributeDefinitionRepository : IProductAttributeDefinitionRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductAttributeDefinitionRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    private const string SelectColumns =
        "id, attribute_name, attribute_type_name, data_type, description, is_enumeration, is_required, " +
        "default_value, d365_attribute_id, created_at, updated_at";

    public Task<ProductAttributeDefinition?> GetByNameAsync(string attributeName, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductAttributeDefinition?>(
            $"SELECT {SelectColumns} FROM product_attribute_definitions WHERE attribute_name = @attributeName",
            new { attributeName });

    public async Task<List<ProductAttributeDefinition>> GetAllAsync(CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductAttributeDefinition>(
            $"SELECT {SelectColumns} FROM product_attribute_definitions ORDER BY attribute_name");
        return rows.ToList();
    }

    public async Task CreateAsync(ProductAttributeDefinition entity, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_attribute_definitions
                (id, attribute_name, attribute_type_name, data_type, description, is_enumeration, is_required,
                 default_value, d365_attribute_id, created_at, updated_at)
            VALUES
                (@Id, @AttributeName, @AttributeTypeName, @DataType, @Description, @IsEnumeration, @IsRequired,
                 @DefaultValue, @D365AttributeId, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, entity);
    }

    public async Task UpdateAsync(ProductAttributeDefinition entity, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_attribute_definitions SET
                attribute_name = @AttributeName,
                attribute_type_name = @AttributeTypeName,
                data_type = @DataType,
                description = @Description,
                is_enumeration = @IsEnumeration,
                is_required = @IsRequired,
                default_value = @DefaultValue,
                d365_attribute_id = @D365AttributeId,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        await Connection.ExecuteAsync(sql, entity);
    }

    public void Dispose() => _connection?.Dispose();
}
