using System;
using System.Collections.Generic;

namespace Ldf.Application.DTOs;

public record CreateConversationRequestDto(
    string TargetUserId,
    string? BookingId = null,
    string? QuoteRequestId = null
);

public record SendMessageRequestDto(
    string? Text,
    string? ImageUrl,
    double? Latitude,
    double? Longitude,
    string? ClientMessageId = null
);

public record ChatMessageDto(
    string Id,
    string SessionId,
    string SenderId,
    string SenderName,
    string Text,
    string ImageUrl,
    LocationDto? Location,
    string? ClientMessageId,
    string CreatedAt
);

public record LocationDto(double Lat, double Lng);

public record ConversationDto(
    string Id,
    string[] Participants,
    string LastMessageText,
    string LastMessageAt,
    int UnreadCount,
    IReadOnlyList<ChatMessageDto> Messages
);
