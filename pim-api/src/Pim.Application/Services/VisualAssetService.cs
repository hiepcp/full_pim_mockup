using Pim.Application.Dtos;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Services;

public sealed class VisualAssetService : IVisualAssetService
{
    private readonly IVisualAssetRepository _repository;

    public VisualAssetService(IVisualAssetRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<VisualAssetResponse>> GetByProductAsync(string productId, CancellationToken ct = default)
        => (await _repository.GetByProductAsync(productId, ct)).Select(Map).ToList();

    public async Task<IReadOnlyList<VisualAssetResponse>> GetByTypeAsync(string productId, AssetType assetType, CancellationToken ct = default)
        => (await _repository.GetByTypeAsync(productId, assetType, ct)).Select(Map).ToList();

    public async Task<VisualAssetResponse?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var asset = await _repository.GetByIdAsync(id, ct);
        return asset is null ? null : Map(asset);
    }

    public async Task<VisualAssetResponse> CreateAsync(CreateVisualAssetRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.ProductId))
            throw new ArgumentException("ProductId is required.");
        if (string.IsNullOrWhiteSpace(request.FileName))
            throw new ArgumentException("FileName is required.");

        var now = DateTime.UtcNow;
        var asset = new VisualAsset
        {
            Id = Guid.NewGuid(),
            ProductId = Guid.Parse(request.ProductId),
            AssetType = Enum.TryParse<AssetType>(request.AssetType, true, out var type) ? type : AssetType.Packshot,
            Status = Enum.TryParse<AssetStatus>(request.Status, true, out var status) ? status : AssetStatus.Draft,
            FileName = request.FileName.Trim(),
            MimeType = request.MimeType?.Trim() ?? string.Empty,
            FileSizeBytes = request.FileSizeBytes,
            StorageContainer = request.StorageContainer?.Trim() ?? string.Empty,
            StorageBlobPath = request.StorageBlobPath?.Trim() ?? string.Empty,
            CdnUrl = request.CdnUrl?.Trim() ?? string.Empty,
            Width = request.Width,
            Height = request.Height,
            DurationSeconds = request.DurationSeconds,
            AltText = request.AltText?.Trim() ?? string.Empty,
            Caption = request.Caption?.Trim() ?? string.Empty,
            UploadedByEmail = request.UploadedByEmail?.Trim() ?? string.Empty,
            UploadedByName = request.UploadedByName?.Trim() ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        };
        return Map(await _repository.CreateAsync(asset, ct));
    }

    public async Task<bool> UpdateAsync(string id, UpdateVisualAssetRequest request, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing is null) return false;

        existing.AssetType = Enum.TryParse<AssetType>(request.AssetType, true, out var type) ? type : existing.AssetType;
        existing.Status = Enum.TryParse<AssetStatus>(request.Status, true, out var status) ? status : existing.Status;
        existing.AltText = request.AltText?.Trim() ?? existing.AltText;
        existing.Caption = request.Caption?.Trim() ?? existing.Caption;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, ct);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        => _repository.DeleteAsync(id, ct);

    private static VisualAssetResponse Map(VisualAsset a) => new()
    {
        Id = a.Id.ToString(),
        ProductId = a.ProductId.ToString(),
        AssetType = a.AssetType.ToString(),
        Status = a.Status.ToString(),
        FileName = a.FileName,
        MimeType = a.MimeType,
        FileSizeBytes = a.FileSizeBytes,
        StorageContainer = a.StorageContainer,
        StorageBlobPath = a.StorageBlobPath,
        CdnUrl = a.CdnUrl,
        Width = a.Width,
        Height = a.Height,
        DurationSeconds = a.DurationSeconds,
        AltText = a.AltText,
        Caption = a.Caption,
        UploadedByEmail = a.UploadedByEmail,
        UploadedByName = a.UploadedByName,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
}
