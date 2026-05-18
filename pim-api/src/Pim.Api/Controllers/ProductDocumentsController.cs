using Microsoft.AspNetCore.Mvc;
using Pim.Api.Common;
using Pim.Application.Dtos;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Enums;

namespace Pim.Api.Controllers;

[ApiController]
[Route("api/product-documents")]
public sealed class ProductDocumentsController : ControllerBase
{
    private readonly IProductDocumentService _service;

    public ProductDocumentsController(IProductDocumentService service)
    {
        _service = service;
    }

    [HttpGet("by-product/{productId}")]
    public async Task<IActionResult> GetByProduct(string productId, [FromQuery] string? documentType, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(documentType))
        {
            if (!Enum.TryParse<DocumentType>(documentType, true, out var type))
                return BadRequest(ApiResponse<string>.Fail("Invalid document type."));
            var byType = await _service.GetByTypeAsync(productId, type, ct);
            return Ok(ApiResponse<IReadOnlyList<ProductDocumentResponse>>.Ok(byType));
        }

        var result = await _service.GetByProductAsync(productId, ct);
        return Ok(ApiResponse<IReadOnlyList<ProductDocumentResponse>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Product document not found."));
        return Ok(ApiResponse<ProductDocumentResponse>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDocumentRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<ProductDocumentResponse>.Ok(result, "Product document created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateProductDocumentRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        if (!updated)
            return NotFound(ApiResponse<string>.Fail("Product document not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Product document updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Fail("Product document not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Product document deleted successfully."));
    }
}
