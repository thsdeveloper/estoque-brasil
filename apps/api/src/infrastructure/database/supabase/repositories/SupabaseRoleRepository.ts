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
const ROLE_POLICIES_TABLE = 'role_policies';

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

    return RoleMapper.toDomain(data as RoleDbRow);
  }

  async findById(id: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find role: ${error.message}`);
    }

    return data ? RoleMapper.toDomain(data as RoleDbRow) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find role by name: ${error.message}`);
    }

    return data ? RoleMapper.toDomain(data as RoleDbRow) : null;
  }

  async findAll(): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from(ROLES_TABLE)
      .select('*')
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list roles: ${error.message}`);
    }

    return data.map((row: RoleDbRow) => RoleMapper.toDomain(row));
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

    return RoleMapper.toDomain(data as RoleDbRow);
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

  async setPolicies(roleId: string, policyIds: string[]): Promise<void> {
    // Delete all existing role policies
    const { error: deleteError } = await this.supabase
      .from(ROLE_POLICIES_TABLE)
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      throw new Error(`Failed to clear role policies: ${deleteError.message}`);
    }

    // Insert new ones
    if (policyIds.length > 0) {
      const rows = policyIds.map((policyId) => ({
        role_id: roleId,
        policy_id: policyId,
      }));

      const { error: insertError } = await this.supabase
        .from(ROLE_POLICIES_TABLE)
        .insert(rows);

      if (insertError) {
        throw new Error(`Failed to set role policies: ${insertError.message}`);
      }
    }
  }

  async getRolePolicyIds(roleId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(ROLE_POLICIES_TABLE)
      .select('policy_id')
      .eq('role_id', roleId);

    if (error) {
      throw new Error(`Failed to get role policies: ${error.message}`);
    }

    return data.map((row) => row.policy_id);
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
