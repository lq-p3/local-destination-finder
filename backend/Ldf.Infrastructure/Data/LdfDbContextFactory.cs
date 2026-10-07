using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ldf.Infrastructure.Data;

/// <summary>
/// Used only by EF Core tooling (e.g. <c>dotnet ef migrations add</c>).
/// The connection string is read from the environment so no credentials live in source control.
/// </summary>
public class LdfDbContextFactory : IDesignTimeDbContextFactory<LdfDbContext>
{
    private const string EnvVar = "ConnectionStrings__DefaultConnection";

    public LdfDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(EnvVar);
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"Set the '{EnvVar}' environment variable before running EF Core design-time commands. " +
                "See .env.example for the expected format.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<LdfDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new LdfDbContext(optionsBuilder.Options);
    }
}
