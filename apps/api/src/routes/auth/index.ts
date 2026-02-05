import { FastifyInstance } from 'fastify';
import { AuthController } from '../../interface-adapters/controllers/AuthController.js';
import { requireAuth } from '../../plugins/auth.js';

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

const registerBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
};

const registerResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    email: { type: 'string' },
  },
};

const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
  },
};

const loginResponseSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    expiresAt: { type: 'number' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
      },
    },
  },
};

const forgotPasswordBodySchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
  },
};

const messageResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};

const resetPasswordBodySchema = {
  type: 'object',
  required: ['accessToken', 'refreshToken', 'password'],
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    password: { type: 'string', minLength: 8 },
  },
};

const updatePasswordBodySchema = {
  type: 'object',
  required: ['newPassword'],
  properties: {
    newPassword: { type: 'string', minLength: 8 },
  },
};

const refreshBodySchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: { type: 'string' },
  },
};

const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    emailConfirmedAt: { type: ['string', 'null'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

export default async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();

  // POST /auth/register - Create new account
  fastify.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Criar nova conta',
        description: 'Registra um novo usuário no sistema. Um email de verificação será enviado.',
        body: registerBodySchema,
        response: {
          201: registerResponseSchema,
          400: validationErrorResponseSchema,
          409: errorResponseSchema,
          429: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.register(request, reply)
  );

  // POST /auth/login - Sign in
  fastify.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Fazer login',
        description: 'Autentica o usuário e retorna tokens de acesso.',
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          429: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.login(request, reply)
  );

  // POST /auth/logout - Sign out
  fastify.post(
    '/auth/logout',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: 'Fazer logout',
        description: 'Encerra a sessão do usuário.',
        security: [{ bearerAuth: [] }],
        response: {
          204: { type: 'null', description: 'Logout realizado com sucesso' },
        },
      },
    },
    (request, reply) => controller.logout(request, reply)
  );

  // POST /auth/forgot-password - Request password reset
  fastify.post(
    '/auth/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Solicitar recuperação de senha',
        description: 'Envia um email com link para redefinir a senha.',
        body: forgotPasswordBodySchema,
        response: {
          200: messageResponseSchema,
          400: validationErrorResponseSchema,
          429: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.forgotPassword(request, reply)
  );

  // POST /auth/reset-password - Reset password with token
  fastify.post(
    '/auth/reset-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Redefinir senha',
        description: 'Define uma nova senha usando os tokens de recuperação.',
        body: resetPasswordBodySchema,
        response: {
          200: messageResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.resetPassword(request, reply)
  );

  // PUT /auth/password - Update password (authenticated)
  fastify.put(
    '/auth/password',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: 'Alterar senha',
        description: 'Altera a senha do usuário logado.',
        security: [{ bearerAuth: [] }],
        body: updatePasswordBodySchema,
        response: {
          200: messageResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.updatePassword(request, reply)
  );

  // GET /auth/me - Get current user
  fastify.get(
    '/auth/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: 'Obter usuário atual',
        description: 'Retorna os dados do usuário autenticado.',
        security: [{ bearerAuth: [] }],
        response: {
          200: userResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.me(request, reply)
  );

  // POST /auth/refresh - Refresh tokens
  fastify.post(
    '/auth/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Renovar tokens',
        description: 'Gera novos tokens de acesso usando o refresh token.',
        body: refreshBodySchema,
        response: {
          200: loginResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.refresh(request as any, reply)
  );
}
