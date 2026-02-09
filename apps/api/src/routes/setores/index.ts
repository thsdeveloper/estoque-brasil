import { FastifyInstance } from 'fastify';
import { SetorController } from '../../interface-adapters/controllers/SetorController.js';
import { SupabaseSetorRepository } from '../../infrastructure/database/supabase/repositories/SupabaseSetorRepository.js';
import { SupabaseAuditLogRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAuditLogRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const setorResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idInventario: { type: 'integer' },
    prefixo: { type: ['string', 'null'] },
    inicio: { type: 'integer' },
    termino: { type: 'integer' },
    descricao: { type: ['string', 'null'] },
    abertoEm: { type: ['string', 'null'] },
    status: { type: 'string' },
    idUsuarioContagem: { type: ['string', 'null'] },
  },
};

const abrirSetorResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idInventario: { type: 'integer' },
    prefixo: { type: ['string', 'null'] },
    inicio: { type: 'integer' },
    termino: { type: 'integer' },
    descricao: { type: ['string', 'null'] },
    abertoEm: { type: ['string', 'null'] },
    status: { type: 'string' },
    idUsuarioContagem: { type: ['string', 'null'] },
    warning: {
      type: 'object',
      nullable: true,
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
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

const createSetorBodySchema = {
  type: 'object',
  required: ['idInventario', 'inicio', 'termino'],
  properties: {
    idInventario: { type: 'integer' },
    prefixo: { type: ['string', 'null'], maxLength: 10 },
    inicio: { type: 'integer', minimum: 0 },
    termino: { type: 'integer', minimum: 0 },
    descricao: { type: ['string', 'null'], maxLength: 255 },
  },
};

const updateSetorBodySchema = {
  type: 'object',
  properties: {
    idInventario: { type: 'integer' },
    prefixo: { type: ['string', 'null'], maxLength: 10 },
    inicio: { type: 'integer', minimum: 0 },
    termino: { type: 'integer', minimum: 0 },
    descricao: { type: ['string', 'null'], maxLength: 255 },
  },
};

export default async function setorRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const setorRepository = new SupabaseSetorRepository(supabase);
  const auditLogRepository = new SupabaseAuditLogRepository(supabase);
  const controller = new SetorController(setorRepository, supabase, auditLogRepository);

  fastify.get(
    '/inventarios/:idInventario/setores',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Setores'],
        summary: 'Listar setores de um inventário',
        description: 'Retorna a lista de setores de um inventário específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['idInventario'],
          properties: {
            idInventario: { type: 'integer' },
          },
        },
        response: {
          200: { type: 'array', items: setorResponseSchema },
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.listByInventario(request as any, reply)
  );

  fastify.get(
    '/setores/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Setores'],
        summary: 'Buscar setor por ID',
        description: 'Retorna os dados de um setor específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: setorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/setores',
    {
      preHandler: [requireAuth, requirePermission('setores', 'create')],
      schema: {
        tags: ['Setores'],
        summary: 'Criar novo setor',
        description: 'Cria um novo setor para um inventário',
        security: [{ bearerAuth: [] }],
        body: createSetorBodySchema,
        response: {
          201: setorResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );

  fastify.put(
    '/setores/:id',
    {
      preHandler: [requireAuth, requirePermission('setores', 'update')],
      schema: {
        tags: ['Setores'],
        summary: 'Atualizar setor',
        description: 'Atualiza os dados de um setor existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: updateSetorBodySchema,
        response: {
          200: setorResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.update(request as any, reply)
  );

  fastify.delete(
    '/setores/:id',
    {
      preHandler: [requireAuth, requirePermission('setores', 'delete')],
      schema: {
        tags: ['Setores'],
        summary: 'Excluir setor',
        description: 'Remove um setor do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Setor excluído com sucesso' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );

  fastify.patch(
    '/setores/:id/abrir',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Setores'],
        summary: 'Abrir setor para contagem',
        description: 'Abre o setor para contagem pelo usuário autenticado. Valida RN-03 (um setor por vez), RN-04 (setor em uso), RN-08 (setor finalizado), RN-11 (sequência)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: abrirSetorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.abrir(request as any, reply)
  );

  fastify.patch(
    '/setores/:id/finalizar',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Setores'],
        summary: 'Finalizar setor',
        description: 'Marca o setor como finalizado após a contagem',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: setorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.finalizarSetor(request as any, reply)
  );

  fastify.post(
    '/setores/:id/reabrir',
    {
      preHandler: [requireAuth, requirePermission('setores', 'update')],
      schema: {
        tags: ['Setores'],
        summary: 'Reabrir setor finalizado',
        description: 'Reabre um setor previamente finalizado (requer permissão setores:update)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: setorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.reabrirSetor(request as any, reply)
  );
}
