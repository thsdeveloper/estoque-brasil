import { FastifyInstance } from 'fastify';
import { ProdutoController } from '../../interface-adapters/controllers/ProdutoController.js';
import { SupabaseInventarioProdutoRepository } from '../../infrastructure/database/supabase/repositories/SupabaseInventarioProdutoRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import { requireAuth } from '../../plugins/auth.js';
import { ImportProdutosUseCase } from '../../application/use-cases/produto/ImportProdutosUseCase.js';

const produtoResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    idInventario: { type: 'integer' },
    codigoBarras: { type: ['string', 'null'] },
    codigoInterno: { type: ['string', 'null'] },
    descricao: { type: 'string' },
    lote: { type: ['string', 'null'] },
    validade: { type: ['string', 'null'], format: 'date' },
    saldo: { type: 'number' },
    custo: { type: 'number' },
    divergente: { type: 'boolean' },
  },
};

const paginatedResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: produtoResponseSchema },
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

const createProdutoBodySchema = {
  type: 'object',
  required: ['idInventario', 'descricao'],
  properties: {
    idInventario: { type: 'integer' },
    codigoBarras: { type: ['string', 'null'], maxLength: 50 },
    codigoInterno: { type: ['string', 'null'], maxLength: 50 },
    descricao: { type: 'string', minLength: 1, maxLength: 500 },
    lote: { type: ['string', 'null'], maxLength: 50 },
    validade: { type: ['string', 'null'], format: 'date' },
    saldo: { type: 'number', minimum: 0, default: 0 },
    custo: { type: 'number', minimum: 0, default: 0 },
    divergente: { type: 'boolean', default: false },
  },
};

const updateProdutoBodySchema = {
  type: 'object',
  properties: {
    codigoBarras: { type: ['string', 'null'], maxLength: 50 },
    codigoInterno: { type: ['string', 'null'], maxLength: 50 },
    descricao: { type: 'string', minLength: 1, maxLength: 500 },
    lote: { type: ['string', 'null'], maxLength: 50 },
    validade: { type: ['string', 'null'], format: 'date' },
    saldo: { type: 'number', minimum: 0 },
    custo: { type: 'number', minimum: 0 },
    divergente: { type: 'boolean' },
  },
};

export default async function produtoRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseAdminClient();
  const produtoRepository = new SupabaseInventarioProdutoRepository(supabase);
  const controller = new ProdutoController(produtoRepository);

  fastify.get(
    '/produtos',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Produtos'],
        summary: 'Listar produtos',
        description: 'Retorna uma lista paginada de produtos de um inventário',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['idInventario'],
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            idInventario: { type: 'integer', description: 'ID do inventário (obrigatório)' },
            search: { type: 'string', description: 'Busca por descrição' },
            divergente: { type: 'boolean', description: 'Filtrar por divergentes' },
            codigoBarras: { type: 'string', description: 'Filtrar por código de barras' },
            codigoInterno: { type: 'string', description: 'Filtrar por código interno' },
            codigo: { type: 'string', description: 'Busca por EAN ou código interno' },
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
    '/produtos/all',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Produtos'],
        summary: 'Buscar todos os produtos de um inventario',
        description: 'Retorna todos os produtos de um inventario sem paginacao (para cache mobile)',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['idInventario'],
          properties: {
            idInventario: { type: 'integer', description: 'ID do inventario (obrigatorio)' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: { type: 'array', items: produtoResponseSchema },
              total: { type: 'number' },
            },
          },
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { idInventario } = request.query as { idInventario: number };
        const produtos = await produtoRepository.findByInventario(idInventario);
        const data = produtos.map((p) => ({
          id: p.id,
          idInventario: p.idInventario,
          codigoBarras: p.codigoBarras,
          codigoInterno: p.codigoInterno,
          descricao: p.descricao,
          lote: p.lote,
          validade: p.validade,
          saldo: p.saldo,
          custo: p.custo,
          divergente: p.divergente,
        }));
        reply.send({ data, total: data.length });
      } catch (error) {
        if (error instanceof Error) {
          reply.status(500).send({ code: 'INTERNAL_ERROR', message: error.message });
          return;
        }
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });
      }
    }
  );

  fastify.get(
    '/produtos/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Produtos'],
        summary: 'Buscar produto por ID',
        description: 'Retorna os dados de um produto específico',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          200: produtoResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getById(request as any, reply)
  );

  fastify.post(
    '/produtos',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Produtos'],
        summary: 'Criar novo produto',
        description: 'Cria um novo produto para um inventário',
        security: [{ bearerAuth: [] }],
        body: createProdutoBodySchema,
        response: {
          201: produtoResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );

  fastify.put(
    '/produtos/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Produtos'],
        summary: 'Atualizar produto',
        description: 'Atualiza os dados de um produto existente',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: updateProdutoBodySchema,
        response: {
          200: produtoResponseSchema,
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
    '/produtos/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Produtos'],
        summary: 'Excluir produto',
        description: 'Remove um produto do sistema',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        response: {
          204: { type: 'null', description: 'Produto excluído com sucesso' },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => controller.delete(request as any, reply)
  );

  // ====== IMPORTAÇÃO EM MASSA ======
  const importUseCase = new ImportProdutosUseCase(produtoRepository);

  fastify.post(
    '/produtos/import',
    {
      preHandler: [requireAuth],
      bodyLimit: 5 * 1024 * 1024, // 5MB - sufficient for ~1000 products per chunk
      schema: {
        tags: ['Produtos'],
        summary: 'Importar produtos em massa',
        description: 'Importa uma lista de produtos para um inventário (enviar em chunks de ~1000)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['idInventario', 'produtos'],
          properties: {
            idInventario: { type: 'integer' },
            produtos: {
              type: 'array',
              items: {
                type: 'object',
                required: ['descricao'],
                properties: {
                  codigoBarras: { type: ['string', 'null'], maxLength: 50 },
                  codigoInterno: { type: ['string', 'null'], maxLength: 50 },
                  descricao: { type: 'string', minLength: 1, maxLength: 500 },
                  lote: { type: ['string', 'null'], maxLength: 50 },
                  validade: { type: ['string', 'null'] },
                  saldo: { type: 'number', minimum: 0, default: 0 },
                  custo: { type: 'number', minimum: 0, default: 0 },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              importados: { type: 'number' },
              erros: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    linha: { type: 'number' },
                    erro: { type: 'string' },
                  },
                },
              },
            },
          },
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as { idInventario: number; produtos: any[] };
        const result = await importUseCase.execute(body);
        reply.send(result);
      } catch (error) {
        if (error instanceof Error) {
          reply.status(500).send({
            code: 'INTERNAL_ERROR',
            message: error.message,
          });
          return;
        }
        reply.status(500).send({
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        });
      }
    }
  );
}
