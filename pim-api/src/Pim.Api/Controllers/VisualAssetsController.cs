using Microsoft.AspNetCore.Mvc;
using Pim.Api.Common;
using Pim.Application.Dtos;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Enums;

namespace Pim.Api.Controllers;

[ApiController]
[Route("api/visual-assets")]
public sealed class VisualAssetsController : ControllerBase
{
    private readonly IVisualAssetService _service;

    public VisualAssetsController(IVisualAssetService service)
    {
        _service = service;
    }

    [HttpGet("by-product/{productId}")]
    public async Task<IActionResult> GetByProduct(string productId, [FromQuery] string? assetType, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(assetType))
        {
            if (!Enum.TryParse<AssetType>(assetType, true, out var type))
                return BadRequest(ApiResponse<string>.Fail("Invalid asset type."));
            var byType = await _service.GetByTypeAsync(productId, type, ct);
            return Ok(ApiResponse<IReadOnlyList<VisualAssetResponse>>.Ok(byType));
        }

        var result = await _service.GetByProductAsync(productId, ct);
        return Ok(ApiResponse<IReadOnlyList<VisualAssetResponse>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Visual asset not found."));
        return Ok(ApiResponse<VisualAssetResponse>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVisualAssetRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<VisualAssetResponse>.Ok(result, "Visual asset created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateVisualAssetRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        if (!updated)
            return NotFound(ApiResponse<string>.Fail("Visual asset not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Visual asset updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Fail("Visual asset not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Visual asset deleted successfully."));
    }
}
