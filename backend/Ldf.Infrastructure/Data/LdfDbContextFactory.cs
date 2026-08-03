using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ldf.Infrastructure.Data;

public class LdfDbContextFactory : IDesignTimeDbContextFactory<LdfDbContext>
{
    public LdfDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<LdfDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=LdfProductionDb;User Id=sa;Password=Your_password123;TrustServerCertificate=True;");

        return new LdfDbContext(optionsBuilder.Options);
    }
}
