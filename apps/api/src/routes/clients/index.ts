import { FastifyInstance } from 'fastify';
import { ClientController } from '../../interface-adapters/controllers/ClientController.js';
import { SupabaseClientRepository } from '../../infrastructure/database/supabase/repositories/SupabaseClientRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const clientResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    nome: { type: 'string' },
    cnpj: { type: ['string', 'null'] },
    fantasia: { type: ['string', 'null'] },
    email: { type: ['string', 'null'] },
    telefone: { type: ['string', 'null'] },
    situacao: { type: ['string', 'null'] },
    idEmpresa: { type: ['integer', 'null'] },

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
  required: ['nome', 'cnpj', 'qtdeDivergentePlus', 'qtdeDivergenteMinus', 'valorDivergentePlus', 'valorDivergenteMinus', 'percentualDivergencia', 'cep', 'endereco', 'numero', 'bairro', 'uf', 'municipio'],
  properties: {
    nome: { type: 'string', minLength: 1, maxLength: 255 },
    cnpj: { type: 'string', pattern: '^\\d{14}$' },
    fantasia: { type: ['string', 'null'], maxLength: 255 },
    email: { type: ['string', 'null'], maxLength: 255 },
    telefone: { type: ['string', 'null'], maxLength: 30 },
    situacao: { type: ['string', 'null'], maxLength: 50 },
    idEmpresa: { type: ['integer', 'null'] },

    qtdeDivergentePlus: { type: 'number' },
    qtdeDivergenteMinus: { type: 'number' },
    valorDivergentePlus: { type: 'number' },
    valorDivergenteMinus: { type: 'number' },
    percentualDivergencia: { type: 'number', minimum: 0, maximum: 100 },
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
    cnpj: { type: ['string', 'null'], pattern: '^\\d{14}$' },
    fantasia: { type: ['string', 'null'], maxLength: 255 },
    email: { type: ['string', 'null'], maxLength: 255 },
    telefone: { type: ['string', 'null'], maxLength: 30 },
    situacao: { type: ['string', 'null'], maxLength: 50 },
    idEmpresa: { type: ['integer', 'null'] },

    qtdeDivergentePlus: { type: 'number' },
    qtdeDivergenteMinus: { type: 'number' },
    valorDivergentePlus: { type: 'number' },
    valorDivergenteMinus: { type: 'number' },
    percentualDivergencia: { type: 'number', minimum: 0, maximum: 100 },
    cep: { type: ['string', 'null'], pattern: '^\\d{8}$' },
    endereco: { type: ['string', 'null'], maxLength: 255 },
    numero: { type: ['string', 'null'], maxLength: 20 },
    bairro: { type: ['string', 'null'], maxLength: 100 },
    uf: { type: ['string', 'null'], minLength: 2, maxLength: 2 },
    municipio: { type: ['string', 'null'], maxLength: 100 },
  },
};

export default async function clientRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
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
            idEmpresa: { type: 'integer', description: 'Filtro por empresa' },
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
      preHandler: [requireAuth, requirePermission('clients', 'create')],
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
      preHandler: [requireAuth, requirePermission('clients', 'update')],
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
      preHandler: [requireAuth, requirePermission('clients', 'delete')],
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
