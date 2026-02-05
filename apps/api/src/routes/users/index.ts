import { FastifyInstance } from 'fastify';
import { UserController } from '../../interface-adapters/controllers/UserController.js';
import { SupabaseUserRepository } from '../../infrastructure/database/supabase/repositories/SupabaseUserRepository.js';
import { SupabaseRoleRepository } from '../../infrastructure/database/supabase/repositories/SupabaseRoleRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

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
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          resource: { type: 'string' },
          action: { type: 'string' },
          description: { type: ['string', 'null'] },
        },
      },
    },
  },
};

const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    fullName: { type: 'string' },
    phone: { type: ['string', 'null'] },
    avatarUrl: { type: ['string', 'null'] },
    isActive: { type: 'boolean' },
    lastLoginAt: { type: ['string', 'null'], format: 'date-time' },
    roles: { type: 'array', items: roleResponseSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const paginatedUserResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: userResponseSchema },
    total: { type: 'number' },
    page: { type: 'number' },
    limit: { type: 'number' },
    totalPages: { type: 'number' },
  },
};

const permissionsResponseSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string', format: 'uuid' },
    permissions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          resource: { type: 'string' },
          action: { type: 'string' },
        },
      },
    },
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

const createUserBodySchema = {
  type: 'object',
  required: ['email', 'password', 'fullName', 'roleIds'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 6, maxLength: 72 },
    fullName: { type: 'string', minLength: 1, maxLength: 255 },
    phone: { type: ['string', 'null'], maxLength: 20 },
    avatarUrl: { type: ['string', 'null'], format: 'uri' },
    isActive: { type: 'boolean', default: true },
    roleIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      minItems: 1,
    },
  },
};

const updateUserBodySchema = {
  type: 'object',
  properties: {
    fullName: { type: 'string', minLength: 1, maxLength: 255 },
    phone: { type: ['string', 'null'], maxLength: 20 },
    avatarUrl: { type: ['string', 'null'], format: 'uri' },
    isActive: { type: 'boolean' },
    roleIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      minItems: 1,
    },
  },
};

export default async function userRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const userRepository = new SupabaseUserRepository(supabase);
  const roleRepository = new SupabaseRoleRepository(supabase);
  const controller = new UserController(userRepository, roleRepository);

  // Get current user's permissions (any authenticated user)
  fastify.get(
    '/users/me/permissions',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Users'],
        summary: 'Obter permissões do usuário atual',
        description: 'Retorna as permissões do usuário autenticado',
        security: [{ bearerAuth: [] }],
        response: {
          200: permissionsResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getMyPermissions(request, reply)
  );

  // List users (requires usuarios:read permission)
  fastify.get(
    '/users',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'read')],
      schema: {
        tags: ['Users'],
        summary: 'Listar usuários',
        description: 'Retorna uma lista paginada de usuários com opções de busca e filtro',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Busca por nome ou email' },
            isActive: {
              type: 'string',
              enum: ['true', 'false'],
              description: 'Filtro por status ativo/inativo',
            },
            roleId: {
              type: 'string',
              format: 'uuid',
              description: 'Filtro por role',
            },
          },
        },
        response: {
          200: paginatedUserResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.list(request as any, reply)
  );

  // Get user by ID (requires usuarios:read permission)
  fastify.get(
    '/users/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'read')],
      schema: {
        tags: ['Users'],
        summary: 'Buscar usuário por ID',
        description: 'Retorna os dados de um usuário específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: userResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  // Create user (requires usuarios:create permission)
  fastify.post(
    '/users',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'create')],
      schema: {
        tags: ['Users'],
        summary: 'Criar novo usuário',
        description: 'Cria um novo usuário no sistema',
        security: [{ bearerAuth: [] }],
        body: createUserBodySchema,
        response: {
          201: userResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );

  // Update user (requires usuarios:update permission)
  fastify.put(
    '/users/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'update')],
      schema: {
        tags: ['Users'],
        summary: 'Atualizar usuário',
        description: 'Atualiza os dados de um usuário existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: updateUserBodySchema,
        response: {
          200: userResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.update(request as any, reply)
  );

  // Delete user (requires usuarios:delete permission)
  fastify.delete(
    '/users/:id',
    {
      preHandler: [requireAuth, requirePermission('usuarios', 'delete')],
      schema: {
        tags: ['Users'],
        summary: 'Excluir usuário',
        description: 'Remove um usuário do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null', description: 'Usuário excluído com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );
}
