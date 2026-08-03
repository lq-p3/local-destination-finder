using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task RevokeTokenAsync(string refreshToken, string userId, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task RevokeAllTokensAsync(string userId, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<UserDto?> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default);
}
