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
  ListPermissionsUseCase,
} from '../../application/use-cases/roles/index.js';
import { CreateRoleDTO, UpdateRoleDTO } from '../../application/dtos/roles/RoleDTO.js';
import { toRoleResponse, toPermissionResponse } from '../../application/dtos/users/UserResponseDTO.js';
import { SetRolePoliciesUseCase } from '../../application/use-cases/access/index.js';
import { SupabaseAccessPolicyRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAccessPolicyRepository.js';
import { toAccessPolicyResponse } from '../../application/dtos/access/AccessResponseDTO.js';
import { RoleNotFoundError } from '../../domain/errors/UserErrors.js';

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

  // Set role policies
  static async setRolePolicies(
    request: FastifyRequest<{ Params: { id: string }; Body: { policyIds: string[] } }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);
    const useCase = new SetRolePoliciesUseCase(roleRepository);
    await useCase.execute(request.params.id, request.body);
    // Re-fetch role
    const getUseCase = new GetRoleUseCase(roleRepository);
    const role = await getUseCase.execute(request.params.id);
    return reply.send(toRoleResponse(role));
  }

  // Get role policies
  static async getRolePolicies(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const supabase = request.server.supabase as SupabaseClient;
    const roleRepository = new SupabaseRoleRepository(supabase);
    const role = await roleRepository.findById(request.params.id);
    if (!role) throw new RoleNotFoundError(request.params.id);
    // Get policy IDs and fetch policies
    const policyRepository = new SupabaseAccessPolicyRepository(supabase);
    const policyIds = await roleRepository.getRolePolicyIds(request.params.id);
    const policies = [];
    for (const pid of policyIds) {
      const p = await policyRepository.findById(pid);
      if (p) policies.push(toAccessPolicyResponse(p));
    }
    return reply.send(policies);
  }
}
