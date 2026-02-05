import { SupabaseClient } from '@supabase/supabase-js';
import { TemplateImportacao } from '../../../../domain/entities/TemplateImportacao.js';
import {
  ITemplateImportacaoRepository,
  TemplateImportacaoPaginationParams,
} from '../../../../domain/repositories/ITemplateImportacaoRepository.js';
import { PaginatedResult } from '../../../../domain/repositories/IClientRepository.js';
import { TemplateImportacaoMapper, TemplateImportacaoDbRow } from '../../../mappers/TemplateImportacaoMapper.js';

const TABLE_NAME = 'templates_importacao';

export class SupabaseTemplateImportacaoRepository implements ITemplateImportacaoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(template: TemplateImportacao): Promise<TemplateImportacao> {
    const insertData = TemplateImportacaoMapper.toInsertRow(template);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return TemplateImportacaoMapper.toDomain(data as TemplateImportacaoDbRow);
  }

  async findById(id: number): Promise<TemplateImportacao | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find template: ${error.message}`);
    }

    return data ? TemplateImportacaoMapper.toDomain(data as TemplateImportacaoDbRow) : null;
  }

  async findByDescricao(descricao: string): Promise<TemplateImportacao | null> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('descricao', descricao)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find template by descricao: ${error.message}`);
    }

    return data ? TemplateImportacaoMapper.toDomain(data as TemplateImportacaoDbRow) : null;
  }

  async findAll(params: TemplateImportacaoPaginationParams): Promise<PaginatedResult<TemplateImportacao>> {
    const { page, limit, search, tipo } = params;
    const offset = (page - 1) * limit;

    let countQuery = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.ilike('descricao', `%${search}%`);
    }
    if (tipo) {
      countQuery = countQuery.eq('tipo', tipo);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count templates: ${countError.message}`);
    }

    const total = count ?? 0;

    let dataQuery = this.supabase.from(TABLE_NAME).select('*');

    if (search) {
      dataQuery = dataQuery.ilike('descricao', `%${search}%`);
    }
    if (tipo) {
      dataQuery = dataQuery.eq('tipo', tipo);
    }

    const { data, error } = await dataQuery
      .order('descricao', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list templates: ${error.message}`);
    }

    const templates = (data as TemplateImportacaoDbRow[]).map(TemplateImportacaoMapper.toDomain);

    return {
      data: templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(template: TemplateImportacao): Promise<TemplateImportacao> {
    if (!template.id) {
      throw new Error('Template ID is required for update');
    }

    const updateData = TemplateImportacaoMapper.toUpdateRow(template);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', template.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }

    return TemplateImportacaoMapper.toDomain(data as TemplateImportacaoDbRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }
}
