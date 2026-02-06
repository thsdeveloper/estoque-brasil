import { FastifyInstance } from 'fastify';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { verifyJWT } from '../../infrastructure/auth/jwt-verifier.js';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SectorStats {
  id: number;
  descricao: string | null;
  prefixo: string | null;
  inicio: number;
  termino: number;
  total_contagens: number;
  total_quantidade: number;
  ultima_contagem: string | null;
}

interface TimelinePoint {
  minuto: string;
  contagens_no_minuto: number;
  quantidade_no_minuto: number;
}

export default async function contagensStreamRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/inventarios/:id/contagens/stream',
    {
      schema: {
        tags: ['Inventários'],
        summary: 'Stream de contagens em tempo real (SSE)',
        description: 'Envia eventos SSE com contagens em tempo real para um inventário',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const { token } = request.query as { token: string };

      // Validate JWT from query param (EventSource doesn't support custom headers)
      try {
        await verifyJWT(token);
      } catch {
        return reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Token inválido' });
      }

      const supabase = getSupabaseAdminClient();

      // Load sector IDs for this inventory
      const { data: sectors, error: sectorsError } = await supabase
        .from('setores')
        .select('id')
        .eq('id_inventario', id);

      if (sectorsError) {
        request.log.error({ error: sectorsError }, 'Erro ao buscar setores');
        return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Erro ao buscar setores' });
      }

      if (!sectors || sectors.length === 0) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: 'Nenhum setor encontrado' });
      }

      const sectorIds = new Set(sectors.map((s: { id: number }) => s.id));

      // Hijack before writing to raw socket (bypasses Fastify pipeline)
      reply.hijack();

      // Determine CORS origin
      const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const requestOrigin = request.headers.origin;
      const allowedOrigins = corsOrigin.split(',');
      const origin = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

      // Set SSE headers (including CORS since hijack bypasses the plugin)
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
      });

      const send = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      // Send initial snapshot
      try {
        const [statsResult, timelineResult] = await Promise.all([
          supabase.rpc('get_contagem_sector_stats', { p_id_inventario: id }),
          supabase.rpc('get_contagem_timeline', { p_id_inventario: id, p_minutes: 30 }),
        ]);

        send('snapshot', {
          sectors: (statsResult.data || []) as SectorStats[],
          timeline: (timelineResult.data || []) as TimelinePoint[],
        });
      } catch (err) {
        request.log.error({ error: err }, 'Erro ao buscar snapshot inicial');
        send('error', { message: 'Erro ao carregar dados iniciais' });
      }

      // Subscribe to Supabase Realtime
      let channel: RealtimeChannel | null = null;

      try {
        channel = supabase
          .channel(`contagens-inv-${id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'inventarios_contagens',
            },
            (payload) => {
              const newRecord = payload.new as {
                id: number;
                id_inventario_setor: number;
                id_produto: number;
                quantidade: number;
                data: string;
                lote: string | null;
                validade: string | null;
                divergente: boolean;
              };

              // Filter: only send if sector belongs to this inventory
              if (sectorIds.has(newRecord.id_inventario_setor)) {
                send('contagem', {
                  id: newRecord.id,
                  idInventarioSetor: newRecord.id_inventario_setor,
                  idProduto: newRecord.id_produto,
                  quantidade: newRecord.quantidade,
                  data: newRecord.data,
                  lote: newRecord.lote,
                  validade: newRecord.validade,
                  divergente: newRecord.divergente,
                });
              }
            }
          )
          .subscribe((status) => {
            request.log.info({ status, inventarioId: id }, 'Realtime subscription status');
          });
      } catch (err) {
        request.log.error({ error: err }, 'Erro ao subscribir no Realtime');
      }

      // Heartbeat every 30s
      const heartbeatInterval = setInterval(() => {
        try {
          reply.raw.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
        } catch {
          // Connection likely closed
          cleanup();
        }
      }, 30_000);

      // Cleanup function
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
      };

      // Handle disconnect
      request.raw.on('close', () => {
        request.log.info({ inventarioId: id }, 'SSE connection closed');
        cleanup();
      });
    }
  );
}
