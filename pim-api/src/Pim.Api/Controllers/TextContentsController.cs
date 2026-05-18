using Microsoft.AspNetCore.Mvc;
using Pim.Api.Common;
using Pim.Application.Dtos;
using Pim.Application.Interfaces.Services;
using Pim.Domain.Enums;

namespace Pim.Api.Controllers;

[ApiController]
[Route("api/text-contents")]
public sealed class TextContentsController : ControllerBase
{
    private readonly ITextContentService _service;

    public TextContentsController(ITextContentService service)
    {
        _service = service;
    }

    [HttpGet("by-product/{productId}")]
    public async Task<IActionResult> GetByProduct(string productId, [FromQuery] string? contentType, [FromQuery] string? languageCode, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            if (!Enum.TryParse<TextContentType>(contentType, true, out var type))
                return BadRequest(ApiResponse<string>.Fail("Invalid content type."));
            var byType = await _service.GetByTypeAsync(productId, type, languageCode, ct);
            return Ok(ApiResponse<IReadOnlyList<TextContentResponse>>.Ok(byType));
        }

        var result = await _service.GetByProductAsync(productId, ct);
        return Ok(ApiResponse<IReadOnlyList<TextContentResponse>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Text content not found."));
        return Ok(ApiResponse<TextContentResponse>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTextContentRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<TextContentResponse>.Ok(result, "Text content created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateTextContentRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        if (!updated)
            return NotFound(ApiResponse<string>.Fail("Text content not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Text content updated successfully."));
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(string id, [FromBody] ApproveTextContentRequest request, CancellationToken ct)
    {
        var approved = await _service.ApproveAsync(id, request, ct);
        if (!approved)
            return NotFound(ApiResponse<string>.Fail("Text content not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Text content approved."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound(ApiResponse<string>.Fail("Text content not found."));
        return Ok(ApiResponse<string>.Ok(string.Empty, "Text content deleted successfully."));
    }
}
