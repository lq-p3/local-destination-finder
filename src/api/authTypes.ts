export type UserRole = 'user' | 'guide' | 'office' | 'provider' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  badges: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  userId: string;
  userName: string;
  userRole: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface RegisterResponse {
  success: boolean;
  userId: string;
  userRole: UserRole;
}

export interface SwitchRoleRequest {
  role: UserRole;
}

export interface SwitchRoleResponse {
  success: boolean;
  role: UserRole;
}
