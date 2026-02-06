export const API_CONFIG = {
  BASE_URL: 'https://estoque-brasil-production.up.railway.app/api',
  TIMEOUT: 15000,
  REFRESH_TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
  USER: 'user',
} as const;
