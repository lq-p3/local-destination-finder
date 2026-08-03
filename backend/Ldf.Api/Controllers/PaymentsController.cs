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
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("create-intent")]
    public async Task<IActionResult> CreateIntent([FromBody] CreatePaymentIntentRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var idempotencyKey = Request.Headers["Idempotency-Key"].ToString();

        var payment = await _paymentService.CreatePaymentIntentAsync(userId, request, idempotencyKey, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = payment.Id }, new
        {
            paymentId = payment.Id,
            bookingId = payment.BookingId,
            amount = payment.Amount,
            currency = payment.Currency,
            status = payment.Status,
            provider = payment.Provider
        });
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var idempotencyKey = Request.Headers["Idempotency-Key"].ToString();

        var result = await _paymentService.ConfirmPaymentAsync(id, userId, idempotencyKey, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var payment = await _paymentService.GetPaymentByIdAsync(id, userId, cancellationToken);
        if (payment == null)
        {
            return NotFound(new { error = "Payment not found or unauthorized." });
        }

        return Ok(payment);
    }
}
