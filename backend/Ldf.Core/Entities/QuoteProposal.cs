using System;
using System.ComponentModel.DataAnnotations;

namespace Ldf.Core.Entities;

public class QuoteProposal
{
    public string Id { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public string OfficeId { get; set; } = string.Empty;
    public string OfficeNameEn { get; set; } = string.Empty;
    public string OfficeNameAr { get; set; } = string.Empty;
    public double Price { get; set; }
    public string Currency { get; set; } = "SAR";
    public string ItinerarySummary { get; set; } = string.Empty;
    public string Status { get; set; } = QuoteProposalStatuses.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public QuoteRequest? QuoteRequest { get; set; }
}
