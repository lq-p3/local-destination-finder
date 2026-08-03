using System;

namespace Ldf.Application.DTOs;

public record CreatePaymentIntentRequestDto(
    string BookingId
);

public record PaymentDto(
    string Id,
    string BookingId,
    string UserId,
    double Amount,
    string Currency,
    string Status,
    string Provider,
    string? ProviderReference,
    string CreatedAt,
    string? ConfirmedAt
);

public record ConfirmPaymentResponseDto(
    bool Success,
    string PaymentId,
    string BookingId,
    string Status,
    DateTime ConfirmedAt
);
