using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.DTOs;
using Ldf.Application.Services;

namespace Ldf.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "user_sarah";

    [HttpGet]
    public async Task<IActionResult> GetMyTrips(CancellationToken cancellationToken)
    {
        var trips = await _tripService.GetUserTripsAsync(GetUserId(), cancellationToken);
        return Ok(trips);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken cancellationToken)
    {
        var trip = await _tripService.GetTripByIdAsync(id, GetUserId(), cancellationToken);
        return Ok(trip);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTripRequestDto request, CancellationToken cancellationToken)
    {
        var trip = await _tripService.CreateTripAsync(GetUserId(), request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = trip.Id }, trip);
    }

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddItem(string id, [FromBody] AddTripItemRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _tripService.AddTripItemAsync(id, GetUserId(), request, cancellationToken);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var success = await _tripService.DeleteTripAsync(id, GetUserId(), cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}
