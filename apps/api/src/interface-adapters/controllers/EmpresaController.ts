import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateEmpresaUseCase } from '../../application/use-cases/empresa/CreateEmpresaUseCase.js';
import { GetEmpresaUseCase } from '../../application/use-cases/empresa/GetEmpresaUseCase.js';
import { UpdateEmpresaUseCase } from '../../application/use-cases/empresa/UpdateEmpresaUseCase.js';
import { DeleteEmpresaUseCase } from '../../application/use-cases/empresa/DeleteEmpresaUseCase.js';
import { ListEmpresasUseCase } from '../../application/use-cases/empresa/ListEmpresasUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository.js';
import { createEmpresaSchema, updateEmpresaSchema } from '../../application/dtos/empresa/EmpresaDTO.js';

export class EmpresaController {
  private readonly createEmpresaUseCase: CreateEmpresaUseCase;
  private readonly getEmpresaUseCase: GetEmpresaUseCase;
  private readonly updateEmpresaUseCase: UpdateEmpresaUseCase;
  private readonly deleteEmpresaUseCase: DeleteEmpresaUseCase;
  private readonly listEmpresasUseCase: ListEmpresasUseCase;

  constructor(empresaRepository: IEmpresaRepository) {
    this.createEmpresaUseCase = new CreateEmpresaUseCase(empresaRepository);
    this.getEmpresaUseCase = new GetEmpresaUseCase(empresaRepository);
    this.updateEmpresaUseCase = new UpdateEmpresaUseCase(empresaRepository);
    this.deleteEmpresaUseCase = new DeleteEmpresaUseCase(empresaRepository);
    this.listEmpresasUseCase = new ListEmpresasUseCase(empresaRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createEmpresaSchema.parse(request.body);
      const empresa = await this.createEmpresaUseCase.execute(validatedData);
      reply.status(201).send(empresa);
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
      const empresa = await this.getEmpresaUseCase.execute(id);
      reply.send(empresa);
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
      const validatedData = updateEmpresaSchema.parse(request.body);
      const empresa = await this.updateEmpresaUseCase.execute(id, validatedData);
      reply.send(empresa);
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
      await this.deleteEmpresaUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string; ativo?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : undefined;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
      const search = request.query.search || undefined;
      const ativo = request.query.ativo !== undefined
        ? request.query.ativo === 'true'
        : undefined;
      const result = await this.listEmpresasUseCase.execute({ page, limit, search, ativo });
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
