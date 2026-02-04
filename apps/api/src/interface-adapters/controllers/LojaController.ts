import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateLojaUseCase } from '../../application/use-cases/loja/CreateLojaUseCase.js';
import { GetLojaUseCase } from '../../application/use-cases/loja/GetLojaUseCase.js';
import { UpdateLojaUseCase } from '../../application/use-cases/loja/UpdateLojaUseCase.js';
import { DeleteLojaUseCase } from '../../application/use-cases/loja/DeleteLojaUseCase.js';
import { ListLojasUseCase } from '../../application/use-cases/loja/ListLojasUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { ILojaRepository } from '../../domain/repositories/ILojaRepository.js';
import { createLojaSchema, updateLojaSchema } from '../../application/dtos/loja/LojaDTO.js';

export class LojaController {
  private readonly createLojaUseCase: CreateLojaUseCase;
  private readonly getLojaUseCase: GetLojaUseCase;
  private readonly updateLojaUseCase: UpdateLojaUseCase;
  private readonly deleteLojaUseCase: DeleteLojaUseCase;
  private readonly listLojasUseCase: ListLojasUseCase;

  constructor(lojaRepository: ILojaRepository) {
    this.createLojaUseCase = new CreateLojaUseCase(lojaRepository);
    this.getLojaUseCase = new GetLojaUseCase(lojaRepository);
    this.updateLojaUseCase = new UpdateLojaUseCase(lojaRepository);
    this.deleteLojaUseCase = new DeleteLojaUseCase(lojaRepository);
    this.listLojasUseCase = new ListLojasUseCase(lojaRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createLojaSchema.parse(request.body);
      const loja = await this.createLojaUseCase.execute(validatedData);
      reply.status(201).send(loja);
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
      const loja = await this.getLojaUseCase.execute(id);
      reply.send(loja);
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
      const validatedData = updateLojaSchema.parse(request.body);
      const loja = await this.updateLojaUseCase.execute(id, validatedData);
      reply.send(loja);
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
      await this.deleteLojaUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string; idCliente?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : undefined;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
      const search = request.query.search || undefined;
      const idCliente = request.query.idCliente || undefined; // UUID string
      const result = await this.listLojasUseCase.execute({ page, limit, search, idCliente });
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
