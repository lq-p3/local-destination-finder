using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly ILdfDbContext _context;
    private readonly INotificationService _notificationService;

    public PaymentService(ILdfDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<PaymentDto> CreatePaymentIntentAsync(string userId, CreatePaymentIntentRequestDto request, string? idempotencyKey = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.BookingId))
        {
            throw new ValidationException("BookingId is required.");
        }

        var booking = await _context.Bookings.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.UserId == userId, cancellationToken);

        if (booking == null)
        {
            throw new NotFoundException("Booking not found or unauthorized.");
        }

        if (booking.Status == BookingStatuses.Cancelled)
        {
            throw new ConflictException("Cannot pay for a cancelled booking.", "BOOKING_CANCELLED");
        }

        if (booking.Status == BookingStatuses.Confirmed || booking.PaymentStatus == PaymentStatuses.Succeeded)
        {
            throw new ConflictException("Booking is already paid and confirmed.", "BOOKING_ALREADY_PAID");
        }

        // Idempotency Check
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var existingRecord = await _context.IdempotencyRecords.AsNoTracking()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.Operation == "create_payment_intent" && r.Key == idempotencyKey, cancellationToken);

            if (existingRecord != null && !string.IsNullOrEmpty(existingRecord.ResourceId))
            {
                var existingPayment = await GetPaymentByIdAsync(existingRecord.ResourceId, userId, cancellationToken);
                if (existingPayment != null) return existingPayment;
            }
        }

        var payment = new Payment
        {
            Id = "pay_" + Guid.NewGuid().ToString("N")[..8],
            BookingId = booking.Id,
            UserId = userId,
            Amount = booking.TotalPrice,
            Currency = booking.Currency,
            Status = PaymentStatuses.Pending,
            Provider = "Development",
            ProviderReference = "DEV-REF-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            IdempotencyKey = idempotencyKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Payments.AddAsync(payment, cancellationToken);

        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var record = new IdempotencyRecord
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = userId,
                Operation = "create_payment_intent",
                Key = idempotencyKey,
                ResourceId = payment.Id,
                ResponseStatus = 201,
                ResponseBody = "",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
            await _context.IdempotencyRecords.AddAsync(record, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(payment);
    }

    public async Task<ConfirmPaymentResponseDto> ConfirmPaymentAsync(string paymentId, string userId, string? idempotencyKey = null, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId, cancellationToken);
            if (payment == null)
            {
                throw new NotFoundException("Payment intent not found or unauthorized.");
            }

            if (payment.Status == PaymentStatuses.Succeeded)
            {
                throw new ConflictException("Payment has already been confirmed.", "PAYMENT_ALREADY_CONFIRMED");
            }

            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == payment.BookingId, cancellationToken);
            if (booking == null)
            {
                throw new NotFoundException("Associated booking not found.");
            }

            if (booking.Status == BookingStatuses.Confirmed)
            {
                throw new ConflictException("Booking has already been confirmed.", "BOOKING_ALREADY_CONFIRMED");
            }

            payment.Status = PaymentStatuses.Succeeded;
            payment.ConfirmedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            _context.Payments.Update(payment);

            booking.Status = BookingStatuses.Confirmed;
            booking.PaymentStatus = PaymentStatuses.Succeeded;
            booking.UpdatedAt = DateTime.UtcNow;
            _context.Bookings.Update(booking);

            // Deduct available seats if package booking
            if (booking.Type == "package" && !string.IsNullOrEmpty(booking.ItemId))
            {
                var package = await _context.Packages.FirstOrDefaultAsync(p => p.Id == booking.ItemId, cancellationToken);
                if (package != null)
                {
                    if (package.RemainingSeats < booking.TravelersCount)
                    {
                        throw new ConflictException("Insufficient package seats remaining for confirmation.", "INSUFFICIENT_SEATS");
                    }
                    package.RemainingSeats -= booking.TravelersCount;
                    _context.Packages.Update(package);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // Post-commit notification
            try
            {
                await _notificationService.CreateNotificationAsync(
                    userId,
                    NotificationTypes.Payment,
                    "Payment Successful",
                    "تمت عملية الدفع بنجاح",
                    $"Your payment of {payment.Amount} SAR for booking #{booking.Id} was confirmed.",
                    $"تم تأكيد دفع مبلغ {payment.Amount} ر.س للحجز رقم {booking.Id}.",
                    $"/bookings/{booking.Id}",
                    cancellationToken
                );
            }
            catch
            {
                // Silent catch for notification dispatch to keep financial commit intact
            }

            return new ConfirmPaymentResponseDto(
                true,
                payment.Id,
                payment.BookingId,
                payment.Status,
                payment.ConfirmedAt ?? DateTime.UtcNow
            );
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictException("Concurrent payment update detected. Please verify status.", "CONCURRENCY_CONFLICT");
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictException("Database constraint violation during payment confirmation.", "PAYMENT_CONFLICT");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(string paymentId, string userId, CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId, cancellationToken);
        return payment == null ? null : MapToDto(payment);
    }

    private static PaymentDto MapToDto(Payment p)
    {
        return new PaymentDto(
            p.Id,
            p.BookingId,
            p.UserId,
            p.Amount,
            p.Currency,
            p.Status,
            p.Provider,
            p.ProviderReference,
            p.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            p.ConfirmedAt?.ToString("yyyy-MM-ddTHH:mm:ssZ")
        );
    }
}
