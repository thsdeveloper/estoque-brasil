import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { SupabaseAuthService } from '../../infrastructure/auth/SupabaseAuthService.js';
import { SupabaseUserRepository } from '../../infrastructure/database/supabase/repositories/SupabaseUserRepository.js';
import { getSupabaseAdminClient } from '../../infrastructure/database/supabase/client.js';
import {
  RegisterUseCase,
  LoginUseCase,
  LogoutUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  UpdatePasswordUseCase,
  GetCurrentUserUseCase,
  RefreshTokenUseCase,
} from '../../application/use-cases/auth/index.js';
import { registerSchema } from '../../application/dtos/auth/RegisterDTO.js';
import { loginSchema } from '../../application/dtos/auth/LoginDTO.js';
import { forgotPasswordSchema } from '../../application/dtos/auth/ForgotPasswordDTO.js';
import { resetPasswordSchema } from '../../application/dtos/auth/ResetPasswordDTO.js';
import { updatePasswordSchema } from '../../application/dtos/auth/UpdatePasswordDTO.js';
import { DomainError } from '../../domain/errors/DomainError.js';

export class AuthController {
  private readonly registerUseCase: RegisterUseCase;
  private readonly loginUseCase: LoginUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly forgotPasswordUseCase: ForgotPasswordUseCase;
  private readonly resetPasswordUseCase: ResetPasswordUseCase;
  private readonly updatePasswordUseCase: UpdatePasswordUseCase;
  private readonly getCurrentUserUseCase: GetCurrentUserUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;

  constructor() {
    const authService = new SupabaseAuthService();
    const userRepository = new SupabaseUserRepository(getSupabaseAdminClient());
    this.registerUseCase = new RegisterUseCase(authService, userRepository);
    this.loginUseCase = new LoginUseCase(authService);
    this.logoutUseCase = new LogoutUseCase(authService);
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(authService);
    this.resetPasswordUseCase = new ResetPasswordUseCase(authService);
    this.updatePasswordUseCase = new UpdatePasswordUseCase(authService);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(authService);
    this.refreshTokenUseCase = new RefreshTokenUseCase(authService);
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = registerSchema.parse(request.body);
      const result = await this.registerUseCase.execute(validatedData);
      reply.status(201).send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = loginSchema.parse(request.body);
      const result = await this.loginUseCase.execute(validatedData);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const accessToken = this.extractToken(request);
      if (accessToken) {
        await this.logoutUseCase.execute(accessToken);
      }
      reply.status(204).send();
    } catch (error) {
      // Always return 204 for logout, even on error
      reply.status(204).send();
    }
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = forgotPasswordSchema.parse(request.body);
      const result = await this.forgotPasswordUseCase.execute(validatedData);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = resetPasswordSchema.parse(request.body);
      const result = await this.resetPasswordUseCase.execute(validatedData);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async updatePassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const accessToken = this.extractToken(request);
      if (!accessToken) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Token não fornecido' });
        return;
      }

      const validatedData = updatePasswordSchema.parse(request.body);
      const result = await this.updatePasswordUseCase.execute(accessToken, validatedData);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const accessToken = this.extractToken(request);
      if (!accessToken) {
        reply.status(401).send({ code: 'UNAUTHORIZED', message: 'Token não fornecido' });
        return;
      }

      const result = await this.getCurrentUserUseCase.execute(accessToken);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async refresh(
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { refreshToken } = request.body;
      if (!refreshToken) {
        reply.status(400).send({ code: 'VALIDATION_ERROR', message: 'Refresh token obrigatório' });
        return;
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);
      reply.send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private extractToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
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
