using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.Services;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IUnifiedSearchService _searchService;

    public SearchController(IUnifiedSearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        var result = await _searchService.SearchAsync(q, cancellationToken);
        return Ok(result);
    }

    [HttpGet("places")]
    public async Task<IActionResult> GetUnifiedPlaces([FromQuery] string? regionId, [FromQuery] string? cityId, [FromQuery] string? category, CancellationToken cancellationToken)
    {
        var places = await _searchService.GetUnifiedPlacesAsync(regionId, cityId, category, cancellationToken);
        return Ok(places);
    }
}
