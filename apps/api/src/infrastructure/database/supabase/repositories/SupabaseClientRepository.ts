import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from '../../../../domain/entities/Client.js';
import {
  IClientRepository,
  PaginationParams,
  PaginatedResult,
} from '../../../../domain/repositories/IClientRepository.js';
import { ClientMapper, ClientDbRow } from '../../../mappers/ClientMapper.js';

const TABLE_NAME = 'clients';

export class SupabaseClientRepository implements IClientRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(client: Client): Promise<Client> {
    const insertData = ClientMapper.toInsertRow(client);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return ClientMapper.toDomain(data as ClientDbRow);
  }

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find client: ${error.message}`);
    }

    return data ? ClientMapper.toDomain(data as ClientDbRow) : null;
  }

  async findByNome(nome: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('nome', nome)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find client by nome: ${error.message}`);
    }

    return data ? ClientMapper.toDomain(data as ClientDbRow) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Client>> {
    const { page, limit, search, uf } = params;
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.ilike('nome', `%${search}%`);
    }
    if (uf) {
      countQuery = countQuery.eq('uf', uf);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count clients: ${countError.message}`);
    }

    const total = count ?? 0;

    // Build data query with filters
    let dataQuery = this.supabase
      .from(TABLE_NAME)
      .select('*');

    if (search) {
      dataQuery = dataQuery.ilike('nome', `%${search}%`);
    }
    if (uf) {
      dataQuery = dataQuery.eq('uf', uf);
    }

    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list clients: ${error.message}`);
    }

    const clients = (data as ClientDbRow[]).map(ClientMapper.toDomain);

    return {
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(client: Client): Promise<Client> {
    if (!client.id) {
      throw new Error('Client ID is required for update');
    }

    const updateData = ClientMapper.toUpdateRow(client);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', client.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return ClientMapper.toDomain(data as ClientDbRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  async existsByNome(nome: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(TABLE_NAME)
      .select('id', { count: 'exact', head: true })
      .ilike('nome', nome);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check client existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
