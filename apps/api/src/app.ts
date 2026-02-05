import Fastify, { FastifyInstance } from 'fastify';
import cors from './plugins/cors.js';
import swagger from './plugins/swagger.js';
import supabase from './plugins/supabase.js';
import auth from './plugins/auth.js';
import healthRoutes from './routes/health.js';
import indexRoutes from './routes/index.js';
import clientRoutes from './routes/clients/index.js';
import authRoutes from './routes/auth/index.js';
import empresaRoutes from './routes/empresas/index.js';
import lojaRoutes from './routes/lojas/index.js';
import inventarioRoutes from './routes/inventarios/index.js';
import setorRoutes from './routes/setores/index.js';
import produtoRoutes from './routes/produtos/index.js';
import contagemRoutes from './routes/contagens/index.js';
import userRoutes from './routes/users/index.js';
import rolesRoutes from './routes/roles/index.js';

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
  await app.register(empresaRoutes, { prefix: '/api' });
  await app.register(lojaRoutes, { prefix: '/api' });
  await app.register(inventarioRoutes, { prefix: '/api' });
  await app.register(setorRoutes, { prefix: '/api' });
  await app.register(produtoRoutes, { prefix: '/api' });
  await app.register(contagemRoutes, { prefix: '/api' });
  await app.register(userRoutes, { prefix: '/api' });
  await app.register(rolesRoutes, { prefix: '/api/roles' });

  return app;
}
