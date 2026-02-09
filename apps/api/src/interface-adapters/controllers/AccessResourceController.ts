import { FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAccessResourceRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAccessResourceRepository.js';
import {
  CreateAccessResourceUseCase,
  UpdateAccessResourceUseCase,
  DeleteAccessResourceUseCase,
  ListAccessResourcesUseCase,
} from '../../application/use-cases/access/index.js';
import type { CreateAccessResourceDTO, UpdateAccessResourceDTO } from '../../application/dtos/access/AccessDTO.js';
import { toAccessResourceResponse } from '../../application/dtos/access/AccessResponseDTO.js';

export class AccessResourceController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessResourceRepository(supabase);
    const useCase = new ListAccessResourcesUseCase(repository);
    const resources = await useCase.execute();
    return reply.send(resources.map(toAccessResourceResponse));
  }

  static async create(request: FastifyRequest<{ Body: CreateAccessResourceDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessResourceRepository(supabase);
    const useCase = new CreateAccessResourceUseCase(repository);
    const resource = await useCase.execute(request.body);
    return reply.status(201).send(toAccessResourceResponse(resource));
  }

  static async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateAccessResourceDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessResourceRepository(supabase);
    const useCase = new UpdateAccessResourceUseCase(repository);
    const resource = await useCase.execute(request.params.id, request.body);
    return reply.send(toAccessResourceResponse(resource));
  }

  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessResourceRepository(supabase);
    const useCase = new DeleteAccessResourceUseCase(repository);
    await useCase.execute(request.params.id);
    return reply.status(204).send();
  }
}
