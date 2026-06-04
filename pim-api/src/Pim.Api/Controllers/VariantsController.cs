using Microsoft.AspNetCore.Mvc;
using Pim.Api.Common;
using Pim.Application.Dtos;
using Pim.Application.Interfaces.Repositories;

namespace Pim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class VariantsController : ControllerBase
{
    private readonly IProductVariantRepository _repository;

    public VariantsController(IProductVariantRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery(Name = "_start")] int start = 0,
        [FromQuery(Name = "_end")] int end = 25,
        CancellationToken ct = default)
    {
        var (items, total) = await _repository.GetPagedAsync(start, end, ct);
        var response = items.Select(v => new ProductVariantResponse
        {
            Id = v.Id.ToString(),
            ProductMasterNumber = v.ProductMasterNumber,
            VariantNumber = v.VariantNumber,
            ProductName = v.ProductName,
            ColorId = v.ColorId,
            SizeId = v.SizeId,
            StyleId = v.StyleId,
            ConfigurationId = v.ConfigurationId,
            RangeName = v.RangeName,
            Status = v.Status
        }).ToList();

        return Ok(new { success = true, data = response, total });
    }

    [HttpPost("{variantNumber}/disable")]
    public async Task<IActionResult> Disable(string variantNumber, [FromBody] DisableProductRequest? request, CancellationToken ct = default)
    {
        var variant = await _repository.GetByVariantNumberAsync(variantNumber, ct);
        if (variant is null)
            return NotFound(ApiResponse<string>.Fail("Variant not found."));

        await _repository.BulkDisableByMasterNumberAsync(variant.ProductMasterNumber, ct);

        return Ok(ApiResponse<string>.Ok(string.Empty, "Variant disabled successfully."));
    }
}
