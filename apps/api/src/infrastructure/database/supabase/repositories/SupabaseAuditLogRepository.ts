import { SupabaseClient } from '@supabase/supabase-js';
import { AuditLog } from '../../../../domain/entities/AuditLog.js';
import { IAuditLogRepository, AuditLogFilters, PaginatedResult } from '../../../../domain/repositories/IAuditLogRepository.js';
import { AuditLogMapper, AuditLogDbRow } from '../../../mappers/AuditLogMapper.js';

const TABLE_NAME = 'audit_logs';

export class SupabaseAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const insertData = AuditLogMapper.toInsertRow(auditLog);

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    return AuditLogMapper.toDomain(data as AuditLogDbRow);
  }

  async findAll(filters: AuditLogFilters, page: number, limit: number): Promise<PaginatedResult<AuditLog>> {
    let query = this.supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' });

    if (filters.idInventario) {
      query = query.eq('id_inventario', filters.idInventario);
    }

    if (filters.idUsuario) {
      query = query.eq('id_usuario', filters.idUsuario);
    }

    if (filters.acao) {
      query = query.eq('acao', filters.acao);
    }

    if (filters.dataInicio) {
      query = query.gte('created_at', filters.dataInicio.toISOString());
    }

    if (filters.dataFim) {
      query = query.lte('created_at', filters.dataFim.toISOString());
    }

    const offset = (page - 1) * limit;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list audit logs: ${error.message}`);
    }

    const total = count ?? 0;
    const logs = (data as AuditLogDbRow[]).map(AuditLogMapper.toDomain);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
