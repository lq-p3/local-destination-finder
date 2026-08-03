using System;
using System.ComponentModel.DataAnnotations;

namespace Ldf.Core.Entities;

public class Payment
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;

    public double Amount { get; set; }
    public string Currency { get; set; } = "SAR";
    public string Status { get; set; } = PaymentStatuses.Pending;
    public string Provider { get; set; } = "Development";
    
    public string? ProviderReference { get; set; }
    public string? IdempotencyKey { get; set; }
    public string? FailureCode { get; set; }
    public string? FailureMessageSafe { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public Booking? Booking { get; set; }
    public User? User { get; set; }
}
