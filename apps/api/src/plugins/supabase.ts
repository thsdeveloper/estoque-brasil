import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { getSupabaseAdminClient, SupabaseClient } from '../infrastructure/database/supabase/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
}

async function supabasePlugin(fastify: FastifyInstance) {
  // Use admin client (service role) to bypass RLS - authorization is handled at application layer
  const supabase = getSupabaseAdminClient();

  fastify.decorate('supabase', supabase);

  fastify.addHook('onClose', async () => {
    fastify.log.info('Supabase connection closed');
  });

  fastify.log.info('Supabase plugin registered');
}

export default fp(supabasePlugin, {
  name: 'supabase',
});
