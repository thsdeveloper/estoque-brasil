import { Role } from '../entities/Role.js';
import { Permission } from '../entities/Permission.js';

export interface IRoleRepository {
  create(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(role: Role): Promise<Role>;
  delete(id: string): Promise<void>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  assignPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  getRolePermissionIds(roleId: string): Promise<string[]>;
}

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByResourceAction(resource: string, action: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findByIds(ids: string[]): Promise<Permission[]>;
}
