using System.Data;
using Dapper;
using MySqlConnector;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlTextContentRepository : ITextContentRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlTextContentRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new MySqlConnection(_connectionString);

    public async Task<IReadOnlyList<TextContent>> GetByProductAsync(string productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<TextContent>(
            "SELECT * FROM text_contents WHERE product_id = @productId ORDER BY content_type, language_code",
            new { productId });
        return rows.ToList();
    }

    public async Task<IReadOnlyList<TextContent>> GetByTypeAsync(string productId, TextContentType contentType, string? languageCode, CancellationToken ct = default)
    {
        var sql = "SELECT * FROM text_contents WHERE product_id = @productId AND content_type = @contentType";
        if (!string.IsNullOrWhiteSpace(languageCode))
            sql += " AND language_code = @languageCode";
        sql += " ORDER BY version DESC";

        var rows = await Connection.QueryAsync<TextContent>(sql, new
        {
            productId,
            contentType = (int)contentType,
            languageCode
        });
        return rows.ToList();
    }

    public Task<TextContent?> GetByIdAsync(string id, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<TextContent>(
            "SELECT * FROM text_contents WHERE id = @id", new { id });

    public async Task<TextContent> CreateAsync(TextContent content, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO text_contents
                (id, product_id, content_type, status, language_code, title, body, version,
                 approved_by_email, approved_at, author_email, author_name, created_at, updated_at)
            VALUES
                (@Id, @ProductId, @ContentType, @Status, @LanguageCode, @Title, @Body, @Version,
                 @ApprovedByEmail, @ApprovedAt, @AuthorEmail, @AuthorName, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, content);
        return content;
    }

    public async Task<bool> UpdateAsync(TextContent content, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE text_contents SET
                content_type = @ContentType,
                status = @Status,
                language_code = @LanguageCode,
                title = @Title,
                body = @Body,
                version = @Version,
                approved_by_email = @ApprovedByEmail,
                approved_at = @ApprovedAt,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        var rows = await Connection.ExecuteAsync(sql, content);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await Connection.ExecuteAsync(
            "DELETE FROM text_contents WHERE id = @id", new { id });
        return rows > 0;
    }

    public void Dispose() => _connection?.Dispose();
}
