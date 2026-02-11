import { FastifyInstance } from 'fastify';
import { InventarioController } from '../../interface-adapters/controllers/InventarioController.js';
import { SupabaseInventarioRepository } from '../../infrastructure/database/supabase/repositories/SupabaseInventarioRepository.js';
import { SupabaseSetorRepository } from '../../infrastructure/database/supabase/repositories/SupabaseSetorRepository.js';
import { SupabaseAuditLogRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAuditLogRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission, restrictLiderColetaOnStartedInventario } from '../../plugins/authorization.js';

const inventarioResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idLoja: { type: 'integer' },
    idEmpresa: { type: 'integer' },
    minimoContagem: { type: 'integer' },
    dataInicio: { type: 'string', format: 'date-time' },
    dataTermino: { type: ['string', 'null'], format: 'date-time' },
    lote: { type: 'boolean' },
    validade: { type: 'boolean' },
    ativo: { type: 'boolean' },
    nomeLoja: { type: ['string', 'null'] },
    cnpjLoja: { type: ['string', 'null'] },
    nomeCliente: { type: ['string', 'null'] },
    lider: { type: ['string', 'null'] },
    fechadoEm: { type: ['string', 'null'], format: 'date-time' },
    fechadoPor: { type: ['string', 'null'] },
    justificativaFechamento: { type: ['string', 'null'] },
    liderNome: { type: ['string', 'null'] },
    temContagens: { type: 'boolean' },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: inventarioResponseSchema },
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

const createInventarioBodySchema = {
  type: 'object',
  required: ['idLoja', 'idEmpresa', 'dataInicio'],
  properties: {
    idLoja: { type: 'integer' },
    idEmpresa: { type: 'integer' },
    minimoContagem: { type: 'integer', minimum: 0, default: 0 },
    dataInicio: { type: 'string', format: 'date-time' },
    dataTermino: { type: ['string', 'null'], format: 'date-time' },
    lote: { type: 'boolean', default: false },
    validade: { type: 'boolean', default: false },
    ativo: { type: 'boolean', default: true },
    lider: { type: ['string', 'null'], format: 'uuid' },
  },
};

const updateInventarioBodySchema = {
  type: 'object',
  properties: {
    idLoja: { type: 'integer' },
    idEmpresa: { type: 'integer' },
    minimoContagem: { type: 'integer', minimum: 0 },
    dataInicio: { type: 'string', format: 'date-time' },
    dataTermino: { type: ['string', 'null'], format: 'date-time' },
    lote: { type: 'boolean' },
    validade: { type: 'boolean' },
    ativo: { type: 'boolean' },
    lider: { type: ['string', 'null'], format: 'uuid' },
  },
};

