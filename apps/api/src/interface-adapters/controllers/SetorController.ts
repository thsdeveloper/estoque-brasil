import { FastifyReply, FastifyRequest } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ZodError } from 'zod';
import { AbrirSetorUseCase } from '../../application/use-cases/setor/AbrirSetorUseCase.js';
import { FinalizarSetorUseCase } from '../../application/use-cases/setor/FinalizarSetorUseCase.js';
import { ReabrirSetorUseCase } from '../../application/use-cases/setor/ReabrirSetorUseCase.js';
import { CreateSetorUseCase } from '../../application/use-cases/setor/CreateSetorUseCase.js';
import { GetSetorUseCase } from '../../application/use-cases/setor/GetSetorUseCase.js';
import { UpdateSetorUseCase } from '../../application/use-cases/setor/UpdateSetorUseCase.js';
import { DeleteSetorUseCase } from '../../application/use-cases/setor/DeleteSetorUseCase.js';
import { ListSetoresByInventarioUseCase } from '../../application/use-cases/setor/ListSetoresByInventarioUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { ISetorRepository } from '../../domain/repositories/ISetorRepository.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';
import { AuditService } from '../../application/services/AuditService.js';
import { createSetorSchema, updateSetorSchema } from '../../application/dtos/inventario/SetorDTO.js';

export class SetorController {
  private readonly abrirSetorUseCase: AbrirSetorUseCase;
  private readonly finalizarSetorUseCase: FinalizarSetorUseCase;
  private readonly reabrirSetorUseCase: ReabrirSetorUseCase;
  private readonly createSetorUseCase: CreateSetorUseCase;
  private readonly getSetorUseCase: GetSetorUseCase;
  private readonly updateSetorUseCase: UpdateSetorUseCase;
  private readonly deleteSetorUseCase: DeleteSetorUseCase;
  private readonly listSetoresByInventarioUseCase: ListSetoresByInventarioUseCase;

  constructor(
    setorRepository: ISetorRepository,
    supabase: SupabaseClient,
    auditLogRepository?: IAuditLogRepository,
  ) {
    const auditService = auditLogRepository ? new AuditService(auditLogRepository) : undefined;
    this.abrirSetorUseCase = new AbrirSetorUseCase(setorRepository, supabase, auditService);
    this.finalizarSetorUseCase = new FinalizarSetorUseCase(setorRepository, auditService);
    this.reabrirSetorUseCase = new ReabrirSetorUseCase(setorRepository, auditService);
    this.createSetorUseCase = new CreateSetorUseCase(setorRepository);
    this.getSetorUseCase = new GetSetorUseCase(setorRepository);
    this.updateSetorUseCase = new UpdateSetorUseCase(setorRepository);
    this.deleteSetorUseCase = new DeleteSetorUseCase(setorRepository);
    this.listSetoresByInventarioUseCase = new ListSetoresByInventarioUseCase(setorRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createSetorSchema.parse(request.body);
      const setor = await this.createSetorUseCase.execute(validatedData);
      reply.status(201).send(setor);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const setor = await this.getSetorUseCase.execute(id);
      reply.send(setor);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const validatedData = updateSetorSchema.parse(request.body);
      const setor = await this.updateSetorUseCase.execute(id, validatedData);
      reply.send(setor);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      await this.deleteSetorUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async abrir(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const userId = (request as any).user?.sub;
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      const setor = await this.abrirSetorUseCase.execute(id, userId, ipAddress, userAgent);
      reply.send(setor);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async finalizarSetor(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const userId = (request as any).user?.sub;
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      const setor = await this.finalizarSetorUseCase.execute(id, userId, undefined, ipAddress, userAgent);
      reply.send(setor);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async reabrirSetor(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const userId = (request as any).user?.sub;
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      const setor = await this.reabrirSetorUseCase.execute(id, userId, undefined, ipAddress, userAgent);
      reply.send(setor);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async listByInventario(
    request: FastifyRequest<{ Params: { idInventario: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const idInventario = parseInt(request.params.idInventario, 10);
      const result = await this.listSetoresByInventarioUseCase.execute(idInventario);
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
