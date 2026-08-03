using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/destinations")]
public class DestinationsController : ControllerBase
{
    private readonly IDestinationService _destinationService;

    public DestinationsController(IDestinationService destinationService)
    {
        _destinationService = destinationService;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] DestinationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _destinationService.SearchDestinationsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
    {
        var destination = await _destinationService.GetDestinationByIdAsync(id, cancellationToken);
        if (destination == null)
        {
            return NotFound(new { error = "Destination not found." });
        }

        return Ok(destination);
    }

    [Authorize]
    [HttpPost]
    [HttpPost("submit")]
    public async Task<IActionResult> Create([FromBody] CreateDestinationRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _destinationService.SubmitDestinationAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, new { success = true, id = result.Id, status = result.Status });
    }

    [HttpGet("{id}/reviews")]
    public async Task<IActionResult> GetReviews(string id, [FromQuery] string? itemType, CancellationToken cancellationToken)
    {
        var result = await _destinationService.GetReviewsAsync(itemType ?? "destination", id, cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("{id}/reviews")]
    public async Task<IActionResult> AddReview(string id, [FromBody] CreateReviewDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var dto = new CreateReviewDto(request.ItemType ?? "destination", id, request.Rating, request.Comment);
        var review = await _destinationService.AddReviewAsync(userId, dto, cancellationToken);

        return CreatedAtAction(nameof(GetReviews), new { id, itemType = review.ItemType }, new { success = true, review });
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin/pending")]
    public async Task<IActionResult> GetPendingDestinations([FromQuery] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _destinationService.GetPendingDestinationsAsync(request, cancellationToken);
        return Ok(result);
    }

    [Authorize(Roles = "admin")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _destinationService.ApproveDestinationAsync(id, userId, cancellationToken);
        return Ok(new { success = true, destination = result });
    }

    [Authorize(Roles = "admin")]
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(string id, [FromBody] RejectRequest? body, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _destinationService.RejectDestinationAsync(id, userId, body?.Reason ?? "Does not meet guidelines", cancellationToken);
        return Ok(new { success = true, destination = result });
    }
}

public record RejectRequest(string? Reason);
