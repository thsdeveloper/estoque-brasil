import { SupabaseClient } from '@supabase/supabase-js';
import { Empresa } from '../../../../domain/entities/Empresa.js';
import {
  IEmpresaRepository,
  EmpresaPaginationParams,
} from '../../../../domain/repositories/IEmpresaRepository.js';
import { PaginatedResult } from '../../../../domain/repositories/IClientRepository.js';
import { EmpresaMapper, EmpresaDbRow } from '../../../mappers/EmpresaMapper.js';

const TABLE_NAME = 'empresas';

export class SupabaseEmpresaRepository implements IEmpresaRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(empresa: Empresa): Promise<Empresa> {
    const insertData = EmpresaMapper.toInsertRow(empresa);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create empresa: ${error.message}`);
    }

    return EmpresaMapper.toDomain(data as EmpresaDbRow);
  }

  async findById(id: number): Promise<Empresa | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find empresa: ${error.message}`);
    }

    return data ? EmpresaMapper.toDomain(data as EmpresaDbRow) : null;
  }

  async findByCnpj(cnpj: string): Promise<Empresa | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('cnpj', cnpj)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find empresa by CNPJ: ${error.message}`);
    }

    return data ? EmpresaMapper.toDomain(data as EmpresaDbRow) : null;
  }

  async findAll(params: EmpresaPaginationParams): Promise<PaginatedResult<Empresa>> {
    const { page, limit, search, ativo } = params;
    const offset = (page - 1) * limit;

    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`razao_social.ilike.%${search}%,nome_fantasia.ilike.%${search}%,cnpj.ilike.%${search}%`);
    }
    if (ativo !== undefined) {
      countQuery = countQuery.eq('ativo', ativo);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count empresas: ${countError.message}`);
    }

    const total = count ?? 0;

    let dataQuery = this.supabase.from(TABLE_NAME).select('*');

    if (search) {
      dataQuery = dataQuery.or(`razao_social.ilike.%${search}%,nome_fantasia.ilike.%${search}%,cnpj.ilike.%${search}%`);
    }
    if (ativo !== undefined) {
      dataQuery = dataQuery.eq('ativo', ativo);
    }

    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list empresas: ${error.message}`);
    }

    const empresas = (data as EmpresaDbRow[]).map(EmpresaMapper.toDomain);

    return {
      data: empresas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(empresa: Empresa): Promise<Empresa> {
    if (!empresa.id) {
      throw new Error('Empresa ID is required for update');
    }

    const updateData = EmpresaMapper.toUpdateRow(empresa);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', empresa.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update empresa: ${error.message}`);
    }

    return EmpresaMapper.toDomain(data as EmpresaDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete empresa: ${error.message}`);
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
      throw new Error(`Failed to check empresa existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
