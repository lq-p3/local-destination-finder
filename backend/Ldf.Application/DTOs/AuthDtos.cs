using System;

namespace Ldf.Application.DTOs;

public record RegisterRequestDto(
    string Name,
    string Email,
    string Password,
    string Role = "user"
);

public record LoginRequestDto(
    string Email,
    string Password
);

public record AuthResponseDto(
    bool Success,
    string AccessToken,
    string? RefreshToken,
    UserDto User,
    string? Error = null
);

public record UserDto(
    string Id,
    string Name,
    string Email,
    string Role,
    string Avatar
);

public record RefreshTokenRequestDto(
    string? RefreshToken
);
