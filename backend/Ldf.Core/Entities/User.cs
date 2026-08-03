using Microsoft.AspNetCore.Identity;

namespace Ldf.Core.Entities;

public class User : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "user"; // user, office, provider, admin
    public string Avatar { get; set; } = "/avatars/default.jpg";
    public int Points { get; set; }
    public string BadgesJson { get; set; } = "[]";
}
