import { FastifyInstance } from 'fastify';
import { AccessPolicyController } from '../../interface-adapters/controllers/AccessPolicyController.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';
import type { CreateAccessPolicyDTO, UpdateAccessPolicyDTO, SetPolicyPermissionsDTO } from '../../application/dtos/access/AccessDTO.js';

const permissionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    resource: { type: 'string' },
    action: { type: 'string' },
    description: { type: ['string', 'null'] },
  },
};

const policyResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    displayName: { type: 'string' },
    description: { type: ['string', 'null'] },
    icon: { type: ['string', 'null'] },
    isSystemPolicy: { type: 'boolean' },
    permissions: {
      type: 'array',
      items: permissionSchema,
    },
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

const createPolicyBodySchema = {
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

const updatePolicyBodySchema = {
  type: 'object',
  properties: {
    displayName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
    description: { type: ['string', 'null'], maxLength: 500 },
    icon: { type: ['string', 'null'], maxLength: 50 },
  },
};

const setPolicyPermissionsBodySchema = {
  type: 'object',
  required: ['permissionIds'],
  properties: {
    permissionIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
  },
};

export async function policiesRoutes(fastify: FastifyInstance) {
  // GET / - List all policies
  fastify.get(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Policies'],
        summary: 'Listar políticas de acesso',
        description: 'Retorna uma lista de todas as políticas de acesso com suas permissões',
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'array', items: policyResponseSchema },
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessPolicyController.list
  );

  // GET /:id - Get policy by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Policies'],
        summary: 'Buscar política por ID',
        description: 'Retorna os dados de uma política específica com suas permissões',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: policyResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessPolicyController.get
  );

  // POST / - Create policy
  fastify.post<{ Body: CreateAccessPolicyDTO }>(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Policies'],
        summary: 'Criar política de acesso',
        description: 'Cria uma nova política de acesso no sistema',
        security: [{ bearerAuth: [] }],
        body: createPolicyBodySchema,
        response: {
          201: policyResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessPolicyController.create
  );

  // PUT /:id - Update policy metadata
  fastify.put<{ Params: { id: string }; Body: UpdateAccessPolicyDTO }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Policies'],
        summary: 'Atualizar política de acesso',
        description: 'Atualiza os dados de uma política de acesso existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updatePolicyBodySchema,
        response: {
          200: policyResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessPolicyController.update
  );

  // DELETE /:id - Delete policy
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Policies'],
        summary: 'Excluir política de acesso',
        description: 'Remove uma política de acesso do sistema (apenas políticas não-sistema)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null', description: 'Política excluída com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessPolicyController.delete
  );

  // PUT /:id/permissions - Set policy permissions
  fastify.put<{ Params: { id: string }; Body: SetPolicyPermissionsDTO }>(
    '/:id/permissions',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Access Policies'],
        summary: 'Definir permissões da política',
        description: 'Substitui todas as permissões de uma política de acesso',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: setPolicyPermissionsBodySchema,
        response: {
          200: policyResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    AccessPolicyController.setPermissions
  );
}

export default policiesRoutes;
