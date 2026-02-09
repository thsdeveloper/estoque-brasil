import { AuditLog } from '../entities/AuditLog.js';

export interface AuditLogFilters {
  idInventario?: number;
  idUsuario?: string;
  acao?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findAll(filters: AuditLogFilters, page: number, limit: number): Promise<PaginatedResult<AuditLog>>;
}
