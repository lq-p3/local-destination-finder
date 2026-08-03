export interface ChatMessageApiModel {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl: string;
  location?: { lat: number; lng: number } | null;
  createdAt: string;
}

export interface ConversationApiModel {
  id: string;
  participants: string[];
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount?: number;
  messages: ChatMessageApiModel[];
}

export interface CreateConversationApiRequest {
  targetUserId?: string;
  bookingId?: string;
}

export interface SendMessageApiRequest {
  text?: string;
  imageUrl?: string;
  location?: { lat: number; lng: number };
  latitude?: number;
  longitude?: number;
  clientMessageId?: string;
}
