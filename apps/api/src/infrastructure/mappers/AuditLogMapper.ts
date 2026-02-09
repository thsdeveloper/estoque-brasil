import { AuditLog } from '../../domain/entities/AuditLog.js';

export interface AuditLogDbRow {
  id: string;
  acao: string;
  descricao: string | null;
  id_usuario: string;
  nome_usuario: string | null;
  id_inventario: number | null;
  id_setor: number | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogInsertRow {
  acao: string;
  descricao?: string | null;
  id_usuario: string;
  nome_usuario?: string | null;
  id_inventario?: number | null;
  id_setor?: number | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export class AuditLogMapper {
  static toDomain(row: AuditLogDbRow): AuditLog {
    return AuditLog.create({
      id: row.id,
      acao: row.acao,
      descricao: row.descricao,
      idUsuario: row.id_usuario,
      nomeUsuario: row.nome_usuario,
      idInventario: row.id_inventario,
      idSetor: row.id_setor,
      metadata: row.metadata,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: new Date(row.created_at),
    });
  }

  static toInsertRow(auditLog: AuditLog): AuditLogInsertRow {
    return {
      acao: auditLog.acao,
      descricao: auditLog.descricao,
      id_usuario: auditLog.idUsuario,
      nome_usuario: auditLog.nomeUsuario,
      id_inventario: auditLog.idInventario,
      id_setor: auditLog.idSetor,
      metadata: auditLog.metadata,
      ip_address: auditLog.ipAddress,
      user_agent: auditLog.userAgent,
    };
  }
}
