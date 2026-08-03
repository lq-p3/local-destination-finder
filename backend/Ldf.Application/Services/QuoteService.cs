using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class QuoteService : IQuoteService
{
    private readonly ILdfDbContext _context;
    private readonly INotificationService _notificationService;

    public QuoteService(ILdfDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<PagedResponse<QuoteRequestDto>> ListRequestsAsync(string userId, string userRole, QuoteQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = _context.QuoteRequests.AsNoTracking().AsQueryable();

        var isProvider = userRole is "office" or "provider" or "admin";
        if (!isProvider)
        {
            dbQuery = dbQuery.Where(r => r.UserId == userId);
        }
        else
        {
            dbQuery = dbQuery.Where(r => r.Status == QuoteRequestStatuses.Open || r.Status == QuoteRequestStatuses.Quoted || r.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            dbQuery = dbQuery.Where(r => r.Status == query.Status.ToLower());
        }

        dbQuery = dbQuery.OrderByDescending(r => r.CreatedAt);

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var requests = await dbQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var items = requests.Select(r => MapToDto(r)).ToList();

        return new PagedResponse<QuoteRequestDto>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<QuoteRequestDto?> GetRequestByIdAsync(string id, string userId, string userRole, CancellationToken cancellationToken = default)
    {
        var request = await _context.QuoteRequests.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (request == null) return null;

        var isProvider = userRole is "office" or "provider" or "admin";
        if (!isProvider && request.UserId != userId)
        {
            throw new ForbiddenException("Unauthorized to access this quote request.");
        }

        var proposals = await _context.QuoteProposals.AsNoTracking()
            .Where(p => p.RequestId == id)
            .Select(p => new QuoteProposalDto(
                p.Id,
                p.RequestId,
                p.OfficeId,
                p.OfficeNameEn,
                p.OfficeNameAr,
                p.Price,
                p.Currency,
                p.ItinerarySummary,
                p.Status,
                p.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            ))
            .ToListAsync(cancellationToken);

        return MapToDto(request, proposals);
    }

    public async Task<QuoteRequestDto> CreateRequestAsync(string userId, CreateQuoteRequestDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var userName = user?.Name ?? "Traveler";

        var request = new QuoteRequest
        {
            Id = "qr_" + Guid.NewGuid().ToString("N")[..8],
            UserId = userId,
            UserName = userName,
            CitiesJson = JsonSerializer.Serialize(dto.Cities ?? new string[] { "Riyadh" }),
            StartDate = dto.StartDate ?? DateTime.UtcNow.AddDays(14).ToString("yyyy-MM-dd"),
            DaysCount = dto.DaysCount > 0 ? dto.DaysCount : 3,
            Budget = dto.Budget ?? "medium",
            Notes = dto.Notes ?? "",
            Status = QuoteRequestStatuses.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.QuoteRequests.AddAsync(request, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(request);
    }

    public async Task<QuoteProposalDto> SubmitProposalAsync(string requestId, string officeUserId, CreateProposalDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Price <= 0)
        {
            throw new ValidationException("Price must be greater than zero.");
        }

        var request = await _context.QuoteRequests.FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken);
        if (request == null || request.Status == QuoteRequestStatuses.Cancelled || request.Status == QuoteRequestStatuses.Accepted)
        {
            throw new ConflictException("Quote request is closed for new proposals.", "REQUEST_CLOSED");
        }

        var proposal = new QuoteProposal
        {
            Id = "qp_" + Guid.NewGuid().ToString("N")[..8],
            RequestId = requestId,
            OfficeId = officeUserId,
            OfficeNameEn = dto.OfficeNameEn ?? "Travel Partner Agency",
            OfficeNameAr = dto.OfficeNameAr ?? "وكالة السفر الشريكة",
            Price = dto.Price,
            Currency = "SAR",
            ItinerarySummary = dto.ItinerarySummary ?? "Custom itinerary proposal",
            Status = QuoteProposalStatuses.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.QuoteProposals.AddAsync(proposal, cancellationToken);

        request.Status = QuoteRequestStatuses.Quoted;
        request.UpdatedAt = DateTime.UtcNow;
        _context.QuoteRequests.Update(request);

        await _context.SaveChangesAsync(cancellationToken);

        // Notify user about new quote
        try
        {
            await _notificationService.CreateNotificationAsync(
                request.UserId,
                NotificationTypes.Quote,
                "New Quote Proposal Received",
                "تم استلام عرض سعر جديد",
                $"An agency submitted a proposal for {proposal.Price} SAR.",
                $"قامت وكالة السفر بتقديم عرض سعر بمبلغ {proposal.Price} ر.س.",
                $"/quotes/{request.Id}",
                cancellationToken
            );
        }
        catch { }

        return new QuoteProposalDto(
            proposal.Id,
            proposal.RequestId,
            proposal.OfficeId,
            proposal.OfficeNameEn,
            proposal.OfficeNameAr,
            proposal.Price,
            proposal.Currency,
            proposal.ItinerarySummary,
            proposal.Status,
            proposal.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
        );
    }

    public async Task<QuoteRequestDto> AcceptProposalAsync(string requestId, string userId, string quoteId, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var request = await _context.QuoteRequests.FirstOrDefaultAsync(r => r.Id == requestId && r.UserId == userId, cancellationToken);
            if (request == null)
            {
                throw new NotFoundException("Quote request not found or unauthorized.");
            }

            if (request.Status == QuoteRequestStatuses.Accepted)
            {
                throw new ConflictException("A quote proposal has already been accepted for this request.", "QUOTE_ALREADY_ACCEPTED");
            }

            var proposals = await _context.QuoteProposals.Where(p => p.RequestId == requestId).ToListAsync(cancellationToken);
            var selected = proposals.FirstOrDefault(p => p.Id == quoteId);

            if (selected == null)
            {
                throw new NotFoundException("Selected quote proposal not found.");
            }

            foreach (var prop in proposals)
            {
                prop.Status = prop.Id == quoteId ? QuoteProposalStatuses.Accepted : QuoteProposalStatuses.Rejected;
                prop.UpdatedAt = DateTime.UtcNow;
                _context.QuoteProposals.Update(prop);
            }

            request.Status = QuoteRequestStatuses.Accepted;
            request.AcceptedQuoteId = quoteId;
            request.UpdatedAt = DateTime.UtcNow;
            _context.QuoteRequests.Update(request);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // Notify provider agency
            try
            {
                await _notificationService.CreateNotificationAsync(
                    selected.OfficeId,
                    NotificationTypes.Quote,
                    "Proposal Accepted!",
                    "تم قبول عرض السعر الخاص بك!",
                    $"Your quote proposal #{selected.Id} was accepted by the traveler.",
                    $"تم قبول عرض السعر رقم {selected.Id} من قبل المسافر.",
                    $"/quotes/{request.Id}",
                    cancellationToken
                );
            }
            catch { }

            return MapToDto(request);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictException("Concurrent proposal acceptance detected. Only one proposal can be accepted.", "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<QuoteRequestDto> CancelRequestAsync(string requestId, string userId, CancellationToken cancellationToken = default)
    {
        var request = await _context.QuoteRequests.FirstOrDefaultAsync(r => r.Id == requestId && r.UserId == userId, cancellationToken);
        if (request == null) throw new NotFoundException("Quote request not found.");

        if (request.Status == QuoteRequestStatuses.Accepted)
        {
            throw new ConflictException("Cannot cancel a request after accepting a proposal.", "CANNOT_CANCEL_ACCEPTED");
        }

        request.Status = QuoteRequestStatuses.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;
        _context.QuoteRequests.Update(request);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(request);
    }

    private static QuoteRequestDto MapToDto(QuoteRequest r, IReadOnlyList<QuoteProposalDto>? proposals = null)
    {
        return new QuoteRequestDto(
            r.Id,
            r.UserId,
            r.UserName,
            JsonSerializer.Deserialize<string[]>(r.CitiesJson) ?? Array.Empty<string>(),
            r.StartDate,
            r.DaysCount,
            r.Budget,
            r.Notes,
            r.Status,
            r.AcceptedQuoteId,
            r.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            proposals
        );
    }
}
