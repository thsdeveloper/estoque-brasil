import { SupabaseClient } from '@supabase/supabase-js';
import { Role } from '../../../../domain/entities/Role.js';
import { Permission } from '../../../../domain/entities/Permission.js';
import {
  IRoleRepository,
  IPermissionRepository,
} from '../../../../domain/repositories/IRoleRepository.js';
import {
  RoleMapper,
  PermissionMapper,
  RoleDbRow,
  PermissionDbRow,
} from '../../../mappers/UserMapper.js';

const ROLES_TABLE = 'roles';
const PERMISSIONS_TABLE = 'permissions';
const ROLE_PERMISSIONS_TABLE = 'role_permissions';

const ROLE_WITH_PERMISSIONS_SELECT = `
  *,
  role_permissions (
    permission:permissions (*)
  )
`;

export class SupabaseRoleRepository implements IRoleRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(role: Role): Promise<Role> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .insert({
        name: role.name,
        display_name: role.displayName,
        description: role.description,
        is_system_role: role.isSystemRole,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }

    return RoleMapper.toDomain(data as RoleDbRow, []);
  }

  async findById(id: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .select(ROLE_WITH_PERMISSIONS_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find role: ${error.message}`);
    }

    return data ? RoleMapper.toDomainWithPermissions(data) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .select(ROLE_WITH_PERMISSIONS_SELECT)
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find role by name: ${error.message}`);
    }

    return data ? RoleMapper.toDomainWithPermissions(data) : null;
  }

  async findAll(): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .select(ROLE_WITH_PERMISSIONS_SELECT)
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list roles: ${error.message}`);
    }

    return data.map(RoleMapper.toDomainWithPermissions);
  }

  async update(role: Role): Promise<Role> {
    if (!role.id) {
      throw new Error('Role ID is required for update');
    }

    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .update({
        name: role.name,
        display_name: role.displayName,
        description: role.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', role.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }

    return RoleMapper.toDomain(data as RoleDbRow, role.permissions);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(ROLES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(ROLES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check role existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    const { error } = await this.supabase.from(ROLE_PERMISSIONS_TABLE).insert({
      role_id: roleId,
      permission_id: permissionId,
    });

    if (error) {
      // Ignore duplicate key error
      if (error.code !== '23505') {
        throw new Error(`Failed to assign permission: ${error.message}`);
      }
    }
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const { error } = await this.supabase
      .from(ROLE_PERMISSIONS_TABLE)
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) {
      throw new Error(`Failed to remove permission: ${error.message}`);
    }
  }

  async getRolePermissionIds(roleId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(ROLE_PERMISSIONS_TABLE)
      .select('permission_id')
      .eq('role_id', roleId);

    if (error) {
      throw new Error(`Failed to get role permissions: ${error.message}`);
    }

    return data.map((row) => row.permission_id);
  }
}

export class SupabasePermissionRepository implements IPermissionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Permission | null> {
    const { data, error } = await this.supabase
      .from(PERMISSIONS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find permission: ${error.message}`);
    }

    return data ? PermissionMapper.toDomain(data as PermissionDbRow) : null;
  }

  async findByResourceAction(resource: string, action: string): Promise<Permission | null> {
    const { data, error } = await this.supabase
      .from(PERMISSIONS_TABLE)
      .select('*')
      .eq('resource', resource)
      .eq('action', action)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find permission: ${error.message}`);
    }

    return data ? PermissionMapper.toDomain(data as PermissionDbRow) : null;
  }

  async findAll(): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from(PERMISSIONS_TABLE)
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) {
      throw new Error(`Failed to list permissions: ${error.message}`);
    }

    return data.map(PermissionMapper.toDomain);
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from(PERMISSIONS_TABLE)
      .select('*')
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to find permissions: ${error.message}`);
    }

    return data.map(PermissionMapper.toDomain);
  }
}
