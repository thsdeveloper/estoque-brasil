import Fastify, { FastifyInstance } from 'fastify';
import cors from './plugins/cors.js';
import swagger from './plugins/swagger.js';
import supabase from './plugins/supabase.js';
import auth from './plugins/auth.js';
import healthRoutes from './routes/health.js';
import indexRoutes from './routes/index.js';
import clientRoutes from './routes/clients/index.js';
import authRoutes from './routes/auth/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  });

  // Register plugins
  await app.register(cors);
  await app.register(swagger);
  await app.register(supabase);
  await app.register(auth);

  // Register routes
  await app.register(indexRoutes);
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(clientRoutes, { prefix: '/api' });

  return app;
}
