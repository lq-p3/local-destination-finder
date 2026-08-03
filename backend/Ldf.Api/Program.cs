using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Ldf.Api.Middlewares;
using Ldf.Application.Interfaces;
using Ldf.Application.Services;
using Ldf.Core.Entities;
using Ldf.Core.Interfaces;
using Ldf.Infrastructure.Data;
using Ldf.Infrastructure.Services;
using Ldf.Infrastructure.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register SignalR
builder.Services.AddSignalR();

// Register IMemoryCache
builder.Services.AddMemoryCache();

// Register Global Exception Handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Register DbContext
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<LdfDbContext>(options =>
        options.UseInMemoryDatabase("LdfDevDb"));
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("CRITICAL: Production connection string ('ConnectionStrings:DefaultConnection' or 'ConnectionStrings__DefaultConnection') is missing.");
    }
    builder.Services.AddDbContext<LdfDbContext>(options =>
        options.UseSqlServer(connectionString));
}

builder.Services.AddScoped<ILdfDbContext>(provider => provider.GetRequiredService<LdfDbContext>());

// Register ASP.NET Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<LdfDbContext>()
.AddDefaultTokenProviders();

// Register JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtKey = "LdfDevelopmentOnlySecretKeyForLocalTesting2026_AtLeast32Chars";
    }
    else
    {
        throw new InvalidOperationException("CRITICAL: JWT signing key is missing in Production environment.");
    }
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "LdfApi",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "LdfClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanSubmitQuote", policy => policy.RequireRole("office", "provider", "admin"));
    options.AddPolicy("CanManageOffice", policy => policy.RequireRole("office", "admin"));
    options.AddPolicy("CanModerateDestination", policy => policy.RequireRole("admin"));
});

// Register Rate Limiter
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    options.AddPolicy("AuthPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("GeneralPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 5
            }));
});

// Register Application Layer Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(EFRepository<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDestinationService, DestinationService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();
builder.Services.AddScoped<IFavoriteService, FavoriteService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<IUnifiedSearchService, UnifiedSearchService>();
builder.Services.AddScoped<IGuidesService, GuidesService>();

// Register Gemini AI Service with Timeout and Limits
builder.Services.AddHttpClient<IGeminiService, GeminiService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

// Register OpenStreetMap service via HttpClient with custom User-Agent header
builder.Services.AddHttpClient<IOpenStreetMapService, OpenStreetMapService>((serviceProvider, client) =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "LdfTourismApp/1.0 (contact: admin@ldf.local)");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// CORS - Restricted Allowed Origins read from configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddHealthChecks();

builder.Services.AddCors(options =>
{
    options.AddPolicy("LdfFrontendPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Database creation & seeding
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<LdfDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        if (db.Database.IsRelational())
        {
            var applyMigrations = builder.Configuration.GetValue<bool>("APPLY_MIGRATIONS") 
                || Environment.GetEnvironmentVariable("APPLY_MIGRATIONS") == "true";
            if (applyMigrations)
            {
                await db.Database.MigrateAsync();
            }
        }
        else
        {
            db.Database.EnsureCreated();
        }

        await DbSeeder.SeedAsync(db, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database creation or seeding.");
    }
}

// Global Exception Handler & Middleware Pipeline
app.UseExceptionHandler();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("LdfFrontendPolicy");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();
