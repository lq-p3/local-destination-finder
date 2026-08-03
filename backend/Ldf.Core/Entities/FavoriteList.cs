namespace Ldf.Core.Entities;

public class FavoriteList
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string InviteesJson { get; set; } = "[]";
    public string VotesJson { get; set; } = "{}";
    public string ItemsJson { get; set; } = "[]";

    public User? User { get; set; }
}
