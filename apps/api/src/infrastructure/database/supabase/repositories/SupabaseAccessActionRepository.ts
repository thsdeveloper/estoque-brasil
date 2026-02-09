import { SupabaseClient } from '@supabase/supabase-js';
import { AccessAction } from '../../../../domain/entities/AccessAction.js';
import { IAccessActionRepository } from '../../../../domain/repositories/IAccessActionRepository.js';
import {
  AccessActionMapper,
  AccessActionDbRow,
} from '../../../mappers/AccessMapper.js';

const ACCESS_ACTIONS_TABLE = 'access_actions';

export class SupabaseAccessActionRepository implements IAccessActionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(action: AccessAction): Promise<AccessAction> {
    const { data, error } = await this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .insert({
        name: action.name,
        display_name: action.displayName,
        description: action.description,
        is_system: action.isSystem,
        sort_order: action.sortOrder,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create access action: ${error.message}`);
    }

    return AccessActionMapper.toDomain(data as AccessActionDbRow);
  }

  async findById(id: string): Promise<AccessAction | null> {
    const { data, error } = await this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find access action: ${error.message}`);
    }

    return data ? AccessActionMapper.toDomain(data as AccessActionDbRow) : null;
  }

  async findByName(name: string): Promise<AccessAction | null> {
    const { data, error } = await this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find access action by name: ${error.message}`);
    }

    return data ? AccessActionMapper.toDomain(data as AccessActionDbRow) : null;
  }

  async findAll(): Promise<AccessAction[]> {
    const { data, error } = await this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list access actions: ${error.message}`);
    }

    return data.map(AccessActionMapper.toDomain);
  }

  async update(action: AccessAction): Promise<AccessAction> {
    if (!action.id) {
      throw new Error('Access action ID is required for update');
    }

    const { data, error } = await this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .update({
        name: action.name,
        display_name: action.displayName,
        description: action.description,
        sort_order: action.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', action.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update access action: ${error.message}`);
    }

    return AccessActionMapper.toDomain(data as AccessActionDbRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete access action: ${error.message}`);
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(ACCESS_ACTIONS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check access action existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
