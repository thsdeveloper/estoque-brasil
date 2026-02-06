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

export default async function operadoresRoutes(fastify: FastifyInstance) {
  // GET /inventarios/:id/operadores - Lista operadores vinculados (paginado)
  fastify.get(
    '/inventarios/:id/operadores',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Listar operadores do inventário',
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
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            search: { type: 'string' },
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
                    idInventario: { type: 'integer' },
                    userId: { type: 'string' },
                    multiplo: { type: 'boolean' },
                    auditoria: { type: 'boolean' },
                    createdAt: { type: 'string' },
                    fullName: { type: 'string', nullable: true },
                    email: { type: 'string', nullable: true },
                  },
                },
              },
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const { page: rawPage, limit: rawLimit, search } = request.query as {
        page?: number;
        limit?: number;
        search?: string;
      };

      const page = rawPage && rawPage > 0 ? rawPage : 1;
      const limit = rawLimit && rawLimit > 0 && rawLimit <= 100 ? rawLimit : 10;
      const offset = (page - 1) * limit;

      const supabase = getSupabaseAdminClient();

      // Start count and data queries in parallel (async-parallel)
      let dataQuery = supabase
        .from('inventarios_operadores')
        .select('id_inventario, user_id, multiplo, auditoria, created_at')
        .eq('id_inventario', id)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      let countQuery = supabase
        .from('inventarios_operadores')
        .select('*', { count: 'exact', head: true })
        .eq('id_inventario', id);

      // If search provided, we need to filter by profile — fetch all profiles first
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        const { data: matchingProfiles } = await supabase
          .from('user_profiles')
          .select('id')
          .or(`full_name.ilike.${term},email.ilike.${term}`);

        const matchingIds = (matchingProfiles || []).map((p: any) => p.id);

        if (matchingIds.length === 0) {
          return reply.send({ data: [], total: 0, page, limit, totalPages: 0 });
        }

        dataQuery = dataQuery.in('user_id', matchingIds);
        countQuery = countQuery.in('user_id', matchingIds);
      }

      const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);

      if (dataResult.error) {
        request.log.error({ error: dataResult.error }, 'Erro ao listar operadores do inventário');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao listar operadores do inventário',
        });
      }

      const total = countResult.count ?? 0;
      const data = dataResult.data || [];

      if (data.length === 0) {
        return reply.send({ data: [], total, page, limit, totalPages: Math.ceil(total / limit) });
      }

      // Fetch profiles for current page (js-index-maps: Map for O(1) lookups)
      const userIds = data.map((row) => row.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, p])
      );

      const operadores = data.map((row: any) => {
        const profile = profileMap.get(row.user_id);
        return {
          idInventario: row.id_inventario,
          userId: row.user_id,
          multiplo: row.multiplo ?? false,
          auditoria: row.auditoria ?? false,
          createdAt: row.created_at,
          fullName: profile?.full_name ?? null,
          email: profile?.email ?? null,
        };
      });

      return reply.send({
        data: operadores,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  );

  // POST /inventarios/:id/operadores - Vincula operador ao inventário
  fastify.post(
    '/inventarios/:id/operadores',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Vincular operador ao inventário',
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
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            multiplo: { type: 'boolean' },
            auditoria: { type: 'boolean' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              idInventario: { type: 'integer' },
              userId: { type: 'string' },
              multiplo: { type: 'boolean' },
              auditoria: { type: 'boolean' },
              createdAt: { type: 'string' },
            },
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const { userId, multiplo = false, auditoria = false } = request.body as {
        userId: string;
        multiplo?: boolean;
        auditoria?: boolean;
      };

      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('inventarios_operadores')
        .insert({
          id_inventario: id,
          user_id: userId,
          multiplo,
          auditoria,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return reply.status(409).send({
            code: 'CONFLICT',
            message: 'Operador já vinculado a este inventário',
          });
        }
        request.log.error({ error }, 'Erro ao vincular operador ao inventário');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao vincular operador ao inventário',
        });
      }

      return reply.status(201).send({
        idInventario: data.id_inventario,
        userId: data.user_id,
        multiplo: data.multiplo ?? false,
        auditoria: data.auditoria ?? false,
        createdAt: data.created_at,
      });
    }
  );

  // POST /inventarios/:id/operadores/batch - Vincula múltiplos operadores
  fastify.post(
    '/inventarios/:id/operadores/batch',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Vincular múltiplos operadores ao inventário',
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
          required: ['operadores'],
          properties: {
            operadores: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', format: 'uuid' },
                  multiplo: { type: 'boolean' },
                  auditoria: { type: 'boolean' },
                },
              },
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              added: { type: 'integer' },
            },
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const { operadores } = request.body as {
        operadores: { userId: string; multiplo?: boolean; auditoria?: boolean }[];
      };

      const supabase = getSupabaseAdminClient();

      const rows = operadores.map((op) => ({
        id_inventario: id,
        user_id: op.userId,
        multiplo: op.multiplo ?? false,
        auditoria: op.auditoria ?? false,
      }));

      const { data, error } = await supabase
        .from('inventarios_operadores')
        .upsert(rows, { onConflict: 'id_inventario,user_id', ignoreDuplicates: true })
        .select();

      if (error) {
        request.log.error({ error }, 'Erro ao vincular operadores em lote');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao vincular operadores em lote',
        });
      }

      return reply.status(201).send({ added: data?.length ?? 0 });
    }
  );

  // POST /inventarios/:id/operadores/batch-remove - Remove múltiplos operadores
  fastify.post(
    '/inventarios/:id/operadores/batch-remove',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Remover múltiplos operadores do inventário',
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
          required: ['userIds'],
          properties: {
            userIds: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', format: 'uuid' },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              removed: { type: 'integer' },
            },
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const { userIds } = request.body as { userIds: string[] };

      const supabase = getSupabaseAdminClient();

      const { error, count } = await supabase
        .from('inventarios_operadores')
        .delete({ count: 'exact' })
        .eq('id_inventario', id)
        .in('user_id', userIds);

      if (error) {
        request.log.error({ error }, 'Erro ao remover operadores em lote');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao remover operadores em lote',
        });
      }

      return reply.send({ removed: count ?? 0 });
    }
  );

  // DELETE /inventarios/:id/operadores/:userId - Remove vínculo
  fastify.delete(
    '/inventarios/:id/operadores/:userId',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Inventários'],
        summary: 'Remover operador do inventário',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id', 'userId'],
          properties: {
            id: { type: 'integer' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: { type: 'null' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id, userId } = request.params as { id: number; userId: string };
      const supabase = getSupabaseAdminClient();

      const { error, count } = await supabase
        .from('inventarios_operadores')
        .delete({ count: 'exact' })
        .eq('id_inventario', id)
        .eq('user_id', userId);

      if (error) {
        request.log.error({ error }, 'Erro ao remover operador do inventário');
        return reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro ao remover operador do inventário',
        });
      }

      if (count === 0) {
        return reply.status(404).send({
          code: 'NOT_FOUND',
          message: 'Operador não encontrado neste inventário',
        });
      }

      return reply.status(204).send();
    }
  );
}
