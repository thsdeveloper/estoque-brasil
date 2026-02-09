import { AccessResource } from '../../domain/entities/AccessResource.js';
import { AccessAction } from '../../domain/entities/AccessAction.js';
import { AccessPolicy } from '../../domain/entities/AccessPolicy.js';
import { Permission } from '../../domain/entities/Permission.js';
import { PermissionDbRow, PermissionMapper } from './UserMapper.js';

// Database row types
export interface AccessResourceDbRow {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AccessActionDbRow {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AccessPolicyDbRow {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_system_policy: boolean;
  created_at: string;
  updated_at: string;
}

export class AccessResourceMapper {
  static toDomain(row: AccessResourceDbRow): AccessResource {
    return AccessResource.create({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      icon: row.icon,
      isSystem: row.is_system,
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

export class AccessActionMapper {
  static toDomain(row: AccessActionDbRow): AccessAction {
    return AccessAction.create({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      isSystem: row.is_system,
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

export class AccessPolicyMapper {
  static toDomain(row: AccessPolicyDbRow, permissions: Permission[] = []): AccessPolicy {
    return AccessPolicy.create({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      icon: row.icon,
      isSystemPolicy: row.is_system_policy,
      permissions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toDomainWithPermissions(
    row: AccessPolicyDbRow & { policy_permissions?: Array<{ permission: PermissionDbRow }> }
  ): AccessPolicy {
    const permissions = row.policy_permissions?.map((pp) =>
      PermissionMapper.toDomain(pp.permission)
    ) ?? [];

    return AccessPolicyMapper.toDomain(row, permissions);
  }
}
