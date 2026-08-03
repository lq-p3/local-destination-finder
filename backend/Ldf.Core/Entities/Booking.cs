using System;
using System.ComponentModel.DataAnnotations;

namespace Ldf.Core.Entities;

public class Booking
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Type { get; set; } = "package"; // package, guide, accommodation
    public string ItemId { get; set; } = string.Empty;
    public string ItemNameEn { get; set; } = string.Empty;
    public string ItemNameAr { get; set; } = string.Empty;
    public string ItemImage { get; set; } = string.Empty;
    
    public int TravelersCount { get; set; } = 1;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;

    // Price Snapshots
    public double BasePrice { get; set; } // Unit Base Price
    public double UnitPrice { get; set; } // Snapshot unit price
    public double Taxes { get; set; }
    public double DiscountAmount { get; set; } = 0.0;
    public double TotalPrice { get; set; }
    public string Currency { get; set; } = "SAR";

    public string Status { get; set; } = BookingStatuses.Pending;
    public string PaymentStatus { get; set; } = PaymentStatuses.Pending;

    public string QrCode { get; set; } = string.Empty;
    public string InvoiceNumber { get; set; } = string.Empty;
    public string CancellationPolicyEn { get; set; } = string.Empty;
    public string CancellationPolicyAr { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public User? User { get; set; }
}
