import { AuditLog } from '../../domain/entities/AuditLog.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';

export interface RegistrarAuditInput {
  acao: string;
  descricao?: string;
  idUsuario: string;
  nomeUsuario?: string;
  idInventario?: number;
  idSetor?: number;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async registrar(input: RegistrarAuditInput): Promise<void> {
    try {
      const auditLog = AuditLog.create({
        acao: input.acao,
        descricao: input.descricao,
        idUsuario: input.idUsuario,
        nomeUsuario: input.nomeUsuario,
        idInventario: input.idInventario,
        idSetor: input.idSetor,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      await this.auditLogRepository.create(auditLog);
    } catch (error) {
      // Audit logging should not break the main flow
      console.error('Failed to register audit log:', error);
    }
  }
}
