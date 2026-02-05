import { SupabaseClient } from '@supabase/supabase-js';
import { InventarioProduto } from '../../../../domain/entities/InventarioProduto.js';
import {
  IInventarioProdutoRepository,
  InventarioProdutoPaginationParams,
} from '../../../../domain/repositories/IInventarioProdutoRepository.js';
import { PaginatedResult } from '../../../../domain/repositories/IClientRepository.js';
import { InventarioProdutoMapper, InventarioProdutoDbRow } from '../../../mappers/InventarioProdutoMapper.js';

const TABLE_NAME = 'inventarios_produtos';

export class SupabaseInventarioProdutoRepository implements IInventarioProdutoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(produto: InventarioProduto): Promise<InventarioProduto> {
    const insertData = InventarioProdutoMapper.toInsertRow(produto);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create produto: ${error.message}`);
    }

    return InventarioProdutoMapper.toDomain(data as InventarioProdutoDbRow);
  }

  async createMany(produtos: InventarioProduto[]): Promise<InventarioProduto[]> {
    const insertData = produtos.map(InventarioProdutoMapper.toInsertRow);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select();

    if (error) {
      throw new Error(`Failed to create produtos: ${error.message}`);
    }

    return (data as InventarioProdutoDbRow[]).map(InventarioProdutoMapper.toDomain);
  }

  async findById(id: number): Promise<InventarioProduto | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find produto: ${error.message}`);
    }

    return data ? InventarioProdutoMapper.toDomain(data as InventarioProdutoDbRow) : null;
  }

  async findByCodigoBarras(idInventario: number, codigoBarras: string): Promise<InventarioProduto | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario', idInventario)
      .eq('codigo_barras', codigoBarras)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find produto by codigo_barras: ${error.message}`);
    }

    return data ? InventarioProdutoMapper.toDomain(data as InventarioProdutoDbRow) : null;
  }

  async findByCodigoInterno(idInventario: number, codigoInterno: string): Promise<InventarioProduto | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario', idInventario)
      .eq('codigo_interno', codigoInterno)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find produto by codigo_interno: ${error.message}`);
    }

    return data ? InventarioProdutoMapper.toDomain(data as InventarioProdutoDbRow) : null;
  }

  async findByInventario(idInventario: number): Promise<InventarioProduto[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario', idInventario)
      .order('descricao', { ascending: true });

    if (error) {
      throw new Error(`Failed to find produtos by inventario: ${error.message}`);
    }

    return (data as InventarioProdutoDbRow[]).map(InventarioProdutoMapper.toDomain);
  }

  async findDivergentes(idInventario: number): Promise<InventarioProduto[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario', idInventario)
      .eq('divergente', true)
      .order('descricao', { ascending: true });

    if (error) {
      throw new Error(`Failed to find divergent produtos: ${error.message}`);
    }

    return (data as InventarioProdutoDbRow[]).map(InventarioProdutoMapper.toDomain);
  }

  async findAll(params: InventarioProdutoPaginationParams): Promise<PaginatedResult<InventarioProduto>> {
    const { page, limit, idInventario, search, divergente, codigoBarras, codigoInterno } = params;
    const offset = (page - 1) * limit;

    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('id_inventario', idInventario);

    if (search) {
      countQuery = countQuery.or(`descricao.ilike.%${search}%,codigo_barras.ilike.%${search}%,codigo_interno.ilike.%${search}%`);
    }
    if (divergente !== undefined) {
      countQuery = countQuery.eq('divergente', divergente);
    }
    if (codigoBarras) {
      countQuery = countQuery.eq('codigo_barras', codigoBarras);
    }
    if (codigoInterno) {
      countQuery = countQuery.eq('codigo_interno', codigoInterno);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count produtos: ${countError.message}`);
    }

    const total = count ?? 0;

    let dataQuery = this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_inventario', idInventario);

    if (search) {
      dataQuery = dataQuery.or(`descricao.ilike.%${search}%,codigo_barras.ilike.%${search}%,codigo_interno.ilike.%${search}%`);
    }
    if (divergente !== undefined) {
      dataQuery = dataQuery.eq('divergente', divergente);
    }
    if (codigoBarras) {
      dataQuery = dataQuery.eq('codigo_barras', codigoBarras);
    }
    if (codigoInterno) {
      dataQuery = dataQuery.eq('codigo_interno', codigoInterno);
    }

    const { data, error } = await dataQuery
      .order('descricao', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list produtos: ${error.message}`);
    }

    const produtos = (data as InventarioProdutoDbRow[]).map(InventarioProdutoMapper.toDomain);

    return {
      data: produtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(produto: InventarioProduto): Promise<InventarioProduto> {
    if (!produto.id) {
      throw new Error('Produto ID is required for update');
    }

    const updateData = InventarioProdutoMapper.toUpdateRow(produto);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', produto.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update produto: ${error.message}`);
    }

    return InventarioProdutoMapper.toDomain(data as InventarioProdutoDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete produto: ${error.message}`);
    }
  }

  async deleteByInventario(idInventario: number): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id_inventario', idInventario);

    if (error) {
      throw new Error(`Failed to delete produtos by inventario: ${error.message}`);
    }
  }

  async countByInventario(idInventario: number): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('id_inventario', idInventario);

    if (error) {
      throw new Error(`Failed to count produtos: ${error.message}`);
    }

    return count ?? 0;
  }

  async countDivergentesByInventario(idInventario: number): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('id_inventario', idInventario)
      .eq('divergente', true);

    if (error) {
      throw new Error(`Failed to count divergent produtos: ${error.message}`);
    }

    return count ?? 0;
  }
}
