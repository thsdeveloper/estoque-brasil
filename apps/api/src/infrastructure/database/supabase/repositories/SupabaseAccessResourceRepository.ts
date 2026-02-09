import { SupabaseClient } from '@supabase/supabase-js';
import { AccessResource } from '../../../../domain/entities/AccessResource.js';
import { IAccessResourceRepository } from '../../../../domain/repositories/IAccessResourceRepository.js';
import {
  AccessResourceMapper,
  AccessResourceDbRow,
} from '../../../mappers/AccessMapper.js';

const ACCESS_RESOURCES_TABLE = 'access_resources';

export class SupabaseAccessResourceRepository implements IAccessResourceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(resource: AccessResource): Promise<AccessResource> {
    const { data, error } = await this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .insert({
        name: resource.name,
        display_name: resource.displayName,
        description: resource.description,
        icon: resource.icon,
        is_system: resource.isSystem,
        sort_order: resource.sortOrder,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create access resource: ${error.message}`);
    }

    return AccessResourceMapper.toDomain(data as AccessResourceDbRow);
  }

  async findById(id: string): Promise<AccessResource | null> {
    const { data, error } = await this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find access resource: ${error.message}`);
    }

    return data ? AccessResourceMapper.toDomain(data as AccessResourceDbRow) : null;
  }

  async findByName(name: string): Promise<AccessResource | null> {
    const { data, error } = await this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find access resource by name: ${error.message}`);
    }

    return data ? AccessResourceMapper.toDomain(data as AccessResourceDbRow) : null;
  }

  async findAll(): Promise<AccessResource[]> {
    const { data, error } = await this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list access resources: ${error.message}`);
    }

    return data.map(AccessResourceMapper.toDomain);
  }

  async update(resource: AccessResource): Promise<AccessResource> {
    if (!resource.id) {
      throw new Error('Access resource ID is required for update');
    }

    const { data, error } = await this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .update({
        name: resource.name,
        display_name: resource.displayName,
        description: resource.description,
        icon: resource.icon,
        sort_order: resource.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resource.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update access resource: ${error.message}`);
    }

    return AccessResourceMapper.toDomain(data as AccessResourceDbRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete access resource: ${error.message}`);
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(ACCESS_RESOURCES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check access resource existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
