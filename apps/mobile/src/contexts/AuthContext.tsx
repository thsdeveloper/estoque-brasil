import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import type { LoginRequest, UserProfile } from '@/types/api';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextData extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const ALLOWED_ROLES = ['operador', 'lider_coleta'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getStoredUser();
        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    const profile = await authService.me();

    const hasAllowedRole = profile.roles.some((r) => ALLOWED_ROLES.includes(r.name));
    if (!hasAllowedRole) {
      await authService.logout();
      throw new Error('Acesso permitido apenas para Operadores e Líderes de Coleta.');
    }

    setState((prev) => ({
      ...prev,
      user: response.user,
      profile,
      isAuthenticated: true,
    }));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const loadProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await authService.me();
      setState((prev) => ({ ...prev, profile }));
      return profile;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
