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
[Route("api/chats")]
[Route("api/conversations")]
public class ChatsController : ControllerBase
{
    private readonly IConversationService _conversationService;

    public ChatsController(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var conversations = await _conversationService.GetUserConversationsAsync(userId, cancellationToken);
        return Ok(conversations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var conversation = await _conversationService.GetConversationByIdAsync(id, userId, cancellationToken);
        if (conversation == null)
        {
            return NotFound(new { error = "Conversation not found or unauthorized." });
        }

        return Ok(conversation);
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(string id, CancellationToken cancellationToken)
    {
        return await Get(id, cancellationToken);
    }

    [HttpPost]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var conversation = await _conversationService.CreateConversationAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = conversation.Id }, conversation);
    }

    [HttpPost("{id}/send")]
    [HttpPost("{id}/messages")]
    public async Task<IActionResult> Send(string id, [FromBody] SendMessageRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var message = await _conversationService.SendMessageAsync(id, userId, request, cancellationToken);
        return Ok(message);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(string id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _conversationService.MarkAsReadAsync(id, userId, cancellationToken);
        return Ok(new { success = true });
    }
}
