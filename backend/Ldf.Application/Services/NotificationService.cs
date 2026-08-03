using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Interfaces;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class NotificationService : INotificationService
{
    private readonly ILdfDbContext _context;

    public NotificationService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task MarkAsReadAsync(string notificationId, string userId, CancellationToken cancellationToken = default)
    {
        var notif = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, cancellationToken);

        if (notif != null && !notif.IsRead)
        {
            notif.IsRead = true;
            _context.Notifications.Update(notif);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task CreateNotificationAsync(string userId, string type, string titleEn, string titleAr, string messageEn, string messageAr, string? link = null, CancellationToken cancellationToken = default)
    {
        var notif = new Notification
        {
            Id = "notif_" + Guid.NewGuid().ToString("N")[..8],
            UserId = userId,
            Type = type,
            TitleEn = titleEn,
            TitleAr = titleAr,
            ContentEn = messageEn,
            ContentAr = messageAr,
            IsRead = false,
            Link = link ?? "",
            CreatedAt = DateTime.UtcNow
        };

        await _context.Notifications.AddAsync(notif, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
