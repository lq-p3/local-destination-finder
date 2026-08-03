import { apiRequest } from './apiClient';
import { NotificationApiModel, UnreadNotificationCountResponse } from './notificationTypes';

export async function getNotifications(signal?: AbortSignal): Promise<NotificationApiModel[]> {
  return apiRequest<NotificationApiModel[]>('/api/notifications', { signal, timeoutMs: 10000 });
}

export async function getUnreadNotificationCount(signal?: AbortSignal): Promise<UnreadNotificationCountResponse> {
  return apiRequest<UnreadNotificationCountResponse>('/api/notifications/unread-count', { signal, timeoutMs: 10000 });
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'POST'
  });
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/api/notifications/read-all', {
    method: 'POST'
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiRequest<void>(`/api/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
