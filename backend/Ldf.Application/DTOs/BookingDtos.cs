using System;
using Ldf.Application.Common;

namespace Ldf.Application.DTOs;

public record CreateBookingRequestDto(
    string Type, // package, guide, accommodation
    string ItemId,
    int TravelersCount = 1,
    string? StartDate = null,
    string? EndDate = null
);

public record BookingDto(
    string Id,
    string UserId,
    string Type,
    string ItemId,
    string ItemNameEn,
    string ItemNameAr,
    string ItemImage,
    int TravelersCount,
    string Status,
    string PaymentStatus,
    string StartDate,
    string EndDate,
    PriceDetailsDto PriceDetails,
    string QrCode,
    string InvoiceNumber,
    string CancellationPolicyEn,
    string CancellationPolicyAr,
    string CreatedAt
);

public record PriceDetailsDto(
    double BasePrice,
    double UnitPrice,
    double Taxes,
    double DiscountAmount,
    double TotalPrice,
    string Currency
);

public record BookingQueryDto : PagedRequest
{
    public string? Status { get; set; }
}
