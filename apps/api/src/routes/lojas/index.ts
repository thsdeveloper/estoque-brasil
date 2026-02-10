import { FastifyInstance } from 'fastify';
import { LojaController } from '../../interface-adapters/controllers/LojaController.js';
import { SupabaseLojaRepository } from '../../infrastructure/database/supabase/repositories/SupabaseLojaRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const lojaResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idCliente: { type: 'string', format: 'uuid' },
    nome: { type: 'string' },
    cnpj: { type: ['string', 'null'] },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: lojaResponseSchema },
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

const createLojaBodySchema = {
  type: 'object',
  required: ['idCliente', 'nome'],
  properties: {
    idCliente: { type: 'string', format: 'uuid' },
    nome: { type: 'string', minLength: 1, maxLength: 255 },
    cnpj: { type: ['string', 'null'], pattern: '^\\d{14}$' },
  },
};

const updateLojaBodySchema = {
  type: 'object',
  properties: {
    idCliente: { type: 'string', format: 'uuid' },
    nome: { type: 'string', minLength: 1, maxLength: 255 },
    cnpj: { type: ['string', 'null'], pattern: '^\\d{14}$' },
  },
};

export default async function lojaRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const lojaRepository = new SupabaseLojaRepository(supabase);
  const controller = new LojaController(lojaRepository);

  fastify.get(
    '/lojas',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Lojas'],
        summary: 'Listar lojas',
        description: 'Retorna uma lista paginada de lojas',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Busca por nome da loja' },
            idCliente: { type: 'string', format: 'uuid', description: 'Filtrar por cliente' },
            idEmpresa: { type: 'integer', description: 'Filtrar por empresa' },
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
    '/lojas/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Lojas'],
        summary: 'Buscar loja por ID',
        description: 'Retorna os dados de uma loja específica',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: lojaResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/lojas',
    {
      preHandler: [requireAuth, requirePermission('lojas', 'create')],
      schema: {
        tags: ['Lojas'],
        summary: 'Criar nova loja',
        description: 'Cria uma nova loja no sistema',
        security: [{ bearerAuth: [] }],
        body: createLojaBodySchema,
        response: {
          201: lojaResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );

  fastify.put(
    '/lojas/:id',
    {
      preHandler: [requireAuth, requirePermission('lojas', 'update')],
      schema: {
        tags: ['Lojas'],
        summary: 'Atualizar loja',
        description: 'Atualiza os dados de uma loja existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: updateLojaBodySchema,
        response: {
          200: lojaResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.update(request as any, reply)
  );

  fastify.delete(
    '/lojas/:id',
    {
      preHandler: [requireAuth, requirePermission('lojas', 'delete')],
      schema: {
        tags: ['Lojas'],
        summary: 'Excluir loja',
        description: 'Remove uma loja do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Loja excluída com sucesso' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );
}
