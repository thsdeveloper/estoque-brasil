import * as SecureStore from 'expo-secure-store';
import api from './api';
import { STORAGE_KEYS } from '@/config/api';
import type { LoginRequest, LoginResponse, UserProfile } from '@/types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);

    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.EXPIRES_AT, String(data.expiresAt));
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRES_AT);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    }
  },

  async me(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  },

  async getStoredUser(): Promise<{ id: string; email: string } | null> {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },
};
