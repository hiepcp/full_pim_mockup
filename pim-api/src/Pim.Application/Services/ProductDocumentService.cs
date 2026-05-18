using Pim.Application.Dtos;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Entities;
using Pim.Domain.Enums;

namespace Pim.Application.Services;

public sealed class ProductDocumentService : IProductDocumentService
{
    private readonly IProductDocumentRepository _repository;

    public ProductDocumentService(IProductDocumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ProductDocumentResponse>> GetByProductAsync(string productId, CancellationToken ct = default)
        => (await _repository.GetByProductAsync(productId, ct)).Select(Map).ToList();

    public async Task<IReadOnlyList<ProductDocumentResponse>> GetByTypeAsync(string productId, DocumentType documentType, CancellationToken ct = default)
        => (await _repository.GetByTypeAsync(productId, documentType, ct)).Select(Map).ToList();

    public async Task<ProductDocumentResponse?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var document = await _repository.GetByIdAsync(id, ct);
        return document is null ? null : Map(document);
    }

    public async Task<ProductDocumentResponse> CreateAsync(CreateProductDocumentRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.ProductId))
            throw new ArgumentException("ProductId is required.");
        if (string.IsNullOrWhiteSpace(request.FileName))
            throw new ArgumentException("FileName is required.");

        var now = DateTime.UtcNow;
        var document = new ProductDocument
        {
            Id = Guid.NewGuid(),
            ProductId = Guid.Parse(request.ProductId),
            DocumentType = Enum.TryParse<DocumentType>(request.DocumentType, true, out var type) ? type : DocumentType.TechnicalSheet,
            Status = Enum.TryParse<ContentStatus>(request.Status, true, out var status) ? status : ContentStatus.Draft,
            Title = request.Title?.Trim() ?? string.Empty,
            FileName = request.FileName.Trim(),
            MimeType = request.MimeType?.Trim() ?? string.Empty,
            FileSizeBytes = request.FileSizeBytes,
            StorageContainer = request.StorageContainer?.Trim() ?? string.Empty,
            StorageBlobPath = request.StorageBlobPath?.Trim() ?? string.Empty,
            CdnUrl = request.CdnUrl?.Trim() ?? string.Empty,
            LanguageCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? "en" : request.LanguageCode.Trim(),
            Version = 1,
            UploadedByEmail = request.UploadedByEmail?.Trim() ?? string.Empty,
            UploadedByName = request.UploadedByName?.Trim() ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        };
        return Map(await _repository.CreateAsync(document, ct));
    }

    public async Task<bool> UpdateAsync(string id, UpdateProductDocumentRequest request, CancellationToken ct = default)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing is null) return false;

        existing.DocumentType = Enum.TryParse<DocumentType>(request.DocumentType, true, out var type) ? type : existing.DocumentType;
        existing.Status = Enum.TryParse<ContentStatus>(request.Status, true, out var status) ? status : existing.Status;
        existing.Title = request.Title?.Trim() ?? existing.Title;
        existing.LanguageCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? existing.LanguageCode : request.LanguageCode.Trim();
        existing.Version += 1;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, ct);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        => _repository.DeleteAsync(id, ct);

    private static ProductDocumentResponse Map(ProductDocument d) => new()
    {
        Id = d.Id.ToString(),
        ProductId = d.ProductId.ToString(),
        DocumentType = d.DocumentType.ToString(),
        Status = d.Status.ToString(),
        Title = d.Title,
        FileName = d.FileName,
        MimeType = d.MimeType,
        FileSizeBytes = d.FileSizeBytes,
        StorageContainer = d.StorageContainer,
        StorageBlobPath = d.StorageBlobPath,
        CdnUrl = d.CdnUrl,
        LanguageCode = d.LanguageCode,
        Version = d.Version,
        UploadedByEmail = d.UploadedByEmail,
        UploadedByName = d.UploadedByName,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
