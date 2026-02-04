import { SupabaseClient } from '@supabase/supabase-js';
import { Setor } from '../../../../domain/entities/Setor.js';
import { ISetorRepository } from '../../../../domain/repositories/ISetorRepository.js';
import { SetorMapper, SetorDbRow } from '../../../mappers/SetorMapper.js';

const TABLE_NAME = 'setores';

export class SupabaseSetorRepository implements ISetorRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(setor: Setor): Promise<Setor> {
    const insertData = SetorMapper.toInsertRow(setor);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create setor: ${error.message}`);
    }

    return SetorMapper.toDomain(data as SetorDbRow);
  }

  async findById(id: number): Promise<Setor | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find setor: ${error.message}`);
    }

    return data ? SetorMapper.toDomain(data as SetorDbRow) : null;
  }

  async findByInventario(idInventario: number): Promise<Setor[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario', idInventario)
      .order('prefixo', { ascending: true })
      .order('inicio', { ascending: true });

    if (error) {
      throw new Error(`Failed to find setores by inventario: ${error.message}`);
    }

    return (data as SetorDbRow[]).map(SetorMapper.toDomain);
  }

  async update(setor: Setor): Promise<Setor> {
    if (!setor.id) {
      throw new Error('Setor ID is required for update');
    }

    const updateData = SetorMapper.toUpdateRow(setor);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', setor.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update setor: ${error.message}`);
    }

    return SetorMapper.toDomain(data as SetorDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete setor: ${error.message}`);
    }
  }

  async deleteByInventario(idInventario: number): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id_inventario', idInventario);

    if (error) {
      throw new Error(`Failed to delete setores by inventario: ${error.message}`);
    }
  }
}
