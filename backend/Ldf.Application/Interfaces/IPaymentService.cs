using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto> CreatePaymentIntentAsync(string userId, CreatePaymentIntentRequestDto request, string? idempotencyKey = null, CancellationToken cancellationToken = default);
    Task<ConfirmPaymentResponseDto> ConfirmPaymentAsync(string paymentId, string userId, string? idempotencyKey = null, CancellationToken cancellationToken = default);
    Task<PaymentDto?> GetPaymentByIdAsync(string paymentId, string userId, CancellationToken cancellationToken = default);
}
