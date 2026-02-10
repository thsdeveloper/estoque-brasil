import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateUserUseCase } from '../../application/use-cases/users/CreateUserUseCase.js';
import { GetUserUseCase } from '../../application/use-cases/users/GetUserUseCase.js';
import { UpdateUserUseCase } from '../../application/use-cases/users/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../../application/use-cases/users/DeleteUserUseCase.js';
import { ListUsersUseCase } from '../../application/use-cases/users/ListUsersUseCase.js';
import { GetUserPermissionsUseCase } from '../../application/use-cases/users/GetUserPermissionsUseCase.js';
import { ListRolesUseCase } from '../../application/use-cases/users/ListRolesUseCase.js';
import { createUserSchema } from '../../application/dtos/users/CreateUserDTO.js';
import { updateUserSchema } from '../../application/dtos/users/UpdateUserDTO.js';
import { toRoleResponseDTO } from '../../application/dtos/users/UserResponseDTO.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { SupabaseAuthService } from '../../infrastructure/auth/SupabaseAuthService.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';

export class UserController {
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly getUserUseCase: GetUserUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;
  private readonly listUsersUseCase: ListUsersUseCase;
  private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase;
  private readonly listRolesUseCase: ListRolesUseCase;

  constructor(
    userRepository: IUserRepository,
    roleRepository: IRoleRepository
  ) {
    const authService = new SupabaseAuthService();

    this.createUserUseCase = new CreateUserUseCase(
      userRepository,
      roleRepository,
      authService
    );
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository, roleRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository, authService);
    this.listUsersUseCase = new ListUsersUseCase(userRepository);
    this.getUserPermissionsUseCase = new GetUserPermissionsUseCase(userRepository);
    this.listRolesUseCase = new ListRolesUseCase(roleRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createUserSchema.parse(request.body);
      const currentUserId = request.user?.sub;
      const user = await this.createUserUseCase.execute(validatedData, currentUserId);
      reply.status(201).send(user);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const user = await this.getUserUseCase.execute(id);
      reply.send(user);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const validatedData = updateUserSchema.parse(request.body);
      const currentUserId = request.user?.sub;
      const user = await this.updateUserUseCase.execute(id, validatedData, currentUserId);
      reply.send(user);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const currentUserId = request.user?.sub;
      await this.deleteUserUseCase.execute(id, currentUserId);
      reply.status(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async list(
    request: FastifyRequest<{
      Querystring: {
        page?: string;
        limit?: string;
        search?: string;
        isActive?: string;
        roleId?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : 1;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;
      const search = request.query.search || undefined;
      const isActive = request.query.isActive
        ? request.query.isActive === 'true'
        : undefined;
      const roleId = request.query.roleId || undefined;

      const result = await this.listUsersUseCase.execute({
        page,
        limit,
        search,
        isActive,
        roleId,
      });
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
        return;
      }

      const user = await this.getUserUseCase.execute(userId);
      reply.send(user);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getMyPermissions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
        return;
      }

      const permissions = await this.getUserPermissionsUseCase.execute(userId);
      reply.send(permissions);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async listRoles(
    request: FastifyRequest<{ Querystring: { includePermissions?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const roles = await this.listRolesUseCase.execute();
      reply.send(roles.map((role) => toRoleResponseDTO(role)));
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getMyEmpresas(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
        return;
      }

      const supabase = getSupabaseAdminClient();

      // Check if user is admin
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('user_id', userId);

      const isAdmin = userRoles?.some((ur: any) => (ur.roles as any)?.name === 'admin') ?? false;

      let empresas;
      if (isAdmin) {
        // Admin sees all active empresas
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('ativo', true)
          .order('nome_fantasia', { ascending: true });

        if (error) throw new Error(`Failed to fetch empresas: ${error.message}`);
        empresas = data;
      } else {
        // Non-admin: only empresas linked via empresas_usuarios
        const { data, error } = await supabase
          .from('empresas_usuarios')
          .select('empresas!inner(*)')
          .eq('user_id', userId);

        if (error) throw new Error(`Failed to fetch user empresas: ${error.message}`);
        empresas = data?.map((row: any) => row.empresas).filter((e: any) => e.ativo) ?? [];
      }

      // Map snake_case to camelCase
      const mapped = empresas.map((e: any) => ({
        id: e.id,
        descricao: e.descricao,
        cnpj: e.cnpj,
        razaoSocial: e.razao_social,
        nomeFantasia: e.nome_fantasia,
        cep: e.cep,
        endereco: e.endereco,
        numero: e.numero,
        bairro: e.bairro,
        codigoUf: e.codigo_uf,
        codigoMunicipio: e.codigo_municipio,
        ativo: e.ativo,
      }));

      reply.send(mapped);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getSelectedEmpresa(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
        return;
      }

      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('preferencias_usuarios')
        .select('id_empresa')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          reply.send(null);
          return;
        }
        throw new Error(`Failed to fetch selected empresa: ${error.message}`);
      }

      reply.send({ idEmpresa: data.id_empresa });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async setSelectedEmpresa(
    request: FastifyRequest<{ Body: { idEmpresa: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = request.user?.sub;
      if (!userId) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
        return;
      }

      const { idEmpresa } = request.body as { idEmpresa: number };

      const supabase = getSupabaseAdminClient();

      // Upsert preference
      const { error } = await supabase
        .from('preferencias_usuarios')
        .upsert(
          {
            user_id: userId,
            id_empresa: idEmpresa,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw new Error(`Failed to save selected empresa: ${error.message}`);
      }

      reply.send({ idEmpresa });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof ZodError) {
      reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    if (error instanceof DomainError) {
      reply.status(error.statusCode).send(error.toJSON());
      return;
    }

    if (error instanceof Error) {
      console.error('UserController error:', error);
      reply.status(500).send({
        code: 'INTERNAL_ERROR',
        message: error.message,
      });
      return;
    }

    reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    });
  }
}
