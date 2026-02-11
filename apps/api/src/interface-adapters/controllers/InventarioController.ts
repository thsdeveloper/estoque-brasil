import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateInventarioUseCase } from '../../application/use-cases/inventario/CreateInventarioUseCase.js';
import { GetInventarioUseCase } from '../../application/use-cases/inventario/GetInventarioUseCase.js';
import { UpdateInventarioUseCase } from '../../application/use-cases/inventario/UpdateInventarioUseCase.js';
import { DeleteInventarioUseCase } from '../../application/use-cases/inventario/DeleteInventarioUseCase.js';
import { ListInventariosUseCase } from '../../application/use-cases/inventario/ListInventariosUseCase.js';
import { FinalizarInventarioUseCase } from '../../application/use-cases/inventario/FinalizarInventarioUseCase.js';
import { ReabrirInventarioUseCase } from '../../application/use-cases/inventario/ReabrirInventarioUseCase.js';
import { FecharInventarioUseCase } from '../../application/use-cases/inventario/FecharInventarioUseCase.js';
import { GetStatusFechamentoUseCase } from '../../application/use-cases/inventario/GetStatusFechamentoUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IInventarioRepository } from '../../domain/repositories/IInventarioRepository.js';
import { ISetorRepository } from '../../domain/repositories/ISetorRepository.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';
import { AuditService } from '../../application/services/AuditService.js';
import { createInventarioSchema, updateInventarioSchema, fecharInventarioBodySchema } from '../../application/dtos/inventario/InventarioDTO.js';
import { ListDivergenciasUseCase } from '../../application/use-cases/inventario/ListDivergenciasUseCase.js';
import { listDivergenciasQuerySchema } from '../../application/dtos/inventario/DivergenciaDTO.js';
import { SupabaseClient } from '@supabase/supabase-js';

export class InventarioController {
  private readonly createInventarioUseCase: CreateInventarioUseCase;
  private readonly getInventarioUseCase: GetInventarioUseCase;
  private readonly updateInventarioUseCase: UpdateInventarioUseCase;
  private readonly deleteInventarioUseCase: DeleteInventarioUseCase;
  private readonly listInventariosUseCase: ListInventariosUseCase;
  private readonly finalizarInventarioUseCase: FinalizarInventarioUseCase;
  private readonly reabrirInventarioUseCase: ReabrirInventarioUseCase;
  private readonly fecharInventarioUseCase: FecharInventarioUseCase | null;
  private readonly getStatusFechamentoUseCase: GetStatusFechamentoUseCase | null;
  private readonly listDivergenciasUseCase: ListDivergenciasUseCase | null;
  private readonly supabase: SupabaseClient | undefined;

  constructor(
    inventarioRepository: IInventarioRepository,
    setorRepository?: ISetorRepository,
    auditLogRepository?: IAuditLogRepository,
    supabase?: SupabaseClient,
  ) {
    this.supabase = supabase;
    const auditService = auditLogRepository ? new AuditService(auditLogRepository) : undefined;
    this.createInventarioUseCase = new CreateInventarioUseCase(inventarioRepository);
    this.getInventarioUseCase = new GetInventarioUseCase(inventarioRepository);
    this.updateInventarioUseCase = new UpdateInventarioUseCase(inventarioRepository);
    this.deleteInventarioUseCase = new DeleteInventarioUseCase(inventarioRepository);
    this.listInventariosUseCase = new ListInventariosUseCase(inventarioRepository);
    this.finalizarInventarioUseCase = setorRepository
      ? new FinalizarInventarioUseCase(inventarioRepository, setorRepository, auditService)
      : new FinalizarInventarioUseCase(inventarioRepository, { findByInventarioWithStatus: async () => [] } as any, auditService);
    this.reabrirInventarioUseCase = new ReabrirInventarioUseCase(inventarioRepository, auditService);
    this.fecharInventarioUseCase = (supabase && setorRepository)
      ? new FecharInventarioUseCase(inventarioRepository, setorRepository, supabase, auditService)
      : null;
    this.getStatusFechamentoUseCase = this.fecharInventarioUseCase
      ? new GetStatusFechamentoUseCase(inventarioRepository, this.fecharInventarioUseCase)
      : null;
    this.listDivergenciasUseCase = supabase ? new ListDivergenciasUseCase(supabase) : null;
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createInventarioSchema.parse(request.body);
      const inventario = await this.createInventarioUseCase.execute(validatedData);
      reply.status(201).send(inventario);
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
      const inventario = await this.getInventarioUseCase.execute(id);
      reply.send(inventario);
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
      const validatedData = updateInventarioSchema.parse(request.body);
      const inventario = await this.updateInventarioUseCase.execute(id, validatedData);
      reply.send(inventario);
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
      await this.deleteInventarioUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number; idLoja?: number; idEmpresa?: number; ativo?: boolean; search?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { page, limit, idLoja, idEmpresa, ativo, search } = request.query;
      const userId = (request as any).user?.sub as string | undefined;

      let filterUserId: string | undefined;
      if (userId && this.supabase) {
        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
          filterUserId = userId;
        }
      }

      const result = await this.listInventariosUseCase.execute({ page, limit, idLoja, idEmpresa, ativo, search, userId: filterUserId });
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async finalizar(
    request: FastifyRequest<{ Params: { id: string }; Body: { forcado?: boolean } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const userId = (request as any).user?.sub;
      const forcado = (request.body as any)?.forcado;
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      const inventario = await this.finalizarInventarioUseCase.execute(id, userId, forcado, ipAddress, userAgent);
      reply.send(inventario);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async reabrir(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const userId = (request as any).user?.sub;
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      const inventario = await this.reabrirInventarioUseCase.execute(id, userId, ipAddress, userAgent);
      reply.send(inventario);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async listDivergencias(
    request: FastifyRequest<{ Params: { id: string }; Querystring: Record<string, unknown> }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      if (!this.listDivergenciasUseCase) {
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Divergências não configurado' });
        return;
      }
      const idInventario = parseInt(request.params.id, 10);
      const query = listDivergenciasQuerySchema.parse(request.query);
      const result = await this.listDivergenciasUseCase.execute(idInventario, query);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async fechar(
    request: FastifyRequest<{ Params: { id: string }; Body: { justificativa?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      if (!this.fecharInventarioUseCase) {
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Fechamento não configurado' });
        return;
      }
      const id = parseInt(request.params.id, 10);
      const userId = (request as any).user?.sub;
      const body = fecharInventarioBodySchema.parse(request.body || {});
      const isAdmin = await this.isUserAdmin(userId);
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];

      const result = await this.fecharInventarioUseCase.execute({
        inventarioId: id,
        userId,
        isAdmin,
        justificativa: body.justificativa,
        ipAddress,
        userAgent,
      });
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getStatusFechamento(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      if (!this.getStatusFechamentoUseCase) {
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Status fechamento não configurado' });
        return;
      }
      const id = parseInt(request.params.id, 10);
      const result = await this.getStatusFechamentoUseCase.execute(id);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private async isUserAdmin(userId: string): Promise<boolean> {
    if (!this.supabase) return false;

    const { data, error } = await this.supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', userId)
      .eq('roles.name', 'admin')
      .limit(1);

    if (error) {
      throw new Error(`Failed to check user admin role: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
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
