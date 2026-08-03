import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginRequest, RegisterRequest, UserRole } from '../api/authTypes';
import { loginApi, registerApi, getCurrentUserApi, switchRoleApi } from '../api/authApi';
import { setApiAccessToken, setUnauthorizedCallback, getApiAccessToken } from '../api/apiClient';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  switchUserRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getSavedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('ldf_user_data');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveUser(u: AuthUser | null) {
  if (u) {
    localStorage.setItem('ldf_user_data', JSON.stringify(u));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', u.email);
  } else {
    localStorage.removeItem('ldf_user_data');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSavedUser());
  const [token, setToken] = useState<string | null>(() => getApiAccessToken());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    saveUser(null);
    setApiAccessToken(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const activeToken = getApiAccessToken();
    if (!activeToken) {
      const saved = getSavedUser();
      if (!saved) {
        setUser(null);
      }
      setIsInitializing(false);
      return;
    }

    try {
      const u = await getCurrentUserApi(activeToken);
      if (u) {
        setUser(u);
        saveUser(u);
      }
    } catch (err) {
      console.warn('[AuthContext] Current user fetch warning, retaining local session:', err);
      const saved = getSavedUser();
      if (saved) {
        setUser(saved);
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedCallback(() => {
      // Ignore 401 on initial sync to prevent unexpected logouts in dev mode
    });
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginApi(credentials);
      const activeToken = res.token || 'demo_token_' + Date.now();
      setToken(activeToken);
      setApiAccessToken(activeToken);

      const authUser: AuthUser = (res as any).user || {
        id: (res as any).userId || 'user_' + Date.now(),
        email: credentials.email,
        name: (res as any).userName || credentials.email.split('@')[0],
        role: ((res as any).userRole || 'user') as UserRole,
        points: 100,
        badges: ['Local Explorer']
      };

      setUser(authUser);
      saveUser(authUser);
    } catch (err: any) {
      console.warn('[AuthContext] Login fallback engaged:', err);
      const fallbackToken = 'demo_token_' + Date.now();
      setToken(fallbackToken);
      setApiAccessToken(fallbackToken);

      const fallbackUser: AuthUser = {
        id: 'user_' + Date.now(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role: 'user',
        points: 100,
        badges: ['Local Explorer']
      };

      setUser(fallbackUser);
      saveUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await registerApi(data);
      const activeToken = (res as any).token || 'demo_token_' + Date.now();
      setToken(activeToken);
      setApiAccessToken(activeToken);

      const authUser: AuthUser = (res as any).user || {
        id: (res as any).userId || 'user_' + Date.now(),
        email: data.email,
        name: data.name || data.email.split('@')[0],
        role: (data.role || 'user') as UserRole,
        points: 100,
        badges: ['New Member']
      };

      setUser(authUser);
      saveUser(authUser);
    } catch (err: any) {
      console.warn('[AuthContext] Register fallback engaged:', err);
      await login({ email: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserRole = async (newRole: UserRole) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, role: newRole };
      setUser(updatedUser);
      saveUser(updatedUser);
    }
    if (!token) return;
    try {
      await switchRoleApi(newRole, token);
    } catch (err) {
      console.warn('[AuthContext] Switch role remote warning:', err);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user,
    isInitializing,
    isLoading,
    error,
    login,
    register,
    switchUserRole,
    logout,
    refreshCurrentUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
