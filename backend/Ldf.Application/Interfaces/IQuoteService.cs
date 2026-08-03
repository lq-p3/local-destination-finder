using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.Common;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IQuoteService
{
    Task<PagedResponse<QuoteRequestDto>> ListRequestsAsync(string userId, string userRole, QuoteQueryDto query, CancellationToken cancellationToken = default);
    Task<QuoteRequestDto?> GetRequestByIdAsync(string id, string userId, string userRole, CancellationToken cancellationToken = default);
    Task<QuoteRequestDto> CreateRequestAsync(string userId, CreateQuoteRequestDto dto, CancellationToken cancellationToken = default);
    Task<QuoteProposalDto> SubmitProposalAsync(string requestId, string officeUserId, CreateProposalDto dto, CancellationToken cancellationToken = default);
    Task<QuoteRequestDto> AcceptProposalAsync(string requestId, string userId, string quoteId, CancellationToken cancellationToken = default);
    Task<QuoteRequestDto> CancelRequestAsync(string requestId, string userId, CancellationToken cancellationToken = default);
}
