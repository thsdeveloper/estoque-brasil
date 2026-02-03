import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyJWT, extractBearerToken } from '../infrastructure/auth/jwt-verifier.js';
import { UnauthorizedError } from '../domain/errors/DomainError.js';
import { JWTClaims } from '@estoque-brasil/types';

declare module 'fastify' {
  interface FastifyRequest {
    user: JWTClaims | null;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('user', null);
  fastify.log.info('Auth plugin registered');
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    throw new UnauthorizedError('Token de autenticação não fornecido');
  }

  request.user = await verifyJWT(token);
}

export default fp(authPlugin, {
  name: 'auth',
});
