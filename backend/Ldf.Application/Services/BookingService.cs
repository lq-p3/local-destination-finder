using System;
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

public class BookingService : IBookingService
{
    private readonly ILdfDbContext _context;

    public BookingService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<BookingDto>> GetUserBookingsAsync(string userId, BookingQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = _context.Bookings.AsNoTracking().Where(b => b.UserId == userId);

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            dbQuery = dbQuery.Where(b => b.Status == query.Status.ToLower());
        }

        dbQuery = dbQuery.OrderByDescending(b => b.CreatedAt);

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(b => MapToDto(b))
            .ToListAsync(cancellationToken);

        return new PagedResponse<BookingDto>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<BookingDto?> GetBookingByIdAsync(string bookingId, string userId, CancellationToken cancellationToken = default)
    {
        var b = await _context.Bookings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == bookingId && x.UserId == userId, cancellationToken);
        return b == null ? null : MapToDto(b);
    }

    public async Task<BookingDto> CreateBookingAsync(string userId, CreateBookingRequestDto dto, string? idempotencyKey = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.ItemId))
        {
            throw new ValidationException("ItemId is required.");
        }

        var count = dto.TravelersCount > 0 ? dto.TravelersCount : 1;

        // Idempotency Check
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var existingRecord = await _context.IdempotencyRecords.AsNoTracking()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.Operation == "create_booking" && r.Key == idempotencyKey, cancellationToken);

            if (existingRecord != null && !string.IsNullOrEmpty(existingRecord.ResourceId))
            {
                var existingBooking = await GetBookingByIdAsync(existingRecord.ResourceId, userId, cancellationToken);
                if (existingBooking != null) return existingBooking;
            }
        }

        double unitPrice = 500.0;
        string itemNameEn = "Tour Package";
        string itemNameAr = "حجز رحلة سياحية";
        string itemImage = "/alula_hegra.jpg";

        // Price snapshot calculation strictly from Backend database!
        var typeLower = dto.Type?.ToLower() ?? "package";
        if (typeLower == "package")
        {
            var package = await _context.Packages.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == dto.ItemId, cancellationToken);

            if (package != null)
            {
                unitPrice = package.PricePerPerson > 0 ? package.PricePerPerson : 500.0;
                itemNameEn = package.NameEn;
                itemNameAr = package.NameAr;
                var images = JsonSerializer.Deserialize<string[]>(package.ImagesJson);
                if (images?.Length > 0) itemImage = images[0];

                if (package.RemainingSeats < count)
                {
                    throw new ConflictException("Insufficient available seats for this package.", "INSUFFICIENT_SEATS");
                }
            }
        }

        double basePriceTotal = unitPrice * count;
        double taxes = Math.Round(basePriceTotal * 0.15, 2);
        double totalPrice = basePriceTotal + taxes;

        var startDate = dto.StartDate ?? DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd");
        var endDate = dto.EndDate ?? DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd");

        var booking = new Booking
        {
            Id = "book_" + Guid.NewGuid().ToString("N")[..8],
            UserId = userId,
            Type = typeLower,
            ItemId = dto.ItemId,
            ItemNameEn = itemNameEn,
            ItemNameAr = itemNameAr,
            ItemImage = itemImage,
            TravelersCount = count,
            StartDate = startDate,
            EndDate = endDate,
            UnitPrice = unitPrice,
            BasePrice = basePriceTotal,
            Taxes = taxes,
            DiscountAmount = 0.0,
            TotalPrice = totalPrice,
            Currency = "SAR",
            Status = BookingStatuses.Pending,
            PaymentStatus = PaymentStatuses.Pending,
            QrCode = "QR_" + Guid.NewGuid().ToString("N")[..10].ToUpper(),
            InvoiceNumber = "INV-" + DateTime.UtcNow.Year + "-" + Random.Shared.Next(1000, 9999),
            CancellationPolicyEn = "Free cancellation up to 48h before trip",
            CancellationPolicyAr = "إلغاء مجاني حتى ٤٨ ساعة قبل موعد الرحلة",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Bookings.AddAsync(booking, cancellationToken);

        // Record Idempotency Key
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var record = new IdempotencyRecord
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = userId,
                Operation = "create_booking",
                Key = idempotencyKey,
                ResourceId = booking.Id,
                ResponseStatus = 201,
                ResponseBody = "",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
            await _context.IdempotencyRecords.AddAsync(record, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(booking);
    }

    public async Task<BookingDto> CancelBookingAsync(string bookingId, string userId, string reason, CancellationToken cancellationToken = default)
    {
        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId, cancellationToken);
        if (booking == null) throw new NotFoundException("Booking not found.");

        if (booking.Status == BookingStatuses.Cancelled)
        {
            return MapToDto(booking);
        }

        booking.Status = BookingStatuses.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = reason;
        booking.UpdatedAt = DateTime.UtcNow;

        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(booking);
    }

    private static BookingDto MapToDto(Booking b)
    {
        return new BookingDto(
            b.Id,
            b.UserId,
            b.Type,
            b.ItemId,
            b.ItemNameEn,
            b.ItemNameAr,
            b.ItemImage,
            b.TravelersCount,
            b.Status,
            b.PaymentStatus,
            b.StartDate,
            b.EndDate,
            new PriceDetailsDto(b.BasePrice, b.UnitPrice, b.Taxes, b.DiscountAmount, b.TotalPrice, b.Currency),
            b.QrCode,
            b.InvoiceNumber,
            b.CancellationPolicyEn,
            b.CancellationPolicyAr,
            b.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
        );
    }
}
