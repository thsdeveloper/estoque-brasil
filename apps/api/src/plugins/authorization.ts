import type { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError } from '../domain/errors/UserErrors.js';
import { UnauthorizedError } from '../domain/errors/DomainError.js';
import { getSupabaseAdminClient } from '../infrastructure/database/supabase/client.js';

/**
 * Check if user has a specific permission using the database function
 */
async function checkUserPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  // Use admin client to bypass RLS for permission checks
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.rpc('user_has_permission', {
    user_uuid: userId,
    resource_name: resource,
    action_name: action,
  });

  if (error) {
    console.error('Permission check error:', error);
    return false;
  }

  return data === true;
}

/**
 * Middleware factory that creates a permission check middleware
 * Usage: fastify.get('/users', { preHandler: [requireAuth, requirePermission('usuarios', 'read')] }, handler)
 */
export function requirePermission(resource: string, action: string) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    const hasPermission = await checkUserPermission(userId, resource, action);

    if (!hasPermission) {
      throw new ForbiddenError(
        `Sem permissão para ${action} em ${resource}`
      );
    }
  };
}

/**
 * Middleware factory that checks if user has any of the specified permissions
 * Usage: fastify.get('/resource', { preHandler: [requireAuth, requireAnyPermission([['usuarios', 'read'], ['usuarios', 'create']])] }, handler)
 */
export function requireAnyPermission(
  permissions: Array<[resource: string, action: string]>
) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    for (const [resource, action] of permissions) {
      const hasPermission = await checkUserPermission(userId, resource, action);
      if (hasPermission) {
        return; // User has at least one required permission
      }
    }

    throw new ForbiddenError('Sem permissão para acessar este recurso');
  };
}

/**
 * Middleware that prevents lider_coleta from editing/deleting inventários that already have contagens.
 * Usage: fastify.put('/inventarios/:id', { preHandler: [requireAuth, restrictLiderColetaOnStartedInventario()] }, handler)
 */
export function restrictLiderColetaOnStartedInventario() {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    const supabase = getSupabaseAdminClient();

    // Check if user has lider_coleta role
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error checking user roles:', rolesError);
      return;
    }

    const isLiderColeta = (userRoles ?? []).some(
      (ur: any) => ur.roles?.name === 'lider_coleta'
    );

    if (!isLiderColeta) {
      return; // Not a lider_coleta, allow
    }

    // Check if inventário has contagens
    const inventarioId = Number((request.params as { id: number }).id);

    const { data: setores } = await supabase
      .from('setores')
      .select('id')
      .eq('id_inventario', inventarioId);

    if (!setores || setores.length === 0) {
      return; // No setores, no contagens
    }

    const setorIds = setores.map((s: { id: number }) => s.id);

    const { count } = await supabase
      .from('inventarios_contagens')
      .select('id', { count: 'exact', head: true })
      .in('id_inventario_setor', setorIds)
      .limit(1);

    if ((count ?? 0) > 0) {
      throw new ForbiddenError(
        'Líder de coleta não pode alterar inventários que já possuem contagens.'
      );
    }
  };
}

/**
 * Middleware factory that checks if user has all specified permissions
 * Usage: fastify.post('/admin', { preHandler: [requireAuth, requireAllPermissions([['usuarios', 'create'], ['usuarios', 'update']])] }, handler)
 */
export function requireAllPermissions(
  permissions: Array<[resource: string, action: string]>
) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    for (const [resource, action] of permissions) {
      const hasPermission = await checkUserPermission(userId, resource, action);
      if (!hasPermission) {
        throw new ForbiddenError(
          `Sem permissão para ${action} em ${resource}`
        );
      }
    }
  };
}
