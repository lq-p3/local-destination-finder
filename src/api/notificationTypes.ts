export interface NotificationApiModel {
  id: string;
  userId: string;
  type: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface UnreadNotificationCountResponse {
  count: number;
}
