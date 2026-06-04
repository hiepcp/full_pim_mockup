using System.Data;
using Dapper;
using Npgsql;
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

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    public async Task<(IReadOnlyList<TextContent> Items, int Total)> GetPagedAsync(int start, int end, string? sort, string? order, string? productId, string? contentType, string? status, string? languageCode, CancellationToken ct = default)
    {
        var conditions = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(productId))
        {
            conditions.Add("product_id = @productId");
            parameters.Add("productId", Guid.Parse(productId));
        }
        if (!string.IsNullOrWhiteSpace(contentType) && Enum.TryParse<TextContentType>(contentType, true, out var ct2))
        {
            conditions.Add("content_type = @contentType");
            parameters.Add("contentType", (int)ct2);
        }
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ContentStatus>(status, true, out var st))
        {
            conditions.Add("status = @status");
            parameters.Add("status", (int)st);
        }
        if (!string.IsNullOrWhiteSpace(languageCode))
        {
            conditions.Add("language_code = @languageCode");
            parameters.Add("languageCode", languageCode);
        }

        var where = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";

        var allowedSorts = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { "id", "title", "content_type", "status", "language_code", "version", "author_name", "created_at", "updated_at" };
        var sortCol = allowedSorts.Contains(sort ?? "") ? sort! : "updated_at";
        var sortDir = string.Equals(order, "asc", StringComparison.OrdinalIgnoreCase) ? "ASC" : "DESC";

        var countSql = $"SELECT COUNT(*) FROM text_contents {where}";
        var total = await Connection.ExecuteScalarAsync<int>(countSql, parameters);

        var limit = end - start;
        parameters.Add("limit", limit);
        parameters.Add("offset", start);

        var dataSql = $"SELECT * FROM text_contents {where} ORDER BY {sortCol} {sortDir} LIMIT @limit OFFSET @offset";
        var rows = await Connection.QueryAsync<TextContent>(dataSql, parameters);

        return (rows.ToList(), total);
    }

    public async Task<IReadOnlyList<TextContent>> GetByProductAsync(string productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<TextContent>(
            "SELECT * FROM text_contents WHERE product_id = @productId ORDER BY content_type, language_code",
            new { productId = Guid.Parse(productId) });
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
            productId = Guid.Parse(productId),
            contentType = (int)contentType,
            languageCode
        });
        return rows.ToList();
    }

    public Task<TextContent?> GetByIdAsync(string id, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<TextContent>(
            "SELECT * FROM text_contents WHERE id = @id", new { id = Guid.Parse(id) });

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
            "DELETE FROM text_contents WHERE id = @id", new { id = Guid.Parse(id) });
        return rows > 0;
    }

    public async Task BulkArchiveByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE text_contents SET status = @status, updated_at = NOW() WHERE product_id = @productId AND status != @status",
            new { productId, status = (int)ContentStatus.Archived });
    }

    public void Dispose() => _connection?.Dispose();
}
