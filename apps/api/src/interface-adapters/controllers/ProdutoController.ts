import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateProdutoUseCase } from '../../application/use-cases/produto/CreateProdutoUseCase.js';
import { GetProdutoUseCase } from '../../application/use-cases/produto/GetProdutoUseCase.js';
import { UpdateProdutoUseCase } from '../../application/use-cases/produto/UpdateProdutoUseCase.js';
import { DeleteProdutoUseCase } from '../../application/use-cases/produto/DeleteProdutoUseCase.js';
import { ListProdutosUseCase } from '../../application/use-cases/produto/ListProdutosUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IInventarioProdutoRepository } from '../../domain/repositories/IInventarioProdutoRepository.js';
import { createProdutoSchema, updateProdutoSchema } from '../../application/dtos/inventario/ProdutoDTO.js';

export class ProdutoController {
  private readonly createProdutoUseCase: CreateProdutoUseCase;
  private readonly getProdutoUseCase: GetProdutoUseCase;
  private readonly updateProdutoUseCase: UpdateProdutoUseCase;
  private readonly deleteProdutoUseCase: DeleteProdutoUseCase;
  private readonly listProdutosUseCase: ListProdutosUseCase;

  constructor(produtoRepository: IInventarioProdutoRepository) {
    this.createProdutoUseCase = new CreateProdutoUseCase(produtoRepository);
    this.getProdutoUseCase = new GetProdutoUseCase(produtoRepository);
    this.updateProdutoUseCase = new UpdateProdutoUseCase(produtoRepository);
    this.deleteProdutoUseCase = new DeleteProdutoUseCase(produtoRepository);
    this.listProdutosUseCase = new ListProdutosUseCase(produtoRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createProdutoSchema.parse(request.body);
      const produto = await this.createProdutoUseCase.execute(validatedData);
      reply.status(201).send(produto);
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
      const produto = await this.getProdutoUseCase.execute(id);
      reply.send(produto);
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
      const validatedData = updateProdutoSchema.parse(request.body);
      const produto = await this.updateProdutoUseCase.execute(id, validatedData);
      reply.send(produto);
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
      await this.deleteProdutoUseCase.execute(id);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; idInventario: string; search?: string; divergente?: string; codigoBarras?: string; codigoInterno?: string; codigo?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : undefined;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
      const idInventario = parseInt(request.query.idInventario, 10);
      const search = request.query.search || undefined;
      const divergente = request.query.divergente !== undefined
        ? request.query.divergente === 'true'
        : undefined;
      const codigoBarras = request.query.codigoBarras || undefined;
      const codigoInterno = request.query.codigoInterno || undefined;
      const codigo = request.query.codigo || undefined;

      const result = await this.listProdutosUseCase.execute({
        page,
        limit,
        idInventario,
        search,
        divergente,
        codigoBarras,
        codigoInterno,
        codigo,
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
