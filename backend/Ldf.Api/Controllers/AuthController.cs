using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.RegisterAsync(request, ipAddress, cancellationToken);
        
        SetRefreshTokenCookie(response.RefreshToken);

        return Ok(new
        {
            success = true,
            token = response.AccessToken,
            userId = response.User.Id,
            userName = response.User.Name,
            userRole = response.User.Role,
            user = response.User
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.LoginAsync(request, ipAddress, cancellationToken);

        SetRefreshTokenCookie(response.RefreshToken);

        return Ok(new
        {
            success = true,
            token = response.AccessToken,
            userId = response.User.Id,
            userName = response.User.Name,
            userRole = response.User.Role,
            user = response.User
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto? dto, CancellationToken cancellationToken)
    {
        var refreshToken = dto?.RefreshToken ?? Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { error = "Refresh token is missing." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.RefreshTokenAsync(refreshToken, ipAddress, cancellationToken);

        SetRefreshTokenCookie(response.RefreshToken);

        return Ok(new
        {
            success = true,
            token = response.AccessToken,
            userId = response.User.Id,
            userName = response.User.Name,
            userRole = response.User.Role,
            user = response.User
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto? dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var refreshToken = dto?.RefreshToken ?? Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _authService.RevokeTokenAsync(refreshToken, userId, ipAddress, cancellationToken);
        }

        Response.Cookies.Delete("refreshToken");

        return Ok(new { success = true });
    }

    [Authorize]
    [HttpPost("logout-all")]
    public async Task<IActionResult> LogoutAll(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _authService.RevokeAllTokensAsync(userId, ipAddress, cancellationToken);

        Response.Cookies.Delete("refreshToken");

        return Ok(new { success = true });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        if (user == null) return NotFound();

        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role,
            avatar = user.Avatar
        });
    }

    private void SetRefreshTokenCookie(string? refreshToken)
    {
        if (string.IsNullOrEmpty(refreshToken)) return;

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = HttpContext.Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
