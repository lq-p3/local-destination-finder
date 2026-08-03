using System;
using System.ComponentModel.DataAnnotations;

namespace Ldf.Core.Entities;

public class Package
{
    public string Id { get; set; } = string.Empty;
    public string OfficeId { get; set; } = string.Empty;
    public string OfficeNameEn { get; set; } = string.Empty;
    public string OfficeNameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ImagesJson { get; set; } = "[]";
    public string CitiesEnJson { get; set; } = "[]";
    public string CitiesArJson { get; set; } = "[]";
    public int DurationDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string ItineraryJson { get; set; } = "[]";
    public string? AccommodationId { get; set; }
    public string? RoomId { get; set; }
    public string? GuideId { get; set; }
    public string TransportTypeEn { get; set; } = string.Empty;
    public string TransportTypeAr { get; set; } = string.Empty;
    public double PricePerPerson { get; set; }
    public int TotalSeats { get; set; }
    public int RemainingSeats { get; set; }
    public int AvailableSeats => RemainingSeats;
    public string InclusionsEnJson { get; set; } = "[]";
    public string InclusionsArJson { get; set; } = "[]";
    public string ExclusionsEnJson { get; set; } = "[]";
    public string ExclusionsArJson { get; set; } = "[]";
    public string TermsEn { get; set; } = string.Empty;
    public string TermsAr { get; set; } = string.Empty;
    public string CancellationPolicyEn { get; set; } = string.Empty;
    public string CancellationPolicyAr { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int ReviewsCount { get; set; }
    public bool IsAvailable { get; set; } = true;

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
