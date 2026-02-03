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

  const error = await response.json();
  return { error };
}

export async function apiPost<T>(
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
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(
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
  });

  return handleResponse<T>(response);
}

export async function apiGet<T>(
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
  });

  return handleResponse<T>(response);
}
