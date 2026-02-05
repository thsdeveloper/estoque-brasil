import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateInventarioUseCase } from '../../application/use-cases/inventario/CreateInventarioUseCase.js';
import { GetInventarioUseCase } from '../../application/use-cases/inventario/GetInventarioUseCase.js';
import { UpdateInventarioUseCase } from '../../application/use-cases/inventario/UpdateInventarioUseCase.js';
import { DeleteInventarioUseCase } from '../../application/use-cases/inventario/DeleteInventarioUseCase.js';
import { ListInventariosUseCase } from '../../application/use-cases/inventario/ListInventariosUseCase.js';
import { FinalizarInventarioUseCase } from '../../application/use-cases/inventario/FinalizarInventarioUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IInventarioRepository } from '../../domain/repositories/IInventarioRepository.js';
import { createInventarioSchema, updateInventarioSchema } from '../../application/dtos/inventario/InventarioDTO.js';

export class InventarioController {
  private readonly createInventarioUseCase: CreateInventarioUseCase;
  private readonly getInventarioUseCase: GetInventarioUseCase;
  private readonly updateInventarioUseCase: UpdateInventarioUseCase;
  private readonly deleteInventarioUseCase: DeleteInventarioUseCase;
  private readonly listInventariosUseCase: ListInventariosUseCase;
  private readonly finalizarInventarioUseCase: FinalizarInventarioUseCase;

  constructor(inventarioRepository: IInventarioRepository) {
    this.createInventarioUseCase = new CreateInventarioUseCase(inventarioRepository);
    this.getInventarioUseCase = new GetInventarioUseCase(inventarioRepository);
    this.updateInventarioUseCase = new UpdateInventarioUseCase(inventarioRepository);
    this.deleteInventarioUseCase = new DeleteInventarioUseCase(inventarioRepository);
    this.listInventariosUseCase = new ListInventariosUseCase(inventarioRepository);
    this.finalizarInventarioUseCase = new FinalizarInventarioUseCase(inventarioRepository);
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
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; idLoja?: string; idEmpresa?: string; ativo?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : undefined;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
      const idLoja = request.query.idLoja ? parseInt(request.query.idLoja, 10) : undefined;
      const idEmpresa = request.query.idEmpresa ? parseInt(request.query.idEmpresa, 10) : undefined;
      const ativo = request.query.ativo !== undefined
        ? request.query.ativo === 'true'
        : undefined;
      const result = await this.listInventariosUseCase.execute({ page, limit, idLoja, idEmpresa, ativo });
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async finalizar(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const id = parseInt(request.params.id, 10);
      const inventario = await this.finalizarInventarioUseCase.execute(id);
      reply.send(inventario);
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
