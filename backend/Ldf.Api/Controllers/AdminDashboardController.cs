using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Interfaces;
using Ldf.Core;

namespace Ldf.Api.Controllers;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly ILdfDbContext _context;

    public AdminDashboardController(ILdfDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var usersCount = await _context.Users.CountAsync(cancellationToken);
        var destinationsCount = await _context.Destinations.CountAsync(cancellationToken);
        var pendingDestinations = await _context.Destinations.CountAsync(d => d.Status == DestinationStatuses.Pending, cancellationToken);
        var bookingsCount = await _context.Bookings.CountAsync(cancellationToken);
        var confirmedBookings = await _context.Bookings.CountAsync(b => b.Status == BookingStatuses.Confirmed, cancellationToken);
        var quoteRequestsCount = await _context.QuoteRequests.CountAsync(cancellationToken);
        var activeConversationsCount = await _context.ChatSessions.CountAsync(cancellationToken);

        return Ok(new
        {
            usersCount,
            destinationsCount,
            pendingDestinations,
            bookingsCount,
            confirmedBookings,
            quoteRequestsCount,
            activeConversationsCount
        });
    }
}
