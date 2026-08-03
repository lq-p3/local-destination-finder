export class ApiError extends Error {
  status: number;
  details?: unknown;
  path: string;

  constructor(status: number, message: string, path: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
    this.details = details;
  }
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string | null;
}

const DEFAULT_BASE_URL = 'http://localhost:5205';

export const API_BASE_URL = 
  (import.meta as any).env?.VITE_API_BASE_URL || 
  (import.meta as any).env?.VITE_ASP_NET_API_BASE_URL || 
  DEFAULT_BASE_URL;

if ((import.meta as any).env?.DEV && !(import.meta as any).env?.VITE_API_BASE_URL && !(import.meta as any).env?.VITE_ASP_NET_API_BASE_URL) {
  console.warn(`[apiClient] API Base URL is not set in env. Falling back to ${DEFAULT_BASE_URL}`);
}

let activeAccessToken: string | null = typeof localStorage !== 'undefined' ? localStorage.getItem('ldf_access_token') : null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setApiAccessToken(token: string | null): void {
  activeAccessToken = token;
  if (token) {
    localStorage.setItem('ldf_access_token', token);
  } else {
    localStorage.removeItem('ldf_access_token');
  }
}

export function getApiAccessToken(): string | null {
  return activeAccessToken;
}

export function setUnauthorizedCallback(callback: (() => void) | null): void {
  onUnauthorizedCallback = callback;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeoutMs = 10000, token, headers, signal, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {})
  };

  const authToken = token !== undefined ? token : activeAccessToken;
  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: reqHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errDetails: unknown = null;
      try {
        errDetails = await response.json();
      } catch {
        errDetails = null;
      }
      if (response.status === 401 && !path.includes('/login')) {
        onUnauthorizedCallback?.();
      }
      const msg = (errDetails as any)?.error || (errDetails as any)?.message || `HTTP error ${response.status}`;
      throw new ApiError(response.status, msg, path, errDetails);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout', path);
    }
    throw new ApiError(500, error.message || 'Network request failed', path);
  }
}
