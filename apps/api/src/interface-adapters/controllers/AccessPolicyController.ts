import { FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAccessPolicyRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAccessPolicyRepository.js';
import {
  CreateAccessPolicyUseCase,
  UpdateAccessPolicyUseCase,
  DeleteAccessPolicyUseCase,
  ListAccessPoliciesUseCase,
  GetAccessPolicyUseCase,
  SetPolicyPermissionsUseCase,
} from '../../application/use-cases/access/index.js';
import type { CreateAccessPolicyDTO, UpdateAccessPolicyDTO, SetPolicyPermissionsDTO } from '../../application/dtos/access/AccessDTO.js';
import { toAccessPolicyResponse } from '../../application/dtos/access/AccessResponseDTO.js';

export class AccessPolicyController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessPolicyRepository(supabase);
    const useCase = new ListAccessPoliciesUseCase(repository);
    const policies = await useCase.execute();
    return reply.send(policies.map(toAccessPolicyResponse));
  }

  static async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessPolicyRepository(supabase);
    const useCase = new GetAccessPolicyUseCase(repository);
    const policy = await useCase.execute(request.params.id);
    return reply.send(toAccessPolicyResponse(policy));
  }

  static async create(request: FastifyRequest<{ Body: CreateAccessPolicyDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessPolicyRepository(supabase);
    const useCase = new CreateAccessPolicyUseCase(repository);
    const policy = await useCase.execute(request.body);
    return reply.status(201).send(toAccessPolicyResponse(policy));
  }

  static async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateAccessPolicyDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessPolicyRepository(supabase);
    const useCase = new UpdateAccessPolicyUseCase(repository);
    const policy = await useCase.execute(request.params.id, request.body);
    return reply.send(toAccessPolicyResponse(policy));
  }

  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessPolicyRepository(supabase);
    const useCase = new DeleteAccessPolicyUseCase(repository);
    await useCase.execute(request.params.id);
    return reply.status(204).send();
  }

  static async setPermissions(request: FastifyRequest<{ Params: { id: string }; Body: SetPolicyPermissionsDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessPolicyRepository(supabase);
    const useCase = new SetPolicyPermissionsUseCase(repository);
    await useCase.execute(request.params.id, request.body);
    // Re-fetch the policy to return updated permissions
    const getUseCase = new GetAccessPolicyUseCase(repository);
    const policy = await getUseCase.execute(request.params.id);
    return reply.send(toAccessPolicyResponse(policy));
  }
}
