import { SupabaseClient } from '@supabase/supabase-js';
import { InventarioContagem } from '../../../../domain/entities/InventarioContagem.js';
import {
  IInventarioContagemRepository,
  InventarioContagemPaginationParams,
} from '../../../../domain/repositories/IInventarioContagemRepository.js';
import { PaginatedResult } from '../../../../domain/repositories/IClientRepository.js';
import { InventarioContagemMapper, InventarioContagemDbRow } from '../../../mappers/InventarioContagemMapper.js';

const TABLE_NAME = 'inventarios_contagens';

export class SupabaseInventarioContagemRepository implements IInventarioContagemRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(contagem: InventarioContagem): Promise<InventarioContagem> {
    const insertData = InventarioContagemMapper.toInsertRow(contagem);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create contagem: ${error.message}`);
    }

    return InventarioContagemMapper.toDomain(data as InventarioContagemDbRow);
  }

  async findById(id: number): Promise<InventarioContagem | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find contagem: ${error.message}`);
    }

    return data ? InventarioContagemMapper.toDomain(data as InventarioContagemDbRow) : null;
  }

  async findBySetor(idInventarioSetor: number): Promise<InventarioContagem[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario_setor', idInventarioSetor)
      .order('data', { ascending: false });

    if (error) {
      throw new Error(`Failed to find contagens by setor: ${error.message}`);
    }

    return (data as InventarioContagemDbRow[]).map(InventarioContagemMapper.toDomain);
  }

  async findByProduto(idProduto: number): Promise<InventarioContagem[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_produto', idProduto)
      .order('data', { ascending: false });

    if (error) {
      throw new Error(`Failed to find contagens by produto: ${error.message}`);
    }

    return (data as InventarioContagemDbRow[]).map(InventarioContagemMapper.toDomain);
  }

  async findDivergentes(idInventarioSetor: number): Promise<InventarioContagem[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario_setor', idInventarioSetor)
      .eq('divergente', true)
      .order('data', { ascending: false });

    if (error) {
      throw new Error(`Failed to find divergent contagens: ${error.message}`);
    }

    return (data as InventarioContagemDbRow[]).map(InventarioContagemMapper.toDomain);
  }

  async findAll(params: InventarioContagemPaginationParams): Promise<PaginatedResult<InventarioContagem>> {
    const { page, limit, idInventarioSetor, idProduto, divergente } = params;
    const offset = (page - 1) * limit;

    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (idInventarioSetor) {
      countQuery = countQuery.eq('id_inventario_setor', idInventarioSetor);
    }
    if (idProduto) {
      countQuery = countQuery.eq('id_produto', idProduto);
    }
    if (divergente !== undefined) {
      countQuery = countQuery.eq('divergente', divergente);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count contagens: ${countError.message}`);
    }

    const total = count ?? 0;

    let dataQuery = this.supabase.from(TABLE_NAME).select('*');

    if (idInventarioSetor) {
      dataQuery = dataQuery.eq('id_inventario_setor', idInventarioSetor);
    }
    if (idProduto) {
      dataQuery = dataQuery.eq('id_produto', idProduto);
    }
    if (divergente !== undefined) {
      dataQuery = dataQuery.eq('divergente', divergente);
    }

    const { data, error } = await dataQuery
      .order('data', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list contagens: ${error.message}`);
    }

    const contagens = (data as InventarioContagemDbRow[]).map(InventarioContagemMapper.toDomain);

    return {
      data: contagens,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(contagem: InventarioContagem): Promise<InventarioContagem> {
    if (!contagem.id) {
      throw new Error('Contagem ID is required for update');
    }

    const updateData = InventarioContagemMapper.toUpdateRow(contagem);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', contagem.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update contagem: ${error.message}`);
    }

    return InventarioContagemMapper.toDomain(data as InventarioContagemDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete contagem: ${error.message}`);
    }
  }

  async deleteBySetor(idInventarioSetor: number): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id_inventario_setor', idInventarioSetor);

    if (error) {
      throw new Error(`Failed to delete contagens by setor: ${error.message}`);
    }
  }

  async sumQuantidadeByProduto(idProduto: number): Promise<number> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('quantidade')
      .eq('id_produto', idProduto);

    if (error) {
      throw new Error(`Failed to sum quantidade: ${error.message}`);
    }

    return (data as { quantidade: number }[]).reduce((sum, row) => sum + row.quantidade, 0);
  }
}
