import type { FastifyInstance } from 'fastify';

export default async function indexRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      description: 'Root endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            docs: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return {
      name: 'Estoque Brasil API',
      version: '1.0.0',
      docs: '/docs',
    };
  });
}
