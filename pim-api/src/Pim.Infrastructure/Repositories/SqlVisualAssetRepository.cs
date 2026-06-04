using System.Data;
using Dapper;
using Npgsql;
using Pim.Application.Interfaces.Repositories;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Infrastructure.Repositories;

public sealed class SqlVisualAssetRepository : IVisualAssetRepository, IDisposable
{
    private readonly string _connectionString;
    private IDbConnection? _connection;

    public SqlVisualAssetRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    private IDbConnection Connection => _connection ??= new NpgsqlConnection(_connectionString);

    public async Task<IReadOnlyList<VisualAsset>> GetByProductAsync(string productId, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<VisualAsset>(
            "SELECT * FROM visual_assets WHERE product_id = @productId ORDER BY created_at DESC",
            new { productId });
        return rows.ToList();
    }

    public async Task<IReadOnlyList<VisualAsset>> GetByTypeAsync(string productId, AssetType assetType, CancellationToken ct = default)
    {
        var rows = await Connection.QueryAsync<VisualAsset>(
            "SELECT * FROM visual_assets WHERE product_id = @productId AND asset_type = @assetType ORDER BY created_at DESC",
            new { productId, assetType = (int)assetType });
        return rows.ToList();
    }

    public Task<VisualAsset?> GetByIdAsync(string id, CancellationToken ct = default)
        => Connection.QueryFirstOrDefaultAsync<VisualAsset>(
            "SELECT * FROM visual_assets WHERE id = @id", new { id });

    public async Task<VisualAsset> CreateAsync(VisualAsset asset, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO visual_assets
                (id, product_id, asset_type, status, file_name, mime_type, file_size_bytes,
                 storage_container, storage_blob_path, cdn_url, width, height, duration_seconds,
                 alt_text, caption, uploaded_by_email, uploaded_by_name, created_at, updated_at)
            VALUES
                (@Id, @ProductId, @AssetType, @Status, @FileName, @MimeType, @FileSizeBytes,
                 @StorageContainer, @StorageBlobPath, @CdnUrl, @Width, @Height, @DurationSeconds,
                 @AltText, @Caption, @UploadedByEmail, @UploadedByName, @CreatedAt, @UpdatedAt);";
        await Connection.ExecuteAsync(sql, asset);
        return asset;
    }

    public async Task<bool> UpdateAsync(VisualAsset asset, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE visual_assets SET
                asset_type = @AssetType,
                status = @Status,
                alt_text = @AltText,
                caption = @Caption,
                updated_at = @UpdatedAt
            WHERE id = @Id;";
        var rows = await Connection.ExecuteAsync(sql, asset);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await Connection.ExecuteAsync(
            "DELETE FROM visual_assets WHERE id = @id", new { id });
        return rows > 0;
    }

    public async Task BulkArchiveByProductIdAsync(Guid productId, CancellationToken ct = default)
    {
        await Connection.ExecuteAsync(
            "UPDATE visual_assets SET status = @status, updated_at = NOW() WHERE product_id = @productId AND status != @status",
            new { productId, status = (int)AssetStatus.Archived });
    }

    public void Dispose() => _connection?.Dispose();
}
