import { SupabaseClient } from '@supabase/supabase-js';
import { Loja } from '../../../../domain/entities/Loja.js';
import {
  ILojaRepository,
  LojaPaginationParams,
} from '../../../../domain/repositories/ILojaRepository.js';
import { PaginatedResult } from '../../../../domain/repositories/IClientRepository.js';
import { LojaMapper, LojaDbRow } from '../../../mappers/LojaMapper.js';

const TABLE_NAME = 'lojas';

export class SupabaseLojaRepository implements ILojaRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(loja: Loja): Promise<Loja> {
    const insertData = LojaMapper.toInsertRow(loja);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create loja: ${error.message}`);
    }

    return LojaMapper.toDomain(data as LojaDbRow);
  }

  async findById(id: number): Promise<Loja | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find loja: ${error.message}`);
    }

    return data ? LojaMapper.toDomain(data as LojaDbRow) : null;
  }

  async findByCnpj(cnpj: string): Promise<Loja | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('cnpj', cnpj)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find loja by CNPJ: ${error.message}`);
    }

    return data ? LojaMapper.toDomain(data as LojaDbRow) : null;
  }

  async findByCliente(idCliente: string): Promise<Loja[]> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id_cliente', idCliente)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Failed to find lojas by cliente: ${error.message}`);
    }

    return (data as LojaDbRow[]).map(LojaMapper.toDomain);
  }

  async findAll(params: LojaPaginationParams): Promise<PaginatedResult<Loja>> {
    const { page, limit, search, idCliente, idEmpresa } = params;
    const offset = (page - 1) * limit;

    // If filtering by empresa, get client IDs for that empresa first
    let clientIdsForEmpresa: string[] | null = null;
    if (idEmpresa) {
      const { data: clientRows, error: clientError } = await this.supabase
        .from('clients')
        .select('id')
        .eq('id_empresa', idEmpresa);

      if (clientError) {
        throw new Error(`Failed to fetch clients for empresa: ${clientError.message}`);
      }
      clientIdsForEmpresa = (clientRows ?? []).map((r: { id: string }) => r.id);
    }

    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`nome.ilike.%${search}%,cnpj.ilike.%${search}%`);
    }
    if (idCliente) {
      countQuery = countQuery.eq('id_cliente', idCliente);
    }
    if (clientIdsForEmpresa !== null) {
      countQuery = countQuery.in('id_cliente', clientIdsForEmpresa);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count lojas: ${countError.message}`);
    }

    const total = count ?? 0;

    let dataQuery = this.supabase.from(TABLE_NAME).select('*');

    if (search) {
      dataQuery = dataQuery.or(`nome.ilike.%${search}%,cnpj.ilike.%${search}%`);
    }
    if (idCliente) {
      dataQuery = dataQuery.eq('id_cliente', idCliente);
    }
    if (clientIdsForEmpresa !== null) {
      dataQuery = dataQuery.in('id_cliente', clientIdsForEmpresa);
    }

    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list lojas: ${error.message}`);
    }

    const lojas = (data as LojaDbRow[]).map(LojaMapper.toDomain);

    return {
      data: lojas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(loja: Loja): Promise<Loja> {
    if (!loja.id) {
      throw new Error('Loja ID is required for update');
    }

    const updateData = LojaMapper.toUpdateRow(loja);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', loja.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update loja: ${error.message}`);
    }

    return LojaMapper.toDomain(data as LojaDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete loja: ${error.message}`);
    }
  }

  async existsByCnpj(cnpj: string, excludeId?: number): Promise<boolean> {
    let query = this.supabase
      .from(TABLE_NAME)
      .select('id', { count: 'exact', head: true })
      .eq('cnpj', cnpj);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check loja existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
