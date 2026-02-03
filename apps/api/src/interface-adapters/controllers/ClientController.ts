import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateClientUseCase } from '../../application/use-cases/clients/CreateClientUseCase.js';
import { GetClientUseCase } from '../../application/use-cases/clients/GetClientUseCase.js';
import { UpdateClientUseCase } from '../../application/use-cases/clients/UpdateClientUseCase.js';
import { DeleteClientUseCase } from '../../application/use-cases/clients/DeleteClientUseCase.js';
import { ListClientsUseCase } from '../../application/use-cases/clients/ListClientsUseCase.js';
import { createClientSchema } from '../../application/dtos/clients/CreateClientDTO.js';
import { updateClientSchema } from '../../application/dtos/clients/UpdateClientDTO.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';

export class ClientController {
  private readonly createClientUseCase: CreateClientUseCase;
  private readonly getClientUseCase: GetClientUseCase;
  private readonly updateClientUseCase: UpdateClientUseCase;
  private readonly deleteClientUseCase: DeleteClientUseCase;
  private readonly listClientsUseCase: ListClientsUseCase;

  constructor(clientRepository: IClientRepository) {
    this.createClientUseCase = new CreateClientUseCase(clientRepository);
    this.getClientUseCase = new GetClientUseCase(clientRepository);
    this.updateClientUseCase = new UpdateClientUseCase(clientRepository);
    this.deleteClientUseCase = new DeleteClientUseCase(clientRepository);
    this.listClientsUseCase = new ListClientsUseCase(clientRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createClientSchema.parse(request.body);
      const client = await this.createClientUseCase.execute(validatedData);
      reply.status(201).send(client);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const client = await this.getClientUseCase.execute(id);
      reply.send(client);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const validatedData = updateClientSchema.parse(request.body);
      const client = await this.updateClientUseCase.execute(id, validatedData);
      reply.send(client);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      await this.deleteClientUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string; uf?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : undefined;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
      const search = request.query.search || undefined;
      const uf = request.query.uf || undefined;
      const result = await this.listClientsUseCase.execute({ page, limit, search, uf });
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
