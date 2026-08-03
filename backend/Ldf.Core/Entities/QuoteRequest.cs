using System;
using System.ComponentModel.DataAnnotations;

namespace Ldf.Core.Entities;

public class QuoteRequest
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string CitiesJson { get; set; } = "[]";
    public string StartDate { get; set; } = string.Empty;
    public int DaysCount { get; set; }
    public string Budget { get; set; } = "medium"; // economic, medium, luxury
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = QuoteRequestStatuses.Open;
    public string? AcceptedQuoteId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public User? User { get; set; }
}
