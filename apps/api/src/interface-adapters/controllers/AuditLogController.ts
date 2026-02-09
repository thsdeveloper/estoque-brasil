import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ListAuditLogsUseCase } from '../../application/use-cases/audit/ListAuditLogsUseCase.js';
import { listAuditLogsQuerySchema } from '../../application/dtos/audit/AuditLogDTO.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';

export class AuditLogController {
  private readonly listAuditLogsUseCase: ListAuditLogsUseCase;

  constructor(auditLogRepository: IAuditLogRepository) {
    this.listAuditLogsUseCase = new ListAuditLogsUseCase(auditLogRepository);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = listAuditLogsQuerySchema.parse(request.query);
      const result = await this.listAuditLogsUseCase.execute(query);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof ZodError) {
      reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    if (error instanceof DomainError) {
      reply.status(error.statusCode).send(error.toJSON());
      return;
    }

    if (error instanceof Error) {
      reply.status(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message,
      });
      return;
    }

    reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    });
  }
}
