import { FastifyInstance } from 'fastify';
import { ClientController } from '../../interface-adapters/controllers/ClientController.js';
import { SupabaseClientRepository } from '../../infrastructure/database/supabase/repositories/SupabaseClientRepository.js';
import { getSupabaseClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';

const clientResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    nome: { type: 'string' },
    linkBi: { type: ['string', 'null'] },
    qtdeDivergentePlus: { type: ['number', 'null'] },
    qtdeDivergenteMinus: { type: ['number', 'null'] },
    valorDivergentePlus: { type: ['number', 'null'] },
    valorDivergenteMinus: { type: ['number', 'null'] },
    percentualDivergencia: { type: ['number', 'null'] },
    cep: { type: ['string', 'null'] },
    endereco: { type: ['string', 'null'] },
    numero: { type: ['string', 'null'] },
    bairro: { type: ['string', 'null'] },
    uf: { type: ['string', 'null'] },
    municipio: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: clientResponseSchema },
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

const createClientBodySchema = {
  type: 'object',
  required: ['nome'],
  properties: {
    nome: { type: 'string', minLength: 1, maxLength: 255 },
    linkBi: { type: ['string', 'null'], format: 'uri' },
    qtdeDivergentePlus: { type: ['number', 'null'] },
    qtdeDivergenteMinus: { type: ['number', 'null'] },
    valorDivergentePlus: { type: ['number', 'null'] },
    valorDivergenteMinus: { type: ['number', 'null'] },
    percentualDivergencia: { type: ['number', 'null'], minimum: 0, maximum: 100 },
    cep: { type: ['string', 'null'], pattern: '^\\d{8}$' },
    endereco: { type: ['string', 'null'], maxLength: 255 },
    numero: { type: ['string', 'null'], maxLength: 20 },
    bairro: { type: ['string', 'null'], maxLength: 100 },
    uf: { type: ['string', 'null'], minLength: 2, maxLength: 2 },
    municipio: { type: ['string', 'null'], maxLength: 100 },
  },
};

const updateClientBodySchema = {
  type: 'object',
  properties: {
    nome: { type: 'string', minLength: 1, maxLength: 255 },
    linkBi: { type: ['string', 'null'], format: 'uri' },
    qtdeDivergentePlus: { type: ['number', 'null'] },
    qtdeDivergenteMinus: { type: ['number', 'null'] },
    valorDivergentePlus: { type: ['number', 'null'] },
    valorDivergenteMinus: { type: ['number', 'null'] },
    percentualDivergencia: { type: ['number', 'null'], minimum: 0, maximum: 100 },
    cep: { type: ['string', 'null'], pattern: '^\\d{8}$' },
    endereco: { type: ['string', 'null'], maxLength: 255 },
    numero: { type: ['string', 'null'], maxLength: 20 },
    bairro: { type: ['string', 'null'], maxLength: 100 },
    uf: { type: ['string', 'null'], minLength: 2, maxLength: 2 },
    municipio: { type: ['string', 'null'], maxLength: 100 },
  },
};

export default async function clientRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseClient();
  const clientRepository = new SupabaseClientRepository(supabase);
  const controller = new ClientController(clientRepository);

  fastify.get(
    '/clients',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Clients'],
        summary: 'Listar clientes',
        description: 'Retorna uma lista paginada de clientes com opções de busca e filtro por UF',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Busca por nome do cliente' },
            uf: { type: 'string', minLength: 2, maxLength: 2, description: 'Filtro por estado (UF)' },
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
    '/clients/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Clients'],
        summary: 'Buscar cliente por ID',
        description: 'Retorna os dados de um cliente específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: clientResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/clients',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Clients'],
        summary: 'Criar novo cliente',
        description: 'Cria um novo cliente no sistema',
        security: [{ bearerAuth: [] }],
        body: createClientBodySchema,
        response: {
          201: clientResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );

  fastify.put(
    '/clients/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Clients'],
        summary: 'Atualizar cliente',
        description: 'Atualiza os dados de um cliente existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updateClientBodySchema,
        response: {
          200: clientResponseSchema,
          400: validationErrorResponseSchema,
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
    '/clients/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Clients'],
        summary: 'Excluir cliente',
        description: 'Remove um cliente do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null', description: 'Cliente excluído com sucesso' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );
}
