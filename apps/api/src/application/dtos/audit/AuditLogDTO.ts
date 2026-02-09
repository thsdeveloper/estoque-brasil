import { z } from 'zod';
import { AuditLog } from '../../../domain/entities/AuditLog.js';

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  idInventario: z.coerce.number().int().positive().optional(),
  idUsuario: z.string().uuid().optional(),
  acao: z.string().max(100).optional(),
  dataInicio: z.string().datetime({ offset: true }).optional(),
  dataFim: z.string().datetime({ offset: true }).optional(),
});

export type ListAuditLogsQueryDTO = z.infer<typeof listAuditLogsQuerySchema>;

export interface AuditLogResponseDTO {
  id: string;
  acao: string;
  descricao: string | null;
  idUsuario: string;
  nomeUsuario: string | null;
  idInventario: number | null;
  idSetor: number | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface PaginatedAuditLogResponseDTO {
  data: AuditLogResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toAuditLogResponseDTO(auditLog: AuditLog): AuditLogResponseDTO {
  return {
    id: auditLog.id!,
    acao: auditLog.acao,
    descricao: auditLog.descricao,
    idUsuario: auditLog.idUsuario,
    nomeUsuario: auditLog.nomeUsuario,
    idInventario: auditLog.idInventario,
    idSetor: auditLog.idSetor,
    metadata: auditLog.metadata,
    ipAddress: auditLog.ipAddress,
    createdAt: auditLog.createdAt.toISOString(),
  };
}
