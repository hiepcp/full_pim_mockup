using Microsoft.AspNetCore.Mvc;
using Pim.Application.Interfaces.Services;
using Pim.Infrastructure.D365;

namespace Pim.Api.Controllers;

[ApiController]
[Route("api/sync")]
public class SyncController : ControllerBase
{
    private readonly ID365SyncService _syncService;
    private readonly D365HttpClient _d365Client;

    public SyncController(ID365SyncService syncService, D365HttpClient d365Client)
    {
        _syncService = syncService;
        _d365Client = d365Client;
    }

    [HttpPost("products")]
    public async Task<IActionResult> SyncProducts(CancellationToken ct)
    {
        var result = await _syncService.SyncProductsAsync(ct);
        return Ok(new { success = true, message = "Sync completed", data = result });
    }

    [HttpPost("variants")]
    public async Task<IActionResult> SyncVariants(CancellationToken ct)
    {
        var result = await _syncService.SyncVariantsAsync(ct);
        return Ok(new { success = true, message = "Variant sync completed", data = result });
    }

    [HttpGet("probe/{entity}")]
    public async Task<IActionResult> ProbeEntity(string entity, [FromQuery] int top = 3, CancellationToken ct = default)
    {
        var results = await _d365Client.GetAllAsync<Dictionary<string, object?>>(entity, filter: null, select: null, top: top, ct);
        return Ok(new { success = true, entity, count = results.Count, data = results });
    }
}
