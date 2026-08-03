using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ldf.Core.Entities;

namespace Ldf.Application.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(string userId, CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(string notificationId, string userId, CancellationToken cancellationToken = default);
    Task CreateNotificationAsync(string userId, string type, string titleEn, string titleAr, string messageEn, string messageAr, string? link = null, CancellationToken cancellationToken = default);
}
