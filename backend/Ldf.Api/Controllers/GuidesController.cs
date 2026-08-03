using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.Interfaces;
using Ldf.Application.Services;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuidesController : ControllerBase
{
    private readonly IGuidesService _guidesService;

    public GuidesController(IGuidesService guidesService)
    {
        _guidesService = guidesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetGuides(
        [FromQuery] string? cityId,
        [FromQuery] string? language,
        [FromQuery] string? specialty,
        [FromQuery] double? maxPrice,
        CancellationToken cancellationToken)
    {
        var guides = await _guidesService.GetGuidesAsync(cityId, language, specialty, maxPrice, cancellationToken);
        return Ok(guides);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGuideById(string id, CancellationToken cancellationToken)
    {
        var guide = await _guidesService.GetGuideByIdAsync(id, cancellationToken);
        if (guide == null) return NotFound(new { error = "Guide not found" });
        return Ok(guide);
    }
}
