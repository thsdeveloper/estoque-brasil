import { SupabaseClient } from '@supabase/supabase-js';
import { AccessPolicy } from '../../../../domain/entities/AccessPolicy.js';
import { IAccessPolicyRepository } from '../../../../domain/repositories/IAccessPolicyRepository.js';
import {
  AccessPolicyMapper,
  AccessPolicyDbRow,
} from '../../../mappers/AccessMapper.js';

const ACCESS_POLICIES_TABLE = 'access_policies';
const POLICY_PERMISSIONS_TABLE = 'policy_permissions';

const POLICY_WITH_PERMISSIONS_SELECT = `
  *,
  policy_permissions (
    permission:permissions (*)
  )
`;

export class SupabaseAccessPolicyRepository implements IAccessPolicyRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(policy: AccessPolicy): Promise<AccessPolicy> {
    const { data, error } = await this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .insert({
        name: policy.name,
        display_name: policy.displayName,
        description: policy.description,
        icon: policy.icon,
        is_system_policy: policy.isSystemPolicy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create access policy: ${error.message}`);
    }

    return AccessPolicyMapper.toDomain(data as AccessPolicyDbRow, []);
  }

  async findById(id: string): Promise<AccessPolicy | null> {
    const { data, error } = await this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .select(POLICY_WITH_PERMISSIONS_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find access policy: ${error.message}`);
    }

    return data ? AccessPolicyMapper.toDomainWithPermissions(data) : null;
  }

  async findByName(name: string): Promise<AccessPolicy | null> {
    const { data, error } = await this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .select(POLICY_WITH_PERMISSIONS_SELECT)
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find access policy by name: ${error.message}`);
    }

    return data ? AccessPolicyMapper.toDomainWithPermissions(data) : null;
  }

  async findAll(): Promise<AccessPolicy[]> {
    const { data, error } = await this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .select(POLICY_WITH_PERMISSIONS_SELECT)
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list access policies: ${error.message}`);
    }

    return data.map(AccessPolicyMapper.toDomainWithPermissions);
  }

  async update(policy: AccessPolicy): Promise<AccessPolicy> {
    if (!policy.id) {
      throw new Error('Access policy ID is required for update');
    }

    const { data, error } = await this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .update({
        name: policy.name,
        display_name: policy.displayName,
        description: policy.description,
        icon: policy.icon,
        updated_at: new Date().toISOString(),
      })
      .eq('id', policy.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update access policy: ${error.message}`);
    }

    return AccessPolicyMapper.toDomain(data as AccessPolicyDbRow, policy.permissions);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete access policy: ${error.message}`);
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(ACCESS_POLICIES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check access policy existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async setPermissions(policyId: string, permissionIds: string[]): Promise<void> {
    // Delete all existing policy permissions
    const { error: deleteError } = await this.supabase
      .from(POLICY_PERMISSIONS_TABLE)
      .delete()
      .eq('policy_id', policyId);

    if (deleteError) {
      throw new Error(`Failed to clear policy permissions: ${deleteError.message}`);
    }

    // Insert new ones
    if (permissionIds.length > 0) {
      const rows = permissionIds.map((permissionId) => ({
        policy_id: policyId,
        permission_id: permissionId,
      }));

      const { error: insertError } = await this.supabase
        .from(POLICY_PERMISSIONS_TABLE)
        .insert(rows);

      if (insertError) {
        throw new Error(`Failed to set policy permissions: ${insertError.message}`);
      }
    }
  }

  async getPermissionIds(policyId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(POLICY_PERMISSIONS_TABLE)
      .select('permission_id')
      .eq('policy_id', policyId);

    if (error) {
      throw new Error(`Failed to get policy permissions: ${error.message}`);
    }

    return data.map((row) => row.permission_id);
  }
}
