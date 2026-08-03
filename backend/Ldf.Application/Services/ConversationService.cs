using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class ConversationService : IConversationService
{
    private readonly ILdfDbContext _context;

    public ConversationService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ConversationDto>> GetUserConversationsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var sessions = await _context.ChatSessions.AsNoTracking()
            .Where(s => s.ParticipantAId == userId || s.ParticipantBId == userId || s.Participants.Any(p => p.UserId == userId))
            .Include(s => s.Participants)
            .Include(s => s.Messages.OrderByDescending(m => m.CreatedAt).Take(20))
            .OrderByDescending(s => s.LastMessageAt ?? s.CreatedAt)
            .ToListAsync(cancellationToken);

        var result = new List<ConversationDto>();
        foreach (var s in sessions)
        {
            var userParticipant = s.Participants.FirstOrDefault(p => p.UserId == userId);
            var lastRead = userParticipant?.LastReadAt ?? DateTime.MinValue;

            var unreadCount = s.Messages.Count(m => m.SenderId != userId && m.CreatedAt > lastRead);
            var messagesAsc = s.Messages.OrderBy(m => m.CreatedAt).Select(MapMessageToDto).ToList();
            var lastMsg = messagesAsc.LastOrDefault();

            var participantIds = s.Participants.Any()
                ? s.Participants.Select(p => p.UserId).ToArray()
                : new[] { s.ParticipantAId, s.ParticipantBId };

            result.Add(new ConversationDto(
                s.Id,
                participantIds,
                lastMsg?.Text ?? s.LastMessagePreview ?? "",
                lastMsg?.CreatedAt ?? s.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                unreadCount,
                messagesAsc
            ));
        }

        return result;
    }

    public async Task<ConversationDto?> GetConversationByIdAsync(string conversationId, string userId, CancellationToken cancellationToken = default)
    {
        var session = await _context.ChatSessions.AsNoTracking()
            .Include(s => s.Participants)
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s => s.Id == conversationId, cancellationToken);

        if (session == null) return null;

        var isParticipant = session.ParticipantAId == userId || session.ParticipantBId == userId || session.Participants.Any(p => p.UserId == userId);
        if (!isParticipant)
        {
            throw new ForbiddenException("Unauthorized access to this conversation.");
        }

        var userParticipant = session.Participants.FirstOrDefault(p => p.UserId == userId);
        var lastRead = userParticipant?.LastReadAt ?? DateTime.MinValue;

        var messagesAsc = session.Messages.OrderBy(m => m.CreatedAt).Select(MapMessageToDto).ToList();
        var unreadCount = session.Messages.Count(m => m.SenderId != userId && m.CreatedAt > lastRead);
        var lastMsg = messagesAsc.LastOrDefault();

        var participantIds = session.Participants.Any()
            ? session.Participants.Select(p => p.UserId).ToArray()
            : new[] { session.ParticipantAId, session.ParticipantBId };

        return new ConversationDto(
            session.Id,
            participantIds,
            lastMsg?.Text ?? session.LastMessagePreview ?? "",
            lastMsg?.CreatedAt ?? session.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            unreadCount,
            messagesAsc
        );
    }

    public async Task<ConversationDto> CreateConversationAsync(string userId, CreateConversationRequestDto dto, CancellationToken cancellationToken = default)
    {
        var targetId = string.IsNullOrWhiteSpace(dto.TargetUserId) ? "guide_abdullah" : dto.TargetUserId;

        var existing = await _context.ChatSessions
            .Include(s => s.Participants)
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s =>
                (s.ParticipantAId == userId && s.ParticipantBId == targetId) ||
                (s.ParticipantAId == targetId && s.ParticipantBId == userId) ||
                (s.Participants.Any(p => p.UserId == userId) && s.Participants.Any(p => p.UserId == targetId)), cancellationToken);

        if (existing != null)
        {
            return (await GetConversationByIdAsync(existing.Id, userId, cancellationToken))!;
        }

        var session = new ChatSession
        {
            Id = "chat_" + Guid.NewGuid().ToString("N")[..8],
            ParticipantAId = userId,
            ParticipantBId = targetId,
            BookingId = dto.BookingId,
            QuoteRequestId = dto.QuoteRequestId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var p1 = new ChatParticipant { Id = Guid.NewGuid().ToString("N"), SessionId = session.Id, UserId = userId, JoinedAt = DateTime.UtcNow };
        var p2 = new ChatParticipant { Id = Guid.NewGuid().ToString("N"), SessionId = session.Id, UserId = targetId, JoinedAt = DateTime.UtcNow };

        await _context.ChatSessions.AddAsync(session, cancellationToken);
        await _context.ChatParticipants.AddRangeAsync(new[] { p1, p2 }, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetConversationByIdAsync(session.Id, userId, cancellationToken))!;
    }

    public async Task<ChatMessageDto> SendMessageAsync(string conversationId, string userId, SendMessageRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Text) && string.IsNullOrWhiteSpace(dto.ImageUrl))
        {
            throw new ValidationException("Message content cannot be empty.");
        }

        var session = await _context.ChatSessions
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Id == conversationId, cancellationToken);

        if (session == null) throw new NotFoundException("Conversation not found.");

        var isParticipant = session.ParticipantAId == userId || session.ParticipantBId == userId || session.Participants.Any(p => p.UserId == userId);
        if (!isParticipant)
        {
            throw new ForbiddenException("Unauthorized to send message in this conversation.");
        }

        // Deduplication Check via ClientMessageId
        if (!string.IsNullOrWhiteSpace(dto.ClientMessageId))
        {
            var existing = await _context.ChatMessages.AsNoTracking()
                .FirstOrDefaultAsync(m => m.SessionId == conversationId && m.ClientMessageId == dto.ClientMessageId, cancellationToken);

            if (existing != null)
            {
                return MapMessageToDto(existing);
            }
        }

        var sender = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        var msg = new ChatMessage
        {
            Id = "msg_" + Guid.NewGuid().ToString("N")[..8],
            SessionId = conversationId,
            SenderId = userId,
            SenderName = sender?.Name ?? "User",
            Text = dto.Text ?? "",
            ImageUrl = dto.ImageUrl ?? "",
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            ClientMessageId = dto.ClientMessageId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.ChatMessages.AddAsync(msg, cancellationToken);

        session.LastMessageAt = DateTime.UtcNow;
        session.LastMessagePreview = msg.Text;
        session.UpdatedAt = DateTime.UtcNow;
        _context.ChatSessions.Update(session);

        await _context.SaveChangesAsync(cancellationToken);

        return MapMessageToDto(msg);
    }

    public async Task MarkAsReadAsync(string conversationId, string userId, CancellationToken cancellationToken = default)
    {
        var participant = await _context.ChatParticipants
            .FirstOrDefaultAsync(p => p.SessionId == conversationId && p.UserId == userId, cancellationToken);

        if (participant != null)
        {
            participant.LastReadAt = DateTime.UtcNow;
            _context.ChatParticipants.Update(participant);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private static ChatMessageDto MapMessageToDto(ChatMessage m)
    {
        LocationDto? loc = m.Latitude.HasValue ? new LocationDto(m.Latitude.Value, m.Longitude ?? 0) : null;
        return new ChatMessageDto(
            m.Id,
            m.SessionId,
            m.SenderId,
            m.SenderName,
            m.Text,
            m.ImageUrl,
            loc,
            m.ClientMessageId,
            m.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
        );
    }
}
