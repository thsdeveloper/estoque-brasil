import { FastifyInstance } from 'fastify';
import { AuditLogController } from '../../interface-adapters/controllers/AuditLogController.js';
import { SupabaseAuditLogRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAuditLogRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { requirePermission } from '../../plugins/authorization.js';

const errorResponseSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
  },
};

const auditLogResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    acao: { type: 'string' },
    descricao: { type: ['string', 'null'] },
    idUsuario: { type: 'string' },
    nomeUsuario: { type: ['string', 'null'] },
    idInventario: { type: ['integer', 'null'] },
    idSetor: { type: ['integer', 'null'] },
    metadata: { type: ['object', 'null'] },
    ipAddress: { type: ['string', 'null'] },
    createdAt: { type: 'string' },
  },
};

const paginatedAuditLogResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: auditLogResponseSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
};

export default async function auditLogRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const auditLogRepository = new SupabaseAuditLogRepository(supabase);
  const controller = new AuditLogController(auditLogRepository);

  fastify.get(
    '/audit-logs',
    {
      preHandler: [requireAuth, requirePermission('audit_logs', 'read')],
      schema: {
        tags: ['Audit Logs'],
        summary: 'Listar logs de auditoria',
        description: 'Retorna a lista paginada de logs de auditoria com filtros opcionais',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            idInventario: { type: 'integer' },
            idUsuario: { type: 'string', format: 'uuid' },
            acao: { type: 'string' },
            dataInicio: { type: 'string', format: 'date-time' },
            dataFim: { type: 'string', format: 'date-time' },
          },
        },
        response: {
          200: paginatedAuditLogResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.list(request, reply)
  );
}