export default async function inventarioRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const inventarioRepository = new SupabaseInventarioRepository(supabase);
  const setorRepository = new SupabaseSetorRepository(supabase);
  const auditLogRepository = new SupabaseAuditLogRepository(supabase);
  const controller = new InventarioController(inventarioRepository, setorRepository, auditLogRepository, supabase);

  fastify.get(
    '/inventarios',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Listar inventários',
        description: 'Retorna uma lista paginada de inventários',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            idLoja: { type: 'integer', description: 'Filtrar por loja' },
            idEmpresa: { type: 'integer', description: 'Filtrar por empresa' },
            ativo: { type: 'boolean', description: 'Filtrar por status ativo' },
            search: { type: 'string', description: 'Buscar por nome do cliente' },
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
    '/inventarios/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Buscar inventário por ID',
        description: 'Retorna os dados de um inventário específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: inventarioResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/inventarios',
    {
      preHandler: [requireAuth, requirePermission('inventarios', 'create')],
      schema: {
        tags: ['Inventários'],
        summary: 'Criar novo inventário',
        description: 'Cria um novo inventário no sistema',
        security: [{ bearerAuth: [] }],
        body: createInventarioBodySchema,
        response: {
          201: inventarioResponseSchema,
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
    '/inventarios/:id',
    {
      preHandler: [requireAuth, requirePermission('inventarios', 'update'), restrictLiderColetaOnStartedInventario()],
      schema: {
        tags: ['Inventários'],
        summary: 'Atualizar inventário',
        description: 'Atualiza os dados de um inventário existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: updateInventarioBodySchema,
        response: {
          200: inventarioResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.update(request as any, reply)
  );

  fastify.delete(
    '/inventarios/:id',
    {
      preHandler: [requireAuth, requirePermission('inventarios', 'delete'), restrictLiderColetaOnStartedInventario()],
      schema: {
        tags: ['Inventários'],
        summary: 'Excluir inventário',
        description: 'Remove um inventário do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Inventário excluído com sucesso' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );

  fastify.post(
    '/inventarios/:id/finalizar',
    {
      preHandler: [requireAuth, requirePermission('inventarios', 'update')],
      schema: {
        tags: ['Inventários'],
        summary: 'Finalizar inventário',
        description: 'Finaliza um inventário ativo. Retorna 422 se houver setores não finalizados (a menos que forcado=true)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: {
          type: 'object',
          properties: {
            forcado: { type: 'boolean', description: 'Forçar finalização mesmo com setores não finalizados' },
          },
        },
        response: {
          200: inventarioResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              setoresPendentes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    descricao: { type: 'string' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.finalizar(request as any, reply)
  );

  fastify.get(
    '/inventarios/:id/divergencias',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Listar divergências do inventário',
        description: 'Retorna produtos com diferença entre saldo esperado e quantidade contada',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            idSetor: { type: 'integer', description: 'Filtrar por setor' },
            status: { type: 'string', enum: ['pendente', 'reconferido', 'todos'], default: 'todos' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    idProduto: { type: 'integer' },
                    codigoBarras: { type: ['string', 'null'] },
                    descricao: { type: 'string' },
                    idSetor: { type: 'integer' },
                    descricaoSetor: { type: ['string', 'null'] },
                    qtdEsperada: { type: 'number' },
                    qtdContada: { type: 'number' },
                    diferenca: { type: 'number' },
                    reconferido: { type: 'boolean' },
                  },
                },
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.listDivergencias(request as any, reply)
  );

  fastify.patch(
    '/inventarios/:id/fechar',
    {
      preHandler: [requireAuth, requirePermission('inventarios', 'update')],
      schema: {
        tags: ['Inventários'],
        summary: 'Fechar inventário definitivamente',
        description: 'Fecha um inventário com validação rigorosa de setores e divergências. Admins podem fazer bypass com justificativa obrigatória.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: {
          type: 'object',
          properties: {
            justificativa: { type: 'string', minLength: 10, description: 'Justificativa obrigatória para admin com bypass' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              status: { type: 'string' },
              fechadoEm: { type: 'string', format: 'date-time' },
              fechadoPor: { type: 'string' },
              justificativaFechamento: { type: ['string', 'null'] },
            },
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              detalhes: {
                type: 'object',
                properties: {
                  setoresNaoAbertos: { type: 'array', items: { type: 'string' } },
                  setoresNaoFechados: { type: 'array', items: { type: 'string' } },
                  divergenciasPendentes: { type: 'integer' },
                },
              },
            },
          },
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.fechar(request as any, reply)
  );

  fastify.get(
    '/inventarios/:id/status-fechamento',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Consultar status de fechamento do inventário',
        description: 'Retorna se o inventário pode ser fechado e quais são os bloqueios pendentes',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              podeFechar: { type: 'boolean' },
              bloqueios: {
                type: 'object',
                properties: {
                  setoresNaoAbertos: { type: 'array', items: { type: 'string' } },
                  setoresNaoFechados: { type: 'array', items: { type: 'string' } },
                  divergenciasPendentes: { type: 'integer' },
                },
              },
            },
          },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getStatusFechamento(request as any, reply)
  );

  fastify.post(
    '/inventarios/:id/reabrir',
    {
      preHandler: [requireAuth, requirePermission('inventarios', 'update')],
      schema: {
        tags: ['Inventários'],
        summary: 'Reabrir inventário finalizado',
        description: 'Reabre um inventário previamente finalizado',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: inventarioResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.reabrir(request as any, reply)
  );
}
