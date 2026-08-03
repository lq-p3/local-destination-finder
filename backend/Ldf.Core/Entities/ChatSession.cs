using System;
using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class ChatSession
{
    public string Id { get; set; } = string.Empty;
    public string? BookingId { get; set; }
    public string? QuoteRequestId { get; set; }

    public string ParticipantAId { get; set; } = string.Empty;
    public string ParticipantBId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastMessageAt { get; set; }
    public string? LastMessagePreview { get; set; }

    public User? ParticipantA { get; set; }
    public User? ParticipantB { get; set; }

    public ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
