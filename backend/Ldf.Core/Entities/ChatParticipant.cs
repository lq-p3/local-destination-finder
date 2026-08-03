using System;

namespace Ldf.Core.Entities;

public class ChatParticipant
{
    public string Id { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastReadAt { get; set; }

    public ChatSession? Session { get; set; }
    public User? User { get; set; }
}
