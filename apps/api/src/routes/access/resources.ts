import { FastifyInstance } from 'fastify';
import { AccessResourceController } from '../../interface-adapters/controllers/AccessResourceController.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';
import type { CreateAccessResourceDTO, UpdateAccessResourceDTO } from '../../application/dtos/access/AccessDTO.js';

const resourceResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    displayName: { type: 'string' },
    description: { type: ['string', 'null'] },
    icon: { type: ['string', 'null'] },
    isSystem: { type: 'boolean' },
    sortOrder: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
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

const createResourceBodySchema = {
  type: 'object',
  required: ['name', 'displayName'],
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-z_]+$',
      description: 'Identificador único (apenas letras minúsculas e underscores)',
    },
    displayName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      description: 'Nome de exibição',
    },
    description: { type: ['string', 'null'], maxLength: 500 },
    icon: { type: ['string', 'null'], maxLength: 50 },
  },
};

const updateResourceBodySchema = {
  type: 'object',
  properties: {
    displayName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
    description: { type: ['string', 'null'], maxLength: 500 },
    icon: { type: ['string', 'null'], maxLength: 50 },
    sortOrder: { type: 'number', minimum: 0 },
  },
};

export async function resourcesRoutes(fastify: FastifyInstance) {
  // GET / - List all resources
  fastify.get(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Resources'],
        summary: 'Listar recursos de acesso',
        description: 'Retorna uma lista de todos os recursos de acesso do sistema',
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'array', items: resourceResponseSchema },
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessResourceController.list
  );

  // POST / - Create resource
  fastify.post<{ Body: CreateAccessResourceDTO }>(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Resources'],
        summary: 'Criar recurso de acesso',
        description: 'Cria um novo recurso de acesso no sistema',
        security: [{ bearerAuth: [] }],
        body: createResourceBodySchema,
        response: {
          201: resourceResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessResourceController.create
  );

  // PUT /:id - Update resource
  fastify.put<{ Params: { id: string }; Body: UpdateAccessResourceDTO }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Resources'],
        summary: 'Atualizar recurso de acesso',
        description: 'Atualiza os dados de um recurso de acesso existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updateResourceBodySchema,
        response: {
          200: resourceResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessResourceController.update
  );

  // DELETE /:id - Delete resource
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Resources'],
        summary: 'Excluir recurso de acesso',
        description: 'Remove um recurso de acesso do sistema (apenas recursos não-sistema)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null', description: 'Recurso excluído com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessResourceController.delete
  );
}

export default resourcesRoutes;
