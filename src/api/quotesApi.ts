import { apiRequest } from './apiClient';
import { 
  QuoteRequestApiModel, 
  CreateQuoteRequestApiDto, 
  CreateProposalApiDto 
} from './quoteTypes';

export async function getQuoteRequests(signal?: AbortSignal): Promise<QuoteRequestApiModel[]> {
  return apiRequest<QuoteRequestApiModel[]>('/api/quote-requests', { signal, timeoutMs: 10000 });
}

export async function getQuoteRequestById(id: string, signal?: AbortSignal): Promise<QuoteRequestApiModel> {
  return apiRequest<QuoteRequestApiModel>(`/api/quote-requests/${encodeURIComponent(id)}`, { signal, timeoutMs: 10000 });
}

export async function createQuoteRequest(request: CreateQuoteRequestApiDto): Promise<{ success: boolean; id: string }> {
  return apiRequest<{ success: boolean; id: string }>('/api/quote-requests', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function submitQuoteProposal(requestId: string, request: CreateProposalApiDto): Promise<{ success: boolean; proposalId: string }> {
  return apiRequest<{ success: boolean; proposalId: string }>(`/api/quote-requests/${encodeURIComponent(requestId)}/quotes`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function acceptQuoteProposal(requestId: string, quoteId: string): Promise<{ success: boolean; acceptedQuoteId: string }> {
  return apiRequest<{ success: boolean; acceptedQuoteId: string }>(`/api/quote-requests/${encodeURIComponent(requestId)}/accept`, {
    method: 'POST',
    body: JSON.stringify({ quoteId })
  });
}

export async function cancelQuoteRequest(requestId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/quote-requests/${encodeURIComponent(requestId)}/cancel`, {
    method: 'POST'
  });
}
