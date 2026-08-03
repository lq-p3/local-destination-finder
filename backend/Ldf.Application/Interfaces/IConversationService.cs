using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IConversationService
{
    Task<IReadOnlyList<ConversationDto>> GetUserConversationsAsync(string userId, CancellationToken cancellationToken = default);
    Task<ConversationDto?> GetConversationByIdAsync(string conversationId, string userId, CancellationToken cancellationToken = default);
    Task<ConversationDto> CreateConversationAsync(string userId, CreateConversationRequestDto dto, CancellationToken cancellationToken = default);
    Task<ChatMessageDto> SendMessageAsync(string conversationId, string userId, SendMessageRequestDto dto, CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(string conversationId, string userId, CancellationToken cancellationToken = default);
}
