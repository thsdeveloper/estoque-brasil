import { User } from '../../domain/entities/User.js';
import { Role } from '../../domain/entities/Role.js';
import { Permission, PermissionAction } from '../../domain/entities/Permission.js';

// Database row types
export interface UserProfileDbRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleDbRow {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionDbRow {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  created_at: string;
}

export interface UserWithRolesDbRow extends UserProfileDbRow {
  user_roles: Array<{
    role: RoleDbRow & {
      role_permissions: Array<{
        permission: PermissionDbRow;
      }>;
    };
  }>;
}

// Insert/Update types
export interface UserProfileInsertRow {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
}

export interface UserProfileUpdateRow {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  updated_at: string;
}

export class PermissionMapper {
  static toDomain(row: PermissionDbRow): Permission {
    return Permission.create({
      id: row.id,
      resource: row.resource,
      action: row.action as PermissionAction,
      description: row.description,
      createdAt: new Date(row.created_at),
    });
  }
}

export class RoleMapper {
  static toDomain(row: RoleDbRow, permissions: Permission[] = []): Role {
    return Role.create({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      isSystemRole: row.is_system_role,
      permissions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toDomainWithPermissions(
    row: RoleDbRow & { role_permissions?: Array<{ permission: PermissionDbRow }> }
  ): Role {
    const permissions = row.role_permissions?.map((rp) =>
      PermissionMapper.toDomain(rp.permission)
    ) ?? [];

    return RoleMapper.toDomain(row, permissions);
  }
}

export class UserMapper {
  static toDomain(row: UserProfileDbRow, roles: Role[] = []): User {
    return User.create({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      isActive: row.is_active,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
      roles,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toDomainWithRoles(row: UserWithRolesDbRow): User {
    const roles = row.user_roles?.map((ur) =>
      RoleMapper.toDomainWithPermissions(ur.role)
    ) ?? [];

    return UserMapper.toDomain(row, roles);
  }

  static toInsertRow(user: User): UserProfileInsertRow {
    return {
      id: user.id!,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
    };
  }

  static toUpdateRow(user: User): UserProfileUpdateRow {
    return {
      full_name: user.fullName,
      phone: user.phone,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    };
  }
}
