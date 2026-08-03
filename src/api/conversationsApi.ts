import { apiRequest } from './apiClient';
import { 
  ConversationApiModel, 
  ChatMessageApiModel, 
  CreateConversationApiRequest, 
  SendMessageApiRequest 
} from './conversationTypes';

export async function getConversations(signal?: AbortSignal): Promise<ConversationApiModel[]> {
  return apiRequest<ConversationApiModel[]>('/api/conversations', { signal, timeoutMs: 10000 });
}

export async function getConversationById(id: string, signal?: AbortSignal): Promise<ConversationApiModel> {
  return apiRequest<ConversationApiModel>(`/api/conversations/${encodeURIComponent(id)}`, { signal, timeoutMs: 10000 });
}

export async function createConversation(request: CreateConversationApiRequest): Promise<{ id: string; participants: string[] }> {
  return apiRequest<{ id: string; participants: string[] }>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function sendMessage(conversationId: string, request: SendMessageApiRequest): Promise<ChatMessageApiModel> {
  return apiRequest<ChatMessageApiModel>(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function markConversationRead(conversationId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/conversations/${encodeURIComponent(conversationId)}/read`, {
    method: 'POST'
  });
}
