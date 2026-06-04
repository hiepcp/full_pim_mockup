using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlProductDocumentRepository : IProductDocumentRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlProductDocumentRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    public async Task<IReadOnlyList<ProductDocument>> GetByProductAsync(string productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductDocument>(
            "SELECT * FROM product_documents WHERE product_id = @productId ORDER BY created_at DESC",
            new { productId });
        return rows.ToList();
    }

    public async Task<IReadOnlyList<ProductDocument>> GetByTypeAsync(string productId, DocumentType documentType, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<ProductDocument>(
            "SELECT * FROM product_documents WHERE product_id = @productId AND document_type = @documentType ORDER BY version DESC",
            new { productId, documentType = (int)documentType });
        return rows.ToList();
    }

    public Task<ProductDocument?> GetByIdAsync(string id, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<ProductDocument>(
            "SELECT * FROM product_documents WHERE id = @id", new { id });

    public async Task<ProductDocument> CreateAsync(ProductDocument document, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO product_documents
                (id, product_id, document_type, status, title, file_name, mime_type, file_size_bytes,
                 storage_container, storage_blob_path, cdn_url, language_code, version,
                 uploaded_by_email, uploaded_by_name, created_at, updated_at)
            VALUES
                (@Id, @ProductId, @DocumentType, @Status, @Title, @FileName, @MimeType, @FileSizeBytes,
                 @StorageContainer, @StorageBlobPath, @CdnUrl, @LanguageCode, @Version,
                 @UploadedByEmail, @UploadedByName, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, document);
        return document;
    }

    public async Task<bool> UpdateAsync(ProductDocument document, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE product_documents SET
                document_type = @DocumentType,
                status = @Status,
                title = @Title,
                language_code = @LanguageCode,
                version = @Version,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        var rows = await Connection.ExecuteAsync(sql, document);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await Connection.ExecuteAsync(
            "DELETE FROM product_documents WHERE id = @id", new { id });
        return rows > 0;
    }

    public async Task BulkArchiveByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE product_documents SET status = @status, updated_at = NOW() WHERE product_id = @productId AND status != @status",
            new { productId, status = (int)ContentStatus.Archived });
    }

    public void Dispose() => _connection?.Dispose();
}
