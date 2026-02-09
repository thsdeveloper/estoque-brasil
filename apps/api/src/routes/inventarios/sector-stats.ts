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

export default async function sectorStatsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/inventarios/:id/sector-stats',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Obter estatísticas de contagem por setor',
        description: 'Retorna total de contagens, quantidade e última contagem por setor via RPC',
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
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                total_contagens: { type: 'integer' },
                total_quantidade: { type: 'number' },
                ultima_contagem: { type: 'string', nullable: true },
              },
            },
          },
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };

      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase.rpc('get_contagem_sector_stats', {
        p_id_inventario: id,
      });

      if (error) {
        request.log.error({ error }, 'Erro ao buscar stats de setores');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao calcular estatísticas dos setores',
        });
      }

      // Map to return only the stats fields
      const stats = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id,
        total_contagens: row.total_contagens,
        total_quantidade: row.total_quantidade,
        ultima_contagem: row.ultima_contagem,
      }));

      return reply.send(stats);
    }
  );
}
