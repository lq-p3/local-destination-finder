using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Interfaces;
using Ldf.Core.Entities;

namespace Ldf.Infrastructure.Data;

public class LdfDbContext : IdentityDbContext<User>, ILdfDbContext
{
    public LdfDbContext(DbContextOptions<LdfDbContext> options) : base(options)
    {
    }

    public DbSet<Region> Regions { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<Destination> Destinations { get; set; } = null!;
    public DbSet<Hotel> Hotels { get; set; } = null!;
    public DbSet<Restaurant> Restaurants { get; set; } = null!;
    public DbSet<Cafe> Cafes { get; set; } = null!;
    public DbSet<Activity> Activities { get; set; } = null!;
    public DbSet<Event> Events { get; set; } = null!;
    public DbSet<ImageMetadata> ImageMetadata { get; set; } = null!;
    
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<QuoteRequest> QuoteRequests { get; set; } = null!;
    public DbSet<QuoteProposal> QuoteProposals { get; set; } = null!;
    public DbSet<ChatSession> ChatSessions { get; set; } = null!;
    public DbSet<ChatParticipant> ChatParticipants { get; set; } = null!;
    public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Package> Packages { get; set; } = null!;
    public DbSet<PackageDay> PackageDays { get; set; } = null!;
    public DbSet<PackageDayItem> PackageDayItems { get; set; } = null!;
    public DbSet<Trip> Trips { get; set; } = null!;
    public DbSet<TripDay> TripDays { get; set; } = null!;
    public DbSet<TripItem> TripItems { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<FavoriteFolder> FavoriteFolders { get; set; } = null!;
    public DbSet<FavoriteItem> FavoriteItems { get; set; } = null!;
    public DbSet<TravelOffice> TravelOffices { get; set; } = null!;
    public DbSet<TravelGuide> TravelGuides { get; set; } = null!;
    public DbSet<Coupon> Coupons { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<IdempotencyRecord> IdempotencyRecords { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Region CoverImage
        builder.Entity<Region>()
            .HasOne(r => r.CoverImageEntity)
            .WithMany()
            .HasForeignKey(r => r.CoverImageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Region Gallery
        builder.Entity<Region>()
            .HasMany(r => r.Gallery)
            .WithMany();

        // Region -> Cities
        builder.Entity<City>()
            .HasOne(c => c.Region)
            .WithMany(r => r.Cities)
            .HasForeignKey(c => c.RegionId)
            .OnDelete(DeleteBehavior.Cascade);

        // City CoverImage
        builder.Entity<City>()
            .HasOne(c => c.CoverImageEntity)
            .WithMany()
            .HasForeignKey(c => c.CoverImageId)
            .OnDelete(DeleteBehavior.Restrict);

        // City Gallery
        builder.Entity<City>()
            .HasMany(c => c.Gallery)
            .WithMany();

        // City -> Destinations
        builder.Entity<Destination>()
            .HasOne(d => d.City)
            .WithMany(c => c.Destinations)
            .HasForeignKey(d => d.CityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Destination MainImage
        builder.Entity<Destination>()
            .HasOne(d => d.MainImage)
            .WithMany()
            .HasForeignKey(d => d.MainImageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Destination Gallery
        builder.Entity<Destination>()
            .HasMany(d => d.Gallery)
            .WithMany();

        // Submitter -> Destination
        builder.Entity<Destination>()
            .HasOne(d => d.Submitter)
            .WithMany()
            .HasForeignKey(d => d.SubmittedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // Hotel City
        builder.Entity<Hotel>()
            .HasOne(h => h.City)
            .WithMany(c => c.Hotels)
            .HasForeignKey(h => h.CityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Hotel MainImage
        builder.Entity<Hotel>()
            .HasOne(h => h.MainImage)
            .WithMany()
            .HasForeignKey(h => h.MainImageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Hotel Gallery
        builder.Entity<Hotel>()
            .HasMany(h => h.Gallery)
            .WithMany();

        // Restaurant City
        builder.Entity<Restaurant>()
            .HasOne(r => r.City)
            .WithMany(c => c.Restaurants)
            .HasForeignKey(r => r.CityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restaurant MainImage
        builder.Entity<Restaurant>()
            .HasOne(r => r.MainImage)
            .WithMany()
            .HasForeignKey(r => r.MainImageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Restaurant Gallery
        builder.Entity<Restaurant>()
            .HasMany(r => r.Gallery)
            .WithMany();

        // Activity -> Destination
        builder.Entity<Activity>()
            .HasOne(a => a.Destination)
            .WithMany(d => d.Activities)
            .HasForeignKey(a => a.DestinationId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> Booking
        builder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // ChatSession Participant A & B (legacy / quick navigation)
        builder.Entity<ChatSession>()
            .HasOne(cs => cs.ParticipantA)
            .WithMany()
            .HasForeignKey(cs => cs.ParticipantAId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ChatSession>()
            .HasOne(cs => cs.ParticipantB)
            .WithMany()
            .HasForeignKey(cs => cs.ParticipantBId)
            .OnDelete(DeleteBehavior.Restrict);

        // ChatParticipant configurations
        builder.Entity<ChatParticipant>(cp => {
            cp.HasOne(p => p.Session)
                .WithMany(s => s.Participants)
                .HasForeignKey(p => p.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            cp.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            cp.HasIndex(p => new { p.SessionId, p.UserId }).IsUnique();
        });

        // ChatSession Messages
        builder.Entity<ChatMessage>()
            .HasOne(m => m.Session)
            .WithMany(s => s.Messages)
            .HasForeignKey(m => m.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // ChatMessage Sender
        builder.Entity<ChatMessage>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // ChatMessage ClientMessageId Deduplication Index
        builder.Entity<ChatMessage>()
            .HasIndex(m => new { m.SessionId, m.ClientMessageId })
            .IsUnique()
            .HasFilter("[ClientMessageId] IS NOT NULL");

        // User -> Notification
        builder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Review Configuration (Unique Index on UserId + ItemType + ItemId)
        builder.Entity<Review>(r => {
            r.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            r.HasIndex(x => new { x.UserId, x.ItemType, x.ItemId }).IsUnique();
            r.HasIndex(x => new { x.ItemType, x.ItemId });
        });

        // Favorite Folder & Items Configuration
        builder.Entity<FavoriteFolder>(ff => {
            ff.HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<FavoriteItem>(fi => {
            fi.HasOne(i => i.Folder)
                .WithMany(f => f.Items)
                .HasForeignKey(i => i.FolderId)
                .OnDelete(DeleteBehavior.Cascade);

            fi.HasOne(i => i.User)
                .WithMany()
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            fi.HasIndex(i => new { i.UserId, i.ItemType, i.ItemId }).IsUnique();
            fi.HasIndex(i => i.FolderId);
            fi.HasIndex(i => i.UserId);
        });

        // RefreshToken Configuration
        builder.Entity<RefreshToken>(rt => {
            rt.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            rt.HasIndex(r => r.TokenHash).IsUnique();
            rt.HasIndex(r => r.UserId);
        });

        // IdempotencyRecord Configuration
        builder.Entity<IdempotencyRecord>(ir => {
            ir.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            ir.HasIndex(r => new { r.UserId, r.Operation, r.Key }).IsUnique();
        });

        // AuditLog Configuration
        builder.Entity<AuditLog>(al => {
            al.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            al.HasIndex(a => a.Timestamp);
            al.HasIndex(a => new { a.EntityType, a.EntityId });
        });

        // User -> TravelOffice & TravelGuide
        builder.Entity<TravelOffice>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<TravelGuide>()
            .HasOne(g => g.User)
            .WithMany()
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Precision configurations and Optimistic Concurrency RowVersion
        builder.Entity<Booking>(b => {
            b.Property(x => x.BasePrice).HasPrecision(18, 2);
            b.Property(x => x.UnitPrice).HasPrecision(18, 2);
            b.Property(x => x.Taxes).HasPrecision(18, 2);
            b.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            b.Property(x => x.TotalPrice).HasPrecision(18, 2);
            b.Property(x => x.RowVersion).IsRowVersion();
            b.HasIndex(x => x.UserId);
            b.HasIndex(x => x.Status);
        });

        builder.Entity<Payment>(p => {
            p.Property(x => x.Amount).HasPrecision(18, 2);
            p.Property(x => x.RowVersion).IsRowVersion();
            p.HasIndex(x => new { x.BookingId, x.UserId, x.Status });
            p.HasIndex(x => x.ProviderReference);
            p.HasIndex(x => x.BookingId)
                .IsUnique()
                .HasFilter("[Status] = 'succeeded'");
        });

        builder.Entity<QuoteRequest>(qr => {
            qr.Property(x => x.RowVersion).IsRowVersion();
            qr.HasIndex(x => x.UserId);
            qr.HasIndex(x => x.Status);
        });

        builder.Entity<QuoteProposal>(qp => {
            qp.Property(x => x.Price).HasPrecision(18, 2);
            qp.Property(x => x.RowVersion).IsRowVersion();
            qp.HasIndex(x => x.RequestId);
            qp.HasIndex(x => x.OfficeId);
        });

        builder.Entity<Package>(pkg => {
            pkg.Property(x => x.PricePerPerson).HasPrecision(18, 2);
            pkg.Property(x => x.RowVersion).IsRowVersion();
            pkg.HasIndex(x => x.OfficeId);
            pkg.HasIndex(x => x.Category);
        });
    }
}
