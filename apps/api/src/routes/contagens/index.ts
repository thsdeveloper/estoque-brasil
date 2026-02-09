import { FastifyInstance } from 'fastify';
import { ContagemController } from '../../interface-adapters/controllers/ContagemController.js';
import { SupabaseInventarioContagemRepository } from '../../infrastructure/database/supabase/repositories/SupabaseInventarioContagemRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const contagemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idInventarioSetor: { type: 'integer' },
    idProduto: { type: 'integer' },
    data: { type: 'string', format: 'date-time' },
    lote: { type: ['string', 'null'] },
    validade: { type: ['string', 'null'], format: 'date' },
    quantidade: { type: 'number' },
    divergente: { type: 'boolean' },
    idUsuario: { type: ['string', 'null'] },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: contagemResponseSchema },
    total: { type: 'number' },
    page: { type: 'number' },
    limit: { type: 'number' },
    totalPages: { type: 'number' },
  },
};

const errorResponseSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
  },
};

const validationErrorResponseSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const createContagemBodySchema = {
  type: 'object',
  required: ['idInventarioSetor', 'idProduto', 'quantidade'],
  properties: {
    idInventarioSetor: { type: 'integer' },
    idProduto: { type: 'integer' },
    lote: { type: ['string', 'null'], maxLength: 50 },
    validade: { type: ['string', 'null'], format: 'date' },
    quantidade: { type: 'number', minimum: 0 },
    divergente: { type: 'boolean', default: false },
  },
};

const updateContagemBodySchema = {
  type: 'object',
  properties: {
    lote: { type: ['string', 'null'], maxLength: 50 },
    validade: { type: ['string', 'null'], format: 'date' },
    quantidade: { type: 'number', minimum: 0 },
    divergente: { type: 'boolean' },
  },
};

export default async function contagemRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const contagemRepository = new SupabaseInventarioContagemRepository(supabase);
  const controller = new ContagemController(contagemRepository);

  fastify.get(
    '/contagens',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Contagens'],
        summary: 'Listar contagens',
        description: 'Retorna uma lista paginada de contagens',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            idInventarioSetor: { type: 'integer', description: 'Filtrar por setor do inventário' },
            idProduto: { type: 'integer', description: 'Filtrar por produto' },
            divergente: { type: 'boolean', description: 'Filtrar por divergentes' },
          },
        },
        response: {
          200: paginatedResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.list(request as any, reply)
  );

  fastify.get(
    '/contagens/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Contagens'],
        summary: 'Buscar contagem por ID',
        description: 'Retorna os dados de uma contagem específica',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: contagemResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/contagens',
    {
      preHandler: [requireAuth, requirePermission('contagens', 'create')],
      schema: {
        tags: ['Contagens'],
        summary: 'Criar nova contagem',
        description: 'Cria uma nova contagem para um produto',
        security: [{ bearerAuth: [] }],
        body: createContagemBodySchema,
        response: {
          201: contagemResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );

  fastify.put(
    '/contagens/:id',
    {
      preHandler: [requireAuth, requirePermission('contagens', 'update')],
      schema: {
        tags: ['Contagens'],
        summary: 'Atualizar contagem',
        description: 'Atualiza os dados de uma contagem existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: updateContagemBodySchema,
        response: {
          200: contagemResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.update(request as any, reply)
  );

  fastify.delete(
    '/contagens/:id',
    {
      preHandler: [requireAuth, requirePermission('contagens', 'delete')],
      schema: {
        tags: ['Contagens'],
        summary: 'Excluir contagem',
        description: 'Remove uma contagem do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Contagem excluída com sucesso' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );
}
