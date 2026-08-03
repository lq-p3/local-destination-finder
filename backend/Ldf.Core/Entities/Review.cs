using System;

namespace Ldf.Core.Entities;

public class Review
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string ItemType { get; set; } = ReviewItemTypes.Destination;
    public string ItemId { get; set; } = string.Empty;
    public string? BookingId { get; set; }
    public double Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public double? CleanlinessRating { get; set; }
    public double? SafetyRating { get; set; }
    public double? PriceRating { get; set; }
    public double? ServiceRating { get; set; }
    public double? CrowdRating { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
