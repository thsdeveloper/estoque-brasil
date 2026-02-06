import { FastifyInstance } from 'fastify';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';

const errorResponseSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
  },
};

export default async function monitorRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/inventarios/:id/monitor-metrics',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Obter métricas do monitor de inventário',
        description: 'Retorna as 12 métricas calculadas no banco de dados para o monitor de inventário',
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
              estimativa: { type: 'number' },
              totalContado: { type: 'number' },
              diferenca: { type: 'number' },
              quantidadeSkus: { type: 'number' },
              skusPendentes: { type: 'number' },
              skusSemDivergencia: { type: 'number' },
              divergenciasAguardandoRecontagem: { type: 'number' },
              recontados: { type: 'number' },
              divergenciaConfirmada: { type: 'number' },
              rupturaCritica: { type: 'number' },
              entradaNaoPrevista: { type: 'number' },
              impactoCritico: { type: 'number' },
            },
          },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };

      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase.rpc('get_monitor_metrics', {
        p_id_inventario: id,
      });

      if (error) {
        request.log.error({ error }, 'Erro ao buscar métricas do monitor');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao calcular métricas do inventário',
        });
      }

      return reply.send(data);
    }
  );
}
