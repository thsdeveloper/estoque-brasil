import { FastifyInstance } from 'fastify';
import { InventarioController } from '../../interface-adapters/controllers/InventarioController.js';
import { SupabaseInventarioRepository } from '../../infrastructure/database/supabase/repositories/SupabaseInventarioRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { restrictLiderColetaOnStartedInventario } from '../../plugins/authorization.js';

const inventarioResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idLoja: { type: 'integer' },
    idEmpresa: { type: 'integer' },
    idTemplate: { type: ['integer', 'null'] },
    idTemplateExportacao: { type: ['integer', 'null'] },
    minimoContagem: { type: 'integer' },
    dataInicio: { type: 'string', format: 'date-time' },
    dataTermino: { type: ['string', 'null'], format: 'date-time' },
    lote: { type: 'boolean' },
    validade: { type: 'boolean' },
    ativo: { type: 'boolean' },
    nomeLoja: { type: ['string', 'null'] },
    cnpjLoja: { type: ['string', 'null'] },
    nomeCliente: { type: ['string', 'null'] },
    temContagens: { type: 'boolean' },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: inventarioResponseSchema },
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

const createInventarioBodySchema = {
  type: 'object',
  required: ['idLoja', 'idEmpresa', 'dataInicio'],
  properties: {
    idLoja: { type: 'integer' },
    idEmpresa: { type: 'integer' },
    idTemplate: { type: ['integer', 'null'] },
    idTemplateExportacao: { type: ['integer', 'null'] },
    minimoContagem: { type: 'integer', minimum: 1, default: 1 },
    dataInicio: { type: 'string', format: 'date-time' },
    dataTermino: { type: ['string', 'null'], format: 'date-time' },
    lote: { type: 'boolean', default: false },
    validade: { type: 'boolean', default: false },
    ativo: { type: 'boolean', default: true },
  },
};

const updateInventarioBodySchema = {
  type: 'object',
  properties: {
    idLoja: { type: 'integer' },
    idEmpresa: { type: 'integer' },
    idTemplate: { type: ['integer', 'null'] },
    idTemplateExportacao: { type: ['integer', 'null'] },
    minimoContagem: { type: 'integer', minimum: 1 },
    dataInicio: { type: 'string', format: 'date-time' },
    dataTermino: { type: ['string', 'null'], format: 'date-time' },
    lote: { type: 'boolean' },
    validade: { type: 'boolean' },
    ativo: { type: 'boolean' },
  },
};

export default async function inventarioRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const inventarioRepository = new SupabaseInventarioRepository(supabase);
  const controller = new InventarioController(inventarioRepository);

  fastify.get(
    '/inventarios',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Listar inventários',
        description: 'Retorna uma lista paginada de inventários',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            idLoja: { type: 'integer', description: 'Filtrar por loja' },
            idEmpresa: { type: 'integer', description: 'Filtrar por empresa' },
            ativo: { type: 'boolean', description: 'Filtrar por status ativo' },
            search: { type: 'string', description: 'Buscar por nome do cliente' },
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
    '/inventarios/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Buscar inventário por ID',
        description: 'Retorna os dados de um inventário específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: inventarioResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/inventarios',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Criar novo inventário',
        description: 'Cria um novo inventário no sistema',
        security: [{ bearerAuth: [] }],
        body: createInventarioBodySchema,
        response: {
          201: inventarioResponseSchema,
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
    '/inventarios/:id',
    {
      preHandler: [requireAuth, restrictLiderColetaOnStartedInventario()],
      schema: {
        tags: ['Inventários'],
        summary: 'Atualizar inventário',
        description: 'Atualiza os dados de um inventário existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: updateInventarioBodySchema,
        response: {
          200: inventarioResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.update(request as any, reply)
  );

  fastify.delete(
    '/inventarios/:id',
    {
      preHandler: [requireAuth, restrictLiderColetaOnStartedInventario()],
      schema: {
        tags: ['Inventários'],
        summary: 'Excluir inventário',
        description: 'Remove um inventário do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Inventário excluído com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );

  fastify.post(
    '/inventarios/:id/finalizar',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Finalizar inventário',
        description: 'Finaliza um inventário ativo',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: inventarioResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.finalizar(request as any, reply)
  );
}
