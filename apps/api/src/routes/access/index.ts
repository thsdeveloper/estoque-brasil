import { FastifyInstance } from 'fastify';
import { resourcesRoutes } from './resources.js';
import { actionsRoutes } from './actions.js';
import { policiesRoutes } from './policies.js';

export async function accessRoutes(fastify: FastifyInstance) {
  await fastify.register(resourcesRoutes, { prefix: '/resources' });
  await fastify.register(actionsRoutes, { prefix: '/actions' });
  await fastify.register(policiesRoutes, { prefix: '/policies' });
}

export default accessRoutes;
