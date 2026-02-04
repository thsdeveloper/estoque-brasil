import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateContagemUseCase } from '../../application/use-cases/contagem/CreateContagemUseCase.js';
import { GetContagemUseCase } from '../../application/use-cases/contagem/GetContagemUseCase.js';
import { UpdateContagemUseCase } from '../../application/use-cases/contagem/UpdateContagemUseCase.js';
import { DeleteContagemUseCase } from '../../application/use-cases/contagem/DeleteContagemUseCase.js';
import { ListContagensUseCase } from '../../application/use-cases/contagem/ListContagensUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IInventarioContagemRepository } from '../../domain/repositories/IInventarioContagemRepository.js';
import { createContagemSchema, updateContagemSchema } from '../../application/dtos/inventario/ContagemDTO.js';

export class ContagemController {
  private readonly createContagemUseCase: CreateContagemUseCase;
  private readonly getContagemUseCase: GetContagemUseCase;
  private readonly updateContagemUseCase: UpdateContagemUseCase;
  private readonly deleteContagemUseCase: DeleteContagemUseCase;
  private readonly listContagensUseCase: ListContagensUseCase;

  constructor(contagemRepository: IInventarioContagemRepository) {
    this.createContagemUseCase = new CreateContagemUseCase(contagemRepository);
    this.getContagemUseCase = new GetContagemUseCase(contagemRepository);
    this.updateContagemUseCase = new UpdateContagemUseCase(contagemRepository);
    this.deleteContagemUseCase = new DeleteContagemUseCase(contagemRepository);
    this.listContagensUseCase = new ListContagensUseCase(contagemRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createContagemSchema.parse(request.body);
      const contagem = await this.createContagemUseCase.execute(validatedData);
      reply.status(201).send(contagem);
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
      const contagem = await this.getContagemUseCase.execute(id);
      reply.send(contagem);
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
      const validatedData = updateContagemSchema.parse(request.body);
      const contagem = await this.updateContagemUseCase.execute(id, validatedData);
      reply.send(contagem);
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
      await this.deleteContagemUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; idInventarioSetor?: string; idProduto?: string; divergente?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : undefined;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
      const idInventarioSetor = request.query.idInventarioSetor
        ? parseInt(request.query.idInventarioSetor, 10)
        : undefined;
      const idProduto = request.query.idProduto
        ? parseInt(request.query.idProduto, 10)
        : undefined;
      const divergente = request.query.divergente !== undefined
        ? request.query.divergente === 'true'
        : undefined;

      const result = await this.listContagensUseCase.execute({
        page,
        limit,
        idInventarioSetor,
        idProduto,
        divergente,
      });
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
