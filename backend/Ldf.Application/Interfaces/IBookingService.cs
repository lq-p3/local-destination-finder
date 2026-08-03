using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.Common;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IBookingService
{
    Task<PagedResponse<BookingDto>> GetUserBookingsAsync(string userId, BookingQueryDto query, CancellationToken cancellationToken = default);
    Task<BookingDto?> GetBookingByIdAsync(string bookingId, string userId, CancellationToken cancellationToken = default);
    Task<BookingDto> CreateBookingAsync(string userId, CreateBookingRequestDto dto, string? idempotencyKey = null, CancellationToken cancellationToken = default);
    Task<BookingDto> CancelBookingAsync(string bookingId, string userId, string reason, CancellationToken cancellationToken = default);
}
