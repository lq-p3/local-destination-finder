using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.Common;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IDestinationService
{
    Task<PagedResponse<DestinationDto>> SearchDestinationsAsync(DestinationQueryDto query, CancellationToken cancellationToken = default);
    Task<DestinationDto?> GetDestinationByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<DestinationDto> SubmitDestinationAsync(CreateDestinationRequestDto request, string userId, CancellationToken cancellationToken = default);
    Task<ReviewListResultDto> GetReviewsAsync(string itemType, string itemId, CancellationToken cancellationToken = default);
    Task<ReviewDto> AddReviewAsync(string userId, CreateReviewDto dto, CancellationToken cancellationToken = default);
    Task<DestinationDto> ApproveDestinationAsync(string destinationId, string adminUserId, CancellationToken cancellationToken = default);
    Task<DestinationDto> RejectDestinationAsync(string destinationId, string adminUserId, string reason, CancellationToken cancellationToken = default);
    Task<PagedResponse<DestinationDto>> GetPendingDestinationsAsync(PagedRequest request, CancellationToken cancellationToken = default);
}
