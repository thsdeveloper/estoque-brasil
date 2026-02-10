import { SupabaseClient } from '@supabase/supabase-js';
import { Inventario } from '../../../../domain/entities/Inventario.js';
import {
  IInventarioRepository,
  InventarioPaginationParams,
} from '../../../../domain/repositories/IInventarioRepository.js';
import { PaginatedResult } from '../../../../domain/repositories/IClientRepository.js';
import { InventarioMapper, InventarioDbRow } from '../../../mappers/InventarioMapper.js';

const TABLE_NAME = 'inventarios';

export class SupabaseInventarioRepository implements IInventarioRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(inventario: Inventario): Promise<Inventario> {
    const insertData = InventarioMapper.toInsertRow(inventario);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inventario: ${error.message}`);
    }

    return InventarioMapper.toDomain(data as InventarioDbRow);
  }

  async findById(id: number): Promise<Inventario | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*, lojas(nome, cnpj, clients(nome)), user_profiles(full_name)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find inventario: ${error.message}`);
    }

    return data ? InventarioMapper.toDomain(data as InventarioDbRow) : null;
  }

  async findByLoja(idLoja: number): Promise<Inventario[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_loja', idLoja)
      .order('data_inicio', { ascending: false });

    if (error) {
      throw new Error(`Failed to find inventarios by loja: ${error.message}`);
    }

    return (data as InventarioDbRow[]).map(InventarioMapper.toDomain);
  }

  async findByEmpresa(idEmpresa: number): Promise<Inventario[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_empresa', idEmpresa)
      .order('data_inicio', { ascending: false });

    if (error) {
      throw new Error(`Failed to find inventarios by empresa: ${error.message}`);
    }

    return (data as InventarioDbRow[]).map(InventarioMapper.toDomain);
  }

  async findAtivo(idLoja: number): Promise<Inventario | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_loja', idLoja)
      .eq('ativo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find active inventario: ${error.message}`);
    }

    return data ? InventarioMapper.toDomain(data as InventarioDbRow) : null;
  }

  async findAll(params: InventarioPaginationParams): Promise<PaginatedResult<Inventario>> {
    const { page, limit, idLoja, idEmpresa, ativo, dataInicio, dataTermino, search, userId } = params;
    const offset = (page - 1) * limit;

    // When filtering by operator, get allowed inventario IDs
    let allowedInventarioIds: number[] | undefined;
    if (userId) {
      const { data: operadorLinks, error: operadorError } = await this.supabase
        .from('inventarios_operadores')
        .select('id_inventario')
        .eq('user_id', userId);

      if (operadorError) {
        throw new Error(`Failed to check operator inventarios: ${operadorError.message}`);
      }

      allowedInventarioIds = operadorLinks?.map((row: { id_inventario: number }) => row.id_inventario) ?? [];
      if (allowedInventarioIds.length === 0) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // When searching by client name, we need to find matching loja IDs first
    let searchLojaIds: number[] | undefined;
    if (search) {
      const { data: matchingLojas } = await this.supabase
        .from('lojas')
        .select('id, clients!inner(nome)')
        .ilike('clients.nome', `%${search}%`);

      searchLojaIds = matchingLojas?.map((l: { id: number }) => l.id) ?? [];
      if (searchLojaIds.length === 0) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // Select with joined loja, client, and leader data
    const selectStr = '*, lojas(nome, cnpj, clients(nome)), user_profiles(full_name)';

    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select(selectStr, { count: 'exact', head: true });

    if (allowedInventarioIds) {
      countQuery = countQuery.in('id', allowedInventarioIds);
    }
    if (searchLojaIds) {
      countQuery = countQuery.in('id_loja', searchLojaIds);
    }
    if (idLoja) {
      countQuery = countQuery.eq('id_loja', idLoja);
    }
    if (idEmpresa) {
      countQuery = countQuery.eq('id_empresa', idEmpresa);
    }
    if (ativo !== undefined) {
      countQuery = countQuery.eq('ativo', ativo);
    }
    if (dataInicio) {
      countQuery = countQuery.gte('data_inicio', dataInicio.toISOString());
    }
    if (dataTermino) {
      countQuery = countQuery.lte('data_inicio', dataTermino.toISOString());
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count inventarios: ${countError.message}`);
    }

    const total = count ?? 0;

    let dataQuery = this.supabase.from(TABLE_NAME).select(selectStr);

    if (allowedInventarioIds) {
      dataQuery = dataQuery.in('id', allowedInventarioIds);
    }
    if (searchLojaIds) {
      dataQuery = dataQuery.in('id_loja', searchLojaIds);
    }
    if (idLoja) {
      dataQuery = dataQuery.eq('id_loja', idLoja);
    }
    if (idEmpresa) {
      dataQuery = dataQuery.eq('id_empresa', idEmpresa);
    }
    if (ativo !== undefined) {
      dataQuery = dataQuery.eq('ativo', ativo);
    }
    if (dataInicio) {
      dataQuery = dataQuery.gte('data_inicio', dataInicio.toISOString());
    }
    if (dataTermino) {
      dataQuery = dataQuery.lte('data_inicio', dataTermino.toISOString());
    }

    const { data, error } = await dataQuery
      .order('data_inicio', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list inventarios: ${error.message}`);
    }

    const inventarios = (data as InventarioDbRow[]).map(InventarioMapper.toDomain);

    return {
      data: inventarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(inventario: Inventario): Promise<Inventario> {
    if (!inventario.id) {
      throw new Error('Inventario ID is required for update');
    }

    const updateData = InventarioMapper.toUpdateRow(inventario);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', inventario.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update inventario: ${error.message}`);
    }

    return InventarioMapper.toDomain(data as InventarioDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete inventario: ${error.message}`);
    }
  }

  async existsAtivo(idLoja: number, excludeId?: number): Promise<boolean> {
    let query = this.supabase
      .from(TABLE_NAME)
      .select('id', { count: 'exact', head: true })
      .eq('id_loja', idLoja)
      .eq('ativo', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check active inventario existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async hasContagens(inventarioId: number): Promise<boolean> {
    // contagens reference setores via id_inventario_setor, setores have id_inventario
    const { data: setores, error: setoresError } = await this.supabase
      .from('setores')
      .select('id')
      .eq('id_inventario', inventarioId);

    if (setoresError) {
      throw new Error(`Failed to check setores: ${setoresError.message}`);
    }

    if (!setores || setores.length === 0) return false;

    const setorIds = setores.map((s: { id: number }) => s.id);

    const { count, error } = await this.supabase
      .from('inventarios_contagens')
      .select('id', { count: 'exact', head: true })
      .in('id_inventario_setor', setorIds)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check contagens: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async getInventariosComContagens(ids: number[]): Promise<Set<number>> {
    if (ids.length === 0) return new Set();

    // Get all setores for these inventarios
    const { data: setores, error: setoresError } = await this.supabase
      .from('setores')
      .select('id, id_inventario')
      .in('id_inventario', ids);

    if (setoresError) {
      throw new Error(`Failed to check setores batch: ${setoresError.message}`);
    }

    if (!setores || setores.length === 0) return new Set();

    const setorIds = setores.map((s: { id: number }) => s.id);
    const setorToInventario = new Map<number, number>();
    for (const s of setores as Array<{ id: number; id_inventario: number }>) {
      setorToInventario.set(s.id, s.id_inventario);
    }

    // Find which setores have contagens
    const { data: contagens, error } = await this.supabase
      .from('inventarios_contagens')
      .select('id_inventario_setor')
      .in('id_inventario_setor', setorIds);

    if (error) {
      throw new Error(`Failed to check contagens batch: ${error.message}`);
    }

    const result = new Set<number>();
    for (const c of contagens as Array<{ id_inventario_setor: number }>) {
      const inventarioId = setorToInventario.get(c.id_inventario_setor);
      if (inventarioId !== undefined) {
        result.add(inventarioId);
      }
    }

    return result;
  }
}
