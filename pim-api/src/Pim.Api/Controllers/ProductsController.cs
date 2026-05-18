using Microsoft.AspNetCore.Mvc;
using Pim.Api.Common;
using Pim.Application.Dtos;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Enums;

namespace Pim.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(ApiResponse<IReadOnlyList<ProductResponse>>.Ok(result));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? rangeName, [FromQuery] string? masterNumber, [FromQuery] string? level, CancellationToken ct)
    {
        ProductLevel? parsedLevel = null;
        if (!string.IsNullOrWhiteSpace(level))
        {
            if (!Enum.TryParse<ProductLevel>(level, true, out var lvl))
                return BadRequest(ApiResponse<string>.Fail("Invalid product level."));
            parsedLevel = lvl;
        }

        var result = await _service.SearchAsync(rangeName, masterNumber, parsedLevel, ct);
        return Ok(ApiResponse<IReadOnlyList<ProductResponse>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));
        return Ok(ApiResponse<ProductResponse>.Ok(result));
    }

    [HttpGet("by-d365/{d365ItemNumber}")]
    public async Task<IActionResult> GetByD365Item(string d365ItemNumber, CancellationToken ct)
    {
        var result = await _service.GetByD365ItemAsync(d365ItemNumber, ct);
        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));
        return Ok(ApiResponse<ProductResponse>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<ProductResponse>.Ok(result, "Product created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        if (!updated)
            return NotFound(ApiResponse<string>.Fail("Product not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Product updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Fail("Product not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Product deleted successfully."));
    }
}
