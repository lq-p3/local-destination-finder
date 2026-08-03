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
[Route("api/quote-requests")]
public class QuoteRequestsController : ControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuoteRequestsController(IQuoteService quoteService)
    {
        _quoteService = quoteService;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] QuoteQueryDto query, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "user";

        var result = await _quoteService.ListRequestsAsync(userId, userRole, query, cancellationToken);
        return Ok(result.Items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "user";

        var request = await _quoteService.GetRequestByIdAsync(id, userId, userRole, cancellationToken);
        if (request == null)
        {
            return NotFound(new { error = "Quote request not found." });
        }

        return Ok(request);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuoteRequestDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _quoteService.CreateRequestAsync(userId, dto, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, new { success = true, id = result.Id });
    }

    [HttpPost("{id}/quotes")]
    public async Task<IActionResult> SubmitProposal(string id, [FromBody] CreateProposalDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "user";
        if (userRole != "office" && userRole != "provider" && userRole != "admin")
        {
            return StatusCode(403, new { error = "Only travel offices or providers can submit quote proposals." });
        }

        var result = await _quoteService.SubmitProposalAsync(id, userId, dto, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id }, new { success = true, proposalId = result.Id });
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptProposal(string id, [FromBody] AcceptProposalDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _quoteService.AcceptProposalAsync(id, userId, dto.QuoteId, cancellationToken);
        return Ok(new { success = true, acceptedQuoteId = result.AcceptedQuoteId });
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _quoteService.CancelRequestAsync(id, userId, cancellationToken);
        return Ok(new { success = true });
    }
}
