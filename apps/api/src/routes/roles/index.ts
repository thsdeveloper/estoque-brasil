import { FastifyInstance } from 'fastify';
import { RoleController } from '../../interface-adapters/controllers/RoleController.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const permissionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    resource: { type: 'string' },
    action: { type: 'string' },
    description: { type: ['string', 'null'] },
  },
};

const roleResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    displayName: { type: 'string' },
    description: { type: ['string', 'null'] },
    isSystemRole: { type: 'boolean' },
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

const createRoleBodySchema = {
  type: 'object',
  required: ['name', 'displayName'],
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-z0-9_]+$',
      description: 'Identificador único (apenas letras minúsculas, números e underscore)',
    },
    displayName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      description: 'Nome de exibição',
    },
    description: { type: ['string', 'null'], maxLength: 500 },
    permissionIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      description: 'IDs das permissões a atribuir',
    },
  },
};

const updateRoleBodySchema = {
  type: 'object',
  properties: {
    displayName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
    description: { type: ['string', 'null'], maxLength: 500 },
  },
};

const updateRolePermissionsBodySchema = {
  type: 'object',
  required: ['permissionIds'],
  properties: {
    permissionIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
  },
};

const permissionsGroupedSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      resource: { type: 'string' },
      resourceDisplayName: { type: 'string' },
      permissions: {
        type: 'array',
        items: permissionSchema,
      },
    },
  },
};

export async function rolesRoutes(fastify: FastifyInstance) {
  // GET /roles - List all roles
  fastify.get(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'read')],
      schema: {
        tags: ['Roles'],
        summary: 'Listar roles',
        description: 'Retorna uma lista de todas as roles do sistema',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            includePermissions: {
              type: 'string',
              enum: ['true', 'false'],
              description: 'Incluir permissões de cada role',
            },
          },
        },
        response: {
          200: { type: 'array', items: roleResponseSchema },
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.listRoles
  );

  // GET /roles/:id - Get role by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'read')],
      schema: {
        tags: ['Roles'],
        summary: 'Buscar role por ID',
        description: 'Retorna os dados de uma role específica com suas permissões',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: roleResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.getRole
  );

  // POST /roles - Create new role
  fastify.post(
    '/',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Roles'],
        summary: 'Criar nova role',
        description: 'Cria uma nova role no sistema',
        security: [{ bearerAuth: [] }],
        body: createRoleBodySchema,
        response: {
          201: roleResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.createRole
  );

  // PUT /roles/:id - Update role
  fastify.put<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'update')],
      schema: {
        tags: ['Roles'],
        summary: 'Atualizar role',
        description: 'Atualiza os dados de uma role existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updateRoleBodySchema,
        response: {
          200: roleResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.updateRole
  );

  // DELETE /roles/:id - Delete role
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'delete')],
      schema: {
        tags: ['Roles'],
        summary: 'Excluir role',
        description: 'Remove uma role do sistema (apenas roles não-sistema)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null', description: 'Role excluída com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.deleteRole
  );

  // PUT /roles/:id/permissions - Update role permissions
  fastify.put<{ Params: { id: string } }>(
    '/:id/permissions',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'update')],
      schema: {
        tags: ['Roles'],
        summary: 'Atualizar permissões da role',
        description: 'Substitui todas as permissões de uma role',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updateRolePermissionsBodySchema,
        response: {
          200: roleResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.updateRolePermissions
  );

  // GET /permissions/all - List all permissions
  fastify.get(
    '/permissions/all',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'read')],
      schema: {
        tags: ['Permissions'],
        summary: 'Listar todas as permissões',
        description: 'Retorna uma lista de todas as permissões disponíveis no sistema',
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'array', items: permissionSchema },
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.listPermissions
  );

  // GET /permissions/grouped - List permissions grouped by resource
  fastify.get(
    '/permissions/grouped',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'read')],
      schema: {
        tags: ['Permissions'],
        summary: 'Listar permissões agrupadas por recurso',
        description: 'Retorna as permissões organizadas por recurso para facilitar a visualização',
        security: [{ bearerAuth: [] }],
        response: {
          200: permissionsGroupedSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    RoleController.listPermissionsGrouped
  );
}

export default rolesRoutes;
