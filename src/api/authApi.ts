import { apiRequest } from './apiClient';
import { 
  LoginRequest, LoginResponse, 
  RegisterRequest, RegisterResponse, 
  AuthUser, SwitchRoleResponse 
} from './authTypes';

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getCurrentUserApi(token?: string | null): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me', {
    token
  });
}

export async function switchRoleApi(role: string, token?: string | null): Promise<SwitchRoleResponse> {
  return apiRequest<SwitchRoleResponse>('/api/auth/switch-role', {
    method: 'POST',
    token,
    body: JSON.stringify({ role })
  });
}
