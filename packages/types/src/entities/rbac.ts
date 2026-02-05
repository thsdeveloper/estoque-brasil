// ============================================
// RBAC - Role-Based Access Control Types
// ============================================

export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystemRole: boolean;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  userId: string;
  permissions: Array<{
    resource: string;
    action: PermissionAction;
  }>;
}

// Input types for API
export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  roleIds: string[];
}

export interface UpdateUserInput {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  roleIds?: string[];
}

// Query params
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  roleId?: string;
}

// Paginated response
export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// System role names
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  OPERADOR: 'operador',
  VISUALIZADOR: 'visualizador',
} as const;

export type SystemRoleName = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

// Resources for permissions
export const PERMISSION_RESOURCES = {
  USUARIOS: 'usuarios',
  INVENTARIOS: 'inventarios',
  CLIENTS: 'clients',
  EMPRESAS: 'empresas',
  LOJAS: 'lojas',
  CONTAGENS: 'contagens',
  SETORES: 'setores',
  PRODUTOS: 'produtos',
  TEMPLATES: 'templates',
} as const;

export type PermissionResource = typeof PERMISSION_RESOURCES[keyof typeof PERMISSION_RESOURCES];
