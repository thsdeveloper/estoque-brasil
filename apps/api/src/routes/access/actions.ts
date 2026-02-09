import { FastifyInstance } from 'fastify';
import { AccessActionController } from '../../interface-adapters/controllers/AccessActionController.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';
import type { CreateAccessActionDTO, UpdateAccessActionDTO } from '../../application/dtos/access/AccessDTO.js';

const actionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    displayName: { type: 'string' },
    description: { type: ['string', 'null'] },
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

const createActionBodySchema = {
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
  },
};

const updateActionBodySchema = {
  type: 'object',
  properties: {
    displayName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
    description: { type: ['string', 'null'], maxLength: 500 },
    sortOrder: { type: 'number', minimum: 0 },
  },
};

export async function actionsRoutes(fastify: FastifyInstance) {
  // GET / - List all actions
  fastify.get(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Actions'],
        summary: 'Listar ações de acesso',
        description: 'Retorna uma lista de todas as ações de acesso do sistema',
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'array', items: actionResponseSchema },
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessActionController.list
  );

  // POST / - Create action
  fastify.post<{ Body: CreateAccessActionDTO }>(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Actions'],
        summary: 'Criar ação de acesso',
        description: 'Cria uma nova ação de acesso no sistema',
        security: [{ bearerAuth: [] }],
        body: createActionBodySchema,
        response: {
          201: actionResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessActionController.create
  );

  // PUT /:id - Update action
  fastify.put<{ Params: { id: string }; Body: UpdateAccessActionDTO }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Actions'],
        summary: 'Atualizar ação de acesso',
        description: 'Atualiza os dados de uma ação de acesso existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updateActionBodySchema,
        response: {
          200: actionResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessActionController.update
  );

  // DELETE /:id - Delete action
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Actions'],
        summary: 'Excluir ação de acesso',
        description: 'Remove uma ação de acesso do sistema (apenas ações não-sistema)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null', description: 'Ação excluída com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessActionController.delete
  );
}

export default actionsRoutes;
