import { FastifyInstance } from 'fastify';
import { EmpresaController } from '../../interface-adapters/controllers/EmpresaController.js';
import { SupabaseEmpresaRepository } from '../../infrastructure/database/supabase/repositories/SupabaseEmpresaRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const empresaResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    descricao: { type: ['string', 'null'] },
    cnpj: { type: ['string', 'null'] },
    razaoSocial: { type: ['string', 'null'] },
    nomeFantasia: { type: ['string', 'null'] },
    cep: { type: ['string', 'null'] },
    endereco: { type: ['string', 'null'] },
    numero: { type: ['string', 'null'] },
    bairro: { type: ['string', 'null'] },
    codigoUf: { type: ['string', 'null'] },
    codigoMunicipio: { type: ['string', 'null'] },
    ativo: { type: 'boolean' },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: empresaResponseSchema },
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

const createEmpresaBodySchema = {
  type: 'object',
  properties: {
    descricao: { type: ['string', 'null'], maxLength: 255 },
    cnpj: { type: ['string', 'null'], pattern: '^\\d{14}$' },
    razaoSocial: { type: ['string', 'null'], maxLength: 255 },
    nomeFantasia: { type: ['string', 'null'], maxLength: 255 },
    cep: { type: ['string', 'null'], pattern: '^\\d{8}$' },
    endereco: { type: ['string', 'null'], maxLength: 255 },
    numero: { type: ['string', 'null'], maxLength: 20 },
    bairro: { type: ['string', 'null'], maxLength: 100 },
    codigoUf: { type: ['string', 'null'], minLength: 2, maxLength: 2 },
    codigoMunicipio: { type: ['string', 'null'], maxLength: 10 },
    ativo: { type: 'boolean', default: true },
  },
};

export default async function empresaRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const empresaRepository = new SupabaseEmpresaRepository(supabase);
  const controller = new EmpresaController(empresaRepository);

  fastify.get(
    '/empresas',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Empresas'],
        summary: 'Listar empresas',
        description: 'Retorna uma lista paginada de empresas',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Busca por razão social ou nome fantasia' },
            ativo: { type: 'boolean', description: 'Filtrar por status ativo' },
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
    '/empresas/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Empresas'],
        summary: 'Buscar empresa por ID',
        description: 'Retorna os dados de uma empresa específica',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: empresaResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/empresas',
    {
      preHandler: [requireAuth, requirePermission('empresas', 'create')],
      schema: {
        tags: ['Empresas'],
        summary: 'Criar nova empresa',
        description: 'Cria uma nova empresa no sistema',
        security: [{ bearerAuth: [] }],
        body: createEmpresaBodySchema,
        response: {
          201: empresaResponseSchema,
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
    '/empresas/:id',
    {
      preHandler: [requireAuth, requirePermission('empresas', 'update')],
      schema: {
        tags: ['Empresas'],
        summary: 'Atualizar empresa',
        description: 'Atualiza os dados de uma empresa existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: createEmpresaBodySchema,
        response: {
          200: empresaResponseSchema,
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
    '/empresas/:id',
    {
      preHandler: [requireAuth, requirePermission('empresas', 'delete')],
      schema: {
        tags: ['Empresas'],
        summary: 'Excluir empresa',
        description: 'Remove uma empresa do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Empresa excluída com sucesso' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );
}
