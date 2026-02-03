// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Health Check
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

// FAQ Types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// Contact/Lead Types
export interface ContactLead {
  name: string;
  email: string;
  phone: string;
  message?: string;
  source?: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  slug: string;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  role?: string;
  content: string;
  rating?: number;
  avatar?: string;
}

// Client Types
export interface Client {
  id: string;
  nome: string;
  linkBi: string | null;
  qtdeDivergentePlus: number | null;
  qtdeDivergenteMinus: number | null;
  valorDivergentePlus: number | null;
  valorDivergenteMinus: number | null;
  percentualDivergencia: number | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  uf: string | null;
  municipio: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClientInput = Partial<CreateClientInput>;

// Query params for filtering clients
export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  uf?: string;
}

// Auth Types
export interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
}

export interface JWTClaims {
  sub: string;
  email?: string;
  role: string;
  exp: number;
  iat: number;
}

export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];
