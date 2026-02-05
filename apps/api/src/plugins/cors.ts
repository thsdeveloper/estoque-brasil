import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

async function corsPlugin(fastify: FastifyInstance) {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  await fastify.register(fastifyCors, {
    origin: corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
}

export default fp(corsPlugin, {
  name: 'cors',
});
