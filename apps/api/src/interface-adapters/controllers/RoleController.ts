import { FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseRoleRepository,
  SupabasePermissionRepository,
} from '../../infrastructure/database/supabase/repositories/SupabaseRoleRepository.js';
import { ListRolesUseCase } from '../../application/use-cases/users/ListRolesUseCase.js';
import {
  GetRoleUseCase,
  CreateRoleUseCase,
  UpdateRoleUseCase,
  DeleteRoleUseCase,
  UpdateRolePermissionsUseCase,
  ListPermissionsUseCase,
} from '../../application/use-cases/roles/index.js';
import { CreateRoleDTO, UpdateRoleDTO, UpdateRolePermissionsDTO } from '../../application/dtos/roles/RoleDTO.js';
import { toRoleResponse, toPermissionResponse } from '../../application/dtos/users/UserResponseDTO.js';

export class RoleController {
  // List all roles
  static async listRoles(
    request: FastifyRequest<{
      Querystring: { includePermissions?: string };
    }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);

    const useCase = new ListRolesUseCase(roleRepository);
    const roles = await useCase.execute();

    return reply.send(roles.map(toRoleResponse));
  }

  // Get role by ID
  static async getRole(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);

    const useCase = new GetRoleUseCase(roleRepository);
    const role = await useCase.execute(request.params.id);

    return reply.send(toRoleResponse(role));
  }

  // Create role
  static async createRole(
    request: FastifyRequest<{ Body: CreateRoleDTO }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);

    const useCase = new CreateRoleUseCase(roleRepository);
    const role = await useCase.execute(request.body);

    return reply.status(201).send(toRoleResponse(role));
  }

  // Update role
  static async updateRole(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateRoleDTO;
    }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);

    const useCase = new UpdateRoleUseCase(roleRepository);
    const role = await useCase.execute(request.params.id, request.body);

    return reply.send(toRoleResponse(role));
  }

  // Delete role
  static async deleteRole(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);

    const useCase = new DeleteRoleUseCase(roleRepository);
    await useCase.execute(request.params.id);

    return reply.status(204).send();
  }

  // Update role permissions
  static async updateRolePermissions(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateRolePermissionsDTO;
    }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);
    const permissionRepository = new SupabasePermissionRepository(supabase);

    const useCase = new UpdateRolePermissionsUseCase(roleRepository, permissionRepository);
    const role = await useCase.execute(request.params.id, request.body);

    return reply.send(toRoleResponse(role));
  }

  // List all permissions
  static async listPermissions(request: FastifyRequest, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const permissionRepository = new SupabasePermissionRepository(supabase);

    const useCase = new ListPermissionsUseCase(permissionRepository);
    const permissions = await useCase.execute();

    return reply.send(permissions.map(toPermissionResponse));
  }

  // List permissions grouped by resource
  static async listPermissionsGrouped(request: FastifyRequest, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const permissionRepository = new SupabasePermissionRepository(supabase);

    const useCase = new ListPermissionsUseCase(permissionRepository);
    const grouped = await useCase.executeGroupedByResource();

    return reply.send(
      grouped.map((g) => ({
        resource: g.resource,
        resourceDisplayName: g.resourceDisplayName,
        permissions: g.permissions.map(toPermissionResponse),
      }))
    );
  }
}
