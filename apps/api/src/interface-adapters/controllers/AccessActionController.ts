import { FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAccessActionRepository } from '../../infrastructure/database/supabase/repositories/SupabaseAccessActionRepository.js';
import {
  CreateAccessActionUseCase,
  UpdateAccessActionUseCase,
  DeleteAccessActionUseCase,
  ListAccessActionsUseCase,
} from '../../application/use-cases/access/index.js';
import type { CreateAccessActionDTO, UpdateAccessActionDTO } from '../../application/dtos/access/AccessDTO.js';
import { toAccessActionResponse } from '../../application/dtos/access/AccessResponseDTO.js';

export class AccessActionController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessActionRepository(supabase);
    const useCase = new ListAccessActionsUseCase(repository);
    const actions = await useCase.execute();
    return reply.send(actions.map(toAccessActionResponse));
  }

  static async create(request: FastifyRequest<{ Body: CreateAccessActionDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessActionRepository(supabase);
    const useCase = new CreateAccessActionUseCase(repository);
    const action = await useCase.execute(request.body);
    return reply.status(201).send(toAccessActionResponse(action));
  }

  static async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateAccessActionDTO }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessActionRepository(supabase);
    const useCase = new UpdateAccessActionUseCase(repository);
    const action = await useCase.execute(request.params.id, request.body);
    return reply.send(toAccessActionResponse(action));
  }

  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const supabase = request.server.supabase as SupabaseClient;
    const repository = new SupabaseAccessActionRepository(supabase);
    const useCase = new DeleteAccessActionUseCase(repository);
    await useCase.execute(request.params.id);
    return reply.status(204).send();
  }
}
