import { User, Role, Permission } from '../../../domain/entities/index.js';

export interface PermissionResponseDTO {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RoleResponseDTO {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystemRole: boolean;
  permissions?: PermissionResponseDTO[];
}

export interface UserResponseDTO {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  roles: RoleResponseDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUserResponseDTO {
  data: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserPermissionsResponseDTO {
  userId: string;
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

export function toPermissionResponseDTO(permission: Permission): PermissionResponseDTO {
  return {
    id: permission.id!,
    resource: permission.resource,
    action: permission.action,
    description: permission.description,
  };
}

export function toRoleResponseDTO(role: Role, includePermissions = false): RoleResponseDTO {
  return {
    id: role.id!,
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    isSystemRole: role.isSystemRole,
    ...(includePermissions && {
      permissions: role.permissions.map(toPermissionResponseDTO),
    }),
  };
}

export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id!,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    roles: user.roles.map((role) => toRoleResponseDTO(role)),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toUserPermissionsResponseDTO(user: User): UserPermissionsResponseDTO {
  return {
    userId: user.id!,
    permissions: user.permissions,
  };
}

// Shorter aliases for convenience
export const toPermissionResponse = toPermissionResponseDTO;
export const toRoleResponse = (role: Role) => toRoleResponseDTO(role, true);
export const toUserResponse = toUserResponseDTO;
