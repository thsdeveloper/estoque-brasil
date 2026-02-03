import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { getSupabaseClient, SupabaseClient } from '../infrastructure/database/supabase/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
}

async function supabasePlugin(fastify: FastifyInstance) {
  const supabase = getSupabaseClient();

  fastify.decorate('supabase', supabase);

  fastify.addHook('onClose', async () => {
    fastify.log.info('Supabase connection closed');
  });

  fastify.log.info('Supabase plugin registered');
}

export default fp(supabasePlugin, {
  name: 'supabase',
});
