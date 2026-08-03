using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Ldf.Core.Entities;

namespace Ldf.Application.Interfaces;

public interface ILdfDbContext
{
    DbSet<Region> Regions { get; }
    DbSet<City> Cities { get; }
    DbSet<Destination> Destinations { get; }
    DbSet<Hotel> Hotels { get; }
    DbSet<Restaurant> Restaurants { get; }
    DbSet<Cafe> Cafes { get; }
    DbSet<Activity> Activities { get; }
    DbSet<Event> Events { get; }
    DbSet<ImageMetadata> ImageMetadata { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<Payment> Payments { get; }
    DbSet<QuoteRequest> QuoteRequests { get; }
    DbSet<QuoteProposal> QuoteProposals { get; }
    DbSet<ChatSession> ChatSessions { get; }
    DbSet<ChatParticipant> ChatParticipants { get; }
    DbSet<ChatMessage> ChatMessages { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<Package> Packages { get; }
    DbSet<PackageDay> PackageDays { get; }
    DbSet<PackageDayItem> PackageDayItems { get; }
    DbSet<Trip> Trips { get; }
    DbSet<TripDay> TripDays { get; }
    DbSet<TripItem> TripItems { get; }
    DbSet<Review> Reviews { get; }
    DbSet<FavoriteFolder> FavoriteFolders { get; }
    DbSet<FavoriteItem> FavoriteItems { get; }
    DbSet<TravelOffice> TravelOffices { get; }
    DbSet<TravelGuide> TravelGuides { get; }
    DbSet<Coupon> Coupons { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<IdempotencyRecord> IdempotencyRecords { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<User> Users { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
