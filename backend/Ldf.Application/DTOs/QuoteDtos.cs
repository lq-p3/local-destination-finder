using System;
using System.Collections.Generic;
using Ldf.Application.Common;

namespace Ldf.Application.DTOs;

public record CreateQuoteRequestDto(
    string[]? Cities,
    string? StartDate,
    int DaysCount,
    string? Budget,
    string? Notes
);

public record CreateProposalDto(
    string? OfficeNameEn,
    string? OfficeNameAr,
    double Price,
    string? ItinerarySummary
);

public record AcceptProposalDto(
    string QuoteId
);

public record QuoteRequestDto(
    string Id,
    string UserId,
    string UserName,
    string[] Cities,
    string StartDate,
    int DaysCount,
    string Budget,
    string Notes,
    string Status,
    string? AcceptedQuoteId,
    string CreatedAt,
    IReadOnlyList<QuoteProposalDto>? Proposals = null
);

public record QuoteProposalDto(
    string Id,
    string RequestId,
    string OfficeId,
    string OfficeNameEn,
    string OfficeNameAr,
    double Price,
    string Currency,
    string ItinerarySummary,
    string Status,
    string CreatedAt
);

public record QuoteQueryDto : PagedRequest
{
    public string? Status { get; set; }
}
