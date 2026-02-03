import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  code: string;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.ok) {
    if (response.status === 204) {
      return { data: undefined as T };
    }
    const data = await response.json();
    return { data };
  }

  try {
    const error = await response.json();
    return { error };
  } catch {
    return { error: { code: 'UNKNOWN_ERROR', message: 'Erro desconhecido' } };
  }
}

export async function serverApiPost<T>(
  endpoint: string,
  body: Record<string, unknown>,
  options?: { token?: string }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  return handleResponse<T>(response);
}

export async function serverApiPut<T>(
  endpoint: string,
  body: Record<string, unknown>,
  options?: { token?: string }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  return handleResponse<T>(response);
}

export async function serverApiGet<T>(
  endpoint: string,
  options?: { token?: string }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse<T>(response);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabaseCookies = cookieStore.getAll().filter(c => c.name.includes('auth-token'));

  // Try to find the access token in Supabase cookies
  for (const cookie of supabaseCookies) {
    try {
      const parsed = JSON.parse(cookie.value);
      if (parsed.access_token) {
        return parsed.access_token;
      }
    } catch {
      continue;
    }
  }

  return null;
}
