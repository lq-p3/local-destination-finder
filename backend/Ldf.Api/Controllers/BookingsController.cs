using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;

namespace Ldf.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] BookingQueryDto query, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _bookingService.GetUserBookingsAsync(userId, query, cancellationToken);
        return Ok(result.Items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var booking = await _bookingService.GetBookingByIdAsync(id, userId, cancellationToken);
        if (booking == null)
        {
            return NotFound(new { error = "Booking not found or unauthorized." });
        }

        return Ok(booking);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequestDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var idempotencyKey = Request.Headers["Idempotency-Key"].ToString();

        var result = await _bookingService.CreateBookingAsync(userId, dto, idempotencyKey, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, new
        {
            success = true,
            id = result.Id,
            totalPrice = result.PriceDetails.TotalPrice,
            status = result.Status
        });
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(string id, [FromBody] CancelBookingRequest? body, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _bookingService.CancelBookingAsync(id, userId, body?.Reason ?? "Cancelled by user", cancellationToken);
        return Ok(new { success = true, booking = result });
    }
}

public record CancelBookingRequest(string? Reason);
